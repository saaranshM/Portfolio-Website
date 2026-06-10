/**
 * Flight Deck — shared constants.
 */

/** Effects tiers, lowest to highest. Resolved at runtime in Phase 3. */
export const TIERS = ['off', 'lite', 'full'] as const
export type Tier = (typeof TIERS)[number]

/** Breakpoints (px). Keep in sync with app/assets/scss/_tokens.scss. */
export const BREAKPOINT_MOBILE = 780
export const BREAKPOINT_WIDE = 1440
