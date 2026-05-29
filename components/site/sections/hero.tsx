import Link from "next/link";

/* Home hero — "I serve websites." The per-letter spans drive the staggered
   load reveal defined in the k3-* CSS. Primary CTA -> /contact, secondary
   scrolls to the menu preview below. */
export function Hero() {
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
          <Link href="/contact" className="btn red lg">Place your order <span className="arrow">→</span></Link>
          <a href="#menu" className="btn ghost lg">See the menu</a>
        </div>
      </div>
      <a href="#trust" className="k3-hero__cue eyebrow-mono" aria-label="Scroll to see the menu">
        Scroll to see the menu <span className="ar" aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
