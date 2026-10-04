// Synthesises an original ambient music bed (120 s) with soft whooshes on every scene change.
// No samples or licensed audio. Output: public/music.wav (44.1 kHz stereo, 16-bit).
import { writeFileSync, readFileSync } from 'node:fs';
const T = JSON.parse(readFileSync(new URL('../src/timeline.json', import.meta.url)));
const SR = 44100, DUR = 120, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const BPM = 96, BEAT = 60 / BPM, BAR = BEAT * 4;
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
// Fmaj9 - Am7 - Cmaj7 - G6sus, two bars each
const CHORDS = [[53, 57, 60, 64, 67], [57, 60, 64, 67, 71], [48, 55, 59, 64, 67], [55, 59, 62, 64, 69]];
const ROOTS = [41, 45, 48, 43];
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

for (let i = 0; i < N; i++) {
  const t = i / SR;
  const bar = Math.floor(t / BAR);
  const ci = Math.floor(bar / 2) % 4;
  const inChord = (t % (BAR * 2)) / (BAR * 2);
  // pad: detuned sines with slow swell, crossfading per chord
  const swell = Math.min(1, inChord * 6) * Math.min(1, (1 - inChord) * 10 + 0.15);
  let pad = 0;
  for (const n of CHORDS[ci]) {
    const f = midi(n);
    pad += Math.sin(2 * Math.PI * f * t) * 0.5 + Math.sin(2 * Math.PI * f * 1.003 * t) * 0.35 + Math.sin(2 * Math.PI * f * 2 * t) * 0.08;
  }
  pad *= 0.022 * (0.6 + 0.4 * swell);
  // bass on beats 1 and 3
  const beatPos = t % (BEAT * 2);
  const bass = Math.sin(2 * Math.PI * midi(ROOTS[ci] - 12) * t) * Math.exp(-beatPos * 3.2) * 0.16;
  // pluck arpeggio (8ths) from 10 s to 108 s
  let pluck = 0;
  if (t > 10 && t < 108) {
    const step = Math.floor(t / (BEAT / 2));
    const sp = t % (BEAT / 2);
    const notes = CHORDS[ci];
    const n = notes[(step * 3) % notes.length] + 12;
    pluck = Math.sin(2 * Math.PI * midi(n) * t) * Math.exp(-sp * 9) * 0.05;
  }
  // soft hat on off-beats from 22 s to 106 s
  let hat = 0;
  if (t > 22 && t < 106) {
    const hp = (t + BEAT / 2) % BEAT;
    hat = rnd() * Math.exp(-hp * 60) * 0.025;
  }
  // overall fades
  const fade = Math.min(1, t / 3) * Math.min(1, (DUR - t) / 5);
  const s = (pad + bass + pluck) * fade;
  L[i] += s + hat * 0.7; R[i] += s + hat * 1.0;
}
// whooshes: filtered noise swells into each scene start
for (const sc of T.scenes.slice(1)) {
  const centre = sc.start, len = 0.9;
  let lp = 0;
  for (let i = Math.floor((centre - len) * SR); i < Math.floor((centre + 0.3) * SR); i++) {
    const t = Math.max(0, i / SR - (centre - len));
    const env = t < len ? Math.pow(t / len, 2.2) : Math.exp(-(t - len) * 14);
    const cut = 0.02 + 0.25 * Math.min(1, t / len);
    lp += cut * (rnd() - lp);
    const v = lp * env * 0.32;
    const pan = Math.min(1, t / len);
    L[i] += v * (1 - pan * 0.6); R[i] += v * (0.4 + pan * 0.6);
  }
}
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = 0.7 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
}
writeFileSync(new URL('../public/music.wav', import.meta.url), buf);
console.log('music.wav written, peak gain', gain.toFixed(2));
