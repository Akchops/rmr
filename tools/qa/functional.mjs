/** Link integrity, no-JS content, keyboard navigation and menu focus behaviour. */
import { chromium } from 'playwright';

const URL = 'http://localhost:4173/';
const browser = await chromium.launch();
let fails = 0;
const ok = (c, m) => { console.log(`  ${c ? '✓' : '✗'} ${m}`); if (!c) fails++; };

/* ---------- 1. links ---------------------------------------------------- */
console.log('\n[LINKS]');
{
  const page = await (await browser.newContext()).newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  const links = await page.$$eval('a[href]', (as) =>
    as.map((a) => ({
      href: a.getAttribute('href'),
      text: (a.textContent || '').trim().slice(0, 40),
      target: a.getAttribute('target'),
      rel: a.getAttribute('rel'),
    }))
  );
  const uniq = [...new Map(links.map((l) => [l.href, l])).values()];
  for (const l of uniq) console.log(`     ${l.href}`);

  // Count every occurrence, not the deduplicated set: the same URL is meant to
  // appear on several CTAs.
  const wa = links.filter((l) => l.href.startsWith('https://wa.me/'));
  ok(wa.length >= 5, `${wa.length} WhatsApp CTAs present`);
  ok(
    wa.every((l) => l.href === 'https://wa.me/917624833840?text=Hi%20Morphed%20Detailing%20Studio%2C%20I%27d%20like%20to%20discuss%20protecting%20my%20vehicle.'),
    'WhatsApp URL exactly matches the brief (number + prefilled text)'
  );
  ok(uniq.some((l) => l.href === 'tel:+917624833840'), 'tel: link correct');
  ok(uniq.some((l) => l.href === 'mailto:morpheddetailing@gmail.com'), 'mailto: link correct');
  ok(
    uniq.some((l) => l.href === 'https://www.instagram.com/morphedetailingstudio/'),
    'Instagram link correct'
  );
  ok(
    uniq.some((l) => l.href === 'https://www.facebook.com/MorphedDetailingStudio/'),
    'Facebook link correct'
  );
  ok(uniq.some((l) => l.href.includes('magicpin.in')), 'Magicpin rating link present');
  ok(
    uniq.some((l) => l.href.includes('google.com/maps/search/') && l.href.includes('560086')),
    'Directions link built from the verified address'
  );
  ok(
    links.filter((l) => l.target === '_blank').every((l) => (l.rel || '').includes('noopener')),
    'every _blank link carries rel=noopener'
  );

  /* ---------- 2. factual guardrails ------------------------------------- */
  console.log('\n[FACTS]');
  const body = (await page.textContent('body')) || '';
  const banned = [
    'warranty', 'guarantee', 'lifetime', 'self-healing', 'scratch-proof',
    'award', 'certified', 'authorised dealer', 'authorized dealer',
    'years of experience', 'best in', 'number one', 'testimonial',
    'before and after result', '₹', 'microns', 'micron',
  ];
  const hits = banned.filter((b) => new RegExp(b, 'i').test(body));
  ok(hits.length === 0, `no prohibited claim language${hits.length ? ' — found: ' + hits : ''}`);
  ok(/4\.7/.test(body) && /598/.test(body) && /Magicpin/i.test(body), 'rating attributed to Magicpin');
  ok(!/google rating/i.test(body), 'rating never presented as a Google rating');
  ok(
    /did not commission or approve this concept/i.test(body),
    'unofficial-concept disclaimer present'
  );
  ok(
    /Permission and final asset approval are required/i.test(body),
    'asset-permission disclaimer present'
  );
  ok(
    /Not an actual before-and-after result/i.test(body),
    'PPF illustrative disclosure present'
  );

  /* ---------- 3. document semantics ------------------------------------- */
  console.log('\n[SEMANTICS]');
  const h1 = await page.$$eval('h1', (n) => n.length);
  ok(h1 === 1, `exactly one h1 (found ${h1})`);
  const order = await page.$$eval('h1,h2,h3', (n) => n.map((e) => e.tagName));
  let jump = false;
  let prev = 1;
  for (const t of order) {
    const lvl = Number(t[1]);
    if (lvl > prev + 1) jump = true;
    prev = lvl;
  }
  ok(!jump, `no skipped heading levels (${order.join(' ')})`);
  ok(await page.$('main#main') !== null, '<main> landmark present');
  ok(await page.$('header.nav') !== null, '<header> landmark present');
  ok(await page.$('footer') !== null, '<footer> landmark present');
  const robots = await page.getAttribute('meta[name="robots"]', 'content');
  ok(/noindex/.test(robots || ''), `robots noindex set (${robots})`);
  const noAlt = await page.$$eval('img', (i) => i.filter((e) => e.getAttribute('alt') === null).length);
  ok(noAlt === 0, `every <img> has an alt attribute (${noAlt} missing)`);
  const noDim = await page.$$eval('img', (i) =>
    i.filter((e) => !e.getAttribute('width') || !e.getAttribute('height')).length
  );
  ok(noDim === 0, `every <img> has width/height (${noDim} missing)`);

  await page.context().close();
}

/* ---------- 4. keyboard + mobile menu ----------------------------------- */
console.log('\n[KEYBOARD / MENU]');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });

  ok(!(await page.isVisible('#nav-panel')), 'mobile menu closed on load');

  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => document.activeElement?.className || '');
  ok(first.includes('skip'), `first tab stop is the skip link (${first})`);

  await page.click('.nav-toggle');
  await page.waitForTimeout(400);
  ok(await page.isVisible('#nav-panel'), 'menu opens');
  ok(
    await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden'),
    'body scroll locked while menu is open'
  );
  ok(
    await page.evaluate(() => document.activeElement?.closest('#nav-panel') !== null),
    'focus moves into the panel'
  );

  // Tab past the last item should wrap to the first, not escape the panel.
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  ok(
    await page.evaluate(() => document.activeElement?.closest('#nav-panel') !== null),
    'focus stays trapped inside the panel'
  );

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  ok(!(await page.isVisible('#nav-panel')), 'Escape closes the menu');
  ok(
    await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden'),
    'body scroll restored'
  );
  ok(
    await page.evaluate(() => document.activeElement?.classList.contains('nav-toggle')),
    'focus returns to the toggle'
  );
  await ctx.close();
}

/* ---------- 5. service tabs by keyboard --------------------------------- */
console.log('\n[SERVICE TABS]');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.focus('#svc-tab-01');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);
  ok(
    await page.evaluate(() => document.getElementById('svc-tab-02')?.getAttribute('aria-selected') === 'true'),
    'ArrowDown moves the active service'
  );
  ok(
    await page.evaluate(() => !document.getElementById('svc-panel-02')?.hasAttribute('hidden')),
    'matching panel becomes visible'
  );
  await ctx.close();
}

/* ---------- 6. no JavaScript -------------------------------------------- */
console.log('\n[NO-JS]');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  const text = (await page.textContent('body')) || '';
  ok(text.trim().length > 0, `page renders content without JS (${text.trim().length} chars)`);
  const noscriptLinks = await page.$$eval('a[href]', (a) => a.map((x) => x.getAttribute('href')));
  ok(noscriptLinks.some((h) => h?.startsWith('https://wa.me/')), 'WhatsApp link available without JS');
  ok(/did not commission or approve/i.test(text), 'disclaimer available without JS');
  await ctx.close();
}

await browser.close();
console.log(`\n${fails === 0 ? '✓ ALL FUNCTIONAL CHECKS PASSED' : `✗ ${fails} CHECK(S) FAILED`}`);
process.exit(fails === 0 ? 0 : 1);
