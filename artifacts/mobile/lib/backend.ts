import { supabase } from "@/lib/supabase";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type ChatResponse = {
  sessionId: string;
  message: ChatMessage;
};

const localApi = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

async function askLocalAura(message: string, sessionId?: string | null) {
  const response = await fetch(`${localApi}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId: sessionId ?? undefined }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? "Aura is unavailable.");
  }
  return body as ChatResponse;
}

export async function askAura(message: string, sessionId?: string | null) {
  if (localApi) return askLocalAura(message, sessionId);
  const { data, error } = await supabase.functions.invoke<ChatResponse>(
    "gemini-chat",
    { body: { message, sessionId: sessionId ?? undefined } },
  );
  if (error) throw new Error(await functionError(error, "Aura is unavailable."));
  if (!data?.message) throw new Error("Aura returned an empty response.");
  return data;
}

export async function loadChatSession(sessionId?: string | null) {
  if (localApi) {
    if (!sessionId) return { sessionId: null, messages: [] };
    const response = await fetch(`${localApi}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "history", sessionId }),
    });
    if (!response.ok) return { sessionId, messages: [] as ChatMessage[] };
    return response.json() as Promise<{
      sessionId: string | null;
      messages: ChatMessage[];
    }>;
  }
  const { data, error } = await supabase.functions.invoke<{
    sessionId: string | null;
    messages: ChatMessage[];
  }>("gemini-chat", {
    body: { action: "history", sessionId: sessionId ?? undefined },
  });
  if (error) throw new Error(await functionError(error, "Could not load chat."));
  return data ?? { sessionId: null, messages: [] };
}

export type OctopusConnectionInput = {
  apiKey: string;
  electricityMpan?: string;
  electricitySerial?: string;
  gasMprn?: string;
  gasSerial?: string;
};

export async function connectOctopus(input: OctopusConnectionInput) {
  const { data, error } = await supabase.functions.invoke<{
    connected: boolean;
    hasElectricity: boolean;
    hasGas: boolean;
  }>("octopus-connect", { body: input });
  if (error) throw new Error(await functionError(error, "Could not connect Octopus."));
  return data;
}

export type FuelBalance = { credit: number | null; debt: number | null };

export async function getPrepayBalances() {
  if (!localApi) return { electricity: null, gas: null };
  const response = await fetch(`${localApi}/api/prepay`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? "Balances are unavailable.");
  }
  return body as { electricity: FuelBalance | null; gas: FuelBalance | null };
}

export async function getConsumption(fuel: "electricity" | "gas", days = 7) {
  if (localApi) {
    const response = await fetch(
      `${localApi}/api/consumption/${fuel}?days=${days}`,
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.error ?? "Consumption unavailable.");
    }
    return body as { points: Array<{ date: string; consumption: number }> };
  }
  const { data, error } = await supabase.functions.invoke<{
    points: Array<{ date: string; consumption: number }>;
  }>("octopus-consumption", { body: { fuel, days } });
  if (error) throw new Error(await functionError(error, "Consumption unavailable."));
  return data ?? { points: [] };
}

async function functionError(error: unknown, fallback: string) {
  const context = (error as { context?: Response })?.context;
  if (context && typeof context.json === "function") {
    try {
      const body = await context.json();
      if (typeof body?.error === "string") return body.error;
    } catch {
      // Keep the safe fallback below.
    }
  }
  return fallback;
}
