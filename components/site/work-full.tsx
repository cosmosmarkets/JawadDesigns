import Link from "next/link";

/* Full /work body — the complete weld case study (the home only teases it).
   "Reserve the seat" routes to /contact now that the order modal is gone. */
export function WorkFull() {
  return (
    <main>
      <section id="work" className="sec ink k2-work" data-screen-label="work">
        <div className="k2-work__dots" aria-hidden="true" />
        <div className="k3-steam" aria-hidden="true"><span /><span /><span /></div>
        <header className="wrap k2-work__head reveal">
          <span className="kicker">Work</span>
          <h2 className="headline k2-work__title">From the pass.</h2>
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
              <h3 className="headline k2-flag__name">weld.</h3>
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
        <div className="wrap k2-resv reveal" aria-label="One seat open this month">
          <div className="k2-resv__l">
            <span className="eyebrow-mono">The next plate</span>
            <h3 className="headline k2-resv__h">One seat is open<br />at the counter this month.</h3>
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
