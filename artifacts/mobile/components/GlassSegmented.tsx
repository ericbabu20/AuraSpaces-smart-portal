import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Glass } from "@/components/Glass";
import { useColors } from "@/hooks/useColors";
import { fonts, radius, space } from "@/theme/tokens";

export type SegmentOption<T extends string> = { key: T; label: string };

export type GlassSegmentedProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (key: T) => void;
};

/** Glass segmented control, e.g. Home / EV. */
export function GlassSegmented<T extends string>({
  options,
  value,
  onChange,
}: GlassSegmentedProps<T>) {
  const colors = useColors();

  return (
    <Glass variant="regular" radius={radius.pill} style={styles.wrap}>
      <View style={styles.row} accessibilityRole="tablist">
        {options.map((opt) => {
          const selected = opt.key === value;
          return (
            <Pressable
              key={opt.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => {
                if (selected) return;
                if (Platform.OS !== "web") Haptics.selectionAsync();
                onChange(opt.key);
              }}
              style={[
                styles.segment,
                selected && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.text,
                  {
                    color: selected
                      ? colors.primaryForeground
                      : colors.foreground,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 3 },
  row: { flexDirection: "row", gap: 2 },
  segment: {
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    minHeight: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default GlassSegmented;
