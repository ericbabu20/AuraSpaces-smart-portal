import { useColors } from "@/hooks/useColors";
import { fonts, radius, semantic } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type UsageRange = "Day" | "Week" | "Month";

const RANGES: UsageRange[] = ["Day", "Week", "Month"];
const CHART_HEIGHT = 112;

type Props = {
  range: UsageRange;
  onRangeChange: (range: UsageRange) => void;
  electricityKwh: number;
  gasKwh: number | null;
  labels: string[];
  electricity: number[];
  /** Only drawn when it lines up with the electricity series. */
  gas?: number[];
  style?: StyleProp<ViewStyle>;
};

export default function UsageCard({
  range,
  onRangeChange,
  electricityKwh,
  gasKwh,
  labels,
  electricity,
  gas,
  style,
}: Props) {
  const colors = useColors();
  const dark = colors.colorScheme === "dark";
  const showGas = gas !== undefined && gas.length === electricity.length;
  const max = Math.max(...electricity, ...(showGas ? gas : []), 0.01);
  const lastIndex = electricity.length - 1;

  const surface = dark
    ? (["#24231F", "#1A1917"] as const)
    : (["#FFFFFF", "#FAF7F0"] as const);
  const track = dark ? "rgba(243,239,230,0.06)" : "rgba(43,43,39,0.05)";
  const hairline = dark ? "rgba(243,239,230,0.08)" : "rgba(43,43,39,0.08)";

  const barHeight = (value: number) =>
    Math.max((value / max) * CHART_HEIGHT, 6);

  return (
    <LinearGradient
      colors={surface}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.card, { borderColor: hairline }, style]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            Energy
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Usage
          </Text>
        </View>
        <View
          style={[styles.segment, { backgroundColor: track }]}
          accessibilityRole="tablist"
        >
          {RANGES.map((tab) => {
            const selected = range === tab;
            return (
              <TouchableOpacity
                key={tab}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => onRangeChange(tab)}
                style={[
                  styles.segmentBtn,
                  selected && {
                    backgroundColor: dark ? "#F3EFE6" : "#2B2B27",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: selected
                        ? dark
                          ? "#1A1917"
                          : "#FFFFFF"
                        : colors.mutedForeground,
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric
          color={colors.primary}
          label="Electricity"
          value={electricityKwh.toFixed(1)}
          foreground={colors.foreground}
          muted={colors.mutedForeground}
        />
        <View style={[styles.divider, { backgroundColor: hairline }]} />
        <Metric
          color={semantic.gas}
          label="Gas"
          value={gasKwh != null ? gasKwh.toFixed(1) : "—"}
          foreground={colors.foreground}
          muted={colors.mutedForeground}
        />
      </View>

      <View style={[styles.chart, { height: CHART_HEIGHT }]}>
        {[0.5, 1].map((line) => (
          <View
            key={line}
            pointerEvents="none"
            style={[
              styles.gridLine,
              { bottom: CHART_HEIGHT * line, backgroundColor: hairline },
            ]}
          />
        ))}
        {electricity.map((value, index) => {
          const current = index === lastIndex;
          const opacity = current ? 1 : 0.42;
          return (
            <View key={`${labels[index] ?? index}`} style={styles.group}>
              <View style={styles.pair}>
                <View style={[styles.track, { backgroundColor: track }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight(value),
                        backgroundColor: colors.primary,
                        opacity,
                      },
                    ]}
                  />
                </View>
                {showGas ? (
                  <View style={[styles.track, { backgroundColor: track }]}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight(gas[index]),
                          backgroundColor: semantic.gas,
                          opacity,
                        },
                      ]}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {labels.map((label, index) => (
          <Text
            key={`${label}-${index}`}
            numberOfLines={1}
            style={[
              styles.label,
              {
                color:
                  index === lastIndex
                    ? colors.foreground
                    : colors.mutedForeground,
                fontFamily:
                  index === lastIndex ? fonts.bodySemiBold : fonts.body,
              },
            ]}
          >
            {label}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/insights")}
        accessibilityRole="link"
        style={[styles.cta, { backgroundColor: track }]}
        activeOpacity={0.8}
      >
        <Text style={[styles.ctaText, { color: colors.foreground }]}>
          Open Insights
        </Text>
        <Ionicons
          name="arrow-forward"
          size={16}
          color={colors.foreground}
        />
      </TouchableOpacity>
    </LinearGradient>
  );
}

function Metric({
  color,
  label,
  value,
  foreground,
  muted,
}: {
  color: string;
  label: string;
  value: string;
  foreground: string;
  muted: string;
}) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricLabelRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.metricLabel, { color: muted }]}>{label}</Text>
      </View>
      <Text style={[styles.metricValue, { color: foreground }]}>
        {value}
        <Text style={[styles.metricUnit, { color: muted }]}> kWh</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    marginTop: 2,
  },
  segment: {
    flexDirection: "row",
    borderRadius: radius.pill,
    padding: 3,
  },
  segmentBtn: {
    minHeight: 32,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  metrics: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 22,
    marginBottom: 24,
  },
  metric: { flex: 1 },
  divider: {
    width: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  metricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  metricLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
  },
  metricValue: {
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 36,
    marginTop: 6,
    letterSpacing: -0.6,
  },
  metricUnit: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    letterSpacing: 0,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  group: {
    flex: 1,
    alignItems: "center",
  },
  pair: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: CHART_HEIGHT,
  },
  track: {
    width: 10,
    height: CHART_HEIGHT,
    borderRadius: radius.pill,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: radius.pill,
  },
  labels: {
    flexDirection: "row",
    marginTop: 10,
  },
  label: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
  },
  cta: {
    marginTop: 20,
    minHeight: 44,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
});
