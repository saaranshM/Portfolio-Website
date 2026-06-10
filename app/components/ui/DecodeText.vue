<script setup lang="ts">
/**
 * DecodeText — text resolves left → right out of random glyph noise over
 * ~700ms, once. Plays on mount by default, or when `play` flips true.
 *
 * SSR / a11y contract:
 * - The REAL text is what's rendered on the server and at rest — prerendered
 *   HTML and no-JS visitors always get the true string.
 * - While scrambling, the root carries `aria-label` with the real text and
 *   the glyph soup is aria-hidden, so screen readers never hear noise.
 * - prefers-reduced-motion: no animation at all.
 *
 * Mono/visual styling is left to the parent.
 */
const props = withDefaults(
  defineProps<{
    text: string
    play?: boolean
    tag?: string
  }>(),
  { play: true, tag: 'span' },
)

const GLYPHS = '▓▒░<>/#01AF'
const DURATION_MS = 700

const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const scrambling = ref(false)
const display = ref('')

let hasPlayed = false
let rafId = 0

function scrambleFrame(progress: number): string {
  const chars = [...props.text]
  return chars
    .map((char, i) => {
      // Resolve left → right; whitespace never scrambles (keeps word shape).
      if (char === ' ' || i < progress * chars.length) return char
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    })
    .join('')
}

function start() {
  if (hasPlayed || reducedMotion.value) return
  hasPlayed = true
  scrambling.value = true

  const startedAt = performance.now()
  const tick = (now: number) => {
    const progress = (now - startedAt) / DURATION_MS
    if (progress >= 1) {
      scrambling.value = false
      return
    }
    display.value = scrambleFrame(progress)
    rafId = requestAnimationFrame(tick)
  }

  display.value = scrambleFrame(0)
  rafId = requestAnimationFrame(tick)
}

// `scrambling` is false during SSR and hydration; the swap to glyphs only
// happens in onMounted, so the prerendered real text never mismatches.
onMounted(() => {
  if (props.play) start()
})

watch(
  () => props.play,
  (play) => {
    if (play) start()
  },
)

onBeforeUnmount(() => cancelAnimationFrame(rafId))
</script>

<template>
  <component :is="tag" :aria-label="scrambling ? text : undefined">
    <span v-if="scrambling" aria-hidden="true">{{ display }}</span>
    <template v-else>{{ text }}</template>
  </component>
</template>
