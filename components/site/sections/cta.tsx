import Link from "next/link";

/* Closing reservation card. The order CTA now routes to /contact; the inline
   "See the menu" link points at the full /menu page. */
export function Cta() {
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
          <Link href="/contact" className="btn red lg k3-reserve__cta">Place your order <span className="arrow">→</span></Link>
          <div className="k3-reserve__links">
            <Link href="/menu">See the menu</Link><span aria-hidden="true">·</span>
            <a href="https://weldapp.vercel.app" target="_blank" rel="noopener noreferrer">weld</a><span aria-hidden="true">·</span>
            <a href="mailto:hi@jawad.design">hi@jawad.design</a>
          </div>
        </div>
      </div>
    </section>
  );
}
