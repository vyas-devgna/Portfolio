import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { easeInOut, prog, sceneFade } from '../anim';
import { Backdrop } from '../components/Backdrop';
import { Browser } from '../components/Frames';
import { Pointer } from '../components/Pointer';
import { Chapter, Sub, Title } from '../components/Text';
import { BAR, BH, BW, BX, BY, LAYOUT, S } from '../layout';

// 60–72 s: click the theme switch, dark mode ripples out from it; then both themes side by side.
export const Themes: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const th = LAYOUT.home.theme;
  const tx = th.x + th.w / 2, ty = th.y + th.h / 2;
  const sx = BX + tx * S, sy = BY + BAR + ty * S;
  const r = interpolate(f, [92, 140], [0, 1800], { easing: easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const split = prog(f, 165, 215, easeInOut);
  const scroll = interpolate(f, [210, 360], [0, LAYOUT.home.pageHeight - 1700], { easing: easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pw = 760, ph = 1000;
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <Backdrop />
      {f < 220 && (
        <AbsoluteFill style={{ opacity: 1 - split }}>
          <div style={{ position: 'absolute', left: BX, top: BY, transform: `scale(${1 - split * 0.2})` }}>
            <Browser src="shots/home-light-hero.jpg" width={BW} height={BH}>
              <Img src={staticFile('shots/home-dark-hero.jpg')} style={{ position: 'absolute', inset: 0, width: BW, clipPath: `circle(${r}px at ${tx * S}px ${ty * S}px)` }} />
            </Browser>
          </div>
          <Pointer appear={20} keys={[{ f: 20, x: BX + 600, y: BY + 500 }, { f: 80, x: sx, y: sy }, { f: 160, x: sx, y: sy }]} clicks={[88]} />
        </AbsoluteFill>
      )}
      {f >= 160 && (
        <AbsoluteFill style={{ perspective: 2000, opacity: split }}>
          {[['shots/home-light-full.jpg', 150, 26], ['shots/home-dark-full.jpg', 1010, -26]].map(([src, x, ry]) => (
            <div key={src as string} style={{ position: 'absolute', left: x as number, top: 60, width: pw, height: 720, overflow: 'hidden', borderRadius: 14, transform: `rotateY(${(ry as number) * split}deg) translateZ(${-120 * split}px)`, boxShadow: '0 40px 100px -30px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.1)' }}>
              <Img src={staticFile(src as string)} style={{ position: 'absolute', width: pw, top: (-scroll * pw) / 1440 }} />
            </div>
          ))}
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ left: BX, top: 850, width: BW }}>
        <Chapter n="05" label="Light and dark" />
        <Title text="Light or dark: it follows each visitor's device." at={14} size={52} style={{ marginTop: 14 }} />
        <Sub text="One tap switches it, and the site remembers the choice." at={170} size={26} style={{ marginTop: 6 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
