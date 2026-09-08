/**
 * Serves preview/morphed-preview.html inside the same minimal wrapper the
 * Artifact host applies, then checks it renders, runs, and has no failures.
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const body = readFileSync(new URL('../../preview/morphed-preview.html', import.meta.url), 'utf8');

// Mirrors the host wrapper: charset + viewport + a light reset, nothing else.
const doc = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>:root{color-scheme:light}body{margin:0;font:14px system-ui;background:#fafaf9}
img{max-width:100%}[hidden]{display:none!important}</style></head><body>${body}</body></html>`;

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(doc);
}).listen(4199);

const browser = await chromium.launch();
let fails = 0;
const ok = (c, m) => { console.log(`  ${c ? '✓' : '✗'} ${m}`); if (!c) fails++; };

for (const vp of [{ w: 390, h: 844 }, { w: 1440, h: 900 }]) {
  console.log(`\n[${vp.w}×${vp.h}]`);
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    isMobile: vp.w < 800, hasTouch: vp.w < 800, deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const errors = [];
  const failed = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 200)));
  page.on('requestfailed', (r) => failed.push(r.url().slice(0, 80)));

  await page.goto('http://localhost:4199/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  ok(errors.length === 0, `no console errors${errors.length ? ' — ' + errors[0] : ''}`);
  ok(failed.length === 0, `no failed requests${failed.length ? ' — ' + failed[0] : ''}`);

  // Nothing may reach out to the network: every asset must be embedded.
  const external = await page.evaluate(() =>
    performance.getEntriesByType('resource')
      .map((e) => e.name)
      .filter((n) => !n.startsWith('data:') && !n.includes('localhost:4199'))
  );
  ok(external.length === 0, `no external requests${external.length ? ' — ' + external[0] : ''}`);

  ok(await page.$('.hero') !== null, 'hero rendered');
  ok((await page.$$('.work-fig')).length === 6, 'gallery frames present');
  ok(await page.$('#studio .claims') !== null, 'claims band present');

  const heroImg = await page.evaluate(() => {
    const i = document.querySelector('.hero-media img');
    return i ? { complete: i.complete, w: i.naturalWidth, dataUri: i.currentSrc.startsWith('data:') } : null;
  });
  ok(heroImg?.complete && heroImg.w > 0, `hero image decoded (${heroImg?.w}px)`);
  ok(heroImg?.dataUri === true, 'hero image served from an embedded data URI');

  // Scroll into the PPF section and confirm a renderer took over.
  await page.evaluate(() => document.getElementById('protection')?.scrollIntoView());
  await page.waitForTimeout(2000);
  const canvas = await page.evaluate(() => {
    const c = document.querySelector('.ppf-canvas');
    return { live: c?.classList.contains('is-live'), w: c?.width, h: c?.height };
  });
  ok(canvas.live === true, `PPF canvas live (${canvas.w}×${canvas.h})`);

  const fonts = await page.evaluate(() => document.fonts.check('700 40px "Space Grotesk"'));
  ok(fonts === true, 'embedded display font loaded');

  const overflow = await page.evaluate(() => {
    const d = document.documentElement;
    return d.scrollWidth > d.clientWidth + 1 ? `${d.scrollWidth}>${d.clientWidth}` : null;
  });
  ok(overflow === null, `no horizontal overflow${overflow ? ' — ' + overflow : ''}`);

  const wa = await page.$$eval('a[href^="https://wa.me/"]', (a) => a.length);
  ok(wa >= 5, `${wa} WhatsApp CTAs live`);

  await ctx.close();
}

await browser.close();
server.close();
console.log(fails === 0 ? '\n✓ PREVIEW FILE VERIFIED' : `\n✗ ${fails} problem(s)`);
process.exit(fails ? 1 : 0);
