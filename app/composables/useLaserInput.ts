import type { Ref } from 'vue'
import { queueLaser } from '~/components/fx/scene/useSceneState'

/**
 * useLaserInput — click-to-fire input path (spec §6), owned by FxLayer (the
 * one component that is always mounted and already hosts the tier switch).
 *
 * Window `pointerdown` (passive), active ONLY when ALL of:
 * - tier is 'full' or 'lite' ('off' → inert, no listener at all)
 * - fine pointer (coarse devices never fire; individual touch events on
 *   hybrid devices are also ignored via pointerType)
 * - prefers-reduced-motion is NOT set (a stored 'full' override can outrank
 *   the OS setting at the tier level, so it is re-checked here)
 *
 * A shot is SUPPRESSED when (links always win):
 * - the target sits inside a,button,input,textarea,select,[role="button"],
 *   [data-no-fire],dialog
 * - a text selection is active
 * - the 250ms cooldown hasn't elapsed
 *
 * On accept: 'full' → queueLaser(ndc) for LaserSystem (bounded there, a
 * saturated queue swallows the shot, no blip); 'lite' → the caller's 2D
 * streak handler (LaserLite). Either way the HTML crosshair blip (12px,
 * 150ms, reduced-motion-gated CSS) replays at the cursor.
 */

const COOLDOWN_MS = 250
const SUPPRESS_SELECTOR =
  'a,button,input,textarea,select,[role="button"],[data-no-fire],dialog'

export interface LaserInputOptions {
  /** The crosshair blip element (rendered by the owner, pointer-events none). */
  blipEl: Ref<HTMLElement | null>
  /** 'lite' tier shots — LaserLite's 2D streak entry point (CSS px). */
  onLiteFire: (cssX: number, cssY: number) => void
}

export function useLaserInput(options: LaserInputOptions): void {
  const { tier, isCoarsePointer } = useEffectsTier()
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  let lastFire = -Infinity

  function blip(cssX: number, cssY: number): void {
    const el = options.blipEl.value
    if (!el) return
    el.style.left = `${cssX}px`
    el.style.top = `${cssY}px`
    // Restart the one-shot CSS animation (forced reflow between toggles).
    el.classList.remove('is-firing')
    void el.offsetWidth
    el.classList.add('is-firing')
  }

  function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return
    if (event.pointerType === 'touch') return // fine pointers only
    const target = event.target
    if (target instanceof Element && target.closest(SUPPRESS_SELECTOR)) return
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) return
    const now = performance.now()
    if (now - lastFire < COOLDOWN_MS) return

    if (tier.value === 'full') {
      const ndcX = (event.clientX / window.innerWidth) * 2 - 1
      const ndcY = -((event.clientY / window.innerHeight) * 2 - 1)
      if (!queueLaser(ndcX, ndcY)) return // pool saturated: no blip, no cooldown
    } else {
      options.onLiteFire(event.clientX, event.clientY)
    }
    lastFire = now
    blip(event.clientX, event.clientY)
  }

  // SSR-safe: no media/tier state is trustworthy until mount, and the
  // listener itself only exists client-side.
  onMounted(() => {
    watch(
      () =>
        (tier.value === 'full' || tier.value === 'lite') &&
        !isCoarsePointer.value &&
        !reducedMotion.value,
      (active) => {
        if (active) window.addEventListener('pointerdown', onPointerDown, { passive: true })
        else window.removeEventListener('pointerdown', onPointerDown)
      },
      { immediate: true },
    )
  })

  onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', onPointerDown)
  })
}
