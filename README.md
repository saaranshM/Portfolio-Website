# Flight Deck — Portfolio of Saaransh Menon

A sci-fi Nuxt 4 portfolio ([saaranshmenon.me](https://saaranshmenon.me)): a calm HUD of translucent panels parked over a starfield skirmish. Chaos lives behind the glass; calm lives on it.

## Stack

- [Nuxt 4](https://nuxt.com) — static generation via `nuxt generate`
- [Vue 3](https://vuejs.org) + TypeScript (strict)
- [Sass](https://sass-lang.com) — hand-rolled "Flight Deck" design system (no Tailwind)
- `@nuxt/image` · `@nuxt/fonts` (Chakra Petch / Space Grotesk / JetBrains Mono, self-hosted) · `@nuxt/icon` (icons bundled, no CDN) · `@vueuse/nuxt`
- [TresJS](https://tresjs.org) + [Three.js](https://threejs.org) — the WebGL starfield/ship/laser scene, loaded as a lazy chunk on capable devices only

## Architecture

- **Content** lives in `app/data/*.ts` (typed; components never hardcode copy). Update projects/skills/bio there.
- **Design system**: `app/assets/scss/_tokens.scss` is the single source for palette, z-stack, spacing, and the HUD mixins (panels, corner brackets, duotone, focus rings). The full design spec is committed at `docs/superpowers/specs/2026-06-10-scifi-portfolio-rebuild-design.md`.
- **Effects tiers** (`app/composables/useEffectsTier.ts`): `off` (static CSS backdrop — also the SSR/no-JS/reduced-motion baseline) → `lite` (Canvas-2D starfield + 2D laser streaks) → `full` (lazy WebGL scene: parallax starfield, patrolling ships, click-to-fire lasers, a Konami-code surprise). Resolved per device via reduced-motion / WebGL2 / `detect-gpu`; the footer `FX` toggle pins it (persisted in `localStorage['fx-tier']`); an FPS watchdog downgrades live sessions that can't hold 45fps.
- `public/fx-benchmarks/` is gitignored but required — `npm install`'s postinstall vendors detect-gpu's benchmark DB there (`scripts/copy-gpu-benchmarks.mjs`) so tier detection never calls a CDN.

## Usage

```sh
npm install

npm run dev        # dev server at http://localhost:3000
npm run generate   # prerender static site to .output/public
npm run preview    # serve the generated output locally
npm run typecheck  # vue-tsc via nuxt typecheck
```

## Deploy

Firebase Hosting (project `vue-express-54b2e`), serving the prerendered `.output/public` — fully static, no SPA rewrite. Dead URLs get the generated `404.html` (note: it renders the themed SIGNAL LOST page client-side; no-JS visitors see a dark shell). Hashed assets (`/_nuxt`, `/_fonts`) get immutable cache headers; HTML and payloads revalidate on every request.

```sh
npm run deploy:preview   # generate + deploy to the "staging" preview channel
npm run deploy           # generate + deploy to production
```

Requires an authenticated Firebase CLI (`firebase login`).

## Content checklist

Every `TODO(saaransh)` in `app/data/` — resolve before launch:

- [ ] `profile.ts` — review bio wording
- [ ] `profile.ts` — confirm contact email (GitHub profile shows a different work email; old site used `saaransh.dev2811@gmail.com`)
- [ ] `profile.ts` — drop the new resume PDF into `public/resume.pdf`
- [ ] `skills.ts` — adjust skill levels (honest ordinals on the 5-segment power cells)
- [ ] `projects.ts` — Instagram Comment Analyzer: add a screenshot
- [ ] `projects.ts` — Vue Account Manager: expand the description
- [ ] `projects.ts` — Vue Account Manager: add a screenshot
- [ ] `projects.ts` — Live Chat App: old Heroku live link is dead — redeploy or leave SRC-only
- [ ] `projects.ts` — Breast Cancer Detector: verify the Streamlit deployment is still live
- [ ] `projects.ts` — Expense Tracker: confirm client + server repo names
- [ ] `projects.ts` — Phishing Website Detector: confirm exact repo name
- [ ] `socials.ts` — confirm the Medium account is still active
- [ ] `public/og-image.png` — add the OG share image (referenced by the SEO meta)
