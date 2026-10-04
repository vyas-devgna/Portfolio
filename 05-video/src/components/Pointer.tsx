import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { easeInOut, prog } from '../anim';

// Animated mouse pointer following keyframes [{f, x, y}], with click ripples at `clicks` frames.
export const Pointer: React.FC<{ keys: { f: number; x: number; y: number }[]; clicks?: number[]; appear?: number; hand?: boolean }> = ({ keys, clicks = [], appear = 0, hand = false }) => {
  const f = useCurrentFrame();
  const fs = keys.map((k) => k.f);
  const x = interpolate(f, fs, keys.map((k) => k.x), { easing: easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(f, fs, keys.map((k) => k.y), { easing: easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const o = prog(f, appear, appear + 10);
  const press = clicks.some((c) => f >= c && f < c + 6) ? 0.85 : 1;
  return (
    <>
      {clicks.map((c) => {
        const p = prog(f, c, c + 22);
        if (f < c || f > c + 22) return null;
        return <div key={c} style={{ position: 'absolute', left: x - 40 * p, top: y - 40 * p, width: 80 * p, height: 80 * p, borderRadius: '50%', border: `3px solid rgba(68,228,213,${1 - p})`, background: `rgba(68,228,213,${0.25 * (1 - p)})` }} />;
      })}
      <svg width="40" height="40" viewBox="0 0 24 24" style={{ position: 'absolute', left: x - 6, top: y - 3, opacity: o, transform: `scale(${press})`, transformOrigin: '6px 3px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.45))' }}>
        {hand ? <circle cx="12" cy="12" r="9" fill="rgba(255,255,255,.9)" stroke="#061015" strokeWidth="1.5" /> : <path d="M5 2.5v17.2l4.6-4.3 3 6.6 3-1.4-3-6.4h6.2L5 2.5Z" fill="#fff" stroke="#061015" strokeWidth="1.4" strokeLinejoin="round" />}
      </svg>
    </>
  );
};
