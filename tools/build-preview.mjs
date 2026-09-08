/**
 * Builds a single self-contained HTML file for the shareable preview.
 *
 * The Artifact host serves one page and blocks every external origin, so the
 * CSS, JS, fonts and images all have to live inside the file. It also supplies
 * its own <!doctype>/<html>/<head>/<body>, so this emits page content only.
 *
 *   node tools/build-preview.mjs
 *
 * Output: preview/morphed-preview.html
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../', import.meta.url).pathname;
const OUT_DIR = join(ROOT, 'preview');
const npx = (args) => execFileSync('npx', args, { cwd: ROOT, stdio: 'inherit' });

/* ---------- 1. build ----------------------------------------------------- */
console.log('· building client (single chunk)…');
npx(['vite', 'build', '--mode', 'singlefile']);

console.log('· building SSR entry for prerender…');
npx(['vite', 'build', '--ssr', 'src/entry-server.tsx', '--outDir', 'dist-ssr']);

const { render } = await import(pathToFileURL(join(ROOT, 'dist-ssr/entry-server.js')).href);
const prerendered = render();

/* ---------- 2. gather ---------------------------------------------------- */
const A = join(ROOT, 'dist-preview/assets');
const files = readdirSync(A);
const jsName = files.find((f) => f.endsWith('.js'));
const cssName = files.find((f) => f.endsWith('.css'));

let js = readFileSync(join(A, jsName), 'utf8');
let css = readFileSync(join(A, cssName), 'utf8');

/* ---------- 3. fonts ----------------------------------------------------- */
// Drop the latin-ext subsets: the page is English, and they would roughly
// double the embedded font payload for glyphs that never render.
const before = (css.match(/@font-face/g) || []).length;
css = css.replace(/@font-face\{[^}]*-latin-ext\.woff2[^}]*\}/g, '');
const after = (css.match(/@font-face/g) || []).length;
console.log(`· fonts: kept ${after} of ${before} faces (latin only)`);

let fontBytes = 0;
css = css.replace(/url\(\/fonts\/([^)]+\.woff2)\)/g, (_m, file) => {
  const buf = readFileSync(join(ROOT, 'public/fonts', file));
  fontBytes += buf.length;
  return `url(data:font/woff2;base64,${buf.toString('base64')})`;
});

/* ---------- 4. images ---------------------------------------------------- */
// Referenced by absolute URL from JSX and srcset, so Vite never sees them.
const webps = readdirSync(join(ROOT, 'public/assets')).filter((f) => f.endsWith('.webp'));
const dataUris = new Map();
let imgBytes = 0;
for (const f of webps) {
  const buf = readFileSync(join(ROOT, 'public/assets', f));
  imgBytes += buf.length;
  dataUris.set(`/assets/${f}`, `data:image/webp;base64,${buf.toString('base64')}`);
}
// Longest paths first so a shorter name can never match inside a longer one.
const paths = [...dataUris.keys()].sort((a, b) => b.length - a.length);
const inlineImages = (text) => {
  let used = 0;
  for (const p of paths) {
    if (!text.includes(p)) continue;
    used++;
    text = text.split(p).join(dataUris.get(p));
  }
  return [text, used];
};

let html = prerendered;
let usedInHtml;
let usedInJs;
[html, usedInHtml] = inlineImages(html);
[js, usedInJs] = inlineImages(js);
console.log(`· images: ${webps.length} available, ${usedInHtml} inlined in markup, ${usedInJs} in script`);

/* ---------- 5. assemble --------------------------------------------------- */
// No <!doctype>/<html>/<head>/<body>: the host wraps this. The no-js class
// lives on <html>, which cannot be set here, so the no-JS notice is simply
// never shown — correct, since the preview always runs with scripting on.
const page = `<title>Morphed Detailing Studio — Unofficial Website Concept</title>
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<style>
${css}
</style>

<div id="root">${html}</div>

<script type="module">
${js}
</script>
`;

mkdirSync(OUT_DIR, { recursive: true });
const outFile = join(OUT_DIR, 'morphed-preview.html');
writeFileSync(outFile, page);

rmSync(join(ROOT, 'dist-ssr'), { recursive: true, force: true });
rmSync(join(ROOT, 'dist-preview'), { recursive: true, force: true });

const kb = (n) => (n / 1024).toFixed(0) + ' kB';
console.log(`
  css      ${kb(css.length)}
  js       ${kb(js.length)}
  fonts    ${kb(fontBytes)} raw
  images   ${kb(imgBytes)} raw
  ─────────────────────────
  TOTAL    ${kb(page.length)}  →  preview/morphed-preview.html`);
