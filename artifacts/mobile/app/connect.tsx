import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  { id: "climate", label: "Climate", icon: "thermometer-outline", color: "#60A5FA" },
  { id: "lighting", label: "Lighting", icon: "bulb-outline", color: "#FBBF24" },
  { id: "appliance", label: "Appliances", icon: "cube-outline", color: "#A78BFA" },
  { id: "ev", label: "EV & Solar", icon: "car-outline", color: "#34D399" },
  { id: "security", label: "Security", icon: "shield-outline", color: "#F97316" },
  { id: "other", label: "Other", icon: "hardware-chip-outline", color: "#8B949E" },
];

const BRANDS: Record<string, string[]> = {
  climate: ["Nest", "Ecobee", "Honeywell", "Carrier", "LG", "Other"],
  lighting: ["Philips Hue", "LIFX", "Nanoleaf", "Lutron", "GE", "Other"],
  appliance: ["Samsung", "LG", "Whirlpool", "Bosch", "GE", "Other"],
  ev: ["Tesla", "ChargePoint", "Emporia", "JuiceBox", "Wallbox", "Other"],
  security: ["Ring", "Nest", "Arlo", "SimpliSafe", "ADT", "Other"],
  other: ["Matter", "Zigbee", "Z-Wave", "Wi-Fi", "Bluetooth", "Other"],
};

export default function ConnectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const brands = selectedCategory ? BRANDS[selectedCategory] ?? [] : [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
      >
        Connect Device
      </Text>
      <Text
        style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
      >
        Add a device to monitor and control from Aura
      </Text>

      <View
        style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Search devices or brands..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text
        style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}
      >
        CATEGORY
      </Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
              setSelectedBrand(null);
            }}
            style={[
              styles.categoryCard,
              {
                backgroundColor:
                  selectedCategory === cat.id
                    ? cat.color + "20"
                    : colors.card,
                borderColor:
                  selectedCategory === cat.id ? cat.color + "60" : colors.border,
              },
            ]}
          >
            <Ionicons
              name={cat.icon as any}
              size={26}
              color={selectedCategory === cat.id ? cat.color : colors.mutedForeground}
            />
            <Text
              style={[
                styles.categoryLabel,
                {
                  color:
                    selectedCategory === cat.id ? cat.color : colors.foreground,
                  fontFamily: "Inter_500Medium",
                },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedCategory && (
        <>
          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}
          >
            BRAND
          </Text>
          <View style={styles.brandsRow}>
            {brands.map((brand) => (
              <TouchableOpacity
                key={brand}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedBrand(selectedBrand === brand ? null : brand);
                }}
                style={[
                  styles.brandChip,
                  {
                    backgroundColor:
                      selectedBrand === brand ? colors.primary : colors.card,
                    borderColor:
                      selectedBrand === brand ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.brandChipText,
                    {
                      color:
                        selectedBrand === brand
                          ? colors.primaryForeground
                          : colors.foreground,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                >
                  {brand}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {selectedBrand && (
        <View
          style={[styles.connectCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.connectIconBox, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons name="wifi-outline" size={28} color={colors.primary} />
          </View>
          <Text
            style={[styles.connectTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
          >
            Connect {selectedBrand}
          </Text>
          <Text
            style={[styles.connectDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
          >
            Make sure your {selectedBrand} device is powered on and
            connected to your home Wi-Fi network before continuing.
          </Text>
          <TouchableOpacity
            style={[styles.connectBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            }}
          >
            <Text
              style={[styles.connectBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}
            >
              Start Setup
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[styles.manualCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Ionicons name="qr-code-outline" size={20} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.manualTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
          >
            Scan QR or Matter code
          </Text>
          <Text
            style={[styles.manualDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
          >
            Quickly add any Matter-compatible device by scanning its setup code.
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, paddingHorizontal: 20, marginBottom: 4 },
  subtitle: { fontSize: 14, paddingHorizontal: 20, marginBottom: 16 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 14, height: 46 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryCard: {
    width: "30%",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  categoryLabel: { fontSize: 12, textAlign: "center" },
  brandsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  brandChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  brandChipText: { fontSize: 13 },
  connectCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  connectIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  connectTitle: { fontSize: 18 },
  connectDesc: { fontSize: 13, lineHeight: 20, textAlign: "center" },
  connectBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 4,
  },
  connectBtnText: { fontSize: 15 },
  manualCard: {
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  manualTitle: { fontSize: 14 },
  manualDesc: { fontSize: 12, marginTop: 2, lineHeight: 18 },
});
