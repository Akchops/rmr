import { useEffect, useState } from 'react';

/** Live-updating media query, so a mode change is reflected without reload. */
export function useMedia(query: string, initial = false): boolean {
  // Always starts at `initial`, on the server and in the browser alike: reading
  // matchMedia during the first render would make the client's markup differ
  // from the prerendered HTML and break hydration. The effect corrects it in
  // the same commit.
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');

/** Fires once when the element first comes near the viewport. */
export function useNearViewport<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  rootMargin = '400px'
): boolean {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, near]);
  return near;
}
