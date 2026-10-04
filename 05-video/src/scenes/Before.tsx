import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { easeInOut, prog, sceneFade } from '../anim';
import { Backdrop } from '../components/Backdrop';
import { Chapter, Sub, Title } from '../components/Text';
import { C, F } from '../theme';

const ISSUES = [
  { icon: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 17-4.2-4.2', title: 'Search engines see just 2 pages', sub: 'Eight services, one address' },
  { icon: 'M3 6h18v12H3zM3 7l9 6 9-6', title: 'No enquiry form', sub: 'Only an email link to copy' },
  { icon: 'M12 21a9 9 0 1 1 9-9M12 12l5-5M17 21h4v-4', title: 'Slow on phones', sub: 'Speed score of 69 out of 100' },
];

// 8–20 s: the current site is one very long page (25,076 px, about 28 screens).
export const Before: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const stripW = 560;
  const stripH = (25076 * stripW) / 1440;
  const scroll = interpolate(f, [20, 300], [0, stripH - 1100], { easing: easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const screens = Math.round(28 * prog(f, 40, 200));
  const enter = prog(f, 0, 40);
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <Backdrop />
      {/* tilted endless page */}
      <AbsoluteFill style={{ perspective: 1400 }}>
        <div style={{ position: 'absolute', left: 170, top: -140, width: stripW, height: 1400, transform: `rotateX(${48 - 6 * enter}deg) rotateZ(-14deg) translateY(${(1 - enter) * 300}px)`, transformOrigin: '50% 30%', maskImage: 'linear-gradient(transparent, #000 18%, #000 75%, transparent)', WebkitMaskImage: 'linear-gradient(transparent, #000 18%, #000 75%, transparent)' }}>
          <Img src={staticFile('shots/old-full.jpg')} style={{ width: stripW, transform: `translateY(${-scroll}px)`, boxShadow: '0 0 0 2px rgba(255,255,255,.1)' }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ left: 880, top: 150, width: 920 }}>
        <Chapter n="01" label="Where things stand" />
        <Title text="Today, everything lives on one very long page." at={14} size={64} style={{ marginTop: 28 }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 30, opacity: prog(f, 40, 60) }}>
          <span style={{ font: `800 120px/1 ${F.display}`, fontStretch: '125%', color: C.lime, fontVariantNumeric: 'tabular-nums' }}>{screens}</span>
          <span style={{ font: `400 32px ${F.body}`, color: C.muted }}>screens of scrolling on a laptop</span>
        </div>
        <div style={{ marginTop: 40, display: 'grid', gap: 18 }}>
          {ISSUES.map((it, i) => {
            const p = prog(f, 150 + i * 36, 172 + i * 36);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '18px 24px', borderRadius: 12, background: 'rgba(13,28,34,.85)', border: `1px solid ${C.line}`, opacity: p, transform: `translateX(${(1 - p) * 80}px)` }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ff8a7a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={it.icon} /></svg>
                <div><div style={{ font: `600 30px ${F.body}`, color: C.ink }}>{it.title}</div><div style={{ font: `400 22px ${F.body}`, color: C.muted }}>{it.sub}</div></div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
