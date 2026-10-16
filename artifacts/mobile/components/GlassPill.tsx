import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { Glass } from "@/components/Glass";
import { useColors } from "@/hooks/useColors";
import { brand, fonts, radius, space } from "@/theme/tokens";

export type GlassPillProps = {
  icon?: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  /** Colour of the icon / status dot (use the `semantic` tokens). */
  accent?: string;
  /** Subtle dashed "+ Add solar" style for assets the user doesn't own yet. */
  ghost?: boolean;
  /** Use light text + dark glass (for pills placed on a dark card). */
  onDark?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Small floating glass chip: icon + label + value, e.g. "Solar · 1.8 kW". */
export function GlassPill({
  icon,
  label,
  value,
  accent,
  ghost = false,
  onDark = false,
  onPress,
  style,
  accessibilityLabel,
}: GlassPillProps) {
  const colors = useColors();
  const tone = accent ?? colors.primary;
  const textColor = onDark ? brand.paper : colors.foreground;

  const content = (
    <View style={styles.row}>
      {icon ? (
        <Feather
          name={icon}
          size={14}
          color={ghost ? colors.mutedForeground : tone}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          { color: ghost ? colors.mutedForeground : textColor },
        ]}
        numberOfLines={1}
      >
        {label}
        {value ? (
          <Text style={[styles.value, { color: textColor }]}>
            {" · "}
            {value}
          </Text>
        ) : null}
      </Text>
    </View>
  );

  const body = ghost ? (
    <View
      style={[
        styles.pill,
        styles.ghost,
        { borderColor: colors.mutedForeground },
      ]}
    >
      {content}
    </View>
  ) : (
    <Glass
      variant="regular"
      radius={radius.pill}
      scheme={onDark ? "dark" : undefined}
      style={styles.pill}
    >
      {content}
    </Glass>
  );

  if (!onPress) {
    return (
      <View
        style={style}
        accessible
        accessibilityLabel={accessibilityLabel ?? `${label} ${value ?? ""}`.trim()}
      >
        {body}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label} ${value ?? ""}`.trim()}
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.97 }] }]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    minHeight: 36,
    justifyContent: "center",
  },
  ghost: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  value: {
    fontFamily: fonts.bodySemiBold,
  },
});

export default GlassPill;
