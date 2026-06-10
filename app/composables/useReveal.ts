/**
 * useReveal — one-shot scroll-reveal trigger for the Flight Deck reveal
 * grammar (`.is-revealed` / `revealed` props on the UI primitives).
 *
 * Contract:
 * - `revealed` flips true ONCE when ≥ `threshold` of `target` is visible,
 *   then the observer disconnects — reveals never replay.
 * - Under prefers-reduced-motion it flips true immediately on mount (the
 *   primitives gate their animations anyway; this keeps any state-dependent
 *   styling settled).
 * - SSR / no-JS: `revealed` stays false and that MUST be a fully visible
 *   baseline — reveal styling is "animate in when the class lands", never
 *   "hidden until the class lands" (see `.reveal-item` in _base.scss).
 */
export function useReveal(threshold = 0.2) {
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
    { threshold },
  )

  onMounted(() => {
    if (reducedMotion.value) {
      revealed.value = true
      stop()
    }
  })

  return { target, revealed }
}
