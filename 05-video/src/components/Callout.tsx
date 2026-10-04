import React from 'react';
import { useCurrentFrame } from 'remotion';
import { prog } from '../anim';
import { C, F } from '../theme';

// Highlights a rectangle (screen px) with a drawing-style frame and a label tag.
export const Callout: React.FC<{ x: number; y: number; w: number; h: number; label: string; at: number; until?: number; side?: 'top' | 'bottom' | 'right' | 'left' }> = ({ x, y, w, h, label, at, until = 9999, side = 'bottom' }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 16);
  const o = Math.min(p, 1 - prog(f, until, until + 10));
  if (o <= 0) return null;
  const pad = 10;
  const tag: React.CSSProperties = { position: 'absolute', whiteSpace: 'nowrap', font: `600 24px ${F.body}`, color: C.night, background: C.lime, padding: '8px 16px', borderRadius: 6, boxShadow: '0 12px 30px -10px rgba(0,0,0,.6)', transform: `scale(${0.8 + 0.2 * p})` };
  const pos: Record<string, React.CSSProperties> = {
    bottom: { left: 0, top: h + pad * 2 + 12, transformOrigin: 'top left' },
    top: { left: 0, bottom: h + pad * 2 + 12, transformOrigin: 'bottom left' },
    right: { left: w + pad * 2 + 16, top: 0, transformOrigin: 'left top' },
    left: { right: w + pad * 2 + 16, top: 0, transformOrigin: 'right top' },
  };
  return (
    <div style={{ position: 'absolute', left: x - pad, top: y - pad, width: w + pad * 2, height: h + pad * 2, opacity: o }}>
      <div style={{ position: 'absolute', inset: 0, border: `3px solid ${C.teal}`, borderRadius: 8, boxShadow: `0 0 0 6px rgba(68,228,213,.18), 0 0 40px rgba(68,228,213,.35)`, clipPath: `inset(0 ${100 - p * 100}% 0 0)` }} />
      <div style={{ ...tag, ...pos[side] }}>{label}</div>
    </div>
  );
};
