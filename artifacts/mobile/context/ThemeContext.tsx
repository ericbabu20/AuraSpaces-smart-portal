import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

const STORAGE_KEY = "aura_theme_preference";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  /** Resolved scheme actually used for colors */
  colorScheme: "light" | "dark";
  /** User preference (system follows device) */
  preference: ThemePreference;
  /** Convenience: true when resolved scheme is dark */
  isDark: boolean;
  setPreference: (next: ThemePreference) => void;
  /** Profile toggle: on = dark, off = light */
  setDarkMode: (enabled: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark" || stored === "system") {
          setPreferenceState(stored);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const setDarkMode = useCallback(
    (enabled: boolean) => {
      setPreference(enabled ? "dark" : "light");
    },
    [setPreference],
  );

  const colorScheme: "light" | "dark" = useMemo(() => {
    if (preference === "light") return "light";
    if (preference === "dark") return "dark";
    return systemScheme === "dark" ? "dark" : "light";
  }, [preference, systemScheme]);

  const value = useMemo(
    () => ({
      colorScheme,
      preference,
      isDark: colorScheme === "dark",
      setPreference,
      setDarkMode,
    }),
    [colorScheme, preference, setPreference, setDarkMode],
  );

  // Avoid a flash of wrong theme before AsyncStorage loads
  if (!ready) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
