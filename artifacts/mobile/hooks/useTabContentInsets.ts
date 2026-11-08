import { useIsWideLayout } from "@/hooks/useIsWideLayout";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Shared padding for tab screens — tighter on the widescreen shell. */
export function useTabContentInsets() {
  const insets = useSafeAreaInsets();
  const isWide = useIsWideLayout();

  if (isWide) {
    return { paddingTop: 28, paddingBottom: 32, paddingHorizontal: 28 };
  }

  return {
    paddingTop: Platform.OS === "web" ? 67 : insets.top + 8,
    paddingBottom:
      Platform.OS === "web"
        ? 120
        : insets.bottom + 100,
    paddingHorizontal: 0,
  };
}
