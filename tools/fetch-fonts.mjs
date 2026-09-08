/**
 * Downloads the woff2 files for the two OFL families used by the concept and
 * writes a local @font-face sheet. Google Fonts is the only font source the
 * session's egress policy allows; both families are SIL Open Font License,
 * so self-hosting is permitted.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = new URL('../public/fonts/', import.meta.url).pathname;

// Latin-only subsets keep the payload small; the site is English-language.
const FAMILIES = [
  { css: 'Space+Grotesk:wght@400;500;600;700', slug: 'space-grotesk' },
  { css: 'Inter:wght@400;500;600', slug: 'inter' },
];

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const faces = [];

await mkdir(OUT, { recursive: true });

for (const fam of FAMILIES) {
  const url = `https://fonts.googleapis.com/css2?family=${fam.css}&display=swap`;
  const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();

  // Each @font-face block carries one subset; keep latin + latin-ext only.
  const blocks = css.split('@font-face').slice(1);
  let n = 0;
  for (const block of blocks) {
    const subset = /\/\*\s*([a-z-]+)\s*\*\//.exec(css.slice(0, css.indexOf(block))) || [];
    const src = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/.exec(block);
    const weight = /font-weight:\s*(\d+)/.exec(block);
    const family = /font-family:\s*'([^']+)'/.exec(block);
    const range = /unicode-range:\s*([^;]+);/.exec(block);
    if (!src || !weight || !family) continue;
    // The last comment before the block names the subset.
    const before = css.slice(0, css.indexOf(block));
    const m = [...before.matchAll(/\/\*\s*([a-z-]+)\s*\*\//g)].pop();
    const name = m ? m[1] : `s${n}`;
    if (!/^latin(-ext)?$/.test(name)) continue;

    const file = `${fam.slug}-${weight[1]}-${name}.woff2`;
    const buf = Buffer.from(
      await (await fetch(src[1], { headers: { 'User-Agent': UA } })).arrayBuffer()
    );
    await writeFile(join(OUT, file), buf);
    faces.push(
      `@font-face{font-family:'${family[1]}';font-style:normal;font-weight:${weight[1]};` +
        `font-display:swap;src:url('/fonts/${file}') format('woff2');` +
        (range ? `unicode-range:${range[1].trim()};` : '') +
        `}`
    );
    n++;
    console.log('  ✓', file, (buf.length / 1024).toFixed(1) + 'kb');
  }
}

await writeFile(join(OUT, 'fonts.css'), faces.join('\n') + '\n');
console.log(`\nWrote ${faces.length} @font-face rules to public/fonts/fonts.css`);
