<script setup lang="ts">
import { profile } from '~/data/profile'

/**
 * HeroSection — the opening transmission.
 *
 * Load choreography (≤1.8s, JS-driven via `is-booted` + DecodeText `play`):
 *   ~100ms  kicker decodes (500ms)
 *    600ms  name fades up + one-shot 150ms RGB-split settle
 *    700ms  role line decodes (700ms)
 *   1300ms  intro copy fades up, CTA +60ms
 *
 * Reduced-motion: DecodeText no-ops and every animation below is gated —
 * the hero is simply at rest. No-JS: `is-booted` never lands, same rest
 * state. Nothing is hidden by default. Late hydration (>2s) also stays at
 * rest — see onMounted.
 */
const booted = ref(false)
const playKicker = ref(false)
const playRole = ref(false)
let timers: number[] = []

onMounted(() => {
  // Late hydration (slow device/network): the SSR'd hero has been readable
  // for a while — skip the boot replay (rest state == settled end state)
  // instead of making visible text vanish and re-decode.
  if (performance.now() > 2000) return
  booted.value = true
  timers = [
    window.setTimeout(() => (playKicker.value = true), 100),
    window.setTimeout(() => (playRole.value = true), 700),
  ]
})

onBeforeUnmount(() => timers.forEach((t) => window.clearTimeout(t)))
</script>

<template>
  <section class="hero" :class="{ 'is-booted': booted }" aria-label="Introduction">
    <div class="hero__inner">
      <HudPanel class="hero__panel" strap="00 // TRANSMISSION">
        <DecodeText
          class="hero__kicker t-mono"
          tag="p"
          text="// INCOMING TRANSMISSION"
          :play="playKicker"
          :duration="500"
        />

        <h1 class="hero__name">{{ profile.name.toUpperCase() }}</h1>

        <DecodeText
          class="hero__role t-mono"
          tag="p"
          :text="profile.roleLine"
          :play="playRole"
          :duration="700"
        />

        <p class="hero__copy">{{ profile.heroIntro }}</p>

        <HudCta class="hero__cta" href="#contact">[ OPEN CHANNEL&nbsp;↗ ]</HudCta>
      </HudPanel>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.hero {
  display: flex;
  align-items: center;
  min-height: 100vh;
  padding: t.$space-8 t.$space-7;

  @include t.mobile {
    padding: t.$space-8 t.$space-5;
  }
}

.hero__inner {
  position: relative;
  max-width: 760px;

  // Permanent elliptical ink-wash scrim: text contrast never depends on
  // whatever the scene behind the glass is doing.
  &::before {
    content: '';
    position: absolute;
    inset: -12rem -16rem;
    z-index: -1;
    pointer-events: none;
    background: radial-gradient(
      ellipse at 35% 50%,
      rgba(3, 0, 20, 0.78) 0%,
      transparent 70%
    );
  }
}

.hero__panel {
  padding: t.$space-6;

  @include t.mobile {
    padding: t.$space-5;
  }
}

.hero__kicker {
  color: t.$cyan;
  margin-bottom: t.$space-4;

  @include t.glow-text(t.$cyan);
}

.hero__name {
  margin-bottom: t.$space-3;

  @include t.glow-text(t.$cyan);
}

.hero__role {
  color: t.$ice-dim;
  margin-bottom: t.$space-5;
}

.hero__copy {
  max-width: 52ch;
  margin-bottom: t.$space-6;
}

// --- load choreography -------------------------------------------------------
// Only under `.is-booted` (JS landed) AND motion is welcome; `both` fill
// holds each element at its hidden `from` frame through its delay, then
// plays. rgb-split keyframes are global (_typography.scss).
@media (prefers-reduced-motion: no-preference) {
  @keyframes hero-fade-up {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .hero.is-booted {
    .hero__kicker {
      animation: hero-fade-up 300ms t.$ease-hud both;
    }

    .hero__name {
      animation:
        hero-fade-up 400ms t.$ease-hud 600ms both,
        rgb-split 150ms steps(3, jump-none) 600ms 1;
    }

    .hero__role {
      animation: hero-fade-up 300ms t.$ease-hud 700ms both;
    }

    .hero__copy {
      animation: hero-fade-up 400ms t.$ease-hud 1300ms both;
    }

    .hero__cta {
      animation: hero-fade-up 400ms t.$ease-hud 1360ms both;
    }
  }
}
</style>
