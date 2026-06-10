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

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  showChevron?: boolean;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  color,
  showChevron = true,
}: SettingsRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.settingsRow, { borderBottomColor: colors.border }]}
    >
      <View
        style={[
          styles.settingsIcon,
          { backgroundColor: (color ?? colors.primary) + "20" },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={color ?? colors.primary}
        />
      </View>
      <Text
        style={[
          styles.settingsLabel,
          { color: colors.foreground, fontFamily: "Inter_500Medium" },
        ]}
      >
        {label}
      </Text>
      <View style={styles.settingsRight}>
        {value ? (
          <Text
            style={[
              styles.settingsValue,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            {value}
          </Text>
        ) : null}
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.mutedForeground}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

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
        Profile
      </Text>

      <View
        style={[
          styles.userCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: colors.primary + "20",
              borderColor: colors.primary + "40",
            },
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              { color: colors.primary, fontFamily: "Inter_700Bold" },
            ]}
          >
            A
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text
            style={[
              styles.userName,
              { color: colors.foreground, fontFamily: "Inter_700Bold" },
            ]}
          >
            Alex Chen
          </Text>
          <Text
            style={[
              styles.userEmail,
              {
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            alex@example.com
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="pencil-outline" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.planCard,
          {
            backgroundColor: colors.primary + "18",
            borderColor: colors.primary + "30",
          },
        ]}
      >
        <View style={styles.planTop}>
          <View>
            <Text
              style={[
                styles.planName,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              Green Home Pro
            </Text>
            <Text
              style={[
                styles.planDesc,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              Time-of-use rate plan
            </Text>
          </View>
          <View
            style={[
              styles.planBadge,
              { backgroundColor: colors.primary + "30" },
            ]}
          >
            <Text
              style={[
                styles.planBadgeText,
                { color: colors.primary, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Active
            </Text>
          </View>
        </View>
        <View style={styles.planStats}>
          <View>
            <Text
              style={[
                styles.planStatVal,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              £85
            </Text>
            <Text
              style={[
                styles.planStatLabel,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              est. bill
            </Text>
          </View>
          <View style={[styles.planDivider, { backgroundColor: colors.border }]} />
          <View>
            <Text
              style={[
                styles.planStatVal,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              £38.50
            </Text>
            <Text
              style={[
                styles.planStatLabel,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              saved
            </Text>
          </View>
          <View style={[styles.planDivider, { backgroundColor: colors.border }]} />
          <View>
            <Text
              style={[
                styles.planStatVal,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              18.2 kg
            </Text>
            <Text
              style={[
                styles.planStatLabel,
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

      <Text
        style={[
          styles.sectionLabel,
          { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
        ]}
      >
        PREFERENCES
      </Text>
      <View
        style={[
          styles.settingsGroup,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <SettingsRow icon="notifications-outline" label="Notifications" value="On" />
        <SettingsRow icon="moon-outline" label="Dark Mode" value="On" />
        <SettingsRow icon="language-outline" label="Units" value="Metric" />
        <SettingsRow icon="location-outline" label="Location" value="Enabled" showChevron={false} />
      </View>

      <Text
        style={[
          styles.sectionLabel,
          { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
        ]}
      >
        ACCOUNT
      </Text>
      <View
        style={[
          styles.settingsGroup,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <SettingsRow icon="shield-checkmark-outline" label="Privacy" />
        <SettingsRow icon="document-text-outline" label="Terms & Conditions" />
        <SettingsRow icon="help-circle-outline" label="Help & Support" />
        <SettingsRow
          icon="log-out-outline"
          label="Sign Out"
          color={colors.destructive}
          showChevron={false}
        />
      </View>

      <Text
        style={[
          styles.version,
          { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
        ]}
      >
        Aura Spaces v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 26, paddingHorizontal: 20, marginBottom: 16 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarText: { fontSize: 22 },
  userInfo: { flex: 1 },
  userName: { fontSize: 17 },
  userEmail: { fontSize: 13, marginTop: 2 },
  planCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 14,
  },
  planTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planName: { fontSize: 16 },
  planDesc: { fontSize: 13, marginTop: 2 },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  planBadgeText: { fontSize: 12 },
  planStats: { flexDirection: "row", alignItems: "center", gap: 16 },
  planStatVal: { fontSize: 18 },
  planStatLabel: { fontSize: 11, marginTop: 2 },
  planDivider: { width: 1, height: 32 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  settingsGroup: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
  },
  settingsIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsLabel: { flex: 1, fontSize: 14 },
  settingsRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingsValue: { fontSize: 13 },
  version: { textAlign: "center", fontSize: 12, marginTop: 4 },
});
