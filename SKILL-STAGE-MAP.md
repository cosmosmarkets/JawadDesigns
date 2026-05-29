# Skill → Stage Map

Companion to `jawad-design-showstopper-plan.md`. Maps every relevant **project skill** (in `jawad-designs/.claude/skills/`) to the stage(s) where you should invoke it by name.

**Read first:** these skills only load when you run **Claude Code with `jawad-designs/` as the working directory**. They are NOT visible from the parent `Jawad Design/` folder or from Cowork chat. `git add .claude` and commit before you start — it's currently untracked.

---

## The motion stack (GSAP)

| Skill | When to invoke | Why |
|---|---|---|
| `gsap-react` | **Every motion stage (0,2,3,4,5)** — invoke first | The codebase uses `useGSAP` from `@gsap/react` (CLAUDE.md rule 8). This is the framework-correct entry point; lead with it, not `gsap-core`. |
| `gsap-core` | Stages 0, 2, 5 | Core tweens/eases for the hero timeline and ticket. |
| `gsap-timeline` | Stages 2, 3, 4 | The choreographed sequences: plating hero, process scrub, menu unfold. |
| `gsap-scrolltrigger` | Stages 0, 3, 5 | Foundation batch reveals, the pinned process scrub, the scroll-driven ticket feed. |
| `gsap-plugins` | Stages 2, 3 (and Pre-flight smoke test) | SplitText masked line reveals + ScrollTrigger/ScrollSmoother specifics. SplitText is free as of GSAP 3.13 — no licensing step. |
| `gsap-performance` | **Pre-flight + Stages 2, 3, 5, 7** | The hard perf budget (≤150KB JS, LCP ≤2.5s, 60fps) is checked every stage. This is the skill that enforces it — especially around the WebGL shader (S2) and the persistent ticket (S5). |
| `gsap-utils` | As needed (S3, S6) | `gsap.utils` helpers for mapping scroll progress, snapping, interpolation. |
| `gsap-frameworks` | Reference | Next/SSR integration gotchas if hydration issues appear. |

## Design / material

| Skill | When to invoke | Why |
|---|---|---|
| `taste-skill` | Stages 1, 4, 6 | The "bespoke vs generic" judgment — material pass, menu fold, editorial layout. |
| `redesign-skill` | Stage 1 | Driving the duotone/film-noir material transformation. |
| `frontend-design` | Stage 6 | Editorial/broken-grid layout craft. |
| `ui-styling` | Stage 1 | Layered shadow, ember rim-light, brass letterpress/emboss treatments. |
| `ui-ux-pro-max` | Stages 4, 6 | Keeps the menu fold (S4) and editorial sections (S6) accessible + hierarchy-disciplined. |
| `design-system` | Stage 6 (+ Stage 1 tokens) | Token-driven type scale + baseline grid so editorial sizes aren't hardcoded (CLAUDE.md rule 5). |
| `brandkit` | Pre-flight (optional) | Lock the charcoal/ember/brass/gold duotone as a reusable brand artifact. |
| `brutalist-skill` / `minimalist-skill` | Direction reference only | Do not apply wholesale — pull tension ideas for Stage 6. |

## Assets

| Skill | When to invoke | Why |
|---|---|---|
| `imagegen-frontend-web` | **Pre-flight** | Generate the reference frames/textures: plate, spotlight pool, paper/card texture, brass crest, garnish, thermal paper, grain. Do this up front so later stages aren't art-blocked. |
| `image-to-code-skill` | Pre-flight → Stages 1, 2, 4 | Turn a generated reference frame into an actual component/CSS rather than shipping a raster. |

## QA / performance / discoverability

| Skill | When to invoke | Why |
|---|---|---|
| `seo-unlighthouse` | **Pre-flight + Stage 7** | Scripts the Lighthouse score (baseline in Pre-flight, the 90+ target in Stage 7) so the perf gate is pass/fail, not eyeballed. |
| `seo-technical` / `seo-schema` / `seo-sitemap` | **After Stage 7** (out of motion scope) | A premium portfolio still has to be found. Schedule a discoverability pass once the visual overhaul ships. |

---

## Quick per-stage call sheet

- **Pre-flight:** `imagegen-frontend-web`, `image-to-code-skill`, `gsap-performance`, `seo-unlighthouse`, `gsap-plugins` (SplitText smoke test), optionally `brandkit`.
- **Stage 0 (foundation):** `gsap-react`, `gsap-core`, `gsap-scrolltrigger`.
- **Stage 1 (material):** `taste-skill`, `redesign-skill`, `ui-styling`, `design-system`.
- **Stage 2 (hero):** `gsap-react`, `gsap-timeline`, `gsap-core`, `gsap-plugins`, `gsap-performance`.
- **Stage 3 (motion baseline + scrub):** `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-plugins`, `gsap-performance`.
- **Stage 4 (menu unfold):** `gsap-react`, `gsap-timeline`, `taste-skill`, `ui-ux-pro-max`.
- **Stage 5 (printing ticket):** `gsap-react`, `gsap-scrolltrigger`, `gsap-core`, `gsap-performance`.
- **Stage 6 (editorial layout):** `taste-skill`, `frontend-design`, `ui-ux-pro-max`, `design-system`.
- **Stage 7 (QA):** `gsap-performance`, `seo-unlighthouse`.
- **Post-launch (discoverability):** `seo-technical`, `seo-schema`, `seo-sitemap`.
