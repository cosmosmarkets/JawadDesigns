import Link from "next/link";

/* Short "meet the chef" moment on the home. Clicking through opens the full
   story at /about (the chef portrait + button both route there). */
export function ChefTeaser() {
  return (
    <section id="chef" className="sec ink k3-chef" data-screen-label="chef">
      <div className="wrap k3-chef__grid reveal">
        <Link href="/about" className="k3-chef__portrait k3-chef__crest" aria-label="Meet the chef">
          <span className="k3-crest" aria-hidden="true">
            <svg className="k3-crest__svg" viewBox="0 0 120 120" focusable="false" aria-hidden="true">
              <circle className="k3-crest__ring" cx="60" cy="60" r="56" />
              <circle className="k3-crest__ring k3-crest__ring--inner" cx="60" cy="60" r="48" />
            </svg>
            <span className="k3-crest__j headline">J</span>
            <span className="eyebrow-mono k3-crest__cap">One chef, one ticket</span>
          </span>
        </Link>
        <div className="k3-chef__body">
          <span className="eyebrow-mono" style={{ color: "var(--brass)" }}>Meet the chef</span>
          <h2 className="headline k3-chef__h reveal-lines">One chef.<br /><span>One ticket at a time.</span></h2>
          <p>I&apos;m Jawad — a designer <em>and</em> developer. Every site that leaves this kitchen is cooked by one pair of hands, brief to launch. Taking one project at a time isn&apos;t a limitation — it&apos;s the feature.</p>
          <Link href="/about" className="btn ghost">Meet the chef <span className="arrow">→</span></Link>
        </div>
      </div>
    </section>
  );
}
