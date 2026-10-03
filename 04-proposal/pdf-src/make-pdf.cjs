// Renders proposal.html to ../proposal.pdf with headless Chromium (Playwright).
// Usage: node make-pdf.cjs   (set PLAYWRIGHT_PATH if playwright is not resolvable)
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'proposal.html'), { waitUntil: 'load' });
  await page.pdf({ path: path.join(__dirname, '..', 'proposal.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('proposal.pdf written');
})();
