import DeviceCard from "@/components/DeviceCard";
import { useEnergy } from "@/context/EnergyContext";
import { useColors } from "@/hooks/useColors";
import { useTabContentInsets } from "@/hooks/useTabContentInsets";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES = ["All", "Climate", "Lighting", "Appliance", "EV"];

export default function DevicesScreen() {
  const colors = useColors();
  const contentInsets = useTabContentInsets();
  const { devices, toggleDevice } = useEnergy();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered =
    selectedCategory === "All"
      ? devices
      : devices.filter(
          (d) =>
            d.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  const activeCount = devices.filter((d) => d.isOn).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={contentInsets}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.title,
                { color: colors.foreground, fontFamily: "Figtree_700Bold" },
              ]}
            >
              Devices
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Figtree_400Regular",
                },
              ]}
            >
              {activeCount} of {devices.length} active
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/connect")}
            style={[
              styles.addBtn,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="add" size={22} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedCategory === cat
                      ? colors.primary
                      : colors.card,
                  borderColor:
                    selectedCategory === cat
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      selectedCategory === cat
                        ? colors.primaryForeground
                        : colors.mutedForeground,
                    fontFamily: "Figtree_500Medium",
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ marginTop: 8 }}>
          {filtered.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggle={() => toggleDevice(device.id)}
              onPress={
                device.category === "climate" && device.name === "Thermostat"
                  ? () => router.push("/thermostat")
                  : undefined
              }
            />
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons
              name="hardware-chip-outline"
              size={40}
              color={colors.mutedForeground}
            />
            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Figtree_400Regular",
                },
              ]}
            >
              {devices.length === 0
                ? "No devices yet. Tap + to add one."
                : "No devices in this category"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: { fontSize: 26 },
  subtitle: { fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 13 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 60,
  },
  emptyText: { fontSize: 14 },
});
