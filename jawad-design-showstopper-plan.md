# Jawad Design — Show-Stopper Implementation Plan

**Goal:** take the current site from ~5.5/10 ("good developer") to a screenshotted, premium, bespoke portfolio that justifies the Chef's Table price.

**Locked direction**
- **Motion ceiling:** GSAP + ScrollTrigger + SplitText + Lenis, plus *light* WebGL accents (one or two shader spots, never page-wide 3D).
- **Material:** Cinematic duotone — high-contrast ember-on-charcoal, film-noir spotlighting, heavy shadow, grain, candlelit warmth.
- **Scope:** Staged. Keep the structure and copy (the writing is the strongest thing here). Transform motion, material, and three distributed signature moments. Approve each stage before the next.
- **Three signature moments, distributed (not stacked):**
  1. **The Pass / plating hero** — top of page.
  2. **Cover-to-menu 3D unfold** — mid page (Menu section).
  3. **Printing order ticket** — persistent scroll device, climaxing at the CTA.
  - Plus: the five-course Process becomes a *true* cinematic pinned scrub (part of the motion baseline, not a fourth signature).

**Environment (read first):** these skills are installed as **project skills** in `jawad-designs/.claude/skills/`. They only load when you run **Claude Code with `jawad-designs/` as the working directory** (the real Next app + CLAUDE.md live there, not the parent folder). Before starting, `git add .claude` and commit it — it's currently untracked, so the skill set isn't yet reproducible.

**Skills available locally** (reference them by name so they trigger):
- **Motion:** `gsap-react` (lead with this — the codebase uses `useGSAP` from `@gsap/react`), `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins` (ScrollTrigger / SplitText / ScrollSmoother specifics), `gsap-performance` (drives the perf budget), `gsap-utils`, `gsap-frameworks`.
- **Design/material:** `taste-skill`, `redesign-skill`, `frontend-design`, `ui-styling`, `ui-ux-pro-max`, `design-system`, `brandkit`, `brutalist-skill`/`minimalist-skill` (direction reference only).
- **Assets:** `imagegen-frontend-web` (visual reference frames), `image-to-code-skill` (turn those frames into components).
- **QA/perf/SEO:** `seo-unlighthouse` (Lighthouse scoring for the perf budget + Stage 7), plus the `seo-technical` / `seo-schema` / `seo-sitemap` suite for discoverability (out of motion scope, but a portfolio needs to be found — schedule after Stage 7).

> See `SKILL-STAGE-MAP.md` for the exact skill→stage mapping.

> **How to use this doc:** work top to bottom. Each stage has a single copy-paste prompt and an acceptance check. Don't start a stage until the previous one passes its check. Run each stage as its own Claude Code session (`/clear` + `git tag stage-N` between stages) to keep context clean and rollback cheap.

---

## Global constraints (apply to EVERY stage — not just QA)

- **Performance budget (hard limits, checked at every acceptance step):** added JS ≤ ~150KB gzipped over baseline; Largest Contentful Paint ≤ 2.5s on desktop, ≤ 4s on mid-tier mobile; sustained 60fps on desktop, no worse than 30fps on a low-end Android during any animation. If a stage blows the budget, fix it before moving on — do not defer to Stage 7.
- **Cumulative motion discipline:** every new moment competes for attention with the others and with the actual goal (justifying the Chef's Table price). Prefer fewer, sharper moments over more. The printing-ticket device is the most at-risk of becoming distracting — watch it closely.
- **Kill criteria:** if a signature moment doesn't clearly land at its acceptance check, cut it rather than polishing a gimmick. A clean static section beats a half-working effect.
- **Rollback:** branch/tag per stage (e.g. `git tag stage-2-hero`) so a failed stage is cheap to abandon without unwinding later work.
- **SplitText is free — no fallback needed.** As of GSAP 3.13 (April 30 2025, post-Webflow), the entire toolset including SplitText is free for commercial use. Your `gsap@^3.15.0` already includes it, and SplitText was rewritten with native screen-reader accessibility and built-in masking for reveal effects — use the new masking API directly. The old "hand-rolled split / Splitting.js fallback" hedging is obsolete; drop it.

---

## Pre-flight (do BEFORE Stage 0 — no design changes)

**Why:** you can't tell if a stage succeeded without a baseline, the perf budget needs to be live from the first commit, and the material/signature stages need source assets ready.

**Prompt:**
```
Before any redesign work:
1. Capture full-page baseline screenshots at desktop (1440px), tablet (768px), and mobile (375px), plus a current Lighthouse performance score. Save these as the "before" reference.
2. Confirm SplitText imports and runs from the installed gsap package (it's free as of 3.13 / your 3.15) — do a one-line smoke test. No fallback needed.
3. Set up the visual assets we'll need: plate/charger, warm spotlight pool, paper/printed-card texture, brass crest, garnish flourish, thermal-paper texture, film grain. Generate or source these now (invoke imagegen-frontend-web; then image-to-code-skill where a frame should become a component) so later stages aren't blocked waiting on art.
4. Establish the performance budget as a checklist we re-run each stage (added JS weight, LCP, FPS). Wire seo-unlighthouse so the Lighthouse number is scriptable, not eyeballed, and capture the baseline JS bundle size now so every later stage can diff against it.

Do not change any visible design. Output: baseline screenshots, SplitText smoke-test result, an asset inventory, and the perf checklist (Lighthouse + bundle-size baseline recorded).
```
**Acceptance check:** baseline screenshots + Lighthouse score saved; SplitText status known with a fallback decided; all signature-moment assets exist; perf budget written as a reusable checklist.

---

## What's already good — do NOT break
- All copy and the kitchen metaphor (hero, five courses, openable menu, order docket, honest empty guestbook).
- The palette tokens (`--char`, `--bone`, `--ember`, `--brass`, `--gold`) — we deepen them, not replace them.
- Section order and information architecture.
- `prefers-reduced-motion` handling — keep and extend it to every new animation.

## The current weaknesses each stage fixes
| Weakness | Score | Fixed in |
|---|---|---|
| Motion is IO-reveal + fake scrub only | 5/10 | Stage 0, 3 |
| Zero texture/material (smooth gradients) | 4/10 | Stage 1 |
| Hero is one-shot CSS letter drop | 5/10 | Stage 2 |
| Menu is 3 static cards | — | Stage 4 |
| Docket is a passive checklist | — | Stage 5 |
| Safe, symmetrical layout below hero | 5/10 | Stage 6 |
| Conservative type *use* | 6/10 | Stage 1, 6 |

---

## Stage 0 — Motion foundation (do this first, ship nothing visible)

**Why:** every later stage depends on the animation stack being in place and reduced-motion-safe.

**Prompt:**
```
Invoke gsap-react (primary — this codebase uses useGSAP from @gsap/react), gsap-core, and gsap-scrolltrigger.

Set up the animation foundation for this site without changing any visible design yet:
1. Add GSAP with the ScrollTrigger and SplitText plugins.
2. Add Lenis for smooth scrolling and sync it to GSAP's ScrollTrigger (lenis.on('scroll', ScrollTrigger.update) and gsap.ticker drive).
3. Create one central place where animations register, and a single `prefers-reduced-motion` guard that disables Lenis and all scroll-driven tweens, falling back to instant/opacity-only states.
4. Replace the existing IntersectionObserver `.reveal` system with a GSAP ScrollTrigger batch that does masked line/element reveals, so I have one motion system instead of two.

Do not redesign anything visually in this step. Confirm scroll feels smooth and reduced-motion fully disables it.
```
**Acceptance check:** page scrolls with Lenis smoothness; reveals still fire; turning on OS "reduce motion" disables smooth scroll and all tweens with no broken layout.

---

## Stage 1 — Cinematic duotone material pass

**Why:** this is the single biggest "bespoke vs generic" lever. Kills the flat-gradient feeling.

**Prompt:**
```
Invoke taste-skill, redesign-skill, and ui-styling (for the layered shadow/letterpress/emboss treatment).

Give the whole site a cinematic duotone, film-noir-kitchen material treatment while keeping the existing charcoal/ember/brass/gold tokens:
- Add a subtle film-grain / noise overlay across the page (SVG or canvas, ~3-5% opacity, blended).
- Add a global vignette and a warm, candlelit radial "spotlight" that subtly follows scroll position (and optionally cursor on desktop), so sections feel lit, not filled.
- Replace flat gradient panels with layered depth: directional shadow, ember rim-light on key edges, brass hairline letterpress (inset shadow) on dividers and the menu card.
- Increase contrast toward ember-on-char drama; deepen blacks, push highlights warm.
- Treat brass/gold text as embossed (subtle dual text-shadow) rather than flat fills.

Keep it tasteful and legible — this is fine dining, not a haunted house. Respect prefers-reduced-motion for the spotlight (make it static).
```
**Acceptance check:** screenshots feel *lit and tactile*; no section looks like a flat color block; text contrast still passes ~4.5:1 on body copy.

---

## Stage 2 — Signature moment #1: The Pass / plating hero (light WebGL)

**Why:** the first 3 seconds. This is the screenshot.

**Prompt:**
```
Invoke gsap-react, gsap-timeline, gsap-core, gsap-plugins (for SplitText), and gsap-performance (the WebGL shader must stay inside the JS/FPS budget).

Rebuild the hero as "The Pass — a plated dish under the spotlight":
- A dark spotlit stage. An empty plate/charger sits center under a warm pool of light.
- On load, run a plating timeline: the spotlight blooms, the plate settles, "I serve" rises and "websites." plates letter-by-letter with a masked reveal (use SplitText), steam curls up, a brass garnish flourish (the Pinyon script) sweeps in. Choreograph it as one GSAP timeline, ~1.6s, with real easing — not independent CSS delays.
- Add a LIGHT WebGL accent only behind the plate: a heat-shimmer / grain shader (a single full-rect fragment shader, low cost, paused off-screen and under reduced-motion). No 3D models. Keep total added JS lean.
- The sub-headline and the two CTAs fade in last.
- On scroll out, the spotlight dims and the plate lifts away slightly (parallax).

Mobile: drop the shader to a static grain image, keep the plating timeline simplified.
```
**Acceptance check:** hero plays as one choreographed sequence; shader runs at 60fps on desktop and is absent/static on mobile + reduced-motion; the headline is the clear focal point.

---

## Stage 3 — Motion baseline everywhere + true Process scrub

**Why:** makes the *whole* page feel alive and fixes the weakest interaction (the snap-between-states process).

**Prompt:**
```
Invoke gsap-react, gsap-scrolltrigger, gsap-timeline, gsap-plugins (SplitText line masking), and gsap-performance (pinned scrub must not drop frames).

Two things:

A) Apply a consistent scroll-motion language to every section using ScrollTrigger:
- Masked line reveals on every heading (SplitText, lines wipe up behind a mask).
- Staggered entrance on cards/rows with subtle y + opacity + a touch of scale.
- Light parallax depth between background texture, mid-ground, and foreground type.
- A scrubbed brass hairline that "draws" across section breaks.

B) Rebuild the five-course Process section as a TRUE pinned cinematic scrub (replace the current rAF snap):
- Pin the section, scrub a GSAP timeline tied to scroll progress.
- As you scrub through days 1→5, the "Now serving" day counter, the pips, and the course cards cross-fade continuously (not discrete jumps).
- Add per-day atmosphere: heat/steam intensifies, the spotlight shifts, a garnish detail changes per course.
- Make it feel like watching a dish being cooked frame by frame.

Everything must degrade to static stacked content under prefers-reduced-motion.
```
**Acceptance check:** scrubbing the process is continuous and cinematic; every heading reveals with a masked wipe; reduced-motion shows clean static content.

---

## Stage 4 — Signature moment #2: cover-to-menu 3D unfold

**Why:** mid-page wow that doubles as the pricing reveal.

**Prompt:**
```
Invoke gsap-react, gsap-timeline, taste-skill, and ui-ux-pro-max (the fold must stay keyboard/SR-operable — see the in-stage a11y requirement).

Turn the Menu section's existing openable card into a real folded menu that unfolds in 3D:
- Start as a closed, textured printed card (paper grain, brass crest, letterpress title) sitting under the spotlight.
- When it scrolls into view (and on click), it unfolds with CSS 3D transforms + GSAP: the cover lifts/rotates on a hinge, an inner spread opens with believable paper physics (easing, slight overshoot, a soft drop shadow that tracks the fold).
- The three tiers (À la carte / Tasting Menu / Chef's Table) are revealed on the inner spread as the fold completes, staggered like ink settling.
- Chef's Table gets the gold treatment and a subtle shimmer.
- Add paper texture and a faint deckled edge so it reads as printed stock, not a div.

Keep it performant (transform/opacity only). Reduced-motion: show the menu already open, no fold.

Accessibility (verify in THIS stage, not Stage 7): the menu must be fully operable by keyboard and screen reader — tiers reachable and readable with the fold disabled; the unfold is decorative, not load-bearing for the content.
```
**Acceptance check:** the unfold reads as physical paper; tiers are legible after the fold; no layout shift; reduced-motion shows it open; tiers are keyboard/SR-accessible without the animation.

---

## Stage 5 — Signature moment #3: the printing order ticket

**Why:** ties the whole journey together and gives the CTA a memorable climax.

**Prompt:**
```
Invoke gsap-react, gsap-scrolltrigger, gsap-core, and gsap-performance (the persistent device is the most at-risk for jank/cost — keep it cheap).

Upgrade the existing order docket into a thermal kitchen ticket that physically prints as you scroll:
- Style it as a real receipt: monospace, perforated/torn top edge, faint thermal-paper texture, slight curl shadow.
- As you pass each section (Seated → Signature dish → The recipe → The menu → Order placed), a new line "prints": the paper feeds down a few mm with a subtle motion and the line stamps in, optionally with the existing plating tick sound.
- At the CTA section, the full ticket finishes printing, a "TABLE 01 — CONFIRMED" stamp presses on at an angle (ink-press scale+settle), and the ticket tears off.
- Keep it unobtrusive on the side; collapse to a compact pill on mobile that expands on tap.

Respect prefers-reduced-motion (lines appear instantly, no feed animation). Don't autoplay sound; keep the existing mute toggle.

Accessibility (verify in THIS stage): the ticket is decorative — it must not trap focus, must be hideable/ignorable by screen readers (aria-hidden if purely ornamental), and must never block interaction with the real content or CTA behind it.
```
**Acceptance check:** ticket feeds and stamps believably; the CTA "confirmed" stamp lands; mobile stays out of the way; sound stays opt-in; ticket never traps focus or obscures the CTA.

---

## Stage 6 — Editorial layout tension (the "safe" sections)

**Why:** Trust, Why, and Pantry are currently symmetrical lists. This is where "playing it safe" lives.

**Prompt:**
```
Invoke taste-skill, frontend-design, ui-ux-pro-max, and design-system (so the editorial type scale + baseline grid stay token-driven, not hardcoded).

Re-lay-out the Trust, Why (the short menu), and Pantry (always included) sections to break the safe, centered, symmetrical grid — without changing the copy:
- Introduce asymmetry and a broken/editorial grid: offset columns, intentional overlap, oversized course numbers bleeding off the edge, type that aligns to a real baseline grid.
- Use the display + serif fonts at genuinely large editorial sizes for one hero number/word per section (kinetic on scroll).
- Add full-bleed or edge-anchored texture/spotlight moments so these don't read as plain rows.
- Use the script font as a deliberate flourish in 1-2 spots (not decoration everywhere).
- Keep it readable and grid-disciplined — editorial tension, not chaos. Match the cinematic duotone material from Stage 1.

Show me before/after for each of the three sections.
```
**Acceptance check:** none of the three sections is a plain centered list anymore; there's clear visual hierarchy and one big editorial moment per section; still readable.

---

## Stage 7 — Polish, performance & QA (verification)

**Prompt:**
```
Invoke gsap-performance and seo-unlighthouse.

Do a final pass:
- Performance: lazy-init shaders/WebGL, pause off-screen animations, ensure no layout thrash; target Lighthouse performance 90+ on desktop. Score it with seo-unlighthouse (scripted, not eyeballed) and diff the final JS bundle against the Pre-flight baseline to confirm the ≤150KB budget held.
- Verify prefers-reduced-motion across EVERY new animation (hero, scrub, unfold, ticket, reveals) — nothing should move.
- Mobile QA at 375px and 768px AND on a real low-end Android device (not just a narrow viewport): hero, menu unfold, process scrub, ticket pill all behave and hold framerate.
- Accessibility: focus states, headings order, alt text, the menu/ticket are operable without the animation, color contrast on body copy.
- Take full-page screenshots at desktop and mobile and show me, plus a short list of anything still rough.
```
**Acceptance check:** screenshots look premium top to bottom; reduced-motion and mobile both clean; Lighthouse perf 90+.

---

## Suggested order if you can't do it all at once
0. Pre-flight always runs first — it's cheap and everything else depends on it.
1. Stage 0 → 1 → 2 (foundation + material + hero) gets you 70% of the perceived jump.
2. Stage 3 (motion baseline + process scrub).
3. Stage 4 and 5 (the other two signature moments).
4. Stage 6 (layout) and 7 (QA).

## Reference benchmarks to study before building
- **Arnaud Rocca**, **Corentin Bernadou**, **R—K '26**, **Joffrey Spitzer** portfolios (Codrops breakdowns) — for the GSAP + Lenis + masked-reveal + scrub language.
- **Restaurant GEM**, **Storstad** (Awwwards) — for warm fine-dining atmosphere and inline menu interaction.
- **21st.dev** — Scroll Animation, Animated Hero, and Marquee component categories for ready patterns to adapt (not copy wholesale).
