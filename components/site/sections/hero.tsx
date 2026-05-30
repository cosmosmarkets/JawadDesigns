"use client";

/* Home hero — "The Pass": an empty charger under a candlelit pool. On load a
   single GSAP timeline plates the scene — bloom blooms, the plate settles,
   "I serve" rises and "websites." plates letter-by-letter (SplitText masked),
   then the CTAs. A raw WebGL2 heat-shimmer (HeroShader) sits
   behind the plate.

   Reduced motion: matchMedia's no-preference branch never runs, so nothing
   animates and the .hero-in elements stay visible at rest (the html.jd-anim
   CSS gate that hides them pre-paint is only added when motion is allowed).
   The headline is server-rendered and only hidden once jd-anim is set, so LCP
   is the headline paint, verified after this stage. */

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, withMotion } from "@/lib/motion";
import { HeroShader } from "@/components/site/hero-shader";

export function Hero() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      return withMotion(() => {
        const word = scope.current!.querySelector<HTMLElement>(".k3-hero__word");
        const split = word
          ? SplitText.create(word, { type: "chars", mask: "chars" })
          : null;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Pre-set the staggered children's from-state at t=0 so flipping their
        // container to opacity:1 never flashes them visible.
        tl.set(".k3-hero__top .k3w", { opacity: 0, yPercent: 60 }, 0);
        if (split) tl.set(split.chars, { yPercent: 120 }, 0);
        tl.set(".k3-hero__dot", { opacity: 0 }, 0);
        tl.set(".k2-hero__ctas > *", { opacity: 0, y: 14 }, 0);

        tl
          // candlelight blooms, the plate settles under it
          .fromTo(".k3-hero__bloom", { opacity: 0, scale: 0.82 },
            { opacity: 0.9, scale: 1, duration: 1.2, ease: "power2.out" }, 0)
          .fromTo(".k3-plate", { opacity: 0, scale: 0.85, yPercent: 8 },
            { opacity: 1, scale: 1, yPercent: 0, duration: 1.0 }, 0.1)
          // "I serve" rises
          .set(".k3-hero__top", { opacity: 1 }, 0.35)
          .to(".k3-hero__top .k3w", { opacity: 1, yPercent: 0, stagger: 0.09, duration: 0.7 }, 0.35)
          // "websites." plates letter-by-letter (masked) + the ember dot.
          // The dot lands at rotation:45 so it keeps the diamond — animating to 0
          // would flatten it back to a round period and fight the CSS.
          .set(".k3-hero__big", { opacity: 1 }, 0.5)
          .to(split ? split.chars : [], { yPercent: 0, stagger: 0.04, duration: 0.72, ease: "power3.out" }, 0.5)
          .fromTo(".k3-hero__dot", { opacity: 0, scale: 0.3, rotation: 90 },
            { opacity: 1, scale: 1, rotation: 45, x: "-0.22em", y: "0.1em", transformOrigin: "50% 50%", duration: 0.55, ease: "back.out(2.4)" }, 1.0)
          // CTAs + cue land last
          .set(".k2-hero__ctas", { opacity: 1 }, 1.05)
          .to(".k2-hero__ctas > *", { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, 1.05)
          .fromTo(".k3-hero__cue", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.25);

        // Scroll-out: the plate lifts away and the bloom dims (parallax).
        const out = gsap.timeline({
          scrollTrigger: {
            trigger: scope.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        out
          .to(".k3-plate", { yPercent: -14, ease: "none" }, 0)
          .to(".k3-hero__bloom", { opacity: 0.18, ease: "none" }, 0);

        return () => split?.revert();
      });
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="hero"
      className="k2-hero k3-hero k3-hero--room"
      data-screen-label="hero"
    >
      <div className="k3-hero__bg" aria-hidden="true" />
      <HeroShader />
      <div className="k3-hero__spot" aria-hidden="true" />
      <div className="k3-hero__bloom hero-in" aria-hidden="true" />
      <div className="k3-plate hero-in" aria-hidden="true">
        <span className="k3-plate__rim" />
        <span className="k3-plate__well" />
      </div>
      <div className="k3-steam" aria-hidden="true">
        <span /><span /><span />
      </div>

      <div className="k2-hero__inner k3-hero__inner">
        <h1 className="k3-hero__h1" aria-label="I serve websites">
          <span className="k3-hero__top headline" aria-hidden="true">
            <span className="k3w">I</span> <span className="k3w">serve</span>
          </span>
          <span className="k3-hero__big" aria-hidden="true">
            <span className="k3-hero__word">websites</span>
            <span className="k3-hero__dot" aria-hidden="true" />
          </span>
        </h1>
        <div className="k2-hero__ctas hero-in">
          <Link href="/contact" className="btn red lg">
            Place your order <span className="arrow">→</span>
          </Link>
          <a href="#menu" className="btn ghost lg">See the menu</a>
        </div>
      </div>

      <a
        href="#trust"
        className="k3-hero__cue eyebrow-mono hero-in"
        aria-label="Scroll to see the menu"
      >
        Scroll to see the menu <span className="ar" aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
