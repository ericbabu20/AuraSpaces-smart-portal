import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];
const TODAY_IDX = (new Date().getDay() + 6) % 7;

interface ScheduleItem {
  id: string;
  device: string;
  icon: string;
  startTime: string;
  endTime: string;
  days: number[];
  isEnabled: boolean;
  category: string;
}

const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: "1",
    device: "Dishwasher",
    icon: "water-outline",
    startTime: "9:00 PM",
    endTime: "10:30 PM",
    days: [0, 1, 2, 3, 4],
    isEnabled: true,
    category: "appliance",
  },
  {
    id: "2",
    device: "Washing Machine",
    icon: "water-outline",
    startTime: "7:00 AM",
    endTime: "8:30 AM",
    days: [5, 6],
    isEnabled: true,
    category: "appliance",
  },
  {
    id: "3",
    device: "EV Charger",
    icon: "car-outline",
    startTime: "11:00 PM",
    endTime: "5:00 AM",
    days: [0, 1, 2, 3, 4, 5, 6],
    isEnabled: false,
    category: "ev",
  },
  {
    id: "4",
    device: "Thermostat",
    icon: "thermometer-outline",
    startTime: "6:30 AM",
    endTime: "10:00 PM",
    days: [0, 1, 2, 3, 4],
    isEnabled: true,
    category: "climate",
  },
];

export default function ScheduleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [schedules, setSchedules] = useState<ScheduleItem[]>(INITIAL_SCHEDULES);
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const toggle = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Figtree_700Bold" }]}>
          Schedule
        </Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={20} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {DAYS_SHORT.map((day, i) => (
          <View
            key={i}
            style={[
              styles.dayCell,
              {
                backgroundColor:
                  i === TODAY_IDX ? colors.primary : colors.card,
                borderColor: i === TODAY_IDX ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.dayText,
                {
                  color:
                    i === TODAY_IDX
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  fontFamily: "Figtree_500Medium",
                },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Figtree_500Medium" }]}
      >
        APPLIANCE SCHEDULES
      </Text>

      {schedules.map((item) => (
        <View
          key={item.id}
          style={[
            styles.scheduleCard,
            {
              backgroundColor: colors.card,
              borderColor: item.isEnabled ? colors.primary + "30" : colors.border,
            },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons name={item.icon as any} size={20} color={colors.primary} />
          </View>
          <View style={styles.scheduleInfo}>
            <Text style={[styles.scheduleName, { color: colors.foreground, fontFamily: "Figtree_600SemiBold" }]}>
              {item.device}
            </Text>
            <Text style={[styles.scheduleTime, { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" }]}>
              {item.startTime} – {item.endTime}
            </Text>
            <View style={styles.daysRow}>
              {DAYS_SHORT.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.dayPip,
                    {
                      backgroundColor: item.days.includes(i)
                        ? colors.primary
                        : colors.muted,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
          <Switch
            value={item.isEnabled}
            onValueChange={() => toggle(item.id)}
            trackColor={{ false: colors.muted, true: colors.primary + "80" }}
            thumbColor={item.isEnabled ? colors.primary : colors.mutedForeground}
            ios_backgroundColor={colors.muted}
          />
        </View>
      ))}

      <View
        style={[styles.tipCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}
      >
        <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
        <Text style={[styles.tipText, { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" }]}>
          Scheduling heavy appliances during off-peak hours (after 9 PM) can
          reduce your bill by up to 35%.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: { fontSize: 26 },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  weekRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dayCell: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dayText: { fontSize: 13 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleInfo: { flex: 1, gap: 4 },
  scheduleName: { fontSize: 14 },
  scheduleTime: { fontSize: 12 },
  daysRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  dayPip: { width: 6, height: 6, borderRadius: 3 },
  tipCard: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  tipText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
