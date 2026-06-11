<script setup lang="ts">
/**
 * FxLayer — the effects-tier switchboard (spec §4). Mounts exactly ONE
 * backdrop for the resolved tier, with `v-if` (never `v-show`) so a live
 * downgrade fully unmounts and disposes the heavier renderer.
 *
 * SSR / no-JS / pre-hydration all render the StaticBackdrop fallback — one
 * correct baseline, no hydration mismatch.
 *
 * Phase 5: this is also the play-layer input owner — useLaserInput (click-
 * to-fire on 'full' AND 'lite', inert otherwise) and useEasterEgg both live
 * here because FxLayer is always mounted exactly once and neither composable
 * touches three.js. The crosshair blip renders as a SIBLING of .fx-layer:
 * the layer's z-scene stacking context would trap it under the content.
 */
const { tier } = useEffectsTier()

const blipEl = ref<HTMLElement | null>(null)
const laserLite = ref<{ fire: (cssX: number, cssY: number) => void } | null>(null)

useLaserInput({
  blipEl,
  onLiteFire: (cssX, cssY) => laserLite.value?.fire(cssX, cssY),
})
useEasterEgg()
</script>

<template>
  <div class="fx-layer" aria-hidden="true">
    <ClientOnly>
      <!-- Lazy prefix = own chunk: three.js only ever downloads on 'full'. -->
      <LazyFxSceneRoot v-if="tier === 'full'" />
      <template v-else-if="tier === 'lite'">
        <FxStarfieldLite />
        <FxLaserLite ref="laserLite" />
      </template>
      <FxStaticBackdrop v-else />
      <template #fallback>
        <FxStaticBackdrop />
      </template>
    </ClientOnly>
  </div>

  <!-- Click-to-fire crosshair blip: 12px, 150ms one-shot, pointer-events
       none, replayed by useLaserInput; animation is reduced-motion gated
       (and the input path is inert under reduced motion anyway). -->
  <div ref="blipEl" class="fx-blip" aria-hidden="true" />
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.fx-layer {
  position: fixed;
  inset: 0;
  z-index: var(--z-scene);
  pointer-events: none;
}

.fx-blip {
  position: fixed;
  z-index: var(--z-overlay);
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  pointer-events: none;
  opacity: 0;

  // Crosshair: two cyan strokes.
  &::before,
  &::after {
    content: '';
    position: absolute;
    background: t.$cyan;
  }

  &::before {
    top: 5px;
    left: 0;
    right: 0;
    height: 2px;
  }

  &::after {
    left: 5px;
    top: 0;
    bottom: 0;
    width: 2px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes fx-blip {
    from {
      opacity: 1;
      transform: scale(0.6);
    }
    to {
      opacity: 0;
      transform: scale(1.5);
    }
  }

  .fx-blip.is-firing {
    animation: fx-blip 150ms t.$ease-hud both;
  }
}
</style>
