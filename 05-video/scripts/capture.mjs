// Captures real screenshots of the new site (and the current site, for the before/after scene).
// Needs: new site served on :8080 (03-new-site/scripts/serve.mjs) and a local copy of the current site on :8099.
// Usage: PLAYWRIGHT_PATH=/path/to/playwright node scripts/capture.mjs
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const NEW = process.env.NEW_SITE || 'http://localhost:8080';
const OLD = process.env.OLD_SITE || 'http://localhost:8099';
const OUT = new URL('../public/shots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
async function ctx(opts) {
  return browser.newContext({ deviceScaleFactor: 2, reducedMotion: 'reduce', ...opts });
}
async function shoot(page, name, opts = {}) {
  await page.waitForTimeout(opts.wait ?? 250);
  await page.screenshot({ path: OUT + name + '.jpg', type: 'jpeg', quality: 88, fullPage: !!opts.full, clip: opts.clip });
  console.log('shot', name);
}

// ---------- desktop, light + dark ----------
for (const scheme of ['light', 'dark']) {
  const c = await ctx({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
  const p = await c.newPage();
  await p.goto(NEW + '/', { waitUntil: 'networkidle' });
  await shoot(p, `home-${scheme}-hero`);
  await shoot(p, `home-${scheme}-full`, { full: true });
  if (scheme === 'light') {
    for (const path of ['/services/', '/work/', '/about/', '/careers/']) {
      await p.goto(NEW + path, { waitUntil: 'networkidle' });
      await shoot(p, 'page' + path.replace(/\//g, '-').replace(/-$/, '') + '-full', { full: true });
    }
    // every service page hero (for the card fan)
    for (const slug of ['custom-software-development', 'erp-point-of-sale', 'ai-ml-development', 'pcb-electronic-design', 'smart-contract-development', 'ui-ux-graphic-design', 'ip-protocol-development', 'research-technology-consulting']) {
      await p.goto(`${NEW}/services/${slug}/`, { waitUntil: 'networkidle' });
      await shoot(p, `svc-${slug}`);
    }
    // services index with a row hovered
    await p.goto(NEW + '/', { waitUntil: 'networkidle' });
    const row = p.locator('.svc-row a').nth(1);
    await row.scrollIntoViewIfNeeded();
    await p.evaluate(() => window.scrollBy(0, -120));
    await shoot(p, 'services-rest');
    await row.hover();
    await shoot(p, 'services-hover', { wait: 900 });
    // contact form: empty, filled, sent (submission mocked; nothing leaves the machine)
    await p.route('https://formspree.io/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await p.goto(NEW + '/contact/?service=erp-point-of-sale', { waitUntil: 'networkidle' });
    const pin = () => p.evaluate(() => { const f = document.getElementById('contact-form'); window.scrollTo(0, f.getBoundingClientRect().top + window.scrollY - 110); });
    await p.evaluate(() => { document.getElementById('contact-form').action = 'https://formspree.io/f/demo'; });
    await pin();
    await shoot(p, 'contact-empty');
    await p.fill('#f-name', 'Asha Patel');
    await p.fill('#f-email', 'asha@example.com');
    await p.fill('#f-org', 'Example Retail');
    await pin();
    await shoot(p, 'contact-half');
    await p.fill('#f-msg', 'We run three shops and want one system for billing, stock and daily reports.');
    await p.check('#f-consent');
    await pin();
    await shoot(p, 'contact-filled');
    await p.click('button[type=submit]');
    await p.waitForFunction(() => /Thank/.test(document.getElementById('form-status').textContent));
    await pin();
    await p.evaluate(() => window.scrollBy(0, 420));
    await shoot(p, 'contact-sent');
  }
  await c.close();
}

// ---------- mobile ----------
for (const scheme of ['light', 'dark']) {
  const c = await ctx({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, colorScheme: scheme, isMobile: true, hasTouch: true });
  const p = await c.newPage();
  await p.goto(NEW + '/', { waitUntil: 'networkidle' });
  await shoot(p, `mobile-${scheme}-full`, { full: true });
  await shoot(p, `mobile-${scheme}-top`);
  if (scheme === 'dark') {
    await p.click('.menu-btn');
    await shoot(p, 'mobile-dark-menu', { wait: 600 });
  }
  await c.close();
}

// ---------- current site (before) ----------
{
  const c = await ctx({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const p = await c.newPage();
  await p.goto(OLD + '/', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log('old site height', h);
  await shoot(p, 'old-hero');
  await shoot(p, 'old-full', { full: true });
  await c.close();
}
await browser.close();
