import React from 'react';
import { MarkPiece, Piece } from './Brand';

// The KT mark as four extruded ribbons in 3D. `t` (0..1 per piece) flies each ribbon into place.
const START: Record<Piece, { x: number; y: number; z: number; rx: number; ry: number; rz: number }> = {
  stem: { x: -260, y: 380, z: -500, rx: 70, ry: 0, rz: -12 },
  leg: { x: 420, y: 420, z: -420, rx: -40, ry: 30, rz: 18 },
  arm: { x: 520, y: -380, z: -380, rx: 30, ry: -50, rz: -20 },
  t: { x: 60, y: -520, z: -260, rx: -70, ry: 80, rz: 0 },
};
const DEPTH_COLOR: Record<Piece, string> = { stem: '#077f96', leg: '#0b8a8a', arm: '#2f8f5a', t: '#9fb6b2' };

export const Mark3D: React.FC<{
  size: number; t: Record<Piece, number>; rotY?: number; rotX?: number; depth?: number; layers?: number; id: string; tFill?: string;
}> = ({ size, t, rotY = 0, rotX = 0, depth = 26, layers = 7, id, tFill }) => {
  const h = (size * 600) / 690;
  return (
    <div style={{ width: size, height: h, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)` }}>
      {(['stem', 'leg', 'arm', 't'] as Piece[]).map((p) => {
        const k = 1 - t[p];
        const s = START[p];
        const tf = `translate3d(${s.x * k}px, ${s.y * k}px, ${s.z * k}px) rotateX(${s.rx * k}deg) rotateY(${s.ry * k}deg) rotateZ(${s.rz * k}deg)`;
        return (
          <div key={p} style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: tf, opacity: Math.min(1, t[p] * 3) }}>
            {Array.from({ length: layers }, (_, i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, transform: `translateZ(${-((i + 1) * depth) / layers}px)` }}>
                <MarkPiece piece={p} id={`${id}${p}d${i}`} flat={DEPTH_COLOR[p]} style={{ filter: `brightness(${0.75 - i * 0.06})` }} />
              </div>
            ))}
            <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(1px)' }}>
              <MarkPiece piece={p} id={`${id}${p}`} tFill={tFill} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
