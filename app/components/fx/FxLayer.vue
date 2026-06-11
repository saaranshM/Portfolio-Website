<script setup lang="ts">
/**
 * FxLayer — the effects-tier switchboard (spec §4). Mounts exactly ONE
 * backdrop for the resolved tier, with `v-if` (never `v-show`) so a live
 * downgrade fully unmounts and disposes the heavier renderer.
 *
 * SSR / no-JS / pre-hydration all render the StaticBackdrop fallback — one
 * correct baseline, no hydration mismatch.
 */
const { tier } = useEffectsTier()
</script>

<template>
  <div class="fx-layer" aria-hidden="true">
    <ClientOnly>
      <!-- Lazy prefix = own chunk: three.js only ever downloads on 'full'. -->
      <LazyFxSceneRoot v-if="tier === 'full'" />
      <FxStarfieldLite v-else-if="tier === 'lite'" />
      <FxStaticBackdrop v-else />
      <template #fallback>
        <FxStaticBackdrop />
      </template>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.fx-layer {
  position: fixed;
  inset: 0;
  z-index: var(--z-scene);
  pointer-events: none;
}
</style>
