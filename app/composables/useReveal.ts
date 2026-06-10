import type { UseIntersectionObserverOptions } from '@vueuse/core'

/**
 * useReveal — one-shot scroll-reveal trigger for the Flight Deck reveal
 * grammar (`.is-revealed` / `revealed` props on the UI primitives).
 *
 * Contract:
 * - `revealed` flips true ONCE when `target` enters the trigger zone, then
 *   the observer disconnects — reveals never replay. The default is
 *   distance-based (any pixel crossing 15% above the viewport bottom), not
 *   ratio-based, so arbitrarily tall sections still fire near the fold;
 *   callers can pass their own IntersectionObserver options.
 * - Under prefers-reduced-motion it flips true immediately on mount (the
 *   primitives gate their animations anyway; this keeps any state-dependent
 *   styling settled).
 * - SSR / no-JS: `revealed` stays false and that MUST be a fully visible
 *   baseline — reveal styling is "animate in when the class lands", never
 *   "hidden until the class lands" (see `.reveal-item` in _base.scss).
 */
export function useReveal(
  options: UseIntersectionObserverOptions = { threshold: 0, rootMargin: '0px 0px -15% 0px' },
) {
  const target = ref<HTMLElement | null>(null)
  const revealed = ref(false)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const { stop } = useIntersectionObserver(
    target,
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        revealed.value = true
        stop()
      }
    },
    options,
  )

  onMounted(() => {
    if (reducedMotion.value) {
      revealed.value = true
      stop()
    }
  })

  return { target, revealed }
}
