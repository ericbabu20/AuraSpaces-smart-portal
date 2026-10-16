import { Platform, useWindowDimensions } from "react-native";

/** Widescreen desktop shell kicks in on web at this width. */
export const WIDE_BREAKPOINT = 1100;

/**
 * True when we should show the desktop dashboard chrome (left sidebar,
 * multi-column home). Mobile / narrow web keep the existing phone UX.
 */
export function useIsWideLayout() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= WIDE_BREAKPOINT;
}
