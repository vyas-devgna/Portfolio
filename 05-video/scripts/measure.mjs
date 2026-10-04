// Records where key elements sit on the captured pages (CSS px at 1440 or 390 wide), for callouts.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const NEW = process.env.NEW_SITE || 'http://localhost:8080';
const b = await chromium.launch();
const out = {};
async function measure(name, path, sels, viewport) {
  const p = await b.newPage({ viewport, reducedMotion: 'reduce' });
  await p.goto(NEW + path, { waitUntil: 'networkidle' });
  out[name] = await p.evaluate((sels) => {
    const r = { pageHeight: document.documentElement.scrollHeight };
    for (const [k, s] of Object.entries(sels)) { const e = document.querySelector(s); if (!e) continue; const b = e.getBoundingClientRect(); r[k] = { x: Math.round(b.left), y: Math.round(b.top + scrollY), w: Math.round(b.width), h: Math.round(b.height) }; }
    return r;
  }, sels);
  await p.close();
}
const D = { width: 1440, height: 900 };
await measure('home', '/', { h1: '.hero h1', cta: '.hero-actions .btn', art: '.hero-art', zones: '.zones', titleblock: '.titleblock', services: '.svc-index', row2: '.svc-row:nth-child(2) a', steps: '.steps', bento: '.bento', ptable: '.ptable', cta2: '.cta', footerWord: '.ftr-word', theme: '#theme-btn', nav: '.site-nav' }, D);
await measure('about', '/about/', { ptable: '.ptable', facts: '.facts' }, D);
await measure('mobile', '/', { menu: '.menu-btn', h1: '.hero h1' }, { width: 390, height: 844 });
await b.close();
writeFileSync(new URL('../src/layout.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
