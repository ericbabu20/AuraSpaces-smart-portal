import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { Feather, Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  match: string;
};

const NAV: NavItem[] = [
  { href: "/(tabs)", label: "Home", icon: "home", match: "/" },
  { href: "/(tabs)/devices", label: "Devices", icon: "zap", match: "/devices" },
  {
    href: "/(tabs)/insights",
    label: "Insights",
    icon: "bar-chart-2",
    match: "/insights",
  },
  {
    href: "/(tabs)/activity",
    label: "Activity",
    icon: "activity",
    match: "/activity",
  },
  {
    href: "/(tabs)/profile",
    label: "Profile",
    icon: "user",
    match: "/profile",
  },
];

function isActive(pathname: string, match: string) {
  if (match === "/") {
    return (
      pathname === "/" ||
      pathname === "/(tabs)" ||
      pathname.endsWith("/index") ||
      pathname === ""
    );
  }
  return pathname.includes(match);
}

export default function DesktopSidebar() {
  const colors = useColors();
  const { isDark } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: colors.card,
          borderRightColor: colors.border,
        },
      ]}
    >
      <View style={styles.brand}>
        <Image
          source={require("../assets/images/logo.png")}
          style={[styles.logo, isDark && styles.logoDark]}
          resizeMode="contain"
          accessibilityLabel="Aura Spaces"
        />
      </View>

      <View style={styles.nav}>
        {NAV.map((item) => {
          const active = isActive(pathname, item.match);
          return (
            <TouchableOpacity
              key={item.href}
              style={[
                styles.navItem,
                active && { backgroundColor: colors.secondary },
              ]}
              onPress={() => router.push(item.href as any)}
              activeOpacity={0.75}
            >
              <Feather
                name={item.icon}
                size={18}
                color={active ? colors.foreground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: active ? colors.foreground : colors.mutedForeground,
                    fontFamily: active
                      ? "Inter_600SemiBold"
                      : "Inter_500Medium",
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.auraBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/aura")}
          activeOpacity={0.85}
        >
          <Ionicons name="mic" size={16} color={colors.primaryForeground} />
          <Text
            style={[
              styles.auraBtnText,
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
          style={styles.profileRow}
          onPress={() => router.push("/(tabs)/profile")}
          activeOpacity={0.75}
        >
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Text
              style={[
                styles.avatarText,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              A
            </Text>
          </View>
          <Text
            style={[
              styles.profileName,
              { color: colors.foreground, fontFamily: "Inter_500Medium" },
            ]}
            numberOfLines={1}
          >
            Alex
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    paddingTop: 28,
    paddingHorizontal: 14,
    paddingBottom: 20,
    borderRightWidth: StyleSheet.hairlineWidth,
    justifyContent: "flex-start",
  },
  brand: {
    paddingHorizontal: 10,
    marginBottom: 32,
  },
  logo: {
    height: 28,
    width: 120,
  },
  logoDark: {
    tintColor: "#F2F2F2",
  },
  nav: {
    gap: 2,
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  navLabel: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  footer: {
    gap: 14,
    paddingTop: 12,
  },
  auraBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  auraBtnText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
  },
  profileName: {
    fontSize: 13,
    flex: 1,
  },
});
