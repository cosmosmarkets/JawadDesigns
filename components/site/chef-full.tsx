import Link from "next/link";

/* Full /about body — the fuller "meet the chef" story the home only teases. */
export function ChefFull() {
  return (
    <main>
      <section id="chef" className="sec ink k3-chef" data-screen-label="chef">
        <div className="wrap k3-chef__grid reveal">
          <div className="k3-chef__portrait k3-chef__crest" aria-hidden="true">
            <span className="k3-crest">
              <svg className="k3-crest__svg" viewBox="0 0 120 120" focusable="false" aria-hidden="true">
                <circle className="k3-crest__ring" cx="60" cy="60" r="56" />
                <circle className="k3-crest__ring k3-crest__ring--inner" cx="60" cy="60" r="48" />
              </svg>
              <span className="k3-crest__j headline">J</span>
              <span className="eyebrow-mono k3-crest__cap">One chef, one ticket</span>
            </span>
          </div>
          <div className="k3-chef__body">
            <span className="kicker">About</span>
            <h1 className="headline k3-chef__h">One chef.<br /><span>One ticket at a time.</span></h1>
            <p>I&apos;m Jawad — a designer <em>and</em> developer. Every site that leaves this kitchen is cooked by one pair of hands, brief to launch. No account managers, no offshore handoffs, nothing lost between the idea and the build.</p>
            <p>Taking one project at a time isn&apos;t a limitation — it&apos;s the feature. Your launch gets the whole kitchen, undivided, and ships in days because there&apos;s no one to wait on but me.</p>
            <p>I cook two things and cook them properly: portfolio sites for creatives and landing pages for founders, each with a light brand system to tie it together. Strategy, design, and a production Next.js build — start to ship, same hands.</p>
            <Link href="/contact" className="btn red">Work with me <span className="arrow">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
