/**
 * Verifies scroll reveals replay on every pass and never strand an element
 * hidden. Walks the page down, back up, and down again.
 */
import { chromium } from 'playwright';

const w = Number(process.argv[process.argv.indexOf('--w') + 1]) || 1440;
const h = Number(process.argv[process.argv.indexOf('--h') + 1]) || 900;
const reduced = process.argv.includes('--reduced');

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: w, height: h },
  isMobile: w < 800, hasTouch: w < 800,
  reducedMotion: reduced ? 'reduce' : 'no-preference',
});
const page = await ctx.newPage();
let fails = 0;
const ok = (c, m) => { console.log(`  ${c ? '✓' : '✗'} ${m}`); if (!c) fails++; };

await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const SELECTORS = await page.evaluate(() =>
  [...document.querySelectorAll('[data-reveal]')].map((n, i) => {
    n.setAttribute('data-reveal-id', String(i));
    return { id: i, sel: n.className.toString().split(' ').slice(0, 2).join('.'), kind: n.dataset.reveal };
  })
);
console.log(`\n${SELECTORS.length} reveal targets, viewport ${w}×${h}${reduced ? ', reduced motion' : ''}`);

/** Opacity of the element (or its first child for staggered containers). */
const opacityOf = (id) =>
  page.evaluate((i) => {
    const n = document.querySelector(`[data-reveal-id="${i}"]`);
    if (!n) return null;
    const target = n.dataset.reveal === 'stagger' ? n.firstElementChild : n;
    if (!target) return null;
    const cs = getComputedStyle(target);
    const r = target.getBoundingClientRect();
    return {
      opacity: Number(cs.opacity),
      clip: cs.clipPath,
      inView: r.top < innerHeight && r.bottom > 0,
    };
  }, id);

const instant = process.argv.includes('--instant');
const scrollTo = async (id) => {
  await page.evaluate(([i, inst]) => {
    const n = document.querySelector(`[data-reveal-id="${i}"]`);
    if (!n) return;
    if (inst) {
      const r = n.getBoundingClientRect();
      window.scrollTo({ top: scrollY + r.top - (innerHeight - r.height) / 2, behavior: 'auto' });
    } else {
      n.scrollIntoView({ block: 'center' });
    }
  }, [id, instant]);
};

async function pass(label, order) {
  console.log(`\n[${label}]`);
  let animated = 0;
  let visible = 0;
  const stranded = [];
  for (const t of order) {
    await scrollTo(t.id);
    // Sample immediately: mid-animation the element should not yet be settled.
    await page.waitForTimeout(60);
    const early = await opacityOf(t.id);
    // …then after it has had time to finish.
    await page.waitForTimeout(1100);
    const late = await opacityOf(t.id);
    if (!late) continue;
    if (late.opacity > 0.95) visible++;
    else stranded.push(`${t.sel} (${t.kind}) opacity=${late.opacity.toFixed(2)}`);
    // A reveal ran if it was mid-flight when first sampled.
    const moved =
      early && (early.opacity < 0.95 || (early.clip && early.clip !== 'none' && early.clip !== late.clip));
    if (moved) animated++;
  }
  ok(stranded.length === 0, `all ${order.length} targets visible after settling${stranded.length ? ' — STRANDED: ' + stranded.join('; ') : ''}`);
  return animated;
}

const down = SELECTORS;
const up = [...SELECTORS].reverse();

const a1 = await pass('pass 1 — scrolling down', down);
ok(reduced ? a1 === 0 : a1 > 0, reduced
  ? `pass 1: no motion under reduced motion (${a1})`
  : `pass 1: ${a1}/${down.length} reveals animated`);

const a2 = await pass('pass 2 — scrolling back up', up);
ok(reduced ? a2 === 0 : a2 > 0, reduced
  ? `pass 2: no motion under reduced motion (${a2})`
  : `pass 2: ${a2}/${up.length} reveals REPLAYED on the way up`);

const a3 = await pass('pass 3 — scrolling down again', down);
ok(reduced ? a3 === 0 : a3 > 0, reduced
  ? `pass 3: no motion under reduced motion (${a3})`
  : `pass 3: ${a3}/${down.length} reveals REPLAYED on the way down again`);

// The footer disclaimers must never be animated or hidden.
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(800);
const legal = await page.evaluate(() => {
  const p = document.querySelector('.foot-legal p');
  return p ? Number(getComputedStyle(p).opacity) : null;
});
ok(legal !== null && legal > 0.95, `footer disclaimers always visible (opacity ${legal})`);

await browser.close();
console.log(fails === 0 ? '\n✓ REVEALS OK' : `\n✗ ${fails} problem(s)`);
process.exit(fails ? 1 : 0);
