import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { prog, sp } from '../anim';
import { C, F, RIBBON } from '../theme';

// Chapter label: "02 · The new website"
export const Chapter: React.FC<{ n: string; label: string; at?: number; style?: React.CSSProperties }> = ({ n, label, at = 6, style }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 18);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, font: `500 22px ${F.mono}`, letterSpacing: '.16em', textTransform: 'uppercase', color: C.lime, opacity: p, transform: `translateX(${(1 - p) * -30}px)`, ...style }}>
      <span style={{ width: 46 * p, height: 3, background: RIBBON, display: 'inline-block' }} />
      <span>{n}</span><span style={{ color: C.muted }}>·</span><span style={{ color: C.ink }}>{label}</span>
    </div>
  );
};

// Headline whose words rise in one after another.
export const Title: React.FC<{ text: string; at?: number; size?: number; style?: React.CSSProperties; color?: string; out?: number }> = ({ text, at = 10, size = 76, style, color = C.ink, out }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const o = out !== undefined ? 1 - prog(f, out, out + 12) : 1;
  return (
    <h1 style={{ margin: 0, font: `750 ${size}px/1.04 ${F.display}`, fontStretch: '118%', letterSpacing: '-0.025em', color, opacity: o, ...style }}>
      {words.map((w, i) => {
        const s = sp(f, fps, at + i * 3, 18, 110);
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}>
            <span style={{ display: 'inline-block', transform: `translateY(${(1 - s) * 110}%)`, opacity: s }}>{w}&nbsp;</span>
          </span>
        );
      })}
    </h1>
  );
};

export const Sub: React.FC<{ text: string; at?: number; size?: number; style?: React.CSSProperties; out?: number }> = ({ text, at = 24, size = 30, style, out }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 20);
  const o = out !== undefined ? 1 - prog(f, out, out + 12) : 1;
  return <p style={{ margin: 0, font: `400 ${size}px/1.45 ${F.body}`, color: C.muted, opacity: p * o, transform: `translateY(${(1 - p) * 16}px)`, ...style }}>{text}</p>;
};
