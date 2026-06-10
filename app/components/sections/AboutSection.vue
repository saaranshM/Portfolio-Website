<script setup lang="ts">
import { profile } from '~/data/profile'

/**
 * AboutSection — "01 // PERSONNEL FILE".
 * Two-column dossier: duotone portrait in a corner-bracketed frame (scan
 * line sweeps once on reveal, then dimly every 8s; full color on hover)
 * beside the bio paragraphs and the mono pull-stats row.
 */
const { target, revealed } = useReveal()
</script>

<template>
  <section
    id="about"
    ref="target"
    class="about content-section"
    :class="{ 'is-revealed': revealed }"
    aria-labelledby="about-heading"
  >
    <SectionHeading
      id="about-heading"
      class="about__heading"
      index="01"
      title="PERSONNEL FILE"
      :revealed="revealed"
    />

    <HudPanel class="about__panel" :revealed="revealed">
      <div class="about__grid">
        <figure class="about__portrait reveal-item" style="--reveal-delay: 200ms">
          <span class="bracket-bl" aria-hidden="true" />
          <span class="bracket-br" aria-hidden="true" />
          <div class="about__media">
            <NuxtImg
              class="about__img"
              :src="profile.avatar"
              :alt="`Portrait of ${profile.name}`"
              width="420"
              height="420"
              format="webp"
              loading="lazy"
            />
            <span class="about__tint" aria-hidden="true" />
            <span class="about__scan about__scan--once" aria-hidden="true" />
            <span class="about__scan about__scan--loop" aria-hidden="true" />
          </div>
        </figure>

        <div class="about__bio">
          <p
            v-for="(paragraph, i) in profile.bio"
            :key="i"
            class="reveal-item"
            :style="{ '--reveal-delay': `${260 + i * 60}ms` }"
          >
            {{ paragraph }}
          </p>

          <dl class="about__stats reveal-item" :style="{ '--reveal-delay': `${260 + profile.bio.length * 60}ms` }">
            <div v-for="stat in profile.stats" :key="stat.label" class="about__stat">
              <dt class="about__stat-label t-mono-sm">{{ stat.label }}</dt>
              <dd class="about__stat-value t-mono">{{ stat.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </HudPanel>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.about__heading {
  margin-bottom: t.$space-6;
}

.about__grid {
  display: grid;
  grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
  gap: t.$space-6;
  align-items: start;

  @include t.mobile {
    grid-template-columns: minmax(0, 1fr);
  }
}

// --- portrait -------------------------------------------------------------
// The figure carries the corner brackets (drawn 1px OUTSIDE the box, so it
// must not clip); the inner media wrapper clips the scan-line sweep.
// Duotone at rest (cyan-tinted monochrome, full color on hover) comes from
// the shared mixin; only the resting brightness is local.
.about__portrait {
  max-width: 420px;

  @include t.corner-brackets;
  @include t.duotone-media('.about__img', '.about__tint', 0.92);
}

.about__media {
  position: relative;
  overflow: hidden;
}

// --- scan line ----------------------------------------------------------------
// Two stacked sweeps: a brighter one-shot pass when the section reveals,
// then a 20%-opacity pass every 8s. Both gated; hidden entirely at rest.
// Each sweep is a full-height carrier box whose ::before draws the 1px line
// at its top edge — tweening translateY(%) on the carrier moves the line
// across the frame compositor-only (no `top` layout animation).
.about__scan {
  display: none;
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: t.$cyan;
    box-shadow: 0 0 6px rgba(t.$cyan, 0.6);
  }
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes about-scan {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    99% {
      transform: translateY(100%);
      opacity: 1;
    }
    100% {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  // Loop variant: traverse during the first 1.2s of each 8s cycle, idle after.
  @keyframes about-scan-loop {
    0% {
      transform: translateY(0);
      opacity: 0.2;
    }
    14% {
      transform: translateY(100%);
      opacity: 0.2;
    }
    15%,
    100% {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  .about.is-revealed {
    .about__scan {
      display: block;
    }

    .about__scan--once {
      opacity: 0;
      animation: about-scan 1200ms linear 1 forwards;
    }

    .about__scan--loop {
      opacity: 0;
      animation: about-scan-loop 8s linear 1400ms infinite;
    }
  }
}

// --- bio + stats ----------------------------------------------------------------
.about__bio p + p {
  margin-top: t.$space-4;
}

.about__stats {
  display: flex;
  flex-wrap: wrap;
  gap: t.$space-6;
  margin-top: t.$space-6;
  padding-top: t.$space-4;
  border-top: 1px solid t.$cyan-dim;
}

.about__stat-label {
  color: t.$ice-dim;
}

.about__stat-value {
  margin-top: t.$space-1;
  color: t.$cyan;

  @include t.glow-text(t.$cyan);
}
</style>
