/**
 * Surface studies used across the site. Each entry is one authored macro study
 * of a clear-coated panel: geometry, paint colour, and studio lighting.
 * Nothing here depicts a real or specific vehicle.
 */

const D2R = Math.PI / 180;

// Shared studio rig: three overhead softbox strips plus a low fill.
const rig = (tint = 1) => [
  { el: 0.62, az: 0.15, w: 0.055, len: 2.5, feather: 0.55, i: 4.2, c: [1, 1, 1.03 * tint] },
  { el: 0.30, az: -0.9, w: 0.035, len: 1.7, feather: 0.40, i: 3.0, c: [0.96, 0.98, 1.05 * tint] },
  { el: 0.08, az: 1.35, w: 0.028, len: 1.3, feather: 0.35, i: 2.0, c: [1.05, 1.0, 0.92] },
  { el: -0.45, az: 0.4, w: 0.10, len: 2.2, feather: 0.6, i: 0.55, c: [0.7, 0.76, 0.9] },
];

const base = {
  camZ: 2.4,
  zoom: 1.0,
  panX: 0, panY: 0,
  roll: 0,
  domeX: 0.16, domeXf: 1.1,
  domeY: 0.05, domeYf: 0.8,
  crease: null,
  gap: null,
  peel: 0.00016,
  flake: 0.011,
  sparkle: 0.051,
  ccRough: 0.006,
  baseRough: 0.070,
  baseGain: 0.55,
  exposure: 1.16,
  vignette: 0.42,
  grain: 0.0075,
  shadowTint: [-0.004, 0.0, 0.012],
  floor: [0.012, 0.014, 0.018],
  ceil: [0.10, 0.115, 0.145],
  horizon: -0.02, horizonI: 0.10,
  focus: 0.0, focusBand: 0.45, dof: 0.9, dofEdge: 1.5,
  seed: 1,
};

const paint = {
  midnight:  [0.030, 0.048, 0.086],
  graphite:  [0.070, 0.076, 0.086],
  gunmetal:  [0.105, 0.115, 0.128],
  silver:    [0.300, 0.315, 0.335],
  deepGreen: [0.028, 0.062, 0.050],
  oxblood:   [0.105, 0.020, 0.028],
  ink:       [0.016, 0.018, 0.024],
  steelBlue: [0.048, 0.085, 0.130],
  bronze:    [0.115, 0.082, 0.048],
};

const P = (o) => ({ ...base, softboxes: rig(), ...o });

export const PRESETS = {
  /* Hero: a broad fender swell crossed by a strong crease. Wide crop. */
  'hero-surface': P({
    color: paint.midnight, seed: 3, roll: -8 * D2R, zoom: 1.05,
    domeX: 0.20, domeXf: 1.25, domeY: 0.07,
    crease: { angle: 12 * D2R, offset: -0.16, amp: 0.052, width: 0.085 },
    exposure: 1.22, sparkle: 0.058, vignette: 0.50, panY: 0.06,
  }),

  /* PPF shader source: a calm, evenly-lit door panel with a shut line.
     Deliberately clean so the film front reads clearly against it. */
  /* The film front has to be legible across the whole frame, so this panel is
     lit more evenly and much brighter than the atmospheric studies: it needs
     mid-tone reflection structure everywhere, not a bright edge and a black
     field. */
  'ppf-panel': P({
    color: paint.steelBlue, seed: 11, roll: -3 * D2R, zoom: 1.18,
    domeX: 0.085, domeXf: 0.72, domeY: 0.03, domeYf: 0.6,
    crease: { angle: 6 * D2R, offset: 0.30, amp: 0.030, width: 0.13 },
    gap: { angle: 84 * D2R, offset: -0.70, width: 0.009, depth: 0.045 },
    exposure: 1.06, vignette: 0.16, dof: 0.30, dofEdge: 0.35,
    sparkle: 0.05, baseGain: 0.95, baseRough: 0.085,
    softboxes: [
      { el: 0.60, az: 0.10, w: 0.070, len: 3.0, feather: 0.6, i: 4.4, c: [1, 1, 1.03] },
      { el: 0.34, az: -0.75, w: 0.055, len: 2.6, feather: 0.5, i: 3.4, c: [0.96, 0.99, 1.06] },
      { el: 0.12, az: 1.05, w: 0.048, len: 2.4, feather: 0.45, i: 2.9, c: [1.04, 1.0, 0.94] },
      { el: -0.12, az: -1.8, w: 0.060, len: 2.2, feather: 0.5, i: 2.2, c: [0.92, 0.96, 1.08] },
      { el: -0.42, az: 0.5, w: 0.12, len: 2.8, feather: 0.6, i: 1.1, c: [0.72, 0.78, 0.92] },
    ],
    ceil: [0.135, 0.148, 0.180],
  }),

  /* Service system visuals: one per service, visually distinct. */
  'svc-ppf': P({
    color: paint.gunmetal, seed: 21, roll: 14 * D2R, zoom: 0.92,
    domeX: 0.22, domeXf: 1.4,
    crease: { angle: -22 * D2R, offset: 0.05, amp: 0.060, width: 0.070 },
    exposure: 1.20, sparkle: 0.068,
  }),
  'svc-coating': P({
    color: paint.ink, seed: 34, roll: -20 * D2R, zoom: 0.88,
    domeX: 0.26, domeXf: 1.55, domeY: 0.10, domeYf: 1.0,
    ccRough: 0.003, baseRough: 0.05, exposure: 1.30, sparkle: 0.037,
    softboxes: rig(1.05),
  }),
  'svc-detailing': P({
    color: paint.deepGreen, seed: 47, roll: 6 * D2R, zoom: 1.0,
    domeX: 0.15, domeY: 0.13, domeYf: 1.2,
    gap: { angle: 8 * D2R, offset: 0.34, width: 0.009, depth: 0.045 },
    exposure: 1.18, sparkle: 0.051,
  }),
  'svc-wraps': P({
    color: paint.oxblood, seed: 58, roll: -34 * D2R, zoom: 0.95,
    domeX: 0.19, domeXf: 1.2,
    crease: { angle: 40 * D2R, offset: -0.05, amp: 0.048, width: 0.075 },
    ccRough: 0.020, baseRough: 0.11, flake: 0.006, sparkle: 0.009,
    exposure: 1.24,
  }),

  /* Gallery: six studies with clearly different geometry and light. */
  'study-01': P({
    color: paint.midnight, seed: 71, roll: 24 * D2R, zoom: 0.90,
    domeX: 0.24, domeXf: 1.5,
    crease: { angle: -14 * D2R, offset: 0.10, amp: 0.055, width: 0.065 },
    exposure: 1.22,
  }),
  'study-02': P({
    color: paint.silver, seed: 82, roll: -11 * D2R, zoom: 1.0,
    domeX: 0.12, domeY: 0.16, domeYf: 1.3,
    baseGain: 0.62, exposure: 1.05, sparkle: 0.077, vignette: 0.38,
  }),
  'study-03': P({
    color: paint.ink, seed: 93, roll: 46 * D2R, zoom: 0.86,
    domeX: 0.28, domeXf: 1.6,
    gap: { angle: 46 * D2R, offset: 0.0, width: 0.011, depth: 0.055 },
    exposure: 1.34, ccRough: 0.004,
  }),
  'study-04': P({
    color: paint.steelBlue, seed: 104, roll: -28 * D2R, zoom: 0.95,
    domeX: 0.17, domeY: 0.09,
    crease: { angle: 28 * D2R, offset: -0.22, amp: 0.062, width: 0.06 },
    exposure: 1.20, sparkle: 0.065,
  }),
  'study-05': P({
    color: paint.bronze, seed: 115, roll: 9 * D2R, zoom: 1.04,
    domeX: 0.20, domeXf: 1.15,
    crease: { angle: -6 * D2R, offset: 0.28, amp: 0.040, width: 0.11 },
    exposure: 1.12, baseGain: 0.50,
  }),
  'study-06': P({
    color: paint.graphite, seed: 126, roll: -42 * D2R, zoom: 0.92,
    domeX: 0.23, domeXf: 1.35, domeY: 0.11,
    gap: { angle: -40 * D2R, offset: 0.30, width: 0.010, depth: 0.05 },
    crease: { angle: -40 * D2R, offset: -0.15, amp: 0.045, width: 0.08 },
    exposure: 1.18,
  }),

  /* Contact / closing atmosphere: darker, quieter, more negative space. */
  'studio-dark': P({
    color: paint.ink, seed: 137, roll: 16 * D2R, zoom: 1.15,
    domeX: 0.18, domeXf: 1.1,
    exposure: 0.92, vignette: 0.62, sparkle: 0.027, baseGain: 0.45,
  }),
  'signal-surface': P({
    color: paint.midnight, seed: 148, roll: -16 * D2R, zoom: 1.0,
    domeX: 0.21, domeXf: 1.3, domeY: 0.08,
    crease: { angle: 18 * D2R, offset: 0.18, amp: 0.050, width: 0.075 },
    exposure: 1.10, vignette: 0.55,
  }),
};
