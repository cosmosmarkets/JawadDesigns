import Link from "next/link";
import { Mark } from "./mark";

/* Shared footer. `ext` columns open in a new tab; everything else is an
   in-app route now that the order modal is gone (CTA -> /contact). */
type FooterItem = { label: string; href: string; ext?: boolean };

const COLS: { h: string; items: FooterItem[] }[] = [
  { h: "Menu", items: [
    { label: "Work", href: "/work" },
    { label: "Pricing", href: "/menu" },
  ] },
  { h: "Kitchen", items: [
    { label: "Meet the chef", href: "/about" },
    { label: "Process", href: "/#process" },
    { label: "Always included", href: "/menu#details" },
  ] },
  { h: "Order", items: [
    { label: "Place an order", href: "/contact" },
    { label: "Email", href: "mailto:hi@jawad.design", ext: true },
  ] },
  { h: "Elsewhere", items: [
    { label: "weld", href: "https://weldapp.vercel.app", ext: true },
    { label: "Read.cv", href: "https://read.cv", ext: true },
  ] },
];

const MQ = ["JAWAD DESIGN", "✦", "MADE TO ORDER", "✦", "ONE CHEF · ONE TICKET", "✦", "FIVE DAYS TO LIVE", "✦"];

export function Footer() {
  const track = [...MQ, ...MQ];
  return (
    <footer className="k2-foot" data-screen-label="footer">
      <div className="k2-foot__mq mq rev" aria-hidden="true">
        <div className="mq__t">{track.map((t, i) => <span key={i} className="display k2-foot__mqitem">{t}</span>)}</div>
      </div>
      <div className="wrap k2-foot__top">
        <div className="k2-foot__brand">
          <Mark />
          <p className="k2-foot__tag">A one-chef kitchen for portfolio sites &amp; landing pages. Made to order, plated in five days.</p>
          <Link href="/contact" className="btn red">Place your order <span className="arrow">→</span></Link>
        </div>
        <div className="k2-foot__cols">
          {COLS.map((c) => (
            <div key={c.h}>
              <h4 className="eyebrow-mono">{c.h}</h4>
              <ul>
                {c.items.map((it) =>
                  it.ext ? (
                    <li key={it.label}>
                      <a href={it.href} target="_blank" rel="noopener noreferrer">{it.label}</a>
                    </li>
                  ) : (
                    <li key={it.label}>
                      <Link href={it.href}>{it.label}</Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="wrap k2-foot__fine">
        <span className="eyebrow-mono">© {new Date().getFullYear()} Jawad Design · A one-person studio</span>
        <span className="eyebrow-mono">Made to order · plated in five days</span>
      </div>
    </footer>
  );
}
