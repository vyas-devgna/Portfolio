import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C } from '../theme';

// Dark drawing-sheet background: drifting grid, two slow ribbon-coloured glows and a vignette.
export const Backdrop: React.FC<{ glow?: number }> = ({ glow = 1 }) => {
  const f = useCurrentFrame();
  const g = 64;
  const off = (f * 0.35) % g;
  const x1 = 30 + Math.sin(f / 140) * 12, y1 = 30 + Math.cos(f / 170) * 10;
  const x2 = 72 + Math.cos(f / 160) * 10, y2 = 70 + Math.sin(f / 120) * 10;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(rgba(95,227,210,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(95,227,210,.07) 1px, transparent 1px)`,
        backgroundSize: `${g}px ${g}px`, backgroundPosition: `${off}px ${off}px`,
      }} />
      <AbsoluteFill style={{ opacity: 0.55 * glow, background: `radial-gradient(40% 45% at ${x1}% ${y1}%, rgba(10,196,231,.28), transparent 70%), radial-gradient(38% 42% at ${x2}% ${y2}%, rgba(173,249,69,.18), transparent 70%)` }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)' }} />
    </AbsoluteFill>
  );
};
