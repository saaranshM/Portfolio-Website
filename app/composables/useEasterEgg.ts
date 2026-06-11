import { sceneState } from '~/components/fx/scene/useSceneState'

/**
 * useEasterEgg — the 8s dogfight trigger (spec §6), owned by FxLayer
 * (always mounted exactly once at layout level, right next to the other
 * play-layer input composable; nothing here touches three.js, so it adds
 * nothing to the entry bundle beyond two tiny listeners).
 *
 * Triggers:
 * - Konami code ↑↑↓↓←→←→BA on window keydown (ignored while typing in
 *   inputs/textareas/contenteditable)
 * - touch alternative: 5 taps on the header logo (`[data-egg-tap]`,
 *   delegated window click listener) within 2s
 *
 * Fires once per tab session (sessionStorage EGG_SESSION_KEY), ONLY on tier
 * 'full' and never under prefers-reduced-motion. The composable owns the
 * timeline: it flips sceneState.fx.eggActive for exactly 8s — ShipSwarm and
 * LaserSystem read the flag in-loop (extra ships, rapid volleys, bolt cap 16,
 * dreadnought, EMP at t≈7s) — then shows the completion toast.
 */

const EGG_DURATION_MS = 8000
const KONAMI = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
] as const
const TAP_COUNT = 5
const TAP_WINDOW_MS = 2000

export function useEasterEgg(): void {
  const { tier } = useEffectsTier()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const { show: showToast } = useHudToast()

  let progress = 0
  let taps = 0
  let tapWindowStart = 0
  let endTimer = 0

  function trigger(): void {
    if (tier.value !== 'full' || reducedMotion.value) return
    if (sceneState.fx.eggActive) return
    // Below the fold the dogfight is suppressed (ships trimmed, volleys off) —
    // decline WITHOUT burning the session flag so scrolling up lets it fire.
    if (sceneState.belowFold) return
    try {
      if (sessionStorage.getItem(EGG_SESSION_KEY)) return
      sessionStorage.setItem(EGG_SESSION_KEY, '1')
    } catch {
      // Storage denied (private mode): still play, just not once-per-session.
    }
    sceneState.fx.eggActive = true
    endTimer = window.setTimeout(() => {
      sceneState.fx.eggActive = false
      showToast('SIMULATION COMPLETE // THANKS FOR VISITING')
    }, EGG_DURATION_MS)
  }

  function onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
    ) {
      return
    }
    const key = event.key.toLowerCase()
    if (key === KONAMI[progress]) progress++
    else progress = key === KONAMI[0] ? 1 : 0
    if (progress === KONAMI.length) {
      progress = 0
      trigger()
    }
  }

  /** Delegated: any click/tap landing on the [data-egg-tap] logo counts. */
  function onTap(event: Event): void {
    const target = event.target
    if (!(target instanceof Element) || !target.closest('[data-egg-tap]')) return
    const now = performance.now()
    if (now - tapWindowStart > TAP_WINDOW_MS) {
      tapWindowStart = now
      taps = 1
      return
    }
    taps++
    if (taps >= TAP_COUNT) {
      taps = 0
      tapWindowStart = 0
      trigger()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('click', onTap)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('click', onTap)
    window.clearTimeout(endTimer)
    // Never strand the scene mid-dogfight if the owner unmounts.
    sceneState.fx.eggActive = false
  })
}
