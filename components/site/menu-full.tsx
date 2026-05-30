import Link from "next/link";

/* Canonical services + pricing content. Lives at /menu and is the single
   source of TIERS — the home menu preview imports TierGrid from here so the
   cards never drift out of sync. */

export type Tier = {
  name: string;
  price: string;
  tag: string;
  rank: number;
  feat: string[];
  why?: string;
  cta: string;
};

export const TIERS: Tier[] = [
  { name: "À la carte", price: "500", tag: "Single course", rank: 0,
    feat: ["Up to 3 pages, designed + built", "Copy direction included", "1 revision round", "Live in five days", "30 days post-launch care"], cta: "Order à la carte" },
  { name: "The Tasting Menu", price: "1,200", tag: "Most ordered", rank: 1,
    feat: ["Up to 5 pages, designed + built", "Copy direction + light brand polish", "2 revision rounds", "CMS so you can edit it yourself", "Source files + clean handoff"], cta: "Order the tasting menu" },
  { name: "The Chef's Table", price: "3,000", tag: "The flagship", rank: 2,
    feat: ["Full multi-page site", "A signature, bespoke interaction", "Brand system — type, colour, voice", "3 revision rounds", "Priority scheduling + 60 days care"],
    why: "The full experience — strategy, brand, and a bespoke build with the kind of polish that gets your site screenshotted and shared.", cta: "Book the Chef's Table" },
];

/* Shared pricing grid. Tier CTAs preselect the dish on /contact. */
export function TierGrid() {
  return (
    <div className="wrap k2-menu__grid">
      {TIERS.map((t) => (
        <article key={t.name} className={"k2-tier reveal d" + t.rank + (t.rank === 2 ? " is-flag" : "") + (t.rank === 1 ? " is-feat" : "")}>
          {t.rank === 2 && <span className="k2-tier__ribbon flag">Chef&apos;s table</span>}
          {t.rank === 1 && <span className="k2-tier__ribbon">Most ordered</span>}
          <span className="eyebrow-mono k2-tier__tag">{t.tag}</span>
          <h3 className="headline k2-tier__name">{t.name}</h3>
          <div className="k2-tier__price"><span className="k2-tier__from">from</span><span className="display k2-tier__num">${t.price}</span></div>
          {t.why && <p className="k2-tier__why">{t.why}</p>}
          <ul className="k2-tier__feat">{t.feat.map((f) => <li key={f}><span aria-hidden="true">✦</span>{f}</li>)}</ul>
          <Link
            href={"/contact?dish=" + encodeURIComponent(t.name)}
            className={"btn " + (t.rank === 2 ? "red" : "ghost") + " k2-tier__cta"}
          >
            {t.cta} <span className="arrow">→</span>
          </Link>
        </article>
      ))}
    </div>
  );
}

const WHY = [
  { n: "01", name: "Portfolio sites", price: "for creatives", body: "Built so the next commission comes from the last visitor — clear projects, real outcomes, and a first impression that does the qualifying for you." },
  { n: "02", name: "Landing pages", price: "for founders", body: "Built around your offer, not a template's idea of one. A hero that earns the scroll, structure that matches how people decide, copy you can defend to a CFO." },
  { n: "03", name: "A light brand system", price: "with every plate", body: "Just enough — type, colour, voice — to keep the site, the deck, and the next launch feeling like one studio made them. Yours, not stock." },
];

const PANTRY = [
  { h: "Loads in under a second", p: "Hand-tuned performance. Fast sites rank higher and lose fewer visitors." },
  { h: "Found on Google", p: "SEO considered from the first line — clean markup, real metadata, proper structure." },
  { h: "Yours to keep", p: "You own the code, the domain, and the content. Never held hostage by a platform." },
  { h: "No lock-in", p: "Built on Next.js — any developer can pick it up. Not a closed website builder." },
  { h: "Sharp on every screen", p: "Phone, tablet, desktop — composed to look right at every table." },
  { h: "Measured", p: "Analytics wired in from day one, so you can see exactly what the site is doing." },
];

export function MenuFull() {
  return (
    <main>
      {/* Services intro */}
      <section id="why" className="sec ink k2-why" data-screen-label="why-order">
        <header className="wrap k2-why__head reveal">
          <span className="kicker">The menu</span>
          <h2 className="headline k2-why__title">A short menu, <span>cooked properly.</span></h2>
          <p className="k2-why__lede">Two main courses and the seasoning that ties them together. Here, plainly, is what I make.</p>
        </header>
        <ol className="wrap k2-why__menu">
          {WHY.map((it, i) => (
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

      {/* Pricing tiers */}
      <section id="menu" className="k3-light k2-menu" data-screen-label="menu">
        <header className="wrap k2-menu__head reveal">
          <h2 className="headline k2-menu__title">Three ways <span>to dine.</span></h2>
          <p className="k2-menu__sub">Every option is designed and built by one chef, start to ship. Prices are where the conversation starts.</p>
        </header>
        <div className="wrap k3-paper k3-paper--menu reveal">
          <TierGrid />
        </div>
      </section>

      {/* Always included */}
      <section id="details" className="k3-light k2-pan2" data-screen-label="pantry">
        <header className="wrap k2-pan2__head reveal">
          <h2 className="headline k2-pan2__title">What every plate <span>comes with.</span></h2>
          <p className="k2-pan2__sub">No upsells, no surprises. These aren&apos;t add-ons — they&apos;re the standard.</p>
        </header>
        <div className="wrap k3-paper k2-pan2__list">
          {PANTRY.map((it, i) => (
            <div key={it.h} className={"k2-pan2__row reveal d" + (i % 3)}>
              <span className="display k2-pan2__no">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="headline k2-pan2__h">{it.h}</h3>
              <p className="k2-pan2__p">{it.p}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
