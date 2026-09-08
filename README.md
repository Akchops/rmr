# Morphed Detailing Studio — unofficial website concept

A private, speculative one-page website concept for **Morphed Detailing Studio**
(Bengaluru, Karnataka, India), built independently for presentation purposes.

> **The business did not commission or approve this concept.** It is not
> official, it is not indexed (`noindex, nofollow, noarchive, nosnippet`), and it
> must not be presented as the studio's own site.

Stack: Vite + React + TypeScript, GSAP/ScrollTrigger for scroll choreography,
Three.js for one signature WebGL interaction. No backend, no database, no
analytics, no cookies, no tracking, no third-party runtime requests.

---

## Install

```bash
npm install
```

Node 20+ (developed on 22).

## Local development

```bash
npm run dev          # http://localhost:5173
```

Note: `npm run dev` serves the client only. The prerendered HTML that makes the
page work without JavaScript is produced by the production build.

## Production build

```bash
npm run build        # → dist/
```

This runs three steps: a typecheck, the client build, and an SSR build whose
output is rendered to static markup and injected into `dist/index.html` by
`tools/prerender.mjs` (the `dist-ssr/` directory is removed afterwards).

## Preview the production build

```bash
npm run preview      # http://localhost:4173
```

## Deployment

`dist/` is a static directory — deploy it to any static host (Netlify, Vercel,
Cloudflare Pages, S3, nginx). There is nothing to configure and no server-side
runtime.

Because the concept is private:

- keep `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">`
  in `index.html`;
- do not add a sitemap;
- do not add structured data that represents this as the business's official
  site;
- prefer an unlisted URL, and add HTTP auth if the host offers it.

## Shareable preview (single file)

```bash
npm run preview:build     # → preview/morphed-preview.html
```

Produces one self-contained HTML file with the CSS, JS, fonts and images all
embedded as data URIs, and the markup prerendered. It makes **zero external
requests**, so it works from a file:// URL, any static host, or an environment
that blocks outbound traffic — which is what the Artifact host requires.

Two differences from `npm run build`, both deliberate:

- Dynamic imports are inlined (`--mode singlefile`), so three.js loads upfront
  instead of lazily. One file cannot code-split.
- Only the latin font subsets are embedded; latin-ext would roughly double the
  font payload for glyphs this page never renders.

The output omits `<!doctype>`, `<html>`, `<head>` and `<body>` because the
Artifact host supplies them. To open it standalone, wrap it in a minimal
document — `tools/qa/preview-check.mjs` does exactly that and verifies the
result renders, runs WebGL, loads its embedded fonts and makes no network
requests.

## Regenerating assets

Neither command is needed for a normal build; both are already committed.

```bash
npm run assets       # re-render the surface studies  (~4 min, all 14)
npm run assets hero-surface ppf-panel   # or just the ones you changed
npm run fonts        # re-download and re-subset the self-hosted fonts
```

---

## Where things live

| What | Where |
| --- | --- |
| **All business facts** — phone, email, address, links, services, rating | `src/data/site.ts` (single source of truth) |
| Fact provenance | `docs/VERIFIED-FACTS.md` |
| **Asset sources, crops and permission status** | `docs/ASSET-MANIFEST.md` |
| Every claim on the page and its source | `docs/CLAIMS-REGISTER.md` |
| Design tokens, typography, buttons | `src/styles/global.css` |
| Sections | `src/components/` (one `.tsx` + one `.css` each) |
| PPF shader | `src/webgl/ppfShader.ts` |
| PPF WebGL scene | `src/webgl/ppfScene.ts` |
| PPF Canvas 2D fallback | `src/webgl/ppfFallback.ts` |
| Offline image renderer | `tools/surface.mjs`, `tools/presets.mjs`, `tools/render-assets.mjs` |
| QA harness | `tools/qa/` |

To change a phone number, address or link, edit `src/data/site.ts` only — every
component reads from it.

---

## The PPF interaction

The signature moment is a scroll-pinned visualisation of paint protection film
travelling across a vehicle panel (`src/components/PpfReveal.tsx`).

- A pinned `100svh` stage, scrubbed by ScrollTrigger over `+=190%` of scroll on
  desktop and `+=140%` on narrow screens.
- A full-screen fragment shader samples one photograph-style texture and, behind
  a curved travelling front, raises gloss and local contrast and bends the
  reflections very slightly. **Both sides sample the same texture** — this is
  deliberate, so the interaction can never read as a before/after result.
- The front follows a Bézier-like curved route, not a straight wipe, with a
  specular edge, a restrained accent trace and a soft shadow just ahead of it.
- `devicePixelRatio` is capped (1.5 on phones, 1.75 elsewhere), the render loop
  runs **only** while the section is on screen, and the scene is disposed —
  texture, material, geometry, renderer, and the WebGL context itself — on
  unmount.
- Three.js is a lazy `import()`, so it is not downloaded until the section is
  about to enter the viewport.

### Adjusting it

| Change | Where |
| --- | --- |
| Scroll length of the pin | `end:` in the ScrollTrigger in `PpfReveal.tsx` |
| When the front starts/stops moving | the `travel` remap in `onUpdate` |
| Shape of the film edge | `frontDistance()` in `ppfShader.ts` (`curve` terms) |
| Strength of refraction, gloss, edge | the marked blocks in `ppfShader.ts` |
| Source image | `TEXTURE_LARGE` / `TEXTURE_SMALL` in `PpfReveal.tsx` |
| Effect strength overall | the `uIntensity` uniform |

### Disabling it

Replace `<PpfReveal />` in `src/App.tsx` with the static image and copy, or
force the fallback by making `createPpfScene` throw immediately. The section's
markup, headline, body copy and disclosure are plain DOM and survive either way.

### How the fallbacks work

The component tries three renderers in order and settles on the first that
works:

1. **WebGL** — a support probe runs *before* Three.js is constructed, so a
   device without WebGL produces no console errors.
2. **Canvas 2D** (`ppfFallback.ts`) — same texture, same curved front traced as
   a `Path2D`, gloss lift via a canvas filter (with a compositing path where
   `ctx.filter` is unsupported), plus the specular and accent edge. Optical
   refraction is the only thing lost.
3. **Static image** — if neither canvas starts, the `<img>` underneath the
   canvas simply stays visible. There is no error message and no empty black
   section at any point; the image is present from first paint.

**Reduced motion** (`prefers-reduced-motion: reduce`) is a designed state, not a
disabled one: no pin, no scrubbing, no pointer-driven reflections, no smooth
scrolling. The visualisation sits at a readable mid-state and gains a labelled
range slider so the viewer can move the film themselves. All copy, CTAs and
gallery navigation remain.

**No JavaScript**: `dist/index.html` ships the fully prerendered page, so the
navigation, headings, service descriptions, imagery, contact links, the primary
WhatsApp link and all disclaimers are present and usable. The client hydrates
that markup rather than replacing it.

---

## QA

With a preview server running on port 4173:

```bash
node tools/qa/shoot.mjs --tag base      # 6 viewports × 9 scroll depths:
                                        # console errors, failed requests, overflow
node tools/qa/functional.mjs            # links, factual guardrails, semantics,
                                        # keyboard, menu focus, no-JS
node tools/qa/hydrate.mjs               # hydration mismatches
node tools/qa/ppf.mjs --tag ppf         # scrub the PPF section through its range
node tools/qa/ppf.mjs --nowebgl         # …with WebGL disabled
node tools/qa/ppf.mjs --reduced         # …under prefers-reduced-motion

node tools/qa/preview-check.mjs         # the single-file preview, wrapped as
                                        # the Artifact host wraps it
```

Screenshots are written to `.qa/<tag>/`.

`functional.mjs` also acts as a factual guard. It fails if:

- prohibited claim language (warranty, guarantee, lifetime, self-healing,
  scratch-proof, awards, certifications, prices, micron figures, testimonials…)
  appears **outside** the studio's attributed self-claims block — and separately
  if any of it appears **inside** that block;
- any numeric third-party rating reappears in the rendered page, in any wording,
  including one split across elements (`<span>4.9</span> out of 5`) or a link to
  Magicpin, JustDial, Trustpilot or Yelp;
- the Instagram self-claims lose their text, their visible attribution, or their
  link to the profile;
- the double-d Instagram handle appears anywhere in the repository outside the
  YouTube URL (that account is a different, much smaller one), any
  `instagram.com` link points at it, or an anchor labelled with the handle
  carries a href that does not match the label;
- the "10,000+ customers" figure appears anywhere outside the attributed block;
- any required disclosure is missing.

The rating that previously ran in this section was removed on 2026-09-08 because
it could not be re-verified. See `docs/VERIFIED-FACTS.md` → "Removed /
unverified" before considering reinstating anything like it.
