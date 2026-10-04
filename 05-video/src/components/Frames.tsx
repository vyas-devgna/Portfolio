import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, F } from '../theme';

// Desktop browser window showing a real screenshot. `scroll` is in CSS px of the 1440-wide page.
export const Browser: React.FC<{
  src: string; width: number; height: number; scroll?: number; url?: string; style?: React.CSSProperties; dark?: boolean; children?: React.ReactNode;
}> = ({ src, width, height, scroll = 0, url = 'kavaiyatech.com', style, dark = true, children }) => {
  const bar = Math.round(width * 0.03);
  const scale = width / 1440;
  return (
    <div style={{ width, height: height + bar, borderRadius: 14, overflow: 'hidden', background: dark ? '#0d1c22' : '#e8eeec', boxShadow: '0 40px 120px -30px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.08)', ...style }}>
      <div style={{ height: bar, display: 'flex', alignItems: 'center', gap: bar * 0.25, padding: `0 ${bar * 0.5}px` }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: bar * 0.32, height: bar * 0.32, borderRadius: '50%', background: c, opacity: 0.85 }} />)}
        <div style={{ marginLeft: bar * 0.6, flex: 1, maxWidth: width * 0.42, height: bar * 0.6, borderRadius: bar, background: dark ? '#162a31' : '#fff', color: dark ? C.muted : '#485a60', font: `500 ${bar * 0.34}px ${F.mono}`, display: 'flex', alignItems: 'center', padding: `0 ${bar * 0.4}px`, gap: bar * 0.2 }}><svg width={bar * 0.32} height={bar * 0.32} viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>{url}</div>
      </div>
      <div style={{ position: 'relative', width, height, overflow: 'hidden', background: '#f2f5f4' }}>
        <Img src={staticFile(src)} style={{ position: 'absolute', left: 0, top: -scroll * scale, width, display: 'block' }} />
        {children}
      </div>
    </div>
  );
};

// Phone with a real mobile screenshot (390 CSS px wide). `scroll` in CSS px.
export const Phone: React.FC<{ src: string; width: number; scroll?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ src, width, scroll = 0, style, children }) => {
  const scale = width / 390;
  const h = 844 * scale;
  const bezel = width * 0.045;
  return (
    <div style={{ width: width + bezel * 2, height: h + bezel * 2, borderRadius: width * 0.16, background: 'linear-gradient(145deg,#2a3a40,#0c1418)', padding: bezel, boxShadow: '0 50px 120px -30px rgba(0,0,0,.8), inset 0 0 0 2px rgba(255,255,255,.08)', ...style }}>
      <div style={{ position: 'relative', width, height: h, borderRadius: width * 0.12, overflow: 'hidden', background: '#000' }}>
        <Img src={staticFile(src)} style={{ position: 'absolute', left: 0, top: -scroll * scale, width, display: 'block' }} />
        <div style={{ position: 'absolute', top: width * 0.025, left: '50%', width: width * 0.28, height: width * 0.075, borderRadius: 99, background: '#000', transform: 'translateX(-50%)' }} />
        {children}
      </div>
    </div>
  );
};
