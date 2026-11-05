/**
 * Aura Spaces design tokens (single source of truth).
 *
 * Colours come from the Aura Spaces brand guideline (2025): Japanese Koi is
 * the one action colour; Duck Willow, Coffee with Cream, Chanoyu and Venus
 * Teal carry surfaces, secondary text and data. Layout, radii and the type
 * scale follow Apple's Human Interface Guidelines.
 * Red is reserved for genuine warnings only.
 *
 * Contrast (WCAG):
 *  - ink #2B2B27 on canvas #F5F2EA            12.7:1
 *  - Duck Willow #696A5A on canvas / white     4.9:1 / 5.5:1
 *  - koiDeep #B85C28 on white, and white on it 4.6:1 (light-mode primary)
 *  - koi #D97A43 fill with white bold label     3.1:1 (bold/large only)
 *  - nightInk #F3EFE6 on nightRaised #1F1E1B   14.4:1
 *  - koi #D97A43 on nightRaised                 5.4:1
 */

export const brand = {
  koi: "#D97A43", // Japanese Koi: accent / primary action
  koiDeep: "#B85C28", // koi deepened to pass AA as text/fill on light
  koiBright: "#E08550", // koi tuned for text on dark surfaces
  duckWillow: "#696A5A", // primary brand neutral
  coffee: "#A88864", // Coffee with Cream
  chanoyu: "#EEE7D2", // warm cream
  venusTeal: "#87A39F",
  positive: "#3E9B63", // good / saving / online
} as const;

/** Background and text shades for light + dark mode. */
export const shade = {
  ink: "#2B2B27", // primary text on light (matches the wordmark)
  canvas: "#F5F2EA", // light grouped background (Chanoyu, lifted)
  raised: "#FFFFFF", // light cards / grouped rows
  fill: "#ECE7DA", // light secondary fill (controls, inputs)
  separator: "#DDD7C8",
  nightBg: "#141412",
  nightRaised: "#1F1E1B",
  nightFill: "#2A2925",
  nightSeparator: "#34332E",
  nightInk: "#F3EFE6",
  nightMuted: "#A8A796",
  white: "#FFFFFF",
} as const;

/** What each energy source looks like everywhere in the app. */
export const semantic = {
  solar: brand.coffee,
  grid: "rgba(105, 106, 90, 0.75)", // Duck Willow
  ev: "#5F807B", // deep Venus Teal
  gas: brand.venusTeal,
  positive: brand.positive,
  /** ONLY for genuine warnings / errors. Never decorative. */
  warning: "#D4363C",
} as const;

/** Device / activity categories, drawn from the brand palette. */
export const category = {
  climate: brand.venusTeal,
  lighting: brand.coffee,
  appliance: brand.duckWillow,
  ev: semantic.ev,
  security: brand.koi,
  automation: "#8C7A9B",
  other: "#8E8C80",
} as const;

/** Apple-style continuous corners. */
export const radius = {
  sm: 10,
  md: 14,
  lg: 22,
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

/**
 * Brand typefaces (loaded with expo-font in app/_layout.tsx).
 * Parkinsans for display and titles only; Figtree for everything people read
 * and tap.
 */
export const fonts = {
  display: "Parkinsans_600SemiBold",
  heading: "Parkinsans_600SemiBold",
  headingBold: "Parkinsans_700Bold",
  body: "Figtree_400Regular",
  bodyMedium: "Figtree_500Medium",
  bodySemiBold: "Figtree_600SemiBold",
  bodyBold: "Figtree_700Bold",
} as const;

/** Type scale, sized like Apple's iOS text styles (body 17). */
export const type = {
  display: { fontSize: 56, lineHeight: 60, fontFamily: fonts.display },
  largeTitle: { fontSize: 34, lineHeight: 41, fontFamily: fonts.headingBold },
  h1: { fontSize: 28, lineHeight: 34, fontFamily: fonts.headingBold },
  h2: { fontSize: 22, lineHeight: 28, fontFamily: fonts.heading },
  h3: { fontSize: 20, lineHeight: 25, fontFamily: fonts.heading },
  headline: { fontSize: 17, lineHeight: 22, fontFamily: fonts.bodySemiBold },
  body: { fontSize: 17, lineHeight: 22, fontFamily: fonts.body },
  bodyStrong: { fontSize: 17, lineHeight: 22, fontFamily: fonts.bodySemiBold },
  callout: { fontSize: 16, lineHeight: 21, fontFamily: fonts.body },
  small: { fontSize: 15, lineHeight: 20, fontFamily: fonts.body },
  footnote: { fontSize: 13, lineHeight: 18, fontFamily: fonts.body },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.bodyMedium },
} as const;

export type EnergySource = "solar" | "grid" | "home" | "ev" | "battery" | "gas";
