import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { easeInOut, prog, sceneFade, sp } from '../anim';
import { Backdrop } from '../components/Backdrop';
import { Browser } from '../components/Frames';
import { Pointer } from '../components/Pointer';
import { Chapter, Sub, Title } from '../components/Text';
import { BAR, BH, BW, BX, BY, S } from '../layout';
import { C, F } from '../theme';

const SLUGS = ['custom-software-development', 'erp-point-of-sale', 'ai-ml-development', 'pcb-electronic-design', 'smart-contract-development', 'ui-ux-graphic-design', 'ip-protocol-development', 'research-technology-consulting'];

// 34–48 s: hover the services list, then all eight service pages orbit in 3D; pages count 2 -> 16.
export const Services: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hover = prog(f, 92, 104);
  const out = prog(f, 150, 190, easeInOut);
  const ringIn = sp(f, fps, 170, 16, 50);
  const spin = interpolate(f, [170, 420], [40, -150], { easing: easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const count = Math.round(interpolate(f, [230, 290], [2, 16], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  // pointer target: ERP row (CSS 1100, 615 within the captured viewport)
  const px = BX + 1100 * S, py = BY + BAR + 615 * S;
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <Backdrop />
      {f < 200 && (
        <AbsoluteFill style={{ perspective: 1800 }}>
          <div style={{ position: 'absolute', left: BX, top: BY, transform: `translateZ(${-out * 900}px) rotateX(${out * 30}deg)`, opacity: 1 - out }}>
            <Browser src="shots/services-rest.jpg" width={BW} height={BH}>
              <Img src={staticFile('shots/services-hover.jpg')} style={{ position: 'absolute', inset: 0, width: BW, opacity: hover }} />
            </Browser>
          </div>
          <div style={{ opacity: 1 - out }}>
            <Pointer appear={30} keys={[{ f: 30, x: BX + 300, y: BY + 600 }, { f: 90, x: px, y: py }, { f: 150, x: px + 4, y: py + 2 }]} clicks={[122]} />
          </div>
        </AbsoluteFill>
      )}
      {f >= 160 && (
        <AbsoluteFill style={{ perspective: 2200, perspectiveOrigin: '50% 40%' }}>
          <div style={{ position: 'absolute', left: 960, top: 360, transformStyle: 'preserve-3d', transform: `rotateX(-10deg) rotateY(${spin}deg) scale(${0.35 + 0.5 * ringIn})` }}>
            {SLUGS.map((s, i) => {
              const a = i * 45;
              const w = 620, h = 388;
              return (
                <div key={s} style={{ position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, transform: `rotateY(${a}deg) translateZ(${880 * ringIn}px)`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 30px 80px -20px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.12)', backfaceVisibility: 'hidden' }}>
                  <Img src={staticFile(`shots/svc-${s}.jpg`)} style={{ width: w, height: h, objectFit: 'cover', objectPosition: 'top' }} />
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
      {f >= 180 && <AbsoluteFill style={{ zIndex: 5, background: 'linear-gradient(transparent 58%, rgba(6,16,21,.92) 74%, #061015)' }} />}
      <AbsoluteFill style={{ zIndex: 6, left: BX, top: f < 180 ? 850 : 790, width: BW }}>
        <Chapter n="03" label="Services" />
        {f < 180 ? (
          <Title text="Each service is easy to find and explore." at={14} size={52} style={{ marginTop: 14 }} out={168} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14 }}>
            <div>
              <Title text="Now every service has its own page." at={184} size={54} />
              <Sub text="So each one can show up when customers search for it." at={210} size={28} style={{ marginTop: 10 }} />
            </div>
            <div style={{ textAlign: 'right', opacity: prog(f, 225, 245) }}>
              <div style={{ font: `800 120px/1 ${F.display}`, fontStretch: '125%', color: C.lime, fontVariantNumeric: 'tabular-nums' }}>{count}</div>
              <div style={{ font: `500 20px ${F.mono}`, letterSpacing: '.14em', color: C.muted, whiteSpace: 'nowrap' }}>PAGES FOR GOOGLE · WAS 2</div>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
