import Link from "next/link";
import { TierGrid } from "../menu-full";

/* Home centerpiece — the full pricing cards up front (shared TierGrid), then a
   strong push to the complete /menu page for services + what's always included. */
export function MenuPreview() {
  return (
    <section id="menu" className="k3-light k2-menu" data-screen-label="menu">
      <header className="wrap k2-menu__head reveal">
        <span className="kicker">The menu</span>
        <h2 className="headline k2-menu__title">Three ways <span>to dine.</span></h2>
        <p className="k2-menu__sub">Every option is designed and built by one chef, start to ship. Prices are where the conversation starts.</p>
      </header>
      <TierGrid />
      <div className="wrap k2-menu__more reveal">
        <Link href="/menu" className="btn red lg">See the full menu <span className="arrow">→</span></Link>
        <span className="eyebrow-mono k2-menu__morenote">Services, courses &amp; what every plate includes</span>
      </div>
    </section>
  );
}
