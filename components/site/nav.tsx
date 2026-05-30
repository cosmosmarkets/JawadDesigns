"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { setScrollLocked } from "@/lib/scroll-lock";
import { Mark } from "./mark";

/* Maître-d' nav, shared across every route. Page links (/work, /about, /menu)
   light up via usePathname; the two hash links are on-page anchors, never
   "active". CTA points at the real /contact page (the old modal is gone).
   Mobile drawer is portaled to body so sticky nav + backdrop-filter don't clip it. */
const NAV_LINKS: [label: string, href: string, sub: string][] = [
  ["Dishes", "/work", "Portfolio"],
  ["Chef", "/about", "About"],
  ["Menu", "/menu", "Services"],
  ["Kitchen", "/#process", "Process"],
  ["Services", "/menu#details", "Details"],
];

export function Nav() {
  const [menu, setMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.includes("#")) return false; // anchors aren't "current page"
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    setScrollLocked(menu);
    return () => setScrollLocked(false);
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    if (menu) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [menu]);

  const drawer =
    mounted &&
    createPortal(
      <div
        ref={drawerRef}
        className={cn("k3-drawer", menu && "open")}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menu}
        aria-label="Site menu"
        data-lenis-prevent
      >
        <div className="k3-drawer__top">
          <span className="k3-mark__name headline">Jawad Design</span>
          <button
            type="button"
            className="k3-drawer__x"
            aria-label="Close menu"
            onClick={() => setMenu(false)}
          >
            ✕
          </button>
        </div>
        <nav className="k3-drawer__links" aria-label="Mobile">
          {NAV_LINKS.map(([l, h, sub]) => (
            <Link
              key={l}
              href={h}
              onClick={() => setMenu(false)}
              className={cn(isActive(h) && "is-active")}
              aria-current={isActive(h) ? "page" : undefined}
            >
              {l}
              <span className="k3-drawer__sub">{sub}</span>
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="btn red lg k3-drawer__cta"
          onClick={() => setMenu(false)}
        >
          Chat to the chef <span className="arrow">→</span>
        </Link>
        <span className="eyebrow-mono k3-drawer__note">One seat open this month</span>
      </div>,
      document.body,
    );

  return (
    <>
      <header className="k2-nav" id="top" data-screen-label="nav">
        <Mark />
        <nav className="k2-nav__links" aria-label="Primary">
          {NAV_LINKS.map(([l, h, sub]) => (
            <Link
              key={l}
              href={h}
              className={cn(isActive(h) && "is-active")}
              aria-current={isActive(h) ? "page" : undefined}
            >
              <span className="k2-nav__sub" aria-hidden="true">
                {sub}
              </span>
              <span className="k2-nav__label">{l}</span>
            </Link>
          ))}
        </nav>
        <Link href="/contact" className="btn red sm k2-nav__cta">
          Chat to the chef <span className="arrow">→</span>
        </Link>
        <button
          type="button"
          className="k3-burger"
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          onClick={() => setMenu((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
      {drawer}
    </>
  );
}
