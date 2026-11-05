import AuraCard from "@/components/AuraCard";
import EnergyHouseHero from "@/components/EnergyHouseHero";
import HomeWideDashboard from "@/components/HomeWideDashboard";
import { useAuth } from "@/context/AuthContext";
import { useEnergy } from "@/context/EnergyContext";
import { useColors } from "@/hooks/useColors";
import { useIsWideLayout } from "@/hooks/useIsWideLayout";
import { category, radius, semantic } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function MiniBars({
  values,
  color,
  labels,
}: {
  values: number[];
  color: string;
  labels: string[];
}) {
  const colors = useColors();
  const max = Math.max(...values, 0.01);
  const chartHeight = 88;
  return (
    <View style={[styles.barsRow, { height: chartHeight }]}>
      {values.map((v, i) => {
        const h = Math.max((v / max) * chartHeight, 4);
        return (
          <View key={`${labels[i] ?? i}`} style={styles.barCol}>
            <View style={[styles.barTrack, { height: chartHeight }]}>
              <View
                style={[styles.barFill, { height: h, backgroundColor: color }]}
              />
            </View>
            <Text
              style={[
                styles.barLabel,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Figtree_400Regular",
                },
              ]}
              numberOfLines={1}
            >
              {labels[i] ?? ""}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const rawName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    (user?.user_metadata?.name as string | undefined)?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "there";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const isWide = useIsWideLayout();
  const {
    currentUsage,
    moneySaved,
    carbonOffset,
    devices,
    electricityToday,
    gasToday,
    isSampleData,
    electricityWeekly,
    gasWeekly,
    weekLabels,
    activity,
    toggleDevice,
    thermostatTemp,
  } = useEnergy();

  const [range, setRange] = useState<"Day" | "Week" | "Month">("Week");
  const [evUnit, setEvUnit] = useState<"£" | "kWh">("£");

  const topPad = Platform.OS === "web" ? 24 : insets.top + 8;
  const bottomPad =
    Platform.OS === "web"
      ? 120
      : insets.bottom + 100;
  const elecKwh = electricityToday ?? currentUsage;
  const ev = devices.find((d) => d.category === "ev");
  const evCost = moneySaved * 0.15;
  const evKwhEst = elecKwh * 0.35;

  const chartValues =
    range === "Day"
      ? [elecKwh * 0.15, elecKwh * 0.1, elecKwh * 0.25, elecKwh * 0.5]
      : electricityWeekly.length
        ? electricityWeekly
        : [2.1, 3.4, 2.8, 4.1, 3.2, 2.9, elecKwh];
  const chartLabels =
    range === "Day"
      ? ["12am", "6am", "12pm", "6pm"]
      : weekLabels.length
        ? weekLabels
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (isWide) {
    return <HomeWideDashboard />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: bottomPad,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.greeting}>
          <Image
            source={require("../../assets/images/logomark.png")}
            style={styles.mark}
            resizeMode="contain"
            accessibilityLabel="Aura Spaces"
          />
          <Text style={styles.greetingText} numberOfLines={1}>
            <Text style={{ color: colors.mutedForeground }}>Welcome, </Text>
            <Text style={{ color: colors.foreground }}>{displayName}</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/connect")}
          style={[
            styles.headerBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="add" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Live energy hero */}
      <EnergyHouseHero />
      <View style={{ height: 16 }} />

      {/* Aura AI — just after the live hero */}
      <AuraCard />

      {/* Today usage — from desktop */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.cardTitle,
              { color: colors.foreground, fontFamily: "Figtree_600SemiBold" },
            ]}
          >
            Today
          </Text>
          <View
            style={[styles.segment, { backgroundColor: colors.secondary }]}
          >
            {(["Day", "Week", "Month"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.segmentBtn,
                  range === tab && { backgroundColor: colors.background },
                ]}
                onPress={() => setRange(tab)}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color:
                      range === tab
                        ? colors.foreground
                        : colors.mutedForeground,
                    fontFamily: "Figtree_500Medium",
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Figtree_600SemiBold",
            fontSize: 14,
            marginBottom: 10,
          }}
        >
          Home usage {elecKwh.toFixed(1)} kWh
        </Text>
        <MiniBars
          values={chartValues}
          labels={chartLabels}
          color={colors.primary}
        />
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Figtree_600SemiBold",
            fontSize: 14,
            marginTop: 16,
            marginBottom: 10,
          }}
        >
          Gas {gasToday != null ? `${gasToday.toFixed(1)} kWh` : "—"}
        </Text>
        <MiniBars
          values={
            gasWeekly.length
              ? gasWeekly
              : [1.2, 1.8, 1.5, 2.0, 1.6, 1.4, gasToday ?? 1.5]
          }
          labels={
            weekLabels.length
              ? weekLabels
              : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          }
          color={semantic.gas}
        />
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/insights")}
          style={{ alignSelf: "flex-end", marginTop: 12 }}
        >
          <Text
            style={{
              color: colors.primary,
              fontFamily: "Figtree_500Medium",
              fontSize: 13,
            }}
          >
            Open Insights
          </Text>
        </TouchableOpacity>
      </View>

      {/* EV charging — from desktop */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.cardTitle,
              { color: colors.foreground, fontFamily: "Figtree_600SemiBold" },
            ]}
          >
            EV charging
          </Text>
          <View
            style={[styles.segment, { backgroundColor: colors.secondary }]}
          >
            {(["£", "kWh"] as const).map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.segmentBtn,
                  evUnit === unit && { backgroundColor: colors.background },
                ]}
                onPress={() => setEvUnit(unit)}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color:
                      evUnit === unit
                        ? colors.foreground
                        : colors.mutedForeground,
                    fontFamily: "Figtree_500Medium",
                  }}
                >
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Figtree_700Bold",
            fontSize: 26,
          }}
        >
          {evUnit === "£"
            ? `£${evCost.toFixed(2)}`
            : `${evKwhEst.toFixed(1)} kWh`}
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            fontFamily: "Figtree_400Regular",
            fontSize: 13,
            marginTop: 6,
          }}
        >
          {ev?.isOn
            ? "Currently charging"
            : "Idle — schedule off-peak charging to save more"}
        </Text>
      </View>

      {/* Devices with toggles — from desktop */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.cardTitle,
              { color: colors.foreground, fontFamily: "Figtree_600SemiBold" },
            ]}
          >
            Devices
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/devices")}>
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Figtree_500Medium",
                fontSize: 13,
              }}
            >
              See all
            </Text>
          </TouchableOpacity>
        </View>
        {devices.length === 0 ? (
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Figtree_400Regular",
              fontSize: 14,
            }}
          >
            No devices yet. Add one from Devices.
          </Text>
        ) : null}
        {devices.slice(0, 5).map((device) => (
          <View key={device.id} style={styles.deviceRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Figtree_500Medium",
                  fontSize: 14,
                }}
              >
                {device.name}
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Figtree_400Regular",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {device.room}
                {device.name === "Thermostat" ? ` · ${thermostatTemp}°C` : ""}
              </Text>
            </View>
            {device.name === "Thermostat" ? (
              <TouchableOpacity
                style={[styles.editBtn, { borderColor: colors.border }]}
                onPress={() => router.push("/thermostat")}
              >
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: "Figtree_500Medium",
                    fontSize: 12,
                  }}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            ) : (
              <Switch
                value={device.isOn}
                onValueChange={() => toggleDevice(device.id)}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            )}
          </View>
        ))}
      </View>

      {/* Activity history — from desktop */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.cardTitle,
              { color: colors.foreground, fontFamily: "Figtree_600SemiBold" },
            ]}
          >
            Activity history
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/activity")}>
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Figtree_500Medium",
                fontSize: 13,
              }}
            >
              See all
            </Text>
          </TouchableOpacity>
        </View>
        {activity.slice(0, 4).map((item) => (
          <View key={item.id} style={styles.historyRow}>
            <View
              style={[
                styles.historyIcon,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={colors.foreground}
              />
            </View>
            <Text
              style={{
                flex: 1,
                color: colors.foreground,
                fontFamily: "Figtree_500Medium",
                fontSize: 13,
              }}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>
        ))}
      </View>

      {/* Tariff — from desktop */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.cardTitle,
              { color: colors.foreground, fontFamily: "Figtree_600SemiBold" },
            ]}
          >
            Import tariff
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Figtree_500Medium",
                fontSize: 12,
              }}
            >
              Edit
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Figtree_600SemiBold",
            fontSize: 15,
            marginBottom: 8,
          }}
        >
          Octopus Go
        </Text>
        <Text style={tariffLine(colors)}>Standing charge · 38.78p/day</Text>
        <Text style={tariffLine(colors)}>
          Off-peak · 9.00p/kWh · 12:30–4:30am
        </Text>
        <Text style={tariffLine(colors)}>
          Peak · 31.51p/kWh · 4:30am–12:30am
        </Text>
        <TouchableOpacity
          style={[styles.compareCta, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/recommendations")}
          activeOpacity={0.85}
        >
          <Ionicons
            name="swap-horizontal-outline"
            size={18}
            color={colors.primaryForeground}
          />
          <Text
            style={{
              color: colors.primaryForeground,
              fontFamily: "Figtree_600SemiBold",
              fontSize: 14,
            }}
          >
            Compare other suppliers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick links */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[
            styles.quickTile,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => router.push("/thermostat")}
        >
          <Ionicons name="thermometer-outline" size={22} color={colors.accent} />
          <Text style={quickLabel(colors)}>Thermostat</Text>
          <Text style={quickValue(colors)}>{thermostatTemp}°C</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.quickTile,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => router.push("/schedule")}
        >
          <Ionicons name="calendar-outline" size={22} color={category.automation} />
          <Text style={quickLabel(colors)}>Schedule</Text>
          <Text style={quickMuted(colors)}>3 active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.quickTile,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => router.push("/automation")}
        >
          <Ionicons name="git-merge-outline" size={22} color={category.climate} />
          <Text style={quickLabel(colors)}>Automation</Text>
          <Text style={quickMuted(colors)}>4 rules on</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.quickTile,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => router.push("/recommendations")}
        >
          <Ionicons
            name="trending-down-outline"
            size={22}
            color={colors.accent}
          />
          <Text style={quickLabel(colors)}>Savings</Text>
          <Text style={quickValue(colors)}>£77/mo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function calloutText(colors: { foreground: string }) {
  return {
    color: colors.foreground,
    fontFamily: "Figtree_500Medium" as const,
    fontSize: 12,
  };
}

function tariffLine(colors: { mutedForeground: string }) {
  return {
    color: colors.mutedForeground,
    fontFamily: "Figtree_400Regular" as const,
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 18,
  };
}

function quickLabel(colors: { foreground: string }) {
  return {
    color: colors.foreground,
    fontFamily: "Figtree_500Medium" as const,
    fontSize: 13,
  };
}

function quickValue(colors: { accent: string }) {
  return {
    color: colors.accent,
    fontFamily: "Figtree_700Bold" as const,
    fontSize: 15,
  };
}

function quickMuted(colors: { mutedForeground: string }) {
  return {
    color: colors.mutedForeground,
    fontFamily: "Figtree_400Regular" as const,
    fontSize: 13,
  };
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  greeting: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 12,
  },
  mark: {
    width: 28,
    height: 28,
  },
  greetingText: {
    flex: 1,
    fontFamily: "Figtree_600SemiBold",
    fontSize: 17,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  auraHero: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
  },
  auraHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  auraOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  auraOnline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  auraOnlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  auraCtaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  auraTalkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  promptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  promptChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 10,
  },
  cardTitle: { fontSize: 17 },
  segment: {
    flexDirection: "row",
    borderRadius: 9,
    padding: 2,
    gap: 2,
  },
  segmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
  },
  liveBody: {
    alignItems: "center",
    gap: 14,
  },
  callouts: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  callout: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optimBox: {
    marginTop: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  evPanel: {
    alignItems: "center",
    paddingVertical: 20,
  },
  editBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
  },
  barCol: { flex: 1, alignItems: "center" },
  barTrack: {
    width: "70%",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    minHeight: 4,
  },
  barLabel: { fontSize: 11, marginTop: 5 },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickTile: {
    width: "47%",
    borderRadius: radius.lg,
    padding: 14,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  compareCta: {
    marginTop: 14,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
