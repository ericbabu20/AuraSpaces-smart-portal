import { useEnergy } from "@/context/EnergyContext";
import { useColors } from "@/hooks/useColors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
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

export default function AutomationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { automations, toggleAutomation } = useEnergy();
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const activeCount = automations.filter((a) => a.isEnabled).length;

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
        <View>
          <Text
            style={[styles.title, { color: colors.foreground, fontFamily: "Figtree_700Bold" }]}
          >
            Automation
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" }]}
          >
            {activeCount} of {automations.length} rules active
          </Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={20} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      <View
        style={[styles.summaryCard, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}
      >
        <Ionicons name="git-merge-outline" size={24} color={colors.primary} />
        <View>
          <Text
            style={[styles.summaryTitle, { color: colors.foreground, fontFamily: "Figtree_600SemiBold" }]}
          >
            {activeCount} automations running
          </Text>
          <Text
            style={[styles.summaryDesc, { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" }]}
          >
            Saving ~£24/month passively
          </Text>
        </View>
      </View>

      {automations.map((rule) => (
        <View
          key={rule.id}
          style={[
            styles.ruleCard,
            {
              backgroundColor: colors.card,
              borderColor: rule.isEnabled ? colors.primary + "40" : colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.ruleIcon,
              {
                backgroundColor: rule.isEnabled
                  ? colors.primary + "20"
                  : colors.muted,
              },
            ]}
          >
            <Ionicons
              name={rule.icon as any}
              size={20}
              color={rule.isEnabled ? colors.primary : colors.mutedForeground}
            />
          </View>
          <View style={styles.ruleInfo}>
            <Text
              style={[
                styles.ruleName,
                {
                  color: rule.isEnabled ? colors.foreground : colors.mutedForeground,
                  fontFamily: "Figtree_600SemiBold",
                },
              ]}
            >
              {rule.name}
            </Text>
            <Text
              style={[styles.ruleTrigger, { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" }]}
            >
              When: {rule.trigger}
            </Text>
            <Text
              style={[styles.ruleAction, { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" }]}
            >
              Then: {rule.action}
            </Text>
          </View>
          <Switch
            value={rule.isEnabled}
            onValueChange={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleAutomation(rule.id);
            }}
            trackColor={{ false: colors.muted, true: colors.primary + "80" }}
            thumbColor={rule.isEnabled ? colors.primary : colors.mutedForeground}
            ios_backgroundColor={colors.muted}
          />
        </View>
      ))}

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="flash-outline" size={20} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoTitle, { color: colors.foreground, fontFamily: "Figtree_600SemiBold" }]}>
            How automation works
          </Text>
          <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Figtree_400Regular" }]}>
            Aura monitors your home's energy usage and automatically activates
            rules to minimize consumption during peak hours, saving you money
            without any manual effort.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: { fontSize: 26 },
  subtitle: { fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 15 },
  summaryDesc: { fontSize: 13, marginTop: 2 },
  ruleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  ruleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ruleInfo: { flex: 1, gap: 4 },
  ruleName: { fontSize: 14 },
  ruleTrigger: { fontSize: 12 },
  ruleAction: { fontSize: 12 },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 6,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  infoTitle: { fontSize: 14, marginBottom: 6 },
  infoText: { fontSize: 13, lineHeight: 20 },
});
