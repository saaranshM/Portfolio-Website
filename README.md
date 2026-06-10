# Flight Deck — Portfolio of Saaransh Menon

A sci-fi Nuxt 4 portfolio ([saaranshmenon.me](https://saaranshmenon.me)): a calm HUD of translucent panels parked over a starfield skirmish. Chaos lives behind the glass; calm lives on it.

## Stack

- [Nuxt 4](https://nuxt.com) — static generation via `nuxt generate`
- [Vue 3](https://vuejs.org) + TypeScript (strict)
- [Sass](https://sass-lang.com) — hand-rolled "Flight Deck" design system (no Tailwind)
- `@nuxt/image` · `@nuxt/fonts` (Chakra Petch / Space Grotesk / JetBrains Mono, self-hosted) · `@nuxt/icon` · `@vueuse/nuxt`
- WebGL scene (Three.js / TresJS) lands in a later phase, behind a device-tier fallback system

## Usage

```sh
npm install

npm run dev        # dev server at http://localhost:3000
npm run generate   # prerender static site to .output/public
npm run preview    # serve the generated output locally
npm run typecheck  # vue-tsc via nuxt typecheck
```

## Deploy

Firebase Hosting (project `vue-express-54b2e`), serving the prerendered `.output/public`. Deploy scripts and `firebase.json` rewrite are finalized in a later phase.

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
