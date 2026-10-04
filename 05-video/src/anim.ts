import { Easing, interpolate, spring } from 'remotion';

export const ease = Easing.bezier(0.22, 0.8, 0.2, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

// 0..1 between two frames, eased and clamped
export const prog = (f: number, a: number, b: number, e = ease) =>
  interpolate(f, [a, b], [0, 1], { easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

export const sp = (f: number, fps: number, delay = 0, damping = 16, stiffness = 90, mass = 1) =>
  spring({ frame: f - delay, fps, config: { damping, stiffness, mass } });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// fade in at the start and out at the end of a scene
export const sceneFade = (f: number, dur: number, inLen = 12, outLen = 14) =>
  Math.min(prog(f, 0, inLen, Easing.linear), 1 - prog(f, dur - outLen, dur, Easing.linear));
