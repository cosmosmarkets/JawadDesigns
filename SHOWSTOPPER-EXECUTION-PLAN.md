# Showstopper Execution Plan — Workflow-Orchestrated

> **On approval (execution step 0):** persist this document verbatim to
> `jawad-designs/SHOWSTOPPER-EXECUTION-PLAN.md`, `git add` it, then immediately run the
> **Pre-flight finish-up workflow** (design-neutral) and stop at the Pre-flight gate.
> This file (the plan-mode plan) and the repo doc are the same living artifact.

---

## Context — why this plan exists

`jawad-design-showstopper-plan.md` is the source-of-truth spec for taking the site from
"good developer" to a screenshotted, premium portfolio that justifies the Chef's Table
price. The earlier stages are committed (`5e261c1`, deployed) and `verify-stage3` passes —
**but a read-only audit (9-agent workflow, this session) found `verify-stage3` only ever
asserted *home*, and the truth is that Stages 1–3 are only fully realised on home.** What
remains is the back half of the funnel overhaul — the two distributed signature moments
(menu-unfold, cross-page ticket), the editorial layout pass, and final QA — **plus three
pieces of unfinished foundation the audit surfaced**:

1. **Pre-flight is not finished.** Per-route baselines (only home was captured) and the one
   raster paper-fibre tile (decision #5) are outstanding.
2. **Stage 0 routing-hardening is genuinely incomplete.** Route-change cleanup kills batches
   on `pathname` change (`smooth-scroll-provider.tsx`, `revertOnUpdate:true`), but there is
   **no `ScrollTrigger.refresh()` after nav, no `lenis.scrollTo(0)` reset, and `--jd-spot-y`
   never resets** — the spotlight trigger lives in a `[]`-dep `useGSAP` and persists across
   routes. The multipage motion contract is not yet satisfied.
3. **Stage 3 (and parts of Stages 1–2) shipped on home only — `stage3Complete: false`.**
   `/work`, `/menu`, `/about`, `/contact` each fail **4 of 5** Stage-3 sub-requirements:
   **zero `.reveal-lines` on any heading**, **bare lead headings** (no composed entrance),
   **no scrubbed `.k3-hairline` dividers**, **no parallax depth** — even though the SplitText
   line-wipe, hairline-draw, and parallax engines are all fully wired in the provider and
   merely lack targets on those routes. The shared `.reveal` batch is also missing the
   spec's "touch of scale" (affects every route). Plus: `/contact` + the placeholder routes
   read as flat charcoal (Stage 1 gap), and the hero tweens a `display:none` `.k3-hero__bloom`
   (Stage 2 dead-animation). Per your request, these become a **Stage 0.5 improvement pass
   bundled into the Stage 0 foundation session.**

This plan drives the remaining work — **Pre-flight finish → Foundation session (Stage 0
hardening + Stage 0.5 improvement pass over Stages 1–3.5) → Stage 4 → Stage 5 → Stage 6 →
Stage 7** — through **Workflow-tool orchestration** (parallel design fan-out, pipelines,
adversarial verification), as a **sequence of human-gated workflows**, one stage per
`/clear`'d session, `git tag stage-N` between stages for cheap rollback.

The intended outcome: every route — not just home — fully carries the motion + material
language; each remaining signature moment lands at its acceptance check or is cut to a clean
static fallback; the perf budget holds at every gate; nothing already shipped is *rebuilt*
(hero timeline core, Process scrub mechanism, copy, tokens, route split) — Stages 1–3 work is
*completed and polished*, not torn up.

---

## How this plan runs — orchestration model (locked this grilling pass)

| # | Decision | Resolution |
|---|----------|------------|
| 1 | **Orchestration model** | **Fan-out to think, serialize writes.** Subagents run parallel *divergent design + adversarial-verify + perf/QA* (read-mostly, conflict-free). The winning approach is written by **one serial builder** (main thread or a single builder agent). Shared hot files (`home.tsx`, `globals.css`, `app/layout.tsx`, `menu-full.tsx`, `smooth-scroll-provider.tsx`) never collide. **No `isolation:'worktree'`** — every stage touches the same few files, so worktree writers buy only merge pain. |
| 2 | **Variant exploration** | For the two design-ambiguous stages (4, 6): **2 coded variants** built on a throwaway dev-only `app/(lab)/…` route, screenshotted via the Playwright harness, scored by a judge panel (taste · perf · a11y lenses), winner synthesized into the real component; lab routes deleted before the stage commit. |
| 3 | **Paper-fibre tile** | **Procedural → rasterize to WebP.** Author fibre via `feTurbulence`/noise on-palette, rasterize to a seamless, tileable WebP ≤40KB (sharp/canvas). Deterministic, perfectly tiling, no external image API. `imagegen-frontend-web` is fallback only. |
| 4 | **CONFIRMED trigger** | **Fires the instant `onSubmit` passes zod validation** (alongside the existing mailto handoff). Add an on-page success acknowledgement to land the stamp. **Resend/Supabase backend stays out of scope.** |
| 5 | **Sound** | **Dropped entirely.** No audio system exists; the "existing tick/mute toggle" the spec references does not exist. Ticket-ink and CONFIRMED stay purely visual. |
| 6 | **First run after approval** | **Run Pre-flight now**, stop at its gate. The **Foundation session (Stage 0 + 0.5)** runs next as one `/clear`'d session; Stages 4/5/6/7 each get their own fresh session after that. |
| 7 | **Stage 3 status (audited this session)** | **`stage3Complete: false` — home only.** `/work`·`/menu`·`/about`·`/contact` fail 4/5 Stage-3 sub-requirements; engines are wired but untargeted. Completing them is **Stage 0.5**, bundled into the Foundation session. `verify-stage3.mjs` is upgraded to assert **all five routes**, not just home. |

**Why fan-out is still worth it under serial writes:** the parallelism lives in *thinking and
checking*, not typing. Each stage gets divergent design directions explored simultaneously,
findings adversarially refuted before they're trusted, and per-route perf/QA measured in
parallel — then a single builder applies the one chosen result. That is the right shape for a
tightly-coupled single Next app where motion correctness is subtle and the files are shared.

---

## Roadmap (dependency-ordered)

| Order | Stage | Entry precondition (gate green) | Signature / focus | Write-mode | Rollback tag | Perf diff to run |
|---|---|---|---|---|---|---|
| 1 | **Pre-flight finish** | current `main` (`5e261c1`) | Per-route baselines + WebP tile (no design change) | serial (1 asset writer) | `pre-flight` | Establish baseline: per-route First-Load-JS + Lighthouse + LCP/CLS |
| 2 | **Foundation = Stage 0 + Stage 0.5** | Pre-flight gate | **0**: route-change motion contract. **0.5**: complete Stage 3 baseline on `/work`·`/menu`·`/about`·`/contact` (reveal-lines, lead entrances, hairlines, parallax, scale channel) + Stage 1 polish (`/contact` + placeholder cards, spotlight anchor, AA) + Stage 2 hero-bloom fix | design fan-out → serial builder | `stage-0` | No JS regression; nav leak-free; per-route reveals cheap |
| 3 | **Stage 4** | Foundation gate | **Signature #2** — closed menu → unfold-as-page-transition | 2 lab variants → serial synth | `stage-4` | ≤150KB JS added cumulative; LCP/CLS on `/` + `/menu` |
| 4 | **Stage 5** | Stage 4 gate | **Signature #3** — cross-page printing ticket | serial (new files) | `stage-5` | Ticket JS cheap; off-screen paused; cumulative ≤150KB |
| 5 | **Stage 6** | Stage 5 gate | Editorial layout tension (Trust / Why / Pantry) | 2 lab variants → serial synth | `stage-6` | No JS regression; contrast preserved |
| 6 | **Stage 7** | Stage 6 gate | Polish · perf · QA across every route | measurement fan-out (read-only) | `stage-7` | Final bundle diff vs Pre-flight ≤150KB; tile ≤40KB; Lighthouse ≥90/route |

> **Why bundle 0 + 0.5:** the Stage 0 nav-reset and the Stage 3 motion completion touch the
> same file (`smooth-scroll-provider.tsx`) and the same per-route components, and both must be
> green for the route-change contract to mean anything — no point hardening navigation between
> routes that are motion-starved. One session, one `stage-0` gate, one combined all-routes
> verifier. If it bloats, Stage 0.5 can split to its own `stage-0_5` gate — but the default is
> one foundation session, per your "since you're already working on Stage 0."

**Stage gate rule (load-bearing):** every stage **stops for human approval** before the next
begins. No monolith runs all stages unattended. Each stage = its own session: `/clear`,
`git tag stage-N` on green, review, then proceed.

---

## Global gates (apply at EVERY stage's acceptance check)

- **Perf budget (hard):** added JS ≤ ~150KB gzip over the Pre-flight baseline (cumulative);
  LCP ≤ 2.5s desktop / ≤ 4s mid-mobile; 60fps desktop, ≥30fps low-end Android during any
  animation; the one raster tile is image weight (lazy, off-LCP), ≤40KB, **not** counted
  against the JS cap. Blow it → fix before the gate, never defer to Stage 7.
- **Reduced motion:** `prefers-reduced-motion` must fully disable every new effect on every
  route (hero, scrub, unfold, ticket, reveals, spotlight). The unfold becomes instant nav;
  the ticket inks instantly with no feed/stamp animation.
- **Motion discipline:** `transform`/`opacity` only; never `transition-all`. Motion via
  `useGSAP`. Single registration point (`lib/motion.ts`) — never a second motion system.
- **Tokens-first:** no hardcoded hex; use `k3-tokens.css` vars (`--char/--bone/--ember/
  --brass/--gold`, hairlines, atmosphere). Dark-only. Next 14.2.x / React 18, no `/src`.

### Verify harness — exact shape to match (do not reinvent)

The existing `verify-stage{0,1,2,3}.mjs` live at the **PARENT root**
(`C:\Users\cubit\Downloads\Jawad Design\`), **not** in `jawad-designs/`. They use:

- **Playwright `chromium`** (not Puppeteer; Playwright is not in `jawad-designs/package.json`
  — invoked from the parent). Stage 2 launches with SwiftShader args for WebGL.
- `node verify-stageN.mjs http://localhost:3000` against a running server.
- `?motion=on` / `?motion=force` to force `html.jd-anim` past reduced-motion in test.
- `window.__lenis` (scroll driver, `lenis.scrollTo(y,{immediate:true})`) and
  `window.__heroFrames` (frame counter) as test hooks (dev-only globals).
- Per-context `reducedMotion: "reduce"` and `viewport.width: 375` for the reduced/mobile runs.
- Console-error + `pageerror` capture → fail on any. Screenshots → `temporary screenshots/`.
- Exit `0` pass / `1` fail; human-readable `ok`/`FAIL` lines; `>>> STAGE N PASS|FAIL`.

Each new `verify-stageN.mjs` **extends this pattern** and is created at the parent root.

### Perf measurement (scriptable, not eyeballed)

- **Bundle baseline/diff:** parse `next build` route-level **First Load JS** per route; record
  in `PERF-BUDGET.md`; each later stage diffs its `next build` against the Pre-flight numbers.
- **Lighthouse:** `seo-unlighthouse` (`extensions/unlighthouse/install.sh`, no API key) against
  a served build (`next build && next start`), `--device desktop`, per route; read
  `score.performance` from `ci-result.json`.
- **LCP/CLS:** captured in-page via `PerformanceObserver` (the Stage 2 `PERF()` init script).

---

## What NOT to touch (explicit) — *improve, don't rebuild*

> Stage 0.5 deliberately edits Stage 1–3 surfaces to *complete* them. The line is **complete /
> polish, never rebuild**: extend wired engines to new targets, fix the bloom bug, add the scale
> channel, lift contrast — but the proven core mechanisms below stay intact and their verifiers
> stay green.

- **Hero timeline core + shader (Stage 2):** the `hero.tsx` plating sequence choreography,
  `hero-shader.tsx`, `lib/gl/heat-shimmer.glsl.ts`. *Allowed:* the bloom dead-animation fix
  (rank 7). *Not allowed:* re-choreographing the plating timeline. `verify-stage2` stays green.
- **Process scrub mechanism (Stage 3):** the pinned-scrub timeline + day cross-fade in
  `process.tsx`. *Allowed:* nothing structural — only the nav-reset must not break its pin
  re-measure. `verify-stage3` (upgraded to all routes) stays green.
- **The provider's batch engines:** `.reveal` / `.reveal-lines` / `.k3-drawline` / `.k3-hairline`
  / `.parallax`. *Allowed:* add the `.reveal` scale channel + the nav-reset effect + the
  per-section spotlight anchor. *Not allowed:* replacing the batch architecture or adding a
  second motion system.
- **Palette tokens (Stage 1):** the `--char/--bone/--ember/--brass/--gold` values + the
  `Atmosphere` grain / vignette / spotlight stack. *Allowed:* add an `--ember-text` token + the
  `.k3-paper` `--bone-soft` AA bump. *Not allowed:* re-hueing the brand.
- **All copy and the kitchen metaphor.** No rewriting headings, course names, ticket language.
- **The route split.** Do not re-merge `/`, `/work`, `/menu`, `/about`, `/contact`.
- **`TierGrid` single source** (`menu-full.tsx`). Pricing stays defined once. Stage 4 changes
  *how home enters* the menu, not the tier data; `/menu` keeps rendering the live `TierGrid`.
- **`prefers-reduced-motion` handling.** Extend to new effects; never replace or weaken.

---

## Pre-flight finish-up — **first runnable workflow** (design-neutral)

**Entry:** current `main` (`5e261c1`). **Goal:** capture the missing baselines + produce the one
WebP tile, changing **no visible design**. **Write-mode:** measurement is read-only; the tile
is a single serial asset write.

**Acceptance check (restated as assertions):**
- [ ] Baseline full-page screenshots exist for **all 5 routes × {1440, 768, 375}** = 15 PNGs.
- [ ] Per-route Lighthouse `score.performance` recorded (5 numbers) in `PERF-BUDGET.md`.
- [ ] Per-route **First Load JS** + LCP/CLS recorded as the diff baseline.
- [ ] `public/assets/showstopper/paper-fibre.webp` exists, **≤40KB**, seamless/tileable,
      on-palette; `ASSET-INVENTORY.md` updated.
- [ ] SplitText free/working smoke re-confirmed (it already runs in Stage 2/3).

**Workflow script design** (`meta` + body shape):

```js
export const meta = {
  name: 'preflight-finish',
  description: 'Per-route baselines + raster paper-fibre WebP tile; no design change',
  phases: [{title:'Serve'},{title:'Baseline'},{title:'Asset'},{title:'Checklist'},{title:'Critic'}],
}
// Pre-step (main thread, before workflow): next build && next start on :3000 (background).
phase('Baseline')
const ROUTES = ['/', '/work', '/menu', '/about', '/contact']
const VIEWPORTS = [1440, 768, 375]
// Read-only captures fan out safely against the one shared served build.
const baseline = await parallel(
  ROUTES.flatMap(route => VIEWPORTS.map(w => () =>
    agent(`Capture full-page screenshot of ${route} at ${w}px and read LCP/CLS via PerformanceObserver against http://localhost:3000. Save PNG to "temporary screenshots/baseline-<route>-<w>.png". Return measurements.`,
      {label:`base:${route}@${w}`, phase:'Baseline', schema: BASELINE_SCHEMA})))
)
// Lighthouse per route (separate: seo-unlighthouse, desktop).
const lh = await parallel(ROUTES.map(r => () =>
  agent(`Run seo-unlighthouse against http://localhost:3000${r} --device desktop; return score.performance and the key audits.`,
    {label:`lh:${r}`, phase:'Baseline', schema: LH_SCHEMA})))
// First Load JS per route from `next build` output (one agent parses the build table).
const bundle = await agent('Run `next build` in jawad-designs; parse the route table; return First Load JS (kB) per route.',
  {phase:'Baseline', schema: BUNDLE_SCHEMA})

phase('Asset')   // single serial writer
const tile = await agent('Author an on-palette paper-fibre texture (feTurbulence/noise, low-contrast warm), rasterize to a SEAMLESS tileable WebP ≤40KB at public/assets/showstopper/paper-fibre.webp via sharp. Verify tileability (edge-wrap continuity) and byte size. Update ASSET-INVENTORY.md.',
  {phase:'Asset', schema: TILE_SCHEMA})

phase('Checklist')  // synthesize PERF-BUDGET.md (serial writer)
const perfDoc = await agent(`Write PERF-BUDGET.md: per-route First Load JS, Lighthouse perf, LCP/CLS as the reusable baseline. Data: ${JSON.stringify({baseline, lh, bundle})}`,
  {phase:'Checklist'})

phase('Critic')
const gaps = await agent(`Completeness critic: given these results, what's missing — a route/viewport not captured, Lighthouse failed, tile >40KB or not tiling, SplitText smoke not reconfirmed? ${JSON.stringify({baseline,lh,bundle,tile})}`,
  {phase:'Critic', schema: CRITIC_SCHEMA})
return { baseline, lh, bundle, tile, gaps }
```

**StructuredOutput schemas (sketch):**
- `BASELINE_SCHEMA = {route, viewport, screenshotPath, lcpMs, cls}`
- `LH_SCHEMA = {route, performance:number, lcpMs, tbtMs, cls}`
- `BUNDLE_SCHEMA = {routes:[{route, firstLoadJsKb:number}]}`
- `TILE_SCHEMA = {path, bytes:number, tileable:boolean, onPalette:boolean}`
- `CRITIC_SCHEMA = {complete:boolean, missing:[string]}`

**Barrier justification:** the captures use `parallel()` (a barrier) only because the Critic
needs the full result set to judge completeness — a genuine cross-item dependency. The single
tile/doc writers are serial by nature.

**Rollback:** `git tag pre-flight`. **Perf diff:** none yet — this *is* the baseline.

---

## Foundation session — Stage 0 hardening + Stage 0.5 improvement pass (Stages 1–3.5)

**Entry:** Pre-flight gate. **One `/clear`'d session, one `stage-0` gate.** **Skills:**
`gsap-react` (primary), `gsap-core`, `gsap-scrolltrigger`, `gsap-performance`, plus
`taste-skill` / `ui-styling` for the Stage 1 material polish. **Write-mode:** design fan-out
(parallel, per route) → **one serial builder** applies all edits → all-routes verify.

### Workstream A — Stage 0: route-change motion contract (no visible change)

On `usePathname` change, in this **exact order** (load-bearing — see regression risks):
1. **`lenis.scrollTo(0,{immediate:true})`** *before* refresh — else the hero plate scrub
   computes mid-progress and paints **pre-lifted** (`yPercent` up to −14) on first paint of a
   non-home route.
2. **Kill** triggers belonging to the unmounted route; let the new route's `useGSAP` rebuild
   (Process re-applies `sec.style.height` for its sticky pin).
3. **Reset CSS globals:** `--jd-spot-y` (42%), **`--jd-spot-bias`**, **`--k3-steam-strength`** —
   not just the spotlight Y (a mid-scrub nav away from home can leave the next route biased
   off-centre or steam-boosted).
4. **`ScrollTrigger.refresh()`** *after* Process re-applies its pin height (refreshing before
   re-measure mis-places the five-course scrub).
5. **Re-assert** the `prefers-reduced-motion` guard per route.

(One file: `smooth-scroll-provider.tsx`, plus a small `useRouteMotionReset` hook if cleaner.)

### Workstream B — Stage 0.5: complete Stages 1–3.5 on every route (audit backlog)

Engines (SplitText line-wipe, hairline-draw, parallax) are **already wired** in the provider —
most of this is *targeting*, not new machinery:

| Rank | Fix | Stage | Impact/Effort | Files |
|---|---|---|---|---|
| 1 | Add `.reveal-lines` to **all non-home headings** (zero today on 4 routes) | 3.A | high/low | `work-full`, `menu-full`, `chef-full`, `contact-form` |
| 2 | **Composed lead entrance** per route — bespoke scoped `useGSAP` timeline (hero as reference), not a bare fade | 3.A | high/med | the 4 route files (+ `sections/hero.tsx` pattern) |
| 3 | `.k3-hairline` scrubbed dividers on non-home section breaks (draw engine wired, no targets) | 3.A | med/low | the 4 route files |
| 4 | Light **parallax depth** on 1–2 elements per non-home route (`.parallax data-depth`) | 3.A | med/low | the 4 route files |
| 5 | **Scale channel** on the shared `.reveal` batch (`scale:.98→1`) — spec's "touch of scale", all routes | 3.A | med/low | `smooth-scroll-provider`, `k3-tokens.css` |
| 7 | Fix hero **bloom dead-animation** — `.k3-hero__bloom` is `display:none` but tweened | 2 | low/low | `sections/hero.tsx`, `k3-pass3.css` |
| 8 | Material baseline on **placeholder routes** (`/journal*`, `/work/[slug]`, `not-found`) | 1 | med/low | `placeholder.tsx`, `globals.css` |
| 9 | Promote **`/contact` card** to a cinematic surface (ember rim + `.k3-paper` grain + brass letterpress) | 1 | med/low | `globals.css`, `contact-form`, `k3-pass4-material.css` |
| 10 | Generalize **per-section spotlight anchor** (`data-spot-anchor` → `--jd-spot-bias`) for long non-home pages | 1 | med/med | `smooth-scroll-provider`, `k3-pass4-material.css` |
| 11–12 | **AA contrast**: `--ember`-as-text on `.ash` (→ `--ember-text` ≈`#E0573D`); `--bone-soft` on cream `.k3-paper` (→ ≈`#6b5e4e`) | 1 | low/low | `k3-tokens.css`, `k3-pass3.css`, `k3-pass4-material.css` |
| 13 | Consolidate duplicated atmosphere/material CSS (`§3.5` overrides → primary blocks) | 1 | low/med | `k3-pass3.css`, `k3-pass4-material.css` |

(Ranks 1–4 are the heart of *"what about Stage 3?"*. Ranks 11–13 are fast-follow polish; split
to a `stage-0_5` follow-up if the session runs long.)

**Combined acceptance check (assertions):**
- [ ] **Nav contract:** after `/→/menu→/work→/about→/contact→back` ×5, `ScrollTrigger.getAll().length`
      returns to single-route baseline; post-nav `window.__lenis.scroll===0`; `--jd-spot-y`,
      `--jd-spot-bias`, `--k3-steam-strength` all reset; the **hero plate never paints pre-lifted**;
      the **Process pin re-measures correctly** after nav-away-and-back; no console errors.
- [ ] **Stage 3 every route:** every heading on all 5 routes splits into `.reveal-lines` and
      wipes; each route has a **composed lead entrance**; non-home routes have ≥1 `.k3-hairline`
      draw + ≥1 `.parallax` element; `.reveal` animates a scale channel.
- [ ] **Stage 1 material:** `/contact` + placeholder routes carry ≥1 signature treatment (no flat
      charcoal block); body-copy contrast ≥4.5:1 everywhere (ember / bone-soft fixes applied).
- [ ] **Reduced motion:** clean static content on **every** route; nothing moves; no SplitText nodes.
- [ ] No JS regression vs the Pre-flight baseline.

**Workflow script design** (fan-out to think, serialize writes):

```js
export const meta = { name:'foundation-0-and-0_5',
  description:'Nav-reset contract + complete Stage 3 baseline & Stage 1-2 polish on every route',
  phases:[{title:'Design'},{title:'Build'},{title:'Verify'}] }

phase('Design')   // parallel, read-mostly
const nav = await agent('Design the route-change reset: exact ordered steps (lenis.scrollTo(0,immediate) → kill route triggers → reset --jd-spot-y/--jd-spot-bias/--k3-steam-strength → refresh AFTER Process re-applies pin height → reassert reduced-motion), StrictMode double-init guard, where to hook usePathname. Cite current lines + the 6 audited regression risks.', {schema:APPROACH_SCHEMA, phase:'Design'})
const perRoute = await parallel(['/work','/menu','/about','/contact'].map(r => () =>
  agent(`Design the Stage-3 completion for ${r}: which headings get .reveal-lines, the bespoke composed LEAD entrance timeline (content-aware — weld mockup on /work, pricing on /menu, crest on /about, form card on /contact), where the .k3-hairline dividers + .parallax depth elements go. Reference home as the standard. Return exact class/markup edits.`, {schema:ROUTE_PLAN_SCHEMA, phase:'Design', label:`design:${r}`})))
const polish = await agent('Design the Stage-1 material polish + Stage-2 hero-bloom fix + the shared .reveal scale channel + AA contrast token edits, per the ranked backlog. Return exact edits per file.', {schema:POLISH_SCHEMA, phase:'Design'})

phase('Build')   // ONE serial builder — shared files (provider, tokens, css) + 4 route files
await agent(`Apply ALL of these as a single serial writer; transform/opacity only; no second motion system; do NOT rebuild the hero timeline core or the Process scrub mechanism — only complete/polish: ${JSON.stringify({nav, perRoute, polish})}`, {phase:'Build'})

phase('Verify')
await agent('Upgrade verify-stage3.mjs to assert the motion baseline on ALL FIVE routes (currently home-only): loop the routes, assert reveal-lines split+wipe on each heading, a composed lead entrance, hairline+parallax presence on non-home, the scale channel; keep the Process-scrub + reduced-motion + mobile blocks. Then write verify-stage0.mjs for the nav contract per the regression risks. Run both against a served build.', {schema:VERIFY_SCHEMA, phase:'Verify'})
const skeptics = await parallel([
  'rapid back/forward (leak/pin)','deep-link a non-home route then nav','mid-Process-scrub nav away from home','StrictMode double-mount','reduced-motion on every route'
].map(s => () => agent(`Adversarially try to break the foundation via: ${s}. Default to "fails" unless proven clean. Report ScrollTrigger count, scroll pos, spot vars, console, and whether the hero plate or Process pin mis-paints.`, {schema:SKEPTIC_SCHEMA, phase:'Verify'})))
return { nav, perRoute, polish, skeptics }
```

- `APPROACH_SCHEMA = {hookLocation, steps:[string], strictModeGuard, regressionMitigations:[string]}`
- `ROUTE_PLAN_SCHEMA = {route, revealLinesHeadings:[string], leadEntrance, hairlines:[string], parallax:[string]}`
- `POLISH_SCHEMA = {edits:[{file, change, rationale}]}`
- `VERIFY_SCHEMA = {pass:boolean, failingAssertions:[string], log}` · `SKEPTIC_SCHEMA = {scenario, fails:boolean, evidence}`

**`verify-stage0.mjs` spec (nav):** Playwright; navigate `/→/menu→/work→/about→/contact→/` ×5;
after each settle assert `ScrollTrigger.getAll().length ≤ baseline`, `window.__lenis.scroll===0`,
and `--jd-spot-y/--jd-spot-bias/--k3-steam-strength` at defaults; assert the home hero plate
`yPercent===0` on first paint after nav-back (not pre-lifted) and `#process` re-acquires its
inline pin height; a reduced-motion context asserts `jd-anim` absent on every route. Fail on any
console error.

**`verify-stage3.mjs` UPGRADE (all routes):** extend the home-only script to loop
`['/', '/work', '/menu', '/about', '/contact']` — per route assert each `.reveal-lines` heading
splits into `.line` nodes and wipes (the existing masked-reveal probe, generalised), a composed
lead entrance played, and (non-home) ≥1 `.k3-hairline` + ≥1 `.parallax`; keep the Process-scrub
+ reduced-motion + mobile blocks. This upgraded script is the Stage 0.5 gate and must stay green
through every later stage.

**Regression risks to neutralise (audit — baked into the verify):** ① `refresh()` before
Process re-applies pin height mis-measures the scrub; ② missing `--jd-spot-bias` /
`--k3-steam-strength` reset leaves the next route biased/steam-boosted; ③ Lenis not forced to 0
(immediate) before refresh paints the hero plate pre-lifted; ④ the `.reveal` scale channel can
collide with tier-card/metric transforms (verify compose order / `overwrite:auto`); ⑤
`.reveal-lines` line-count can diverge from hard-coded `<br>` headings if wrapping shifts (font-
ready gate + refresh mitigates); ⑥ boot gate ignores `data-motion='off'` (latent coupling — only
bites if a runtime motion toggle ships).

**Rollback:** `git tag stage-0`. **Perf diff:** no First-Load-JS regression vs baseline (added
per-route reveals are markup + existing engines, so JS cost ≈ 0).

---

## Stage 4 — Signature #2: closed menu → unfold-as-page-transition

**Entry:** Foundation gate (Stage 0 + 0.5). **Skills:** `gsap-react`, `gsap-timeline`, `taste-skill`,
`ui-ux-pro-max`. **Design-ambiguous → 2 coded lab variants.** **Write-mode:** variants on
`app/(lab)/menu-unfold-{a,b}` (throwaway, never committed); winner synthesized serially into
`menu-preview.tsx` + a transition module; lab routes deleted before commit.

**Locked behavior (decision #1):** home `MenuPreview` becomes a **closed** folded menu (paper
grain = procedural SVG base + the new WebP tile at multiply ~8%, brass crest, letterpress
title, faint deckled edge, a clear *"View the menu — pricing inside"* affordance + hover lift +
inner-edge peek). It no longer renders the flat `TierGrid`. Click/Enter plays a full-bleed
GSAP curtain unfold (CSS 3D hinge, believable paper easing + slight overshoot + tracked drop
shadow) while `router.push('/menu')` fires underneath; the curtain covers nav so there's no
flash; the spread resolves onto the live `/menu`. `/menu` **always renders pricing fully open**
(instant for deep-links + reduced motion). Reduced motion = instant nav, no curtain. Preload
`/menu` on hover/focus (`next/link` prefetch); gate the unfold's resolve on the new route
painting; sane max-duration so it never sticks.

**Two divergent variants to build & judge:**
- **A — single-hinge cover fold:** one cover panel rotates open on a left/top hinge (book
  cover), spread behind it. Simpler physics, fewer transforms.
- **B — book-spread double-fold:** two panels part from the centre (gatefold), pricing
  revealed in the gutter. Richer, more "menu," more transform cost to keep at 60fps.

**Pre-design research (parallel, before variants):** study the named benchmarks — Arnaud
Rocca, Corentin Bernadou, R—K '26, Joffrey Spitzer (page-transition craft); GEM / Storstad
(fine-dining inline menu). Distil into transition-craft notes that brief both variant agents.

**Acceptance check (assertions):**
- [ ] Home shows a convincing **closed** printed menu that obviously promises pricing (no
      flat tier cards on home).
- [ ] Click → full-screen unfold → lands on `/menu` with tiers open, **no blank-page flash**.
- [ ] `/menu` deep-linked renders pricing instantly (no animation dependency).
- [ ] Reduced motion → straight to `/menu`, pricing shown, no curtain.
- [ ] Path to pricing is fully **keyboard + screen-reader operable** without the animation
      (closed menu is a real link/button; unfold is decorative).
- [ ] No CLS from the transition.

**Workflow script design:**

```js
export const meta = { name:'stage4-unfold',
  description:'Closed menu on home; unfold IS the navigation to /menu',
  phases:[{title:'Research'},{title:'Variants'},{title:'Judge'},{title:'Synthesize'},{title:'Verify'}] }
phase('Research')
const refs = await parallel(BENCHMARKS.map(b => () =>
  agent(`Study ${b}; extract page-transition / unfold craft: timing, easing, how they hide route swap, a11y. Cite.`, {schema:REF_SCHEMA, phase:'Research'})))
phase('Variants')   // each builds a throwaway coded variant on a lab route
const built = await parallel([
  () => agent(`Build VARIANT A (single-hinge cover fold) at app/(lab)/menu-unfold-a as a real coded unfold→/menu transition. transform/opacity only; prefetch /menu; gate resolve on paint; reduced-motion=instant nav. Brief: ${JSON.stringify(refs)}`, {schema:VARIANT_SCHEMA, phase:'Variants'}),
  () => agent(`Build VARIANT B (gatefold double-fold) at app/(lab)/menu-unfold-b, same contract. Brief: ${JSON.stringify(refs)}`, {schema:VARIANT_SCHEMA, phase:'Variants'}),
])
phase('Judge')   // screenshot mid-unfold frames + score on 3 lenses
const verdicts = await parallel(built.flatMap(v => ['taste','perf','a11y'].map(lens => () =>
  agent(`Screenshot ${v.labRoute} mid-unfold via Playwright and judge on the ${lens} lens (believability / 60fps & no thrash / keyboard+SR reaches pricing). Score 1-10 + reasons.`, {schema:JUDGE_SCHEMA, phase:'Judge', label:`judge:${v.id}:${lens}`})))
phase('Synthesize')   // serial builder
const winner = pickWinner(verdicts)   // plain code: highest blended score, a11y is a gate not an average
await agent(`Synthesize the winning unfold (${winner.id}) into the REAL components: rebuild menu-preview.tsx into the closed folded menu (paper-fibre.webp @ multiply ~8%, brass crest, deckled edge, "pricing inside" affordance) and implement the unfold-as-transition module. Delete app/(lab)/menu-unfold-*. Keep /menu rendering live TierGrid, fully open. Graft the best ideas from the runner-up where free.`, {phase:'Synthesize'})
phase('Verify')
await agent('Write verify-stage4.mjs (parent root, Playwright) per the assertions; run it; return pass/fail.', {schema:VERIFY_SCHEMA, phase:'Verify'})
const skeptics = await parallel(['slow-network blank-page probe','deep-link /menu instant','reduced-motion instant nav','keyboard-only path to pricing'].map(s => () =>
  agent(`Adversarially verify: ${s}. Default to "fails" unless proven. Report evidence.`, {schema:SKEPTIC_SCHEMA, phase:'Verify'})))
return { winner, verdicts, skeptics }
```

- `VARIANT_SCHEMA = {id, labRoute, approach, transformsOnly:boolean, reducedMotionInstant:boolean}`
- `JUDGE_SCHEMA = {variantId, lens, score:number, reasons:[string], a11yPass:boolean}`
- `pickWinner`: a11y must pass (hard gate); among those, highest taste+perf blend.

**`verify-stage4.mjs` spec:** assert home has the closed menu (a `[data-menu-closed]` hook, no
`.k2-tier` on `/`); clicking it ends on `/menu` with `.k2-tier` ×3 visible and no blank frame
(poll for `/menu` paint during the transition); reduced-motion context → click navigates to
`/menu` instantly (no curtain element); keyboard `Enter` on the menu reaches pricing; CLS ≤0.1.

**Rollback:** `git tag stage-4`. **Perf diff:** cumulative JS ≤150KB; LCP/CLS on `/` + `/menu`.

---

## Stage 5 — Signature #3: the cross-page printing ticket (most at-risk)

**Entry:** Stage 4 gate. **Skills:** `gsap-react`, `gsap-scrolltrigger`, `gsap-core`,
`gsap-performance`. **Write-mode:** serial; mostly **new isolated files** —
`components/site/ticket.tsx`, `lib/ticket-state.ts` (sessionStorage), mounted in
`app/layout.tsx`. Single design (decisions #2–4 already locked it) → adversarial state-machine
review rather than multi-variant.

**Locked behavior:** right-edge rail hanging ~180px from below the nav, feeding **downward**;
real receipt styling (mono, perforated/torn top edge vector, thermal texture = SVG + WebP tile
@ multiply ~8%, curl-shadow layer). **Auto-retract/fade when `.k2-foot` enters view.** State in
`sessionStorage`, restored **instantly** on return/refresh (no re-animation). Fixed slots
pre-printed faint, funnel order, **order-free / scroll-earned**:
`SEATED` (home, ink past `#trust`) · `SIGNATURE` (`/work`, past `#work`) · `THE RECIPE`
(`/about`, past `#chef`, optional) · `THE MENU` (`/menu`, past `#menu`) · `CONFIRMED`
(`/contact` **valid submit only**). Climax: CONFIRMED stamps `TABLE 01 — CONFIRMED` at an
angle (ink-press scale+settle), ticket tears off. **Mobile:** collapse to a tap-to-expand
progress pill bottom-right (e.g. `2/4`), never over the CTA. **No sound.** **aria-hidden**,
never traps focus, never blocks content/CTA on any route. Reduced motion = lines appear
instantly, stamp without the press.

**Acceptance check (assertions):**
- [ ] Correct line inks on each route when you scroll past its key section, **in any visit
      order** (deep-link `/menu` first inks `THE MENU` even if `SEATED` isn't inked).
- [ ] State survives navigation + refresh **without re-animating** already-inked lines.
- [ ] Retracts/fades when `.k2-foot` enters view; never overlaps the reading column or CTA.
- [ ] `CONFIRMED` stamps on **real valid submit** + tears off; success ack shows.
- [ ] Mobile pill stays out of the way; `aria-hidden`; no focus trap on any route.
- [ ] Reduced motion → lines instant, stamp without press.
- [ ] Off-screen/retracted → all ticket work paused (no rAF, no ScrollTrigger churn).

**Workflow script design:**

```js
export const meta = { name:'stage5-ticket',
  description:'Cross-page sessionStorage printing ticket; inks per funnel touchpoint',
  phases:[{title:'Design'},{title:'Build'},{title:'Verify'}] }
phase('Design')   // state machine is the risk; refute it before building
const sm = await agent('Design the sessionStorage ticket state model: slot enum, per-route scroll-earned ink trigger (order-free), restore-without-replay, footer-retract, CONFIRMED on valid submit, mobile pill. Return the state machine + the exact DOM hook per route.', {schema:SM_SCHEMA, phase:'Design'})
const refute = await parallel(['visit-order permutations','refresh mid-funnel','footer overlap','focus-trap / aria','off-screen pause'].map(r => () =>
  agent(`Try to break this state machine via ${r}: ${JSON.stringify(sm)}. Default to "broken" unless proven safe.`, {schema:SKEPTIC_SCHEMA, phase:'Design'})))
phase('Build')   // serial: new files + layout mount
await agent(`Implement ticket.tsx + lib/ticket-state.ts + mount in app/layout.tsx per: ${JSON.stringify(sm)}. Reuse the persistent-trigger + quickSetter patterns from smooth-scroll-provider. transform/opacity only; pause all work when retracted/off-screen. Wire CONFIRMED to contact onSubmit (valid) + add the on-page success ack.`, {phase:'Build'})
phase('Verify')
await agent('Write verify-stage5.mjs (parent root, Playwright) per the assertions, incl. visit-order permutations + refresh-restore + focus-trap probe; run it.', {schema:VERIFY_SCHEMA, phase:'Verify'})
return { sm, refute }
```

- `SM_SCHEMA = {slots:[{id,route,inkAnchor}], restoreNoReplay:boolean, footerHook, confirmedTrigger, mobilePill}`

**`verify-stage5.mjs` spec:** Playwright across permuted visit orders (e.g. `/menu` first)
asserting only the reached-and-scrolled slot inks; refresh mid-funnel and assert inked lines
are present **without** a re-play (compare a "freshly animated" flag); scroll to `.k2-foot`
and assert the rail retracts (opacity/transform); submit a valid contact form and assert the
CONFIRMED stamp + tear-off; probe Tab order to prove no focus trap and `aria-hidden="true"`;
reduced-motion context asserts instant lines. 375px asserts the pill, not the rail.

**Rollback:** `git tag stage-5`. **Perf diff:** ticket JS minimal; cumulative ≤150KB; confirm
off-screen pause (no frames advancing when retracted).

---

## Stage 6 — Editorial layout tension (Trust / Why / Pantry)

**Entry:** Stage 5 gate. **Skills:** `taste-skill`, `frontend-design`, `ui-ux-pro-max`,
`design-system`. **Design-ambiguous → 2 coded lab variants.** **Write-mode:** variants on
`app/(lab)/editorial-{a,b}`; winner synthesized serially into `trust.tsx` (home) + `menu-full
.tsx` (Why `#why`, Pantry `#details`); lab routes deleted before commit. **Copy unchanged.**

**Current state (audit):** all three are symmetrical/centered lists — `Trust` a 3-col
`.k2-trust__grid`; `Why` left/right rows; `Pantry` a centered numbered 6-item grid. Treat the
three as **one editorial system across two routes**.

**Two divergent variants:**
- **A — broken/offset grid:** asymmetric columns, intentional overlap, oversized course
  numerals bleeding off the edge, script-font flourish in 1–2 spots.
- **B — strict baseline-grid editorial:** disciplined modular scale, one giant hero
  number/word per section (kinetic on scroll), full-bleed/edge-anchored texture moments.

**Acceptance check (assertions):**
- [ ] None of the three sections is a plain centered list anymore (assert an asymmetry/oversized-
      numeral marker present per section).
- [ ] One clear "big editorial moment" per section; coherent system across `/` and `/menu`.
- [ ] Body-copy contrast still ≥ ~4.5:1; matches the Stage 1 cinematic-duotone material.
- [ ] Before/after screenshots for each of the three sections.

**Workflow script design:**

```js
export const meta = { name:'stage6-editorial',
  description:'Break the safe symmetrical grid on Trust/Why/Pantry; copy unchanged',
  phases:[{title:'Variants'},{title:'Judge'},{title:'Synthesize'},{title:'Verify'}] }
phase('Variants')
const built = await parallel([
  () => agent('Build VARIANT A (broken/offset grid) for Trust+Why+Pantry at app/(lab)/editorial-a. Token-driven type scale, no hardcoded hex, copy unchanged, match Stage 1 material.', {schema:VARIANT_SCHEMA, phase:'Variants'}),
  () => agent('Build VARIANT B (strict baseline-grid editorial) at app/(lab)/editorial-b, same constraints.', {schema:VARIANT_SCHEMA, phase:'Variants'}),
])
phase('Judge')
const verdicts = await parallel(built.flatMap(v => ['taste','hierarchy','readability','perf'].map(lens => () =>
  agent(`Screenshot ${v.labRoute} (1440+375) and judge on ${lens}. Score + reasons; readability/contrast is a gate.`, {schema:JUDGE_SCHEMA, phase:'Judge'})))
phase('Synthesize')
const winner = pickWinner(verdicts)   // readability gate, then taste+hierarchy
await agent(`Apply winner (${winner.id}) to the REAL trust.tsx + menu-full.tsx (Why #why, Pantry #details). Copy unchanged. Delete lab routes. Capture before/after per section.`, {phase:'Synthesize'})
phase('Verify')
await agent('Write verify-stage6.mjs per assertions (asymmetry markers present, contrast preserved); run it.', {schema:VERIFY_SCHEMA, phase:'Verify'})
return { winner, verdicts }
```

**`verify-stage6.mjs` spec:** assert each section exposes an editorial marker
(`[data-editorial]` / an oversized numeral node) and is **not** the old centered grid; sample
body-copy contrast ratio ≥4.5; `.reveal-lines` headings still split + reveal (Stage 3 stays
green); screenshots saved. **Rollback:** `git tag stage-6`. **Perf diff:** no JS regression.

---

## Stage 7 — Polish, performance & QA (measurement fan-out, read-only)

**Entry:** Stage 6 gate. **Skills:** `gsap-performance`, `seo-unlighthouse`. **Write-mode:**
read-only measurement + a final rough-edges list; any fixes it surfaces are applied serially.

**Acceptance check (assertions):**
- [ ] Lighthouse performance **≥90 desktop per route** (scripted via `seo-unlighthouse`).
- [ ] Final `next build` JS diff vs Pre-flight baseline **≤150KB** cumulative; tile ≤40KB,
      lazy, off-LCP.
- [ ] Routing motion leak-free across repeated back/forward; unfold never flashes blank
      `/menu`; ticket state correct, never double-animates; **every route still passes the
      all-routes `verify-stage3`** (re-run verify-stage0/3/4/5).
- [ ] `prefers-reduced-motion` disables **every** new effect on every route; menu still
      reaches `/menu`.
- [ ] Mobile QA at 375 + 768 (and note real low-end Android as a manual follow-up): hero,
      menu→`/menu` transition, process scrub, ticket pill all hold framerate.
- [ ] Full-page screenshots of every route (desktop + mobile) + a short "still rough" list.

**Workflow script design:**

```js
export const meta = { name:'stage7-qa',
  description:'Cross-route perf/routing/a11y/mobile QA; final bundle diff',
  phases:[{title:'Measure'},{title:'Routing'},{title:'A11y+RM'},{title:'Critic'}] }
phase('Measure')   // all read-only against a served production build → safe parallel
const perf = await parallel(ROUTES.map(r => () =>
  agent(`seo-unlighthouse ${r} --device desktop; full-page screenshots 1440+375; LCP/CLS. Return numbers + paths.`, {schema:LH_SCHEMA, phase:'Measure'})))
const diff = await agent('next build; diff per-route First Load JS vs PERF-BUDGET.md baseline; confirm ≤150KB added cumulative; confirm paper-fibre.webp lazy + ≤40KB.', {schema:DIFF_SCHEMA, phase:'Measure'})
phase('Routing')   // re-run the leak/baseline/transition/ticket verifiers
const routing = await parallel(['verify-stage0','verify-stage3','verify-stage4','verify-stage5'].map(v => () =>
  agent(`Run ${v}.mjs against the served build; return pass/fail + log.`, {schema:VERIFY_SCHEMA, phase:'Routing'})))
phase('A11y+RM')
const rm = await parallel(ROUTES.map(r => () =>
  agent(`Reduced-motion context on ${r}: assert nothing moves (hero/scrub/unfold/ticket/reveals/spotlight) and the menu still reaches /menu. Check focus order, headings, alt, contrast, ticket aria-hidden + no focus trap.`, {schema:A11Y_SCHEMA, phase:'A11y+RM'})))
phase('Critic')
const rough = await agent(`Completeness critic across all results — what's still rough, what regressed, what's unverified? ${JSON.stringify({perf,diff,routing,rm})}`, {schema:CRITIC_SCHEMA, phase:'Critic'})
return { perf, diff, routing, rm, rough }
```

**`verify-stage7`** is effectively this workflow plus the re-run of stage0/3/4/5 verifiers.
**Rollback:** `git tag stage-7`. **Perf diff:** the final, authoritative ≤150KB / ≥90 gate.

---

## Risk register

**At-risk devices / surfaces (highest first):**
1. **Cross-page ticket (Stage 5) — highest risk per spec.** Lives on every route; most prone to
   jank, cost, and being in the way. Watch fps on low-end Android + Safari; watch focus/CTA
   overlap on every route + the mobile pill.
2. **Unfold route-readiness race (Stage 4).** Slow network → curtain could reveal a blank
   `/menu`. Mitigation: `next/link` prefetch on hover/focus + gate resolve on paint + sane
   max-duration. Safari 3D-transform/hinge fidelity is a secondary risk.
3. **Low-end Android framerate floor (≥30fps)** across the ticket, the unfold, and the Process
   scrub running together.
4. **StrictMode double-init / ScrollTrigger leaks** across repeated client-side navigation
   (the Foundation session is the guard; Stage 7 re-checks). The audit's **6 named regression
   risks** (pin re-measure, spot-bias/steam reset, pre-lifted plate, scale-channel transform
   collision, `<br>` line-count drift, `data-motion` boot coupling) are the concrete failure
   modes here.
5. **Motion-starved non-home routes (pre-Stage-0.5).** Until Stage 0.5 lands, `/work`·`/menu`·
   `/about`·`/contact` have no reveal-lines / lead entrance / hairline / parallax — the single
   biggest "unfinished foundation" risk and the reason Stage 0.5 is bundled in now.

**Kill criteria + fallback per signature moment** (a clean static section beats a half-working
effect; cut rather than polish a gimmick):

| Moment | Kill if… | Fallback |
|---|---|---|
| **Menu unfold (S4)** | blank-`/menu` flash can't be eliminated, or it delays reaching pricing, or <60fps desktop | A styled **closed-menu card that's just a link** to `/menu` (instant nav), no curtain. Pricing reachability is preserved either way. |
| **Cross-page ticket (S5)** | jank (<60fps desktop / <30fps mobile), fights footer/CTA, traps focus, or reads as a distracting gimmick at its check | **Remove it entirely** — it's purely additive; no static stand-in needed. The funnel copy already carries the "one ticket" metaphor. |
| **Editorial layout (S6)** | asymmetry hurts readability or breaks contrast | Keep the current clean layout, apply **only** the oversized editorial numerals — minimal, safe delta. |

**Cross-cutting:** any stage that blows the perf budget is **fixed before its gate**, never
deferred to Stage 7. Reduced-motion regressions are release-blocking.

---

## Verification (how to test end-to-end)

- **Per stage:** start a served build (`next build && next start` on :3000), run the stage's
  `verify-stageN.mjs` from the **parent root** (`node verify-stageN.mjs http://localhost:3000`)
  → expect `>>> STAGE N PASS`; re-run **prior** verifiers (`verify-stage2`, the **all-routes**
  `verify-stage3`, and accumulating `0/4/5`) to confirm no regression; `npm run lint` +
  `npm run build` clean.
- **Perf at every gate:** `seo-unlighthouse` per route (desktop) + `next build` First-Load-JS
  diff vs `PERF-BUDGET.md` baseline (cumulative ≤150KB) + tile ≤40KB.
- **Manual:** navigate `/→/menu→/work→/about→/contact` and back repeatedly; toggle OS reduce-
  motion; check 375/768; submit the contact form to see CONFIRMED + the success ack.
- **Gate:** on green, `git tag stage-N`, push, confirm Vercel deploy, **stop for sign-off**
  before the next stage's fresh `/clear`'d session.

---

## Open questions resolved this session (no blockers remain)

All six upstream decisions were grilled and locked (see "How this plan runs"): orchestration
model, variant count/method, paper-tile generation, CONFIRMED semantics + backend scope, sound,
and the first-run boundary. A 9-agent read-only audit this session also resolved the **"what
about Stage 3?"** question — `stage3Complete: false`, home-only — and folded the completion into
**Stage 0.5** within the Foundation session, per your request. **No open questions block starting
Pre-flight.**

Two items are explicitly **deferred, not open**: the Resend contact backend (out of scope; a
post-Stage-7 follow-up) and SEO discoverability (`seo-technical`/`seo-schema`/`seo-sitemap` —
schedule after Stage 7 per the spec).

---

## Immediate next action on approval

1. Correct the **`stage3-status` memory** (it claims "Stages 0–3 done"; the truth is home-only —
   `stage3Complete: false`, Stage 0.5 outstanding).
2. Persist this doc to `jawad-designs/SHOWSTOPPER-EXECUTION-PLAN.md` and `git add` it.
3. Bring up a served build and run the **Pre-flight finish-up workflow** above.
4. Stop at the **Pre-flight gate** with the baselines + WebP tile for your review before the
   **Foundation session (Stage 0 + 0.5)**.
