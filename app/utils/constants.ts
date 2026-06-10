/**
 * Flight Deck — shared constants.
 */

/** Effects tiers, lowest to highest. Resolved at runtime in Phase 3. */
export const TIERS = ['off', 'lite', 'full'] as const
export type Tier = (typeof TIERS)[number]

/** Breakpoints (px). Keep in sync with app/assets/scss/_tokens.scss. */
export const BREAKPOINT_MOBILE = 780
export const BREAKPOINT_WIDE = 1440

/** Canonical site origin (no trailing slash) — SEO/JSON-LD. */
export const SITE_URL = 'https://saaranshmenon.me'

/** This repo — the footer [ SOURCE ] link. */
export const REPO_URL = 'https://github.com/saaranshM/Portfolio-Website'

/** Footer build line stamp. */
export const BUILD_ID = '2026.06'
