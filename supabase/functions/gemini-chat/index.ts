import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

import { HttpError, json, parseJson, preflight, safeError } from "../_shared/http.ts";
import { fetchWithTimeout, requireUser } from "../_shared/supabase.ts";

type Input =
  | { action?: "message"; message: string; sessionId?: string }
  | { action: "history"; sessionId?: string };

type StoredMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | null;
  created_at: string;
};

const MAX_MESSAGE_LENGTH = 2_000;
const MAX_REQUESTS_PER_MINUTE = 10;

Deno.serve(async (req) => {
  const options = preflight(req);
  if (options) return options;
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const { user, admin } = await requireUser(req);
    const input = await parseJson<Input>(req);

    if (input.action === "history") {
      let sessionId = input.sessionId;
      if (!sessionId) {
        const { data } = await admin
          .from("sessions")
          .select("id")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        sessionId = data?.id;
      }
      if (!sessionId) return json({ sessionId: null, messages: [] });
      await assertSessionOwner(admin, sessionId, user.id);
      const { data, error } = await admin
        .from("messages")
        .select("id, role, content, created_at")
        .eq("session_id", sessionId)
        .in("role", ["user", "assistant"])
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return json({ sessionId, messages: data ?? [] });
    }

    const message = input.message?.trim();
    if (!message) throw new HttpError(400, "Message is required.");
    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new HttpError(400, `Message must be under ${MAX_MESSAGE_LENGTH} characters.`);
    }

    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count } = await admin
      .from("messages")
      .select("id, sessions!inner(user_id)", { count: "exact", head: true })
      .eq("sessions.user_id", user.id)
      .eq("role", "user")
      .gte("created_at", oneMinuteAgo);
    if ((count ?? 0) >= MAX_REQUESTS_PER_MINUTE) {
      throw new HttpError(429, "Too many messages. Wait a minute and try again.");
    }

    let sessionId = input.sessionId;
    if (sessionId) {
      await assertSessionOwner(admin, sessionId, user.id);
    } else {
      const { data, error } = await admin
        .from("sessions")
        .insert({ user_id: user.id, channel: "aura" })
        .select("id")
        .single();
      if (error) throw error;
      sessionId = data.id;
    }

    const { error: userInsertError } = await admin.from("messages").insert({
      session_id: sessionId,
      role: "user",
      content: message,
    });
    if (userInsertError) throw userInsertError;

    const { data: history } = await admin
      .from("messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: false })
      .limit(12);

    const { data: energy } = await admin
      .from("energy_inputs")
      .select(
        "home_type, occupants, current_supplier, tariff_type, est_kwh, has_ev, has_smart_meter, has_solar, has_battery, has_gas",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const apiKey = await loadGeminiKey(admin);
    const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
    if (!apiKey) throw new HttpError(503, "Aura AI has not been configured yet.");

    const systemPrompt = [
      "You are Aura, a concise UK home-energy assistant.",
      "The customer is on prepayment. Do not give direct-debit-specific advice.",
      "Never claim to control a device; explain the steps unless a tool confirms an action.",
      "Never guarantee savings. Label estimates and ask for missing tariff details.",
      "Use GBP, kWh, and plain British English.",
      "This household has no solar unless the supplied profile explicitly says has_solar=true.",
      `Energy profile: ${JSON.stringify(energy ?? { has_solar: false })}`,
    ].join("\n");

    const contents = (history ?? [])
      .reverse()
      .filter((item) => item.content)
      .map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }],
      }));

    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 700,
          },
        }),
      },
      20_000,
    );
    if (!response.ok) {
      const detail = await response.text();
      console.error(`Gemini request failed (${response.status}): ${detail.slice(0, 200)}`);
      throw new HttpError(
        response.status === 429 ? 429 : 502,
        response.status === 429
          ? "Aura is busy. Please try again shortly."
          : "Aura could not generate a response.",
      );
    }

    const payload = await response.json();
    const reply = payload?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();
    if (!reply) throw new HttpError(502, "Aura returned an empty response.");

    const usage = payload?.usageMetadata;
    const { data: stored, error: assistantInsertError } = await admin
      .from("messages")
      .insert({
        session_id: sessionId,
        role: "assistant",
        content: reply,
        tokens: usage?.candidatesTokenCount ?? null,
      })
      .select("id, role, content, created_at")
      .single();
    if (assistantInsertError) throw assistantInsertError;

    return json({ sessionId, message: stored });
  } catch (error) {
    return safeError(error);
  }
});

async function loadGeminiKey(admin: SupabaseClient) {
  const fromEnv = Deno.env.get("GEMINI_API_KEY");
  if (fromEnv) return fromEnv;
  const { data, error } = await admin.rpc("get_gemini_api_key");
  if (error || typeof data !== "string" || !data) return null;
  return data;
}

async function assertSessionOwner(
  admin: SupabaseClient,
  sessionId: string,
  userId: string,
) {
  const { data } = await admin
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new HttpError(404, "Conversation not found.");
}
