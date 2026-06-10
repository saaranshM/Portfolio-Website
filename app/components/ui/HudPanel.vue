<script setup lang="ts">
/**
 * HudPanel — THE signature surface. Translucent navy glass + corner brackets.
 *
 * The corner-brackets mixin owns the top corners via ::before/::after; the two
 * <span> bracket elements below carry the bottom corners (see _tokens.scss).
 * Reveal grammar: `revealed` plays a one-shot bracket pulse + strap-rule sweep;
 * :hover holds the brackets extended (see corner-brackets in _tokens.scss).
 *
 * - `strap`    — mono header line ('NN // LABEL') above the content, with a 1px
 *                rule that sweeps left → right when the panel is revealed.
 * - `notch`    — clips a 10px corner off the top-right, console-display style.
 * - `tag`      — wrapper element, default 'div'.
 * - `revealed` — typed reveal trigger; the bare `.is-revealed` class also works
 *                for non-component uses (e.g. raw mixin consumers).
 */
withDefaults(
  defineProps<{
    strap?: string
    notch?: boolean
    tag?: string
    revealed?: boolean
  }>(),
  { tag: 'div' },
)
</script>

<template>
  <component
    :is="tag"
    class="hud-panel"
    :class="{ 'hud-panel--notch': notch, 'is-revealed': revealed }"
  >
    <span class="bracket-bl" aria-hidden="true" />
    <span class="bracket-br" aria-hidden="true" />

    <p v-if="strap" class="hud-panel__strap t-mono-sm">{{ strap }}</p>

    <slot />
  </component>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.hud-panel {
  padding: t.$space-5;

  @include t.hud-panel;
  @include t.corner-brackets;
}

// Notched top-right corner. The polygon overshoots the element box by 2px on
// the other three sides so the corner brackets (drawn at -1px) survive the
// clip; the top-right bracket can't coexist with the notch, so it's removed.
.hud-panel--notch {
  clip-path: polygon(
    -2px -2px,
    calc(100% - 10px) -2px,
    calc(100% + 2px) 10px,
    calc(100% + 2px) calc(100% + 2px),
    -2px calc(100% + 2px)
  );

  &::after {
    content: none;
  }
}

.hud-panel__strap {
  max-width: none;
  margin-bottom: t.$space-4;
  color: t.$ice-dim;

  // The 1px rule under the strap. Visible at rest (no-JS / reduced-motion
  // baseline); the sweep only plays as a one-shot when `.is-revealed` lands.
  &::after {
    content: '';
    display: block;
    height: 1px;
    margin-top: t.$space-2;
    background: t.$cyan-dim;
    transform-origin: left;
  }
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes strap-sweep {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  .hud-panel.is-revealed .hud-panel__strap::after {
    animation: strap-sweep 700ms t.$ease-hud both;
  }
}
</style>
