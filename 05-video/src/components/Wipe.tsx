import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { easeInOut, prog } from '../anim';
import { RIBBON } from '../theme';

// Diagonal ribbon sweep used between scenes (20 frames).
export const RibbonWipe: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, 0, 20, easeInOut);
  const x = -60 + p * 220;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-30%', height: '160%', width: '42%', left: `${x - 20}%`, transform: 'skewX(-18deg)', background: RIBBON, opacity: 0.95, boxShadow: '0 0 120px rgba(68,228,213,.6)' }} />
      <div style={{ position: 'absolute', top: '-30%', height: '160%', width: '10%', left: `${x - 34}%`, transform: 'skewX(-18deg)', background: '#061015' }} />
    </AbsoluteFill>
  );
};
