import { gsap, ScrollTrigger } from './gsap';

/**
 * Repeating scroll reveals.
 *
 * Every reveal replays each time its element enters the viewport, from either
 * direction, and resets once it leaves — so scrolling down, back up and down
 * again animates every time rather than firing once and staying put.
 *
 * The from-state is applied by GSAP, never by CSS, so with JavaScript disabled
 * (the prerendered build) everything is simply present. Under reduced motion
 * nothing is registered at all.
 *
 * Treatments are keyed to the element's role rather than applied uniformly —
 * headlines wipe up, media wipes across, supporting copy lifts — so the page
 * does not read as one fade-up stamped on every section.
 */

type Treatment = 'rise' | 'lift' | 'wipe' | 'stagger';

const FROM: Record<Treatment, gsap.TweenVars> = {
  // Headlines: a masked upward wipe, echoing the hero's line reveal.
  rise: { yPercent: 6, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
  // Supporting copy and controls: a short, quiet lift.
  lift: { y: 18, opacity: 0 },
  // Media frames: a directional wipe, matching the service panel transition.
  wipe: { clipPath: 'inset(0% 100% 0% 0%)' },
  // Ruled lists: children lift in sequence.
  stagger: { y: 16, opacity: 0 },
};

const TO: Record<Treatment, gsap.TweenVars> = {
  rise: { yPercent: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85 },
  lift: { y: 0, opacity: 1, duration: 0.6 },
  wipe: { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9 },
  stagger: { y: 0, opacity: 1, duration: 0.55, stagger: 0.07 },
};

/**
 * Registers every [data-reveal] element on the page.
 * Returns a cleanup function.
 */
export function initReveals(reducedMotion: boolean): () => void {
  if (reducedMotion) return () => {};

  const ctx = gsap.context(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');

    nodes.forEach((node) => {
      const treatment = (node.dataset.reveal || 'lift') as Treatment;
      // `stagger` animates the container's children; everything else animates
      // the element itself.
      const targets =
        treatment === 'stagger' ? Array.from(node.children) : node;
      if (treatment === 'stagger' && (targets as Element[]).length === 0) return;

      gsap.fromTo(targets, FROM[treatment], {
        ...TO[treatment],
        ease: 'expo.out',
        scrollTrigger: {
          trigger: node,
          // Roughly "while the element is on screen", with a little slack so a
          // reveal is never mid-flight at the very edge of the viewport.
          start: 'top 88%',
          end: 'bottom 12%',
          // restart on entry from either direction, reset on either exit: this
          // is what makes a reveal repeat on every pass instead of once.
          toggleActions: 'restart reset restart reset',
        },
      });
    });
  });

  return () => ctx.revert();
}

export { ScrollTrigger };
