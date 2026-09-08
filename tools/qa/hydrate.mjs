/** Catches hydration mismatches, which only surface as console warnings. */
import { chromium } from 'playwright';
const browser = await chromium.launch();
let bad = 0;
for (const vp of [{ w: 390, h: 844 }, { w: 1440, h: 900 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.w < 800, hasTouch: vp.w < 800 });
  const page = await ctx.newPage();
  const msgs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') msgs.push(`${m.type()}: ${m.text().slice(0, 220)}`); });
  page.on('pageerror', (e) => msgs.push('pageerror: ' + String(e).slice(0, 220)));
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const hydration = msgs.filter((m) => /hydrat|did not match|server HTML|Text content does not match/i.test(m));
  console.log(`${vp.w}x${vp.h}: ${msgs.length} console msg(s), ${hydration.length} hydration-related`);
  msgs.slice(0, 5).forEach((m) => console.log('   ' + m));
  if (hydration.length) bad++;
  await ctx.close();
}
await browser.close();
console.log(bad === 0 ? '\n✓ no hydration mismatches' : `\n✗ ${bad} viewport(s) with hydration problems`);
