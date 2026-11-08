import colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

/**
 * Returns design tokens for the active theme (user preference or system).
 */
export function useColors() {
  const { colorScheme } = useTheme();
  const palette = colorScheme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius, colorScheme };
}
