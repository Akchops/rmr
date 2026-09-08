# ASSET-MANIFEST

## Photo swap attempted 2026-09-08 — no files received

A round of work was requested to replace the reserved slots with Morphed's own
photography, downloaded manually and uploaded into the project. **No image files
were present in the environment when that work ran.** Checked: the repository
working tree (clean), the whole filesystem, and the remote branch (no new
commits). The only images on disk were this project's own rendered assets and
render diagnostics.

Nothing was fetched from the blocked domains, and no substitute imagery was
introduced. Every slot below therefore remains reserved, and the gallery, hero
and PPF sections are unchanged. See "What to upload" at the end of this file for
the shot list.

## Status of this build: no Morphed photography is used

**Every one of the studio's own image sources is unreachable from the build
environment.** The session's network egress policy refuses `instagram.com`,
`facebook.com`, `youtube.com`, `detailers.in` and `magicpin.in` at the proxy
(HTTP 403 on CONNECT), and refuses every stock-photography and media host as
well (`unsplash.com`, `images.unsplash.com`, `commons.wikimedia.org`,
`upload.wikimedia.org`, and general web hosts). Only the npm registry, Google
Fonts and the GitHub API are reachable. This was verified directly, not assumed;
it is not an authentication problem and no access restriction was circumvented.

Two options were rejected:

- **Substituting other vehicles.** Photographs of unrelated cars presented under
  Morphed's name — or under labels like "BMW iX1 / PPF work" — would
  misrepresent the studio's work. The brief forbids it and so does basic
  honesty.
- **Leaving the frames empty.** That would not demonstrate the layout.

So every image is a **rendered surface study**: an authored, physically-based
macro render of a clear-coated body panel, produced offline by
`tools/render-assets.mjs`. They are not photographs, they depict no specific or
real vehicle, and the page never claims otherwise. In the gallery each frame is
a labelled **reserved slot** naming the Morphed post that belongs in it.

### Permission status

No third-party material is used, so no permission is outstanding for anything in
this build. **Permission and final asset approval are still required from
Morphed Detailing Studio before any official launch**, at the point their
photography replaces these placeholders. The page states this visibly in the
footer.

## Replacing the placeholders with Morphed's own assets

1. Obtain the photographs or video frames from Morphed, with permission.
2. Optimise to WebP at the widths listed below and drop them into
   `public/assets/` under the same filenames.
3. In `src/data/site.ts`, update each `SLOTS` entry: replace `surface` with a
   description of what the photograph actually shows, and delete the `intended`
   field along with the "Reserved for" line and "Slot NN" chip in
   `src/components/Work.tsx`.
4. Rewrite each `alt` to describe the real photograph.
5. Update `docs/CLAIMS-REGISTER.md` and this file.

Only label a vehicle by model where it is visually clear or explicitly
identified by the source post, and never name a customer.

## Rendered assets

All are authored renders. Source: `tools/presets.mjs` + `tools/surface.mjs`.
Type: rendered still (not a photograph, not an extracted video frame).
Visible vehicle identification: **none** — no badge, plate, model or livery.
Private speculative use: yes, and safe for public use since nothing is
third-party.

| File (base) | Widths emitted | Section | Crop / framing | Intended replacement |
| --- | --- | --- | --- | --- |
| `hero-surface` | 2400, 1600, 1000, 640 | Hero background | Full-bleed cover, focal point 68% / 38% so the crease clears the headline | A wide or close hero frame from the studio's own work |
| `ppf-panel` | 2048, 1280, 800 | PPF visualisation (WebGL texture + no-JS still) | Cover; drives both film states from one image | A high-resolution close-up of a curved, reflective painted panel |
| `svc-ppf` | 1400, 900, 560 | Service 01 — Paint Protection Film | 3:4 portrait, cover | PPF work photograph |
| `svc-coating` | 1400, 900, 560 | Service 02 — Ceramic Coating | 3:4 portrait, cover | Coating work photograph |
| `svc-detailing` | 1400, 900, 560 | Service 03 — Automotive Detailing | 3:4 portrait, cover | Detailing work photograph |
| `svc-wraps` | 1400, 900, 560 | Service 04 — Vehicle Wraps | 3:4 portrait, cover | Wrap work photograph |
| `study-01` | 1600, 1000, 640 | Gallery slot 01 | 16:11 landscape (desktop), 4:5 (mobile) | See slot table below |
| `study-02` | 1200, 800, 520 | Gallery slot 02 | 4:5 portrait | See slot table below |
| `study-03` | 1600, 1000, 640 | Gallery slot 03 | 16:11 / 4:5 | See slot table below |
| `study-04` | 1200, 800, 520 | Gallery slot 04 | 4:5 portrait | See slot table below |
| `study-05` | 1600, 1000, 640 | Gallery slot 05 | 16:11 / 4:5 | See slot table below |
| `study-06` | 1200, 800, 520 | Gallery slot 06 | 4:5 portrait | See slot table below |
| `signal-surface` | 1600, 1000, 640 | Review-signal section | 5:6 portrait, cover | A studio or vehicle frame |
| `studio-dark` | 1800, 1100, 700 | Contact location plot | 3:4, cover, dimmed under a survey grid | An exterior or studio frame, if suitable |

Total: 43 files, 932 KB.

## Gallery slots and the Morphed posts reserved for them

These URLs are recorded from the brief. They were **not** fetched — the host is
blocked — so nothing from them appears in this build.

| Slot | Rendered stand-in | Reserved for | Source URL |
| --- | --- | --- | --- |
| 01 | `study-01` (midnight / crease line) | BMW iX1 — PPF work | https://www.instagram.com/morphedetailingstudio/reel/DcDrVYQPPti/ |
| 02 | `study-02` (silver / soft dome) | BMW X1 — paint protection | https://www.instagram.com/reel/DVOQ3eEk1_R/ |
| 03 | `study-03` (ink / shut line) | MG Hector Plus — studio work | https://www.instagram.com/reel/DUsyippEV4v/ |
| 04 | `study-04` (steel blue / swage) | Tata Sierra — paint protection | https://www.instagram.com/reel/DcAIyd4vpzW/ |
| 05 | `study-05` (bronze / low curvature) | Mahindra Thar — studio work | https://www.instagram.com/p/DPe8I9liTtF/ |
| 06 | `study-06` (graphite / panel edge) | Further work from the studio feed | https://www.instagram.com/morphedetailingstudio/ |

## Logo

No clean official logo could be obtained — the studio's profiles are blocked.
No logo or emblem has been invented. The identity is a restrained typographic
treatment of **MORPHED** in Space Grotesk (see `.nav-mark` in
`src/components/Nav.css`).

## Fonts

| Family | Weights | Licence | Origin |
| --- | --- | --- | --- |
| Space Grotesk | 400, 500, 600, 700 | SIL Open Font License 1.1 | Google Fonts, self-hosted |
| Inter | 400, 500, 600 | SIL Open Font License 1.1 | Google Fonts, self-hosted |

Downloaded by `tools/fetch-fonts.mjs` into `public/fonts/` (latin + latin-ext
subsets only). Self-hosting is permitted by the OFL. Nothing is requested from a
third-party domain at runtime.


## What to upload

For the next attempt, drop the files anywhere in the repository (a top-level
`uploads/` directory is easiest) and say so. Useful per file: which post it came
from, and the vehicle if it is not obvious.

**Minimum usable pixel dimensions.** Instagram exports are typically 1080px on
the long edge, which is fine for gallery frames but marginal for full-bleed use.

| Use | Minimum long edge | Preferred |
| --- | --- | --- |
| Hero (full-bleed, up to 1728px viewport at 2× DPR) | 2000px | 2400px+ |
| PPF shader source | 1600px | 2048px+ |
| Gallery frame (wide) | 1400px | 1600px |
| Gallery frame (tall) | 1100px | 1200px |
| Service panel | 1100px | 1400px |
| Review-signal / contact | 1200px | 1600px |

An image below the minimum keeps its reserved slot rather than being upscaled.

**The PPF shader source is the most specific requirement.** The shader runs a
travelling film front across the surface, and the front only reads if the
surface has continuous, legible reflection structure across the whole frame.
What to shoot:

- A macro or near-macro of a single glossy painted panel — a door, bonnet or
  front wing filling the frame. **Not** a wide shot of a whole car: at that
  scale the film front crosses too much unrelated detail to read as a layer.
- Visible curvature: a swage line, crease or shoulder running through the frame,
  so the front bends over real geometry.
- Long soft reflections from the studio lighting — the streaks that read as
  clearcoat. Avoid flat, evenly-lit matte-looking paint.
- A shut line or panel gap somewhere in frame is a strong bonus; it anchors the
  image as automotive.
- Mid-tone paint holds the effect best. Very dark paint photographs as near-black
  and leaves the front nothing to act on — the current rendered study was
  re-lit twice for exactly this reason.
- No people, plates or badges in focus.

If nothing in the upload meets that, the section keeps the rendered study
`ppf-panel`, which was authored to these constraints.
