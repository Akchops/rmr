/**
 * Scrubs the PPF section through its full pinned range and captures frames,
 * so the signature interaction can be inspected across its whole travel.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const args = process.argv.slice(2);
const has = (k) => args.includes(k);
const w = Number(args[args.indexOf('--w') + 1]) || 1440;
const h = Number(args[args.indexOf('--h') + 1]) || 900;
const tag = args[args.indexOf('--tag') + 1] || `ppf-${w}`;
const OUT = `.qa/${tag}`;
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  args: has('--nowebgl') ? ['--disable-gpu', '--disable-webgl', '--disable-webgl2'] : [],
});
const ctx = await browser.newContext({
  viewport: { width: w, height: h },
  deviceScaleFactor: 1,
  isMobile: w < 800,
  hasTouch: w < 800,
  reducedMotion: has('--reduced') ? 'reduce' : 'no-preference',
});
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// Find where the PPF pin begins and how long it runs.
const range = await page.evaluate(() => {
  const el = document.getElementById('protection');
  if (!el) return null;
  const top = el.getBoundingClientRect().top + window.scrollY;
  return { top, height: el.offsetHeight };
});
console.log('ppf section:', range);

const shots = 9;
for (let i = 0; i < shots; i++) {
  const y = range.top + (range.height - h) * (i / (shots - 1));
  await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(y));
  await page.waitForTimeout(650);
  const pct = await page.evaluate(() => {
    const n = document.querySelector('.ppf-pct');
    return n ? n.textContent : '?';
  });
  await page.screenshot({ path: `${OUT}/ppf-${String(i).padStart(2, '0')}.png` });
  process.stdout.write(`  frame ${i} readout=${pct}\n`);
}

// Confirm the renderer that actually started.
const mode = await page.evaluate(() => {
  const c = document.querySelector('.ppf-canvas');
  return { live: c?.classList.contains('is-live'), tag: c?.tagName };
});
console.log('canvas:', mode, errs.length ? `ERRORS: ${errs.slice(0, 3)}` : 'no errors');
await browser.close();
