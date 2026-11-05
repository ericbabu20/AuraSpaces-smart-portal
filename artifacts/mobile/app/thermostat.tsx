import { useEnergy } from "@/context/EnergyContext";
import { useColors } from "@/hooks/useColors";
import { brand, category, semantic } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MODES: {
  key: "cool" | "heat" | "fan" | "off";
  icon: string;
  label: string;
  color: string;
}[] = [
  { key: "cool", icon: "snow-outline", label: "Cool", color: category.climate },
  { key: "heat", icon: "flame-outline", label: "Heat", color: brand.koi },
  { key: "fan", icon: "leaf-outline", label: "Fan", color: semantic.positive },
  { key: "off", icon: "power-outline", label: "Off", color: category.other },
];

function ThermostatDial({ temp, mode }: { temp: number; mode: string }) {
  const colors = useColors();
  const size = 240;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const minTemp = 16;
  const maxTemp = 30;
  const progress = (temp - minTemp) / (maxTemp - minTemp);
  const strokeDashoffset = circumference * (1 - progress * 0.75);
  const center = size / 2;

  const modeInfo = MODES.find((m) => m.key === mode) ?? MODES[0];

  return (
    <View
      style={[styles.dialContainer, { width: size, height: size }]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={modeInfo.color} stopOpacity="1" />
            <Stop offset="100%" stopColor={modeInfo.color} stopOpacity="0.4" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.muted}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round"
          rotation={135}
          origin={`${center}, ${center}`}
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#dialGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * 0.75 * progress} ${circumference}`}
          strokeLinecap="round"
          rotation={135}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.dialCenter}>
        <Text style={[styles.tempValue, { color: colors.foreground, fontFamily: "Figtree_700Bold" }]}>
          {temp}°C
        </Text>
        <Text style={[styles.modeLabel, { color: modeInfo.color, fontFamily: "Figtree_500Medium" }]}>
          {modeInfo.label}
        </Text>
      </View>
    </View>
  );
}

export default function ThermostatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { thermostatTemp, setThermostatTemp, thermostatMode, setThermostatMode } =
    useEnergy();
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const adjust = (delta: number) => {
    const next = Math.min(30, Math.max(16, thermostatTemp + delta));
    if (next !== thermostatTemp) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setThermostatTemp(next);
    }
  };

  const scheduleItems = [
    { label: "Wake", time: "6:30 AM", temp: 21 },
    { label: "Day", time: "9:00 AM", temp: 19 },
    { label: "Evening", time: "5:00 PM", temp: 22 },
    { label: "Sleep", time: "10:00 PM", temp: 18 },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={[styles.title, { color: colors.foreground, fontFamily: "Figtree_700Bold" }]}
      >
        Thermostat
      </Text>
      <Text
        style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" }]}
      >
        Living Room · 1.2 kW active
      </Text>

      <View style={styles.dialSection}>
        <ThermostatDial temp={thermostatTemp} mode={thermostatMode} />
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => adjust(-1)}
            style={[styles.adjustBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Ionicons name="remove" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.currentTemp}>
            <Text style={[styles.currentTempLabel, { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" }]}>
              Target
            </Text>
            <Text style={[styles.currentTempValue, { color: colors.foreground, fontFamily: "Figtree_700Bold" }]}>
              {thermostatTemp}°C
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => adjust(1)}
            style={[styles.adjustBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={28} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Figtree_500Medium" }]}>
        MODE
      </Text>
      <View style={styles.modesRow}>
        {MODES.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            onPress={() => {
              Haptics.selectionAsync();
              setThermostatMode(mode.key);
            }}
            style={[
              styles.modeBtn,
              {
                backgroundColor:
                  thermostatMode === mode.key
                    ? mode.color + "25"
                    : colors.card,
                borderColor:
                  thermostatMode === mode.key ? mode.color + "60" : colors.border,
              },
            ]}
          >
            <Ionicons
              name={mode.icon as any}
              size={22}
              color={thermostatMode === mode.key ? mode.color : colors.mutedForeground}
            />
            <Text
              style={[
                styles.modeBtnLabel,
                {
                  color: thermostatMode === mode.key ? mode.color : colors.mutedForeground,
                  fontFamily: "Figtree_500Medium",
                },
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Figtree_500Medium" }]}>
        DAILY SCHEDULE
      </Text>
      <View style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {scheduleItems.map((item, i) => (
          <View
            key={item.label}
            style={[styles.scheduleRow, { borderBottomColor: colors.border, borderBottomWidth: i < scheduleItems.length - 1 ? 1 : 0 }]}
          >
            <Text style={[styles.scheduleLabel, { color: colors.foreground, fontFamily: "Figtree_500Medium" }]}>
              {item.label}
            </Text>
            <Text style={[styles.scheduleTime, { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" }]}>
              {item.time}
            </Text>
            <Text style={[styles.scheduleTemp, { color: colors.primary, fontFamily: "Figtree_700Bold" }]}>
              {item.temp}°C
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, paddingHorizontal: 20, marginBottom: 4 },
  subtitle: { fontSize: 13, paddingHorizontal: 20, marginBottom: 24 },
  dialSection: { alignItems: "center", paddingVertical: 8, gap: 24 },
  dialContainer: { position: "relative", alignItems: "center", justifyContent: "center" },
  dialCenter: { position: "absolute", alignItems: "center" },
  tempValue: { fontSize: 52, lineHeight: 56 },
  modeLabel: { fontSize: 15, marginTop: 4 },
  controls: { flexDirection: "row", alignItems: "center", gap: 24 },
  adjustBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  currentTemp: { alignItems: "center", gap: 4, minWidth: 70 },
  currentTempLabel: { fontSize: 12 },
  currentTempValue: { fontSize: 28 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  modesRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
  },
  modeBtn: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  modeBtnLabel: { fontSize: 12 },
  scheduleCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  scheduleLabel: { flex: 1, fontSize: 14 },
  scheduleTime: { fontSize: 13, marginRight: 12 },
  scheduleTemp: { fontSize: 16, minWidth: 44, textAlign: "right" },
});
