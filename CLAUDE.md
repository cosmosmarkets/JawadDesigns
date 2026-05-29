# CLAUDE.md

Guidance for Claude (and any AI agent) working in this repo. Read this before making changes. See `PROJECT_SETUP.md` for the full setup/deploy procedure and `AGENTS.md` for the agent operating contract.

## What we're building

A production Next.js portfolio for **Jawad Design** — a one-chef studio for portfolio sites and landing pages.

Visual direction: **cinematic duotone fine-dining** — high-contrast ember-on-charcoal, film-noir spotlighting, grain, candlelit warmth. The brand is **dark-only**.

**Current phase: home ported to parity.** The project is scaffolded and the static prototype's home (`k3-home.jsx` + the `k3-*.css` design system) has been ported into Next at full visual parity, dark-only, with tokens + atmosphere in place. The motion stack (GSAP/Lenis) and WebGL are installed but the scroll-driven motion overhaul has **not** started yet. **Next phase = the showstopper overhaul (Stages 0–7 in `jawad-design-showstopper-plan.md`)** — do not begin it without sign-off.

## Targets

- **GitHub:** https://github.com/cosmosmarkets/JawadDesigns — push everything here (`main` branch).
- **Vercel:** https://vercel.com/jawad-designs-projects1/jawad-designs — production deploys on push to `main`.

## Stack (do not substitute)

- Next.js **14.2.x** (App Router) + TypeScript, ESLint. **No `/src` dir.** Import alias `@/*`. React **18**. Package manager: **npm**.
- Tailwind CSS **3.4** + **shadcn/ui** (neutral base, CSS variables on).
- Motion: `gsap`, `@gsap/react` (`useGSAP`), `lenis`.
- WebGL: `three`, `@react-three/fiber`, `@react-three/drei` — **installed now, not used yet** (reserved for the later hero shader).
- Forms/backend: `@supabase/supabase-js`, `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `resend`, `sonner`.
- Content/util: `next-mdx-remote`, `next-themes`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`.

## Key rules

1. **Stay in scope.** The home is ported at **static parity** — GSAP scroll-reveals, the Lenis smooth-scroll layer, the WebGL hero, and the three signature moments are deferred to the showstopper Stages 0–7. Don't start that overhaul without sign-off. Non-home routes stay placeholders for now.
2. **Pin versions.** Keep Next on `14.2.x` and React on `18`. Do not bump to Next 15 / React 19.
3. **No `/src` dir.** App Router lives at the repo root: `app/`, `components/`, `lib/`, `hooks/`, `content/`.
4. **Dark only.** `next-themes` forced to dark. No theme toggle, no light variants.
5. **Design tokens first.** Duotone palette (charcoal / ember / candlelit warm), grain, and spotlight live as CSS variables in `globals.css`. shadcn tokens map onto these — don't hardcode hex values in components.
6. **shadcn lives in `components/ui/`; our components live in `components/site/`.**
7. **Use `cn()`** (clsx + tailwind-merge) for conditional classes. Use `class-variance-authority` for component variants.
8. **Motion via `useGSAP`** from `@gsap/react`, not raw `useEffect`. Smooth scroll via `lenis`.
9. **Never commit secrets.** `.env.local` is gitignored; `.env.example` is the committed template (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`).
10. **Three.js installed, dormant.** Do not wire up the WebGL hero until the showstopper overhaul.

## Routes

- `/` — the **ported real home** (static parity).
- `/work`, `/work/[slug]`, `/services`, `/about`, `/journal`, `/journal/[slug]`, `/contact`, and `not-found` — on-brand placeholders, real content TBD.

## Before you push

- `npm run lint` passes clean.
- `npm run build` succeeds.
- `npm run dev` shows the ported home with duotone tokens, grain, and the atmosphere layer (scroll motion intentionally absent until Stage 0).
- Commit with a clear message, push to `main`, confirm the Vercel production deploy is green.
