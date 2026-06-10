<script setup lang="ts">
import type { Project } from '~/data/types'

/**
 * MissionDossier — one MISSION LOGS entry: corner-bracketed visual frame
 * overlapped by a HudPanel dossier. Even-indexed dossiers flip sides.
 *
 * Visual side:
 * - with `project.image`: lazy NuxtImg under a cyan duotone + static
 *   scanline texture; hover lifts to full color with ONE 150ms RGB-split
 *   style pulse, then steady.
 * - without: "AWAITING VISUAL FEED" placeholder — faint grid, targeting
 *   ring and a line-art ship glyph holding the channel open.
 *
 * Reveal: the frame slides 24px in from its side, the panel from the
 * other (each dossier observes itself — useReveal per instance).
 */
const props = defineProps<{
  project: Project
  /** 1-based mission number — strap reads `MISSION 0N // slug`. */
  index: number
}>()

const { target, revealed } = useReveal()

const flipped = computed(() => props.index % 2 === 0)
const strap = computed(
  () => `MISSION ${String(props.index).padStart(2, '0')} // ${props.project.slug}`,
)
</script>

<template>
  <article
    ref="target"
    class="dossier"
    :class="{ 'dossier--flipped': flipped, 'is-revealed': revealed }"
  >
    <div class="dossier__media">
      <span class="bracket-bl" aria-hidden="true" />
      <span class="bracket-br" aria-hidden="true" />

      <div v-if="project.image" class="dossier__frame">
        <NuxtImg
          class="dossier__img"
          :src="project.image"
          :alt="`Screenshot of ${project.title}`"
          width="640"
          height="360"
          format="webp"
          loading="lazy"
        />
        <span class="dossier__tint" aria-hidden="true" />
        <span class="dossier__scanlines" aria-hidden="true" />
      </div>

      <div v-else class="dossier__frame dossier__placeholder" aria-hidden="true">
        <svg class="dossier__glyph" viewBox="0 0 48 48" width="64" height="64">
          <circle class="dossier__ring" cx="24" cy="24" r="18" />
          <line class="dossier__tick" x1="24" y1="2" x2="24" y2="9" />
          <line class="dossier__tick" x1="24" y1="39" x2="24" y2="46" />
          <line class="dossier__tick" x1="2" y1="24" x2="9" y2="24" />
          <line class="dossier__tick" x1="39" y1="24" x2="46" y2="24" />
          <path class="dossier__hull" d="M24 14 L31 32 L24 27 L17 32 Z" />
        </svg>
        <p class="dossier__placeholder-text t-mono-sm">AWAITING VISUAL FEED</p>
        <p class="dossier__placeholder-sub t-mono-sm">// NO SIGNAL ON THIS CHANNEL</p>
      </div>
    </div>

    <HudPanel class="dossier__panel" :strap="strap" :revealed="revealed" notch>
      <h3 class="dossier__title">{{ project.title }}</h3>

      <p class="dossier__desc">{{ project.description }}</p>

      <ul class="dossier__tech" role="list">
        <li v-for="tech in project.tech" :key="tech">
          <TechTag>{{ tech }}</TechTag>
        </li>
      </ul>

      <p class="dossier__links t-mono">
        <GlowLink v-if="project.github" :href="project.github" external>
          [ SRC ]
        </GlowLink>
        <GlowLink v-if="project.liveUrl" :href="project.liveUrl" external>
          [ LIVE ]
        </GlowLink>
      </p>
    </HudPanel>
  </article>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

// 12-col grid with deliberate column overlap; the panel sits above the
// frame (both z-content internally — the panel just stacks later).
.dossier {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: center;

  @include t.mobile {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: t.$space-4;
  }
}

// Duotone at rest (cyan-tinted monochrome, full color on hover) comes from
// the shared mixin; the resting brightness and the hover rgb-split echo
// (below) are local.
.dossier__media {
  grid-column: 1 / 8;
  grid-row: 1;

  @include t.corner-brackets;
  @include t.duotone-media('.dossier__img', '.dossier__tint', 0.85);
}

.dossier__panel {
  position: relative;
  z-index: 1;
  grid-column: 7 / 13;
  grid-row: 1;
}

.dossier--flipped {
  .dossier__media {
    grid-column: 6 / 13;
  }

  .dossier__panel {
    grid-column: 1 / 7;
  }
}

// --- visual frame ----------------------------------------------------------
.dossier__frame {
  position: relative;
  overflow: hidden;
}

// Static scanline texture — stays put on hover; it's the glass, not the feed.
.dossier__scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(t.$bg-void, 0.35) 0px,
    rgba(t.$bg-void, 0.35) 1px,
    transparent 1px,
    transparent 3px
  );
}

@media (prefers-reduced-motion: no-preference) {
  // Image analog of the text rgb-split: one chromatic echo, then steady.
  @keyframes img-split {
    0% {
      filter: drop-shadow(3px 0 rgba(t.$magenta, 0.5)) drop-shadow(-3px 0 rgba(t.$cyan, 0.5));
    }
    100% {
      filter: none;
    }
  }

  .dossier__media:hover .dossier__img {
    animation: img-split 150ms steps(3, jump-none) 1;
  }
}

// --- placeholder frame -------------------------------------------------------
.dossier__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: t.$space-3;
  aspect-ratio: 16 / 9;
  background:
    repeating-linear-gradient(
      to right,
      rgba(t.$cyan, 0.05) 0px,
      rgba(t.$cyan, 0.05) 1px,
      transparent 1px,
      transparent 24px
    ),
    repeating-linear-gradient(
      to bottom,
      rgba(t.$cyan, 0.05) 0px,
      rgba(t.$cyan, 0.05) 1px,
      transparent 1px,
      transparent 24px
    ),
    rgba(10, 16, 46, 0.35);
}

.dossier__ring {
  fill: none;
  stroke: t.$cyan-dim;
  stroke-width: 1;
  stroke-dasharray: 4 3;
}

.dossier__tick {
  stroke: t.$cyan-dim;
  stroke-width: 1;
}

.dossier__hull {
  fill: none;
  stroke: t.$cyan;
  stroke-width: 1.2;
  stroke-linejoin: round;
}

.dossier__placeholder-text {
  color: t.$ice-dim;
}

.dossier__placeholder-sub {
  color: rgba(t.$ice-dim, 0.55);
}

// --- panel content ----------------------------------------------------------
.dossier__title {
  margin-bottom: t.$space-3;
}

.dossier__desc {
  margin-bottom: t.$space-4;
}

.dossier__tech {
  display: flex;
  flex-wrap: wrap;
  gap: t.$space-2;
  margin-bottom: t.$space-4;
}

.dossier__links {
  display: flex;
  gap: t.$space-4;
  max-width: none;
}

// --- reveal: frame and panel slide in from opposite sides ---------------------
@media (prefers-reduced-motion: no-preference) {
  @keyframes dossier-from-left {
    from {
      opacity: 0;
      transform: translateX(-24px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes dossier-from-right {
    from {
      opacity: 0;
      transform: translateX(24px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .dossier.is-revealed {
    .dossier__media {
      animation: dossier-from-left 600ms t.$ease-hud both;
    }

    .dossier__panel {
      animation: dossier-from-right 600ms t.$ease-hud 100ms both;
    }

    &.dossier--flipped {
      .dossier__media {
        animation-name: dossier-from-right;
      }

      .dossier__panel {
        animation-name: dossier-from-left;
      }
    }
  }
}
</style>
