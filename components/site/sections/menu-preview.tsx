import { ClosedMenu } from "../menu-unfold";

/* Home centerpiece — a CLOSED folded printed menu under the spotlight (winning
   gatefold, variant B). Anchor prices are letterpressed on the cover (read live
   from TIERS); the full comparison grid stays on /menu. Click/Enter plays the
   full-bleed gatefold unfold-as-page-transition via the shared overlay. No more
   inline TierGrid here — so there is no .k2-tier on the home after Stage 4. */
export function MenuPreview() {
  return (
    <section id="menu" className="k3-light k2-menu" data-screen-label="menu">
      <header className="wrap k2-menu__head reveal">
        <span className="kicker">The menu</span>
        <h2 className="headline k2-menu__title reveal-lines">Three ways <span>to dine.</span></h2>
        <p className="k2-menu__sub">Every option is designed and built by one chef, start to ship. Prices are where the conversation starts.</p>
      </header>
      <div className="wrap ub-stage reveal">
        <ClosedMenu />
      </div>
      <div className="wrap k2-menu__more reveal">
        <span className="eyebrow-mono k2-menu__morenote">Open the menu for services, courses &amp; what every plate includes</span>
      </div>
    </section>
  );
}
