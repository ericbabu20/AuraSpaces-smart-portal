import EnergyRing from "@/components/EnergyRing";
import { useEnergy } from "@/context/EnergyContext";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    currentUsage,
    moneySaved,
    carbonOffset,
    devices,
    electricityToday,
    gasToday,
    isSampleData,
  } = useEnergy();

  const activeDevices = devices.filter((d) => d.isOn);
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const elecKwh = electricityToday ?? currentUsage;
  const elecPercent = Math.min(elecKwh / 7.4, 1);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: Platform.OS === "web" ? 120 : Platform.OS === "ios" ? 100 : insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text
            style={[
              styles.greeting,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            Good morning
          </Text>
          <Text
            style={[
              styles.name,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            Alex
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/connect")}>
          <View
            style={[
              styles.headerBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="add" size={22} color={colors.foreground} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.ringSection}>
        <View
          style={[
            styles.ringGlow,
            { backgroundColor: colors.primary + "18" },
          ]}
        />
        <EnergyRing
          progress={elecPercent}
          currentKwh={elecKwh}
          size={210}
          unitLabel="kWh today"
        />
        <Text
          style={[
            styles.ringSubtext,
            {
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
            },
          ]}
        >
          electricity · of 7.4 kWh daily target
        </Text>
        {isSampleData ? (
          <Text
            style={[
              styles.sampleNote,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            Showing sample data — live meter data unavailable
          </Text>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="flame-outline" size={16} color={colors.accent} />
          <Text
            style={[
              styles.statValue,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            {gasToday != null ? gasToday.toFixed(1) : "—"}
          </Text>
          <Text
            style={[
              styles.statLabel,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            kWh gas
          </Text>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="wallet-outline" size={16} color={colors.accent} />
          <Text
            style={[
              styles.statValue,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            £{moneySaved.toFixed(0)}
          </Text>
          <Text
            style={[
              styles.statLabel,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            saved
          </Text>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="leaf-outline" size={16} color="#22C55E" />
          <Text
            style={[
              styles.statValue,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            {carbonOffset.toFixed(0)}
          </Text>
          <Text
            style={[
              styles.statLabel,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            kg CO₂
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/aura")}
          activeOpacity={0.85}
        >
          <Ionicons name="mic" size={20} color={colors.primaryForeground} />
          <Text
            style={[
              styles.actionLabel,
              {
                color: colors.primaryForeground,
                fontFamily: "Inter_600SemiBold",
              },
            ]}
          >
            Ask Aura
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
          onPress={() => router.push("/recommendations")}
          activeOpacity={0.85}
        >
          <Ionicons name="bulb-outline" size={20} color={colors.accent} />
          <Text
            style={[
              styles.actionLabel,
              {
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
              },
            ]}
          >
            Tips
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          Active Now
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/devices")}>
          <Text
            style={[
              styles.seeAll,
              { color: colors.primary, fontFamily: "Inter_500Medium" },
            ]}
          >
            See all
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {activeDevices.map((device) => (
          <View
            key={device.id}
            style={[
              styles.deviceChip,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[styles.chipDot, { backgroundColor: colors.primary }]}
            />
            <Text
              style={[
                styles.chipName,
                {
                  color: colors.foreground,
                  fontFamily: "Inter_500Medium",
                },
              ]}
              numberOfLines={1}
            >
              {device.name}
            </Text>
            <Text
              style={[
                styles.chipPower,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {device.powerDraw >= 1000
                ? `${(device.powerDraw / 1000).toFixed(1)}kW`
                : `${device.powerDraw}W`}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          Quick Access
        </Text>
      </View>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[styles.quickTile, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/thermostat")}
          activeOpacity={0.7}
        >
          <Ionicons name="thermometer-outline" size={26} color="#60A5FA" />
          <Text style={[styles.quickTileLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Thermostat
          </Text>
          <Text style={[styles.quickTileValue, { color: "#60A5FA", fontFamily: "Inter_700Bold" }]}>
            22°C
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickTile, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/schedule")}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={26} color="#A78BFA" />
          <Text style={[styles.quickTileLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Schedule
          </Text>
          <Text style={[styles.quickTileValue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            3 active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickTile, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/automation")}
          activeOpacity={0.7}
        >
          <Ionicons name="git-merge-outline" size={26} color="#34D399" />
          <Text style={[styles.quickTileLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Automation
          </Text>
          <Text style={[styles.quickTileValue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            4 rules on
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickTile, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/recommendations")}
          activeOpacity={0.7}
        >
          <Ionicons name="trending-down-outline" size={26} color={colors.accent} />
          <Text style={[styles.quickTileLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Savings
          </Text>
          <Text style={[styles.quickTileValue, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            £77/mo
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  greeting: { fontSize: 13 },
  name: { fontSize: 26, marginTop: 2 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  ringSection: {
    alignItems: "center",
    paddingVertical: 20,
    position: "relative",
  },
  ringGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    top: 10,
  },
  ringSubtext: { marginTop: 12, fontSize: 13 },
  sampleNote: { marginTop: 4, fontSize: 11 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    gap: 5,
    borderWidth: 1,
    alignItems: "center",
  },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11 },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionLabel: { fontSize: 15 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16 },
  seeAll: { fontSize: 14 },
  chipsRow: { paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  deviceChip: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    gap: 4,
    minWidth: 110,
    maxWidth: 150,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipName: { fontSize: 13 },
  chipPower: { fontSize: 12 },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
  },
  quickTile: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
  },
  quickTileLabel: { fontSize: 13 },
  quickTileValue: { fontSize: 16 },
});
