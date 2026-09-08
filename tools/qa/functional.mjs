/** Link integrity, no-JS content, keyboard navigation and menu focus behaviour. */
import { chromium } from 'playwright';

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const URL = 'http://localhost:4173/';
const REPO = new global.URL('../../', import.meta.url).pathname;
const browser = await chromium.launch();
let fails = 0;
const ok = (c, m) => { console.log(`  ${c ? '✓' : '✗'} ${m}`); if (!c) fails++; };

/* ---------- 0. Instagram handle ----------------------------------------- */
// The studio's Instagram handle has ONE d: morphe|detailingstudio, verified
// 2026-09-08 from a live screenshot of the profile (10.9K followers, 85 posts).
// The double-d spelling is a DIFFERENT, much smaller account (2,764 followers,
// 95 posts) and must never be linked.
//
// What is dangerous is a *link* to that account or a *displayed handle* for it,
// not a prose mention — docs/VERIFIED-FACTS.md has to be able to name it in
// order to warn against it. So the scan flags the double-d token only where it
// is preceded by "instagram.com/" or by "@", and exempts "youtube.com/@", whose
// handle is genuinely the double-d spelling (a separate platform namespace).
//
// Both needles are assembled from fragments deliberately: written out literally
// they would match this file and the check would trip over itself.
const IG_HANDLE = 'morphe' + 'detailingstudio';
const OTHER_ACCOUNT = 'morphed' + 'detailingstudio';
const YT_PREFIX = 'youtube.com/@';

console.log('\n[INSTAGRAM HANDLE]');
{
  const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'dist-ssr', '.qa']);
  const SKIP_FILES = new Set(['package-lock.json']);
  const TEXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|html|md|json|txt|yml|yaml)$/i;

  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry) || SKIP_FILES.has(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!TEXT.test(entry)) continue;
      readFileSync(full, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          let from = 0;
          for (;;) {
            const at = line.indexOf(OTHER_ACCOUNT, from);
            if (at === -1) break;
            from = at + OTHER_ACCOUNT.length;

            const before = line.slice(0, at);
            if (before.endsWith(YT_PREFIX)) continue; // the real YouTube handle
            const isLink = before.endsWith('instagram.com/');
            const isHandle = before.endsWith('@');
            if (isLink || isHandle) {
              offenders.push(`${relative(REPO, full)}:${i + 1}`);
            }
          }
        });
    }
  };
  walk(REPO);

  ok(
    offenders.length === 0,
    `the other account is never linked or shown as a handle${
      offenders.length ? ' \u2014 found in ' + [...new Set(offenders)].join(', ') : ''
    }`
  );
}

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
  const IG_URL = `https://www.instagram.com/${IG_HANDLE}/`;
  ok(uniq.some((l) => l.href === IG_URL), 'Instagram link correct');
  // Every Instagram href must be the single-d account…
  const igHrefs = links.filter((l) => /instagram\.com/i.test(l.href || ''));
  ok(
    igHrefs.length > 0 && igHrefs.every((l) => (l.href || '').includes(`/${IG_HANDLE}`)),
    `all ${igHrefs.length} instagram.com links point at the single-d account`
  );
  ok(
    !links.some((l) => (l.href || '').includes(`instagram.com/${OTHER_ACCOUNT}`)),
    'no link to the other Instagram account'
  );
  // …and any anchor whose visible text shows a handle must carry a matching
  // href. A correct label over a wrong href is the failure mode here.
  const handleLabelled = links.filter((l) => /@morphe/i.test(l.text || ''));
  ok(
    handleLabelled.every((l) => l.href === IG_URL),
    `every anchor labelled with the handle links to it (${handleLabelled.length} checked)`
  );
  ok(
    uniq.some((l) => l.href === 'https://www.facebook.com/MorphedDetailingStudio/'),
    'Facebook link correct'
  );
  ok(
    !uniq.some((l) => /magicpin|justdial|trustpilot|yelp/i.test(l.href || '')),
    'no third-party review-site link anywhere on the page'
  );
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

  // The studio's own attributed self-description is exempt from the banned-word
  // scan: "certified" is prohibited as our assertion, permitted as their quoted
  // claim. Everything outside this block is still held to the full list.
  const attributedParts = await page.evaluate(() => {
    const sec = document.getElementById('studio');
    if (!sec) return [];
    return [...sec.querySelectorAll('.claims, .claims-src')].map((n) => n.textContent || '');
  });
  ok(attributedParts.length > 0, 'attributed self-claims block found');
  const attributed = attributedParts.join(' ');
  // Cut each block out separately: body.textContent concatenates them with no
  // separator, so removing the joined string would never match.
  let unattributed = body;
  for (const part of attributedParts) unattributed = unattributed.split(part).join(' ');

  const banned = [
    'warranty', 'guarantee', 'lifetime', 'self-healing', 'scratch-proof',
    'award', 'certified', 'authorised dealer', 'authorized dealer',
    'years of experience', 'best in', 'number one', 'testimonial',
    'before and after result', '₹', 'microns', 'micron',
  ];
  const hits = banned.filter((b) => new RegExp(b, 'i').test(unattributed));
  ok(
    hits.length === 0,
    `no prohibited claim language outside the attributed block${hits.length ? ' \u2014 found: ' + hits : ''}`
  );
  // …and the exemption must not become a loophole: the claims block may only
  // contain the three sanctioned lines plus their attribution.
  ok(
    !/warrant|guarantee|lifetime|self-heal|scratch-proof|award|micron|₹/i.test(attributed),
    'attributed block itself carries no prohibited claim'
  );

  /* ---- no third-party rating may reappear ------------------------------ */
  // The Magicpin 4.7 / 598 figure could not be re-verified (2026-09-08) and was
  // removed. These patterns fail the build if any numeric third-party rating
  // finds its way back into the markup, in any wording.
  const html = await page.content();
  // Also scan with tags stripped: a score split across elements
  // (`<span>4.9</span> out of 5`) reads as plain text to a visitor but not to a
  // pattern run over raw markup. The removed rating was structured exactly so.
  const stripped = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  const haystacks = [html, stripped];
  const ratingPatterns = [
    [/\b\d(?:[.,]\d)?\s*(?:\/|out\s+of)\s*5\b/i, 'an "N/5" or "N out of 5" score'],
    [/\b\d[\d,]*\s+(?:online\s+|verified\s+|google\s+)?(?:ratings|reviews)\b/i, 'a count of ratings/reviews'],
    [/\b(?:rated|rating|reviews?)\b[^.<>]{0,24}\b\d(?:[.,]\d)\b/i, 'a numeric rating phrase'],
    [/\b\d(?:[.,]\d)?\s*(?:★|stars?\b)/i, 'a star score'],
    [/\bmagicpin\b/i, 'a Magicpin reference'],
    [/\bjustdial\b/i, 'a JustDial reference'],
    [/\btrustpilot\b/i, 'a Trustpilot reference'],
    [/\bgoogle\s+(?:rating|review|star)/i, 'a Google rating reference'],
    [/\b4\.7\b/, 'the removed 4.7 figure'],
    [/\b598\b/, 'the removed 598 figure'],
  ];
  const reappeared = ratingPatterns
    .filter(([re]) => haystacks.some((h) => re.test(h)))
    .map(([, label]) => label);
  ok(
    reappeared.length === 0,
    `no third-party rating in the markup${reappeared.length ? ' — found ' + reappeared.join('; ') : ''}`
  );
  ok(!/google rating/i.test(body), 'no Google rating reference');

  /* ---- the studio's own claims stay attributed and linked --------------- */
  const studio = await page.evaluate(() => {
    const sec = document.getElementById('studio');
    if (!sec) return null;
    return {
      text: sec.textContent || '',
      igLinks: [...sec.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h === `https://www.instagram.com/${'morphe' + 'detailingstudio'}/`),
    };
  });
  ok(studio !== null, 'studio section present');
  const claims = [
    'Certified Car Detailer',
    'PPF | Ceramic Coating | Detailing | Sunfilms',
    '10,000+ customers trusted us with PPF!',
  ];
  for (const c of claims) {
    ok((studio?.text || '').includes(c), `self-claim present: "${c}"`);
  }
  ok((studio?.igLinks.length || 0) > 0, 'self-claims linked to the Instagram profile');
  ok(/instagram/i.test(studio?.text || ''), 'Instagram named as the source in visible text');
  ok(
    /not an independent review, rating or verified figure/i.test(studio?.text || ''),
    'self-claims carry the "not independent" qualification'
  );
  ok(
    /published by the studio on its own/i.test(studio?.text || ''),
    'self-claims are attributed to the studio itself'
  );
  // The customer figure is the studio's claim; it must never appear unattributed
  // somewhere else on the page.
  const outside = body.replace(studio?.text || '', '');
  ok(
    !/10,000\+/.test(outside),
    'the "10,000+" figure appears only inside the attributed block'
  );
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
