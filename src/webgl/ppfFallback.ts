import type { PpfScene } from './ppfScene';

/**
 * Canvas 2D fallback for the PPF visualisation, used when WebGL is
 * unavailable. It keeps the concept — the same source image, the same curved
 * film front travelling across the panel, the same gloss lift behind it — and
 * loses only the optical refraction, which 2D canvas cannot do cheaply.
 */
export async function createPpfFallback({
  canvas,
  textureUrl,
}: {
  canvas: HTMLCanvasElement;
  textureUrl: string;
}): Promise<PpfScene> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('fallback texture failed'));
    i.src = textureUrl;
  });

  // Canvas 2D filters are widely supported but not universal; probe once.
  const supportsFilter = typeof ctx.filter === 'string';

  let progress = 0;
  let w = 0;
  let h = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth || 1;
    h = canvas.clientHeight || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  /** Same curved route as the shader, evaluated in CSS pixels. */
  function frontX(yNorm: number, p: number): number {
    const curve =
      0.17 * Math.sin(yNorm * 2.6 + 0.9) +
      0.072 * Math.sin(yNorm * 5.3 - 1.7) +
      0.045 * Math.cos(yNorm * 1.7 + 2.4);
    const head = -0.22 + (1.3 + 0.22) * p;
    // axis = x*0.86 + y*0.32  =>  x = (head - curve - y*0.32) / 0.86
    return ((head - curve - yNorm * 0.32) / 0.86) * w;
  }

  function filmPath(p: number): Path2D {
    const path = new Path2D();
    path.moveTo(-40, 0);
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const yn = i / steps;
      path.lineTo(frontX(1 - yn, p), yn * h);
    }
    path.lineTo(-40, h);
    path.closePath();
    return path;
  }

  function cover() {
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s;
    const dh = img.height * s;
    return [(w - dw) / 2, (h - dh) / 2, dw, dh] as const;
  }

  function draw() {
    if (!ctx || !w) return;
    const [dx, dy, dw, dh] = cover();

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);

    const path = filmPath(progress);

    // Protected side: the same read as the shader — more depth and gloss, no
    // hue shift. Canvas filters do this in one pass where supported.
    ctx.save();
    ctx.clip(path);
    if (supportsFilter) {
      ctx.filter = 'contrast(1.13) brightness(1.06)';
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.filter = 'none';
    } else {
      // Without filter support, approximate the gloss lift by compositing.
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.22;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Leading edge: a specular line plus a restrained signal trace.
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(198,214,238,0.72)';
    ctx.lineWidth = 3;
    ctx.stroke(path);
    ctx.strokeStyle = 'rgba(215,255,53,0.42)';
    ctx.lineWidth = 1.25;
    ctx.stroke(path);
    ctx.restore();
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);
  resize();

  return {
    setProgress(p) {
      progress = p;
      draw();
    },
    setPointer() {},
    resize,
    setActive() {},
    dispose() {
      ro.disconnect();
    },
  };
}
