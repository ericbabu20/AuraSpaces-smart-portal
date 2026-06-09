import { useEnergy } from "@/context/EnergyContext";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LAST_WEEK = [14.1, 12.3, 13.8, 16.2, 11.9, 10.4, 13.0];

function BarChart({
  data,
  compareData,
  labels,
}: {
  data: number[];
  compareData: number[];
  labels: string[];
}) {
  const colors = useColors();
  const max = Math.max(...data, ...compareData) * 1.15;

  return (
    <View style={styles.chart}>
      {data.map((value, i) => (
        <View key={i} style={styles.barGroup}>
          <View style={styles.barsRow}>
            <View
              style={[
                styles.bar,
                {
                  height: (compareData[i] / max) * 100,
                  backgroundColor: colors.muted,
                  borderRadius: 4,
                },
              ]}
            />
            <View
              style={[
                styles.bar,
                {
                  height: (value / max) * 100,
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.barLabel,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {labels[i]}
          </Text>
        </View>
      ))}
    </View>
  );
}

function UsageByTime() {
  const colors = useColors();
  const segments = [
    { label: "12–6 AM", value: 8, color: "#60A5FA" },
    { label: "6–12 PM", value: 25, color: colors.primary },
    { label: "12–6 PM", value: 38, color: colors.accent },
    { label: "6–12 AM", value: 29, color: "#A78BFA" },
  ];

  return (
    <View style={styles.timeBreakdown}>
      {segments.map((seg) => (
        <View key={seg.label} style={styles.timeRow}>
          <Text
            style={[
              styles.timeLabel,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            {seg.label}
          </Text>
          <View style={[styles.timeBarTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.timeBarFill,
                { width: `${seg.value}%` as any, backgroundColor: seg.color },
              ]}
            />
          </View>
          <Text
            style={[
              styles.timePercent,
              { color: colors.foreground, fontFamily: "Inter_500Medium" },
            ]}
          >
            {seg.value}%
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function InsightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { weeklyData, currentUsage } = useEnergy();

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const thisWeekTotal = weeklyData.reduce((a, b) => a + b, 0).toFixed(1);
  const lastWeekTotal = LAST_WEEK.reduce((a, b) => a + b, 0).toFixed(1);
  const savingsPercent = Math.round(
    ((Number(lastWeekTotal) - Number(thisWeekTotal)) /
      Number(lastWeekTotal)) *
      100
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: Platform.OS === "web" ? 120 : Platform.OS === "ios" ? 100 : insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={[
          styles.title,
          { color: colors.foreground, fontFamily: "Inter_700Bold" },
        ]}
      >
        Energy Insights
      </Text>

      <View style={styles.summaryRow}>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.summaryCardLabel,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            This week
          </Text>
          <Text
            style={[
              styles.summaryCardValue,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            {thisWeekTotal} kWh
          </Text>
        </View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.summaryCardLabel,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            Last week
          </Text>
          <Text
            style={[
              styles.summaryCardValue,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            {lastWeekTotal} kWh
          </Text>
        </View>
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" },
          ]}
        >
          <Text
            style={[
              styles.summaryCardLabel,
              { color: colors.primary, fontFamily: "Inter_400Regular" },
            ]}
          >
            Change
          </Text>
          <Text
            style={[
              styles.summaryCardValue,
              { color: colors.primary, fontFamily: "Inter_700Bold" },
            ]}
          >
            -{savingsPercent}%
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.chartHeader}>
          <Text
            style={[
              styles.chartTitle,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            Daily Usage
          </Text>
          <View style={styles.legend}>
            <View style={[styles.legendDot, { backgroundColor: colors.muted }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Last</Text>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>This</Text>
          </View>
        </View>
        <BarChart data={weeklyData} compareData={LAST_WEEK} labels={DAYS} />
      </View>

      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.chartTitle,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 16 },
          ]}
        >
          Usage by Time of Day
        </Text>
        <UsageByTime />
      </View>

      <View
        style={[
          styles.tipCard,
          { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" },
        ]}
      >
        <Ionicons name="bulb-outline" size={20} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.tipTitle,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            Aura Tip
          </Text>
          <Text
            style={[
              styles.tipText,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            Your peak usage is between 12–6 PM. Try shifting heavy appliances
            like laundry to evening hours to cut costs by up to 20%.
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.chartTitle,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
          ]}
        >
          Top Consumers
        </Text>
        {[
          { name: "AC Unit", value: 1.5, color: "#60A5FA" },
          { name: "Thermostat", value: 1.2, color: "#34D399" },
          { name: "Refrigerator", value: 0.15, color: "#A78BFA" },
          { name: "Lighting", value: 0.1, color: "#FBBF24" },
        ].map((item) => (
          <View key={item.name} style={styles.consumerRow}>
            <View style={[styles.consumerDot, { backgroundColor: item.color }]} />
            <Text style={[styles.consumerName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {item.name}
            </Text>
            <Text style={[styles.consumerValue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {item.value} kW
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, paddingHorizontal: 20, marginBottom: 16 },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
    borderWidth: 1,
  },
  summaryCardLabel: { fontSize: 11 },
  summaryCardValue: { fontSize: 16 },
  chartCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: { fontSize: 15 },
  legend: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 110,
    gap: 4,
  },
  barGroup: { flex: 1, alignItems: "center", gap: 6 },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  bar: { width: 8 },
  barLabel: { fontSize: 9 },
  timeBreakdown: { gap: 12 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  timeLabel: { fontSize: 12, width: 64 },
  timeBarTrack: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  timeBarFill: { height: "100%", borderRadius: 4 },
  timePercent: { fontSize: 12, width: 36, textAlign: "right" },
  tipCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  tipTitle: { fontSize: 14, marginBottom: 4 },
  tipText: { fontSize: 13, lineHeight: 20 },
  consumerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  consumerDot: { width: 8, height: 8, borderRadius: 4 },
  consumerName: { flex: 1, fontSize: 14 },
  consumerValue: { fontSize: 13 },
});
