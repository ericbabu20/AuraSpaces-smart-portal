import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Glass } from "@/components/Glass";
import { GlassPill } from "@/components/GlassPill";
import { brand, fonts, radius, shade, space } from "@/theme/tokens";

const AURA_PROMPTS = [
  "Why is my bill high?",
  "When should I charge my EV?",
  "How can I save tonight?",
];

/**
 * Aura AI entry card: dark "Duck Willow" surface with glass chips and one
 * koi call-to-action. Always dark, in both light and dark mode.
 */
export function AuraCard() {
  const open = () => router.push("/aura");

  return (
    <LinearGradient
      colors={["#1E2024", "#050506"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* faint koi glow in the corner gives the glass something to refract */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(62,106,225,0.35)", "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.top}>
        <Glass variant="regular" radius={radius.pill} scheme="dark" style={styles.orb}>
          <Ionicons name="sparkles" size={26} color={shade.white} />
        </Glass>
        <Glass variant="clear" radius={radius.pill} scheme="dark" style={styles.online}>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </Glass>
      </View>

      <Text style={styles.title}>Aura AI</Text>
      <Text style={styles.subtitle}>
        Your energy agent. Ask about usage, devices, tariffs, and how to save.
      </Text>

      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Talk to Aura"
        style={({ pressed }) => [
          styles.talk,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <Ionicons name="mic" size={20} color={shade.white} />
        <Text style={styles.talkText}>Talk to Aura</Text>
        <Ionicons name="arrow-forward" size={18} color={shade.white} />
      </Pressable>

      <View style={styles.chips}>
        {AURA_PROMPTS.map((prompt) => (
          <GlassPill key={prompt} label={prompt} onDark onPress={open} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: space[4],
    marginBottom: space[4],
    borderRadius: radius.lg,
    padding: space[6],
    overflow: "hidden",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orb: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  online: { paddingHorizontal: space[3], paddingVertical: 6 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: brand.positive,
  },
  onlineText: {
    color: brand.paper,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  title: {
    color: brand.paper,
    fontFamily: fonts.headingBold,
    letterSpacing: -0.5,
    fontSize: 28,
    lineHeight: 34,
    marginTop: space[4],
  },
  subtitle: {
    color: "#A8ABB0",
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: space[2],
  },
  talk: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space[2],
    backgroundColor: brand.accent,
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: space[5],
    marginTop: space[5],
  },
  talkText: {
    color: shade.white,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space[2],
    marginTop: space[4],
  },
});

export default AuraCard;
