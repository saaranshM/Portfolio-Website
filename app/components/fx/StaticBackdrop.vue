<script setup lang="ts">
/**
 * StaticBackdrop — effects tier 'off' (and the SSR/first-paint baseline).
 *
 * The void gradient + nebula live on <body> in _base.scss, so this layer
 * only adds the starfield: ~80 absolutely-positioned dots in 3 sizes, a
 * third of which twinkle (CSS-only, gated behind prefers-reduced-motion).
 *
 * Stars come from a seeded PRNG (mulberry32) so the server and client
 * render byte-identical markup — Math.random() here would be a
 * hydration mismatch.
 */

interface Star {
  x: number
  y: number
  size: number
  twinkle: boolean
  delay: number
  duration: number
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STAR_COUNT = 80
const STAR_SIZES = [1, 1.5, 2.5]

const rand = mulberry32(0x57a85eed)

const stars: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => ({
  x: Math.round(rand() * 10000) / 100,
  y: Math.round(rand() * 10000) / 100,
  size: STAR_SIZES[Math.floor(rand() * STAR_SIZES.length)] ?? 1,
  twinkle: i % 3 === 0,
  delay: Math.round(rand() * 600) / 100,
  duration: Math.round((300 + rand() * 500)) / 100,
}))
</script>

<template>
  <div class="static-backdrop" aria-hidden="true">
    <span
      v-for="(star, i) in stars"
      :key="i"
      class="star"
      :class="{ 'star--twinkle': star.twinkle }"
      :style="{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        ...(star.twinkle
          ? { animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s` }
          : {}),
      }"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.static-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-scene);
  pointer-events: none;
  overflow: hidden;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: t.$ice;
  opacity: 0.65;

  // The biggest dots read as near stars — give them a faint halo.
  &:nth-child(4n) {
    background: t.$white-hot;
    box-shadow: 0 0 6px rgba(t.$cyan, 0.35);
  }
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes star-twinkle {
    0%,
    100% {
      opacity: 0.65;
    }
    50% {
      opacity: 0.15;
    }
  }

  .star--twinkle {
    animation-name: star-twinkle;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
  }
}
</style>
