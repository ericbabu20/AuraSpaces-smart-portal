import EnergyHouseHero from "@/components/EnergyHouseHero";
import { useAuth } from "@/context/AuthContext";
import { useEnergy } from "@/context/EnergyContext";
import { useColors } from "@/hooks/useColors";
import { semantic } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

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
  const chartHeight = 110;
  return (
    <View style={styles.chartWrap}>
      <View style={[styles.barsRow, { height: chartHeight }]}>
        {values.map((v, i) => {
          const h = Math.max((v / max) * chartHeight, 4);
          return (
            <View key={`${labels[i] ?? i}`} style={styles.barCol}>
              <View style={[styles.barTrack, { height: chartHeight }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: h,
                      backgroundColor: color,
                    },
                  ]}
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
    </View>
  );
}

export default function HomeWideDashboard() {
  const colors = useColors();
  const { user } = useAuth();
  const rawName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    (user?.user_metadata?.name as string | undefined)?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "there";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
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
  const [query, setQuery] = useState("");
  const [evUnit, setEvUnit] = useState<"£" | "kWh">("£");

  const elecKwh = electricityToday ?? currentUsage;
  const ev = devices.find((d) => d.category === "ev");
  const thermostat = devices.find((d) => d.name === "Thermostat");
  const evCost = moneySaved * 0.15;
  const evKwh = elecKwh * 0.35;

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

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text
            style={[
              styles.title,
              { color: colors.foreground, fontFamily: "Figtree_700Bold" },
            ]}
          >
            Home
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.foreground,
                fontFamily: "Figtree_600SemiBold",
              },
            ]}
          >
            Welcome, {displayName}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.auraHeaderBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/aura")}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={16} color={colors.primaryForeground} />
            <Text
              style={{
                color: colors.primaryForeground,
                fontFamily: "Figtree_700Bold",
                fontSize: 13,
              }}
            >
              Aura AI
            </Text>
          </TouchableOpacity>
          <View
            style={[
              styles.search,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={16}
              color={colors.mutedForeground}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search devices or tips"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.searchInput,
                { color: colors.foreground, fontFamily: "Figtree_400Regular" },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.columns}>
        {/* Column A — Live + activity history */}
        <ScrollView
          style={styles.col}
          contentContainerStyle={styles.colContent}
          showsVerticalScrollIndicator={false}
        >
          <EnergyHouseHero wide />

          <Card>
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.foreground,
                    fontFamily: "Figtree_600SemiBold",
                  },
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
            {activity.slice(0, 5).map((item) => (
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
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontFamily: "Figtree_500Medium",
                      fontSize: 13,
                    }}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </ScrollView>

        {/* Column B — Today charts */}
        <ScrollView
          style={styles.col}
          contentContainerStyle={styles.colContent}
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.foreground,
                    fontFamily: "Figtree_600SemiBold",
                  },
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
                      range === tab && { backgroundColor: colors.card },
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
                marginBottom: 4,
              }}
            >
              Home usage {elecKwh.toFixed(1)} kWh
            </Text>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontSize: 11,
                    fontFamily: "Figtree_400Regular",
                  }}
                >
                  Electricity
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: semantic.gas }]}
                />
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontSize: 11,
                    fontFamily: "Figtree_400Regular",
                  }}
                >
                  Gas
                </Text>
              </View>
            </View>
            <MiniBars
              values={chartValues}
              labels={chartLabels}
              color={colors.primary}
            />
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/insights")}
              style={{ alignSelf: "flex-end", marginTop: 8 }}
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
          </Card>

          <Card>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Figtree_600SemiBold",
                fontSize: 14,
                marginBottom: 4,
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
          </Card>

          <Card>
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.foreground,
                    fontFamily: "Figtree_600SemiBold",
                  },
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
                      evUnit === unit && { backgroundColor: colors.card },
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
                fontSize: 22,
                marginBottom: 8,
              }}
            >
              {evUnit === "£"
                ? `£${evCost.toFixed(2)}`
                : `${evKwh.toFixed(1)} kWh`}
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Figtree_400Regular",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              {ev?.isOn
                ? "Currently charging"
                : "Idle — schedule off-peak charging to save more"}
            </Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/aura")}
              >
                <Ionicons
                  name="mic"
                  size={16}
                  color={colors.primaryForeground}
                />
                <Text
                  style={{
                    color: colors.primaryForeground,
                    fontFamily: "Figtree_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  Ask Aura
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.editBtn,
                  { borderColor: colors.border, flex: 1 },
                ]}
                onPress={() => router.push("/schedule")}
              >
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: "Figtree_500Medium",
                    fontSize: 13,
                  }}
                >
                  Schedule
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>

        {/* Column C — profile / devices / tariff */}
        <ScrollView
          style={[styles.col, styles.detailsCol]}
          contentContainerStyle={styles.colContent}
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <Text
              style={[
                styles.cardTitle,
                { color: colors.foreground, fontFamily: "Figtree_700Bold" },
              ]}
            >
              Alex
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Figtree_400Regular",
                fontSize: 13,
                marginTop: 4,
                lineHeight: 20,
              }}
            >
              Home energy account{"\n"}Octopus · smart meter connected
            </Text>
            <TouchableOpacity
              style={{ marginTop: 12 }}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: "Figtree_500Medium",
                  fontSize: 13,
                }}
              >
                Open profile
              </Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: colors.foreground,
                  fontFamily: "Figtree_600SemiBold",
                  marginBottom: 12,
                },
              ]}
            >
              Devices
            </Text>
            {devices.length === 0 ? (
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Figtree_400Regular",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                No devices yet.
              </Text>
            ) : null}
            {devices
              .filter((d) =>
                query
                  ? d.name.toLowerCase().includes(query.toLowerCase())
                  : true,
              )
              .slice(0, 6)
              .map((device) => (
                <View key={device.id} style={styles.deviceRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.foreground,
                        fontFamily: "Figtree_500Medium",
                        fontSize: 13,
                      }}
                    >
                      {device.name}
                    </Text>
                    <Text
                      style={{
                        color: colors.mutedForeground,
                        fontFamily: "Figtree_400Regular",
                        fontSize: 11,
                        marginTop: 2,
                      }}
                    >
                      {device.room}
                      {device.name === "Thermostat"
                        ? ` · ${thermostatTemp}°C`
                        : ""}
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
                      trackColor={{
                        false: colors.border,
                        true: colors.primary,
                      }}
                    />
                  )}
                </View>
              ))}
            <TouchableOpacity
              style={{ marginTop: 8 }}
              onPress={() => router.push("/(tabs)/devices")}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: "Figtree_500Medium",
                  fontSize: 13,
                }}
              >
                See all devices
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 8 }}
              onPress={() => router.push("/connect")}
            >
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Figtree_500Medium",
                  fontSize: 13,
                }}
              >
                + Connect device
              </Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.foreground,
                    fontFamily: "Figtree_600SemiBold",
                  },
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
                marginBottom: 10,
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
                size={16}
                color={colors.primaryForeground}
              />
              <Text
                style={{
                  color: colors.primaryForeground,
                  fontFamily: "Figtree_600SemiBold",
                  fontSize: 13,
                }}
              >
                Compare other suppliers
              </Text>
            </TouchableOpacity>
          </Card>

          <Card>
            <View style={styles.quickLinks}>
              <TouchableOpacity
                style={[styles.quickLink, { borderColor: colors.border }]}
                onPress={() => router.push("/automation")}
              >
                <Ionicons
                  name="git-merge-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: "Figtree_500Medium",
                    fontSize: 12,
                  }}
                >
                  Automation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickLink, { borderColor: colors.border }]}
                onPress={() => router.push("/recommendations")}
              >
                <Ionicons
                  name="trending-down-outline"
                  size={18}
                  color={colors.accent}
                />
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: "Figtree_500Medium",
                    fontSize: 12,
                  }}
                >
                  Savings
                </Text>
              </TouchableOpacity>
            </View>
            {thermostat ? (
              <Text
                style={{
                  marginTop: 10,
                  color: colors.mutedForeground,
                  fontSize: 12,
                  fontFamily: "Figtree_400Regular",
                }}
              >
                Thermostat {thermostat.isOn ? "on" : "off"} · {thermostatTemp}
                °C
              </Text>
            ) : null}
          </Card>
        </ScrollView>
      </View>
    </View>
  );
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  auraHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: { fontSize: 32, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 6, letterSpacing: 0.1 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 220,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    outlineStyle: "none" as any,
  },
  columns: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
    minHeight: 0,
  },
  col: { flex: 1, minWidth: 0 },
  detailsCol: { flex: 0.92 },
  colContent: { gap: 16, paddingBottom: 24 },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 12,
  },
  cardTitle: { fontSize: 16 },
  cardMeta: { fontSize: 12, marginTop: 2 },
  segment: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  segmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  liveBody: {
    alignItems: "center",
    paddingVertical: 8,
    gap: 16,
  },
  callouts: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  callout: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  calloutText: { fontSize: 12 },
  optimBox: {
    marginTop: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  legend: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 12,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  chartWrap: { marginTop: 4, marginBottom: 4 },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
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
  barLabel: { fontSize: 9, marginTop: 6 },
  actionsRow: { flexDirection: "row", gap: 10 },
  primaryBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  editBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  quickLinks: { flexDirection: "row", gap: 10 },
  quickLink: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 14,
    gap: 8,
    alignItems: "flex-start",
  },
  evPanel: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
  },
  evTitle: { fontSize: 18, marginTop: 8 },
  compareCta: {
    marginTop: 14,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
