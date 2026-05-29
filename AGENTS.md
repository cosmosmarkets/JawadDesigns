# AGENTS.md

Operating contract for any coding agent (Claude, Cursor, Copilot, etc.) working in this repository. This mirrors `CLAUDE.md`; if the two ever disagree, `CLAUDE.md` wins. Full procedure lives in `PROJECT_SETUP.md`.

## Project

Production Next.js portfolio for **Jawad Design**, a one-chef studio for portfolio sites and landing pages. Visual direction: cinematic duotone fine-dining (ember-on-charcoal, film-noir spotlighting, grain, candlelit warmth). **Dark-only brand.**

Migrated from a static HTML prototype to the full Next.js tech stack. **This phase = home ported to parity:** project scaffolded, design tokens + atmosphere in place, and the prototype's home ported into Next at full visual parity (dark-only). Scroll-driven motion (GSAP/Lenis), the WebGL hero, and the three signature moments are **deferred to the showstopper overhaul** (`jawad-design-showstopper-plan.md`, Stages 0–7). Non-home routes remain placeholders.

## Source of truth & destinations

- **Code:** this repo. Push everything to https://github.com/cosmosmarkets/JawadDesigns on `main`.
- **Deploy:** https://vercel.com/jawad-designs-projects1/jawad-designs — pushes to `main` deploy to production.

## Hard constraints

- **Stack is fixed** (see `CLAUDE.md` for the exact list). Do not add, drop, or substitute libraries without explicit instruction.
- Next.js **14.2.x**, React **18**, TypeScript, ESLint, **npm**.
- **No `/src` dir.** Import alias `@/*`. App Router at repo root.
- Tailwind **3.4** + shadcn/ui (neutral base, CSS variables on).
- `next-themes` **forced dark**, no toggle.
- `three` / `@react-three/fiber` / `@react-three/drei` are installed but **must stay unused** until the showstopper overhaul. (Pinned `@react-three/fiber@8` / `@react-three/drei@9` for React 18.)
- **No secrets in git.** `.env.local` gitignored; `.env.example` committed with placeholders.

## Layout

```
app/            # routes (App Router)
components/ui/  # shadcn components
components/site/# our components
lib/            # utilities (cn, clients)
hooks/          # custom hooks
content/        # MDX
```

Routes: `/` (multipage funnel), `/work`, `/work/[slug]`, `/menu`, `/about`, `/contact`, `/journal`, `/journal/[slug]`, `not-found`. `/work`, `/menu`, `/about`, and `/contact` now hold real content (split out of the old single-page home); `/services` was removed in favor of `/menu`. `/work/[slug]` and `/journal*` remain placeholders.

## Conventions

- Conditional classes via `cn()` (clsx + tailwind-merge). Variants via `class-variance-authority`.
- Colors come from CSS-variable design tokens in `globals.css` (charcoal / ember / candlelit warm + grain + spotlight). Do not hardcode hex in components.
- Animations via `useGSAP` (`@gsap/react`). Smooth scroll via `lenis`.
- Icons from `lucide-react`. Toasts via `sonner`. Forms via `react-hook-form` + `zod` + `@hookform/resolvers`.

## Definition of done (this phase)

1. `npm run dev` renders the ported home with duotone tokens, grain, and the atmosphere layer (scroll-driven motion intentionally absent until Stage 0).
2. Home renders at static parity with the prototype; non-home routes resolve with placeholder content; `not-found` renders.
3. `npm run lint` and `npm run build` pass clean.
4. Changes committed with a clear message, pushed to `main`.
5. Vercel production deploy is green.

## Working agreement

- The home is ported at static parity. Do not begin the showstopper overhaul (Stages 0–7) or build real content into the placeholder routes without sign-off — if a task implies either, stop and confirm first.
- Keep diffs focused and reviewable. One concern per commit.
- If a constraint here blocks the task, surface it rather than working around it silently.
