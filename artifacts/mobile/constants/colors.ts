/**
 * Aura Spaces colour palettes, built from theme/tokens.ts.
 * Structured like Apple's semantic colours: a warm grouped background,
 * white (or raised charcoal) cards, label / secondary label, separators.
 * Koi is the single accent. Red (`destructive`) is for warnings only.
 */
import { brand, radius as radiusTokens, semantic, shade } from "@/theme/tokens";

const colors = {
  light: {
    text: shade.ink,
    tint: brand.koiDeep,
    background: shade.canvas,
    foreground: shade.ink,
    card: shade.raised,
    cardForeground: shade.ink,
    primary: brand.koiDeep,
    primaryForeground: shade.white,
    secondary: shade.fill,
    secondaryForeground: shade.ink,
    muted: shade.fill,
    mutedForeground: brand.duckWillow,
    accent: brand.koi,
    accentForeground: shade.white,
    destructive: semantic.warning,
    destructiveForeground: shade.white,
    border: shade.separator,
    input: shade.fill,
  },
  dark: {
    text: shade.nightInk,
    tint: brand.koi,
    background: shade.nightBg,
    foreground: shade.nightInk,
    card: shade.nightRaised,
    cardForeground: shade.nightInk,
    primary: brand.koi,
    primaryForeground: shade.white,
    secondary: shade.nightFill,
    secondaryForeground: shade.nightInk,
    muted: shade.nightFill,
    mutedForeground: shade.nightMuted,
    accent: brand.koi,
    accentForeground: shade.white,
    destructive: "#FF6B6B",
    destructiveForeground: shade.white,
    border: shade.nightSeparator,
    input: shade.nightFill,
  },
  radius: radiusTokens.md,
};

export default colors;
