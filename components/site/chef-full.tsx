"use client";

/* Full /about body — the fuller "meet the chef" story the home only teases.

   Stage 0.5 motion: the brass crest is this route's SIGNATURE. A scoped useGSAP
   timeline (withMotion) draws it in on load — the two rings and the J monogram
   bloom up with opacity + scale (transform only; SVG circle r is unreliable, so
   we scale the decorative crest group instead). The crest carries none of the
   global motion classes, so this timeline is its sole transform-owner.

   Coordination:
     • The lead H1 (.k3-chef__h) gets "reveal-lines" — the global batch SplitTexts
       and wipes it; we never split it here.
     • .k3-chef__grid keeps its global "reveal" (block fade/rise cascade).
     • .k3-chef__portrait is a clean parallax target (no reveal/reveal-lines, and
       NOT animated by this timeline — we animate the inner rings/J, not the outer
       container), so it carries parallax data-depth="bg".
     • A .k3-hairline divider sits at the section seam (new empty div — always safe).

   Reduced motion: withMotion's no-preference branch never runs, so the crest stays
   visible at rest (the html.jd-anim pre-paint hide is only added when motion is on).
*/

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, withMotion } from "@/lib/motion";
import { TicketBeacon } from "@/components/site/ticket";

export function ChefFull() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      return withMotion(() => {
        const root = scope.current;
        if (!root) return;

        const rings = root.querySelectorAll<SVGElement>(".k3-crest__ring");
        const mono = root.querySelector<HTMLElement>(".k3-crest__j");
        if (!rings.length && !mono) return;

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Rings draw in: scale up from the centre + fade. transformOrigin centre
        // so they bloom around the monogram rather than from a corner.
        tl.fromTo(
          rings,
          { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" },
          { opacity: 1, scale: 1, duration: 1.0, stagger: 0.12 },
          0,
        );

        // The J monogram settles a beat after the rings, scaling up into place.
        if (mono) {
          tl.fromTo(
            mono,
            { opacity: 0, scale: 0.7, transformOrigin: "50% 50%" },
            { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" },
            0.3,
          );
        }

        return () => {
          tl.kill();
        };
      });
    },
    { scope },
  );

  return (
    <main>
      <section
        ref={scope}
        id="chef"
        className="sec ink k3-chef"
        data-screen-label="chef"
      >
        <div className="wrap k3-chef__grid reveal">
          <div
            className="k3-chef__portrait k3-chef__crest parallax"
            data-depth="bg"
            aria-hidden="true"
          >
            <span className="k3-crest">
              <svg className="k3-crest__svg" viewBox="0 0 120 120" focusable="false" aria-hidden="true">
                <circle className="k3-crest__ring" cx="60" cy="60" r="56" />
                <circle className="k3-crest__ring k3-crest__ring--inner" cx="60" cy="60" r="48" />
              </svg>
              <span className="k3-crest__j headline">J</span>
              <span className="eyebrow-mono k3-crest__cap">One chef, one ticket</span>
            </span>
          </div>
          <div className="k3-chef__body">
            <span className="kicker">About</span>
            <h1 className="headline k3-chef__h reveal-lines">One chef.<br /><span>One ticket at a time.</span></h1>
            <p>I&apos;m Jawad — a designer <em>and</em> developer. Every site that leaves this kitchen is cooked by one pair of hands, brief to launch. No account managers, no offshore handoffs, nothing lost between the idea and the build.</p>
            <p>Taking one project at a time isn&apos;t a limitation — it&apos;s the feature. Your launch gets the whole kitchen, undivided, and ships in days because there&apos;s no one to wait on but me.</p>
            <p>I cook two things and cook them properly: portfolio sites for creatives and landing pages for founders, each with a light brand system to tie it together. Strategy, design, and a production Next.js build — start to ship, same hands.</p>
            <Link href="/contact" className="btn red">Work with me <span className="arrow">→</span></Link>
          </div>
        </div>
        {/* THE RECIPE inks once you've read past the meet-the-chef story */}
        <TicketBeacon slot="RECIPE" />
        <div className="k3-hairline" aria-hidden />
      </section>
    </main>
  );
}
