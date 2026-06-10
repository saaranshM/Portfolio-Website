<template>
  <div class="flight-deck">
    <a class="skip-link" href="#main">// Skip to content</a>

    <!-- z-0: the scene. Phase 3 swaps this for the tiered FxLayer. -->
    <FxStaticBackdrop />

    <!-- z-20: static scanline glass. 3% opacity, no animation, ever. -->
    <div class="scanlines" aria-hidden="true" />

    <!-- z-30: fixed instrument rail. -->
    <SiteHeader />

    <main id="main" class="site-main" tabindex="-1">
      <slot />
    </main>

    <!-- z-10: decorative-but-interactive chrome flanking the viewport. -->
    <SideRails />

    <SiteFooter />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.scanlines {
  position: fixed;
  inset: 0;
  z-index: var(--z-scanlines);
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    #{t.$ice} 0px,
    #{t.$ice} 1px,
    transparent 1px,
    transparent 4px
  );
  opacity: 0.03;
}

.site-main {
  position: relative;
  z-index: var(--z-content);
}
</style>

<style lang="scss">
// Unscoped: anchor jumps must clear the fixed 64px header everywhere,
// including section ids rendered inside child components.
.site-main section[id] {
  scroll-margin-top: 10rem;
}
</style>
