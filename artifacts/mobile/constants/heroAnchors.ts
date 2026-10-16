/**
 * Where each energy node sits on the house hero image.
 * Coordinates are normalised (0-1) inside the image "stage", so pills and
 * (Phase 3) animated flow lines stay locked to the artwork at any size.
 * This is the ONE place to tweak positions.
 */
export type HeroNode = "solar" | "grid" | "home" | "battery" | "ev";

export const HERO_ANCHORS: Record<HeroNode, { x: number; y: number }> = {
  solar: { x: 0.42, y: 0.22 },
  grid: { x: 0.11, y: 0.47 },
  home: { x: 0.4, y: 0.54 },
  battery: { x: 0.76, y: 0.5 },
  ev: { x: 0.76, y: 0.83 },
};

/** Width / height of assets/hero/house-hero.png (928 x 963). */
export const HERO_ASPECT = 928 / 963;
