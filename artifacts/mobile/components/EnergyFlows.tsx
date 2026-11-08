import React, { useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { HERO_ANCHORS, type HeroNode } from "@/constants/heroAnchors";

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** One dot + gap. The dash offset travels exactly this far per loop. */
const DASH = 1;
const GAP = 13;
const PERIOD = DASH + GAP;
const MIN_ACTIVE_KW = 0.05;

export type EnergyFlow = {
  id: string;
  from: HeroNode;
  to: HeroNode;
  /** Power moving along this path. ~0 means "inactive": faint line only. */
  kw: number;
  /** True when energy moves `to` -> `from` (export, battery discharge). */
  reverse?: boolean;
  color: string;
  /** Sideways bend of the curve, as a fraction of the path length. */
  bend?: number;
};

type Props = {
  width: number;
  height: number;
  flows: EnergyFlow[];
};

/** Pixels per second the dots travel at, proportional to kW (clamped). */
function speedForKw(kw: number) {
  const clamped = Math.min(Math.max(kw, 0.3), 8);
  return 20 + clamped * 12;
}

/** Curved path between two normalised anchors, in stage pixels. */
function buildPath(
  from: HeroNode,
  to: HeroNode,
  w: number,
  h: number,
  bend: number,
) {
  const a = HERO_ANCHORS[from];
  const b = HERO_ANCHORS[to];
  const x1 = a.x * w;
  const y1 = a.y * h;
  const x2 = b.x * w;
  const y2 = b.y * h;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // perpendicular to the line, scaled by path length
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function FlowPath({
  flow,
  width,
  height,
  reducedMotion,
}: {
  flow: EnergyFlow;
  width: number;
  height: number;
  reducedMotion: boolean;
}) {
  const active = flow.kw >= MIN_ACTIVE_KW;
  const d = useMemo(
    () => buildPath(flow.from, flow.to, width, height, flow.bend ?? 0.15),
    [flow.from, flow.to, flow.bend, width, height],
  );

  // progress 0 -> 1 on a loop; runs entirely on the UI thread
  const progress = useSharedValue(0);
  // 0 = inactive (faint), 1 = active (bright dots)
  const intensity = useSharedValue(active ? 1 : 0);
  const direction = flow.reverse ? 1 : -1;

  useEffect(() => {
    intensity.value = withTiming(active ? 1 : 0, { duration: 400 });
  }, [active, intensity]);

  useEffect(() => {
    cancelAnimation(progress);
    progress.value = 0;
    if (!active || reducedMotion) return;
    const duration = (PERIOD / speedForKw(flow.kw)) * 1000;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [active, flow.kw, reducedMotion, progress]);

  const dotsProps = useAnimatedProps(() => ({
    strokeDashoffset: direction * progress.value * PERIOD,
    strokeOpacity: intensity.value * 0.95,
  }));

  return (
    <>
      {/* base line: always there, 20% */}
      <Path
        d={d}
        stroke={flow.color}
        strokeOpacity={0.2}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      {/* moving dots */}
      <AnimatedPath
        d={d}
        stroke={flow.color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${DASH} ${GAP}`}
        fill="none"
        animatedProps={dotsProps}
      />
    </>
  );
}

/**
 * Animated energy-flow lines drawn over the house hero.
 * Lives inside the hero "stage" so it shares the pills' coordinate space.
 */
export function EnergyFlows({ width, height, flows }: Props) {
  const reducedMotion = useReducedMotion();
  if (width <= 0 || height <= 0) return null;

  return (
    <Svg
      width={width}
      height={height}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      {flows.map((f) => (
        <FlowPath
          key={f.id}
          flow={f}
          width={width}
          height={height}
          reducedMotion={reducedMotion}
        />
      ))}
    </Svg>
  );
}

export default EnergyFlows;
