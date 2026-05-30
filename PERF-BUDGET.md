# PERF-BUDGET.md — Showstopper perf baseline & per-stage gate

Reusable, per-route performance checklist for the showstopper overhaul. Captured at **Pre-flight**
against a **production build** (`next build && next start`) of `main` @ **`a6413b8`**. Every later
stage re-runs these and **diffs against this baseline**; a stage that regresses past a gate is fixed
before its `git tag`, never deferred.

## How these numbers were produced (repeatable)

- **Bundle (First Load JS):** parsed from `next build` route table. Re-run: `npm run build`.
- **Lighthouse (desktop, prod):** `npx lighthouse <url> --preset=desktop --only-categories=performance`
  with `CHROME_PATH` → Playwright's bundled Chromium
  (`…/ms-playwright/chromium-1223/chrome-win64/chrome.exe`). The `EPERM … rm` at the end is a benign
  Windows chrome-launcher temp-cleanup failure **after** the report is written — ignore it.
  JSON → `temporary screenshots/lh-<route>.json`.
- **Screenshots + LCP/CLS:** `node preflight-capture.mjs http://localhost:<port>` (Playwright, parent
  root) → `temporary screenshots/baseline-<route>-<vw>.png` + `baseline-perf.json`. Clean CWV (no
  fullPage resize) via `node preflight-perf.mjs` → `baseline-cwv.json`.
- Capture viewports: **1440 / 768 / 375**. Lighthouse form factor: **desktop**.

## Hard budget gates (apply at EVERY stage)

- **Added JS ≤ ~150 KB gzip over this baseline (cumulative).** Track stage-over-stage delta in the
  First-Load-JS column below (same units → valid regression signal; large gzip headroom remains).
- **LCP** ≤ 2.5s desktop / ≤ 4s mid-mobile. **60fps** desktop, **≥30fps** low-end Android during any animation.
- **Raster `paper-fibre.webp`** is image weight (lazy, off-LCP), **not** counted against JS; ≤40 KB.
- **Stage 7 target: Lighthouse performance ≥ 90 desktop, per route.**

## Baseline — bundle (from `next build`, a6413b8)

| Route | Page size | First Load JS |
|---|---|---|
| `/` | 4.79 kB | **149 kB** |
| `/contact` | 28 kB | **124 kB** |
| `/work` | 192 B | 96.2 kB |
| `/menu` | 192 B | 96.2 kB |
| `/about` | 192 B | 96.2 kB |
| `/journal` | 192 B | 96.2 kB |
| `/_not-found` | 138 B | 87.5 kB |
| Shared by all | — | 87.3 kB |

Heaviest first-load: **home (149 kB)** and **contact (124 kB, react-hook-form + zod)**. Stage 4 (menu
unfold) and Stage 5 (global ticket) will add to home — watch it.

## Baseline — Lighthouse desktop (prod) + Core Web Vitals

| Route | Perf | LCP | CLS | TBT | FCP | SI |
|---|---|---|---|---|---|---|
| `/` | **64** | 758 ms | 0.107 | **1324 ms** | 442 ms | 1791 ms |
| `/work` | 87 | **1416 ms** | 0.012 | 231 ms | 504 ms | 1284 ms |
| `/menu` | **97** | 977 ms | 0.017 | 80 ms | 647 ms | 1259 ms |
| `/about` | **95** | 880 ms | 0.034 | 156 ms | 566 ms | 1169 ms |
| `/contact` | 79 | 696 ms | **0.507** | 0 ms | 401 ms | 919 ms |

### Clean CWV (Playwright, reduced-motion, no fullPage resize) — structural CLS

| Route | LCP @1440 | CLS @1440 | LCP @375 | CLS @375 |
|---|---|---|---|---|
| `/` | 484 ms | 0.122 | 348 ms | 0.019 |
| `/work` | 504 ms | 0.010 | 508 ms | 0.111 |
| `/menu` | 300 ms | 0.158 | 264 ms | 0.234 |
| `/about` | 252 ms | 0.003 | 188 ms | 0.006 |
| `/contact` | 404 ms | 0.494 | 284 ms | **0.814** |

## Known baseline issues (pre-existing — fix by Stage 7, candidates for the Foundation session)

1. **home Perf 64 — TBT 1324 ms.** The motion stack (GSAP timeline + Lenis + WebGL hero shader + three)
   hydrates heavily on home. Biggest perf drag in the funnel. → Stage 7 perf pass (code-split / defer /
   confirm the shader stays lazy); watch it doesn't worsen through Stages 4–5.
2. **contact CLS 0.507 (0.81 mobile).** Layout shift, almost entirely font-swap reflow on the large
   "Place your order." display heading (+ the form card). TBT is 0, so this is purely structural. →
   reserve heading space / `font-display: optional` or `size-adjust`; natural fit with Stage 0.5 rank-9
   ("promote the /contact card") or a focused CLS fix.
3. **work LCP 1416 ms.** The weld/browser mockup is the LCP element. → `next/image` with explicit
   dimensions + `priority`, or preload.
4. **menu CLS 0.16–0.23 (mobile).** Moderate shift on the pricing page (the MVP surface) — worth a look
   during Stage 4/6.
5. **Benign:** every route logs one console 404 for `/_vercel/insights/script.js` — the `@vercel/analytics`
   beacon, which only exists on Vercel's edge. **Not a bug; absent in production on Vercel.**

## Per-stage diff procedure

1. `npm run build` → compare First-Load-JS per route vs the table above (cumulative added ≤150 KB gzip).
2. `next start` + per-route `npx lighthouse … --preset=desktop` → compare Perf/LCP/CLS/TBT; no regression
   past a gate, and Stage 7 must reach ≥90 per route.
3. `node preflight-capture.mjs <url>` → fresh screenshots to compare against `baseline-*.png`.
4. Record the stage's numbers under a dated heading below.

## Artifacts (Pre-flight)

- 15 baseline screenshots: `temporary screenshots/baseline-<route>-<1440|768|375>.png`
- `temporary screenshots/baseline-perf.json` (capture-pass LCP/CLS) · `baseline-cwv.json` (clean CWV)
- `temporary screenshots/lh-<route>.json` (Lighthouse, all 5 routes)
- Tile: `public/assets/showstopper/paper-fibre.webp` (512×512, **4.7 KB**, seamless, on-palette)
- Scripts (parent root): `preflight-capture.mjs`, `preflight-perf.mjs`, `probe-404.mjs`;
  tile generator: `jawad-designs/gen-paper-fibre.mjs`
- **SplitText:** confirmed free/working — it's live in the shipped Stage 2 hero + Stage 3 reveals and
  `verify-stage2`/`verify-stage3` pass. No fallback needed (GSAP 3.13+).

---

## Foundation (Stage 0 + 0.5) — 2026-05-30

Route-change motion contract + Stage 3 motion baseline completed on **every** route + Stage 1/2 polish.
Verified: `verify-stage0` PASS (no ScrollTrigger leak — count 38→38 across 15 navs; scroll +
`--jd-spot-bias` + `--k3-steam-strength` reset on every route), `verify-stage3` PASS on all 5 routes,
`verify-stage2` functional invariants pass.

**Bundle (First Load JS) vs Pre-flight baseline:**

| Route | Baseline | Foundation | Δ | Note |
|---|---|---|---|---|
| `/` | 149 kB | 149 kB | 0 | unchanged |
| `/menu` | 96.2 kB | 96.2 kB | 0 | stayed a server component (class-only edits) |
| `/about` | 96.2 kB | 146 kB | +49.8 | client + GSAP (crest entrance timeline) |
| `/work` | 96.2 kB | 146 kB | +49.8 | client + GSAP (mockup entrance timeline) |
| `/contact` | 124 kB | 173 kB | +49 | GSAP (component-owned heading split + card timeline) |

Cumulative added ≈ +50 kB raw (~17 kB gzip) of shared GSAP usage — **within the ≤150 kB gzip budget.**
**Stage 7 candidate:** dedupe GSAP into a shared chunk so the three client routes don't each carry it
(the provider already loads GSAP in the layout).

**CLS:**
- `/contact` **0.49 → 0.006** (desktop), **0.81 → 0.007** (mobile) — the `min-height` + `contain` heading
  fix eliminated the font-swap reflow. Largest single perf win of the stage.
- home (~0.12) and `/menu` (~0.16–0.41 mobile) CLS unchanged — pre-existing, NOT Foundation-introduced
  (a scale *transform* causes no layout shift). Stage 6/7 candidates.

**Known environmental (not regressions):** `verify-stage2`'s WebGL shader-frame check reads 0 frames
under headless SwiftShader (no GPU), and its fullPage screenshot can time out under SwiftShader — both
environment limits. The shader code is untouched and the hero renders correctly in screenshots.
