/**
 * Flight Deck — shared constants.
 */

/** Effects tiers, lowest to highest. Resolved at runtime in Phase 3. */
export const TIERS = ['off', 'lite', 'full'] as const
export type Tier = (typeof TIERS)[number]

/** localStorage key for the FxToggle tier override (`useEffectsTier`). */
export const FX_TIER_STORAGE_KEY = 'fx-tier'

/** sessionStorage flag — the boot garnish plays once per tab session. */
export const BOOT_SESSION_KEY = 'boot-played'

/** sessionStorage flag — TARGETING SYSTEMS: CALIBRATED toast (5 player
 *  near-misses) fires once per tab session (LaserSystem). */
export const CALIBRATED_SESSION_KEY = 'fx-calibrated'

/** sessionStorage flag — the easter-egg dogfight runs once per tab session
 *  (useEasterEgg). */
export const EGG_SESSION_KEY = 'fx-egg-played'

/** Breakpoints (px). Keep in sync with app/assets/scss/_tokens.scss. */
export const BREAKPOINT_MOBILE = 780
export const BREAKPOINT_WIDE = 1440

/** Content-column layout dims (px) — ShipSwarm projects these into its
 *  patrol exclusion zone. Keep in sync with the hero column
 *  (HeroSection.vue `.hero` padding / `.hero__inner` max-width) and the
 *  centered `.content-section` column (_base.scss). */
export const HERO_LEFT_PX = 48
export const HERO_WIDTH_PX = 760
export const SECTION_WIDTH_PX = 1100
/** Extra CSS-px margin ShipSwarm pads around the content columns. */
export const EXCLUSION_MARGIN_PX = 48

/** Canonical site origin (no trailing slash) — SEO/JSON-LD. */
export const SITE_URL = 'https://saaranshmenon.me'

/** This repo — the footer [ SOURCE ] link. */
export const REPO_URL = 'https://github.com/saaranshM/Portfolio-Website'

/** Footer build line stamp. */
export const BUILD_ID = '2026.06'
