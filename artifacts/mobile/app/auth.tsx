import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { fonts, radius } from "@/theme/tokens";

type Mode = "signin" | "signup";

export default function AuthScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    signIn,
    signInWithGoogle,
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

  const continueWithGoogle = async () => {
    setError(null);
    setBusy(true);
    const message = await signInWithGoogle();
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
        <Image
          source={
            isDark
              ? require("../assets/images/logo-dark.png")
              : require("../assets/images/logo.png")
          }
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Aura Spaces"
        />
        <Text style={[styles.title, { color: colors.foreground }]}>
          {passwordRecovery
            ? "Reset password"
            : mode === "signin"
              ? "Welcome back"
              : "Create account"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {passwordRecovery
            ? "Choose a new password"
            : mode === "signin"
            ? "Sign in to your energy assistant"
            : "Create your secure Aura account"}
        </Text>

        {!passwordRecovery ? (
          <>
            <Pressable
              onPress={continueWithGoogle}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
              style={({ pressed }) => [
                styles.google,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              <Ionicons name="logo-google" size={18} color={colors.foreground} />
              <Text style={[styles.googleText, { color: colors.foreground }]}>
                Continue with Google
              </Text>
            </Pressable>
            <Text style={[styles.or, { color: colors.mutedForeground }]}>or</Text>
          </>
        ) : null}

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
            placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"}
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
  logo: {
    width: 150,
    height: 66,
    alignSelf: "center",
    marginBottom: 28,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 28,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: 20,
    gap: 12,
  },
  input: {
    minHeight: 50,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    fontFamily: fonts.body,
    fontSize: 17,
  },
  error: { fontFamily: fonts.body, fontSize: 15, lineHeight: 20 },
  primary: {
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  primaryText: { fontFamily: fonts.bodySemiBold, fontSize: 17 },
  google: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleText: { fontFamily: fonts.bodySemiBold, fontSize: 17 },
  or: {
    textAlign: "center",
    fontFamily: fonts.body,
    fontSize: 13,
    marginVertical: 4,
  },
  link: {
    textAlign: "center",
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    paddingVertical: 8,
  },
  switchText: {
    textAlign: "center",
    fontFamily: fonts.body,
    fontSize: 15,
    marginTop: 20,
    paddingVertical: 8,
  },
  pressed: { transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.65 },
});
