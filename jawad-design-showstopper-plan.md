# Jawad Design — Show-Stopper Implementation Plan

**Goal:** take the current site from ~5.5/10 ("good developer") to a screenshotted, premium, bespoke portfolio that justifies the Chef's Table price.

> **This plan is multipage-native.** It was originally written for the old single-scroll monolith. The home has since been **split into a multipage funnel** (`/`, `/work`, `/menu`, `/about`, `/contact`), and the persistent order Docket was removed in that split. Every stage below has been re-scoped for that reality — see **Architecture** and **Planning decisions locked** before starting.

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

---

## Planning decisions locked (2026-05-30 grilling pass)

These resolve the ambiguities the monolith plan left open once the site went multipage. They are the source of truth for Stages 4 and 5 and for asset fidelity.

1. **Signature #2 — menu.** Home `MenuPreview` becomes a **closed** folded menu under the spotlight that visibly promises *"pricing is inside."* Clicking it plays an **unfold-as-page-transition**: a full-bleed GSAP curtain unfolds, `router.push('/menu')` fires underneath, and the spread resolves onto the live pricing page — one continuous gesture, no flash. `/menu` **always renders pricing fully open** (instant for deep-links and reduced-motion). Reduced motion = instant nav to `/menu`, no unfold. Home no longer shows the flat `TierGrid` up front; the full `TierGrid` lives on `/menu`.
2. **Signature #3 — ticket.** A **cross-page funnel ticket** persisted in `sessionStorage`. **Right-edge rail**, hanging down from just below the nav like paper from an off-screen printer (~180px), feeding **downward** as lines ink; **auto-retracts/fades when the footer enters view** so it never fights the footer or CTA. **Mobile:** collapses to a tap-to-expand pill, bottom-right.
3. **Ticket trigger = scroll-earned + order-independent.** Fixed slots in funnel order, pre-printed faint, each inking when you reach its route **and** scroll past that page's key section — independently, so deep-linking `/menu` first still inks `THE MENU`. No forced sequence, no backfill. `CONFIRMED` fires **only** on a real `/contact` submit. State restores from `sessionStorage` instantly on return/refresh (no re-animation).
4. **Ticket slots (restores the original five-line docket poetry across the funnel):**
   `SEATED` (home) · `SIGNATURE` (`/work`) · `THE RECIPE` (`/about`, optional — inks if visited, never load-bearing) · `THE MENU` (`/menu`) · `CONFIRMED` (`/contact` submit). Core four are home/work/menu/contact; `/about` is the optional fifth.
5. **Paper fidelity = Hybrid (Option 1).** Keep the procedural SVG paper as the base, **plus one shared ~30KB lazy-loaded raster paper-fibre tile (WebP)** used as a low-opacity (`multiply`, ~8%) overlay on **both** the menu booklet and the thermal ticket — the micro-fibre detail `feTurbulence` can't fake. Vector emblems (brass crest, garnish, deckled/perforation edges) stay vector. Raster weight is off the JS budget, lazy, and off-LCP.

---

## Global constraints (apply to EVERY stage — not just QA)

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
- The shared `TierGrid` single-source — keep pricing defined once in `menu-full.tsx`.

## The current weaknesses each stage fixes
| Weakness | Score | Fixed in |
|---|---|---|
| Motion is IO-reveal + fake scrub only | 5/10 | Stage 0, 3 |
| Zero texture/material (smooth gradients) | 4/10 | Stage 1 |
| Hero is one-shot CSS letter drop | 5/10 | Stage 2 ✅ |
| Menu entry is a flat card grid, twice | — | Stage 4 |
| The "ticket" is just language, no device | — | Stage 5 |
| Safe, symmetrical layout (Trust / Why / Pantry) | 5/10 | Stage 6 |
| Conservative type *use* | 6/10 | Stage 1, 6 |
| Motion doesn't survive route changes | — | Stage 0, 7 |

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

**Prompt:**
```
Invoke gsap-react, gsap-scrolltrigger, gsap-timeline, gsap-plugins (SplitText line masking), and gsap-performance (pinned scrub must not drop frames).

Two things:

A) Apply ONE consistent scroll-motion language to every section on EVERY route using ScrollTrigger (it must survive client-side navigation — Stage 0 contract):
- Masked line reveals on every heading (SplitText, lines wipe up behind a mask).
- Staggered entrance on cards/rows with subtle y + opacity + a touch of scale.
- Light parallax depth between background texture, mid-ground, and foreground type.
- A scrubbed brass hairline that "draws" across section breaks.
- Each route gets a composed entrance for its lead heading (a real first impression on /work, /menu, /about, /contact — not a bare load).

B) Rebuild the five-course Process section (on HOME) as a TRUE pinned cinematic scrub (replace the current rAF snap):
- Pin the section, scrub a GSAP timeline tied to scroll progress.
- As you scrub through days 1→5, the "Now serving" day counter, the pips, and the course cards cross-fade continuously (not discrete jumps).
- Add per-day atmosphere: heat/steam intensifies, the spotlight shifts, a garnish detail changes per course.
- Make it feel like watching a dish being cooked frame by frame.
- The pin must release cleanly and refresh correctly when navigating away and back.

Everything must degrade to static stacked content under prefers-reduced-motion, on every route.
```
**Acceptance check:** scrubbing the home Process is continuous and cinematic and re-inits correctly after navigating away/back; every heading on every route reveals with a masked wipe; each route has a composed lead entrance; reduced-motion shows clean static content everywhere.

---

## Stage 4 — Signature moment #2: closed menu → unfold-as-page-transition

**Why:** the mid-funnel wow that doubles as the doorway to the pricing page. Pricing is the MVP, so the spectacle's *job* is to carry the visitor to `/menu` with intent — not to entertain in place.

> **Re-scoped for multipage (see decision #1).** The old "openable card in the menu section" no longer exists; the menu is a shared `TierGrid` shown on home and `/menu`. We do **not** unfold in both places (that stacks the wow and doubles the cost). Instead: home shows a **closed** menu; opening it **is** the transition to `/menu`.

**Prompt:**
```
Invoke gsap-react, gsap-timeline, taste-skill, and ui-ux-pro-max (the transition must stay keyboard/SR-operable — see the a11y requirement).

Rework the home MenuPreview into a CLOSED folded menu, and make opening it the page transition to /menu:
- Home MenuPreview is now a closed, textured printed menu under the spotlight: paper grain (procedural SVG base + the shared raster paper-fibre tile, multiply ~8%), brass crest, letterpress title, a faint deckled edge. It must clearly signal "open to see pricing" (an affordance: a "View the menu — pricing inside" cue, hover lift, a peek of an inner edge). It does NOT show the flat tier cards anymore.
- On click/Enter, play the unfold-as-transition: a full-bleed GSAP curtain unfolds the cover (CSS 3D transform on a hinge, believable paper physics — easing, slight overshoot, a soft drop shadow that tracks the fold) while router.push('/menu') fires underneath. The unfold covers the navigation so there is no flash; the inner spread resolves onto the live /menu pricing page. One continuous gesture: closed → unfold → standing on /menu looking at tiers.
- /menu ALWAYS renders pricing fully open (the shared TierGrid), instant for anyone who deep-links there directly. Chef's Table keeps the gold/flag treatment and a subtle shimmer.
- Handle route-readiness: preload /menu on hover/focus intent (next/link prefetch) and gate the unfold's resolve on the new route being painted, so the curtain never reveals a blank page. Keep a sane max-duration so it never feels stuck.
- transform/opacity only; pause/teardown cleanly.

Reduced motion: clicking the closed menu navigates straight to /menu (pricing shown), no unfold, no curtain.

Accessibility (verify in THIS stage, not Stage 7): the closed menu is a real link/button to /menu — fully keyboard and screen-reader operable; the unfold is decorative and must not gate reaching the pricing. /menu's tiers are reachable and readable with no animation at all.
```
**Acceptance check:** home shows a convincing closed printed menu that obviously promises pricing; clicking unfolds full-screen and lands you on `/menu` with tiers open, no blank-page flash; `/menu` deep-linked shows pricing instantly; reduced-motion goes straight to `/menu`; the path to pricing is fully keyboard/SR-operable without the animation; no layout shift.

---

## Stage 5 — Signature moment #3: the cross-page printing ticket

**Why:** ties the whole *funnel* together and gives `/contact` a memorable climax. This is the most at-risk device — it now lives on **every** route, so cheapness, restraint, and never-in-the-way are non-negotiable.

> **Re-scoped for multipage (see decisions #2–4).** The old per-section docket on one long page is gone. The ticket is now a persistent cross-route device whose state lives in `sessionStorage` and inks per funnel touchpoint.

**Prompt:**
```
Invoke gsap-react, gsap-scrolltrigger, gsap-core, and gsap-performance (a persistent cross-route device is the most at-risk for jank/cost — keep it cheap; pause all work when off-screen/retracted).

Build a thermal kitchen ticket that persists across the whole funnel and prints as the visitor moves through it:
- Placement: a right-edge rail hanging down from just below the fixed nav, like paper from an off-screen printer (~180px wide). Real receipt styling: monospace, perforated/torn top edge (vector edge asset), faint thermal-paper texture (procedural SVG + the shared raster paper-fibre tile, multiply ~8%), slight curl shadow as a separate CSS layer. It feeds DOWNWARD as lines ink.
- It MUST auto-retract/fade when the footer scrolls into view so it never fights the footer or the CTA, and never overlaps the reading column.
- State model (sessionStorage, restored instantly on return/refresh — no re-animation of already-inked lines):
  Fixed slots pre-printed faint, in funnel order: SEATED (home) · SIGNATURE (/work) · THE RECIPE (/about, optional) · THE MENU (/menu) · CONFIRMED (/contact submit).
  Each line inks when the visitor reaches that route AND scrolls past that page's key section — INDEPENDENTLY and ORDER-FREE (deep-linking /menu first still inks THE MENU even if SEATED isn't inked yet). No forced sequence, no backfill.
  When a line inks: the paper feeds down a few mm and the line stamps in (optionally the existing plating tick sound).
- Climax: CONFIRMED inks ONLY on a real /contact form submit — the full ticket finishes, a "TABLE 01 — CONFIRMED" stamp presses on at an angle (ink-press scale+settle), and the ticket tears off.
- Mobile: collapse to a compact pill bottom-right showing progress (e.g. 2/4); expand the full ticket on tap. Never cover the CTA.

Respect prefers-reduced-motion (lines appear instantly, no feed/print animation; stamp appears without the press). Don't autoplay sound; keep the existing mute toggle.

Accessibility (verify in THIS stage): the ticket is decorative — aria-hidden if purely ornamental, must never trap focus, must never block interaction with the real content or CTA behind it on any route, and must be fully ignorable by screen readers.
```
**Acceptance check:** the ticket hangs on the right-edge rail and inks the correct line on each route when you scroll past its key section, in any visit order; state survives navigation and refresh without re-animating; it retracts at the footer and never covers the CTA; `CONFIRMED` stamp lands on real submit and tears off; mobile pill stays out of the way; sound stays opt-in; never traps focus or obscures content on any route; reduced-motion shows lines instantly.

---

## Stage 6 — Editorial layout tension (the "safe" sections)

**Why:** Trust, Why, and Pantry are currently symmetrical lists. This is where "playing it safe" lives.

> **Multipage note:** these three sections now span **two routes** — `Trust` is on **home**; `Why` (the short menu, `#why`) and `Pantry` (always-included, `#details`) are on **`/menu`**. Treat them as one editorial system across both routes, not three rows on one page.

**Prompt:**
```
Invoke taste-skill, frontend-design, ui-ux-pro-max, and design-system (so the editorial type scale + baseline grid stay token-driven, not hardcoded).

Re-lay-out the Trust (on /), Why (the short menu, on /menu), and Pantry (always included, on /menu) sections to break the safe, centered, symmetrical grid — without changing the copy:
- Introduce asymmetry and a broken/editorial grid: offset columns, intentional overlap, oversized course numbers bleeding off the edge, type that aligns to a real baseline grid.
- Use the display + serif fonts at genuinely large editorial sizes for one hero number/word per section (kinetic on scroll).
- Add full-bleed or edge-anchored texture/spotlight moments so these don't read as plain rows.
- Use the script font as a deliberate flourish in 1-2 spots (not decoration everywhere).
- Keep it readable and grid-disciplined — editorial tension, not chaos. Match the cinematic duotone material from Stage 1.
- Keep the three sections feeling like one studio's editorial system even though they live on two routes.

Show me before/after for each of the three sections.
```
**Acceptance check:** none of the three sections is a plain centered list anymore; there's clear visual hierarchy and one big editorial moment per section; the system reads as coherent across home and `/menu`; still readable.

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

## Suggested order if you can't do it all at once
0. Pre-flight always runs first — it's cheap and everything else depends on it. (Mostly done; finish per-route baselines + the raster paper tile.)
1. Stage 0 (finish routing-hardening) → 1 → 2 ✅ (foundation + material + hero) gets you 70% of the perceived jump.
2. Stage 3 (motion baseline across all routes + process scrub).
3. Stage 4 and 5 (the menu transition + the cross-page ticket).
4. Stage 6 (layout) and 7 (QA).

## Reference benchmarks to study before building
- **Arnaud Rocca**, **Corentin Bernadou**, **R—K '26**, **Joffrey Spitzer** portfolios (Codrops breakdowns) — for the GSAP + Lenis + masked-reveal + scrub language, and for **page-transition** craft (relevant to the Stage 4 unfold-as-navigation).
- **Restaurant GEM**, **Storstad** (Awwwards) — for warm fine-dining atmosphere and inline menu interaction.
- **21st.dev** — Scroll Animation, Animated Hero, and Marquee component categories for ready patterns to adapt (not copy wholesale).
