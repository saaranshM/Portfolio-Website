<script setup lang="ts">
/**
 * BootOverlay — non-blocking boot garnish (spec §5): a 1px cyan line sweeps
 * down the viewport (transform-only) while three mono status lines flash in
 * bottom-left. Hard cap 900ms, then a 200ms fade and full unmount.
 *
 * Never mounts content when the per-tab-session flag is already set, under
 * prefers-reduced-motion, or without JS (`active` only flips in onMounted,
 * so SSR/no-JS render nothing). position: fixed + pointer-events: none —
 * never shifts layout, never blocks interaction.
 */
const { tier, ready } = useEffectsTier()
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const BOOT_DURATION_MS = 900
const FADE_MS = 200

const active = ref(false)
const leaving = ref(false)
let fadeTimer = 0
let unmountTimer = 0

// Tier line goes live the moment detection resolves; `…` until then.
const gpuLine = computed(() =>
  `GPU TIER: ${ready.value ? tier.value.toUpperCase() : '…'}`,
)

onMounted(() => {
  if (reducedMotion.value) return
  try {
    if (sessionStorage.getItem(BOOT_SESSION_KEY) !== null) return
    sessionStorage.setItem(BOOT_SESSION_KEY, '1')
  } catch {
    return // storage denied — skip the garnish rather than replay every visit
  }

  active.value = true
  fadeTimer = window.setTimeout(() => {
    leaving.value = true
  }, BOOT_DURATION_MS)
  unmountTimer = window.setTimeout(() => {
    active.value = false
  }, BOOT_DURATION_MS + FADE_MS)
})

onBeforeUnmount(() => {
  window.clearTimeout(fadeTimer)
  window.clearTimeout(unmountTimer)
})
</script>

<template>
  <div
    v-if="active"
    class="boot-overlay"
    :class="{ 'boot-overlay--leaving': leaving }"
    aria-hidden="true"
  >
    <span class="boot-overlay__sweep" />
    <p class="boot-overlay__lines t-mono-sm">
      <span class="boot-overlay__line" style="--boot-delay: 0ms">INITIALIZING INTERFACE… OK</span>
      <span class="boot-overlay__line" style="--boot-delay: 250ms">{{ gpuLine }}</span>
      <span class="boot-overlay__line" style="--boot-delay: 500ms">SCENE: ONLINE</span>
    </p>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.boot-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  pointer-events: none;
  overflow: hidden;

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity 200ms t.$ease-hud;
  }
}

.boot-overlay--leaving {
  opacity: 0;
}

// The sweep — 1px cyan rule riding transform only (compositor-friendly).
// Rest opacity 0: it exists solely as animation garnish.
.boot-overlay__sweep {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: t.$cyan;
  box-shadow: 0 0 12px rgba(t.$cyan, 0.8);
  opacity: 0;

  @media (prefers-reduced-motion: no-preference) {
    animation: boot-sweep 900ms linear both;
  }
}

.boot-overlay__lines {
  position: absolute;
  bottom: t.$space-5;
  left: t.$space-5;
  display: flex;
  flex-direction: column;
  gap: t.$space-1;
  max-width: none;
  color: t.$cyan;
}

.boot-overlay__line {
  @media (prefers-reduced-motion: no-preference) {
    animation: boot-line-flash 240ms steps(3, jump-none) both;
    animation-delay: var(--boot-delay, 0ms);
  }
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes boot-sweep {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100vh);
      opacity: 1;
    }
  }

  @keyframes boot-line-flash {
    0% {
      opacity: 0;
    }
    35% {
      opacity: 0.9;
    }
    60% {
      opacity: 0.25;
    }
    100% {
      opacity: 1;
    }
  }
}
</style>
