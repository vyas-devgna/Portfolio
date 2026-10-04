import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { prog } from '../anim';
import { Backdrop } from '../components/Backdrop';
import { Wordmark } from '../components/Brand';
import { Mark3D } from '../components/Mark3D';
import { Sub, Title } from '../components/Text';
import { C, F } from '../theme';

// 110–120 s: logo turns slowly, "Ready to launch", credits; fade to black.
export const Outro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const t = { stem: 1, leg: 1, arm: 1, t: 1 };
  const fadeIn = prog(f, 0, 20);
  const end = 1 - prog(f, dur - 40, dur);
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, end) }}>
      <Backdrop glow={1.3} />
      <AbsoluteFill style={{ perspective: 1600, alignItems: 'center', top: 90 }}>
        <Mark3D id="outro" size={300} t={t} rotY={Math.sin(f / 50) * 24} rotX={6} depth={30} layers={8} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', top: 380 }}>
        <Wordmark width={620} reveal={prog(f, 10, 40)} tag={prog(f, 30, 55)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', top: 600, textAlign: 'center' }}>
        <Title text="Ready to launch." at={40} size={72} />
        <Sub text="Built, tested and ready to go live on kavaiyatech.com." at={60} size={30} style={{ marginTop: 14 }} />
        <div style={{ marginTop: 50, opacity: prog(f, 90, 115), font: `500 22px ${F.mono}`, letterSpacing: '.12em', color: C.muted }}>
          PREPARED FOR KT INDIA BY <span style={{ color: C.ink }}>VYAS DEVGNA</span> · <span style={{ color: C.lime }}>vyasdevgna@gmail.com</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
