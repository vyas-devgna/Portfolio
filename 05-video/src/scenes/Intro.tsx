import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { prog, sceneFade, sp } from '../anim';
import { Backdrop } from '../components/Backdrop';
import { Wordmark } from '../components/Brand';
import { Mark3D } from '../components/Mark3D';
import { Sub, Title } from '../components/Text';

// 0–8 s: the KT mark assembles in 3D, the wordmark writes itself, then the title.
export const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = { stem: sp(f, fps, 6, 14, 70), leg: sp(f, fps, 16, 14, 70), arm: sp(f, fps, 26, 14, 70), t: sp(f, fps, 38, 13, 70) };
  const settle = prog(f, 90, 140);
  const rotY = -38 + 38 * prog(f, 0, 120) + Math.sin(f / 40) * 3 * (1 - settle * 0.6);
  const rotX = 14 - 14 * prog(f, 0, 110);
  const scale = 1 - 0.36 * settle;
  const lift = -150 * settle;
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur, 1, 16) }}>
      <Backdrop glow={1.2} />
      <AbsoluteFill style={{ perspective: 1600, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `translateY(${lift}px) scale(${scale})`, transformStyle: 'preserve-3d' }}>
          <Mark3D id="intro" size={560} t={t} rotY={rotY} rotX={rotX} depth={34} layers={8} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', top: 560 }}>
        <Wordmark width={760} reveal={prog(f, 110, 150)} tag={prog(f, 140, 170)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', top: 760, textAlign: 'center' }}>
        <Title text="Introducing the new kavaiyatech.com" at={168} size={58} />
        <Sub text="A two-minute tour of the redesigned website" at={186} style={{ marginTop: 16 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
