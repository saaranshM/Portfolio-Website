<script setup lang="ts">
import { socialLinks } from '~/data/socials'
import { profile } from '~/data/profile'

/**
 * SideRails — two fixed, bottom-anchored rails flanking the viewport
 * (hidden ≤1180px — they need real gutter space outside the 1100px content
 * column). Left: stacked social icons over a 1px cyan-dim drop line; right:
 * the contact email written vertically as a GlowLink mailto over the same
 * line. Decorative chrome, but fully keyboard reachable.
 */
</script>

<template>
  <div class="side-rails">
    <div class="side-rails__rail side-rails__rail--left">
      <ul class="side-rails__socials" role="list">
        <li v-for="social in socialLinks" :key="social.name">
          <a
            class="side-rails__social"
            :href="social.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="social.name"
          >
            <Icon :name="social.icon" size="18" />
          </a>
        </li>
      </ul>
      <span class="side-rails__line" aria-hidden="true" />
    </div>

    <div class="side-rails__rail side-rails__rail--right">
      <GlowLink class="side-rails__email t-mono-sm" :href="`mailto:${profile.email}`">
        {{ profile.email }}
      </GlowLink>
      <span class="side-rails__line" aria-hidden="true" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

// Below ~1180px the fixed rails collide with the 1100px content column, so
// they hide well above the 780px mobile breakpoint.
$bp-rails: 1180px;

.side-rails {
  @media (max-width: $bp-rails) {
    display: none;
  }
}

.side-rails__rail {
  position: fixed;
  bottom: 0;
  z-index: var(--z-content);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: t.$space-3;
}

.side-rails__rail--left {
  left: t.$space-6;
}

.side-rails__rail--right {
  right: t.$space-6;
}

.side-rails__socials {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.side-rails__social {
  @include t.icon-link;
}

// Email reads top-to-bottom along the right edge. Mono floor is 12px;
// tracking comes from t-mono-sm; color/glow/underline come from GlowLink
// itself (clickable = cyan). text-transform none — it's an address.
.side-rails__email {
  writing-mode: vertical-rl;
  text-transform: none;
  padding: t.$space-2;

  @media (prefers-reduced-motion: no-preference) {
    transition: transform t.$duration-fast t.$ease-hud;
  }

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
  }
}

.side-rails__line {
  width: 1px;
  height: 9.6rem;
  background: t.$cyan-dim;
}
</style>
