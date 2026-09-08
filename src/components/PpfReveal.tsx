import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useMedia, useReducedMotion } from '../lib/hooks';
import type { PpfScene } from '../webgl/ppfScene';
import './PpfReveal.css';

const TEXTURE_LARGE = '/assets/ppf-panel-1280.webp';
const TEXTURE_SMALL = '/assets/ppf-panel-800.webp';

type Mode = 'loading' | 'webgl' | 'canvas' | 'static';

export default function PpfReveal() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<PpfScene | null>(null);
  const [mode, setMode] = useState<Mode>('loading');
  const [progress, setProgress] = useState(0);

  const reduced = useReducedMotion();
  const isNarrow = useMedia('(max-width: 767px)', false);

  /* ---- scene lifecycle -------------------------------------------------- */
  useEffect(() => {
    const el = section.current;
    const cv = canvas.current;
    if (!el || !cv) return;

    let disposed = false;
    let scene: PpfScene | null = null;

    // Lazily initialise shortly before the section arrives, so the WebGL
    // context and texture are not paid for on first paint.
    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();

        const textureUrl = isNarrow ? TEXTURE_SMALL : TEXTURE_LARGE;
        try {
          const { createPpfScene } = await import('../webgl/ppfScene');
          scene = await createPpfScene({ canvas: cv, textureUrl, reducedMotion: reduced });
          if (disposed) return scene.dispose();
          sceneRef.current = scene;
          setMode('webgl');
        } catch {
          // No WebGL, or the context/texture failed: keep the concept in 2D.
          try {
            const { createPpfFallback } = await import('../webgl/ppfFallback');
            scene = await createPpfFallback({ canvas: cv, textureUrl });
            if (disposed) return scene.dispose();
            sceneRef.current = scene;
            setMode('canvas');
          } catch {
            // Neither renderer is available: the <noscript>-style static image
            // beneath the canvas carries the section on its own.
            setMode('static');
          }
        }
        scene?.setProgress(reduced ? 0.5 : 0);
      },
      { rootMargin: '300px' }
    );
    io.observe(el);

    return () => {
      disposed = true;
      io.disconnect();
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [isNarrow, reduced]);

  /* ---- scroll choreography ---------------------------------------------- */
  useEffect(() => {
    const el = section.current;
    if (!el) return;

    // Under reduced motion there is no pin and no scrubbing: the visualisation
    // sits at a readable mid-state and the user can drive it with a slider.
    if (reduced) return;

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        // Shorter travel on phones: a 200vh pin on a small screen feels stuck.
        end: () => (isNarrow ? '+=140%' : '+=190%'),
        pin: '.ppf-stage',
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);
          // 0-8% settle, 8-92% travel, 92-100% resolve: the front should be
          // moving for most of the pin, or the section reads as static.
          const travel = gsap.utils.clamp(0, 1, (p - 0.08) / 0.84);
          sceneRef.current?.setProgress(travel);
        },
        onToggle: (self) => sceneRef.current?.setActive(self.isActive),
      });

      // Copy and labels move against the pinned surface.
      gsap.fromTo(
        '.ppf-copy',
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 65%' },
        }
      );

      return () => st.kill();
    }, el);

    return () => ctx.revert();
  }, [reduced, isNarrow]);

  /* ---- pointer response -------------------------------------------------- */
  useEffect(() => {
    if (mode !== 'webgl' || reduced) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      sceneRef.current?.setPointer(
        (e.clientX / window.innerWidth - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2
      );
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mode, reduced]);

  /* ---- resize / orientation ---------------------------------------------- */
  useEffect(() => {
    if (mode === 'loading' || mode === 'static') return;
    const onResize = () => sceneRef.current?.resize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [mode]);

  const stage = Math.round(progress * 100);

  return (
    <section className="ppf" id="protection" ref={section}>
      <div className="ppf-stage">
        <div className="ppf-canvas-wrap">
          {/* Always present: carries the section if no renderer starts, and
              gives the canvas something to sit on while it initialises. */}
          <img
            className={`ppf-base${mode === 'webgl' || mode === 'canvas' ? ' is-hidden' : ''}`}
            src={TEXTURE_LARGE}
            width={1280}
            height={800}
            alt="Rendered study of a clear-coated vehicle door panel with a shut line, used as the source surface for the protection-film visualisation."
            loading="lazy"
            decoding="async"
          />
          <canvas
            ref={canvas}
            className={`ppf-canvas${mode === 'webgl' || mode === 'canvas' ? ' is-live' : ''}`}
            aria-hidden="true"
          />
          <span className="ppf-vignette" aria-hidden="true" />
        </div>

        <div className="ppf-overlay shell">
          <div className="ppf-copy">
            <p className="eyebrow">
              <span className="on">Interactive</span> PPF visualisation
            </p>
            <h2 className="h-lg ppf-title">
              A layer you notice
              <br />
              by what it preserves.
            </h2>
            <p className="lede ppf-lede">
              Explore an illustrative view of paint protection film across the vehicle surface.
            </p>

            <p className="ppf-disclosure">
              Illustrative digital visualisation. Not an actual before-and-after result.
            </p>

            <p className="nojs-note">
              The film visualisation is interactive and needs JavaScript. The panel above is the
              same surface it uses.
            </p>

            {reduced && (
              <label className="ppf-manual">
                <span className="tech">Film coverage</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={50}
                  aria-label="Protection film coverage across the panel"
                  onChange={(e) => sceneRef.current?.setProgress(Number(e.target.value) / 100)}
                />
              </label>
            )}
          </div>

          <div className="ppf-readout" aria-hidden="true">
            <span className="ppf-tick">
              <b>01</b> Paint surface
            </span>
            <span className="ppf-tick">
              <b>02</b> Transparent protection layer
            </span>
            <span className="ppf-bar">
              <span className="ppf-bar-fill" style={{ transform: `scaleX(${progress})` }} />
            </span>
            <span className="ppf-pct">{String(stage).padStart(3, '0')}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
