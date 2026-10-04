import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { easeInOut, prog, sceneFade } from '../anim';
import { Backdrop } from '../components/Backdrop';
import { Chapter, Sub, Title } from '../components/Text';
import { LAYOUT } from '../layout';
import { C, F } from '../theme';

// 48–60 s: a camera glides over the real page like over a technical drawing, with annotations.
export const Design: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const home = LAYOUT.home;
  const VW = 1180, VH = 760; // viewport on screen
  const frames = [
    { at: 0, x: 0, y: 40, w: 1440 },                                     // wide: hero with zone markers
    { at: 110, x: 80, y: 820, w: 1280 },                                 // title block
    { at: 220, x: 80, y: home.ptable.y - 120, w: 1280 },                 // element table
  ];
  const ks = [0, 70, 120, 190, 240, 360];
  const pick = (k: 'x' | 'y' | 'w') => interpolate(f, ks, [frames[0][k], frames[0][k], frames[1][k], frames[1][k], frames[2][k], frames[2][k]], { easing: easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cx = pick('x'), cy = pick('y'), cw = pick('w');
  const s = VW / cw; // screen px per CSS px
  const imgW = 1440 * s;
  const tilt = 1 - prog(f, 0, 50);
  const note = (label: string, a: number, b: number, x: number, y: number) => {
    const p = Math.min(prog(f, a, a + 14), 1 - prog(f, b, b + 10));
    return p > 0 ? (
      <div style={{ position: 'absolute', left: x, top: y, opacity: p, transform: `translateY(${(1 - p) * 12}px)`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: C.lime, boxShadow: '0 0 0 6px rgba(173,249,69,.25)' }} />
        <span style={{ font: `600 26px ${F.body}`, color: C.night, background: C.lime, padding: '8px 16px', borderRadius: 6 }}>{label}</span>
      </div>
    ) : null;
  };
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <Backdrop />
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div style={{ position: 'absolute', left: 80, top: 160, width: VW, height: VH, borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 120px -30px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.1)', transform: `rotateY(${tilt * 22}deg) rotateX(${tilt * 10}deg)`, background: '#f2f5f4' }}>
          <Img src={staticFile('shots/home-light-full.jpg')} style={{ position: 'absolute', width: imgW, left: -cx * s, top: -cy * s }} />
          {note('Drawing-sheet grid and zone markers', 20, 100, 40, 40)}
          {note('Real company details, up front', 130, 210, 40, (900 - cy) * s + 150)}
          {note('Ten technology areas at a glance', 250, 345, 40, 30)}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ left: 1320, top: 200, width: 520 }}>
        <Chapter n="04" label="Design" />
        <Title text="Designed like an engineering drawing." at={14} size={56} style={{ marginTop: 22 }} />
        <Sub text="Precise and technical, built around KT's new logo. It looks like an engineering company, because it is one." at={40} size={27} style={{ marginTop: 22 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
