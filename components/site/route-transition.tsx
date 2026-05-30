"use client";

/* ============================================================================
   Stage 3.7 — RouteTransitionProvider (the one shared transition overlay)
   ----------------------------------------------------------------------------
   The multipage split left exactly ONE intentional navigation (the Stage 4 menu
   unfold) against a sea of default hard-cut route swaps. This provider builds
   ONE full-viewport overlay (rendered as a sibling of {children} in the layout,
   so it survives App Router client-side navigation — Stage 0 contract) and gives
   every route change a cheap baseline veil: a fast warm-candlelight dim that
   reads as "the room blinking dark", not a loading screen.

   Sequence for a click-driven nav (baseline veil):
     1. intercept the link click → play COVER (overlay dims to fully opaque)
     2. once the cover fully occludes, router.push() fires underneath it
     3. gate on the new route having painted (pathname change + a double rAF)
     4. play REVEAL (overlay lifts) — clears BEFORE the route's Stage 3
        lead-heading entrance, so there is never a double-cover.

   Stage 4's menu unfold reuses this SAME overlay as an upgraded variant — pass a
   `cover`/`reveal` override to transitionTo() (and render into `overlayRef`).
   Do NOT build a second overlay.

   Reduced motion (OS, body[data-motion="off"], and NOT ?motion=on): no veil at
   all — every nav is an instant client-side cut. Stage 4's unfold bypasses too.
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { gsap, prefersReducedMotion, EASE } from "@/lib/motion";

/** Timings — tuned for a ~400ms "blink", spring-style ease (snap dim, gentle
    lift). transform/opacity only, so the work stays on the compositor. */
const COVER = 0.16; // s — dim to full occlusion
const REVEAL = 0.26; // s — lift the veil
const DIP_IN = 0.12; // s — fallback dip (back/forward) cover
const DIP_OUT = 0.24; // s — fallback dip lift
/** Never let the veil stick if a slow route never signals paint. */
const DEFAULT_MAX_MS = 1400;

/** Shared veil tween shapes — the cover, the reveal, and the back/forward dip
    (which is just cover-then-reveal) all reuse these, so the look never drifts.
    Eases route through the shared EASE tokens like the rest of the motion system;
    transform/opacity only (autoAlpha + scale) to stay on the compositor. */
const COVER_FROM = { autoAlpha: 0, scale: 1.04 } as const;
const COVER_TO = { autoAlpha: 1, scale: 1, ease: "power2.in" } as const;
const REVEAL_TO = { autoAlpha: 0, scale: 1.06, ease: EASE.draw } as const;

type Phase = "idle" | "covering" | "covered" | "revealing";

/** A cover/reveal phase may return a GSAP animation, a promise, or nothing. */
type PhaseResult = gsap.core.Animation | Promise<unknown> | void;

export interface TransitionOptions {
  /** Marks the overlay (data-variant) for CSS hooks. Default "veil". */
  variant?: string;
  /** Upgraded cover phase (Stage 4 unfold). Receives the shared overlay node;
      when its animation/promise finishes, the route is pushed underneath. */
  cover?: (overlay: HTMLDivElement) => PhaseResult;
  /** Upgraded reveal phase (Stage 4 dissolve). Plays after the new route paints. */
  reveal?: (overlay: HTMLDivElement) => PhaseResult;
  /** Cap (ms) before the reveal is forced even if route-paint never signals. */
  maxDuration?: number;
}

export interface RouteTransitionAPI {
  /** Drive a navigation through the shared overlay. Default = baseline veil.
      Stage 4 gates its own reduced-motion bypass via prefersReducedMotion()
      from @/lib/motion (the canonical helper the whole motion system uses). */
  transitionTo: (href: string, opts?: TransitionOptions) => void;
  /** The shared overlay DOM node (for Stage 4 to render/animate into). */
  overlayRef: React.MutableRefObject<HTMLDivElement | null>;
}

const RouteTransitionContext = createContext<RouteTransitionAPI | null>(null);

/** Access the shared transition controller (e.g. Stage 4's menu unfold). */
export function useRouteTransition(): RouteTransitionAPI {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) {
    throw new Error("useRouteTransition must be used within RouteTransitionProvider");
  }
  return ctx;
}

/** Run `cb` when a phase animation/promise finishes; returns the animation (so
    it can be killed) or null. A missing phase resolves immediately. */
function whenDone(result: PhaseResult, cb: () => void): gsap.core.Animation | null {
  if (!result) {
    cb();
    return null;
  }
  if (typeof (result as gsap.core.Animation).eventCallback === "function") {
    const anim = result as gsap.core.Animation;
    anim.eventCallback("onComplete", cb);
    return anim;
  }
  if (typeof (result as Promise<unknown>).then === "function") {
    (result as Promise<unknown>).then(cb);
    return null;
  }
  cb();
  return null;
}

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const phaseRef = useRef<Phase>("idle");
  const pendingRef = useRef<string | null>(null);
  const optsRef = useRef<TransitionOptions>({});
  const animRef = useRef<gsap.core.Animation | null>(null);
  const watchdogRef = useRef<number | null>(null);
  const firstPathRef = useRef(true);
  // Set by a popstate listener so the pathname effect can tell a real browser
  // back/forward (→ dip) from any other untracked pathname change (→ nothing).
  const poppedRef = useRef(false);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current != null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  /** Park the overlay back to its inert, fully-hidden resting state. */
  const reset = useCallback(() => {
    phaseRef.current = "idle";
    pendingRef.current = null;
    optsRef.current = {};
    clearWatchdog();
    animRef.current?.kill();
    animRef.current = null;
    const el = overlayRef.current;
    if (el) {
      gsap.set(el, { autoAlpha: 0, scale: 1 });
      el.removeAttribute("data-variant");
    }
  }, [clearWatchdog]);

  const playReveal = useCallback(() => {
    const el = overlayRef.current;
    if (!el) {
      reset();
      return;
    }
    phaseRef.current = "revealing";
    clearWatchdog();
    animRef.current?.kill();
    const custom = optsRef.current.reveal?.(el);
    if (custom) {
      animRef.current = whenDone(custom, reset);
    } else {
      animRef.current = gsap.to(el, { ...REVEAL_TO, duration: REVEAL, onComplete: reset });
    }
  }, [clearWatchdog, reset]);

  /** Cover → push → arm the paint watchdog. The pathname effect plays reveal. */
  const startCover = useCallback(
    (href: string, opts: TransitionOptions) => {
      const el = overlayRef.current;
      optsRef.current = opts;
      pendingRef.current = href;
      if (!el) {
        router.push(href);
        return;
      }
      phaseRef.current = "covering";
      el.setAttribute("data-variant", opts.variant ?? "veil");
      animRef.current?.kill();

      const afterCover = () => {
        phaseRef.current = "covered";
        // The veil is now fully opaque — swap the route underneath it (no flash).
        router.push(pendingRef.current as string);
        clearWatchdog();
        watchdogRef.current = window.setTimeout(() => {
          if (phaseRef.current === "covered") playReveal();
        }, opts.maxDuration ?? DEFAULT_MAX_MS);
      };

      const custom = opts.cover?.(el);
      if (custom) {
        animRef.current = whenDone(custom, afterCover);
      } else {
        animRef.current = gsap.fromTo(el, COVER_FROM, {
          ...COVER_TO,
          duration: COVER,
          onComplete: afterCover,
        });
      }
    },
    [router, clearWatchdog, playReveal],
  );

  /** Fallback for a browser back/forward (popstate): the new page has already
      painted by the time we hear about it, so play a quick dim-and-lift dip
      (cover-then-reveal) so history navigation still feels intentional. Cheap,
      single timeline reusing the shared cover/reveal shapes. */
  const playDip = useCallback(() => {
    const el = overlayRef.current;
    if (!el) return;
    phaseRef.current = "revealing";
    animRef.current?.kill();
    el.setAttribute("data-variant", "veil");
    animRef.current = gsap
      .timeline({ onComplete: reset })
      .fromTo(el, COVER_FROM, { ...COVER_TO, duration: DIP_IN })
      .to(el, { ...REVEAL_TO, duration: DIP_OUT });
  }, [reset]);

  const transitionTo = useCallback(
    (href: string, opts: TransitionOptions = {}) => {
      let target: URL;
      try {
        target = new URL(href, window.location.origin);
      } catch {
        router.push(href);
        return;
      }
      // Same document (e.g. a #process anchor on the page we're on) — let the
      // browser/Lenis handle the scroll; no veil for a non-navigation.
      if (target.pathname === window.location.pathname) {
        router.push(href);
        return;
      }
      // Reduced motion → instant cut, no veil (Stage 4 unfold bypasses too).
      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }

      const phase = phaseRef.current;
      if (phase === "covering" || phase === "covered") {
        // Re-target an in-flight transition without restarting the cover.
        pendingRef.current = href;
        optsRef.current = opts;
        if (phase === "covered") router.push(href);
        return;
      }
      // From idle OR mid-reveal: startCover kills the current anim itself.
      startCover(href, opts);
    },
    [router, startCover],
  );

  // Lift the veil once the new route paints — or run the back/forward dip.
  useEffect(() => {
    if (firstPathRef.current) {
      firstPathRef.current = false;
      return;
    }
    if (phaseRef.current === "covered" || phaseRef.current === "covering") {
      // Double rAF: let the new route actually paint before lifting, so the
      // lead-heading entrance is never re-covered.
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => playReveal()),
      );
      return () => cancelAnimationFrame(id);
    }
    // Real browser back/forward only (flagged by the popstate listener). Other
    // untracked idle pathname changes — e.g. an imperative router.push or a
    // data-no-transition link — get no veil, which is what those opt-outs mean.
    if (poppedRef.current) {
      poppedRef.current = false;
      if (phaseRef.current === "idle" && !prefersReducedMotion()) playDip();
    }
  }, [pathname, playReveal, playDip]);

  // Flag browser history navigation so the pathname effect can dip on it.
  useEffect(() => {
    const onPop = () => {
      poppedRef.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Intercept internal left-clicks so every cross-route nav routes through the
  // veil. We listen in the CAPTURE phase and stopPropagation, so this is the
  // single owner of the click — next/link's delegated handler never competes for
  // the same event (it would otherwise race this listener and the navigation
  // could be dropped). next/link still PREFETCHES the target on hover/viewport;
  // we only take over the click. transitionTo() itself handles the reduced-motion
  // bypass (an instant router.push, no veil), so we own reduced-motion navs too.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor || !anchor.getAttribute("href")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.noTransition != null) return;
      if ((anchor.getAttribute("rel") || "").includes("external")) return;
      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // external / mailto / tel
      if (url.pathname === window.location.pathname) return; // same-page hash — let it scroll
      // We are taking this navigation: block the browser default AND next/link.
      e.preventDefault();
      e.stopPropagation();
      transitionTo(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true); // capture
    return () => document.removeEventListener("click", onClick, true);
  }, [transitionTo]);

  // Kill any in-flight tween + timer on unmount (the provider lives in the
  // layout, so this only runs on a full teardown).
  useEffect(() => () => {
    animRef.current?.kill();
    if (watchdogRef.current != null) window.clearTimeout(watchdogRef.current);
  }, []);

  const api = useMemo<RouteTransitionAPI>(
    () => ({ transitionTo, overlayRef }),
    [transitionTo],
  );

  return (
    <RouteTransitionContext.Provider value={api}>
      {children}
      <div ref={overlayRef} className="jd-veil" aria-hidden="true">
        <div className="jd-veil__pool" />
        <div className="jd-veil__grain" />
      </div>
    </RouteTransitionContext.Provider>
  );
}
