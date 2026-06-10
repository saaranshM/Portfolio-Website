<script setup lang="ts">
// Temporary Phase 1 hero — proves the Flight Deck design system end to end.
// Rebuilt as HeroSection + full page composition in Phase 2.
useSeoMeta({
  description:
    'Saaransh Menon — Tech Lead building full-stack products and NLP systems.',
})
</script>

<template>
  <section class="hero">
    <div class="hero__inner">
      <p class="hero__kicker t-mono fx-decode">// INCOMING TRANSMISSION</p>

      <h1 class="hero__name fx-rgb-split">SAARANSH MENON</h1>

      <p class="hero__role t-mono">TECH LEAD&nbsp;//&nbsp;FULL-STACK + NLP</p>

      <p class="hero__copy">
        Parked on the glass bridge above a quiet skirmish in deep space.
        I build production web systems and NLP pipelines — calm interfaces
        over a lot of moving machinery.
      </p>

      <a class="hero__cta" href="#contact">
        <span class="bracket-bl" aria-hidden="true" />
        <span class="bracket-br" aria-hidden="true" />
        [ OPEN CHANNEL&nbsp;↗ ]
      </a>
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

.hero__cta {
  display: inline-block;
  padding: t.$space-3 t.$space-5;
  font-family: t.$font-mono;
  font-size: 1.4rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  color: t.$cyan;

  @include t.hud-panel;
  @include t.corner-brackets;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      border-color t.$duration-fast t.$ease-hud,
      box-shadow t.$duration-fast t.$ease-hud,
      color t.$duration-fast t.$ease-hud;
  }

  &:hover {
    color: t.$white-hot;
    border-color: rgba(t.$cyan, 0.6);
    box-shadow: 0 0 18px rgba(t.$cyan, 0.2);
  }
}
</style>
