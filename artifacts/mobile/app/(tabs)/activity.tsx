import { ActivityItem, useEnergy } from "@/context/EnergyContext";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const TYPE_COLORS: Record<ActivityItem["type"], string> = {
  device: "#60A5FA",
  automation: "#A78BFA",
  savings: "#34D399",
  alert: "#FBBF24",
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const colors = useColors();
  const typeColor = TYPE_COLORS[item.type];

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View
        style={[styles.iconWrap, { backgroundColor: typeColor + "20" }]}
      >
        <Ionicons name={item.icon as any} size={18} color={typeColor} />
      </View>
      <View style={styles.rowContent}>
        <Text
          style={[
            styles.rowText,
            { color: colors.foreground, fontFamily: "Inter_500Medium" },
          ]}
        >
          {item.description}
        </Text>
        <Text
          style={[
            styles.rowTime,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          {formatRelative(item.timestamp)}
        </Text>
      </View>
    </View>
  );
}

export default function ActivityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activity, moneySaved, carbonOffset } = useEnergy();

  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={activity}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityRow item={item} />}
        scrollEnabled={!!activity.length}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: Platform.OS === "web" ? 120 : Platform.OS === "ios" ? 100 : insets.bottom + 24,
        }}
        ListHeaderComponent={
          <View>
            <Text
              style={[
                styles.title,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              Activity
            </Text>

            <View style={styles.savingsSection}>
              <View
                style={[
                  styles.savingsCard,
                  {
                    backgroundColor: colors.primary + "18",
                    borderColor: colors.primary + "30",
                  },
                ]}
              >
                <Ionicons
                  name="wallet-outline"
                  size={28}
                  color={colors.primary}
                />
                <View>
                  <Text
                    style={[
                      styles.savingsValue,
                      {
                        color: colors.primary,
                        fontFamily: "Inter_700Bold",
                      },
                    ]}
                  >
                    ${moneySaved.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.savingsLabel,
                      {
                        color: colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                      },
                    ]}
                  >
                    saved this month
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.savingsCard,
                  {
                    backgroundColor: "#22C55E18",
                    borderColor: "#22C55E30",
                  },
                ]}
              >
                <Ionicons name="leaf-outline" size={28} color="#22C55E" />
                <View>
                  <Text
                    style={[
                      styles.savingsValue,
                      { color: "#22C55E", fontFamily: "Inter_700Bold" },
                    ]}
                  >
                    {carbonOffset.toFixed(1)} kg
                  </Text>
                  <Text
                    style={[
                      styles.savingsLabel,
                      {
                        color: colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                      },
                    ]}
                  >
                    CO₂ offset
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.legend}>
              {(
                [
                  ["device", "Device"],
                  ["automation", "Automation"],
                  ["savings", "Savings"],
                  ["alert", "Alert"],
                ] as [ActivityItem["type"], string][]
              ).map(([type, label]) => (
                <View key={type} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: TYPE_COLORS[type] },
                    ]}
                  />
                  <Text
                    style={[
                      styles.legendLabel,
                      {
                        color: colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Recent
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, paddingHorizontal: 20, marginBottom: 16 },
  savingsSection: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  savingsCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  savingsValue: { fontSize: 22 },
  savingsLabel: { fontSize: 12, marginTop: 2 },
  legend: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12 },
  sectionTitle: { fontSize: 15, paddingHorizontal: 20, marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: { flex: 1, gap: 4 },
  rowText: { fontSize: 14, lineHeight: 20 },
  rowTime: { fontSize: 12 },
});
