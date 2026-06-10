import { useColors } from "@/hooks/useColors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface EnergyRingProps {
  progress: number;
  currentKwh: number;
  size?: number;
  unitLabel?: string;
}

export default function EnergyRing({
  progress,
  currentKwh,
  size = 200,
  unitLabel = "kWh now",
}: EnergyRingProps) {
  const colors = useColors();
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));
  const center = size / 2;

  const ringColor =
    progress > 0.8
      ? colors.destructive
      : progress > 0.6
        ? colors.accent
        : colors.primary;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={ringColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={ringColor} stopOpacity="0.5" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.muted}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.label}>
        <Text
          style={[
            styles.value,
            { color: colors.foreground, fontFamily: "Inter_700Bold" },
          ]}
        >
          {currentKwh.toFixed(1)}
        </Text>
        <Text
          style={[
            styles.unit,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          {unitLabel}
        </Text>
        <Text
          style={[
            styles.percent,
            { color: ringColor, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 38,
    lineHeight: 42,
  },
  unit: {
    fontSize: 12,
    marginTop: 2,
  },
  percent: {
    fontSize: 14,
    marginTop: 6,
  },
});
