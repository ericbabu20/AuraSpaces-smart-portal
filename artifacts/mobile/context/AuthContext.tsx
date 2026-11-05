import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

type SignUpInput = {
  email: string;
  password: string;
  name: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  passwordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signUp: (input: SignUpInput) => Promise<string | null>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      setLoading(false);
    });

    const applyRecoveryUrl = async (url: string) => {
      const fragment = url.split("#")[1];
      if (!fragment) return;
      const params = new URLSearchParams(fragment);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        setPasswordRecovery(true);
      }
    };
    const linkSubscription =
      Platform.OS === "web"
        ? null
        : Linking.addEventListener("url", ({ url }) => void applyRecoveryUrl(url));
    if (Platform.OS !== "web") {
      Linking.getInitialURL().then((url) => {
        if (url) void applyRecoveryUrl(url);
      });
    }

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
      linkSubscription?.remove();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo =
      Platform.OS === "web" && typeof window !== "undefined"
        ? `${window.location.origin}/auth`
        : Linking.createURL("auth");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) return friendlyAuthError(error.message);
    if (!data.url) return "Google sign-in did not start. Try again.";

    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        const probe = await fetch(data.url);
        if (!probe.ok) {
          const body = (await probe.json().catch(() => null)) as {
            msg?: string;
            message?: string;
          } | null;
          return friendlyAuthError(
            body?.msg || body?.message || "Google sign-in failed.",
          );
        }
      } catch {
        // Google's own page can block this check. The redirect below still works.
      }
      window.location.assign(data.url);
      return null;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") return null;

    const returned = new URL(result.url);
    const code = returned.searchParams.get("code");
    if (code) {
      const exchanged = await supabase.auth.exchangeCodeForSession(code);
      return exchanged.error ? friendlyAuthError(exchanged.error.message) : null;
    }
    const hash = new URLSearchParams(returned.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (accessToken && refreshToken) {
      const session = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      return session.error ? friendlyAuthError(session.error.message) : null;
    }
    return "Google did not return a sign-in. Try again.";
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async ({ email, password, name }: SignUpInput) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return error.message;
    if (!data.session) {
      return "Check your email to confirm your account, then sign in.";
    }
    return null;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo:
        Platform.OS === "web" && typeof window !== "undefined"
          ? `${window.location.origin}/auth`
          : "mobile://auth",
    });
    return error?.message ?? null;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) setPasswordRecovery(false);
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      passwordRecovery,
      signIn,
      signInWithGoogle,
      signUp,
      sendPasswordReset,
      updatePassword,
      signOut,
    }),
    [
      session,
      loading,
      passwordRecovery,
      signIn,
      signInWithGoogle,
      signUp,
      sendPasswordReset,
      updatePassword,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function friendlyAuthError(message: string): string {
  if (/provider is not enabled|unsupported provider/i.test(message)) {
    return "Google sign-in is not turned on in Supabase yet. In the Supabase dashboard open Authentication, then Providers, then Google, and paste your Google client ID and secret.";
  }
  return message;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
