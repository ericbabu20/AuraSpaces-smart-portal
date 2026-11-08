// Mobile (Expo / React Native) Supabase client.
//
// Uses the PUBLISHABLE key only (sb_publishable_...). This key is safe to ship
// in the app; all privileged access is brokered by the api-server using the
// secret key. NEVER import a secret key here.
//
// Env (loaded by Expo from .env, must be prefixed EXPO_PUBLIC_ to be exposed):
//   EXPO_PUBLIC_SUPABASE_URL
//   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import type { Database } from "./database.types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and " +
      "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in artifacts/mobile/.env " +
      "(see .env.example).",
  );
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      // Native apps don't receive the session in a URL fragment; the web build
      // also uses explicit sign-in flows, so this stays false everywhere.
      detectSessionInUrl: Platform.OS === "web",
    },
  },
);

// On native, tie Supabase's token auto-refresh to app foreground/background so
// it doesn't run (or stall) while backgrounded. (Web manages this itself.)
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
