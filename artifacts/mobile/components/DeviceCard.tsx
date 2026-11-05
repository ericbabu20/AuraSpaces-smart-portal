import { useColors } from "@/hooks/useColors";
import { Device } from "@/context/EnergyContext";
import { category } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface DeviceCardProps {
  device: Device;
  onToggle: () => void;
  onPress?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  climate: category.climate,
  lighting: category.lighting,
  appliance: category.appliance,
  ev: category.ev,
};

export default function DeviceCard({
  device,
  onToggle,
  onPress,
}: DeviceCardProps) {
  const colors = useColors();
  const categoryColor = CATEGORY_COLORS[device.category] ?? colors.primary;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const powerLabel =
    device.powerDraw >= 1000
      ? `${(device.powerDraw / 1000).toFixed(1)} kW`
      : `${device.powerDraw} W`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: device.isOn
            ? colors.card
            : colors.card + "AA",
          borderColor: device.isOn ? categoryColor + "40" : colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: device.isOn
              ? categoryColor + "20"
              : colors.muted,
          },
        ]}
      >
        <Ionicons
          name={device.icon as any}
          size={22}
          color={device.isOn ? categoryColor : colors.mutedForeground}
        />
      </View>
      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            {
              color: device.isOn ? colors.foreground : colors.mutedForeground,
              fontFamily: "Figtree_600SemiBold",
            },
          ]}
          numberOfLines={1}
        >
          {device.name}
        </Text>
        <Text
          style={[
            styles.room,
            {
              color: colors.mutedForeground,
              fontFamily: "Figtree_400Regular",
            },
          ]}
        >
          {device.room} · {device.isOn ? powerLabel : "Off"}
        </Text>
      </View>
      <Switch
        value={device.isOn}
        onValueChange={handleToggle}
        trackColor={{ false: colors.muted, true: categoryColor + "80" }}
        thumbColor={device.isOn ? categoryColor : colors.mutedForeground}
        ios_backgroundColor={colors.muted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 14,
  },
  room: {
    fontSize: 12,
  },
});
