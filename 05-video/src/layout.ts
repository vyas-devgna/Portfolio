import L from './layout.json';
export const LAYOUT = L as any;
// Standard browser placement used by most scenes.
export const BW = 1152, BH = 720, BX = (1920 - BW) / 2, BY = 70;
export const BAR = Math.round(BW * 0.03);
export const S = BW / 1440; // CSS px -> screen px
// screen position of a CSS-px rect inside the standard browser at a given scroll
export const toScreen = (r: { x: number; y: number; w: number; h: number }, scroll = 0, bx = BX, by = BY, s = S, bar = BAR) => ({
  x: bx + r.x * s, y: by + bar + (r.y - scroll) * s, w: r.w * s, h: r.h * s,
});
