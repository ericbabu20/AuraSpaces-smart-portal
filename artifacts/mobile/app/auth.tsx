import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type Mode = "signin" | "signup";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    signIn,
    signUp,
    sendPasswordReset,
    updatePassword,
    passwordRecovery,
  } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (passwordRecovery) {
      if (password.length < 8) {
        setError("Use a password with at least 8 characters.");
        return;
      }
      setBusy(true);
      const message = await updatePassword(password);
      setBusy(false);
      if (message) setError(message);
      return;
    }
    if (!email.trim() || password.length < 8 || (mode === "signup" && !name.trim())) {
      setError("Enter your details and use a password with at least 8 characters.");
      return;
    }
    setBusy(true);
    const message =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp({ email, password, name });
    setBusy(false);
    if (message) setError(message);
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setBusy(true);
    const message = await sendPasswordReset(email);
    setBusy(false);
    if (message) setError(message);
    else Alert.alert("Email sent", "Use the link in your email to reset your password.");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.mark, { backgroundColor: colors.primary }]}>
          <Ionicons name="flash" size={26} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Aura Spaces</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {passwordRecovery
            ? "Choose a new password"
            : mode === "signin"
            ? "Sign in to your energy assistant"
            : "Create your secure Aura account"}
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {mode === "signup" && !passwordRecovery ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              autoComplete="name"
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                },
              ]}
            />
          ) : null}
          {!passwordRecovery ? <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            style={[
              styles.input,
              {
                color: colors.foreground,
                backgroundColor: colors.input,
                borderColor: colors.border,
              },
            ]}
          /> : null}
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password (8+ characters)"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            style={[
              styles.input,
              {
                color: colors.foreground,
                backgroundColor: colors.input,
                borderColor: colors.border,
              },
            ]}
          />

          {error ? (
            <Text
              accessibilityRole="alert"
              style={[styles.error, { color: colors.destructive }]}
            >
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={busy}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>
              {passwordRecovery
                ? "Save new password"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
              </Text>
            )}
          </Pressable>

          {mode === "signin" && !passwordRecovery ? (
            <Pressable onPress={resetPassword} disabled={busy}>
              <Text style={[styles.link, { color: colors.primary }]}>
                Forgot password?
              </Text>
            </Pressable>
          ) : null}
        </View>

        {!passwordRecovery ? <Pressable
          onPress={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
        >
          <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
            {mode === "signin" ? "New to Aura? " : "Already have an account? "}
            <Text style={{ color: colors.primary }}>
              {mode === "signin" ? "Create account" : "Sign in"}
            </Text>
          </Text>
        </Pressable> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  mark: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 32, letterSpacing: -0.8 },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 28,
  },
  card: { borderWidth: 1, borderRadius: 14, padding: 20, gap: 12 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  error: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  primary: {
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  link: {
    textAlign: "center",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    paddingTop: 4,
  },
  switchText: {
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 20,
  },
  pressed: { transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.65 },
});
