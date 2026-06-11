<script setup lang="ts">
/**
 * HudToast — the useHudToast() outlet: a mono hud-panel chip bottom-left,
 * sitting just above where the BootOverlay status lines render. Polite live
 * region (`role="status"` stays mounted so screen readers announce swaps),
 * pointer-events: none, auto-dismissed by the composable after ~4s.
 *
 * Phase 5 reuses this for TARGETING SYSTEMS: CALIBRATED etc.
 */
const { message } = useHudToast()
</script>

<template>
  <div class="hud-toast" role="status">
    <Transition name="hud-toast">
      <p v-if="message" class="hud-toast__chip t-mono-sm">{{ message }}</p>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.hud-toast {
  position: fixed;
  bottom: calc(t.$space-5 + 8.4rem); // clears the BootOverlay status lines
  left: t.$space-5;
  z-index: var(--z-overlay);
  pointer-events: none;
}

.hud-toast__chip {
  @include t.hud-panel;

  display: inline-block;
  padding: t.$space-2 t.$space-3;
  color: t.$cyan;
  max-width: none;
}

@media (prefers-reduced-motion: no-preference) {
  .hud-toast-enter-active,
  .hud-toast-leave-active {
    transition:
      opacity 200ms t.$ease-hud,
      transform 200ms t.$ease-hud;
  }

  .hud-toast-enter-from,
  .hud-toast-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }
}
</style>
