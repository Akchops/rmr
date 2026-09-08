import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Native scroll is kept deliberately. A smoothing layer (Lenis) was evaluated
 * and rejected: the only scroll-scrubbed scene here is the PPF pin, which
 * ScrollTrigger already scrubs smoothly, and normalising scroll would cost
 * native touch and keyboard behaviour for no visible gain.
 */
export { gsap, ScrollTrigger };
