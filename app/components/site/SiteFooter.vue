<script setup lang="ts">
import { socialLinks } from '~/data/socials'
import { profile } from '~/data/profile'

/**
 * SiteFooter — centered mono sign-off: a 1px rule with a signal-pulse dot
 * traversing it every 12s, the social icon row, then the build line
 * `ENGINEERED BY … // BUILD … // [ SOURCE ]`.
 */
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__rule" aria-hidden="true">
      <span class="site-footer__pulse" />
    </div>

    <ul class="site-footer__socials" role="list">
      <li v-for="social in socialLinks" :key="social.name">
        <a
          class="site-footer__social"
          :href="social.url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="social.name"
        >
          <Icon :name="social.icon" size="18" />
        </a>
      </li>
    </ul>

    <p class="site-footer__build t-mono-sm">
      ENGINEERED BY {{ profile.name.toUpperCase() }} // BUILD {{ BUILD_ID }} //
      <GlowLink :href="REPO_URL" external>[ SOURCE ]</GlowLink>
    </p>

    <!-- FxToggle mounts here (Phase 3) -->
  </footer>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.site-footer {
  position: relative;
  z-index: var(--z-content);
  padding: 0 t.$space-5 t.$space-6;
  text-align: center;
}

// --- signal rule ----------------------------------------------------------
// inline-size container so the pulse can traverse the rule's full width in
// `cqw` units via transform alone (compositor-only — no `left` animation).
.site-footer__rule {
  position: relative;
  max-width: 1100px;
  height: 1px;
  margin: 0 auto t.$space-5;
  background: t.$cyan-dim;
  overflow: visible;
  container-type: inline-size;
}

.site-footer__pulse {
  display: none;
  position: absolute;
  top: -2px;
  left: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: t.$cyan;
  box-shadow: 0 0 8px rgba(t.$cyan, 0.8);

  @media (prefers-reduced-motion: no-preference) {
    display: block;
    animation: footer-pulse 12s linear infinite;
  }
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes footer-pulse {
    0% {
      transform: translateX(0);
      opacity: 0;
    }
    4% {
      opacity: 1;
    }
    96% {
      opacity: 1;
    }
    100% {
      transform: translateX(100cqw);
      opacity: 0;
    }
  }
}

// --- socials ----------------------------------------------------------------
.site-footer__socials {
  display: flex;
  justify-content: center;
  margin-bottom: t.$space-3;
}

.site-footer__social {
  @include t.icon-link;
}

// --- build line ----------------------------------------------------------------
.site-footer__build {
  max-width: none;
  color: t.$ice-dim;
}
</style>
