"use client";

import { useState, useEffect, useRef } from "react";

/* Five-day process. The scroll-driven active-step logic is ported 1:1; the
   richer scroll motion is a later (Stage 4+) job. id="process" is the target
   of the /#process nav anchor. */
const STEPS = [
  { n: "1", day: "Day 1", h: "Prep the brief", p: "A 30-minute call — scope, taste, references. No discovery sprint, no pitch deck. We both leave knowing exactly what we're cooking." },
  { n: "2", day: "Day 2", h: "First taste", p: "A moodboard and page structure within 24 hours. We taste it together and sign off the direction before a single pixel moves." },
  { n: "3", day: "Day 3", h: "Plate the design", p: "Design and build in parallel — real pages on a real domain, not Figma frames. A fresh snapshot lands in your inbox each day." },
  { n: "4", day: "Day 4", h: "Into the oven", p: "Polish, copy pass, motion, performance, responsive QA. The work nobody sees but everybody feels." },
  { n: "5", day: "Day 5", h: "Serve & hand off", p: "Ship it. Keys to the repo, the CMS, the analytics — plus thirty days of post-launch care, included." },
];

export function Process() {
  const secRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = sec.getBoundingClientRect();
        const span = sec.offsetHeight - window.innerHeight;
        const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
        setActive(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section
      id="process"
      ref={secRef}
      className="k3-light k3-procx"
      data-screen-label="process"
      style={{ height: STEPS.length * 78 + 60 + "vh" }}
    >
      <div className="k3-procx__pin">
        <div className="k3-steam" aria-hidden="true"><span /><span /><span /></div>
        <div className="k3-procx__inner">
          <header className="k3-procx__head reveal">
            <h2 className="headline k3-procx__title">Five courses. <span>Five days.</span></h2>
            <p className="k3-procx__scope">Each engagement is a finished site — designed, built in Next.js, and <b>shipped</b>. Copy direction, defined revision rounds, a clean handoff. Five days to <b>live</b>, not five weeks to a mockup.</p>
          </header>
          <div className="k3-procx__stage">
            <div className="k3-procx__left">
              <span className="eyebrow-mono k3-procx__nowserving">Now serving</span>
              <span className="display k3-procx__day">Day {active + 1}</span>
              <div className="k3-procx__progress" role="presentation">
                {STEPS.map((s, i) => <span key={i} className={"k3-procx__pip" + (i <= active ? " on" : "")} />)}
              </div>
              <span className="eyebrow-mono">{active + 1} / {STEPS.length} courses</span>
            </div>
            <div className="k3-procx__courses">
              {STEPS.map((s, i) => (
                <article key={s.n} className={"k3-course" + (i === active ? " on" : "")} aria-hidden={i !== active}>
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
