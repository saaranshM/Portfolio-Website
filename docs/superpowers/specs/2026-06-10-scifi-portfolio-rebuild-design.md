# Sci-Fi Portfolio Rebuild — Vue 2 → Nuxt 4 ("Flight Deck")

## Context

The repo is a 2021-era **Vue 2.6 + Vue CLI** portfolio SPA: custom SCSS, navy/mint brittanychiang-inspired theme, all content hardcoded in components, deployed to Firebase Hosting from a **committed `dist/`**. The owner wants a ground-up rebuild on **Nuxt 4** with a "crazy but neat" sci-fi theme — starfield, spaceships flying, lasers firing — plus refreshed content.

**User-confirmed decisions** (from clarifying questions):
- Full rewrite in this repo on latest Nuxt 4; keep Firebase Hosting + static generation.
- GPU-accelerated (WebGL) visuals where the device supports them, with tiered fallback per device capability.
- Palette: deep space `#030014 → #0a0a2e`, electric cyan `#00f0ff`, magenta `#ff2d78` laser accents, ice `#cfe9ff` text, translucent navy panels.
- **Playful** interactivity: click-to-fire lasers, ships dodge the cursor, one hidden easter egg.
- Content refreshed from GitHub (research complete — see §7) + clean data files with `TODO(saaransh)` placeholders for gaps. LinkedIn (`linkedin.com/in/saaransh-sunil-menon/`) is scrape-blocked; not a source.

**Design concept — "Flight Deck":** you're on the glass bridge of a ship parked above a quiet skirmish in deep space. One load-bearing rule: **chaos lives behind the glass (z-0 scene canvas); calm lives on it (z-10 HUD panels)**. Crazy in the background layer, neat in the foreground layer — every guardrail below derives from this.

## 1. Stack (versions verified June 2026)

| Package | Version | Purpose |
|---|---|---|
| `nuxt` | ^4.4.6 | framework; SSG via `nuxi generate` |
| `three` | ^0.183 | WebGL; r183 RenderPipeline + TSL bloom |
| `@tresjs/core` / `@tresjs/nuxt` / `@tresjs/cientos` | ^5.8.1 / ^5.1.0 / latest | declarative Three.js for Vue/Nuxt |
| `detect-gpu` | ^5 | GPU tier detection (dynamic import, ~8KB) |
| `@vueuse/motion` + `@vueuse/nuxt` + `@vueuse/core` | ^2.1 / latest | scroll reveals, media queries, visibility |
| `@nuxt/image`, `@nuxt/fonts`, `@nuxt/icon` | latest | images, self-hosted fonts, iconify |
| `sass` | ^1.80 | custom SCSS theme (deliberately **no Tailwind**, **no @nuxt/content**, **no @nuxtjs/seo** — built-ins suffice) |

Fonts via `@nuxt/fonts`: **Chakra Petch** (display), **Space Grotesk** (body), **JetBrains Mono** (HUD chrome).

**Known risk:** TresJS v5 exposure of Three r183's `RenderPipeline`/TSL bloom needs verification at implementation time; if incompatible, fall back to `pmndrs/postprocessing` UnrealBloom-style pass. Bloom is Tier-full-only either way.

## 2. Repo transition (Phase 0)

- Branch `nuxt4-rebuild`.
- Salvage to a temp dir: `src/assets/img/me/*`, `src/assets/img/projects/*` (breast-cancer.jpg, chat-app.jpg), `src/assets/img/logos/*`, `public/favicon.png`.
- `git rm -r`: `src/`, `dist/`, `.firebase/`, `babel.config.js`, `vue.config.js`, `package-lock.json`, `yarn.lock`, old `public/index.html`.
- New `.gitignore`: add `.nuxt/`, `.output/`, `dist/`, `.firebase/`, `node_modules/`, `.env` — build output never committed again.
- Keep: `.git`, `.firebaserc` (project `vue-express-54b2e`), `firebase.json` (rewritten in Phase 6), `README.md` (rewritten).
- Save the design spec (this plan's §1–§8) to `docs/superpowers/specs/2026-06-10-scifi-portfolio-rebuild-design.md` and commit, per brainstorming workflow.

## 3. New directory layout

```
nuxt.config.ts            # modules, css entry, nitro.prerender.routes ['/'], head defaults
app/
├── app.vue               # shell: FxLayer + NuxtPage; useHead (lang, theme-color #030014, JSON-LD Person)
├── error.vue             # themed "SIGNAL LOST // 404"
├── assets/scss/
│   ├── _tokens.scss      # palette/type/z-stack tokens; HudPanel/bracket/scanline/glitch mixins
│   ├── _base.scss        # reset, 62.5% rem base, body gradient + CSS nebula, selection, focus-visible
│   ├── _typography.scss  # font scale, decode/glitch keyframes (reduced-motion gated)
│   └── main.scss
├── data/                 # ALL content lives here — components never hardcode copy
│   ├── types.ts          # Profile, SkillGroup, Project, SocialLink, NavItem interfaces
│   ├── profile.ts        # name, role "Tech Lead @ Mosambee", bio, email(TODO), location, resumeUrl(TODO)
│   ├── skills.ts         # 4 groups: FRONTEND ARRAY / BACKEND CORE / ML-NLP LAB / DEPLOY BAY
│   ├── projects.ts       # featuredProjects[4] + otherProjects[6] (see §7)
│   └── socials.ts        # github, linkedin, twitter, medium, instagram
├── pages/index.vue       # section composition + useSeoMeta (og/twitter cards)
├── layouts/default.vue   # SiteHeader, side rails, <main id="main">, SiteFooter, skip-link
├── components/
│   ├── site/             # SiteHeader (hide-on-scroll-down nav, mobile <dialog> menu),
│   │                     # SiteFooter, SideRails (socials left / email right), FxToggle, BootOverlay
│   ├── sections/         # HeroSection, AboutSection, SkillsSection, FeaturedProjects,
│   │                     # OtherProjects, ContactSection
│   ├── ui/               # HudPanel (signature primitive), SectionHeading, ProjectCard,
│   │                     # TechTag, GlowLink, DecodeText
│   └── fx/
│       ├── FxLayer.vue   # <ClientOnly> tier switchboard, fixed full-viewport, z-0,
│       │                 # aria-hidden, pointer-events:none; #fallback = StaticBackdrop
│       ├── StaticBackdrop.vue   # tier 'off': CSS gradient + ~80 CSS twinkle stars (static if reduced-motion)
│       ├── StarfieldLite.vue    # tier 'lite': Canvas-2D 2-layer parallax starfield + 2D laser streaks
│       └── scene/        # tier 'full' — ONE lazy chunk (LazyFxSceneRoot hydrate-on-idle)
│           ├── SceneRoot.vue    # TresCanvas, renderer, bloom, render loop owner, dispose on unmount
│           ├── Starfield.vue    # 3 instanced layers (~2500 far / 800 mid / 90 near dust), 3 draw calls
│           ├── ShipSwarm.vue    # 4 procedural low-poly ships (~80 tris, BufferGeometry, no glTF)
│           ├── LaserSystem.vue  # pooled bolts (max 8), spark/ring impacts, emissive → bloom
│           └── useSceneState.ts # NON-reactive shared state: cursor NDC, laser queue, ship refs
├── composables/
│   ├── useEffectsTier.ts # singleton: tier 'off'|'lite'|'full' + setOverride (see §4)
│   ├── useLaserInput.ts  # window pointerdown/move → scene state queue (see §6)
│   ├── useEasterEgg.ts   # Konami / 5-tap logo → warpMode + dogfight (see §6)
│   └── useScrollSpy.ts   # IntersectionObserver nav highlight
└── utils/constants.ts    # Tier enum, z-stack names, breakpoints
public/                   # favicon, og-image.png(TODO), resume.pdf(TODO), robots.txt
```

Z-stack contract: `z-0` scene → `z-5` scrims → `z-10` content → `z-20` static scanline overlay (3% opacity, no pointer events) → `z-30` nav → `z-40` boot overlay/toasts.

## 4. Effects-tier system

`useEffectsTier.ts` — SSR + first paint = `'off'` (StaticBackdrop, so prerendered HTML/no-JS/slow devices share one correct baseline; no hydration mismatch). `onMounted` detection, first match wins:
1. `localStorage['fx-tier']` user override (set via `FxToggle` in footer) → use it
2. `prefers-reduced-motion: reduce` (live-reactive via `useMediaQuery`) → `'off'`
3. No WebGL2 context → `'lite'`
4. dynamic `import('detect-gpu')` tier ≤ 1, or `deviceMemory < 4`, or `hardwareConcurrency <= 2` → `'lite'`
5. else → `'full'`

FxLayer mounts exactly one backdrop with `v-if` (not `v-show`) so the Three renderer fully disposes on downgrade. Render loop pauses when tab hidden. **FPS watchdog:** <45fps sustained 5s → live downgrade one tier + mono toast `POWER SAVING MODE`. Coarse-pointer/mobile on `'full'`: 2 ships, no bloom, DPR cap 1.5, no tap-to-fire, no cursor-dodge.

## 5. Experience spec (per section)

**Scene (hero, persists page-wide):** 3-layer parallax starfield (pointer parallax ×0.02/×0.06/×0.14 + scroll parallax); CSS-only nebula gradients (survive all tiers); 4 ships (3 cyan "darts", 1 magenta "raider") on CatmullRom patrol loops (20–35s laps, banking roll ≤35°) that **arc around a central content exclusion zone**; ambient 2-bolt volley every 8–14s, max 1 airborne. Lasers: pooled stretched quads, white-hot core + cyan/magenta emissive sleeve, ~0.5s viewport crossing, 12-particle spark + expanding ring on impact. Bloom (full tier only): strength 1.2, radius 0.4. Below the fold: 30fps cap, 2 far ships, 0 ambient volleys.

**Hero:** 760px left column over a permanent elliptical ink-wash scrim (`rgba(3,0,20,.78)` → transparent) so text contrast never depends on the scene. Copy sequence ≤1.8s total: mono decode `// INCOMING TRANSMISSION` → name in Chakra Petch 700 (`clamp(4.4rem,8vw,8.4rem)`) with one 150ms RGB-split settle → decode `TECH LEAD // FULL-STACK + NLP` → paragraph + CTA `[ OPEN CHANNEL ↗ ]`. **DecodeText replaces typed.js** (no 2.6s start delay).

**Sections** (scroll-reveal grammar everywhere via `@vueuse/motion` `visibleOnce`, ≤700ms, fires once: index decodes → header rule sweeps → panel brackets draw → children fade-up 16px / 60ms stagger):
1. **Nav** — fixed 64px translucent panel; mono items `01 // ABOUT … 04 // CONTACT` + `[ RESUME ]`; hide-on-scroll-down (keeps old behavior); mobile = full-screen `<dialog>` (free focus trap + Esc).
2. **About — "PERSONNEL FILE"** — portrait in bracketed frame, duotone with cyan scan-sweep, full color on hover; bio + mono pull-stats (`YRS / REPOS / ROLE`).
3. **Skills — "SYSTEMS MATRIX"** — **kill the 2010s percentage progress bars.** 4 sub-panels (`SYS.01 — FRONTEND ARRAY` …); each skill = mono chip + 5-segment power cell (honest ordinal scale) charging left→right on reveal.
4. **Featured — "MISSION LOGS"** — 4 alternating dossiers: bracketed screenshot (duotone, lifts on hover) + overlapping HudPanel with `MISSION 01 // EST. 2026` strap, title, description, tech chips, `[ SRC ] [ LIVE ]`.
5. **Other — "HANGAR BAY"** — 3/2/1-col grid of 6 cards, unique line-art ship glyph + `CRAFT-01…06` IDs; hover: lift, border brighten, brackets extend.
6. **Contact — "OPEN CHANNEL"** — narrow centered panel, `SEND TRANSMISSION` mailto CTA; one scripted ship crossing behind it on reveal (the only below-fold scene moment).
7. **Footer** — mono build line `ENGINEERED BY SAARANSH MENON // BUILD 2026.06 // [ SOURCE ]`, socials, FxToggle, signal-pulse dot on a 1px rule.

**Loading:** kill the 3.5s blocking loader. SSG HTML paints <300ms on the gradient; non-blocking 900ms boot garnish (cyan sweep line + 3 mono status lines, z-40, pointer-events none), skipped on repeat visits (`sessionStorage`) and reduced-motion. WebGL never on the critical path — scene fades in whenever its lazy chunk lands.

## 6. Interactivity spec

- **Click-to-fire:** window `pointerdown`, fine pointers only, suppressed when `event.target.closest('a,button,input,textarea,select,[role=button],[data-no-fire]')` or text selection active — **links always win**. Twin cyan bolts from bottom viewport corners converge on the unprojected click point; 250ms cooldown, max 4 player bolts; HTML crosshair blip at cursor. Near-miss within 90 screen-px of a ship → dodge + 200ms shield shimmer (ships are never destroyed). After 5 hits: one-per-session toast `TARGETING SYSTEMS: CALIBRATED`. On `'lite'`: same input drives Canvas-2D streaks; on `'off'`: inert. **No sound.**
- **Dodge steering** (per frame, plain objects + `shallowRef` meshes — zero Vue reactivity in the loop): `accel = clamp(k_follow·(curvePoint−pos) + flee, maxAccel)` where flee = `k_flee·(1−d/120px)` away from cursor inside 120 screen-px, with a 0.3s 1.5× "startled burst" on radius entry, easing back to patrol over ~1.2s.
- **Easter egg:** Konami code (touch: 5 taps on logo in 2s) → 8s dogfight: 6 extra ships warp in, bolt cap 16, dreadnought silhouette slides across far background, magenta EMP ring clears it; toast `SIMULATION COMPLETE // THANKS FOR VISITING`. Once per session; suppressed on `'lite'`/`'off'`/reduced-motion.

**"Neat" guardrails (hard limits):** body text ≥16px always on translucent panels, never raw over moving starfield; magenta never for text <18px, max one magenta element + one animating attention-getter per viewport; glitch effects one-shot ≤200ms, never looping, never on body text; scanlines static at 3%; ship paths avoid content exclusion zone; 2px cyan `:focus-visible` rings; canvases `aria-hidden`; decode text animates a visual clone over real text with `aria-label`.

## 7. Refreshed content (research done, lives in `app/data/`)

GitHub facts: **Tech Lead @ Mosambee, Mumbai** — role/bio updated from "student vibe" to tech-lead framing.

- **Featured (4):** Instagram Comment Analyzer *(new — hybrid NER, GLiNER + fuzzy matching; most recent work)*, Vue Account Manager *(new)*, Live Chat App with Rooms *(carried over)*, Breast Cancer Detector *(carried over)*.
- **Other (6):** Expense Tracker (full-stack), Contact Manager (React/Redux), Movie Review Sentiment Analyzer, Phishing Website Detector, Node Weather App, Next.js Demo App.
- **Skills (4 groups):** Frontend (Vue, React/Redux, Next.js, JS/TS, CSS/SCSS) · Backend (Node, Express, Socket.io, MongoDB, Firebase) · ML/NLP (GLiNER/NER, TensorFlow, Scikit-Learn, OpenCV, Python) · Deploy (Vercel, Firebase, Streamlit/Flask).
- **`TODO(saaransh)` placeholders** (inline above fields in data files only + README "Content checklist"): confirm email (GitHub shows `debashis.panda@mosambee.com` — likely not the portfolio contact; old site used `saaransh.dev2811@gmail.com`), updated bio paragraphs, Mosambee role details/timeline, new resume PDF → `public/resume.pdf`, screenshots for the 2 new featured projects, OG image, descriptions for sparse repos.

## 8. SEO / a11y / deploy

- `useSeoMeta` (title, description, OG/twitter card), JSON-LD `Person`, canonical, `lang="en"`, `theme-color`. Verify prerendered HTML contains all content: `grep "Instagram Comment Analyzer" .output/public/index.html`.
- Landmarks: skip-link, one `<header>/<main>/<footer>`, sections `aria-labelledby`; full keyboard walkthrough required.
- `firebase.json`: `"public": ".output/public"`, drop the SPA rewrite (fully prerendered; generated 404 works), add immutable cache header for `/_nuxt/**`.
- `package.json` scripts: `dev` / `generate` / `preview` / `typecheck` / `deploy` (`nuxt generate && firebase deploy --only hosting`) / `deploy:preview` (Firebase hosting channel `staging`).

## 9. Implementation phases & verification

| Phase | Build | Verify |
|---|---|---|
| **0 Prune** | Branch; salvage assets; delete old code/dist/locks; .gitignore; commit design spec | `git status` clean; `git ls-files \| grep -c '^dist/'` = 0 |
| **1 Scaffold + theme** | Nuxt 4 init; modules; SCSS tokens/base/typography; fonts; layout shell + StaticBackdrop | `npm run dev` shows themed shell; `generate` + `typecheck` pass |
| **2 Content site** | data files w/ TODOs; all 6 sections; header/footer/rails; SEO; error.vue | Complete site with **zero WebGL**; grep generated HTML for titles; Lighthouse a11y+SEO ≥95; keyboard-only pass |
| **3 Tier system + lite FX** | useEffectsTier, FxLayer, StarfieldLite, FxToggle, boot garnish | toggle cycles tiers live; OS reduced-motion kills all motion; lite frame <4ms |
| **4 Full 3D scene** | SceneRoot, Starfield, bloom (verify TresJS×r183 here; fallback pmndrs) | 60fps desktop; three chunk absent from network on `'lite'`/`'off'`; tab-hide pauses; pre-3D JS <120KB gz |
| **5 Play layer** | ShipSwarm dodge, LaserSystem, useLaserInput, easter egg, scroll reveals | clicking links never fires; ships dodge; Konami works; text panels stay readable |
| **6 Deploy** | firebase.json, scripts; preview channel first | preview URL tested across tiers (DevTools GPU-blocklist + reduced-motion emulation); `npm run deploy`; check saaranshmenon.me |

Sequencing rationale: Phase 2 yields a shippable, accessible site before any GPU code exists; the tier system is built **before** the expensive scene so the fallback path is never an afterthought; every later phase is independently cuttable/shippable.

**End-to-end verification:** `npm run generate && npm run preview` → manual pass per tier (force via FxToggle + DevTools emulation), keyboard-only navigation, Lighthouse (Perf/a11y/SEO/Best-practices), then staged Firebase preview channel before production deploy.
