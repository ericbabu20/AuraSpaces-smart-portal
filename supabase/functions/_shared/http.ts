export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function preflight(req: Request) {
  return req.method === "OPTIONS"
    ? new Response("ok", { headers: corsHeaders })
    : null;
}

export async function parseJson<T>(req: Request, maxBytes = 16_384): Promise<T> {
  const length = Number(req.headers.get("content-length") ?? "0");
  if (length > maxBytes) throw new HttpError(413, "Request is too large.");
  const raw = await req.text();
  if (raw.length > maxBytes) throw new HttpError(413, "Request is too large.");
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function safeError(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error(error instanceof Error ? error.message : "Unknown function error");
  return json({ error: "The service is temporarily unavailable." }, 500);
}
