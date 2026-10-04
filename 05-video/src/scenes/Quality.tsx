import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { prog, sceneFade } from '../anim';
import { Backdrop } from '../components/Backdrop';
import { Chapter, Sub, Title } from '../components/Text';
import { C, F } from '../theme';

// Google Lighthouse scores for the new home page on mobile (measured in local tests).
const SCORES = [
  { label: 'Speed on phones', value: 98, before: 69 },
  { label: 'Accessibility', value: 100 },
  { label: 'Best practices', value: 100 },
  { label: 'Search engines', value: 100 },
];
const BADGES = [
  { icon: 'M10 14 21 3M21 3h-6M21 3v6M14 21H5a2 2 0 0 1-2-2v-9', title: 'Every old link still works', sub: 'Bookmarks and shared links redirect' },
  { icon: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z', title: 'Security protections on', sub: 'Modern browser safeguards' },
  { icon: 'M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Zm4 0h8', title: 'No tracking cookies', sub: 'Visitors are not followed around' },
];

const Gauge: React.FC<{ value: number; before?: number; label: string; p: number }> = ({ value, before, label, p }) => {
  const R = 110, L = 2 * Math.PI * R;
  const shown = Math.round(value * p);
  return (
    <div style={{ width: 300, textAlign: 'center' }}>
      <svg width="280" height="280" viewBox="-140 -140 280 280">
        <circle r={R} fill="none" stroke="#163039" strokeWidth="18" />
        {before !== undefined && <circle r={R} fill="none" stroke="#ff8a7a" strokeOpacity=".55" strokeWidth="18" strokeDasharray={`${(L * before) / 100} ${L}`} transform="rotate(-90)" />}
        <circle r={R} fill="none" stroke="url(#gg)" strokeWidth="18" strokeLinecap="round" strokeDasharray={`${(L * value * p) / 100} ${L}`} transform="rotate(-90)" />
        <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="#0ac4e7" /><stop offset="1" stopColor="#adf945" /></linearGradient></defs>
        <text y="22" textAnchor="middle" style={{ font: `800 78px ${F.display}`, fontStretch: '118%', fill: C.ink, fontVariantNumeric: 'tabular-nums' }}>{shown}</text>
      </svg>
      <div style={{ font: `600 28px ${F.body}`, color: C.ink, marginTop: 6 }}>{label}</div>
      {before !== undefined && <div style={{ font: `500 20px ${F.mono}`, color: '#ff8a7a', marginTop: 4 }}>was {before}</div>}
    </div>
  );
};

// 98–110 s: scores fill up, then three plain-English guarantees.
export const Quality: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <Backdrop />
      <AbsoluteFill style={{ left: 160, top: 80, width: 1600 }}>
        <Chapter n="08" label="Under the hood" />
        <Title text="Fast, safe and easy for Google to read." at={14} size={60} style={{ marginTop: 18 }} />
        <Sub text="Google Lighthouse scores for the new home page on a phone, out of 100." at={30} size={26} style={{ marginTop: 10 }} />
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 160, top: 360, width: 1600, display: 'flex', justifyContent: 'space-between' }}>
        {SCORES.map((s, i) => <Gauge key={s.label} {...s} p={prog(f, 40 + i * 12, 110 + i * 12)} />)}
      </div>
      <div style={{ position: 'absolute', left: 160, top: 820, width: 1600, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {BADGES.map((b, i) => {
          const p = prog(f, 170 + i * 20, 192 + i * 20);
          return (
            <div key={b.title} style={{ display: 'flex', gap: 18, alignItems: 'center', padding: '20px 24px', borderRadius: 12, background: 'rgba(13,28,34,.9)', border: `1px solid ${C.line}`, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={b.icon} /></svg>
              <div><div style={{ font: `600 26px ${F.body}`, color: C.ink }}>{b.title}</div><div style={{ font: `400 20px ${F.body}`, color: C.muted }}>{b.sub}</div></div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
