import React from 'react';
// @ts-ignore - plain ESM module shared with the website build
import { K_PATH, T_PATH, WORD_PATH, TAG_PATH, TAG_LINES } from '../../../03-new-site/src/brand.mjs';

export type Piece = 'stem' | 'arm' | 'leg' | 't';
const VB = '420 145 690 600';
const STOPS: Record<string, [string, string][]> = {
  stem: [['0', '#8efaca'], ['.5', '#44e4d5'], ['1', '#0ac4e7']],
  arm: [['0', '#0790a8'], ['.18', '#14b8cc'], ['.5', '#92f26f'], ['.75', '#adf945'], ['1', '#dcfb7b']],
  leg: [['0', '#0a9fbd'], ['.2', '#12c3e0'], ['.6', '#7af08d'], ['1', '#d9fc6e']],
  fold: [['0', '#107946'], ['1', '#95f145']],
};
const G: Record<string, [number, number, number, number]> = { stem: [475, 154, 475, 715], arm: [527, 480, 1067, 175], leg: [545, 480, 970, 735], fold: [880, 392, 950, 452] };
const CLIP: Record<string, string> = {
  stem: 'M400 140H527V750H400Z',
  arm: 'M526 140H1120V246H820L640 405L526 502Z',
  leg: 'M526 502L640 405L820 246H1120V760H526Z',
};

// One ribbon of the KT mark as its own SVG layer (so it can move in 3D). `flat` paints a solid
// colour for the extrusion layers behind the face.
export const MarkPiece: React.FC<{ piece: Piece; id: string; flat?: string; tFill?: string; style?: React.CSSProperties }> = ({ piece, id, flat, tFill = '#edf7f1', style }) => {
  const grad = (k: string) => {
    const [x1, y1, x2, y2] = G[k];
    return (
      <linearGradient id={`${id}${k}`} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
        {STOPS[k].map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
      </linearGradient>
    );
  };
  return (
    <svg viewBox={VB} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', ...style }}>
      <defs>
        {piece !== 't' ? grad(piece) : grad('fold')}
        {piece !== 't' && <clipPath id={`${id}c`}><path d={CLIP[piece]} /></clipPath>}
        {piece === 't' && <clipPath id={`${id}ct`}><path d={T_PATH} /></clipPath>}
      </defs>
      {piece !== 't' ? (
        <path clipPath={`url(#${id}c)`} fill={flat ?? `url(#${id}${piece})`} d={K_PATH} />
      ) : (
        <>
          <path fill={flat ?? tFill} d={T_PATH} />
          {!flat && <path clipPath={`url(#${id}ct)`} fill={`url(#${id}fold)`} d="M865 389C905 389 950 428 950 462V389Z" />}
        </>
      )}
    </svg>
  );
};

// Flat full mark (all four ribbons).
export const Mark: React.FC<{ id: string; size: number; tFill?: string; style?: React.CSSProperties }> = ({ id, size, tFill, style }) => (
  <div style={{ position: 'relative', width: size, height: (size * 600) / 690, ...style }}>
    {(['stem', 'leg', 'arm', 't'] as Piece[]).map((p) => <MarkPiece key={p} piece={p} id={`${id}${p}`} tFill={tFill} />)}
  </div>
);

export const Wordmark: React.FC<{ width: number; color?: string; reveal?: number; tag?: number }> = ({ width, color = '#edf7f1', reveal = 1, tag = 1 }) => {
  const h = (width * 210) / 1220;
  return (
    <svg viewBox="120 780 1220 210" width={width} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id="wm-reveal"><rect x="120" y="780" width={1220 * reveal} height="120" /></clipPath>
        <linearGradient id="wm-line" x1="0" x2="1"><stop offset="0" stopColor="#adf945" /><stop offset="1" stopColor="#0ac4e7" /></linearGradient>
      </defs>
      <path clipPath="url(#wm-reveal)" fill={color} d={WORD_PATH} />
      <g style={{ opacity: tag }}>
        <path fill={color} d={TAG_PATH} />
        {TAG_LINES.map((d: string, i: number) => <path key={i} fill="url(#wm-line)" d={d} style={{ transformBox: 'fill-box', transformOrigin: i === 0 ? 'right' : 'left', transform: `scaleX(${tag})` }} />)}
      </g>
    </svg>
  );
};
