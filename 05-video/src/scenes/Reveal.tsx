import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { easeInOut, prog, sceneFade, sp } from '../anim';
import { Backdrop } from '../components/Backdrop';
import { Callout } from '../components/Callout';
import { Browser } from '../components/Frames';
import { Chapter, Sub, Title } from '../components/Text';
import { BH, BW, BX, BY, LAYOUT, toScreen } from '../layout';

// 20–34 s: the new home page swings in, key elements are called out, then a full scroll.
export const Reveal: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = sp(f, fps, 4, 18, 60);
  const home = LAYOUT.home;
  const maxScroll = home.pageHeight - 900;
  const scroll = interpolate(f, [190, 400], [0, maxScroll], { easing: easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const first = f < 180;
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <Backdrop />
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div style={{ position: 'absolute', left: BX, top: BY, transform: `translateZ(${(1 - e) * -500}px) rotateY(${(1 - e) * -28}deg) rotateX(${(1 - e) * 16}deg)`, transformOrigin: '50% 50%', opacity: Math.min(1, e * 1.5) }}>
          <Browser src="shots/home-light-full.jpg" width={BW} height={BH} scroll={scroll} />
        </div>
      </AbsoluteFill>
      <Callout {...toScreen(home.h1)} label="Says what KT does, straight away" at={50} until={98} side="right" />
      <Callout {...toScreen(home.art)} label="The new KT logo, animated" at={100} until={138} side="left" />
      <Callout {...toScreen(home.cta)} label="One clear next step" at={140} until={176} side="right" />
      <AbsoluteFill style={{ left: BX, top: 850, width: BW }}>
        <Chapter n="02" label="The new website" at={4} />
        {first ? (
          <Title text="A clear first impression." at={16} size={52} style={{ marginTop: 14 }} out={168} />
        ) : (
          <div style={{ marginTop: 14 }}>
            <Title text="Then a calm, ordered story as you scroll." at={186} size={52} />
            <Sub text="Services, how KT works, current projects and the ten technology areas." at={200} size={24} style={{ marginTop: 4 }} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
