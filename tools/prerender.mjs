/**
 * Injects the prerendered app markup into dist/index.html.
 *
 * The concept has no backend, but the brief requires the page to remain usable
 * with JavaScript unavailable, so the built HTML ships the full DOM and the
 * client hydrates it.
 */
import { readFile, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../', import.meta.url).pathname;

const { render } = await import(pathToFileURL(`${ROOT}dist-ssr/entry-server.js`).href);
const html = await readFile(`${ROOT}dist/index.html`, 'utf8');
const body = render();

if (!html.includes('<div id="root"></div>')) {
  throw new Error('prerender: could not find the empty #root container');
}

const out = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
await writeFile(`${ROOT}dist/index.html`, out);

// The SSR bundle is a build artefact only.
await rm(`${ROOT}dist-ssr`, { recursive: true, force: true });

console.log(`prerendered ${(body.length / 1024).toFixed(1)}kb of markup into dist/index.html`);
