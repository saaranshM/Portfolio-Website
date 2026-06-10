<script setup lang="ts">
/**
 * SectionHeading — numbered section header: mono cyan index, display-font
 * title, then a 1px rule filling the remaining width.
 * The `id` is the anchor target and the section's `aria-labelledby` source.
 *
 * Reveal grammar (same contract as HudPanel): when `revealed` flips true the
 * index decodes out of glyph noise and the rule sweeps left → right, one-shot.
 * Without orchestration (`revealed` never set) everything renders at rest.
 */
withDefaults(
  defineProps<{
    index: string
    id: string
    title: string
    revealed?: boolean
  }>(),
  { revealed: false },
)
</script>

<template>
  <h2 :id="id" class="section-heading" :class="{ 'is-revealed': revealed }">
    <DecodeText
      class="section-heading__index t-mono"
      :text="index"
      :play="revealed"
      :duration="300"
    />
    <span class="section-heading__title">{{ title }}</span>
    <span class="section-heading__rule" aria-hidden="true" />
  </h2>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.section-heading {
  display: flex;
  align-items: center;
  gap: t.$space-4;
}

.section-heading__index {
  color: t.$cyan;

  @include t.glow-text(t.$cyan);
}

// Display font, size and uppercase come from the global h2 scale; the title
// just needs to refuse to wrap awkwardly against the rule.
.section-heading__title {
  flex-shrink: 0;
}

// Visible at rest (no-JS / reduced-motion baseline); the sweep only plays as
// a one-shot when the heading is revealed.
.section-heading__rule {
  flex: 1;
  height: 1px;
  min-width: t.$space-6;
  background: t.$cyan-dim;
  transform-origin: left;
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes rule-sweep {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  .section-heading.is-revealed .section-heading__rule {
    animation: rule-sweep 700ms t.$ease-hud both;
  }
}
</style>
