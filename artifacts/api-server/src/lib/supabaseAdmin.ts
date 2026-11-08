// Server-side Supabase admin client.
//
// Uses the SECRET key (sb_secret_...), which bypasses Row Level Security. This
// module lives in the api-server package only and must NEVER be imported by the
// mobile app — the mobile app only ever holds the publishable key.
//
// Env (read from the server process environment, same pattern as octopus.ts):
//   SUPABASE_URL
//   SUPABASE_SECRET_KEY
//
// The client is created lazily so the server can still boot in environments
// where Supabase isn't configured yet (mirrors the lazy requireEnv pattern in
// lib/octopus.ts).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required configuration: ${name}`);
  }
  return value;
}

let client: SupabaseClient<Database> | null = null;

/**
 * Returns the shared, server-only Supabase admin client (secret key).
 * Created on first use and memoized thereafter.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (client) return client;

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const supabaseSecretKey = requireEnv("SUPABASE_SECRET_KEY");

  client = createClient<Database>(supabaseUrl, supabaseSecretKey, {
    auth: {
      // Server-side: no session persistence or token refresh needed.
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return client;
}
