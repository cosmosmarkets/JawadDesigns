"use client";

/* Full /work body — the complete weld case study (the home only teases it).
   "Reserve the seat" routes to /contact now that the order modal is gone.

   Stage 0.5 motion. Class contracts owned by the global batches in
   smooth-scroll-provider (do NOT double-drive these here):
     • .reveal-lines on the three headings → masked line wipe (SplitText).
     • .reveal on the body blocks            → block fade/rise/scale cascade.
     • .k3-hairline at the reservation seam   → scrubbed brass line.
   This file owns ONE bespoke beat: the weld browser mockup .k2-flag__shot is
   the route's SIGNATURE element. It carries none of {reveal, reveal-lines,
   parallax} (the global cascade animates its PARENT .k2-flag, a different
   element — child + parent transforms compose, no fight), so the scoped
   timeline below is its sole transform-owner: it rises + slightly scales the
   mockup in as the flag enters view, then settles.

   Reduced motion / no-JS / data-motion=off: withMotion's no-preference branch
   never runs, html.jd-anim is absent, and the CSS leaves the mockup visible at
   rest — nothing here animates. */

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, withMotion } from "@/lib/motion";

export function WorkFull() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      return withMotion(() => {
        const shot = scope.current?.querySelector<HTMLElement>(".k2-flag__shot");
        if (!shot) return;

        // Pre-paint, the shot is hidden because its parent .k2-flag.reveal sits
        // at opacity:0 under html.jd-anim; pinning the from-state here at t=0
        // hands the rise/scale to this timeline before it plays, so the mockup
        // never flashes settled. We own transform on the child only.
        const tween = gsap.fromTo(
          shot,
          { yPercent: 18, scale: 0.94, opacity: 0 },
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".k2-flag",
              start: "top 78%",
              once: true,
            },
          },
        );

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(shot, { clearProps: "transform,opacity" });
        };
      });
    },
    { scope },
  );

  return (
    <main ref={scope}>
      <section id="work" className="sec ink k2-work" data-screen-label="work">
        <div className="k2-work__dots" aria-hidden="true" />
        <div className="k3-steam" aria-hidden="true"><span /><span /><span /></div>
        <header className="wrap k2-work__head reveal">
          <span className="kicker">Work</span>
          <h2 className="headline k2-work__title reveal-lines">From the pass.</h2>
        </header>
        <div className="wrap k2-flag reveal">
          <div className="k2-flag__shot">
            <div className="k2-browser">
              <div className="k2-browser__bar"><span /><span /><span /><em>weldapp.vercel.app</em></div>
              {/* eslint-disable-next-line @next/next/no-img-element -- sized by .k2-browser CSS; next/image wrapper would break the mockup layout */}
              <img src="/images/weld.png" alt="weld — developer marketplace, sample profile cards" loading="lazy" />
            </div>
          </div>
          <div className="k2-flag__body">
            <div className="k2-flag__head">
              <span className="chip gold">Flagship case study</span>
              <h3 className="headline k2-flag__name reveal-lines">weld.</h3>
              <p className="k2-flag__tag">A two-sided marketplace connecting game studios with vetted developers.</p>
            </div>
            <dl className="k2-flag__story">
              <div><dt className="eyebrow-mono">The problem</dt><dd>Studios couldn&apos;t find proven developers; developers had nowhere to show real, verified work. No product existed — just a messy, word-of-mouth market.</dd></div>
              <div><dt className="eyebrow-mono">What I cooked</dt><dd>The whole thing, solo: brand, product design, and a production Next.js build — onboarding, profiles, search, and a two-sided matching flow.</dd></div>
              <div><dt className="eyebrow-mono">The stack</dt><dd>Next.js · TypeScript · Tailwind · Supabase · Vercel</dd></div>
            </dl>
            <div className="k2-flag__metrics">
              <div className="k2-metric"><span className="display k2-metric__n">200</span><span className="k2-metric__l">signups, organically</span></div>
              <div className="k2-metric"><span className="display k2-metric__n">$0</span><span className="k2-metric__l">spent on paid marketing</span></div>
              <div className="k2-metric"><span className="display k2-metric__n">1</span><span className="k2-metric__l">chef, start to ship</span></div>
            </div>
            <a href="https://weldapp.vercel.app" target="_blank" rel="noopener noreferrer" className="btn ghost">Visit weld <span className="arrow">→</span></a>
          </div>
        </div>
        <div className="k3-hairline" aria-hidden />
        <div className="wrap k2-resv reveal" aria-label="One seat open this month">
          <div className="k2-resv__l">
            <span className="eyebrow-mono">The next plate</span>
            <h3 className="headline k2-resv__h reveal-lines">One seat is open<br />at the counter this month.</h3>
          </div>
          <div className="k2-resv__r">
            <p>weld is the first dish served from this kitchen. Your launch could be the second — designed and built with the same undivided attention.</p>
            <Link href="/contact" className="btn red">Reserve the seat <span className="arrow">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
