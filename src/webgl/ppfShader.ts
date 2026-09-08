/**
 * Fragment shader for the scroll-controlled PPF visualisation.
 *
 * The film front is a curved boundary travelling across a photographed-style
 * panel. Behind it the surface is read through a thin transparent layer:
 * reflections are displaced very slightly, gloss lifts, and a specular line
 * runs along the leading edge. In front of it the panel is untouched.
 *
 * Both sides sample the SAME texture. This is deliberate — the interaction is
 * an illustrative visualisation of a protective layer, not a before/after
 * comparison, and must not be able to read as one.
 */

export const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTex;
  uniform float uProgress;   // 0..1 film travel
  uniform float uTime;
  uniform vec2  uPointer;    // -1..1, eased
  uniform vec2  uCover;      // aspect-correcting scale for the texture
  uniform vec2  uOffset;
  uniform float uEdgeSoft;   // widened on small screens
  uniform float uIntensity;  // global effect strength (reduced-motion dials down)

  #define SIGNAL vec3(0.843, 1.0, 0.208)

  // Cheap 2D value noise, smooth enough for an organic edge.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  /**
   * Signed distance to the film front, negative behind the film.
   * The front follows a Bezier-like curve across the panel rather than a
   * straight vertical line, so the boundary reads as material being laid onto
   * a shaped surface.
   */
  float frontDistance(vec2 uv, float p) {
    // Travel diagonally, biased across the panel.
    float axis = uv.x * 0.86 + uv.y * 0.32;

    // Curved route: offset arcs approximate a slack, hand-laid edge. The
    // amplitude has to be substantial or the front reads as a straight
    // diagonal wipe rather than material being laid onto a shaped panel.
    float curve =
        0.170 * sin(uv.y * 2.6 + 0.9)
      + 0.072 * sin(uv.y * 5.3 - 1.7)
      + 0.045 * cos(uv.y * 1.7 + 2.4);

    // Low-frequency organic wander along the front.
    float wander = (noise(vec2(uv.y * 3.4, p * 1.3 + 4.0)) - 0.5) * 0.055;

    // The front sweeps from just off the left edge to just past the right.
    float head = mix(-0.22, 1.30, p);
    return axis - head + curve + wander;
  }

  void main() {
    vec2 uv = vUv * uCover + uOffset;

    float d = frontDistance(vUv, uProgress);

    // Behind the film (d < 0) -> mask 1.
    float soft = uEdgeSoft;
    float film = 1.0 - smoothstep(-soft, soft, d);

    // Tension band hugging the edge: where refraction and highlight live.
    float band = exp(-(d * d) / (2.0 * soft * soft * 2.2));

    // --- refraction -------------------------------------------------------
    // The edge of a film is a thin wedge; it bends what is behind it. The
    // displacement stays small — this is a few pixels of bend, not a warp.
    float ripple = sin(d * 190.0 - uTime * 1.4) * 0.5 + 0.5;
    vec2 gradDir = normalize(vec2(0.86, 0.32));
    vec2 refractOff = gradDir * band * (0.0130 + 0.0055 * ripple) * uIntensity;

    // Behind the film the surface settles: a much smaller, steady displacement.
    refractOff += gradDir * film * 0.0022 * uIntensity;

    // Pointer parallax: the panel reflection shifts as the viewer moves.
    vec2 parallax = uPointer * 0.008;

    vec3 col = texture2D(uTex, uv + refractOff + parallax).rgb;

    // --- surface behind the film -----------------------------------------
    // A gloss film reads as depth, not as a colour change: local contrast rises,
    // highlights sharpen, darks deepen. The hue is left alone deliberately —
    // the protected side must never look like different paint.
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    // Local contrast about mid-grey.
    vec3 glossy = (col - 0.42) * 1.10 + 0.42;
    // Specular highlights gain, as a smoother surface returns more light.
    glossy += col * 0.30 * smoothstep(0.30, 0.92, lum);
    // Darks deepen slightly, the "wet" look of a fresh clearcoat.
    glossy *= mix(0.97, 1.0, smoothstep(0.0, 0.45, lum));
    col = mix(col, glossy, film * uIntensity);

    // --- leading edge ------------------------------------------------------
    // A thin specular line where the wedge catches the studio light.
    float spec = exp(-(d * d) / (2.0 * pow(soft * 0.50, 2.0)));
    col += vec3(0.62, 0.68, 0.78) * spec * 0.50 * uIntensity;

    // A restrained signal-coloured trace, only right at the front.
    float trace = exp(-(d * d) / (2.0 * pow(soft * 0.16, 2.0)));
    col += SIGNAL * trace * 0.11 * uIntensity;

    // A soft shadow just ahead of the front: the lifted edge of the film
    // casts onto the paint it has not reached yet.
    float ahead = (1.0 - film) * exp(-(d * d) / (2.0 * pow(soft * 0.9, 2.0)));
    col *= 1.0 - 0.10 * ahead * uIntensity;

    // Faint interference just behind the edge, where film has not yet settled.
    float settle = film * exp(-(d * d) / (2.0 * pow(soft * 2.4, 2.0)));
    col += vec3(0.05, 0.06, 0.08) * settle * ripple * uIntensity;

    gl_FragColor = vec4(col, 1.0);
  }
`;
