import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { connectOctopus } from "@/lib/backend";

const fields = [
  ["apiKey", "Octopus API key", true],
  ["electricityMpan", "Electricity MPAN", false],
  ["electricitySerial", "Electricity meter serial", false],
  ["gasMprn", "Gas MPRN (optional)", false],
  ["gasSerial", "Gas meter serial (optional)", false],
] as const;

export default function OctopusScreen() {
  const colors = useColors();
  const [form, setForm] = useState({
    apiKey: "",
    electricityMpan: "",
    electricitySerial: "",
    gasMprn: "",
    gasSerial: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!form.apiKey.trim()) {
      setError("Enter your Octopus API key.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await connectOctopus(form);
      setForm((prev) => ({ ...prev, apiKey: "" }));
      Alert.alert("Connected", "Your Octopus details were verified and stored securely.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not connect.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.foreground }]}>
        Connect Octopus Energy
      </Text>
      <Text style={[styles.help, { color: colors.mutedForeground }]}>
        Find your API key, MPAN and meter serial in your Octopus account. Your API
        key is encrypted and is never shown again. This home is configured as a
        prepayment customer with no solar.
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {fields.map(([key, label, secret]) => (
          <View key={key}>
            <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
            <TextInput
              value={form[key]}
              onChangeText={(value) => setForm((prev) => ({ ...prev, [key]: value }))}
              secureTextEntry={secret}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={label}
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
            />
          </View>
        ))}

        {error ? (
          <Text accessibilityRole="alert" style={{ color: colors.destructive }}>
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={save}
          disabled={busy}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary },
            pressed && { transform: [{ scale: 0.99 }] },
            busy && { opacity: 0.65 },
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
              Verify and connect
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, maxWidth: 620, width: "100%", alignSelf: "center" },
  title: { fontFamily: "Inter_700Bold", fontSize: 26 },
  help: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 20 },
  card: { borderWidth: 1, borderRadius: 14, padding: 18, gap: 14 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 13, fontFamily: "Inter_400Regular" },
  button: { height: 50, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 4 },
  buttonText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
