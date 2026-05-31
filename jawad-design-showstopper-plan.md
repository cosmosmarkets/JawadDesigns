# Jawad Design — Show-Stopper Implementation Plan

**Goal:** take the current site from ~5.5/10 ("good developer") to a screenshotted, premium, bespoke portfolio that justifies the Chef's Table price.

> **This plan is multipage-native.** It was originally written for the old single-scroll monolith. The home has since been **split into a multipage funnel** (`/`, `/work`, `/menu`, `/about`, `/contact`), and the persistent order Docket was removed in that split. Every stage below has been re-scoped for that reality — see **Architecture** and **Planning decisions locked** before starting.

> **2026-05-30 audit pass (read before continuing Stage 3).** A brutal homepage review surfaced four problems the staged plan under-weighted: (1) **tonal whiplash** — the dark→cream→dark→cream→dark rhythm switches the cinematic lighting *off* for the longest stretch of the page, because the cream Menu/Process/Trust/Guestbook sections are full-bleed bright paper, not lit cards; the vignette (`multiply`) and candlelight pool (`screen`) do almost nothing over near-white. (2) **The material system is built but tuned invisible** — ember rim, brass letterpress, grain (5%), vignette (0.5), candlelight pool are all dialled below the threshold of being seen in a screenshot. (3) **The hero plate reads as a smudge, not a plated dish** — spotlight too wide/weak to carve the charger out of the black, and the ember offset on `WEBSITES` reads as an RGB-split bug, not letterpress. (4) **The Chef teaser ships a `PORTRAIT — COMING SOON` placeholder** on a page selling a $3,000 Chef's Table — the single most premium-damaging element on the site. These are tuning/contrast/placeholder problems, not rebuilds. **A new low-cost, high-leverage [Stage 3.5 — Tonal unification & material visibility](#stage-35--tonal-unification--material-visibility-do-this-before-stage-4) is inserted before the signature moments to fix them.**
>
> **And a fifth, separate finding (motion):** Stage 3 was shipped **home-only.** The global motion provider is correct, but the inner routes (`/work`, `/menu`, `/about`, `/contact`) were never given the motion classes — `reveal-lines` (the masked-heading wipe), parallax, and the drawn hairline appear on **zero** non-home elements, which is exactly why you "notice NO changes." Stage 3 is reopened with a per-route wiring mandate, a legibility requirement, and a per-route acceptance audit — see the red diagnosis box in [Stage 3](#stage-3--motion-baseline-everywhere--true-process-scrub). The new global rule **"every stage is all-routes"** (top of Global constraints) exists to stop this recurring.

**Locked direction**
- **Motion ceiling:** GSAP + ScrollTrigger + SplitText + Lenis, plus *light* WebGL accents (one or two shader spots, never page-wide 3D).
- **Material:** Cinematic duotone — high-contrast ember-on-charcoal, film-noir spotlighting, heavy shadow, grain, candlelit warmth.
- **Scope:** Staged. Keep the structure and copy (the writing is the strongest thing here). Transform motion, material, and three distributed signature moments. Approve each stage before the next.
- **Three signature moments, distributed across the funnel (not stacked):**
  1. **The Pass / plating hero** — top of **home**. ✅ **DONE** (Stage 2 complete, verified).
  2. **Closed menu → unfold-as-page-transition** — the home `MenuPreview` becomes a *closed* menu; opening it unfolds full-screen **and carries you to `/menu`**, where pricing is revealed. The unfold *is* the navigation.
  3. **Cross-page printing ticket** — a thermal ticket on a right-edge rail that **persists across routes** (sessionStorage), inking one line per funnel touchpoint and climaxing with the `TABLE 01 — CONFIRMED` stamp on `/contact` submit.
  - Plus: the five-course Process becomes a *true* cinematic pinned scrub on **home** (part of the motion baseline, not a fourth signature).

**Environment (read first):** these skills are installed as **project skills** in `jawad-designs/.claude/skills/`. They only load when you run **Claude Code with `jawad-designs/` as the working directory** (the real Next app + CLAUDE.md live there, not the parent folder). Before starting, `git add .claude` and commit it — it's currently untracked, so the skill set isn't yet reproducible.

**Skills available locally** (reference them by name so they trigger):
- **Motion:** `gsap-react` (lead with this — the codebase uses `useGSAP` from `@gsap/react`), `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins` (ScrollTrigger / SplitText / ScrollSmoother specifics), `gsap-performance` (drives the perf budget), `gsap-utils`, `gsap-frameworks`.
- **Design/material:** `taste-skill`, `redesign-skill`, `frontend-design`, `ui-styling`, `ui-ux-pro-max`, `design-system`, `brandkit`, `brutalist-skill`/`minimalist-skill` (direction reference only).
- **Assets:** `imagegen-frontend-web` (visual reference frames + the one raster paper-fibre tile), `image-to-code-skill` (turn those frames into components).
- **QA/perf/SEO:** `seo-unlighthouse` (Lighthouse scoring for the perf budget + Stage 7), plus the `seo-technical` / `seo-schema` / `seo-sitemap` suite for discoverability (out of motion scope, but a portfolio needs to be found — schedule after Stage 7).

> See `SKILL-STAGE-MAP.md` for the exact skill→stage mapping.

> **How to use this doc:** work top to bottom. Each stage has a single copy-paste prompt and an acceptance check. Don't start a stage until the previous one passes its check. Run each stage as its own Claude Code session (`/clear` + `git tag stage-N` between stages) to keep context clean and rollback cheap.

---

## Architecture (the funnel this plan targets)

The old single page is now five routes. Knowing where each thing lives is load-bearing for Stages 3–6.

- **`/` (home)** — `Hero → Trust → WorkTeaser → ChefTeaser → MenuPreview → Process → Guestbook → Cta`. (`components/site/home.tsx`)
- **`/work`** — full case study (`work-full.tsx`). The funnel's "signature dish."
- **`/menu`** — `Why` (the short menu, `#why`) → `TierGrid` pricing (`#menu`) → `Pantry` / always-included (`#details`). (`menu-full.tsx`) **Pricing is the MVP of the whole site — it must be reachable and legible fast.**
- **`/about`** — full chef bio (`chef-full.tsx`). The funnel's "the recipe."
- **`/contact`** — the order form (`contact-form.tsx`). The funnel's "order placed."
- **Shared chrome:** `Nav` (fixed top, `.k2-nav`) and `Footer` (tall, with the `ONE CHEF · ONE TICKET` marquee) live in `app/layout.tsx` on every route.
- **`TierGrid` is a single shared source** (defined in `menu-full.tsx`, imported by `MenuPreview`) so pricing never drifts. Stage 4 changes *how home presents the entry to it*, not the tier data.

**Multipage motion contract (new — did not exist in the monolith plan):** App Router does client-side navigation, so the motion system must survive route changes. On every route change: `ScrollTrigger.refresh()` after the new route paints, `kill()` triggers from the unmounted route, reset any scroll-driven spotlight/parallax to the new page's top, and re-assert the `prefers-reduced-motion` guard. No ScrollTrigger leaks, no stale pins, no double-init under StrictMode. This is a Stage 0 deliverable and a Stage 7 check.

**Mobile signature contract (new — 2026-05-30 grilling pass).** Every signature has **three** explicit tiers, not two — desktop, real mobile (motion ON), and reduced-motion. The middle tier is the fragile one (the perf budget allows no worse than 30fps on a low-end Android) and must never improvise:

| Moment | Desktop | Mobile (motion ON) | Reduced-motion |
|---|---|---|---|
| **Hero (Stage 2)** ✅ | WebGL heat-shimmer + full plating timeline | static grain, no shader (≤720px) | static |
| **Process scrub (Stage 3B)** | pinned ScrollTrigger scrub, frame-by-frame | **NOT pinned** — five courses as discrete scroll-reveal cards; counter/pips advance on enter | static stacked |
| **Unfold (Stage 4)** | full-bleed CSS **3D hinge** unfold, paper physics | **simplified 2D cover-slide** (transform/opacity only, reuses the 3.7 veil overlay) → dissolve to `/menu` | instant nav to `/menu` |
| **Ticket (Stage 5)** | right-edge hanging rail | bottom-right **tap-to-expand pill** (progress e.g. 2/4) | lines appear instantly, no feed/print |

Rule: a low-end phone never runs a 3D transform or a pinned scrub. If a moment can't hit framerate at the mobile tier, it drops to the next-cheaper tier — never ship a janky middle tier.

---

## Planning decisions locked (2026-05-30 grilling pass)

These resolve the ambiguities the monolith plan left open once the site went multipage. They are the source of truth for Stages 4 and 5 and for asset fidelity.

1. **Signature #2 — menu.** Home `MenuPreview` becomes a **closed** folded menu under the spotlight that visibly promises *"pricing is inside."* Clicking it plays an **unfold-as-page-transition** built as an **overlay-cover** (occlude → navigate → dissolve to reveal — *not* a shared-element morph; see ADR 0001): a full-bleed GSAP curtain unfolds until it fully occludes the viewport, `router.push('/menu')` fires underneath, and once the new route paints the unfolded spread dissolves away to reveal the live pricing grid — one continuous gesture, no flash. `/menu` **always renders pricing fully open** (instant for deep-links and reduced-motion). Reduced motion = instant nav to `/menu`, no unfold. Home no longer shows the flat `TierGrid` up front — **but the cover is not fully blind.** It carries an **anchor price** (letterpressed on the cover: the three tier names with their starting "from $X" prices, e.g. *"Three courses · from $X"*) so the one qualifying number is legible fast (the pricing-is-MVP rule), while the full comparison grid — what's included, the Chef's Table flag — stays the reward inside on `/menu`. The cover both *promises* pricing and *delivers the anchor*; the grid is the payoff.
2. **Signature #3 — ticket.** A **cross-page funnel ticket** persisted in `sessionStorage`. **Right-edge rail**, hanging down from just below the nav like paper from an off-screen printer (~180px), feeding **downward** as lines ink; **auto-retracts/fades when the footer enters view** so it never fights the footer or CTA. **Mobile:** collapses to a tap-to-expand pill, bottom-right.
3. **Ticket trigger = scroll-earned + order-independent.** Fixed slots in funnel order, pre-printed faint, each inking when you reach its route **and** scroll past that page's key section — independently, so deep-linking any route still inks its line. No forced sequence, no backfill. **Exception: `THE MENU` inks on *arrival* at `/menu`, not on scroll** — because `/menu` renders pricing fully open immediately, arrival already *is* "seen pricing" (pricing-is-MVP). `CONFIRMED` fires **only** on a real `/contact` submit. State restores from `sessionStorage` instantly on return/refresh (no re-animation).
   - **Plumbing (architecture):** a `TicketProvider` mounted in `app/layout.tsx` owns the inked-slots state + `sessionStorage` sync and renders the rail (it stays mounted across navigation so nothing replays). Each page declares its own key section with an invisible `<TicketBeacon slot="…" />`; a one-shot ScrollTrigger on the beacon calls `inkSlot()` when passed. `THE MENU` inks from the provider on `/menu` arrival (no beacon); `CONFIRMED` is fired imperatively from the `/contact` submit handler. The Ticket never queries another page's internal markup.
4. **Ticket slots (restores the original five-line docket poetry across the funnel):**
   `SEATED` (home) · `SIGNATURE` (`/work`) · `THE RECIPE` (`/about`, optional — inks if visited, never load-bearing) · `THE MENU` (`/menu`) · `CONFIRMED` (`/contact` submit). Core four are home/work/menu/contact; `/about` is the optional fifth.
5. **Paper fidelity = Hybrid (Option 1).** Keep the procedural SVG paper as the base, **plus one shared ~30KB lazy-loaded raster paper-fibre tile (WebP)** used as a low-opacity (`multiply`, ~8%) overlay on **both** the menu booklet and the thermal ticket — the micro-fibre detail `feTurbulence` can't fake. Vector emblems (brass crest, garnish, deckled/perforation edges) stay vector. Raster weight is off the JS budget, lazy, and off-LCP.

---

## Global constraints (apply to EVERY stage — not just QA)

- **🔴 EVERY STAGE IS ALL-ROUTES — "home only" is never "done."** The funnel is five real pages (`/`, `/work`, `/menu`, `/about`, `/contact`) that share the same elements (cream cards, headings, the chef block, the weld shot). Stage 3 was shipped home-only and the inner pages got effectively zero visible motion — do not repeat this. Material, motion, atmosphere, type, and layout work all apply to **every route** via the shared layout and by wiring each route's own components. Every stage's acceptance check is a **per-route audit**: if `/work`, `/menu`, `/about`, or `/contact` doesn't show the change, the stage is not complete.
  - **Two route tiers (scope boundary — 2026-05-30 grilling pass).** "All-routes" means **all five FUNNEL routes** above. The **ancillary routes** (`/journal`, `/journal/[slug]`, `/work/[slug]`, `not-found`) are **out of signature / editorial / per-route-motion scope** until they have real content — they are placeholders, and `/journal` isn't even in the nav. They are *not* exempt from looking on-brand: they **inherit shared-layout chrome for free** (Stage 1 material, grain/vignette/spotlight, the Stage 3.7 Veil) because that lives in `layout.tsx`. The bar for ancillary routes is only "don't look broken behind the veil," never "get bespoke per-route work." Per-route acceptance audits cover the five funnel routes; ancillary routes only get a "still on-brand, not broken" glance.
  - **Ticket on ancillary routes: HIDDEN.** The Ticket rail renders only on funnel routes. On `/journal`, the `[slug]` placeholders, and `not-found` it is hidden — it has no slot to earn there, and a kitchen ticket on a 404 reads as a bug. Its persisted `sessionStorage` state is untouched and reappears when the visitor returns to a funnel route.
- **Performance budget (hard limits, checked at every acceptance step):** added JS ≤ ~150KB gzipped over baseline; Largest Contentful Paint ≤ 2.5s on desktop, ≤ 4s on mid-tier mobile; sustained 60fps on desktop, no worse than 30fps on a low-end Android during any animation. The one raster paper tile is **image** weight (lazy, off-LCP), not JS — it does not count against the 150KB JS cap, but keep it ≤ ~40KB. If a stage blows the budget, fix it before moving on — do not defer to Stage 7.
- **Cumulative motion discipline:** every new moment competes for attention with the others and with the actual goal (justifying the Chef's Table price). Prefer fewer, sharper moments over more. The printing-ticket device is the most at-risk of becoming distracting — watch it closely, especially now that it persists across *every* route.
- **Kill criteria:** if a signature moment doesn't clearly land at its acceptance check, cut it rather than polishing a gimmick. A clean static section beats a half-working effect.
- **Rollback:** branch/tag per stage (e.g. `git tag stage-2-hero`) so a failed stage is cheap to abandon without unwinding later work.
- **SplitText is free — no fallback needed.** As of GSAP 3.13 (April 30 2025, post-Webflow), the entire toolset including SplitText is free for commercial use. Your `gsap@^3.15.0` already includes it, and SplitText was rewritten with native screen-reader accessibility and built-in masking for reveal effects — use the new masking API directly. The old "hand-rolled split / Splitting.js fallback" hedging is obsolete; drop it.

---

## Pre-flight (do BEFORE Stage 0 — no design changes) — ✅ largely DONE

**Why:** you can't tell if a stage succeeded without a baseline, the perf budget needs to be live from the first commit, and the material/signature stages need source assets ready.

> **Status:** baseline + SplitText smoke-test + the vector asset library (`public/assets/showstopper/`) + the perf checklist are done. **Remaining:** (a) capture baselines for **every route**, not just home; (b) generate the **one shared raster paper-fibre tile** (decision #5).

**Prompt:**
```
Before any redesign work:
1. Capture full-page baseline screenshots of EVERY route (/, /work, /menu, /about, /contact) at desktop (1440px), tablet (768px), and mobile (375px), plus a current Lighthouse performance score per route. Save these as the "before" reference.
2. Confirm SplitText imports and runs from the installed gsap package (it's free as of 3.13 / your 3.15) — do a one-line smoke test. No fallback needed.
3. Visual assets: the vector library in public/assets/showstopper/ already covers plate/charger, spotlight pool, paper-card texture, brass crest, garnish flourish, thermal-paper texture, deckled/perforation edges, grain, vignette, steam. ADD ONE new asset: a single ~30KB WebP raster paper-fibre tile (tileable, on-palette, low-contrast) to overlay on the menu booklet and ticket per the Hybrid paper decision. Generate via imagegen-frontend-web.
4. Establish the performance budget as a checklist we re-run each stage (added JS weight, LCP, FPS) — tracked PER ROUTE. Wire seo-unlighthouse so the Lighthouse number is scriptable, not eyeballed, and capture the baseline JS bundle size now so every later stage can diff against it.

Do not change any visible design. Output: per-route baseline screenshots, SplitText smoke-test result, the raster paper tile added to the asset inventory, and the perf checklist (Lighthouse + bundle-size baseline recorded).
```
**Acceptance check:** per-route baseline screenshots + Lighthouse scores saved; SplitText confirmed free/working; the raster paper-fibre tile exists alongside the vector library; perf budget written as a reusable, per-route checklist.

---

## What's already good — do NOT break
- All copy and the kitchen metaphor (hero, five courses, the menu, the order ticket language, honest empty guestbook).
- The palette tokens (`--char`, `--bone`, `--ember`, `--brass`, `--gold`) — we deepen them, not replace them.
- The funnel's route split and information architecture — do not re-merge it into one page.
- `prefers-reduced-motion` handling — keep and extend it to every new animation **and** to the unfold transition and the cross-page ticket.
- The **`TIERS` *data*** — keep tier names, prices, and CTA targets defined once in `menu-full.tsx` (the `TIERS` array), read by home's Anchor Price and both grids so nothing drifts. **This is the only frozen part: the data, not the layout.** The `TierGrid`'s *visual* layout is explicitly *not* sacred — Stage 6 reworks it (see below). "Single-source" means one price array, not one fixed card design.

## The current weaknesses each stage fixes
| Weakness | Score | Fixed in |
|---|---|---|
| Motion is IO-reveal + fake scrub only | 5/10 | Stage 0, 3 |
| Zero texture/material (smooth gradients) | 4/10 | Stage 1 |
| Hero is one-shot CSS letter drop | 5/10 | Stage 2 ✅ |
| Menu entry is a flat card grid, twice | — | Stage 4 (home → Closed Menu) + Stage 6 (/menu grid → editorial, Chef's Table dominant) |
| The "ticket" is just language, no device | — | Stage 5 |
| Safe, symmetrical layout (Trust / Why / Pantry) | 5/10 | Stage 6 |
| Conservative type *use* | 6/10 | Stage 1, 6 |
| Motion doesn't survive route changes | — | Stage 0, 7 |
| **Tonal whiplash — cream sections kill the cinematic lighting** | 4/10 | **Stage 3.5** (Menu also Stage 4) |
| **Material system built but tuned invisible (contrast/atmos too subtle)** | 4/10 | **Stage 3.5** |
| **Hero plate reads as a smudge; `WEBSITES` offset looks like a bug** | 5/10 | **Stage 3.5** (tuning only — do not rebuild Stage 2) |
| **`weld` screenshot is a cold SaaS UI dropped into a warm dark room** | 4/10 | **Stage 3.5** |
| **Chef teaser ships a `COMING SOON` placeholder on the flagship page** | 3/10 | **Stage 3.5** (urgent) |
| **Negative space reads as "unfinished," not "composed"** | 5/10 | Stage 3.5 (Trust preview) → Stage 6 |
| **No per-route meta, OG images, or structured data — invisible to search** | 3/10 | **Stage 8B** |
| **No analytics — funnel is blind** | —/10 | **Stage 8B** |
| **/about bio and /journal are still placeholders** | — | **Stage 8A** |

---

## Stage 0 — Motion foundation (do this first, ship nothing visible) — ✅ DONE (extend for routing)

**Why:** every later stage depends on the animation stack being in place, reduced-motion-safe, **and route-change-safe**.

> **Status:** the core foundation is built — `lib/motion.ts` (GSAP + ScrollTrigger + SplitText), `components/site/smooth-scroll-provider.tsx` (Lenis + reveal batch), the `jd-anim` pre-paint guard, `forceMotion()`/`withMotion()` and the `?motion=on` override. **Remaining work folded here:** harden it for App Router navigation (the multipage motion contract above).

**Prompt (remaining routing-hardening only):**
```
Invoke gsap-react (primary), gsap-core, and gsap-scrolltrigger.

The motion foundation (GSAP + ScrollTrigger + SplitText + Lenis + reduced-motion guard) already exists. Harden it for App Router client-side navigation WITHOUT changing any visible design:
1. On every route change: ScrollTrigger.refresh() after the new route paints, kill() triggers belonging to the unmounted route, and reset Lenis scroll to top of the new page.
2. Reset any scroll-driven global (spotlight position, parallax) to the new page's top on navigation.
3. Re-assert the prefers-reduced-motion guard per route; confirm no ScrollTrigger leaks or duplicate inits under StrictMode across repeated back/forward navigation.
4. Keep the single registration point — do not introduce a second motion system.

Confirm: navigate /→/menu→/work→back repeatedly; scroll feels smooth on each; no stale pins, no console warnings, reduced-motion still fully disables everything on every route.
```
**Acceptance check:** smooth Lenis scroll on every route; reveals fire after navigation; no ScrollTrigger leaks/duplicate pins across repeated navigation; OS "reduce motion" disables smooth scroll and all tweens on every route with no broken layout.

---

## Stage 1 — Cinematic duotone material pass

**Why:** this is the single biggest "bespoke vs generic" lever. Kills the flat-gradient feeling. **Applies to every route** via the shared layout, not just home.

**Prompt:**
```
Invoke taste-skill, redesign-skill, and ui-styling (for the layered shadow/letterpress/emboss treatment).

Give the WHOLE SITE (every route, via the shared layout layers) a cinematic duotone, film-noir-kitchen material treatment while keeping the existing charcoal/ember/brass/gold tokens:
- Add a subtle film-grain / noise overlay across the page (the SVG grain asset, ~3-5% opacity, blended), as a fixed full-bleed layer in the layout so it covers every route.
- Add a global vignette and a warm, candlelit radial "spotlight" that subtly follows scroll position (and optionally cursor on desktop), so sections feel lit, not filled. The spotlight must reset to the top on route change (Stage 0 contract).
- Replace flat gradient panels with layered depth: directional shadow, ember rim-light on key edges, brass hairline letterpress (inset shadow) on dividers and the menu/pricing cards.
- Increase contrast toward ember-on-char drama; deepen blacks, push highlights warm.
- Treat brass/gold text as embossed (subtle dual text-shadow) rather than flat fills.

Keep it tasteful and legible — this is fine dining, not a haunted house. Respect prefers-reduced-motion for the spotlight (make it static).
```
**Acceptance check:** screenshots of every route feel *lit and tactile*; no section looks like a flat color block; text contrast still passes ~4.5:1 on body copy; the grain/vignette/spotlight render consistently across routes.

---

## Stage 2 — Signature moment #1: The Pass / plating hero (light WebGL) — ✅ DONE

**Why:** the first 3 seconds. This is the screenshot.

> **Status: COMPLETE and verified.** `components/site/sections/hero.tsx` runs one GSAP timeline (bloom → plate settle → "I serve" rises → "websites." plates letter-by-letter via SplitText masked chars → diamond dot → garnish sweep → sub/CTAs/cue), then a scrubbed scroll-out lifts the plate and dims the bloom. `hero-shader.tsx` + `lib/gl/heat-shimmer.glsl.ts` is a raw WebGL2 heat-shimmer that loops only on-screen + tab-visible and never starts under reduced-motion or ≤720px mobile. `verify-stage2.mjs` passes across normal/reduced/mobile. **Do not rebuild.** Original prompt retained below for reference only.
>
> **Carried into Stage 3.5 (tuning, not rebuild):** the 2026-05-30 audit found the plate reads as a smudge (spotlight pool too wide/weak to separate the charger from the black) and the ember offset on `WEBSITES` reads as an RGB-split bug. Stage 3.5 adjusts spotlight radius/falloff + the plate rim specular and fixes/commits the letterpress — **parameter tuning of the existing hero, the timeline and shader stay as-is.** `verify-stage2.mjs` must still pass after.

<details><summary>Original Stage 2 prompt (reference)</summary>

```
Invoke gsap-react, gsap-timeline, gsap-core, gsap-plugins (for SplitText), and gsap-performance.
Rebuild the hero as "The Pass — a plated dish under the spotlight": dark spotlit stage, empty charger under a warm pool; on load a ~1.6s plating timeline (bloom, plate settle, "I serve" rises, "websites." plates letter-by-letter masked via SplitText, steam, brass garnish sweep), sub-headline + CTAs last; a LIGHT WebGL heat-shimmer behind the plate only (paused off-screen + reduced-motion); scroll-out dims spotlight and lifts the plate. Mobile drops the shader to static grain.
```
</details>

**Acceptance check (met):** hero plays as one choreographed sequence; shader 60fps desktop, absent/static on mobile + reduced-motion; headline is the clear focal point.

---

## Stage 3 — Motion baseline everywhere + true Process scrub

**Why:** makes the *whole funnel* feel alive and fixes the weakest interaction (the snap-between-states process). Every route — not just home — gets the scroll-motion language now that `/work`, `/menu`, `/about`, `/contact` are real pages.

> **🔴 Audit diagnosis (2026-05-30) — why you see NO motion change.** Stage 3 was implemented on the **home sections only.** The `SmoothScrollProvider` is global and rebuilds its batches per route correctly — but it animates *classes*, and the inner-route components were never given them. Verified counts in the codebase:
>
> | Route / component | `.reveal` | `.reveal-lines` (masked wipe) | `.parallax` | `.k3-drawline`/`.k3-hairline` |
> |---|---|---|---|---|
> | `/` home sections | ✅ many | ✅ on every heading | ⚠️ 1 (weld shot) | ⚠️ Trust only |
> | `/work` (`work-full.tsx`) | 3 | **0** | **0** | **0** |
> | `/menu` (`menu-full.tsx`) | 6 | **0** | **0** | **0** |
> | `/about` (`chef-full.tsx`) | 1 | **0** | **0** | **0** |
> | `/contact` (`contact-form.tsx`) | 1 | **0** | **0** | **0** |
> | `/journal` (`placeholder.tsx`) | 0 | 0 | 0 | 0 |
>
> The inner pages have only a few plain `.reveal` block-fades (26px rise + opacity, ~1s) — and most fire above the fold on load, before you're looking, so they're effectively invisible. The headline effect (`reveal-lines` masked wipe), parallax, and the drawn hairline appear on **zero** non-home elements. **That is the "no changes" you're feeling.** Stage 3 is therefore NOT complete: it must wire the motion classes into every route's components and make the motion *legible* (not just technically present), and the acceptance check below is now a per-route audit, not a single pass.
>
> **First, confirm motion is even ON** before wiring more (a global off-switch produces the same "no motion" symptom site-wide): check the OS/browser `prefers-reduced-motion` setting is *off*, `body[data-motion]` is not `"off"`, `html.jd-anim` IS present, and `html.jd-no-gsap` is NOT (the latter means the GSAP import failed and everything fell back to static). Test with `?motion=on` appended to the URL to force the full path past any reduced-motion guard.

**Prompt:**
```
Invoke gsap-react, gsap-scrolltrigger, gsap-timeline, gsap-plugins (SplitText line masking), and gsap-performance (pinned scrub must not drop frames).

CONTEXT: the global SmoothScrollProvider already drives the motion classes per route. The bug is that Stage 3 was only wired into the HOME sections — /work, /menu, /about, /contact carry almost none of the classes, so they get no visible motion. Your job is to make the scroll-motion language real on EVERY route AND make it legible.

Three things:

A) Wire ONE consistent scroll-motion language into EVERY section on EVERY route (/, /work, /menu, /about, /contact) — this means editing each route's component (home sections, work-full.tsx, menu-full.tsx, chef-full.tsx, contact-form.tsx) to carry the classes the provider animates. It must survive client-side navigation (Stage 0 contract). Per route, ensure:
- `.reveal-lines` on EVERY heading (h1/h2/h3) — SplitText lines wipe up behind a mask. This is the signature effect; right now it's on zero non-home headings.
- `.reveal` (staggered y + opacity + a touch of scale) on EVERY card/row/list-item group — tiers, pantry rows, work metrics, the about bio blocks, the contact fields.
- `.parallax` (with data-depth) on at least one bg-texture / mid-ground / foreground layer per route so there's real depth, not flat scroll.
- `.k3-hairline` (scrubbed brass draw) on each section break, on every route.
- A COMPOSED LEAD ENTRANCE for each route's first heading — /work, /menu, /about, /contact must each open with a real first impression (masked headline + a beat), not a bare load.
- Produce a per-route coverage table in your output: route × (reveal-lines / reveal / parallax / hairline / lead entrance) all ticked.

B) Make the motion LEGIBLE, not just present (this is the other half of "I notice no changes"):
- The plain `.reveal` at 26px/opacity is too timid to read — give entrances enough travel, a clear stagger, and ease so a human actually perceives them. Headings should obviously WIPE, cards should obviously CASCADE.
- Don't fire everything above the fold on load: above-fold non-hero content should still play its entrance (slight delay after paint) rather than being pre-settled.
- Keep it tasteful and 60fps — legible ≠ loud.

C) Rebuild the five-course Process section (on HOME) as a TRUE pinned cinematic scrub (replace the current rAF snap):
- Pin the section, scrub a GSAP timeline tied to scroll progress.
- As you scrub through days 1→5, the "Now serving" day counter, the pips, and the course cards cross-fade continuously (not discrete jumps).
- Add per-day atmosphere: heat/steam intensifies, the spotlight shifts, a garnish detail changes per course.
- Give the empty RIGHT HALF a job: the big "Now serving / Day N" counter, pip rail, and steam/garnish must live there at real scale so the scrub is visibly cinematic, not just CSS-variable plumbing.
- The pin must release cleanly and refresh correctly when navigating away and back.

B) Rebuild the five-course Process section (on HOME) as a TRUE pinned cinematic scrub (replace the current rAF snap):
- Pin the section, scrub a GSAP timeline tied to scroll progress.
- As you scrub through days 1→5, the "Now serving" day counter, the pips, and the course cards cross-fade continuously (not discrete jumps).
- Add per-day atmosphere: heat/steam intensifies, the spotlight shifts, a garnish detail changes per course.
- Make it feel like watching a dish being cooked frame by frame.
- The pin must release cleanly and refresh correctly when navigating away and back.
- MOBILE (motion ON): do NOT pin on a phone (pinned scrub fights the address-bar resize and rubber-bands on touch). Below the mobile breakpoint, render the five courses as discrete scroll-reveal cards with the counter/pips advancing on enter — the pinned frame-by-frame scrub is a desktop-only reward (per the Mobile signature contract).

Everything must degrade to static stacked content under prefers-reduced-motion, on every route.
```
**Acceptance check (now a PER-ROUTE audit — "home only" does not pass):** walk **every** route — `/`, `/work`, `/menu`, `/about`, `/contact` — and on each one confirm: the lead heading plays a composed masked entrance; every heading wipes (`reveal-lines` present and firing); cards/rows visibly cascade in; there's at least one parallax-depth layer and a drawn hairline at a section break; and the entrances are **legible** (a first-time viewer notices them without being told to look). Produce the route × effect coverage table with no empty cells on the core four. Plus: the home Process is a continuous cinematic scrub that uses its right half and re-inits correctly after navigating away/back. Reduced-motion shows clean static content on every route. **If `/work`, `/menu`, `/about`, or `/contact` still looks like a bare load, Stage 3 is not done.**

---

## Stage 3.5 — Tonal unification & material visibility (do this BEFORE Stage 4)

**Why:** the single highest-leverage hour in the whole plan, and it predates the signature moments on purpose. The cinematic duotone system from Stage 1 *exists* but is (a) switched off wherever a section goes full-bleed cream, and (b) tuned below the threshold of being seen. No new mechanics — this is contrast, containment, and one placeholder kill. It moves the site ~6 → ~7.5 before a single new effect is built, and it de-risks Stage 4 (the closed-menu cover only reads as "a lit menu in a dark room" if the room is actually dark).

> **Scope discipline:** tuning, containment, and asset/placeholder fixes only. Do **not** add animation mechanics here (that's Stage 3), do **not** rebuild the hero timeline or shader (Stage 2 stays frozen — parameter tuning only), and do **not** restructure the Menu into the closed booklet (that's Stage 4 — but this stage's cream-containment is what makes Stage 4 land). Keep all palette tokens; only their *application* and *intensity* change.

> **All-routes (do not repeat the Stage-3 mistake).** The inner pages share the same elements as home — `/menu` has the same cream tier grid, `/about` the chef block, `/work` the weld screenshot, and all carry cream cards. Every fix in this stage applies to **every route**, not just home: contain cream as lit cards on `/menu` + `/work` + `/about` too; warm the `weld` shot wherever it appears (home teaser AND `/work`); kill the chef placeholder on home AND any `/about` equivalent; raise contrast/atmos globally via the shared layout so the dark room is consistent on all five routes. Output before/after stills **per route**.

**Prompt:**
```
Invoke taste-skill, redesign-skill, ui-styling, and frontend-design.

The cinematic duotone material exists (k3-pass4-material.css: grain, vignette, candlelight pool, ember rim, brass letterpress, contrast/atmos presets) but it's tuned invisible and switched off on the cream sections. Make it VISIBLE and CONSISTENT without changing palette tokens, copy, layout structure, or any Stage 2/3 motion mechanics:

1. KILL THE TONAL WHIPLASH (highest priority). Cream must stop being a full-bleed section background and become a CONTAINED, lit material — a printed card/menu/ticket sitting INSIDE a dark room:
   - Re-ground the Menu preview, Process, Trust, and Guestbook sections to the dark charcoal register; render their cream paper as bounded cards/props (rounded/deckled stock, drop shadow, brass hairline, seated in the candlelight pool), NOT as the section's background.
   - The vignette/spotlight (multiply/screen) barely affects near-white — once cream is a contained card on dark ground, the atmosphere layer lights it correctly ("a menu caught in a pool of light"). Verify the lit-pool actually reads on each of these sections.
   - (Menu specifically: this is interim — Stage 4 turns it into the closed booklet. Just get it onto dark ground now so the page stops flipping the house lights on.)

2. RAISE THE MATERIAL TO VISIBLE. Push the built-but-timid system up to where it announces itself while staying tasteful:
   - Default body to data-contrast="dramatic" and data-atmos="pronounced" (or re-tune the "medium" presets upward); deepen blacks, push highlights warm.
   - Tighten the candlelight pool: smaller radius, higher centre alpha, harder falloff, so it sculpts rather than washes.
   - Let the ember rim-light appear on more than just the flag tier + CTA card (key edges, active cards, the lit prop edges) — restrained, directional, not everywhere.
   - Make the brass letterpress on dividers/cards actually perceptible at 1x.

3. HERO READABILITY (parameter tuning of the existing Stage-2 hero ONLY — no timeline/shader rebuild):
   - Separate the charger plate from the black: tighten the hero spotlight pool and give the plate rim a real bone/brass specular edge so light CATCHES it. The plate must read as a plate in a still frame.
   - Fix the ember offset on "WEBSITES": commit it as a tight, intentional two-plate letterpress (1–2px, warm-over-dark dual shadow consistent with the rest of the system) or remove it. It must not read as an RGB-split bug.
   - verify-stage2.mjs must still pass (normal/reduced/mobile) after tuning.

4. WARM THE weld SCREENSHOT. It's a cold blue-white SaaS UI dropped into a candlelit room. Treat it as a prop in the room, not a window to another site: a graded warm/duotone overlay (multiply toward ember/char), and/or angle/partial-crop it into shadow. Keep it legible; it must stop being a tonal grenade.

5. KILL THE CHEF PLACEHOLDER (urgent). Replace "PORTRAIT — COMING SOON" + the empty bordered box with something finished: a brass-embossed "J" crest treated as a real monogram/seal, or a charcoal silhouette/candlelit prop. Even a deliberate, on-brand graphic beats an empty box with placeholder text on the page that sells the $3,000 tier.

6. TRUST NEGATIVE-SPACE PREVIEW (cheap, full version is Stage 6). The three claims float in the upper third over a dead black void. Give the void one anchor — an oversized brass course numeral bleeding off-edge, or the drawn hairline crossing the band — so the space reads as composed, not unfinished. Don't restructure into the full broken grid yet.

Everything stays dark-only, legible (body copy ≥ 4.5:1), and respects prefers-reduced-motion. Show before/after stills of the hero, the Menu/Process/Trust cream sections, the chef teaser, and the weld shot.
```
**Acceptance check:** no full-bleed bright-cream section remains — cream only appears as a contained lit card/prop on dark ground; the candlelight pool, grain, vignette, ember rim and brass letterpress are all *perceptible in a screenshot* without looking gaudy; the hero plate reads as a plate and `WEBSITES` reads as intentional letterpress (and `verify-stage2.mjs` still passes); the `weld` shot reads as warm in-room; the chef section shows a finished graphic, no "coming soon"; the Trust void has one composed anchor; body copy still passes ~4.5:1; reduced-motion unaffected. Net feel: the room stays dark and lit top-to-bottom — no section flips the lights on.

---

## Stage 3.7 — Route-transition overlay + baseline veil (do this BEFORE Stage 4)

**Why:** the multipage split left **exactly one** intentional navigation possible (the Stage 4 menu unfold) against a sea of default hard-cut, white-flash route swaps. In a candlelit film-noir funnel that inconsistency reads as a gimmick — one theatrical door, every other door a fluorescent snap. This stage builds **one shared layout-level transition overlay** and gives *every* nav a cheap baseline veil, so the funnel feels uniformly intentional. Critically, **Stage 4's unfold is then the same overlay "dialled up,"** not a second piece of infrastructure — build the overlay once here, reuse it there.

> **Decision (2026-05-30 grilling pass, option A):** add a minimal global route-transition rather than leaving hard cuts (option B) or relying on entrances only (option C). The unfold is special because it's *more*, not because it's the *only* transition.

**Prompt:**
```
Invoke gsap-react, gsap-timeline, gsap-core, and gsap-performance.

Build ONE route-transition overlay that lives in app/layout.tsx as a sibling of {children} (so it survives App Router client-side navigation — Stage 0 contract) and give every route change a cheap baseline veil:
- The overlay is a single fixed full-viewport layer, transform/opacity only, normally inert (pointer-events none, hidden from AT).
- Baseline veil on EVERY nav: a fast candlelight/grain fade-through-warm-dark (or a soft spotlight iris), ~300-400ms total, spring-style ease. NOT a slow fade-through-black. It must feel like a blink of the room dimming, not a loading screen.
- Expose a small imperative API (e.g. a transition controller / context) so Stage 4's menu unfold can drive this SAME overlay as an upgraded variant — do not build a second overlay for the unfold.
- Sequencing guard: the veil must CLEAR before the new route's Stage 3 lead-heading entrance plays (no double-cover), and it must NOT delay or double-fire the Ticket's arrival-ink on /menu (Stage 5). Keep a sane max-duration so a slow route never leaves the veil stuck.
- Prefetch intent: nav links prefetch their target (next/link) so the veil rarely outlasts the route paint.

Reduced motion: no veil at all — instant hard navigation on every route (and the Stage 4 unfold also bypasses, per its own spec).
```
**Acceptance check:** every nav (home↔work↔about↔contact, and nav-bar clicks) plays the same fast warm veil; no white flash; reduced-motion = instant cuts everywhere; the overlay is a single reusable layer Stage 4 will drive; the veil clears before lead-heading entrances and never blocks the Ticket arrival-ink; no perf regression on rapid back/forward.

---

## Stage 4 — Signature moment #2: closed menu → unfold-as-page-transition

**Why:** the mid-funnel wow that doubles as the doorway to the pricing page. Pricing is the MVP, so the spectacle's *job* is to carry the visitor to `/menu` with intent — not to entertain in place.

> **Reuses the Stage 3.7 overlay.** Do not build a second full-viewport overlay — the unfold drives the *same* layout-level transition overlay built in Stage 3.7, as its "dialled-up" variant. The baseline veil and the unfold are one system.

> **Re-scoped for multipage (see decision #1).** The old "openable card in the menu section" no longer exists; the menu is a shared `TierGrid` shown on home and `/menu`. We do **not** unfold in both places (that stacks the wow and doubles the cost). Instead: home shows a **closed** menu; opening it **is** the transition to `/menu`.

**Prompt:**
```
Invoke gsap-react, gsap-timeline, taste-skill, and ui-ux-pro-max (the transition must stay keyboard/SR-operable — see the a11y requirement).

Rework the home MenuPreview into a CLOSED folded menu, and make opening it the page transition to /menu:
- Home MenuPreview is now a closed, textured printed menu under the spotlight: paper grain (procedural SVG base + the shared raster paper-fibre tile, multiply ~8%), brass crest, letterpress title, a faint deckled edge. It must clearly signal "open to see pricing" (an affordance: a "View the menu — pricing inside" cue, hover lift, a peek of an inner edge). It does NOT show the flat tier cards anymore — BUT it DOES carry an anchor price letterpressed on the cover: the three tier names with their starting "from $X" prices (single source — pull the lowest price per tier from the shared TierGrid data so the cover can never drift from /menu). The full comparison grid (what's included, Chef's Table flag/shimmer) stays inside on /menu.
- On click/Enter, play the unfold-as-transition using an OVERLAY-COVER model (NOT a shared-element/View-Transitions morph — App Router unmounts the home tree, and the VT API is ruled out by the React 18 / Next 14 pin; see ADR 0001). The unfold drives the SAME layout-level overlay built in Stage 3.7 (sibling of {children}, survives the route swap) — it is the baseline veil "dialled up," not a second overlay. Sequence: (1) the cover unfolds via CSS 3D hinge transform with believable paper physics (easing, slight overshoot, soft drop shadow tracking the fold) until it is FULL-BLEED and FULLY OCCLUDES the viewport — this occlusion is the no-flash guarantee; (2) router.push('/menu') fires under the cover; (3) gate on the new route having painted (pathname change + a frame); (4) the unfolded printed spread cross-dissolves / lifts away to REVEAL the live /menu TierGrid underneath. The painted spread is the menu MASTHEAD (crest, letterpress title, "Three ways to dine") — NOT a render of the pricing cards — so it stays correct even after Stage 6 reworks the grid layout (the spread and the grid are deliberately decoupled; never pixel-copy the cards into the prop). The visitor reads it as "the menu I opened is the page I'm standing on," but the live page was always behind the curtain. One continuous gesture: closed → occlude → dissolve → standing on /menu looking at tiers.
- /menu ALWAYS renders pricing fully open (the shared TierGrid), instant for anyone who deep-links there directly. Chef's Table keeps the gold/flag treatment and a subtle shimmer.
- Handle route-readiness: preload /menu on hover/focus intent (next/link prefetch) and gate the unfold's resolve on the new route being painted, so the curtain never reveals a blank page. Keep a sane max-duration so it never feels stuck.
- transform/opacity only; pause/teardown cleanly.
- MOBILE (motion ON): drop the 3D hinge. Play a simplified 2D cover-slide — the closed menu curtains up to full-bleed (transform/opacity only) reusing the Stage 3.7 veil overlay, then dissolves to /menu. No CSS 3D transform on a phone (per the Mobile signature contract). Reduced-motion still goes straight to /menu.

Reduced motion: clicking the closed menu navigates straight to /menu (pricing shown), no unfold, no curtain.

Accessibility (verify in THIS stage, not Stage 7): the closed menu is a real link/button to /menu — fully keyboard and screen-reader operable; the unfold is decorative and must not gate reaching the pricing. /menu's tiers are reachable and readable with no animation at all.
```
**Acceptance check:** home shows a convincing closed printed menu that obviously promises pricing; clicking unfolds full-screen and lands you on `/menu` with tiers open, no blank-page flash; `/menu` deep-linked shows pricing instantly; reduced-motion goes straight to `/menu`; the path to pricing is fully keyboard/SR-operable without the animation; no layout shift.

---

## Stage 4.8 — Wire the contact submit (real backend) — DEPENDENCY of Stage 5

**Why:** Stage 5's climax (`CONFIRMED` stamp + ticket tear-off) is specified to fire on *"a real `/contact` form submit."* Today `contact-form.tsx` doesn't submit anywhere — it `window.location.href = "mailto:…"` and hands the visitor to their OS mail client (`TODO: backend out of scope`). That breaks the climax two ways: the page unloads/hands-off so the stamp plays to nobody, and on any device without a configured mail handler the "order" silently dies. A `CONFIRMED` stamp over a mailto that may go nowhere undercuts the exact thing the site sells. So the backend gets wired **before** Stage 5 can land.

> **Scope note (2026-05-30 grilling pass):** this intentionally expands the prior "backend out of scope" boundary in CLAUDE.md — approved because the funnel's emotional peak depends on a real submission. `resend` + `supabase` are already installed.

**Prompt:**
```
Invoke claude-api only if touching AI; otherwise standard Next route-handler work.

Wire the /contact submission to a real backend so the funnel climax corresponds to a captured order:
1. Add a Next App Router route handler (app/api/contact/route.ts) that validates the same zod schema server-side, sends the order via Resend to the studio inbox, and (optionally) records it in Supabase. Never expose RESEND_API_KEY / SUPABASE_SECRET_KEY to the client — server-only env, per CLAUDE.md rule 9.
2. Rework contact-form.tsx onSubmit: POST to the route handler with react-hook-form's isSubmitting state; on success return to an ON-PAGE success state (the visitor stays on /contact — no mailto navigation). On failure, show an inline error and DO NOT fire CONFIRMED.
3. The success response is the single trigger the Stage 5 CONFIRMED climax hooks into (expose it so the TicketProvider's inkSlot('CONFIRMED') + tear-off fire from the resolved success, not from the click). Keep the dish preselect (?dish=) and the existing chips/validation UX.
4. Basic hardening: honeypot or minimal rate-limit, graceful error if Resend fails, keep the form fully keyboard/SR-operable.

Reduced motion / no-JS sanity: the form still submits and shows a success state without any animation; CONFIRMED is decorative on top of a real success, never a substitute for it.
```
**Acceptance check:** submitting /contact with a valid email actually delivers an email (and/or a Supabase row); the visitor stays on the page and sees a real success state; secrets never reach the client; failure shows an inline error and does NOT fire CONFIRMED; the success resolution is what Stage 5 will hang the stamp + tear-off on.

---

## Stage 5 — Signature moment #3: the cross-page printing ticket

**Why:** ties the whole *funnel* together and gives `/contact` a memorable climax. This is the most at-risk device — it now lives on **every** route, so cheapness, restraint, and never-in-the-way are non-negotiable.

> **Depends on Stage 4.8.** `CONFIRMED` fires from the **backend success resolution** of the contact submit (Stage 4.8), as the on-page success state — never from the raw click, and never over a mailto. Validation/transport failure must not ink `CONFIRMED`.

> **Re-scoped for multipage (see decisions #2–4).** The old per-section docket on one long page is gone. The ticket is now a persistent cross-route device whose state lives in `sessionStorage` and inks per funnel touchpoint.

**Prompt:**
```
Invoke gsap-react, gsap-scrolltrigger, gsap-core, and gsap-performance (a persistent cross-route device is the most at-risk for jank/cost — keep it cheap; pause all work when off-screen/retracted).

Build a thermal kitchen ticket that persists across the whole funnel and prints as the visitor moves through it:
- Placement: a right-edge rail hanging down from just below the fixed nav, like paper from an off-screen printer (~180px wide). Real receipt styling: monospace, perforated/torn top edge (vector edge asset), faint thermal-paper texture (procedural SVG + the shared raster paper-fibre tile, multiply ~8%), slight curl shadow as a separate CSS layer. It feeds DOWNWARD as lines ink.
- It MUST auto-retract/fade when the footer scrolls into view so it never fights the footer or the CTA, and never overlaps the reading column.
- State model (sessionStorage, restored instantly on return/refresh — no re-animation of already-inked lines):
  Fixed slots pre-printed faint, in funnel order: SEATED (home) · SIGNATURE (/work) · THE RECIPE (/about, optional) · THE MENU (/menu) · CONFIRMED (/contact submit).
  Each line inks when the visitor reaches that route AND scrolls past that page's key section — INDEPENDENTLY and ORDER-FREE (deep-linking /menu first still inks THE MENU even if SEATED isn't inked yet). No forced sequence, no backfill. EXCEPTION: THE MENU inks on ARRIVAL at /menu (not scroll), because pricing renders fully open on arrival.
  Architecture: a TicketProvider in app/layout.tsx owns inked-slot state + sessionStorage + renders the rail (stays mounted across nav). Each page drops an invisible <TicketBeacon slot="…" /> at its key section; a one-shot ScrollTrigger on the beacon calls inkSlot(). THE MENU inks from the provider on /menu arrival; CONFIRMED is fired imperatively from the /contact submit handler. The Ticket never reaches into another page's markup.
  When a line inks: the paper feeds down a few mm and the line stamps in (optionally the existing plating tick sound).
- Climax: CONFIRMED inks ONLY from the Stage 4.8 backend SUCCESS resolution of a real /contact submit (not the raw click; a validation/network failure must not ink it) — the full ticket finishes, a "TABLE 01 — CONFIRMED" stamp presses on at an angle (ink-press scale+settle), and the ticket tears off. It fires on-page as the success state, with the visitor still on /contact.
- Mobile: collapse to a compact pill bottom-right showing progress (e.g. 2/4); expand the full ticket on tap. Never cover the CTA.

Respect prefers-reduced-motion (lines appear instantly, no feed/print animation; stamp appears without the press). Don't autoplay sound; keep the existing mute toggle.

Accessibility (verify in THIS stage): the ticket is decorative — aria-hidden if purely ornamental, must never trap focus, must never block interaction with the real content or CTA behind it on any route, and must be fully ignorable by screen readers.
```
**Acceptance check:** the ticket hangs on the right-edge rail and inks the correct line on each route when you scroll past its key section, in any visit order; state survives navigation and refresh without re-animating; it retracts at the footer and never covers the CTA; `CONFIRMED` stamp lands on real submit and tears off; mobile pill stays out of the way; sound stays opt-in; never traps focus or obscures content on any route; reduced-motion shows lines instantly.

---

## Stage 6 — Editorial layout tension (the "safe" sections + the pricing grid)

**Why:** Trust, Why, Pantry, **and the `TierGrid` itself** are currently symmetrical lists/cards. This is where "playing it safe" lives — and the grid is the worst offender, because it's the MVP yet would otherwise be the *plainest* thing on `/menu`, sandwiched between two now-bespoke sections.

> **Multipage note:** these sections span **two routes** — `Trust` is on **home**; `Why` (`#why`), the **`TierGrid`** (`#menu`), and `Pantry` (`#details`) are on **`/menu`**. Treat them as one editorial system across both routes.
>
> **The `TierGrid` is now in scope (decision: 2026-05-30 grilling pass).** Only the `TIERS` *data* is frozen; the card layout gets the editorial + material treatment so pricing reads as the hero of its page. **The Chef's Table tier must visually dominate** — larger footprint, asymmetric, leading the eye to the flagship — *not* three equal peers. (No uniform grids.)

**Prompt:**
```
Invoke taste-skill, frontend-design, ui-ux-pro-max, and design-system (so the editorial type scale + baseline grid stay token-driven, not hardcoded).

Re-lay-out the Trust (on /), Why (the short menu, on /menu), Pantry (always included, on /menu), AND the TierGrid pricing (on /menu) sections to break the safe, centered, symmetrical grid — without changing any copy OR the TIERS data (names, prices, CTA targets stay sourced from the TIERS array):
- Introduce asymmetry and a broken/editorial grid: offset columns, intentional overlap, oversized course numbers bleeding off the edge, type that aligns to a real baseline grid.
- TierGrid specifically: the Chef's Table tier VISUALLY DOMINATES — larger footprint / asymmetric span, leading the eye to the flagship; À la carte and Tasting Menu are clearly subordinate, NOT equal-width peers. Keep the gold flag + shimmer. The grid must read as the strongest, most bespoke thing on /menu, not the plainest. No uniform 3-column grid.
- Use the display + serif fonts at genuinely large editorial sizes for one hero number/word per section (kinetic on scroll).
- Add full-bleed or edge-anchored texture/spotlight moments so these don't read as plain rows.
- Use the script font as a deliberate flourish in 1-2 spots (not decoration everywhere).
- Keep it readable and grid-disciplined — editorial tension, not chaos. Match the cinematic duotone material from Stage 1.
- Keep all four sections feeling like one studio's editorial system even though they live on two routes.

Show me before/after for each section.
```
**Acceptance check:** none of the four sections is a plain centered list/grid anymore; the `TierGrid` reads as the bespoke hero of `/menu` with the **Chef's Table visually dominant** (not three equal cards); prices still come from the `TIERS` array; clear visual hierarchy and one big editorial moment per section; the system reads as coherent across home and `/menu`; still readable.

---

## Stage 7 — Polish, performance & QA (verification)

**Prompt:**
```
Invoke gsap-performance and seo-unlighthouse.

Do a final pass ACROSS EVERY ROUTE (/, /work, /menu, /about, /contact):
- Performance: lazy-init shaders/WebGL, pause off-screen animations (including the ticket when retracted), ensure no layout thrash; target Lighthouse performance 90+ on desktop per route. Score with seo-unlighthouse (scripted, not eyeballed) and diff the final JS bundle against the Pre-flight baseline to confirm the ≤150KB JS budget held; confirm the raster paper tile is lazy and ≤~40KB.
- Routing motion: navigate every path repeatedly (incl. back/forward) — no ScrollTrigger leaks, stale pins, or duplicate inits; the unfold transition never flashes a blank /menu; the ticket state stays correct and never double-animates.
- Verify prefers-reduced-motion across EVERY new animation (hero, scrub, unfold transition, cross-page ticket, reveals, spotlight) — nothing should move; clicking the closed menu still reaches /menu.
- Mobile QA at 375px and 768px AND on a real low-end Android device (not just a narrow viewport): hero, the closed-menu→/menu transition, process scrub, ticket pill all behave and hold framerate.
- Accessibility: focus states, headings order, alt text, the menu path and ticket are operable/ignorable without the animation, color contrast on body copy, the ticket never traps focus on any route.
- Take full-page screenshots of every route at desktop and mobile and show me, plus a short list of anything still rough.
```
**Acceptance check:** screenshots look premium top to bottom on every route; routing motion is leak-free; reduced-motion and mobile both clean everywhere; Lighthouse perf 90+ per route.

---

## Stage 8A — Content completion (run after Stage 7)

**Why:** Stage 7 QA locks the visual. Before SEO runs, the content it's indexing needs to be real. `/work` is done ✅. `/about` needs a real bio. `/journal` isn't ready — noindex it cleanly so Google doesn't crawl empty slugs and tank domain trust.

> **Status:** `/work` case study content added ✅. Remaining: `/about` bio + `/journal` noindex. **Resend is NOT yet wired** — `/contact` still hands off via `mailto:` (no `app/api/contact`); whether to build the real backend is the deferred **Stage 4.8 gate** decision (see Stage 4.8).

**Prompt:**
```
Two content tasks — no visual redesign:

1. FINALIZE /about (chef-full.tsx): replace all placeholder copy with the real chef bio. Keep the existing layout, typography, and motion classes from Stage 3 — only the text changes. If a portrait image is now available, swap the Stage 3.5 brass-monogram placeholder for it (same slot, same sizing constraints). If not, leave the monogram — do not add a new placeholder.

2. NOINDEX /journal and /journal/[slug]: add a <meta name="robots" content="noindex, nofollow" /> to the journal route's layout or page metadata (Next.js generateMetadata or a layout.tsx export). Confirm with a curl / response header check that the tag is present. Do NOT add any visible UI change — the pages look the same, they just stop being indexed.

Do not touch any other route. No motion changes, no layout changes.
```
**Acceptance check:** `/about` displays real bio copy (no Lorem ipsum, no "coming soon"); portrait or monogram renders cleanly in its slot; `/journal` and `/journal/[slug]` return `X-Robots-Tag: noindex` or the meta tag is present in the HTML; all other routes unaffected; `npm run build` clean.

---

## Stage 8B — SEO & discoverability (run after Stage 8A)

**Why:** the visual is locked, the content is real — now make it findable. A portfolio that can't be Googled or shared with a rich preview is half-finished. The SEO skills are already installed (`seo-technical`, `seo-schema`, `seo-sitemap`, `seo-unlighthouse`).

> **Scope:** five funnel routes only (`/`, `/work`, `/menu`, `/about`, `/contact`). `/journal` is noindexed — exclude from sitemap. Ancillary slugs (`/work/[slug]`, `/journal/[slug]`) inherit the noindex or get their own per-slug meta via `generateMetadata`.

**Prompt:**
```
Invoke seo-technical, seo-schema, seo-sitemap, and seo-unlighthouse.

Make the five funnel routes discoverable and shareable without touching layout, motion, or copy:

1. PER-ROUTE META (app/layout.tsx + per-route generateMetadata):
   - Unique <title> and <meta name="description"> for each of /, /work, /menu, /about, /contact.
   - <link rel="canonical"> on every route.
   - Open Graph: og:title, og:description, og:url, og:image (see item 2), og:type (website for most; article for /work if a case study).
   - Twitter card: summary_large_image, twitter:title, twitter:description, twitter:image.
   - Keep Next.js Metadata API — do not add raw <head> tags in JSX.

2. OG IMAGES (one per funnel route, 1200×630):
   - Generate via Next.js Route Handlers (app/opengraph-image.tsx pattern) or static exports — whichever is simpler.
   - Each image uses the duotone palette (charcoal/ember/brass), the Jawad Design wordmark, and a route-specific headline (e.g. "/" → "One chef. One ticket.", "/menu" → "Three ways to dine.", "/work" → the case study title). Grain overlay. Dark-only.
   - These are static assets (or edge-generated), NOT screenshots of the live page.

3. STRUCTURED DATA (JSON-LD, injected via <script type="application/ld+json"> in generateMetadata or a Server Component):
   - / and /menu: LocalBusiness + Service schema (studio name, service types, price range, URL).
   - /about: Person schema (chef name, same-as links if any social profiles exist).
   - /work: CreativeWork or Article schema for the case study.
   - /contact: no schema needed.
   - Validate with Google's Rich Results Test URL before marking done.

4. SITEMAP + ROBOTS:
   - app/sitemap.ts: include /, /work, /menu, /about, /contact. Exclude /journal, /journal/[slug], /work/[slug] placeholders (or include /work/[slug] only if real content exists). Set lastmod and priority.
   - app/robots.ts: Allow all funnel routes. Disallow /journal and /journal/[slug]. Point to the sitemap URL.

5. FAVICON + WEB MANIFEST:
   - app/favicon.ico: replace the Next.js default with the brass/ember Jawad Design mark (SVG source → generate .ico + 192px + 512px PNG).
   - app/manifest.ts (or manifest.json): name, short_name, theme_color (#1a1510 charcoal), background_color, icons array. Link from layout.tsx.

6. ANALYTICS:
   - Install @vercel/analytics (npm install @vercel/analytics) and add <Analytics /> to app/layout.tsx. One import, one component — no config needed. Confirm it fires on route change (App Router compatible).

7. LIGHTHOUSE FINAL PASS (per seo-unlighthouse):
   - Re-run scripted Lighthouse on all five funnel routes after the above.
   - Target: Performance ≥ 90, SEO = 100, Accessibility ≥ 90 on desktop per route.
   - Report scores; flag anything below target with a fix or an explicit "known limitation."

Do not change copy, layout, motion, or any existing component logic.
```
**Acceptance check:** every funnel route has unique title/description/canonical; pasting any funnel URL into Twitter/Slack/iMessage renders a branded OG card with the correct image; Google Rich Results Test validates structured data on /, /about, /work; sitemap.xml lists the five funnel routes and nothing else; robots.txt disallows /journal; favicon is the studio mark (not the Next.js default); Vercel Analytics fires on route change in the Network tab; Lighthouse SEO = 100 on every funnel route; `npm run build` clean.

---

## Suggested order if you can't do it all at once
0. Pre-flight always runs first — it's cheap and everything else depends on it. (Mostly done; finish per-route baselines + the raster paper tile.)
1. Stage 0 (finish routing-hardening) → 1 → 2 ✅ (foundation + material + hero) gets you 70% of the perceived jump.
2. Stage 3 (motion baseline across all routes + process scrub — incl. giving the Process right-half a job).
3. **Stage 3.5 (tonal unification + material visibility + chef-placeholder kill).** Cheapest big win on the board; do it before any signature moment. The chef-placeholder kill (item 5) is urgent enough to pull forward even if the rest of 3.5 waits — a "coming soon" box undercuts everything Stages 4–7 are trying to earn. 3.5 also de-risks Stage 4: the closed-menu cover only reads if the room is already dark.
4. **Stage 3.7 (route-transition overlay + baseline veil).** Build the shared overlay here so Stage 4 reuses it — and so the funnel stops feeling like one nice door among hard cuts.
5. Stage 4 → 4.8 (wire the contact backend) → 5 (the menu transition reuses the 3.7 overlay; the ticket's CONFIRMED climax hangs off the 4.8 success state).
6. Stage 6 (layout — incl. the Chef's-Table-dominant grid) and 7 (QA).
7. **Stage 8A (content)** — finalize `/about` bio + noindex `/journal`. Runs after Stage 7 so you're not polishing placeholder copy during visual work.
8. **Stage 8B (SEO & discoverability)** — after 8A, because OG images should reflect the final design and Lighthouse scores from Stage 7 are the baseline to beat. (The contact backend / Resend is the open **Stage 4.8** gate decision — not yet wired.)

> **The headline of the audit:** don't add a third or fourth signature moment until the room is dark top-to-bottom (Stage 3.5) and the chef isn't "coming soon." Spectacle stacked on an inconsistent base just makes the inconsistency more expensive.

## Reference benchmarks to study before building
- **Arnaud Rocca**, **Corentin Bernadou**, **R—K '26**, **Joffrey Spitzer** portfolios (Codrops breakdowns) — for the GSAP + Lenis + masked-reveal + scrub language, and for **page-transition** craft (relevant to the Stage 4 unfold-as-navigation).
- **Restaurant GEM**, **Storstad** (Awwwards) — for warm fine-dining atmosphere and inline menu interaction.
- **21st.dev** — Scroll Animation, Animated Hero, and Marquee component categories for ready patterns to adapt (not copy wholesale).
