"use client";

/* ============================================================================
   Stage 4 — the home menu unfold (winning variant B: gatefold double-fold)
   ----------------------------------------------------------------------------
   Renders the CLOSED folded printed menu (the home centerpiece) as a real
   <a href="/menu">, and on click/Enter drives the SHARED route-transition
   overlay (Stage 3.7) with a gatefold double-fold cover + dissolve reveal.

   Click ownership: the provider's capture-phase listener intercepts every
   internal <a> and plays the baseline veil. We carry data-no-transition so it
   SKIPS this link, then wire our own onClick → preventDefault + transitionTo(
   "/menu", { variant:"unfold", cover, reveal }). The element stays a real href
   so keyboard / SR / no-JS still navigate (pricing also printed on the cover).

   We write ONLY cover/reveal choreography. The provider owns router.push (after
   cover), the double-rAF paint-gate, the watchdog, and the reduced-motion
   bypass (instant push, no veil) — none of that lives here.

   CRITICAL: the shared .jd-veil rests at opacity:0 + visibility:hidden, and for
   a CUSTOM cover the provider does NOT lift it (only its default veil tween
   does). So cover() MUST gsap.set(overlay,{autoAlpha:1,scale:1}) to make the
   PARENT visible BEFORE animating injected children — otherwise opacity:0 on
   the parent hides the whole fold and the page just jump-navigates.
   ========================================================================== */

import { useRef } from "react";
import { gsap } from "@/lib/motion";
import { useRouteTransition } from "@/components/site/route-transition";
import { TIERS } from "@/components/site/menu-full";

const CREST = "/assets/showstopper/brass-crest.svg";

/* Coarse pointer / small screen? → drop CSS 3D, 2D cover-slide path. Read at
   gesture time (not render) so it tracks the actual device. Matches the CSS
   @media (hover:none),(max-width:720px) breakpoint. */
function isMobilePath(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(max-width: 720px)").matches
  );
}

/* Build the gatefold spread DOM and inject into the shared overlay node. Returns
   the spread element so reveal() can remove it on complete. Prices read from
   TIERS — never hardcoded, so the gutter cannot drift from /menu. */
function buildSpread(overlay: HTMLDivElement): HTMLDivElement {
  const spread = document.createElement("div");
  spread.className = "ub-spread";

  // gutter (behind the leaves) — pricing revealed as the leaves part
  const rows = TIERS.map(
    (t) =>
      `<div class="ub-spread__price-row"><span>${t.name}</span>` +
      `<span class="ub-spread__price-lead" aria-hidden="true"></span>` +
      `<span class="ub-spread__price-num">$${t.price}</span></div>`,
  ).join("");
  const gutter = document.createElement("div");
  gutter.className = "ub-spread__gutter";
  gutter.innerHTML =
    `<span class="ub-spread__kicker">The menu — pricing inside</span>` +
    `<div class="ub-spread__pricing">${rows}</div>`;

  // two leaves hinging on the centre spine, each printing half the cover title
  const leafL = document.createElement("div");
  leafL.className = "ub-spread__leaf ub-spread__leaf--l";
  leafL.innerHTML =
    `<div class="ub-spread__face"><span class="ub-spread__face-title">The</span></div>` +
    `<div class="ub-spread__leaf-shadow"></div>`;
  const leafR = document.createElement("div");
  leafR.className = "ub-spread__leaf ub-spread__leaf--r";
  leafR.innerHTML =
    `<div class="ub-spread__face"><span class="ub-spread__face-title">Menu</span></div>` +
    `<div class="ub-spread__leaf-shadow"></div>`;

  spread.append(gutter, leafL, leafR);
  overlay.appendChild(spread);
  return spread;
}

export function ClosedMenu() {
  const { transitionTo } = useRouteTransition();
  const spreadRef = useRef<HTMLDivElement | null>(null);

  /* COVER — gatefold double-fold to FULL occlusion.
     FIRST lift the shared overlay parent to opaque (autoAlpha:1) so the injected
     fold is actually visible (the provider does not lift it for custom covers).
     Desktop: leaves start edge-on (rotateY ±92°) and swing flat to 0°, so two
     cream faces fill the viewport (power4.in → decisive into coverage). Tracked
     edge shadow fades in as they close.
     Mobile: 2D cover-slide — leaves translateX from offscreen to meet centre. */
  const cover = (overlay: HTMLDivElement): gsap.core.Animation => {
    // PARENT VISIBLE FIRST — without this the whole fold is hidden behind opacity:0.
    gsap.set(overlay, { autoAlpha: 1, scale: 1 });
    // Idempotent: drop any stale spread left by an interrupted nav so they never accrue.
    overlay.querySelectorAll(".ub-spread").forEach((n) => n.remove());

    const spread = buildSpread(overlay);
    spreadRef.current = spread;
    const mobile = isMobilePath();
    const leafL = spread.querySelector(".ub-spread__leaf--l") as HTMLElement;
    const leafR = spread.querySelector(".ub-spread__leaf--r") as HTMLElement;
    const shadows = spread.querySelectorAll(".ub-spread__leaf-shadow");

    const tl = gsap.timeline();
    if (mobile) {
      // 2D cover-slide: leaves sweep in from each edge to meet, full occlusion
      gsap.set([leafL, leafR], { willChange: "transform" });
      gsap.set(leafL, { xPercent: -100 });
      gsap.set(leafR, { xPercent: 100 });
      gsap.set(shadows, { autoAlpha: 0 });
      tl.to([leafL, leafR], {
        xPercent: 0,
        duration: 0.5,
        ease: "power3.in",
      }).to(shadows, { autoAlpha: 1, duration: 0.3 }, "<");
    } else {
      // CSS-3D gatefold: swing the two leaves flat from edge-on to 0°
      gsap.set([leafL, leafR], { willChange: "transform" });
      gsap.set(leafL, { rotationY: -92 });
      gsap.set(leafR, { rotationY: 92 });
      gsap.set(shadows, { autoAlpha: 0 });
      tl.to([leafL, leafR], {
        rotationY: 0,
        duration: 0.6,
        ease: "power4.in", // accelerate decisively into full coverage
      }).to(shadows, { autoAlpha: 1, duration: 0.32, ease: "power2.in" }, "<0.12");
    }
    return tl;
  };

  /* REVEAL — part the leaves back open, hold the gutter pricing a beat, then
     dissolve / lift, and REMOVE the injected spread on complete. The leaves part
     past flat (back.out overshoot — the "snap of real paper"). The provider's
     reset() returns the bare overlay to autoAlpha:0 AFTER our reveal resolves;
     we only clean our injected DOM. */
  const reveal = (overlay: HTMLDivElement): gsap.core.Animation => {
    const spread = spreadRef.current;
    const cleanup = () => {
      spread?.remove();
      spreadRef.current = null;
    };
    if (!spread) {
      // .call (not onComplete): the provider's whenDone() overwrites a returned
      // anim's onComplete with its own reset(), which would clobber our cleanup.
      return gsap.timeline().to(overlay, { autoAlpha: 0, duration: 0.26 }).call(cleanup);
    }
    const mobile = isMobilePath();
    const leafL = spread.querySelector(".ub-spread__leaf--l") as HTMLElement;
    const leafR = spread.querySelector(".ub-spread__leaf--r") as HTMLElement;
    const shadows = spread.querySelectorAll(".ub-spread__leaf-shadow");

    // cleanup runs as a trailing .call(), NOT the timeline onComplete: the provider's
    // whenDone() overwrites a returned anim's onComplete with its own reset(), which
    // would otherwise clobber spread removal (the 22/23 leak the verifier caught).
    const tl = gsap.timeline();
    if (mobile) {
      tl.to(shadows, { autoAlpha: 0, duration: 0.28 }, 0)
        .to(
          [leafL, leafR],
          {
            xPercent: (i: number) => (i === 0 ? -100 : 100),
            duration: 0.62,
            ease: "power3.out",
          },
          0.06,
        )
        .to(overlay, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, 0.42);
    } else {
      // part the leaves open past flat (overshoot) then the spread lifts away
      tl.to(shadows, { autoAlpha: 0, duration: 0.3 }, 0)
        .to(
          leafL,
          { rotationY: -96, duration: 0.7, ease: "back.out(1.4)" }, // paper recoil
          0.04,
        )
        .to(leafR, { rotationY: 96, duration: 0.7, ease: "back.out(1.4)" }, 0.04)
        .to(
          spread,
          { autoAlpha: 0, scale: 1.04, duration: 0.46, ease: "power3.out" },
          0.34,
        )
        .to(overlay, { autoAlpha: 0, duration: 0.42, ease: "power2.out" }, 0.4);
    }
    tl.call(cleanup); // trailing call survives the provider overwriting onComplete with reset()
    return tl;
  };

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // let modified clicks (new tab) and non-primary buttons fall through native
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    transitionTo("/menu", { variant: "unfold", cover, reveal });
  };

  return (
    <a
      href="/menu"
      data-no-transition
      data-menu-closed
      onClick={onClick}
      className="ub-card"
      aria-label="View the full menu — pricing inside"
    >
      <span className="ub-card__deckle" aria-hidden="true" />
      <span className="ub-card__inner">
        <span className="ub-card__eyebrow">Jawad Design</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ub-card__crest" src={CREST} alt="" width={104} height={104} aria-hidden="true" />
        <span className="ub-card__title">
          The <em>Menu</em>
        </span>
        <span className="ub-card__rule" aria-hidden="true" />
        <span className="ub-card__anchors">
          {TIERS.map((t) => (
            <span key={t.name} className="ub-card__anchor">
              <span className="ub-card__anchor-name">{t.name}</span>
              <span className="ub-card__anchor-leader" aria-hidden="true" />
              <span className="ub-card__anchor-price">from ${t.price}</span>
            </span>
          ))}
        </span>
        <span className="ub-card__open">
          View the menu <span className="ub-card__arrow" aria-hidden="true">→</span>
        </span>
        <span className="ub-card__note">Pricing inside</span>
      </span>
    </a>
  );
}
