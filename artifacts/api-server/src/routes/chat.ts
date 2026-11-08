import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { HouseholdContextError, loadHouseholdContext } from "../lib/householdContext";

const router: IRouter = Router();

type Turn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

const sessions = new Map<string, Turn[]>();

router.post("/chat", async (req, res): Promise<void> => {
  const action = req.body?.action;
  const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : undefined;

  if (action === "history") {
    res.json({
      sessionId: sessionId ?? null,
      messages: sessionId ? sessions.get(sessionId) ?? [] : [],
    });
    return;
  }

  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 2000) {
    res.status(400).json({ error: "Enter a message under 2,000 characters." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!apiKey) {
    res.status(503).json({ error: "The Gemini API key is missing from the server." });
    return;
  }

  const id = sessionId && sessions.has(sessionId) ? sessionId : randomUUID();
  const history = sessions.get(id) ?? [];
  const now = new Date().toISOString();
  history.push({
    id: randomUUID(),
    role: "user",
    content: message,
    created_at: now,
  });

  let household = "";
  try {
    household = await loadHouseholdContext(req.header("authorization"));
  } catch (caught) {
    history.pop();
    const messageText =
      caught instanceof HouseholdContextError
        ? caught.message
        : "Aura could not read your household data, so it did not reply.";
    res.status(503).json({ error: messageText });
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You are Aura, a concise UK home-energy assistant. Read the household record below before you write. Answer only from that record and general energy advice that does not invent this home's devices or numbers. Never guarantee savings. Use GBP and kWh.\n\n${household}`,
              },
            ],
          },
          contents: history.map((turn) => ({
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.content }],
          })),
          generationConfig: { temperature: 0.35, maxOutputTokens: 700 },
        }),
      },
    );

    if (!response.ok) {
      history.pop();
      const status = response.status === 429 ? 429 : 502;
      res.status(status).json({
        error:
          response.status === 400 || response.status === 401 || response.status === 403
            ? "Gemini rejected the API key. Create a new key and replace GEMINI_API_KEY."
            : "Aura could not generate a response.",
      });
      return;
    }

    const payload = await response.json();
    const reply = payload?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();
    if (!reply) {
      history.pop();
      res.status(502).json({ error: "Aura returned an empty response." });
      return;
    }

    const assistant: Turn = {
      id: randomUUID(),
      role: "assistant",
      content: reply,
      created_at: new Date().toISOString(),
    };
    history.push(assistant);
    sessions.set(id, history);
    res.json({ sessionId: id, message: assistant });
  } catch {
    history.pop();
    res.status(502).json({ error: "Aura could not reach Gemini." });
  }
});

export default router;
