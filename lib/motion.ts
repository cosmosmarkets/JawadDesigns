/* ============================================================================
   lib/motion.ts — central GSAP registration + shared motion constants
   ----------------------------------------------------------------------------
   ONE place to register plugins and expose the eases/values every later stage
   reuses. Mirrors the static prototype's k3-motion.js feel (y:26→0, 1.05s,
   power2.out, .12s stagger) so Stage 0 reproduces the previous reveal exactly.

   Stage 0 only needs ScrollTrigger; SplitText is registered now so the
   Pre-flight smoke test and Stage 2/3 line reveals can import it from here.
   ========================================================================== */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Guard for SSR — plugins only touch the DOM in the browser.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export { gsap, ScrollTrigger, SplitText };

/** Eases tuned to match the prototype's cubic-bezier feel with stock GSAP. */
export const EASE = { reveal: "power2.out", draw: "power3.out" } as const;

/** Reveal tween values — kept identical to the previous CSS reveal. */
export const REVEAL = { y: 26, duration: 1.05, stagger: 0.12 } as const;

/** Lenis glide config — the prototype's "long, luxurious" curve. */
export const LENIS_CONFIG = {
  duration: 1.6,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.4,
  // touch scrolling stays native (no smoothTouch) to avoid mobile jank
} as const;

/**
 * The single off-switch: true when the OS asks for reduced motion OR the
 * "Scroll & haze" tweak is off (body[data-motion="off"]). The provider also
 * reacts to OS changes live via gsap.matchMedia; this helper covers the
 * imperative checks (e.g. the Stage 2 shader deciding never to start).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.body?.dataset.motion === "off"
  );
}
