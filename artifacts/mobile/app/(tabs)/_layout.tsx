import DesktopSidebar from "@/components/DesktopSidebar";
import { Glass } from "@/components/Glass";
import { useColors } from "@/hooks/useColors";
import { useIsWideLayout } from "@/hooks/useIsWideLayout";
import { Feather } from "@expo/vector-icons";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts, radius } from "@/theme/tokens";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="devices">
        <Icon sf={{ default: "bolt", selected: "bolt.fill" }} />
        <Label>Devices</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Insights</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity">
        <Icon sf={{ default: "waveform", selected: "waveform" }} />
        <Label>Activity</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function TabScreens({ hideTabBar }: { hideTabBar?: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        // Floating glass capsule: 16px side margins, lifted off the bottom edge.
        tabBarStyle: hideTabBar
          ? { display: "none" }
          : {
              position: "absolute",
              left: 16,
              right: 16,
              bottom: Math.max(insets.bottom, 12) + (Platform.OS === "web" ? 4 : 0),
              height: 64,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: radius.pill,
              backgroundColor: "transparent",
              borderTopWidth: 0,
              elevation: 0,
              overflow: "hidden",
            },
        tabBarBackground: () =>
          hideTabBar ? null : (
            <Glass
              variant="regular"
              radius={radius.pill}
              style={StyleSheet.absoluteFill}
            />
          ),
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 11,
        },
        tabBarItemStyle: { borderRadius: radius.pill },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={22} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: "Devices",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="bolt" tintColor={color} size={22} />
            ) : (
              <Feather name="zap" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar" tintColor={color} size={22} />
            ) : (
              <Feather name="bar-chart-2" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="waveform" tintColor={color} size={22} />
            ) : (
              <Feather name="activity" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person" tintColor={color} size={22} />
            ) : (
              <Feather name="user" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

function WideWebLayout() {
  const colors = useColors();
  return (
    <View style={[styles.wideRoot, { backgroundColor: colors.background }]}>
      <DesktopSidebar />
      <View style={styles.wideContent}>
        <TabScreens hideTabBar />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const isWide = useIsWideLayout();

  if (isWide) {
    return <WideWebLayout />;
  }

  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }

  return <TabScreens />;
}

const styles = StyleSheet.create({
  wideRoot: {
    flex: 1,
    flexDirection: "row",
  },
  wideContent: {
    flex: 1,
    minWidth: 0,
  },
});
