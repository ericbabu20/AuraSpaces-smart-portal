import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@/context/ThemeContext";
import { radius as radiusTokens, shade } from "@/theme/tokens";

export type GlassVariant = "regular" | "clear";

export type GlassProps = {
  variant?: GlassVariant;
  /** Optional colour wash over the glass (e.g. a brand tint at low alpha). */
  tint?: string;
  radius?: number;
  /** Force a light/dark look (e.g. glass on a dark card in light mode). */
  scheme?: "light" | "dark";
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * True when the user asked the OS to reduce transparency.
 * iOS: AccessibilityInfo. Web: prefers-reduced-transparency media query.
 * Android has no such setting, so it stays false.
 */
export function useReduceTransparency(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios") {
      let mounted = true;
      AccessibilityInfo.isReduceTransparencyEnabled().then((v) => {
        if (mounted) setReduced(v);
      });
      const sub = AccessibilityInfo.addEventListener(
        "reduceTransparencyChanged",
        setReduced,
      );
      return () => {
        mounted = false;
        sub.remove();
      };
    }

    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
    ) {
      const mq = window.matchMedia("(prefers-reduced-transparency: reduce)");
      setReduced(mq.matches);
      const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    }

    return undefined;
  }, []);

  return reduced;
}

/**
 * Cross-platform "glass" surface for controls and chrome (pills, toggles,
 * floating bars, overlay cards). Not for large content areas.
 *
 *  - iOS 26+      : native Liquid Glass (`GlassView`)
 *  - iOS < 26 and Android : `BlurView` + hairline + top-left highlight
 *  - Web          : CSS backdrop-filter
 *  - Reduce Transparency  : solid cream / ink surface
 *
 * IMPORTANT: never animate `opacity` on a Glass or on any of its parents
 * (it breaks the native glass effect). Animate `transform` instead.
 */
export function Glass({
  variant = "regular",
  tint,
  radius = radiusTokens.md,
  scheme,
  style,
  children,
}: GlassProps) {
  const theme = useTheme();
  const isDark = scheme ? scheme === "dark" : theme.isDark;
  const reduceTransparency = useReduceTransparency();
  const isClear = variant === "clear";
  const hairline = isDark ? "rgba(255,255,255,0.12)" : "rgba(43,43,39,0.08)";

  const baseStyle: ViewStyle = {
    borderRadius: radius,
    overflow: "hidden",
  };

  // 1) Accessibility fallback: solid surface, no transparency.
  if (reduceTransparency) {
    return (
      <View
        style={[
          baseStyle,
          {
            backgroundColor: isDark ? shade.nightFill : shade.raised,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: isDark ? shade.nightSeparator : shade.separator,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // 2) iOS 26+ native Liquid Glass.
  if (Platform.OS === "ios" && isLiquidGlassAvailable()) {
    return (
      <GlassView
        glassEffectStyle={variant}
        tintColor={tint}
        colorScheme={isDark ? "dark" : "light"}
        style={[baseStyle, style]}
      >
        {children}
      </GlassView>
    );
  }

  // 3) Web: CSS backdrop-filter.
  if (Platform.OS === "web") {
    const fill = isDark
      ? isClear
        ? "rgba(255,255,255,0.05)"
        : "rgba(31,30,27,0.6)"
      : isClear
        ? "rgba(255,255,255,0.35)"
        : "rgba(255,253,248,0.74)";
    const webStyle = {
      backdropFilter: isClear
        ? "blur(12px) saturate(160%)"
        : "blur(24px) saturate(180%)",
      WebkitBackdropFilter: isClear
        ? "blur(12px) saturate(160%)"
        : "blur(24px) saturate(180%)",
      backgroundColor: fill,
      borderWidth: 1,
      borderColor: hairline,
      boxShadow: isDark
        ? "0 8px 28px rgba(0,0,0,0.5)"
        : "0 6px 24px rgba(43,43,39,0.08)",
    } as unknown as ViewStyle;

    return (
      <View style={[baseStyle, webStyle, style]}>
        {tint ? (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: tint }]}
          />
        ) : null}
        <Highlight />
        {children}
      </View>
    );
  }

  // 4) Android / older iOS: blur + hairline + highlight.
  return (
    <BlurView
      intensity={isClear ? 24 : 40}
      tint={isDark ? "dark" : "light"}
      experimentalBlurMethod="dimezisBlurView"
      style={[
        baseStyle,
        {
          borderWidth: 1,
          borderColor: hairline,
        },
        style,
      ]}
    >
      {tint ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: tint }]}
        />
      ) : null}
      <Highlight />
      {children}
    </BlurView>
  );
}

/** Soft white sheen from the top-left corner (fake light source). */
function Highlight() {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.6, y: 0.6 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

export default Glass;
