"use client";

// Jawad Design "fine dining" home — ported to Next from the static prototype
// (k3-home.jsx). Static-parity port: all existing plain-React/DOM behaviour is
// preserved 1:1; the GSAP/ScrollTrigger reveal layer (window.JDMotion) is
// intentionally dropped — it returns with the motion stack in Stage 0.

import { useState, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, FormEvent } from "react";

const ASSET = { weld: "/images/weld.png" };

/* opt-in "plating" tick (muted by default) */
let _actx: AudioContext | null = null;
function plate(freq = 320) {
  if (typeof document === "undefined" || document.body.dataset.sound !== "on") return;
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    _actx = _actx || new AC();
    const t = _actx.currentTime,
      o = _actx.createOscillator(),
      g = _actx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.12);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g);
    g.connect(_actx.destination);
    o.start(t);
    o.stop(t + 0.18);
  } catch {
    /* best-effort: audio is decorative */
  }
}

/* single conversion entry point — opens the order modal */
function openOrder(e?: ReactMouseEvent<HTMLElement>) {
  if (e) e.preventDefault();
  plate(360);
  const dish = e?.currentTarget?.dataset.dish ?? "";
  window.dispatchEvent(new CustomEvent("jd:order", { detail: dish }));
}

function Mark() {
  return (
    <a href="#top" className="k3-mark" aria-label="Jawad Design — home">
      <span className="k3-mark__badge" aria-hidden="true">JD</span>
      <span className="k3-mark__txt">
        <span className="k3-mark__name headline">Jawad Design</span>
        <span className="k3-mark__sub">Web studio · est. 2024</span>
      </span>
    </a>
  );
}

/* ============================ NAV (maitre-d + mobile drawer) ============================ */
const NAV_LINKS: [string, string][] = [
  ["Work", "#work"],
  ["Chef", "#chef"],
  ["Process", "#process"],
  ["Menu", "#menu"],
  ["Details", "#pantry"],
];
function Nav() {
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const nav = document.querySelector(".k2-nav");
    const onScroll = () => {
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);
  return (
    <header className="k2-nav" id="top" data-screen-label="nav">
      <Mark />
      <nav className="k2-nav__links" aria-label="Primary">
        {NAV_LINKS.map(([l, h]) => (
          <a key={l} href={h}>{l}</a>
        ))}
      </nav>
      <a href="#order" className="btn red sm k2-nav__cta" onClick={openOrder}>
        Place your order <span className="arrow">→</span>
      </a>
      <button
        className="k3-burger"
        aria-label="Open menu"
        aria-expanded={menu}
        onClick={() => setMenu(true)}
      >
        <span /><span /><span />
      </button>

      <div
        className={"k3-drawer" + (menu ? " open" : "")}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menu}
      >
        <div className="k3-drawer__top">
          <span className="k3-mark__name headline">Jawad Design</span>
          <button className="k3-drawer__x" aria-label="Close menu" onClick={() => setMenu(false)}>✕</button>
        </div>
        <nav className="k3-drawer__links" aria-label="Mobile">
          {NAV_LINKS.map(([l, h]) => (
            <a key={l} href={h} onClick={() => setMenu(false)}>{l}</a>
          ))}
        </nav>
        <a
          href="#order"
          className="btn red lg k3-drawer__cta"
          onClick={(e) => {
            setMenu(false);
            openOrder(e);
          }}
        >
          Place your order <span className="arrow">→</span>
        </a>
        <span className="eyebrow-mono k3-drawer__note">One seat open this month</span>
      </div>
    </header>
  );
}

/* ============================ HERO ============================ */
function Hero() {
  return (
    <section id="hero" className="k2-hero k3-hero k3-hero--room" data-screen-label="hero">
      <div className="k3-hero__bg" aria-hidden="true" />
      <div className="k2-hero__inner k3-hero__inner">
        <h1 className="k3-hero__h1" aria-label="I serve websites">
          <span className="k3-hero__top headline" aria-hidden="true">
            <span className="k3w" style={{ animationDelay: "0.05s" }}>I</span>{" "}
            <span className="k3w" style={{ animationDelay: "0.16s" }}>serve</span>
          </span>
          <span className="k3-hero__big" aria-hidden="true">
            {"websites".split("").map((ch, i) => (
              <span key={i} className="k3l" style={{ animationDelay: 0.34 + i * 0.07 + "s" }}>{ch}</span>
            ))}
            <span className="k3l k3-hero__dot" style={{ animationDelay: 0.34 + 8 * 0.07 + "s" }}>.</span>
          </span>
        </h1>
        <p className="k2-hero__sub k3-hero__sub">
          I design and build portfolio sites and landing pages — beautiful, fast,
          and made to convert.
        </p>
        <div className="k2-hero__ctas">
          <a href="#order" className="btn red lg" onClick={openOrder}>Place your order <span className="arrow">→</span></a>
          <a href="#menu" className="btn ghost lg">See the menu</a>
        </div>
      </div>
      <a href="#trust" className="k3-hero__cue eyebrow-mono" aria-label="Scroll to see the menu">
        Scroll to see the menu <span className="ar" aria-hidden="true">↓</span>
      </a>
    </section>
  );
}

/* ============================ TRUST ============================ */
function Trust() {
  const claims = [
    { h: "Designed &amp; built", h2: "by the same hands.", p: "Strategy, design, and development from one person — no agency overhead, no handoffs, nothing lost in translation." },
    { h: "Live in a week,", h2: "not a quarter.", p: "A finished, deployed site in a single working week — and you watch it come together day by day." },
    { h: "Two things,", h2: "done exceptionally.", p: "Portfolio sites and landing pages — that's the whole menu. No dashboards, no MVPs, no scope creep." },
  ];
  const mq = ["JAWAD DESIGN", "✦", "MADE TO ORDER", "✦", "FIVE DAYS TO LIVE", "✦", "ONE CHEF, ONE TICKET", "✦"];
  const track = [...mq, ...mq];
  return (
    <section id="trust" className="sec cream k2-trust" data-screen-label="trust">
      <div className="k2-trust__mq mq" aria-hidden="true">
        <div className="mq__t">{track.map((t, i) => <span key={i} className="display k2-trust__mqitem">{t}</span>)}</div>
      </div>
      <div className="wrap k2-trust__grid">
        {claims.map((c, i) => (
          <article key={i} className={"k2-claim reveal d" + i}>
            <span className="k3-drawline reveal k2-claim__line" />
            <h3
              className="headline k2-claim__h"
              dangerouslySetInnerHTML={{ __html: c.h + "<br/><span class='k2-claim__h2'>" + c.h2 + "</span>" }}
            />
            <p className="k2-claim__p">{c.p}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ============================ WHY ============================ */
function Why() {
  const items = [
    { n: "01", name: "Portfolio sites", price: "for creatives", body: "Built so the next commission comes from the last visitor — clear projects, real outcomes, and a first impression that does the qualifying for you." },
    { n: "02", name: "Landing pages", price: "for founders", body: "Built around your offer, not a template's idea of one. A hero that earns the scroll, structure that matches how people decide, copy you can defend to a CFO." },
    { n: "03", name: "A light brand system", price: "with every plate", body: "Just enough — type, colour, voice — to keep the site, the deck, and the next launch feeling like one studio made them. Yours, not stock." },
  ];
  return (
    <section id="why" className="sec ink k2-why" data-screen-label="why-order">
      <header className="wrap k2-why__head reveal">
        <h2 className="headline k2-why__title">A short menu, <span>cooked properly.</span></h2>
        <p className="k2-why__lede">Two main courses and the seasoning that ties them together. Here, plainly, is what I make.</p>
      </header>
      <ol className="wrap k2-why__menu">
        {items.map((it, i) => (
          <li key={it.n} className={"k2-why__row reveal d" + (i % 3)}>
            <div className="k2-why__left">
              <span className="eyebrow-mono k2-why__no">№ {it.n}</span>
              <h3 className="headline k2-why__name">{it.name}</h3>
              <span className="k2-why__leader" aria-hidden="true" />
              <span className="k2-why__price">{it.price}</span>
            </div>
            <p className="k2-why__body">{it.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ============================ WORK ============================ */
function Work() {
  return (
    <section id="work" className="sec ink k2-work" data-screen-label="work">
      <div className="k2-work__dots" aria-hidden="true" />
      <div className="k3-steam" aria-hidden="true"><span /><span /><span /></div>
      <header className="wrap k2-work__head reveal">
        <h2 className="headline k2-work__title">From the pass.</h2>
      </header>
      <div className="wrap k2-flag reveal">
        <div className="k2-flag__shot">
          <div className="k2-browser">
            <div className="k2-browser__bar"><span /><span /><span /><em>weldapp.vercel.app</em></div>
            {/* eslint-disable-next-line @next/next/no-img-element -- sized by .k2-browser CSS; next/image wrapper would break the mockup layout */}
            <img src={ASSET.weld} alt="weld — developer marketplace, sample profile cards" loading="lazy" />
          </div>
        </div>
        <div className="k2-flag__body">
          <div className="k2-flag__head">
            <span className="chip gold">Flagship case study</span>
            <h3 className="headline k2-flag__name">weld.</h3>
            <p className="k2-flag__tag">A two-sided marketplace connecting game studios with vetted developers.</p>
          </div>
          <dl className="k2-flag__story">
            <div><dt className="eyebrow-mono">The problem</dt><dd>Studios couldn't find proven developers; developers had nowhere to show real, verified work. No product existed — just a messy, word-of-mouth market.</dd></div>
            <div><dt className="eyebrow-mono">What I cooked</dt><dd>The whole thing, solo: brand, product design, and a production Next.js build — onboarding, profiles, search, and a two-sided matching flow.</dd></div>
            <div><dt className="eyebrow-mono">The stack</dt><dd>Next.js · TypeScript · Tailwind · Supabase · Vercel</dd></div>
          </dl>
          <div className="k2-flag__metrics">
            <div className="k2-metric"><span className="display k2-metric__n">200</span><span className="k2-metric__l">signups, organically</span></div>
            <div className="k2-metric"><span className="display k2-metric__n">$0</span><span className="k2-metric__l">spent on paid marketing</span></div>
            <div className="k2-metric"><span className="display k2-metric__n">1</span><span className="k2-metric__l">chef, start to ship</span></div>
          </div>
          <a href="https://weldapp.vercel.app" target="_blank" rel="noopener" className="btn ghost">Visit weld <span className="arrow">→</span></a>
        </div>
      </div>
      <div className="wrap k2-resv reveal" aria-label="One seat open this month">
        <div className="k2-resv__l">
          <span className="eyebrow-mono">The next plate</span>
          <h3 className="headline k2-resv__h">One seat is open<br />at the counter this month.</h3>
        </div>
        <div className="k2-resv__r">
          <p>weld is the first dish served from this kitchen. Your launch could be the second — designed and built with the same undivided attention.</p>
          <a href="#order" className="btn red" onClick={openOrder}>Reserve the seat <span className="arrow">→</span></a>
        </div>
      </div>
    </section>
  );
}

/* ============================ CHEF (meet the chef) ============================ */
function Chef() {
  return (
    <section id="chef" className="sec ink k3-chef" data-screen-label="chef">
      <div className="wrap k3-chef__grid reveal">
        <div className="k3-chef__portrait">
          <div className="k3-chef__frame" aria-hidden="true">
            <span className="k3-chef__mono headline">J</span>
            <span className="eyebrow-mono k3-chef__cap">Portrait — coming soon</span>
          </div>
        </div>
        <div className="k3-chef__body">
          <span className="eyebrow-mono" style={{ color: "var(--brass)" }}>Meet the chef</span>
          <h2 className="headline k3-chef__h">One chef.<br /><span>One ticket at a time.</span></h2>
          <p>I'm Jawad — a designer <em>and</em> developer. Every site that leaves this kitchen is cooked by one pair of hands, brief to launch. No account managers, no offshore handoffs, nothing lost between the idea and the build.</p>
          <p>Taking one project at a time isn't a limitation — it's the feature. Your launch gets the whole kitchen, undivided, and ships in days because there's no one to wait on but me.</p>
          <a href="#order" className="btn ghost" onClick={openOrder}>Work with me <span className="arrow">→</span></a>
        </div>
      </div>
    </section>
  );
}

/* ============================ PROCESS ============================ */
const STEPS = [
  { n: "1", day: "Day 1", h: "Prep the brief", p: "A 30-minute call — scope, taste, references. No discovery sprint, no pitch deck. We both leave knowing exactly what we're cooking." },
  { n: "2", day: "Day 2", h: "First taste", p: "A moodboard and page structure within 24 hours. We taste it together and sign off the direction before a single pixel moves." },
  { n: "3", day: "Day 3", h: "Plate the design", p: "Design and build in parallel — real pages on a real domain, not Figma frames. A fresh snapshot lands in your inbox each day." },
  { n: "4", day: "Day 4", h: "Into the oven", p: "Polish, copy pass, motion, performance, responsive QA. The work nobody sees but everybody feels." },
  { n: "5", day: "Day 5", h: "Serve & hand off", p: "Ship it. Keys to the repo, the CMS, the analytics — plus thirty days of post-launch care, included." },
];
function Process() {
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

/* ============================ MENU ============================ */
type Tier = {
  name: string;
  price: string;
  tag: string;
  rank: number;
  feat: string[];
  why?: string;
  cta: string;
};
const TIERS: Tier[] = [
  { name: "À la carte", price: "500", tag: "Single course", rank: 0,
    feat: ["Up to 3 pages, designed + built", "Copy direction included", "1 revision round", "Live in five days", "30 days post-launch care"], cta: "Order à la carte" },
  { name: "The Tasting Menu", price: "1,200", tag: "Most ordered", rank: 1,
    feat: ["Up to 5 pages, designed + built", "Copy direction + light brand polish", "2 revision rounds", "CMS so you can edit it yourself", "Source files + clean handoff"], cta: "Order the tasting menu" },
  { name: "The Chef's Table", price: "3,000", tag: "The flagship", rank: 2,
    feat: ["Full multi-page site", "A signature, bespoke interaction", "Brand system — type, colour, voice", "3 revision rounds", "Priority scheduling + 60 days care"],
    why: "The full experience — strategy, brand, and a bespoke build with the kind of polish that gets your site screenshotted and shared.", cta: "Book the Chef's Table" },
];
function Menu() {
  const cardRef = useRef<HTMLDivElement>(null);
  // Static-parity port: default open so the tiers are visible. The cover-to-menu
  // 3D unfold is a Stage 4 signature moment; here we keep the in-view opener too.
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            setOpen(true);
            obs.disconnect();
          }
        }),
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <section id="menu" className="k3-light k2-menu" data-screen-label="menu">
      <header className="wrap k2-menu__head reveal">
        <h2 className="headline k2-menu__title">Three ways <span>to dine.</span></h2>
        <p className="k2-menu__sub">Every option is designed and built by one chef, start to ship. Prices are where the conversation starts.</p>
      </header>
      <div ref={cardRef} className={"k3-menucard" + (open ? " is-open" : "")}>
        <button className="k3-menucard__cover" onClick={() => setOpen(true)} aria-label="Open the menu">
          <span className="k3-menucard__crest" aria-hidden="true">JD</span>
          <span className="k3-menucard__word">The Menu</span>
          <span className="k3-menucard__sub eyebrow-mono">Prix fixe · three courses</span>
          <span className="k3-menucard__open eyebrow-mono">Open the menu ↓</span>
        </button>
        <div className="wrap k2-menu__grid">
          {TIERS.map((t) => (
            <article key={t.name} className={"k2-tier reveal d" + t.rank + (t.rank === 2 ? " is-flag" : "") + (t.rank === 1 ? " is-feat" : "")}>
              {t.rank === 2 && <span className="k2-tier__ribbon flag">Chef's table</span>}
              {t.rank === 1 && <span className="k2-tier__ribbon">Most ordered</span>}
              <span className="eyebrow-mono k2-tier__tag">{t.tag}</span>
              <h3 className="headline k2-tier__name">{t.name}</h3>
              <div className="k2-tier__price"><span className="k2-tier__from">from</span><span className="display k2-tier__num">${t.price}</span></div>
              {t.why && <p className="k2-tier__why">{t.why}</p>}
              <ul className="k2-tier__feat">{t.feat.map((f) => <li key={f}><span aria-hidden="true">✦</span>{f}</li>)}</ul>
              <a href="#order" data-dish={t.name} onClick={openOrder} className={"btn " + (t.rank === 2 ? "red" : "ghost") + " k2-tier__cta"}>{t.cta} <span className="arrow">→</span></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ DETAILS ============================ */
function Pantry() {
  const items = [
    { h: "Loads in under a second", p: "Hand-tuned performance. Fast sites rank higher and lose fewer visitors." },
    { h: "Found on Google", p: "SEO considered from the first line — clean markup, real metadata, proper structure." },
    { h: "Yours to keep", p: "You own the code, the domain, and the content. Never held hostage by a platform." },
    { h: "No lock-in", p: "Built on Next.js — any developer can pick it up. Not a closed website builder." },
    { h: "Sharp on every screen", p: "Phone, tablet, desktop — composed to look right at every table." },
    { h: "Measured", p: "Analytics wired in from day one, so you can see exactly what the site is doing." },
  ];
  return (
    <section id="pantry" className="k3-light k2-pan2" data-screen-label="pantry">
      <header className="wrap k2-pan2__head reveal">
        <h2 className="headline k2-pan2__title">What every plate <span>comes with.</span></h2>
        <p className="k2-pan2__sub">No upsells, no surprises. These aren't add-ons — they're the standard.</p>
      </header>
      <div className="wrap k2-pan2__list">
        {items.map((it, i) => (
          <div key={it.h} className={"k2-pan2__row reveal d" + (i % 3)}>
            <span className="display k2-pan2__no">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="headline k2-pan2__h">{it.h}</h3>
            <p className="k2-pan2__p">{it.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================ GUESTBOOK ============================ */
function Guestbook() {
  return (
    <section id="guestbook" className="sec cream k2-guest" data-screen-label="guestbook">
      <div className="wrap k2-guest__inner reveal">
        <p className="headline-it k2-guest__quote">&ldquo;Really nice to work with, he really cooks.&rdquo;</p>
        <p className="k2-guest__sub">Joel Jeon, Co-Founder at weld.</p>
      </div>
    </section>
  );
}

/* ============================ CTA ============================ */
function Cta() {
  return (
    <section id="cta" className="sec red k2-cta k3-cta2" data-screen-label="cta">
      <div className="k2-cta__grid" aria-hidden="true" />
      <div className="k3-steam" aria-hidden="true"><span /><span /><span /></div>
      <div className="wrap k3-reserve reveal">
        <div className="k3-reserve__card">
          <span className="k3-reserve__corner k3-reserve__corner--tl" aria-hidden="true" />
          <span className="k3-reserve__corner k3-reserve__corner--br" aria-hidden="true" />
          <span className="script xl k3-reserve__script">Ready to order?</span>
          <h2 className="headline k3-reserve__h">Reserve your seat<span className="k3-hero__dot">.</span></h2>
          <div className="k3-reserve__rows">
            <div className="k3-reserve__row"><span className="eyebrow-mono">Reservation</span><span className="k3-reserve__v">No. 002</span></div>
            <div className="k3-reserve__row"><span className="eyebrow-mono">Table</span><span className="k3-reserve__v">01 — for one</span></div>
            <div className="k3-reserve__row"><span className="eyebrow-mono">Seating</span><span className="k3-reserve__v">This month · 1 seat left</span></div>
            <div className="k3-reserve__row"><span className="eyebrow-mono">Party</span><span className="k3-reserve__v">You + Jawad</span></div>
          </div>
          <p className="k3-reserve__sub">One project at a time, so yours gets the whole kitchen. Leave your email and I'll reply within 24 hours with a plan and a price.</p>
          <a href="#order" className="btn red lg k3-reserve__cta" onClick={openOrder}>Place your order <span className="arrow">→</span></a>
          <div className="k3-reserve__links">
            <a href="#menu">See the menu</a><span aria-hidden="true">·</span>
            <a href="https://weldapp.vercel.app" target="_blank" rel="noopener">weld</a><span aria-hidden="true">·</span>
            <a href="mailto:hi@jawad.design">hi@jawad.design</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ FOOTER ============================ */
function Footer() {
  const cols: { h: string; items: [string, string, boolean?][] }[] = [
    { h: "Menu", items: [["Work", "#work"], ["Pricing", "#menu"]] },
    { h: "Kitchen", items: [["Meet the chef", "#chef"], ["Process", "#process"], ["Always included", "#pantry"]] },
    { h: "Order", items: [["Place an order", "#order", true], ["Email", "mailto:hi@jawad.design"]] },
    { h: "Elsewhere", items: [["weld", "https://weldapp.vercel.app"], ["Read.cv", "https://read.cv"]] },
  ];
  const mq = ["JAWAD DESIGN", "✦", "MADE TO ORDER", "✦", "ONE CHEF · ONE TICKET", "✦", "FIVE DAYS TO LIVE", "✦"];
  const track = [...mq, ...mq];
  return (
    <footer className="k2-foot" data-screen-label="footer">
      <div className="k2-foot__mq mq rev" aria-hidden="true">
        <div className="mq__t">{track.map((t, i) => <span key={i} className="display k2-foot__mqitem">{t}</span>)}</div>
      </div>
      <div className="wrap k2-foot__top">
        <div className="k2-foot__brand">
          <Mark />
          <p className="k2-foot__tag">A one-chef kitchen for portfolio sites &amp; landing pages. Made to order, plated in five days.</p>
          <a href="#order" className="btn red" onClick={openOrder}>Place your order <span className="arrow">→</span></a>
        </div>
        <div className="k2-foot__cols">
          {cols.map((c) => (
            <div key={c.h}>
              <h4 className="eyebrow-mono">{c.h}</h4>
              <ul>{c.items.map(([l, href, isOrder]) => <li key={l}><a href={href} onClick={isOrder ? openOrder : undefined}>{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
      </div>
      <div className="wrap k2-foot__fine">
        <span className="eyebrow-mono">© {new Date().getFullYear()} Jawad Design · A one-person studio</span>
        <span className="eyebrow-mono">Made to order · plated in five days</span>
      </div>
    </footer>
  );
}

/* ============================ ORDER MODAL (email → pre-filled contact) ============================ */
function OrderModal() {
  const [open, setOpen] = useState(false);
  const [dish, setDish] = useState("");
  const [email, setEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setDish(detail);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("jd:order", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("jd:order", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    plate(420);
    const subj = encodeURIComponent("New order — " + (dish || "a website"));
    const body = encodeURIComponent("Hi Jawad,\n\nI'd like to place an order" + (dish ? " for: " + dish : "") + ".\n\nMy email: " + email + "\n\nWhat I'm launching:\n");
    window.location.href = "mailto:hi@jawad.design?subject=" + subj + "&body=" + body;
  };
  if (!open) return null;
  const dishes = ["Portfolio site", "Landing page", "The Chef's Table"];
  return (
    <div
      className="k3-order"
      role="dialog"
      aria-modal="true"
      aria-label="Place your order"
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains("k3-order")) setOpen(false);
      }}
    >
      <div className="k3-order__card">
        <button className="k3-order__x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        <span className="eyebrow-mono" style={{ color: "var(--brass)" }}>Order ticket · Table 01</span>
        <h2 className="headline k3-order__h">Place your order<span style={{ color: "var(--ember)" }}>.</span></h2>
        <p className="k3-order__sub">Pick a dish (optional), leave your email, and I'll open a pre-filled note — back to you within 24 hours.</p>
        <div className="k3-order__chips" role="group" aria-label="Choose a dish">
          {dishes.map((d) => (
            <button
              key={d}
              type="button"
              className={"k3-order__chip" + (dish === d ? " on" : "")}
              onClick={() => setDish(dish === d ? "" : d)}
              aria-pressed={dish === d}
            >
              {d}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="k3-order__form">
          <input
            ref={inputRef}
            type="email"
            required
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="k3-order__input"
            aria-label="Your email"
          />
          <button type="submit" className="btn red lg">Continue <span className="arrow">→</span></button>
        </form>
        <span className="k3-order__fine eyebrow-mono">Opens your email · no spam, one human reply</span>
      </div>
    </div>
  );
}

/* ============================ ORDER DOCKET ============================ */
function Docket() {
  const rows: [string, string][] = [
    ["hero", "Seated"],
    ["work", "Signature dish"],
    ["chef", "Met the chef"],
    ["process", "The recipe"],
    ["menu", "The menu"],
    ["cta", "Order placed"],
  ];
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [show, setShow] = useState(false);
  const [sound, setSound] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.6);
      const next: Record<string, boolean> = {};
      rows.forEach(([id]) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) next[id] = true;
      });
      setDone(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggleSound = () => {
    const v = !sound;
    setSound(v);
    document.body.dataset.sound = v ? "on" : "off";
    if (v) plate(420);
  };
  return (
    <aside className={"k3-docket" + (show ? " show" : "")} aria-label="Your order" aria-hidden={!show}>
      <div className="k3-docket__top">
        <span className="k3-docket__t">Order · Table 01</span>
        <button className="k3-docket__mute" onClick={toggleSound} aria-pressed={sound}>{sound ? "♪ on" : "♪ off"}</button>
      </div>
      {rows.map(([id, label]) => (
        <div key={id} className={"k3-docket__row" + (done[id] ? " done" : "")}>
          <span className="bx" aria-hidden="true">✓</span>{label}
        </div>
      ))}
    </aside>
  );
}

export function Home() {
  return (
    <>
      <Nav /><Hero /><Trust /><Why /><Work /><Chef /><Process /><Menu /><Pantry /><Guestbook /><Cta /><Footer />
      <Docket /><OrderModal />
    </>
  );
}
