/**
 * Aura Spaces design tokens (single source of truth) - Tesla-inspired look.
 *
 * Neutral carbon / paper surfaces, ONE accent (Tesla blue), flat cards,
 * small radii, Inter type. Red is reserved for genuine warnings only.
 * Change a value here and the whole app follows.
 */

export const brand = {
  carbon: "#171A20", // primary text on light, panels on dark
  paper: "#F4F4F4", // light-mode surface
  accent: "#3E6AE1", // the one action colour
  gasTone: "#8A94A6", // gas
  positive: "#3DA35D", // good / saving / online
} as const;

/** Background and text shades for light + dark mode. */
export const shade = {
  textDark: "#171A20", // body text on light
  nightBg: "#000000", // dark-mode background
  nightRaised: "#131416", // dark-mode cards
  nightOverlay: "#1C1E21", // dark-mode secondary surfaces
  dayBg: "#F4F4F4", // light-mode background
  dayRaised: "#FFFFFF", // light-mode cards
  white: "#FFFFFF",
} as const;

/** What each energy source looks like everywhere in the app. */
export const semantic = {
  solar: "#E0A82E", // warm amber
  grid: "rgba(92, 94, 98, 0.7)", // neutral grey
  ev: brand.accent,
  gas: brand.gasTone,
  positive: brand.positive,
  /** ONLY for genuine warnings / errors. Never decorative. */
  warning: "#E31937",
} as const;

/** Small, crisp corners (Tesla UI is flat and tight). */
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

/** 4-pt spacing grid. */
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Font family names (loaded with expo-font in app/_layout.tsx). */
export const fonts = {
  display: "Inter_500Medium",
  heading: "Inter_600SemiBold",
  headingBold: "Inter_700Bold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
} as const;

/** Type scale. */
export const type = {
  display: { fontSize: 56, lineHeight: 60, fontFamily: fonts.display },
  h1: { fontSize: 32, lineHeight: 38, fontFamily: fonts.headingBold },
  h2: { fontSize: 24, lineHeight: 30, fontFamily: fonts.heading },
  h3: { fontSize: 18, lineHeight: 24, fontFamily: fonts.heading },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fonts.body },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontFamily: fonts.bodySemiBold },
  small: { fontSize: 14, lineHeight: 20, fontFamily: fonts.body },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.bodyMedium },
} as const;

export type EnergySource = "solar" | "grid" | "home" | "ev" | "battery" | "gas";
