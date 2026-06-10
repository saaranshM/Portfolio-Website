<script setup lang="ts">
/**
 * DecodeText — text resolves left → right out of random glyph noise, once.
 * Plays on mount by default, or when `play` flips true.
 *
 * SSR / a11y contract:
 * - The REAL text is always in the DOM — prerendered HTML and no-JS visitors
 *   get the true string, and it is what assistive tech reads.
 * - While scrambling, the real text stays in flow at `opacity: 0` (keeps both
 *   layout width and the accessibility tree intact) and the glyph noise is an
 *   absolutely-positioned `aria-hidden` overlay. Decode contexts are mono, so
 *   the overlay aligns glyph-for-glyph with the reserved width.
 * - prefers-reduced-motion: no animation at all.
 *
 * Mono/visual styling is left to the parent.
 */
const props = withDefaults(
  defineProps<{
    text: string
    play?: boolean
    tag?: string
    /** Scramble duration in ms. */
    duration?: number
  }>(),
  { play: true, tag: 'span', duration: 700 },
)

const GLYPHS = '▓▒░<>/#01AF'

const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const scrambling = ref(false)
const display = ref('')

let hasPlayed = false
let rafId = 0

const chars = computed(() => [...props.text])

function scrambleFrame(progress: number): string {
  return chars.value
    .map((char, i) => {
      // Resolve left → right; whitespace (incl. nbsp) never scrambles.
      if (/\s/.test(char) || i < progress * chars.value.length) return char
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
    const progress = (now - startedAt) / props.duration
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

// `scrambling` is false during SSR and hydration; the overlay only appears
// after onMounted, so the prerendered real text never mismatches.
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
  <component :is="tag" class="decode-text">
    <span class="decode-text__real" :class="{ 'decode-text__real--hidden': scrambling }">{{
      text
    }}</span>
    <span v-if="scrambling" class="decode-text__overlay" aria-hidden="true">{{ display }}</span>
  </component>
</template>

<style lang="scss" scoped>
.decode-text {
  position: relative;
}

// opacity (not visibility/display) — keeps layout width reserved AND keeps
// the real text in the accessibility tree while the overlay animates.
.decode-text__real--hidden {
  opacity: 0;
}

.decode-text__overlay {
  position: absolute;
  inset: 0;
}
</style>
