/**
 * Aura Spaces colour palettes, built from theme/tokens.ts (Tesla-inspired).
 * - light: clean white / light-grey "normal" mode
 * - dark:  true-black night mode
 * Blue is the single accent. Red (`destructive`) is for warnings only.
 */
import { brand, radius as radiusTokens, semantic, shade } from "@/theme/tokens";

const colors = {
  light: {
    text: shade.textDark,
    tint: brand.accent,
    background: shade.dayBg,
    foreground: shade.textDark,
    card: shade.dayRaised,
    cardForeground: shade.textDark,
    primary: brand.accent,
    primaryForeground: shade.white,
    secondary: "#EAEAEA",
    secondaryForeground: shade.textDark,
    muted: "#EAEAEA",
    mutedForeground: "#5C5E62",
    accent: brand.accent,
    accentForeground: shade.white,
    destructive: semantic.warning,
    destructiveForeground: shade.white,
    border: "#DCDDDE",
    input: "#EAEAEA",
  },
  dark: {
    text: "#F2F2F2",
    tint: brand.accent,
    background: shade.nightBg,
    foreground: "#F2F2F2",
    card: shade.nightRaised,
    cardForeground: "#F2F2F2",
    primary: brand.accent,
    primaryForeground: shade.white,
    secondary: shade.nightOverlay,
    secondaryForeground: "#F2F2F2",
    muted: shade.nightOverlay,
    mutedForeground: "#8E9094",
    accent: brand.accent,
    accentForeground: shade.white,
    destructive: "#FF4D5E",
    destructiveForeground: shade.white,
    border: "#2A2C2F",
    input: shade.nightOverlay,
  },
  radius: radiusTokens.sm,
};

export default colors;
