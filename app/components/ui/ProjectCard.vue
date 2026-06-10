<script setup lang="ts">
import type { Project } from '~/data/types'

/**
 * ProjectCard — HANGAR BAY craft card, built on HudPanel.
 * Line-art ship glyph (variant picked from the craft id) + mono craft id +
 * SRC/LIVE icon links, then title / clamped description / tech chips.
 * Hover: panel lifts 4px, border brightens to cyan, brackets extend (HudPanel),
 * engine dot pulses once. All motion reduced-motion-gated.
 */
const props = defineProps<{
  project: Project
  /** 1-based hangar position — renders as CRAFT-01… and picks the ship glyph. */
  index: number
}>()

// Six simple stroke silhouettes (24×24): hull path + engine dot position.
const SHIP_VARIANTS = [
  { hull: 'M12 2 L17 20 L12 16 L7 20 Z', engine: { cx: 12, cy: 18 } }, // dart
  { hull: 'M2 17 L12 6 L22 17 L12 13 Z', engine: { cx: 12, cy: 15.5 } }, // delta wing
  { hull: 'M12 3 L18 12 L12 21 L6 12 Z M2 12 L6 12 M18 12 L22 12', engine: { cx: 12, cy: 16 } }, // raider
  { hull: 'M9 4 L15 4 L18 15 L14 20 L10 20 L6 15 Z', engine: { cx: 12, cy: 17.5 } }, // shuttle
  { hull: 'M6 3 L6 16 L12 21 L18 16 L18 3 M6 9 L18 9', engine: { cx: 12, cy: 17 } }, // interceptor
  { hull: 'M4 9 L12 4 L20 9 L20 15 L12 20 L4 15 Z', engine: { cx: 12, cy: 16 } }, // freighter
] as const

const craftId = computed(() => `CRAFT-${String(props.index).padStart(2, '0')}`)

const ship = computed(
  () =>
    SHIP_VARIANTS[(props.index - 1 + SHIP_VARIANTS.length) % SHIP_VARIANTS.length] ??
    SHIP_VARIANTS[0],
)
</script>

<template>
  <HudPanel tag="article" class="project-card">
    <div class="project-card__top">
      <svg
        class="project-card__ship"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        aria-hidden="true"
      >
        <path class="project-card__hull" :d="ship.hull" />
        <circle
          class="project-card__engine"
          :cx="ship.engine.cx"
          :cy="ship.engine.cy"
          r="1.4"
        />
      </svg>

      <span class="project-card__id t-mono-sm">{{ craftId }}</span>

      <div class="project-card__links">
        <a
          v-if="project.github"
          class="project-card__link"
          :href="project.github"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${project.title} — source code (opens GitHub)`"
        >
          <Icon name="simple-icons:github" size="18" />
        </a>
        <a
          v-if="project.liveUrl"
          class="project-card__link"
          :href="project.liveUrl"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${project.title} — live deployment`"
        >
          <Icon name="lucide:external-link" size="18" />
        </a>
      </div>
    </div>

    <h3 class="project-card__title">{{ project.title }}</h3>

    <p class="project-card__desc">{{ project.description }}</p>

    <ul class="project-card__tech" role="list">
      <li v-for="tech in project.tech" :key="tech">
        <TechTag>{{ tech }}</TechTag>
      </li>
    </ul>
  </HudPanel>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform t.$duration-fast t.$ease-hud,
      border-color t.$duration-fast t.$ease-hud,
      box-shadow t.$duration-fast t.$ease-hud;

    &:hover {
      transform: translateY(-4px);
    }
  }

  &:hover {
    border-color: t.$cyan;
    box-shadow: 0 0 18px rgba(t.$cyan, 0.15);
  }
}

.project-card__top {
  display: flex;
  align-items: center;
  gap: t.$space-2;
  margin-bottom: t.$space-4;
}

.project-card__ship {
  flex-shrink: 0;
}

.project-card__hull {
  fill: none;
  stroke: t.$cyan;
  stroke-width: 1.2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.project-card__engine {
  fill: t.$cyan;
  transform-box: fill-box;
  transform-origin: center;
}

.project-card__id {
  color: t.$ice-dim;
}

// Negative outer margins absorb the enlarged hit areas so the header row keeps
// its visual height and right-edge alignment; the boxes themselves never
// overlap (no gap needed — adjacent 44px targets satisfy the guardrail).
.project-card__links {
  display: flex;
  margin: -10px -13px -10px auto;
}

// 44px minimum tap target (project guardrail).
.project-card__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  color: t.$ice-dim;

  @media (prefers-reduced-motion: no-preference) {
    transition: color t.$duration-fast t.$ease-hud;
  }

  &:hover {
    color: t.$cyan;
  }
}

// Global h3 scale already gives display font @ 2rem.
.project-card__title {
  margin-bottom: t.$space-2;
}

.project-card__desc {
  display: -webkit-box;
  margin-bottom: t.$space-4;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.project-card__tech {
  display: flex;
  flex-wrap: wrap;
  gap: t.$space-2;
  margin-top: auto;
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes engine-pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    40% {
      transform: scale(2.2);
      opacity: 0.55;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  // One pulse per hover entry — the animation runs once and stays settled.
  .project-card:hover .project-card__engine {
    animation: engine-pulse 500ms t.$ease-hud 1;
  }
}
</style>
