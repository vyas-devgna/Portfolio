// Generates logo sizes, favicon.ico and the 1200x630 share image from the concept mark (src/mark.mjs).
// Needs Playwright + Chromium (dev-time only; the site itself has no dependencies).
// Usage: node scripts/make-images.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { markSvg } from '../src/mark.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const OUT = join(ROOT, 'src/static');
const svg = markSvg('m', 'g').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
const logo = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage();
await page.setContent(`<img id="l" src="${logo}">`);
await page.waitForFunction(() => document.getElementById('l').complete);

async function render(size, type, bg) {
  const dataUrl = await page.evaluate(({ size, type, bg }) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    // icons sit on a dark rounded tile so they read on light and dark browser chrome
    const rr = size * 0.22; x.fillStyle = bg || '#0b0f1a'; x.beginPath(); x.roundRect(0, 0, size, size, bg ? 0 : rr); x.fill();
    const pad = Math.round(size * 0.14);
    x.drawImage(document.getElementById('l'), pad, pad, size - 2 * pad, size - 2 * pad);
    return c.toDataURL(type, 0.9);
  }, { size, type, bg });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

for (const s of [96, 192, 512]) {
  writeFileSync(join(OUT, `img/logo-${s}.png`), await render(s, 'image/png'));
  writeFileSync(join(OUT, `img/logo-${s}.webp`), await render(s, 'image/webp'));
}
writeFileSync(join(OUT, 'apple-touch-icon.png'), await render(180, 'image/png', '#0b0f1a'));

// favicon.ico with embedded 16 and 32 px PNGs
const icons = [await render(16, 'image/png'), await render(32, 'image/png')];
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(icons.length, 4);
let offset = 6 + 16 * icons.length;
const entries = icons.map((png, i) => {
  const e = Buffer.alloc(16); const s = i ? 32 : 16;
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12); offset += png.length; return e;
});
writeFileSync(join(OUT, 'favicon.ico'), Buffer.concat([header, ...entries, ...icons]));

// Share image
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<!doctype html><html><head><style>
body{margin:0;width:1200px;height:630px;background:#0b0f1a;color:#eef2fa;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;position:relative;overflow:hidden}
.g{position:absolute;inset:0;background-image:linear-gradient(#1c2438 1px,transparent 1px),linear-gradient(90deg,#1c2438 1px,transparent 1px);background-size:48px 48px;-webkit-mask-image:radial-gradient(ellipse at 80% 20%,#000 5%,transparent 70%)}
.c{position:absolute;left:84px;top:96px;right:84px}
img{width:132px;height:132px;padding:18px;border-radius:30px;background:linear-gradient(160deg,#182038,#0e1324);border:1px solid #34406a}
.k{font-family:ui-monospace,Menlo,monospace;letter-spacing:.14em;font-size:20px;color:#c8f560;margin:38px 0 14px}
h1{font-size:64px;line-height:1.05;letter-spacing:-.02em;margin:0;max-width:900px}
h1 span{background:linear-gradient(100deg,#c8f560,#8fd6a8,#6c8cff);-webkit-background-clip:text;color:transparent}
.b{position:absolute;left:0;right:0;bottom:0;height:10px;background:linear-gradient(100deg,#c8f560,#8fd6a8,#6c8cff)}
.f{position:absolute;left:84px;bottom:46px;font-size:22px;color:#aeb8cc}
</style></head><body><div class="g"></div><div class="c"><img src="${logo}"><p class="k">KT INDIA · KAVAIYA TECHNOLOGIES</p><h1>Software, AI and electronics, <span>engineered around your problem.</span></h1></div><p class="f">Nadiad, Gujarat, India · kavaiyatech.com</p><div class="b"></div></body></html>`);
await page.waitForTimeout(200);
writeFileSync(join(OUT, 'img/og-default.png'), await page.screenshot({ type: 'png' }));
await browser.close();
console.log('images written');
