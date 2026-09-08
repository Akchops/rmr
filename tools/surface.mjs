/**
 * Physically-plausible automotive paint surface renderer.
 *
 * Renders macro studies of curved, clear-coated body panels: metallic basecoat
 * under a clearcoat, lit by a procedural studio environment of long softbox
 * strips. The long specular streaks these produce are what make car paint read
 * as car paint, so the environment is modelled rather than faked with gradients.
 *
 * These are authored surface studies. They are NOT photographs, and they do not
 * depict any specific vehicle. See docs/ASSET-MANIFEST.md.
 */

/* ---------- small vector helpers (plain arrays, kept allocation-light) ---- */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const mix = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ---------- hash / value noise ------------------------------------------- */
function hash2(x, y) {
  let h = (x | 0) * 374761393 + (y | 0) * 668265263;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = Math.imul(h ^ (h >>> 16), 2246822519);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967295;
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return mix(mix(a, b, u), mix(c, d, u), v);
}
function fbm(x, y, oct = 4) {
  let s = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += amp * vnoise(x * f, y * f); f *= 2.07; amp *= 0.5; }
  return s;
}

/* ---------- surface height field ----------------------------------------- */
/**
 * Builds h(x,y) for a body panel from a preset. Units are roughly "metres of
 * panel"; the camera sits a short distance in front.
 */
function makeHeight(p) {
  const cr = p.crease;
  return (x, y) => {
    let h = 0;
    // Primary body curvature: a broad domed swell. This is a Gaussian rather
    // than a clamped cosine: clamping the argument freezes the height past the
    // clamp point, and the resulting slope discontinuity draws a hard straight
    // crease across the panel.
    const bx = x * p.domeXf, by = y * p.domeYf;
    h += p.domeX * Math.exp(-0.62 * bx * bx);
    h += p.domeY * Math.exp(-0.62 * by * by);

    // Swage / crease line: a smooth ridge along a rotated axis.
    if (cr) {
      const ca = Math.cos(cr.angle), sa = Math.sin(cr.angle);
      const d = x * sa - y * ca - cr.offset;
      // Sharp-ish ridge with a rounded shoulder.
      h += cr.amp * Math.exp(-(d * d) / (2 * cr.width * cr.width));
      h -= cr.amp * 0.45 * Math.exp(-(d * d) / (2 * (cr.width * 3.2) ** 2));
    }

    // Panel gap: a narrow recessed groove (shut line between two panels).
    if (p.gap) {
      const g = p.gap;
      const ca = Math.cos(g.angle), sa = Math.sin(g.angle);
      const d = x * sa - y * ca - g.offset;
      h -= g.depth * Math.exp(-(d * d) / (2 * g.width * g.width));
    }

    // Micro surface: orange-peel, the faint texture real clearcoat always has.
    h += (fbm(x * 42 + p.seed, y * 42 + p.seed, 3) - 0.5) * p.peel;
    return h;
  };
}

/* ---------- studio environment ------------------------------------------- */
/**
 * env(dir, rough) -> [r,g,b] radiance.
 * Softboxes are bands at fixed elevation spanning a range of azimuth, which is
 * what produces long horizontal streaks across a curved panel.
 */
function makeEnv(p) {
  const boxes = p.softboxes;
  return (r, rough) => {
    const el = Math.asin(clamp(r[1], -1, 1));           // elevation
    const az = Math.atan2(r[0], r[2]);                   // azimuth

    // Base: dark floor below, cool grey ceiling above, with a horizon lift.
    const up = smoothstep(-0.25, 0.35, r[1]);
    // Low-frequency structure in the room, so flat panel areas reflect
    // something with variation rather than a single flat value. This is a
    // smooth trigonometric field rather than value noise: across a near-flat
    // panel the noise lattice would show up as a rectangular grid.
    const room =
      0.80 +
      0.22 * Math.sin(az * 1.6 + 0.7) * Math.cos(el * 2.1 + 1.9) +
      0.12 * Math.sin(az * 2.9 - 1.4) +
      0.09 * Math.cos(el * 3.7 + 0.3);
    let R = mix(p.floor[0], p.ceil[0], up) * room;
    let G = mix(p.floor[1], p.ceil[1], up) * room;
    let B = mix(p.floor[2], p.ceil[2], up) * room;

    // Horizon band: the studio wall/backdrop seam.
    const hz = Math.exp(-((el - p.horizon) ** 2) / 0.006) * p.horizonI;
    R += hz * 0.55; G += hz * 0.58; B += hz * 0.66;

    for (const b of boxes) {
      // Elevation falloff broadened by roughness -> soft, wide streaks.
      const w = b.w * (1.35 + rough * 9);
      const de = (el - b.el) / w;
      let s = Math.exp(-de * de);
      // Azimuth extent: super-Gaussian gives a flat top with soft shoulders,
      // matching a real softbox. A hard cutoff here shows up as a straight
      // vertical seam across the reflection.
      let da = az - b.az;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      const t = da / (b.len * 0.5);
      s *= Math.exp(-Math.pow(t * t, 1.15));
      const i = s * b.i;
      R += i * b.c[0]; G += i * b.c[1]; B += i * b.c[2];
    }
    return [R, G, B];
  };
}

/* ---------- tone mapping -------------------------------------------------- */
// ACES filmic approximation; keeps hot specular streaks from clipping flat.
function aces(x) {
  const a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0, 1);
}
const toSRGB = (x) => (x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

/**
 * Renders one surface study.
 * Returns { rgb: Buffer (w*h*3), coc: Buffer (w*h) } where coc is a
 * circle-of-confusion mask used for a cheap depth-of-field composite.
 */
export function render(preset, W, H, ss = 2) {
  const p = preset;
  const h = makeHeight(p);
  const env = makeEnv(p);
  const rgb = Buffer.alloc(W * H * 3);
  const coc = Buffer.alloc(W * H);

  const aspect = W / H;
  const eps = 0.0016;
  const camZ = p.camZ;
  const F0 = 0.04;                       // clearcoat IOR ~1.5
  const invSS = 1 / (ss * ss);

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      let sr = 0, sg = 0, sb = 0, sc = 0;

      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          // NDC with the panel filling the frame.
          const u = ((px + (sx + 0.5) / ss) / W * 2 - 1) * aspect * p.zoom + p.panX;
          const v = (1 - (py + (sy + 0.5) / ss) / H * 2) * p.zoom + p.panY;

          // Rotate the sampling plane so panels are not all axis-aligned.
          const ct = Math.cos(p.roll), st = Math.sin(p.roll);
          const x = u * ct - v * st;
          const y = u * st + v * ct;

          const z = h(x, y);

          // Normal from finite differences of the height field.
          const hx = (h(x + eps, y) - h(x - eps, y)) / (2 * eps);
          const hy = (h(x, y + eps) - h(x, y - eps)) / (2 * eps);
          let N = norm([-hx, -hy, 1]);

          // Metallic flake: fine normal perturbation in the basecoat.
          const fx = vnoise(x * 900 + p.seed * 7, y * 900) - 0.5;
          const fy = vnoise(x * 900 + 31.7, y * 900 + p.seed * 3) - 0.5;
          const Nf = norm([N[0] + fx * p.flake, N[1] + fy * p.flake, N[2]]);

          // View vector (perspective camera in front of the panel).
          const V = norm([-x, -y, camZ - z]);

          const ndv = Math.max(dot(N, V), 1e-4);
          const ndvF = Math.max(dot(Nf, V), 1e-4);

          // Reflection vectors for the two lobes.
          const rC = [2 * ndv * N[0] - V[0], 2 * ndv * N[1] - V[1], 2 * ndv * N[2] - V[2]];
          const rB = [2 * ndvF * Nf[0] - V[0], 2 * ndvF * Nf[1] - V[1], 2 * ndvF * Nf[2] - V[2]];

          // Clearcoat: sharp mirror lobe, Fresnel-weighted.
          const fres = F0 + (1 - F0) * Math.pow(1 - ndv, 5);
          const ec = env(rC, p.ccRough);

          // Basecoat: rough metallic lobe tinted by the paint colour.
          const eb = env(rB, p.baseRough);
          const bc = p.color;

          // Flake sparkle: rare, bright, view-dependent glints.
          const spk = Math.pow(vnoise(x * 1400 + 11, y * 1400 + 5), 26) * p.sparkle;

          // Ambient body colour so shadowed areas keep hue instead of going black.
          const amb = 0.055;

          let R = bc[0] * (eb[0] * p.baseGain + amb) + ec[0] * fres + spk;
          let G = bc[1] * (eb[1] * p.baseGain + amb) + ec[1] * fres + spk;
          let B = bc[2] * (eb[2] * p.baseGain + amb) + ec[2] * fres + spk;

          // Panel gap reads as a dark occluded groove.
          if (p.gap) {
            const g = p.gap;
            const ca = Math.cos(g.angle), sa = Math.sin(g.angle);
            const d = x * sa - y * ca - g.offset;
            const occ = Math.exp(-(d * d) / (2 * (g.width * 1.15) ** 2));
            const k = 1 - occ * 0.93;
            R *= k; G *= k; B *= k;
          }

          sr += R; sg += G; sb += B;
          // Depth of field: focus on a band, defocus toward frame edges.
          sc += Math.abs(z - p.focus) * p.dof + Math.max(0, Math.abs(y) - p.focusBand) * p.dofEdge;
        }
      }

      sr *= invSS; sg *= invSS; sb *= invSS; sc *= invSS;

      // Exposure, grade, vignette.
      const vx = (px / W - 0.5), vy = (py / H - 0.5);
      const vig = 1 - p.vignette * (vx * vx + vy * vy) * 2.6;
      sr *= p.exposure * vig; sg *= p.exposure * vig; sb *= p.exposure * vig;

      // Cool the shadows, keep highlights neutral: standard automotive grade.
      const lum = sr * 0.2126 + sg * 0.7152 + sb * 0.0722;
      const sh = 1 - smoothstep(0.0, 0.35, lum);
      sr += sh * p.shadowTint[0]; sg += sh * p.shadowTint[1]; sb += sh * p.shadowTint[2];

      // Fine grain so the render does not look plastic-clean.
      const gr = (hash2(px, py) - 0.5) * p.grain;

      const i3 = (py * W + px) * 3;
      rgb[i3] = clamp(Math.round(toSRGB(aces(sr + gr)) * 255), 0, 255);
      rgb[i3 + 1] = clamp(Math.round(toSRGB(aces(sg + gr)) * 255), 0, 255);
      rgb[i3 + 2] = clamp(Math.round(toSRGB(aces(sb + gr)) * 255), 0, 255);
      coc[py * W + px] = clamp(Math.round(sc * 255), 0, 255);
    }
  }
  return { rgb, coc };
}
