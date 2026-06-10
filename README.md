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

> Populated in Phase 2.
