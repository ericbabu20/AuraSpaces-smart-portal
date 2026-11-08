import { DeviceMotion } from "expo-sensors";
import { useEffect } from "react";
import { Platform } from "react-native";
import {
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

/** Max sideways / vertical shift in pixels. */
const MAX_SHIFT = 6;

/**
 * Subtle tilt parallax from the phone's motion sensors.
 * Native only. Does nothing on web or when Reduce Motion is on.
 * Returns shared values to use in a `transform` (never opacity).
 */
export function useHeroParallax() {
  const reducedMotion = useReducedMotion();
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS === "web" || reducedMotion) {
      x.value = 0;
      y.value = 0;
      return;
    }

    let cancelled = false;
    let subscription: { remove: () => void } | null = null;

    (async () => {
      try {
        if (!(await DeviceMotion.isAvailableAsync()) || cancelled) return;
        DeviceMotion.setUpdateInterval(50);
        subscription = DeviceMotion.addListener(({ rotation }) => {
          if (!rotation) return;
          // gamma: left/right tilt, beta: forward/back tilt (radians).
          // Subtract ~45deg so a normal reading angle is "neutral".
          const gx = Math.max(-0.5, Math.min(0.5, rotation.gamma));
          const by = Math.max(-0.5, Math.min(0.5, rotation.beta - 0.8));
          x.value = withSpring(-(gx / 0.5) * MAX_SHIFT, { damping: 20 });
          y.value = withSpring(-(by / 0.5) * MAX_SHIFT, { damping: 20 });
        });
      } catch {
        // Sensor unavailable: simply no parallax.
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [reducedMotion, x, y]);

  return { x, y };
}
