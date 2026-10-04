import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { easeInOut, prog, sceneFade, sp } from '../anim';
import { Backdrop } from '../components/Backdrop';
import { Phone } from '../components/Frames';
import { Chapter, Sub, Title } from '../components/Text';
import { LAYOUT } from '../layout';
import { C } from '../theme';

// 72–86 s: two phones in 3D: one scrolling the site, one opening the full-screen menu.
export const Mobile: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = sp(f, fps, 0, 16, 55), b = sp(f, fps, 18, 16, 55);
  const scroll = interpolate(f, [50, 330], [0, LAYOUT.mobile.pageHeight - 844 - 1400], { easing: easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pw = 330, s = pw / 390;
  const menu = LAYOUT.mobile.menu;
  const tapX = (menu.x + menu.w / 2) * s, tapY = (menu.y + menu.h / 2) * s;
  const tap = prog(f, 200, 222);
  const menuOpen = prog(f, 214, 230);
  const float = (k: number) => Math.sin((f + k) / 28) * 10;
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <Backdrop />
      <AbsoluteFill style={{ left: 120, top: 260, width: 620 }}>
        <Chapter n="06" label="On phones" />
        <Title text="Built for the phone in every pocket." at={14} size={60} style={{ marginTop: 22 }} />
        <Sub text="Large, easy buttons, quick loading and a full-screen menu that works with one thumb." at={40} size={28} style={{ marginTop: 22 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: 'absolute', left: 860, top: 90 + float(0), transform: `rotateY(${(1 - a) * 70 + 14 * Math.sin(f / 90)}deg) rotateX(${(1 - a) * 20}deg) translateZ(${(1 - a) * -400}px)`, opacity: Math.min(1, a * 1.4) }}>
          <Phone src="shots/mobile-light-full.jpg" width={pw} scroll={scroll} />
        </div>
        <div style={{ position: 'absolute', left: 1330, top: 150 + float(40), transform: `rotateY(${(1 - b) * -70 - 12}deg) rotateX(${(1 - b) * 20}deg) translateZ(${(1 - b) * -400}px)`, opacity: Math.min(1, b * 1.4) }}>
          <Phone src="shots/mobile-dark-top.jpg" width={pw}>
            <Img src={staticFile('shots/mobile-dark-menu.jpg')} style={{ position: 'absolute', inset: 0, width: pw, opacity: menuOpen }} />
            {f >= 200 && f <= 222 && <div style={{ position: 'absolute', left: tapX - 30 * (0.5 + tap), top: tapY - 30 * (0.5 + tap), width: 60 * (0.5 + tap), height: 60 * (0.5 + tap), borderRadius: '50%', background: `rgba(68,228,213,${0.5 * (1 - tap)})`, border: `2px solid ${C.teal}` }} />}
          </Phone>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
