import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";

import { HttpError } from "./http.ts";

export type FunctionContext = {
  user: User;
  admin: SupabaseClient;
};

export async function requireUser(req: Request): Promise<FunctionContext> {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = req.headers.get("Authorization");
  if (!url || !anonKey || !serviceKey) {
    throw new HttpError(500, "Supabase function environment is incomplete.");
  }
  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "Sign in is required.");
  }

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) throw new HttpError(401, "Your session has expired.");

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { user: data.user, admin };
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 15_000,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new HttpError(504, "The upstream service timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
