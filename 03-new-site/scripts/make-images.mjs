// Generates favicons, app icons, logo files and the 1200x630 share image from the vector logo (src/brand.mjs).
// Needs Playwright + Chromium (dev-time only; the site itself has no dependencies).
// Usage: PLAYWRIGHT_PATH=/path/to/playwright node scripts/make-images.mjs
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markSvg, wordmarkSvg, TAG_PATH, TAG_LINES } from '../src/brand.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const OUT = join(ROOT, 'src/static');
const NS = 'xmlns="http://www.w3.org/2000/svg"';
const DARK = '#061015';

// Standalone SVG files
const standalone = (svg) => svg.replace('<svg ', `<svg ${NS} `);
const tileIcon = (id) => {
  const inner = markSvg({ id, tFill: '#edf7f1' }).replace(/<svg[^>]*>/, '').replace('</svg>', '');
  return `<svg ${NS} viewBox="355 85 820 820"><rect x="355" y="85" width="820" height="820" rx="180" fill="${DARK}"/><g transform="translate(765 495) scale(.92) translate(-765 -445)">${inner}</g></svg>`;
};
writeFileSync(join(OUT, 'img/kt-mark.svg'), tileIcon('f'));
writeFileSync(join(OUT, 'img/kt-mark-transparent.svg'), standalone(markSvg({ id: 'm', tFill: '#edf7f1', title: 'KT INDIA' })));
const lockup = (t = '#edf7f1') => `<svg ${NS} viewBox="120 140 1220 840" role="img" aria-label="Kavaiyatech, KT INDIA">
<g transform="translate(0 0)">${markSvg({ id: 'L', tFill: t }).replace(/<svg[^>]*>/, '').replace('</svg>', '')}</g>
<path fill="${t}" d="${wordmarkSvg().match(/ d="([^"]+)"/)[1]}"/>
<path fill="${t}" d="${TAG_PATH}"/>
<defs><linearGradient id="tl" x1="0" x2="1"><stop offset="0" stop-color="#adf945"/><stop offset="1" stop-color="#0ac4e7"/></linearGradient></defs>
${TAG_LINES.map((d) => `<path fill="url(#tl)" d="${d}"/>`).join('')}
</svg>`;
writeFileSync(join(OUT, 'img/kt-lockup-dark-bg.svg'), lockup('#edf7f1'));
writeFileSync(join(OUT, 'img/kt-lockup-light-bg.svg'), lockup('#0b1a20'));

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage();

async function shot(html, w, h, file, opts = {}) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:${w}px;height:${h}px}</style></head><body>${html}</body></html>`);
  await page.waitForTimeout(100);
  const buf = await page.screenshot({ type: opts.type || 'png', omitBackground: true, quality: opts.quality });
  if (file) writeFileSync(join(OUT, file), buf);
  return buf;
}

// App icons on a dark tile (the white T needs a dark ground in browser chrome)
for (const s of [192, 512]) await shot(tileIcon('i' + s), s, s, `img/logo-${s}.png`);
await shot(tileIcon('a'), 180, 180, 'apple-touch-icon.png');
const icons = [await shot(tileIcon('x16'), 16, 16), await shot(tileIcon('x32'), 32, 32), await shot(tileIcon('x48'), 48, 48)];
const sizes = [16, 32, 48];
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(icons.length, 4);
let offset = 6 + 16 * icons.length;
const entries = icons.map((png, i) => {
  const e = Buffer.alloc(16); e.writeUInt8(sizes[i], 0); e.writeUInt8(sizes[i], 1); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12); offset += png.length; return e;
});
writeFileSync(join(OUT, 'favicon.ico'), Buffer.concat([header, ...entries, ...icons]));

// Share image: dark sheet, lockup on the left, headline on the right
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<!doctype html><html><head><style>
@font-face{font-family:A;src:url(data:font/woff2;base64,${(await import('node:fs')).readFileSync(join(OUT, 'fonts/archivo-var.woff2')).toString('base64')}) format("woff2");font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:M;src:url(data:font/woff2;base64,${(await import('node:fs')).readFileSync(join(OUT, 'fonts/plex-mono-500.woff2')).toString('base64')}) format("woff2")}
body{margin:0;width:1200px;height:630px;background:${DARK};color:#e6f0ee;position:relative;overflow:hidden}
.g{position:absolute;inset:0;background-image:linear-gradient(rgba(95,227,210,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(95,227,210,.07) 1px,transparent 1px);background-size:40px 40px}
.lock{position:absolute;left:70px;top:95px;width:430px}
.lock svg{width:430px;height:auto}
h1{position:absolute;left:560px;top:150px;width:560px;margin:0;font:750 64px/1.02 A,sans-serif;font-stretch:118%;letter-spacing:-.02em}
h1 span{background:linear-gradient(100deg,#0ac4e7,#44e4d5 30%,#92f26f 68%,#d9fc6e);background-repeat:no-repeat;background-size:100% 8px;background-position:0 94%}
.k{position:absolute;left:560px;top:110px;font:500 16px M,monospace;letter-spacing:.16em;color:#9db1b3}
.f{position:absolute;left:560px;bottom:70px;font:500 17px M,monospace;letter-spacing:.06em;color:#9db1b3}
.b{position:absolute;left:0;right:0;bottom:0;height:8px;background:linear-gradient(100deg,#0ac4e7,#44e4d5 30%,#92f26f 68%,#d9fc6e)}
</style></head><body><div class="g"></div><div class="lock">${lockup('#edf7f1').replace(NS + ' ', '')}</div>
<p class="k">SOFTWARE · AI · ELECTRONICS</p><h1>Engineered around <span>your problem.</span></h1><p class="f">Nadiad, Gujarat, India · kavaiyatech.com</p><div class="b"></div></body></html>`);
await page.waitForTimeout(300);
writeFileSync(join(OUT, 'img/og-default.png'), await page.screenshot({ type: 'png' }));
await browser.close();
console.log('images written');
