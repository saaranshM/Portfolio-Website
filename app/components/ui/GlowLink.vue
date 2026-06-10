<script setup lang="ts">
/**
 * GlowLink — cyan anchor with a left → right underline sweep and a soft glow
 * on hover. `external` adds target="_blank" + rel and a ↗ marker.
 */
defineProps<{
  href: string
  external?: boolean
}>()
</script>

<template>
  <a
    class="glow-link"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <slot /><span v-if="external" class="glow-link__arrow" aria-hidden="true">&nbsp;↗</span>
  </a>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.glow-link {
  color: t.$cyan;
  text-decoration: none;
  background-image: linear-gradient(t.$cyan, t.$cyan);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 1px;

  @media (prefers-reduced-motion: no-preference) {
    transition: background-size t.$duration-fast t.$ease-hud;
  }

  &:hover,
  &:focus-visible {
    background-size: 100% 1px;

    @include t.glow-text(t.$cyan);
  }
}
</style>
