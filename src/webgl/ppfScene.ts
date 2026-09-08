import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  WebGLRenderer,
  SRGBColorSpace,
  LinearFilter,
  ClampToEdgeWrapping,
  type Texture,
} from 'three';
import { FRAG, VERT } from './ppfShader';

export type PpfScene = {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  resize(): void;
  /** Frame loop runs only while the section is on screen. */
  setActive(active: boolean): void;
  dispose(): void;
};

type Options = {
  canvas: HTMLCanvasElement;
  textureUrl: string;
  reducedMotion: boolean;
};

/**
 * Creates the WebGL PPF visualisation. Throws if WebGL is unavailable so the
 * caller can fall back to the Canvas 2D version.
 */
/**
 * Probes for a usable WebGL context before Three is constructed. Three logs its
 * own console errors when context creation fails, which would show up as
 * console noise on any device without WebGL.
 */
function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl =
      c.getContext('webgl2') ||
      c.getContext('webgl') ||
      c.getContext('experimental-webgl');
    if (!gl) return false;
    // Release the probe context immediately; contexts are a limited resource.
    (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export async function createPpfScene({
  canvas,
  textureUrl,
  reducedMotion,
}: Options): Promise<PpfScene> {
  if (!webglSupported()) throw new Error('WebGL unavailable');

  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  });

  // Mid-range phones cannot afford a full-DPR fullscreen shader; 1.75 is the
  // point past which this scene stops looking better and starts dropping frames.
  const dprCap = window.innerWidth < 768 ? 1.5 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.setClearColor(0x090b0f, 1);

  const texture: Texture = await new Promise((resolve, reject) => {
    new TextureLoader().load(textureUrl, resolve, undefined, () =>
      reject(new Error(`PPF texture failed: ${textureUrl}`))
    );
  });
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.generateMipmaps = false;

  const uniforms = {
    uTex: { value: texture },
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uPointer: { value: new Vector2(0, 0) },
    uCover: { value: new Vector2(1, 1) },
    uOffset: { value: new Vector2(0, 0) },
    uEdgeSoft: { value: 0.05 },
    uIntensity: { value: reducedMotion ? 0.55 : 1 },
  };

  const scene = new Scene();
  const camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
  const material = new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
  const mesh = new Mesh(new PlaneGeometry(1, 1), material);
  scene.add(mesh);

  /** object-fit: cover, computed in UV space. */
  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);

    const img = texture.image as { width: number; height: number } | undefined;
    const texAspect = img && img.height ? img.width / img.height : 1.6;
    const viewAspect = w / h;

    let sx = 1;
    let sy = 1;
    if (viewAspect > texAspect) {
      // View is wider: use full texture width, crop height.
      sy = texAspect / viewAspect;
    } else {
      sx = viewAspect / texAspect;
    }
    uniforms.uCover.value.set(sx, sy);
    uniforms.uOffset.value.set((1 - sx) / 2, (1 - sy) / 2);

    // A narrow viewport needs a softer, wider front or the edge reads as a
    // hard diagonal line rather than a material boundary.
    uniforms.uEdgeSoft.value = w < 700 ? 0.075 : 0.05;
  }
  resize();

  let raf = 0;
  let active = false;
  const start = performance.now();
  const pointerTarget = new Vector2(0, 0);

  function frame() {
    if (!active) return;
    uniforms.uTime.value = (performance.now() - start) / 1000;
    // Ease the pointer so reflections drift rather than snap.
    uniforms.uPointer.value.lerp(pointerTarget, 0.07);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  return {
    setProgress(p: number) {
      uniforms.uProgress.value = p;
      // When parked, still render one frame so scrubbing works while inactive.
      if (!active) renderer.render(scene, camera);
    },
    setPointer(x: number, y: number) {
      if (reducedMotion) return;
      pointerTarget.set(x, y);
    },
    resize,
    setActive(next: boolean) {
      if (next === active) return;
      active = next;
      if (active) {
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    dispose() {
      active = false;
      cancelAnimationFrame(raf);
      texture.dispose();
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
      // Release the drawing buffer rather than waiting for GC.
      renderer.forceContextLoss?.();
    },
  };
}
