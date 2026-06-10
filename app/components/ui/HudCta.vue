<script setup lang="ts">
/**
 * HudCta — the big bracket call-to-action: mono label on a HUD-panel chip
 * with corner brackets (hover holds them extended via the mixin).
 * Used by the hero ([ OPEN CHANNEL ↗ ]) and contact ([ SEND TRANSMISSION ]).
 *
 * - `external` — target="_blank" + rel for off-site destinations.
 * - `size`     — 'md' (default) or 'sm' (header [ RESUME ] chip).
 */
withDefaults(
  defineProps<{
    href: string
    external?: boolean
    size?: 'md' | 'sm'
  }>(),
  { size: 'md' },
)
</script>

<template>
  <a
    class="hud-cta"
    :class="`hud-cta--${size}`"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <span class="bracket-bl" aria-hidden="true" />
    <span class="bracket-br" aria-hidden="true" />
    <slot />
  </a>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.hud-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: t.$font-mono;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: t.$cyan;

  @include t.hud-panel;
  @include t.corner-brackets;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      border-color t.$duration-fast t.$ease-hud,
      box-shadow t.$duration-fast t.$ease-hud,
      color t.$duration-fast t.$ease-hud;
  }

  &:hover,
  &:focus-visible {
    color: t.$white-hot;
    border-color: rgba(t.$cyan, 0.6);
    box-shadow: 0 0 18px rgba(t.$cyan, 0.2);
  }
}

.hud-cta--md {
  padding: t.$space-3 t.$space-5;
  font-size: 1.4rem;
}

// Small chip still meets the 44px tap-target floor via min-height.
.hud-cta--sm {
  min-height: 44px;
  padding: t.$space-2 t.$space-3;
  font-size: 1.2rem;
}
</style>
