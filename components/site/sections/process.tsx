"use client";

/* ============================================================================
   Process — Stage 3: a TRUE pinned cinematic scrub of the five-day service.
   ----------------------------------------------------------------------------
   The section is made tall (desktop, motion only); CSS position:sticky holds the
   inner .k3-procx__pin in view while a scrubbed GSAP timeline cross-fades the
   five course cards, advances the big day counter, lights the pips, and shifts
   the per-section atmosphere (steam intensity + spotlight bias). No discrete
   snap — everything moves continuously with scroll.

   Degradation (handled by CSS + withMotion, not by conditional rendering, so SSR
   and client markup match):
     • reduced motion / no-JS / data-motion=off → no jd-anim → static defaults:
       all five courses stack in normal flow, left rail hidden, no tall section.
     • mobile (≤720px) → the jd-anim overlap geometry is gated to min-width:721px
       and this component skips building the scrub, so mobile also stacks static.
   ========================================================================== */

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, withMotion } from "@/lib/motion";

const STEPS = [
  { n: "1", day: "Day 1", h: "Prep the brief", p: "A 30-minute call — scope, taste, references. No discovery sprint, no pitch deck. We both leave knowing exactly what we're cooking." },
  { n: "2", day: "Day 2", h: "First taste", p: "A moodboard and page structure within 24 hours. We taste it together and sign off the direction before a single pixel moves." },
  { n: "3", day: "Day 3", h: "Plate the design", p: "Design and build in parallel — real pages on a real domain, not Figma frames. A fresh snapshot lands in your inbox each day." },
  { n: "4", day: "Day 4", h: "Into the oven", p: "Polish, copy pass, motion, performance, responsive QA. The work nobody sees but everybody feels." },
  { n: "5", day: "Day 5", h: "Serve & hand off", p: "Ship it. Keys to the repo, the CMS, the analytics — plus thirty days of post-launch care, included." },
];

export function Process() {
  const secRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      return withMotion(() => {
        // Desktop only — mobile keeps the static stacked layout (CSS gates the
        // overlap geometry to min-width:721px to match this guard).
        if (window.matchMedia("(max-width: 720px)").matches) return;

        const root = document.documentElement;
        const sec = secRef.current;
        if (!sec) return;
        const courses = Array.from(sec.querySelectorAll<HTMLElement>(".k3-course"));
        const pips = Array.from(sec.querySelectorAll<HTMLElement>(".k3-procx__pip"));
        const dayEl = sec.querySelector<HTMLElement>(".k3-procx__day");
        if (courses.length < 2) return;

        // Resolve real token colours so we can tween pip fill (gsap can't animate
        // to a raw var()).
        const cs = getComputedStyle(root);
        const ember = cs.getPropertyValue("--ember").trim() || "#e8631a";
        const emberGlow = cs.getPropertyValue("--ember-glow").trim() || "rgba(232,99,26,.45)";
        const pipGlow = `0 0 14px -2px ${emberGlow}`;

        // Tall section = scroll distance for the sticky pin + scrub.
        sec.style.height = STEPS.length * 78 + 60 + "vh";

        // Initial states.
        gsap.set(courses[0], { opacity: 1, y: 0 });
        gsap.set(courses.slice(1), { opacity: 0, y: 18 });
        if (pips[0]) gsap.set(pips[0], { backgroundColor: ember, boxShadow: pipGlow });

        const last = STEPS.length - 1; // number of day-to-day transitions (4)
        const prog = { v: 0 };

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        // Continuous cross-fade between adjacent course cards — one equal slice
        // per transition (timeline spans 0..last).
        for (let i = 0; i < last; i++) {
          tl.to(courses[i], { opacity: 0, y: -18, ease: "power1.inOut", duration: 1 }, i)
            .fromTo(
              courses[i + 1],
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, ease: "power1.inOut", duration: 1 },
              i,
            );
        }

        // Pips light progressively as each day arrives (pip0 already lit).
        if (pips.length > 1) {
          tl.to(
            pips.slice(1),
            { backgroundColor: ember, boxShadow: pipGlow, ease: "none", duration: 0.3, stagger: { each: 1 } },
            1,
          );
        }

        // Big day counter — integer steps while everything else moves smoothly.
        tl.to(
          prog,
          {
            v: 1,
            ease: "none",
            duration: last,
            onUpdate: () => {
              if (dayEl) {
                const d = Math.max(1, Math.min(STEPS.length, Math.round(prog.v * last) + 1));
                dayEl.textContent = "Day " + d;
              }
            },
          },
          0,
        );

        // Per-day atmosphere: spotlight drifts (additive bias, composes with the
        // global --jd-spot-y setter), and the heat builds toward "into the oven"
        // (Day 4) then eases for the calm Day-5 handoff.
        tl.fromTo(root, { "--jd-spot-bias": "-6%" }, { "--jd-spot-bias": "6%", ease: "none", duration: last }, 0);
        tl.fromTo(root, { "--k3-steam-strength": 0.4 }, { "--k3-steam-strength": 0.9, ease: "none", duration: last - 1 }, 0)
          .to(root, { "--k3-steam-strength": 0.6, ease: "none", duration: 1 }, last - 1);

        return () => {
          sec.style.removeProperty("height");
          root.style.removeProperty("--jd-spot-bias");
          root.style.removeProperty("--k3-steam-strength");
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });
    },
    { scope: secRef },
  );

  return (
    <section id="process" ref={secRef} className="k3-light k3-procx" data-screen-label="process">
      <div className="k3-procx__pin">
        <div className="k3-steam" aria-hidden="true"><span /><span /><span /></div>
        <div className="k3-procx__inner">
          <header className="k3-procx__head reveal">
            <h2 className="headline k3-procx__title reveal-lines">Five courses. <span>Five days.</span></h2>
            <p className="k3-procx__scope">Each engagement is a finished site — designed, built in Next.js, and <b>shipped</b>. Copy direction, defined revision rounds, a clean handoff. Five days to <b>live</b>, not five weeks to a mockup.</p>
          </header>
          <div className="k3-procx__stage">
            <div className="k3-procx__left">
              <span className="eyebrow-mono k3-procx__nowserving">Now serving</span>
              <span className="display k3-procx__day">Day 1</span>
              <div className="k3-procx__progress" role="presentation">
                {STEPS.map((s) => <span key={s.n} className="k3-procx__pip" />)}
              </div>
              <span className="eyebrow-mono">{STEPS.length} courses</span>
            </div>
            <div className="k3-procx__courses">
              {STEPS.map((s) => (
                <article key={s.n} className="k3-course">
                  <span className="eyebrow-mono k3-course__day">{s.day}</span>
                  <h3 className="headline k3-course__h">{s.h}</h3>
                  <p className="k3-course__p">{s.p}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
