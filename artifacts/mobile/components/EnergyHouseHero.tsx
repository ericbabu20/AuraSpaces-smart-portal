import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { Glass } from "@/components/Glass";
import { EnergyFlows, type EnergyFlow } from "@/components/EnergyFlows";
import { GlassPill } from "@/components/GlassPill";
import { GlassSegmented } from "@/components/GlassSegmented";
import { HERO_ANCHORS, HERO_ASPECT, type HeroNode } from "@/constants/heroAnchors";
import { useEnergy } from "@/context/EnergyContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { useHeroParallax } from "@/hooks/useHeroParallax";
import { brand, fonts, radius, semantic, shade, space } from "@/theme/tokens";

const HERO_IMAGE = require("../assets/hero/house-hero.png");

/** Space reserved above the artwork for the Home/EV toggle. */
const TOP_RESERVED = 56;
/** How far the bottom Glass card overlaps the hero. */
const CARD_OVERLAP = 24;

type Props = {
  /** Larger hero + rounded corners for the desktop column. */
  wide?: boolean;
};

/** Off-peak window for Octopus Go: 00:30 - 04:30. */
function getRateStatus(now: Date) {
  const mins = now.getHours() * 60 + now.getMinutes();
  const offPeak = mins >= 30 && mins < 4 * 60 + 30;
  return offPeak
    ? {
        offPeak: true,
        text: "Off-peak until 04:30 · 9.0p/kWh",
        dot: brand.positive,
      }
    : {
        offPeak: false,
        text: "Peak rate · 31.5p/kWh · off-peak from 00:30",
        dot: brand.gasTone,
      };
}

/** Pills pop in one after another (60ms apart). Transform only, never opacity. */
const NODE_ORDER: Record<HeroNode, number> = {
  solar: 0,
  grid: 1,
  home: 2,
  battery: 3,
  ev: 4,
};

function Entrance({
  delay,
  children,
}: {
  delay: number;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0.85);
  React.useEffect(() => {
    if (reduced) {
      scale.value = 1;
      return;
    }
    scale.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 160 }));
  }, [delay, reduced, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** Places children centred on a normalised anchor inside the stage. */
function AtAnchor({
  node,
  children,
}: {
  node: HeroNode;
  children: React.ReactNode;
}) {
  const { x, y } = HERO_ANCHORS[node];
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.anchor,
        {
          left: `${x * 100}%`,
          top: `${y * 100}%`,
        } as ViewStyle,
      ]}
    >
      <Entrance delay={200 + NODE_ORDER[node] * 60}>{children}</Entrance>
    </View>
  );
}

export function EnergyHouseHero({ wide = false }: Props) {
  const colors = useColors();
  const { isDark } = useTheme();
  const {
    devices,
    energyProfile,
    setEnergyProfile,
    electricityToday,
    currentUsage,
    moneySaved,
    isSampleData,
  } = useEnergy();

  const [mode, setMode] = useState<"Home" | "EV">("Home");
  const [width, setWidth] = useState(0);

  // hero entrance (0.96 -> 1) + tilt parallax, both transform-only
  const reducedMotion = useReducedMotion();
  const heroScale = useSharedValue(reducedMotion ? 1 : 0.96);
  const parallax = useHeroParallax();
  React.useEffect(() => {
    heroScale.value = reducedMotion
      ? 1
      : withSpring(1, { damping: 16, stiffness: 120 });
  }, [reducedMotion, heroScale]);
  const stageAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: parallax.x.value },
      { translateY: parallax.y.value },
      { scale: heroScale.value },
    ],
  }));

  const heroH = wide ? 520 : 420;
  const stageH = heroH - TOP_RESERVED - 8;
  const stageW = Math.min(width * 0.92, stageH * HERO_ASPECT);
  const stageStyle = { width: stageW || 0, height: stageW / HERO_ASPECT || 0 };

  // ---- numbers -----------------------------------------------------------
  const ev = devices.find((d) => d.category === "ev");
  const evCharging = !!ev?.isOn;
  const evKw = evCharging && ev ? ev.powerDraw / 1000 : 0;
  const homeKw =
    devices
      .filter((d) => d.isOn && d.category !== "ev")
      .reduce((s, d) => s + d.powerDraw, 0) / 1000;
  const solarKw = energyProfile.hasSolar ? 1.8 : 0; // estimate: no solar meter yet
  // + = importing from the grid, - = exporting surplus solar
  const netGrid = homeKw + evKw - solarKw;
  const gridKw = Math.abs(netGrid);
  const exporting = netGrid < -0.05;

  const elecKwh = electricityToday ?? currentUsage;
  const evKwhEst = elecKwh * 0.35;
  const rate = useMemo(() => getRateStatus(new Date()), []);

  const showAll = mode === "Home";

  const bigNumber = mode === "Home" ? elecKwh : evKwhEst;
  const bigLabel = mode === "Home" ? "kWh today" : "kWh EV today (est.)";
  const statusText =
    mode === "Home"
      ? rate.text
      : evCharging
        ? `Charging at ${evKw.toFixed(1)} kW · ${rate.offPeak ? "off-peak rate" : "peak rate"}`
        : "Not charging · tap Schedule to plan a cheap charge";

  const gridColor = isDark ? brand.paper : brand.carbon;
  const stageWpx = stageStyle.width;
  const stageHpx = stageStyle.height;

  // Only draw flows between nodes that are on screen and owned.
  const flows: EnergyFlow[] = [];
  if (showAll) {
    if (energyProfile.hasSolar)
      flows.push({
        id: "solar-home",
        from: "solar",
        to: "home",
        kw: solarKw,
        color: semantic.solar,
        bend: 0.1,
      });
    flows.push({
      id: "grid-home",
      from: "grid",
      to: "home",
      kw: gridKw,
      reverse: exporting,
      color: gridColor,
      bend: -0.15,
    });
    if (energyProfile.hasSolar && energyProfile.hasBattery)
      flows.push({
        id: "solar-battery",
        from: "solar",
        to: "battery",
        kw: 0, // no battery meter yet: faint line only
        color: semantic.positive,
        bend: -0.2,
      });
  }
  if (energyProfile.hasEv)
    flows.push({
      id: "home-ev",
      from: "home",
      to: "ev",
      kw: evKw,
      color: semantic.ev,
      bend: 0.2,
    });

  const gradient: [string, string] = isDark
    ? [shade.nightBg, "#0E0F11"]
    : [shade.dayRaised, shade.dayBg];
  // soft studio-light glow behind the house (neutral, not coloured)
  const glowColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(23,26,32,0.07)";

  const webGlow =
    Platform.OS === "web"
      ? ({
          backgroundImage: `radial-gradient(ellipse 60% 50% at 50% 62%, ${glowColor}, transparent 70%)`,
        } as unknown as ViewStyle)
      : null;

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={styles.outer}
    >
      <LinearGradient
        colors={gradient}
        style={[
          styles.hero,
          { height: heroH },
          wide && { borderRadius: radius.lg },
        ]}
      >
        {/* faint koi glow behind the house */}
        {webGlow ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, webGlow]}
          />
        ) : (
          <LinearGradient
            pointerEvents="none"
            colors={["transparent", glowColor, "transparent"]}
            start={{ x: 0.5, y: 0.2 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* top-right Home / EV toggle */}
        <View style={styles.toggle}>
          <GlassSegmented
            options={[
              { key: "Home", label: "Home" },
              { key: "EV", label: "EV" },
            ]}
            value={mode}
            onChange={setMode}
          />
        </View>

        {/* artwork + pills share one "stage" so anchors line up */}
        {width > 0 ? (
          <Animated.View style={[styles.stage, stageStyle, stageAnimStyle]}>
            <Image
              source={HERO_IMAGE}
              contentFit="contain"
              style={StyleSheet.absoluteFill}
              accessibilityLabel="Your home with solar panels and an electric car charging"
            />

            <EnergyFlows width={stageWpx} height={stageHpx} flows={flows} />

            {showAll ? (
              <>
                {energyProfile.hasSolar ? (
                  <AtAnchor node="solar">
                    <GlassPill
                      icon="sun"
                      label="Solar"
                      value={`~${solarKw.toFixed(1)} kW`}
                      accent={semantic.solar}
                    />
                  </AtAnchor>
                ) : (
                  <AtAnchor node="solar">
                    <GlassPill
                      ghost
                      icon="plus"
                      label="Add solar"
                      onPress={() => setEnergyProfile({ hasSolar: true })}
                      accessibilityLabel="Add solar panels to your home"
                    />
                  </AtAnchor>
                )}

                <AtAnchor node="grid">
                  <GlassPill
                    icon="zap"
                    label="Grid"
                    value={`${gridKw.toFixed(1)} kW${exporting ? " export" : ""}`}
                    accent={semantic.grid}
                  />
                </AtAnchor>

                {energyProfile.hasBattery ? (
                  <AtAnchor node="battery">
                    <GlassPill
                      icon="battery-charging"
                      label="Battery"
                      accent={semantic.positive}
                    />
                  </AtAnchor>
                ) : null}
              </>
            ) : null}

            <AtAnchor node="home">
              <GlassPill
                icon="home"
                label="Home"
                value={`${homeKw.toFixed(1)} kW`}
                accent={colors.foreground}
              />
            </AtAnchor>

            {energyProfile.hasEv ? (
              <AtAnchor node="ev">
                <GlassPill
                  icon="truck"
                  label="EV"
                  value={
                    evCharging ? `${evKw.toFixed(1)} kW charging` : "not charging"
                  }
                  accent={semantic.ev}
                />
              </AtAnchor>
            ) : null}
          </Animated.View>
        ) : null}
      </LinearGradient>

      {/* bottom summary card, overlapping the hero */}
      <View style={styles.cardWrap}>
        <Glass variant="regular" radius={radius.lg} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={{ flexShrink: 1 }}>
              <Text
                style={[styles.bigNumber, { color: colors.foreground }]}
                accessibilityLabel={`${bigNumber.toFixed(1)} ${bigLabel}`}
              >
                {bigNumber.toFixed(1)}
              </Text>
              <Text style={[styles.bigLabel, { color: colors.mutedForeground }]}>
                {bigLabel}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/recommendations")}
              accessibilityRole="button"
              accessibilityLabel={`£${moneySaved.toFixed(0)} saved this month. View tips`}
              style={styles.saved}
            >
              <Text style={[styles.savedAmount, { color: colors.foreground }]}>
                £{moneySaved.toFixed(0)}
              </Text>
              <Text style={[styles.savedLabel, { color: colors.mutedForeground }]}>
                saved this month
              </Text>
              <View style={styles.tipsRow}>
                <Text style={[styles.tips, { color: colors.primary }]}>Tips</Text>
                <Ionicons name="chevron-forward" size={12} color={colors.primary} />
              </View>
            </Pressable>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: mode === "Home" ? rate.dot : brand.accent },
              ]}
            />
            <Text
              style={[styles.status, { color: colors.foreground }]}
              numberOfLines={2}
            >
              {statusText}
            </Text>
            {mode === "EV" ? (
              <Pressable
                onPress={() => router.push("/schedule")}
                accessibilityRole="button"
                accessibilityLabel="Open EV charging schedule"
              >
                <Text style={[styles.tips, { color: colors.primary }]}>
                  Schedule
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Glass>

        <Text style={[styles.caption, { color: colors.mutedForeground }]}>
          {isSampleData
            ? "Sample data — live meter unavailable"
            : "Updated from your Octopus meters"}
          {energyProfile.hasSolar ? " · Solar power is an estimate" : ""}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: "100%" },
  hero: {
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
  },
  toggle: {
    position: "absolute",
    top: space[3],
    right: space[4],
    zIndex: 5,
  },
  stage: {
    position: "absolute",
    top: TOP_RESERVED,
    alignSelf: "center",
  },
  anchor: {
    position: "absolute",
    width: 220,
    marginLeft: -110,
    height: 40,
    marginTop: -20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrap: {
    marginTop: -CARD_OVERLAP,
    paddingHorizontal: space[4],
  },
  card: {
    padding: space[5],
    gap: space[3],
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: space[4],
  },
  bigNumber: {
    fontFamily: fonts.display,
    letterSpacing: -1.5,
    fontSize: 56,
    lineHeight: 60,
  },
  bigLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  saved: { alignItems: "flex-end", paddingBottom: 4 },
  savedAmount: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 28,
  },
  savedLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  tipsRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  tips: { fontFamily: fonts.bodySemiBold, fontSize: 12, lineHeight: 16 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space[2],
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  status: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: space[2],
    paddingHorizontal: space[1],
  },
});

export default EnergyHouseHero;
