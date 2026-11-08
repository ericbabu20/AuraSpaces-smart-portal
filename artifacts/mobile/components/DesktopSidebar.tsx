import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { fonts, radius } from "@/theme/tokens";
import { Feather, Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
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

/** macOS-style source list: translucent, rounded selection, accent icons. */
export default function DesktopSidebar() {
  const colors = useColors();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const name =
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "You";

  const material =
    Platform.OS === "web"
      ? ({
          backgroundColor: isDark
            ? "rgba(31,30,27,0.72)"
            : "rgba(236,231,218,0.6)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
        } as unknown as ViewStyle)
      : { backgroundColor: colors.secondary };

  return (
    <View
      style={[styles.sidebar, material, { borderRightColor: colors.border }]}
      role="navigation"
    >
      <View style={styles.brand}>
        <Image
          source={
            isDark
              ? require("../assets/images/logo-dark.png")
              : require("../assets/images/logo.png")
          }
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Aura Spaces"
        />
      </View>

      <Text style={[styles.section, { color: colors.mutedForeground }]}>
        Aura
      </Text>
      <View style={styles.nav}>
        {NAV.map((item) => {
          const active = isActive(pathname, item.match);
          return (
            <Pressable
              key={item.href}
              accessibilityRole="link"
              accessibilityState={{ selected: active }}
              onPress={() => router.push(item.href as never)}
              style={({ hovered, pressed }) => [
                styles.navItem,
                (hovered || pressed) && !active
                  ? { backgroundColor: colors.muted }
                  : null,
                active && { backgroundColor: colors.card },
              ]}
            >
              <Feather
                name={item.icon}
                size={17}
                color={active ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: colors.foreground,
                    fontFamily: active ? fonts.bodySemiBold : fonts.bodyMedium,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/aura")}
          style={({ pressed }) => [
            styles.auraBtn,
            { backgroundColor: colors.primary },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <Ionicons name="mic" size={16} color={colors.primaryForeground} />
          <Text style={[styles.auraBtnText, { color: colors.primaryForeground }]}>
            Ask Aura
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="link"
          style={({ hovered }) => [
            styles.profileRow,
            hovered && { backgroundColor: colors.muted },
          ]}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text
            style={[styles.profileName, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 232,
    paddingTop: 24,
    paddingHorizontal: 10,
    paddingBottom: 16,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  brand: {
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  logo: {
    height: 30,
    width: 70,
  },
  section: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  nav: {
    gap: 2,
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  navLabel: {
    fontSize: 14,
  },
  footer: {
    gap: 10,
    paddingTop: 12,
  },
  auraBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.pill,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  auraBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 6,
    borderRadius: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
  profileName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    flex: 1,
  },
});
