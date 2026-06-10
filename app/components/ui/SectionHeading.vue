<script setup lang="ts">
/**
 * SectionHeading — numbered section header: mono cyan index, display-font
 * title, then a 1px rule filling the remaining width.
 * The `id` is the anchor target and the section's `aria-labelledby` source.
 */
defineProps<{
  index: string
  id: string
  title: string
}>()
</script>

<template>
  <h2 :id="id" class="section-heading">
    <span class="section-heading__index t-mono">{{ index }}</span>
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

.section-heading__rule {
  flex: 1;
  height: 1px;
  min-width: t.$space-6;
  background: t.$cyan-dim;
}
</style>
