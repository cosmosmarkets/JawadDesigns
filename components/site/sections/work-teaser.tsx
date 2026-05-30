import Link from "next/link";

/* Home work teaser — a compact look at the flagship, then straight to /work.
   The full story, stack, and metrics live on the dedicated page. */
export function WorkTeaser() {
  return (
    <section id="work" className="sec ink k2-work" data-screen-label="work">
      <div className="k2-work__dots" aria-hidden="true" />
      <div className="k3-steam" aria-hidden="true"><span /><span /><span /></div>
      <header className="wrap k2-work__head reveal">
        <h2 className="headline k2-work__title reveal-lines">From the pass.</h2>
      </header>
      <div className="wrap k2-flag reveal">
        <div className="k2-flag__shot parallax" data-depth="fg">
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
            <p className="k2-flag__tag">A two-sided marketplace connecting game studios with vetted developers — brand, product design, and a production Next.js build, cooked solo.</p>
          </div>
          <p>200 organic signups, $0 on paid marketing, one chef start to ship. The full story&apos;s on the pass.</p>
          <div className="k2-flag__ctas">
            <Link href="/work" className="btn red">See the work <span className="arrow">→</span></Link>
            <a href="https://weldapp.vercel.app" target="_blank" rel="noopener noreferrer" className="btn ghost">Visit weld <span className="arrow">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
