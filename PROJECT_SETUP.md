# Jawad Design — Project Setup

Production Next.js portfolio for **Jawad Design**, a one-chef studio building portfolio sites and landing pages. This document covers standing up the project from zero through first deploy.

- **Repo:** https://github.com/cosmosmarkets/JawadDesigns
- **Deploy:** https://vercel.com/jawad-designs-projects1/jawad-designs
- **Scope of this phase:** Stand up the project (tokens, atmosphere, dark-only theme) and **port the prototype's home into Next at static visual parity**. Scroll-driven motion (GSAP/Lenis), the WebGL hero, and the three signature moments are deferred to the showstopper overhaul (`jawad-design-showstopper-plan.md`, Stages 0–7). Non-home routes stay placeholders.

---

## 1. Visual direction

Cinematic duotone fine-dining. High-contrast ember-on-charcoal, film-noir spotlighting, grain, candlelit warmth. The brand is dark-only.

---

## 2. Stack (use exactly this)

- **Framework:** Next.js 14 (App Router) + TypeScript, ESLint, **no `/src` dir**, import alias `@/*`. Pin Next to **14.2.x** and **React 18**. Use **npm**.
- **Styling:** Tailwind CSS **3.4** + **shadcn/ui** (initialize non-interactively, neutral base, CSS variables on).
- **Motion:** `gsap`, `@gsap/react` (`useGSAP`), `lenis`.
- **WebGL (install now, use later):** `three`, `@react-three/fiber`, `@react-three/drei`.
- **Forms / backend:** `@supabase/supabase-js`, `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `resend`, `sonner`.
- **Content / util:** `next-mdx-remote`, `next-themes`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`.

---

## 3. Install

```bash
# 1. Scaffold (App Router, TS, ESLint, Tailwind, no src dir, alias @/*)
npx create-next-app@14 jawad-designs \
  --typescript --eslint --tailwind --app --no-src-dir \
  --import-alias "@/*" --use-npm

cd jawad-designs

# 2. Pin versions
npm install next@14.2.x react@18 react-dom@18

# 3. shadcn/ui (non-interactive, neutral base, CSS variables on)
npx shadcn@latest init -d --base-color neutral

# 4. Motion
npm install gsap @gsap/react lenis

# 5. WebGL (install now, do not use yet)
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three

# 6. Forms / backend
npm install @supabase/supabase-js @supabase/ssr react-hook-form zod @hookform/resolvers resend sonner

# 7. Content / util
npm install next-mdx-remote next-themes lucide-react clsx tailwind-merge class-variance-authority
```

> Confirm `package.json` pins `next` at `14.2.x` and `react`/`react-dom` at `18.x` after install.

---

## 4. Structure

Placeholder pages now, real content later.

**Routes**

```
/                    app/page.tsx
/work                app/work/page.tsx
/work/[slug]         app/work/[slug]/page.tsx
/services            app/services/page.tsx
/about               app/about/page.tsx
/journal             app/journal/page.tsx
/journal/[slug]      app/journal/[slug]/page.tsx
/contact             app/contact/page.tsx
not-found            app/not-found.tsx
```

**Folders**

```
components/
  ui/        # shadcn components
  site/      # our components (nav, footer, grain overlay, smooth scroll, etc.)
lib/         # utils (cn, supabase client, etc.)
hooks/       # custom hooks
content/     # MDX
```

---

## 5. Theme & tokens

- `next-themes` configured **dark only** (`forcedTheme="dark"` / no toggle).
- Define duotone tokens as CSS variables in `globals.css`: charcoal base, ember accent, candlelit warm highlight, plus grain/spotlight utilities.
- shadcn uses CSS variables, so map its tokens onto the brand palette.

---

## 6. Environment

Create `.env.example` (committed) and `.env.local` (gitignored) with placeholders:

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
RESEND_API_KEY=
```

---

## 7. Git

```bash
git init
# Ensure .gitignore covers: node_modules, .next, .env.local, .vercel, build output
git add -A
git commit -m "chore: scaffold Jawad Design foundation"
git branch -M main
git remote add origin https://github.com/cosmosmarkets/JawadDesigns.git
git push -u origin main
```

> `.env.local` must never be committed. `.env.example` is committed as the template.

---

## 8. Deploy (Vercel)

Target project: https://vercel.com/jawad-designs-projects1/jawad-designs

1. Import the GitHub repo `cosmosmarkets/JawadDesigns` into the Vercel project (or link via `vercel link`).
2. Framework preset: **Next.js** (auto-detected).
3. Add environment variables in Vercel project settings: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY`.
4. Production branch: `main`. Every push to `main` triggers a production deploy.

```bash
# Optional CLI path
npm i -g vercel
vercel link        # link to jawad-designs-projects1/jawad-designs
vercel --prod      # manual production deploy
```

---

## 9. Done-when (this phase)

- [x] `npm run dev` renders the **ported home** with duotone tokens + grain + atmosphere visible (scroll motion deferred to Stage 0).
- [x] Home matches the static prototype at parity across desktop/mobile; non-home routes resolve as placeholders and `not-found` renders.
- [x] `npm run build` and `npm run lint` pass clean.
- [ ] Pushed to GitHub `main` and a production deploy is live on Vercel.
