"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Mark } from "./mark";

/* Maître-d' nav, shared across every route. Page links (/work, /about, /menu)
   light up via usePathname; the two hash links are on-page anchors, never
   "active". CTA points at the real /contact page (the old modal is gone). */
const NAV_LINKS: [label: string, href: string][] = [
  ["Work", "/work"],
  ["Chef", "/about"],
  ["Menu", "/menu"],
  ["Process", "/#process"],
  ["Details", "/menu#details"],
];

export function Nav() {
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.includes("#")) return false; // anchors aren't "current page"
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    const nav = document.querySelector(".k2-nav");
    const onScroll = () => {
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  return (
    <header className="k2-nav" id="top" data-screen-label="nav">
      <Mark />
      <nav className="k2-nav__links" aria-label="Primary">
        {NAV_LINKS.map(([l, h]) => (
          <Link
            key={l}
            href={h}
            className={cn(isActive(h) && "is-active")}
            aria-current={isActive(h) ? "page" : undefined}
          >
            {l}
          </Link>
        ))}
      </nav>
      <Link href="/contact" className="btn red sm k2-nav__cta">
        Place your order <span className="arrow">→</span>
      </Link>
      <button
        className="k3-burger"
        aria-label="Open menu"
        aria-expanded={menu}
        onClick={() => setMenu(true)}
      >
        <span /><span /><span />
      </button>

      <div
        className={"k3-drawer" + (menu ? " open" : "")}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menu}
      >
        <div className="k3-drawer__top">
          <span className="k3-mark__name headline">Jawad Design</span>
          <button className="k3-drawer__x" aria-label="Close menu" onClick={() => setMenu(false)}>✕</button>
        </div>
        <nav className="k3-drawer__links" aria-label="Mobile">
          {NAV_LINKS.map(([l, h]) => (
            <Link
              key={l}
              href={h}
              onClick={() => setMenu(false)}
              className={cn(isActive(h) && "is-active")}
              aria-current={isActive(h) ? "page" : undefined}
            >
              {l}
            </Link>
          ))}
        </nav>
        <Link href="/contact" className="btn red lg k3-drawer__cta" onClick={() => setMenu(false)}>
          Place your order <span className="arrow">→</span>
        </Link>
        <span className="eyebrow-mono k3-drawer__note">One seat open this month</span>
      </div>
    </header>
  );
}
