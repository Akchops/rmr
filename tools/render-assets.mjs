/**
 * Renders every surface study to optimised WebP/AVIF in public/assets.
 * Run with: npm run assets   (only needed if presets change)
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { render } from './surface.mjs';
import { PRESETS } from './presets.mjs';

const OUT = new URL('../public/assets/', import.meta.url).pathname;
await mkdir(OUT, { recursive: true });

// name -> [width, height, supersample, widths to emit]
const JOBS = {
  'hero-surface':   [2400, 1500, 2, [2400, 1600, 1000, 640]],
  'ppf-panel':      [2048, 1280, 2, [2048, 1280, 800]],
  'svc-ppf':        [1400, 1750, 2, [1400, 900, 560]],
  'svc-coating':    [1400, 1750, 2, [1400, 900, 560]],
  'svc-detailing':  [1400, 1750, 2, [1400, 900, 560]],
  'svc-wraps':      [1400, 1750, 2, [1400, 900, 560]],
  'study-01':       [1600, 1100, 2, [1600, 1000, 640]],
  'study-02':       [1200, 1500, 2, [1200, 800, 520]],
  'study-03':       [1600, 1100, 2, [1600, 1000, 640]],
  'study-04':       [1200, 1500, 2, [1200, 800, 520]],
  'study-05':       [1600, 1100, 2, [1600, 1000, 640]],
  'study-06':       [1200, 1500, 2, [1200, 800, 520]],
  'studio-dark':    [1800, 1200, 2, [1800, 1100, 700]],
  'signal-surface': [1600, 1400, 2, [1600, 1000, 640]],
};

const only = process.argv.slice(2);
const names = only.length ? only : Object.keys(JOBS);

for (const name of names) {
  const [W, H, ss, widths] = JOBS[name];
  const t0 = Date.now();
  const { rgb, coc } = render(PRESETS[name], W, H, ss);

  const sharpImg = sharp(rgb, { raw: { width: W, height: H, channels: 3 } });

  // Depth-of-field composite: a blurred copy masked by the circle-of-confusion
  // buffer, laid over the sharp render. Cheap, and it reads as macro optics.
  const blurred = await sharpImg
    .clone()
    .blur(Math.max(2, Math.round(W / 260)))
    .ensureAlpha()
    .raw()
    .toBuffer();
  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0, n = W * H; i < n; i++) {
    rgba[i * 4] = blurred[i * 4];
    rgba[i * 4 + 1] = blurred[i * 4 + 1];
    rgba[i * 4 + 2] = blurred[i * 4 + 2];
    rgba[i * 4 + 3] = coc[i];
  }
  // Keep the composite in raw form: sharp cannot re-open an unencoded buffer.
  const composedRaw = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
    .composite([{ input: rgba, raw: { width: W, height: H, channels: 4 }, blend: 'over' }])
    .raw()
    .toBuffer({ resolveWithObject: true });
  const composed = { data: composedRaw.data, raw: { width: W, height: H, channels: composedRaw.info.channels } };

  for (const w of widths) {
    const suffix = w === widths[0] ? '' : `-${w}`;
    // WebP only: universally supported by every browser this concept targets,
    // and it avoids a second, much slower AVIF encode for no visible gain.
    await sharp(composed.data, { raw: composed.raw })
      .resize({ width: w, kernel: 'lanczos3' })
      .webp({ quality: 82, effort: 5 })
      .toFile(`${OUT}${name}${suffix}.webp`);
  }
  console.log(`  ✓ ${name}  ${W}×${H}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
console.log('\nAssets written to public/assets');
