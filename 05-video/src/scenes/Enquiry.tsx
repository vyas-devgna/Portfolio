import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { prog, sceneFade } from '../anim';
import { Backdrop } from '../components/Backdrop';
import { Browser } from '../components/Frames';
import { Pointer } from '../components/Pointer';
import { Chapter, Sub, Title } from '../components/Text';
import { BAR, BH, BW, BX, BY, S } from '../layout';
import { C, F } from '../theme';

// 86–98 s: filling in the real contact form (demo data, submission mocked) and the confirmation.
export const Enquiry: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const at = (x: number, y: number) => ({ x: BX + x * S, y: BY + BAR + y * S });
  const name = at(311, 202), msg = at(480, 585), send = at(222, 836);
  const half = prog(f, 60, 74), filled = prog(f, 122, 140), sent = prog(f, 190, 204);
  const burst = prog(f, 205, 240);
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, dur) }}>
      <Backdrop />
      <div style={{ position: 'absolute', left: BX, top: BY }}>
        <Browser src="shots/contact-empty.jpg" width={BW} height={BH} url="kavaiyatech.com/contact">
          <Img src={staticFile('shots/contact-half.jpg')} style={{ position: 'absolute', inset: 0, width: BW, opacity: half }} />
          <Img src={staticFile('shots/contact-filled.jpg')} style={{ position: 'absolute', inset: 0, width: BW, opacity: filled }} />
          <Img src={staticFile('shots/contact-sent.jpg')} style={{ position: 'absolute', inset: 0, width: BW, opacity: sent }} />
        </Browser>
      </div>
      <Pointer appear={20} keys={[{ f: 20, x: BX + 900, y: BY + 600 }, { f: 52, x: name.x, y: name.y }, { f: 104, x: msg.x, y: msg.y }, { f: 172, x: send.x, y: send.y }, { f: 360, x: send.x, y: send.y }]} clicks={[56, 108, 180]} />
      {burst > 0 && burst < 1 && (
        <div style={{ position: 'absolute', left: BX + 480 * S, top: BY + BAR + 470 * S, width: 0, height: 0 }}>
          {Array.from({ length: 14 }, (_, i) => {
            const ang = (i / 14) * Math.PI * 2;
            const d = 40 + burst * 140;
            return <span key={i} style={{ position: 'absolute', left: Math.cos(ang) * d, top: Math.sin(ang) * d, width: 12, height: 12, borderRadius: 3, background: i % 2 ? C.lime : C.teal, opacity: 1 - burst, transform: `rotate(${ang}rad)` }} />;
          })}
        </div>
      )}
      <div style={{ position: 'absolute', left: BX + BW - 340, top: BY + 120, width: 300, opacity: prog(f, 200, 220), transform: `translateY(${(1 - prog(f, 200, 220)) * 20}px)`, background: C.night2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 24, boxShadow: '0 30px 60px -20px rgba(0,0,0,.7)' }}>
        <div style={{ font: `500 16px ${F.mono}`, letterSpacing: '.14em', color: C.lime }}>NEW ENQUIRY</div>
        <div style={{ font: `600 24px ${F.body}`, color: C.ink, marginTop: 8 }}>Delivered to KT's inbox</div>
        <div style={{ font: `400 20px ${F.body}`, color: C.muted, marginTop: 6 }}>With the service already chosen</div>
      </div>
      <AbsoluteFill style={{ left: BX, top: 850, width: BW }}>
        <Chapter n="07" label="Getting in touch" />
        <Title text="Every page leads to a short, simple enquiry form." at={14} size={50} style={{ marginTop: 14 }} />
        <Sub text="Spam is filtered out automatically. Demo details shown." at={180} size={24} style={{ marginTop: 6 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
