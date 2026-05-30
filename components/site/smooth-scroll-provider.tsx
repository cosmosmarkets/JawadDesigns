"use client";

/* ============================================================================
   SmoothScrollProvider — Stage 0 motion foundation (ship nothing visible)
   ----------------------------------------------------------------------------
   The React port of the prototype's vanilla JDMotion system. Mounts once in the
   root layout and owns the whole motion baseline:

   • ONE Lenis smooth-scroll instance, synced into GSAP's ScrollTrigger.
   • ONE reduced-motion guard via gsap.matchMedia — when the OS prefers reduced
     motion (or body[data-motion="off"]) Lenis is never created, html.jd-anim is
     removed, and the static CSS leaves all content visible. matchMedia reacts to
     OS changes live, so toggling the setting mid-session is handled.
   • The reveal batch that REPLACES the old class-toggle .reveal system, rebuilt
     per route (App Router swaps `children` on navigation while this provider
     stays mounted).

   Renders nothing — Lenis drives window scroll, so no wrapper DOM is needed
   (zero layout impact). Later stages add their own scoped useGSAP blocks in the
   section components; they never touch Lenis or the guard again.
   ========================================================================== */

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  EASE,
  REVEAL,
  LENIS_CONFIG,
  withMotion,
} from "@/lib/motion";
import { registerLenis } from "@/lib/scroll-lock";

export function SmoothScrollProvider() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  // 1) Lenis + the global motion flag — set up once, reduced-motion reactive
  //    (or forced on via ?motion=on for dev preview).
  useGSAP(() => {
    const root = document.documentElement;

    return withMotion(() => {
      // The boot script in layout already added jd-anim pre-paint; keep it
      // owned here so a live OS toggle stays in sync.
      root.classList.add("jd-anim");

      const lenis = new Lenis(LENIS_CONFIG);
      lenisRef.current = lenis;
      registerLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);

      // Dev-only handle so verification can drive scroll deterministically
      // (mirrors the hero-shader's __heroFrames dev hook). Never set in prod.
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
      }

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Stage 1: scroll-tracked candlelight pool (ports k3-atmos.js). Drift the
      // warm spotlight 30%→64% down the frame so each section passes through the
      // light rather than sitting in flat fill. quickSetter writes the CSS var
      // cheaply each frame; reduced motion never reaches here, so --jd-spot-y
      // holds its static 42% default from k3-pass4-material.css.
      const setSpot = gsap.quickSetter(root, "--jd-spot-y", "%");
      const spotlight = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => setSpot(30 + self.progress * 34),
      });

      // Cleanup runs when the query stops matching (OS toggle) or on unmount.
      return () => {
        spotlight.kill();
        root.style.removeProperty("--jd-spot-y");
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
        registerLenis(null);
        root.classList.remove("jd-anim");
      };
    });
  }, []);

  // 2) Reveal batches + Stage 3 scroll-motion language — rebuilt per route
  //    because `children` changes on nav. Class contracts:
  //      .reveal       — block fade/rise (Stage 0, batch, once)
  //      .k3-drawline  — one-shot hairline draw (Stage 0, batch, once)
  //      .reveal-lines — masked line wipe on a heading (Stage 3, SplitText)
  //      .parallax     — additive y depth, scrubbed (Stage 3, desktop only)
  //      .k3-hairline  — scrubbed brass hairline across a section break (Stage 3)
  useGSAP(
    () => {
      return withMotion(() => {
        // SplitText mutates the DOM and is NOT auto-reverted by the useGSAP
        // context; track every split + the triggers we build asynchronously so
        // the cleanup below can tear them down on route change / unmount.
        const splits: SplitText[] = [];
        const triggers: ScrollTrigger[] = [];
        let cancelled = false;

        if (gsap.utils.toArray(".reveal").length) {
          ScrollTrigger.batch(".reveal", {
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: REVEAL.duration,
                ease: EASE.reveal,
                stagger: REVEAL.stagger,
                overwrite: "auto",
              }),
          });
        }

        if (gsap.utils.toArray(".k3-drawline").length) {
          ScrollTrigger.batch(".k3-drawline", {
            start: "top 92%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                scaleX: 1,
                transformOrigin: "left center",
                duration: 1,
                ease: EASE.draw,
                stagger: 0.12,
                overwrite: "auto",
              }),
          });
        }

        // Parallax depth — desktop only (skip the work on touch/mobile for fps).
        const allowParallax = !window.matchMedia("(max-width: 720px)").matches;
        const DEPTH: Record<string, number> = { bg: 44, mid: 26, fg: -30 };
        if (allowParallax) {
          gsap.utils.toArray<HTMLElement>(".parallax").forEach((el) => {
            const attr = el.dataset.depth || "mid";
            const px = DEPTH[attr] ?? (parseFloat(attr) || 0);
            if (!px) return;
            const setY = gsap.quickSetter(el, "y", "px") as (v: number) => void;
            triggers.push(
              ScrollTrigger.create({
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                onUpdate: (self) => setY((self.progress - 0.5) * px),
              }),
            );
          });
        }

        // Scrubbed brass hairline across section breaks.
        gsap.utils.toArray<HTMLElement>(".k3-hairline").forEach((el) => {
          const setScale = gsap.quickSetter(el, "scaleX") as (v: number) => void;
          triggers.push(
            ScrollTrigger.create({
              trigger: el,
              start: "top 95%",
              end: "top 62%",
              scrub: true,
              onUpdate: (self) => setScale(self.progress),
            }),
          );
        });

        // Masked line reveals — split AFTER fonts settle (Bodoni Moda loads
        // display:swap; splitting early wraps lines wrong and clips the mask
        // mid-glyph). One refresh after all splits change layout.
        const buildLines = () => {
          if (cancelled) return;
          gsap.utils.toArray<HTMLElement>(".reveal-lines").forEach((el) => {
            const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
            splits.push(split);
            // The pre-paint hide in CSS (html.jd-anim .reveal-lines .line:
            // translateY(110%)) prevents a FOUC before this split runs, but GSAP
            // parses that computed translate into its pixel `y` channel. If we
            // only animate `yPercent`, that inherited `y` stays baked in and the
            // line never returns to the baseline. Pin `y:0` here so yPercent is
            // the sole driver of the wipe.
            gsap.set(split.lines, { yPercent: 110, y: 0 });
            triggers.push(
              ScrollTrigger.create({
                trigger: el,
                start: "top 85%",
                once: true,
                onEnter: () =>
                  gsap.to(split.lines, {
                    yPercent: 0,
                    duration: 0.9,
                    ease: EASE.reveal,
                    stagger: 0.12,
                  }),
              }),
            );
          });
          // Positions depend on fonts/images/splits that settle after mount.
          ScrollTrigger.refresh();
        };

        if (typeof document !== "undefined" && document.fonts?.ready) {
          document.fonts.ready.then(buildLines);
        } else {
          buildLines();
        }

        return () => {
          cancelled = true;
          triggers.forEach((t) => t.kill());
          splits.forEach((s) => s.revert());
        };
      });
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
