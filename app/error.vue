<script setup lang="ts">
import type { NuxtError } from '#app'

/**
 * error.vue — "SIGNAL LOST". Themed full-screen error state over the
 * static backdrop; works for 404 (bad coordinates) and 500 (bridge fault).
 * The CTA is a real link to '/' (works without JS) whose click handler
 * clears the error state properly on the client.
 */
const props = defineProps<{ error: NuxtError }>()

const message = computed(() =>
  props.error.statusCode === 404
    ? 'These coordinates don’t map to any charted sector.'
    : 'Something failed on the bridge. The crew has been notified.',
)

function returnToBridge(event: MouseEvent) {
  event.preventDefault()
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="error-screen">
    <FxStaticBackdrop />

    <main class="error-screen__main">
      <HudPanel class="error-screen__panel" :strap="`ERR // ${error.statusCode}`" notch>
        <h1 class="error-screen__title">SIGNAL LOST</h1>

        <p class="error-screen__copy">{{ message }}</p>

        <p class="error-screen__link t-mono">
          <GlowLink href="/" @click="returnToBridge">[ RETURN TO BRIDGE ]</GlowLink>
        </p>
      </HudPanel>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.error-screen__main {
  position: relative;
  z-index: var(--z-content);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: t.$space-5;
}

.error-screen__panel {
  max-width: 520px;
  padding: t.$space-6;
  text-align: center;
}

.error-screen__title {
  font-size: clamp(3.6rem, 7vw, 6.4rem);
  margin-bottom: t.$space-4;

  @include t.glow-text(t.$cyan);
}

.error-screen__copy {
  margin: 0 auto t.$space-5;
}

.error-screen__link {
  max-width: none;
}
</style>
