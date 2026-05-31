// Jawad Design home — a lean multipage funnel. The long single-scroll page was
// split into dedicated routes (/work, /menu, /about, /contact); the home now
// teases each and emphasizes the menu + a short meet-the-chef moment. Nav and
// Footer live in app/layout.tsx; the order modal was replaced by /contact.

import { Hero } from "./sections/hero";
import { TicketBeacon } from "./ticket";
import { Trust } from "./sections/trust";
import { WorkTeaser } from "./sections/work-teaser";
import { ChefTeaser } from "./sections/chef-teaser";
import { MenuPreview } from "./sections/menu-preview";
import { Process } from "./sections/process";
import { Guestbook } from "./sections/guestbook";
import { Cta } from "./sections/cta";

export function Home() {
  return (
    <main>
      <Hero />
      <Trust />
      {/* SEATED inks once you've scrolled past the trust band (home key section) */}
      <TicketBeacon slot="SEATED" />
      <WorkTeaser />
      <div className="k3-hairline" aria-hidden />
      <ChefTeaser />
      <MenuPreview />
      <div className="k3-hairline" aria-hidden />
      <Process />
      <Guestbook />
      <Cta />
    </main>
  );
}
