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
  EASE,
  REVEAL,
  LENIS_CONFIG,
} from "@/lib/motion";

export function SmoothScrollProvider() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  // 1) Lenis + the global motion flag — set up once, reduced-motion reactive.
  useGSAP(() => {
    const root = document.documentElement;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The boot script in layout already added jd-anim pre-paint; keep it
      // owned here so a live OS toggle stays in sync.
      root.classList.add("jd-anim");

      const lenis = new Lenis(LENIS_CONFIG);
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);

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
        root.classList.remove("jd-anim");
      };
    });

    return () => mm.revert();
  }, []);

  // 2) Reveal batch — rebuilt per route because `children` changes on nav.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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

        // Positions depend on fonts/images that may settle after mount.
        ScrollTrigger.refresh();
      });

      return () => mm.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
