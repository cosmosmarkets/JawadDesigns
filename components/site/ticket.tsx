"use client";

/* ============================================================================
   Stage 5 — the cross-route printing ticket (signature moment #3)
   ----------------------------------------------------------------------------
   A thermal kitchen ticket that hangs from a right-edge rail just below the nav
   and inks one line per funnel touchpoint as the visitor moves through the
   site. State lives in sessionStorage (lib/ticket-state) and restores INSTANTLY
   — already-inked lines render at rest with no replay.

   Architecture (decoupled, no page reaches into another page's markup):
     • <TicketProvider> mounts ONCE in app/layout.tsx alongside the existing
       providers, stays mounted across nav, owns inked-slot state + storage, and
       renders the rail (desktop) / progress pill (compact). It wraps {children}
       only so the beacons below can read inkSlot() via context — {children} is a
       stable element ref, so ticket state changes never re-render the route.
     • <TicketBeacon slot="…" /> is dropped at each page's key section. It is a
       one-shot IntersectionObserver: when scrolled into view it inks its slot.
       (IO, not ScrollTrigger — cheaper, fires zero work until a threshold is
       crossed, works under reduced motion without Lenis/ticker, and leaves the
       global ScrollTrigger count untouched. GSAP owns only the ink animations.)
     • THE MENU inks on ARRIVAL at /menu (pricing renders fully open on arrival,
       so reaching the route IS reading it) — fired from the provider.
     • CONFIRMED inks ONLY from the contact form's resolved backend-success
       window event (Stage 4.8) — never the raw click; a failed submit inks
       nothing.

   Decorative + aria-hidden + pointer-events:none → never blocks or traps the
   real content/CTA on any route, fully ignorable by screen readers. transform/
   opacity only; reduced motion shows lines/stamp at rest with no feed/press.
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, withMotion, prefersReducedMotion } from "@/lib/motion";
import {
  SLOTS,
  BROWSE_SLOTS,
  readInked,
  writeInked,
  ORDER_CONFIRMED_EVENT,
  type SlotId,
} from "@/lib/ticket-state";

interface TicketAPI {
  /** Ink a slot. Idempotent — inking an already-inked slot is a no-op, so a
      re-reached beacon or a refresh never replays an animation. */
  inkSlot: (slot: SlotId) => void;
}

const TicketContext = createContext<TicketAPI | null>(null);

export function useTicket(): TicketAPI {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTicket must be used within TicketProvider");
  return ctx;
}

/* ── beacon: a one-shot IntersectionObserver dropped at a page's key section ── */
export function TicketBeacon({ slot }: { slot: SlotId }) {
  const { inkSlot } = useTicket();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Already inked this session → never observe (no replay, no churn).
    if (readInked().has(slot)) return;
    // No IO (old browser / SSR edge) → ink immediately so the slot still earns.
    if (typeof IntersectionObserver === "undefined") {
      inkSlot(slot);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            inkSlot(slot);
            io.disconnect();
            break;
          }
        }
      },
      // fire a touch after the section's tail clears the fold = "scrolled past it"
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slot, inkSlot]);

  return <div ref={ref} className="jd-ticket-beacon" aria-hidden="true" />;
}

/* ── provider: owns state + storage + the /menu-arrival and CONFIRMED seams ── */
export function TicketProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // inkedRef mirrors state so idempotency is synchronous (two rapid inks of the
  // same slot can't both pass the guard before a setState lands).
  const inkedRef = useRef<Set<SlotId>>(readInked());
  const [inked, setInked] = useState<Set<SlotId>>(() => new Set(Array.from(inkedRef.current)));
  // bumps on a FRESH ink only (slot + monotonic n) → drives the feed animation.
  // null at mount/restore so restored lines never animate.
  const [flash, setFlash] = useState<{ slot: SlotId; n: number } | null>(null);
  const [retracted, setRetracted] = useState(false);
  const [expanded, setExpanded] = useState(false); // compact pill open/closed
  const [mounted, setMounted] = useState(false);
  // CONFIRMED last session → the ticket already tore off; stay retired (no rail).
  const [retired, setRetired] = useState(false);

  const inkSlot = useCallback((slot: SlotId) => {
    if (inkedRef.current.has(slot)) return; // idempotent: no replay
    const next = new Set(Array.from(inkedRef.current));
    next.add(slot);
    inkedRef.current = next;
    writeInked(next);
    setInked(new Set(Array.from(next)));
    setFlash((p) => ({ slot, n: (p?.n ?? 0) + 1 }));
  }, []);

  // Client-only mount gate — sessionStorage-derived state never SSRs (the device
  // is decorative, so deferring its first paint avoids any hydration mismatch).
  useEffect(() => {
    setMounted(true);
    if (readInked().has("CONFIRMED")) setRetired(true);
  }, []);

  // THE MENU — the one arrival-inked slot (pricing is open on arrival).
  useEffect(() => {
    if (pathname === "/menu") inkSlot("MENU");
  }, [pathname, inkSlot]);

  // CONFIRMED — fired ONLY from the contact form's resolved backend success.
  useEffect(() => {
    const onConfirmed = () => inkSlot("CONFIRMED");
    window.addEventListener(ORDER_CONFIRMED_EVENT, onConfirmed);
    return () => window.removeEventListener(ORDER_CONFIRMED_EVENT, onConfirmed);
  }, [inkSlot]);

  // Footer retract via IntersectionObserver — the ticket must never fight the
  // footer or its CTA. IO fires only on a cross (no rAF, no scroll handler), and
  // works under reduced motion (no Lenis/ticker dependency). The footer node is
  // persistent (layout-owned), so one observer covers every route.
  useEffect(() => {
    if (!mounted || retired) return;
    const footer = document.querySelector(".k2-foot");
    if (!footer || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setRetracted(entries[0]?.isIntersecting ?? false),
      { threshold: 0 },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, [mounted, retired]);

  const api = useMemo<TicketAPI>(() => ({ inkSlot }), [inkSlot]);

  return (
    <TicketContext.Provider value={api}>
      {children}
      {mounted && !retired && (
        <TicketSurface
          inked={inked}
          flash={flash}
          retracted={retracted}
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
          onRetire={() => setRetired(true)}
        />
      )}
    </TicketContext.Provider>
  );
}

/* ── the rendered device: right-edge rail + compact pill ─────────────────── */
function TicketSurface({
  inked,
  flash,
  retracted,
  expanded,
  onToggleExpand,
  onRetire,
}: {
  inked: Set<SlotId>;
  flash: { slot: SlotId; n: number } | null;
  retracted: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onRetire: () => void;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  // CONFIRMED forces the device visible regardless of the footer for the climax.
  const [confirming, setConfirming] = useState(false);

  const inkedBrowse = BROWSE_SLOTS.filter((s) => inked.has(s)).length;
  const confirmed = inked.has("CONFIRMED");

  // FEED + line-ink on a fresh ink (non-CONFIRMED — the climax owns CONFIRMED).
  // From-states are set inside withMotion only, so reduced motion leaves the
  // line at its CSS is-inked rest (visible, no animation). useGSAP runs in a
  // layout effect → the opacity:0 from-state lands before paint (no flash).
  useGSAP(
    () => {
      if (!flash || flash.slot === "CONFIRMED") return;
      const root = scope.current;
      if (!root) return;
      return withMotion(() => {
        const compact = window.matchMedia("(max-width: 1599.98px)").matches;
        const tl = gsap.timeline();
        if (compact) {
          // pill mode: a small confirm-of-progress pop on the pill
          const pill = root.querySelector<HTMLElement>(".jd-ticket__pill");
          if (pill) tl.fromTo(pill, { scale: 0.9 }, { scale: 1, duration: 0.42, ease: "back.out(2)" }, 0);
        } else {
          const line = root.querySelector<HTMLElement>(`[data-slot="${flash.slot}"]`);
          const paper = paperRef.current;
          // the paper feeds down a few mm and settles, as if a line just printed
          if (paper) tl.fromTo(paper, { y: -7 }, { y: 0, duration: 0.36, ease: "power2.out" }, 0);
          if (line)
            tl.fromTo(
              line,
              { opacity: 0, yPercent: -45 },
              { opacity: 1, yPercent: 0, duration: 0.42, ease: "back.out(1.6)" },
              0.05,
            );
        }
        return () => tl.kill();
      });
    },
    { dependencies: [flash?.n], scope },
  );

  // CONFIRMED climax — un-retract, ink the line, press the TABLE 01 stamp at an
  // angle, then tear the ticket off and retire it. Runs in any motion mode
  // (reduced motion = final state set instantly, no press, then retire). Not
  // wrapped in withMotion: the funnel must always complete on a real order.
  useGSAP(
    () => {
      if (!confirmed) return;
      setConfirming(true); // CSS slides the rail/pill back in over the retract
      const root = scope.current;
      const line = root?.querySelector<HTMLElement>(`[data-slot="CONFIRMED"]`);
      const paper = paperRef.current;
      const stamp = stampRef.current;
      const compact = window.matchMedia("(max-width: 1599.98px)").matches;

      if (prefersReducedMotion()) {
        if (line) gsap.set(line, { clearProps: "opacity,transform" });
        if (stamp) gsap.set(stamp, { autoAlpha: 1, scale: 1, rotate: -8 });
        const t = window.setTimeout(onRetire, 1200); // let the ack read, then retire
        return () => window.clearTimeout(t);
      }

      // pre-set from-states synchronously (layout effect) → no flash
      if (line) gsap.set(line, { opacity: 0, yPercent: -45 });
      if (stamp) gsap.set(stamp, { autoAlpha: 0, scale: 1.5, rotate: -14, transformOrigin: "50% 50%" });

      if (compact) {
        const pill = root?.querySelector<HTMLElement>(".jd-ticket__pill");
        const tl = gsap.timeline({ delay: 0.32, onComplete: onRetire });
        if (pill)
          tl
            .to(pill, { scale: 1.14, duration: 0.18, ease: "back.out(2.4)" })
            .to(pill, { scale: 1, duration: 0.16 })
            .to(pill, { autoAlpha: 0, y: 26, duration: 0.5, ease: "power2.in" }, ">+0.7");
        return () => tl.kill();
      }

      // desktop rail: feed → ink CONFIRMED → press the stamp → tear off
      const tl = gsap.timeline({ delay: 0.34, onComplete: onRetire }); // delay = rail slide-in
      if (paper) tl.fromTo(paper, { y: -6 }, { y: 0, duration: 0.3, ease: "power2.out" }, 0);
      if (line) tl.to(line, { opacity: 1, yPercent: 0, duration: 0.42, ease: "back.out(1.7)" }, 0.06);
      if (stamp)
        tl
          .to(stamp, { autoAlpha: 1, scale: 1, rotate: -8, duration: 0.36, ease: "back.out(2.2)" }, 0.34) // ink-press
          .to(stamp, { scale: 0.985, duration: 0.12 }, ">")
          .to(stamp, { scale: 1, duration: 0.1 }, ">");
      if (paper)
        tl
          .to(paper, { y: -6, rotate: 0.6, duration: 0.14, ease: "power2.out" }, ">+0.5") // recoil
          .to(paper, { yPercent: 130, rotate: -5, autoAlpha: 0, duration: 0.68, ease: "power2.in" }); // pulled away
      return () => tl.kill();
    },
    { dependencies: [confirmed], scope },
  );

  return (
    <div
      ref={scope}
      className="jd-ticket"
      data-retracted={retracted && !confirming ? "true" : "false"}
      data-confirming={confirming ? "true" : "false"}
      aria-hidden="true"
    >
      {/* DESKTOP RAIL (≥1600px — sits in the gutter beside the 1200px wrap) */}
      <div className="jd-ticket__rail">
        <div className="jd-ticket__perf" aria-hidden="true" />
        <div ref={paperRef} className="jd-ticket__paper">
          <div className="jd-ticket__head">
            <span className="jd-ticket__brand">Jawad Design</span>
            <span className="jd-ticket__meta">Order ticket — Table 01</span>
          </div>
          <div className="jd-ticket__rule" aria-hidden="true" />
          <ol className="jd-ticket__lines">
            {SLOTS.map((s) => {
              const on = inked.has(s.id);
              return (
                <li
                  key={s.id}
                  data-slot={s.id}
                  className={"jd-ticket__line" + (on ? " is-inked" : "")}
                >
                  <span className="jd-ticket__box" aria-hidden="true">
                    {on ? "✓" : ""}
                  </span>
                  <span className="jd-ticket__line-main">
                    <span className="jd-ticket__label">{s.label}</span>
                    <span className="jd-ticket__sub">{s.sub}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="jd-ticket__rule jd-ticket__rule--dashed" aria-hidden="true" />
          <div className="jd-ticket__foot">
            <span>{confirmed ? "Order in" : inkedBrowse + "/4 courses"}</span>
            <span aria-hidden="true">★★★</span>
          </div>
          <div ref={stampRef} className="jd-ticket__stamp" aria-hidden="true">
            <span className="jd-ticket__stamp-top">Table 01</span>
            <span className="jd-ticket__stamp-big">Confirmed</span>
            <span className="jd-ticket__stamp-date">Order placed</span>
          </div>
          <div className="jd-ticket__curl" aria-hidden="true" />
        </div>
      </div>

      {/* COMPACT PROGRESS PILL (<1600px). Decorative + aria-hidden + a plain div
          (not a focusable button) so it can't be tabbed to or trap focus; the
          pointer tap-to-expand is a sighted-user nicety atop the real content. */}
      <div
        className={"jd-ticket__pill" + (expanded ? " is-expanded" : "")}
        aria-hidden="true"
        onClick={onToggleExpand}
      >
        <span className="jd-ticket__pill-prog">{confirmed ? "✓" : inkedBrowse + "/4"}</span>
        <span className="jd-ticket__pill-label">{confirmed ? "Confirmed" : "Order"}</span>
        {expanded && (
          <span className="jd-ticket__pill-list">
            {SLOTS.map((s) => (
              <span
                key={s.id}
                className={"jd-ticket__pill-row" + (inked.has(s.id) ? " is-inked" : "")}
              >
                {inked.has(s.id) ? "✓ " : "· "}
                {s.label}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
