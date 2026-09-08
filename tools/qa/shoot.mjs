/**
 * Renders the built site at a set of viewports and reports console errors,
 * failed requests and horizontal overflow. Screenshots land in .qa/.
 *
 *   node tools/qa/shoot.mjs [--url URL] [--reduced] [--nojs] [--nowebgl]
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i > -1 ? process.argv[i + 1] : d;
};
const has = (k) => process.argv.includes(k);

const URL = arg('--url', 'http://localhost:4173/');
const TAG = arg('--tag', 'base');
const OUT = `.qa/${TAG}`;
await mkdir(OUT, { recursive: true });

const VIEWPORTS = [
  { name: '320x780', width: 320, height: 780, mobile: true },
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '430x932', width: 430, height: 932, mobile: true },
  { name: '768x1024', width: 768, height: 1024, mobile: true },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
  { name: '1728x1117', width: 1728, height: 1117, mobile: false },
];

// Scroll depths sampled on every viewport, as a fraction of full page height.
const DEPTHS = [0, 0.12, 0.22, 0.34, 0.46, 0.6, 0.74, 0.88, 1];

const only = arg('--viewport', null);
const viewports = only ? VIEWPORTS.filter((v) => v.name === only) : VIEWPORTS;

const browser = await chromium.launch({
  args: has('--nowebgl') ? ['--disable-gpu', '--disable-webgl', '--disable-webgl2'] : [],
});

const report = [];

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    javaScriptEnabled: !has('--nojs'),
    reducedMotion: has('--reduced') ? 'reduce' : 'no-preference',
    userAgent: vp.mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });

  const errors = [];
  const failed = [];
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text().slice(0, 300));
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 300)));
  page.on('requestfailed', (r) =>
    failed.push(`${r.url().replace(URL, '/')} — ${r.failure()?.errorText}`)
  );
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push(`${r.url().replace(URL, '/')} — HTTP ${r.status()}`);
  });

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);

  const height = await page.evaluate(() => document.documentElement.scrollHeight);

  const overflow = [];
  for (const d of DEPTHS) {
    await page.evaluate((dd) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.round(max * dd));
    }, d);
    await page.waitForTimeout(700);

    const o = await page.evaluate(() => {
      const de = document.documentElement;
      const over = de.scrollWidth > de.clientWidth + 1;
      if (!over) return null;
      // Identify what is actually sticking out.
      const culprits = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > de.clientWidth + 1.5 || r.left < -1.5) {
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed') continue;
          culprits.push(
            `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} right=${Math.round(r.right)} left=${Math.round(r.left)}`
          );
        }
      }
      return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, culprits: culprits.slice(0, 6) };
    });
    if (o) overflow.push({ depth: d, ...o });

    await page.screenshot({ path: `${OUT}/${vp.name}-${String(Math.round(d * 100)).padStart(3, '0')}.png` });
  }

  report.push({ viewport: vp.name, height, errors, failed, overflow });
  await context.close();
}

await browser.close();

let bad = 0;
for (const r of report) {
  const flags = [];
  if (r.errors.length) flags.push(`${r.errors.length} console error(s)`);
  if (r.failed.length) flags.push(`${r.failed.length} failed request(s)`);
  if (r.overflow.length) flags.push(`${r.overflow.length} overflow point(s)`);
  if (flags.length) bad++;
  console.log(`\n${r.viewport}  page=${r.height}px  ${flags.length ? '⚠ ' + flags.join(', ') : '✓ clean'}`);
  r.errors.slice(0, 4).forEach((e) => console.log('   ERR  ' + e));
  [...new Set(r.failed)].slice(0, 6).forEach((f) => console.log('   NET  ' + f));
  r.overflow.slice(0, 3).forEach((o) =>
    console.log(`   OVF  @${Math.round(o.depth * 100)}%  ${o.scrollWidth}>${o.clientWidth}  ${o.culprits.join(' | ')}`)
  );
}
console.log(`\n${bad === 0 ? 'ALL CLEAN' : bad + ' viewport(s) with findings'} — shots in ${OUT}/`);
