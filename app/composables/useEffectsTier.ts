import type { Ref } from 'vue'
import type { Tier } from '~/utils/constants'

/**
 * useEffectsTier — singleton resolver for the effects tier (spec §4).
 *
 * SSR and pre-mount the tier is `'off'` (the StaticBackdrop baseline), then
 * detection runs once on the client. First match wins:
 *
 *   1. localStorage['fx-tier'] user override (FxToggle) → use it, skip detection
 *   2. `prefers-reduced-motion: reduce` (live-reactive) → 'off'
 *   3. no WebGL2 context obtainable                     → 'lite'
 *   4. detect-gpu tier ≤ 1, deviceMemory < 4, or ≤ 2 cores → 'lite'
 *   5. otherwise                                        → 'full'
 *
 * Any detection failure (detect-gpu throw, storage denied…) degrades to
 * 'lite' — never crashes. If the OS reduced-motion setting flips at runtime
 * and there is no explicit override, detection re-runs.
 *
 * All state lives at module scope: every caller shares the exact same refs.
 * The media-query watchers live in a detached effectScope so they survive
 * any individual subscriber unmounting.
 */

/** detect-gpu's model database, vendored by scripts/copy-gpu-benchmarks.mjs
 *  so getGPUTier() never reaches for its default unpkg.com CDN URL.
 *  Root-relative: prepend app.baseURL if the site ever moves off the domain
 *  root (a silent 404 here degrades detection to 'lite' via the catch). */
const FX_BENCHMARKS_URL = '/fx-benchmarks'

const tier = ref<Tier>('off')
const override = ref<Tier | null>(null)
/** True once the override was applied or first detection settled (BootOverlay). */
const ready = ref(false)
/** '(pointer: coarse)' — Phases 4/5 gate pointer-driven FX on this. */
const isCoarsePointer = ref(false)

const tierReadonly = readonly(tier)
const overrideReadonly = readonly(override)
const readyReadonly = readonly(ready)
const isCoarsePointerReadonly = readonly(isCoarsePointer)

let initialized = false
let reducedMotion: Readonly<Ref<boolean>> | null = null
/** Monotonic token — stale async detections must not clobber newer state. */
let detectSeq = 0

function readStoredOverride(): Tier | null {
  try {
    const raw = localStorage.getItem(FX_TIER_STORAGE_KEY)
    return raw !== null && (TIERS as readonly string[]).includes(raw)
      ? (raw as Tier)
      : null
  } catch {
    return null
  }
}

async function detectTier(): Promise<Tier> {
  if (reducedMotion?.value) return 'off'
  if (!hasWebGl2Support()) return 'lite'

  // Cheap device heuristics before paying for the detect-gpu chunk.
  const nav = navigator as Navigator & { deviceMemory?: number }
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return 'lite'
  if (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 2) return 'lite'

  try {
    const { getGPUTier } = await import('detect-gpu')
    const gpu = await getGPUTier({ benchmarksURL: FX_BENCHMARKS_URL })
    if (gpu.tier <= 1) return 'lite'
  } catch {
    return 'lite' // detection failure degrades, never crashes
  }

  return 'full'
}

async function runDetection(): Promise<void> {
  const seq = ++detectSeq
  const result = await detectTier()
  // An override landed (or a newer run started) while we were detecting.
  if (seq !== detectSeq || override.value !== null) return
  tier.value = result
  ready.value = true
}

/** Keep --panel-blur on :root in sync with the tier: 'lite' halves the HUD
 *  glass blur to 6px, every other tier falls back to the CSS 12px default.
 *  (The Phase 4 FPS watchdog may additionally set this to 0 on live downgrade.) */
function syncPanelBlur(t: Tier): void {
  const root = document.documentElement
  if (t === 'lite') root.style.setProperty('--panel-blur', '6px')
  else root.style.removeProperty('--panel-blur')
}

/**
 * Runtime (session-only) tier change — the Phase 4 FPS watchdog and
 * context-creation failure path. Unlike setOverride this touches neither
 * `override` nor localStorage, so a transient downgrade never becomes a
 * pinned setting; with no explicit override FxToggle reads `AUTO (LITE)`.
 */
function applyRuntimeTier(t: Tier): void {
  detectSeq++ // cancel any in-flight detection
  tier.value = t
  ready.value = true
}

function setOverride(t: Tier | null): void {
  override.value = t
  if (!import.meta.client) return

  try {
    if (t === null) localStorage.removeItem(FX_TIER_STORAGE_KEY)
    else localStorage.setItem(FX_TIER_STORAGE_KEY, t)
  } catch {
    // Storage denied (private mode) — the override still applies this session.
  }

  if (t === null) {
    void runDetection()
  } else {
    detectSeq++ // cancel any in-flight detection
    tier.value = t
    ready.value = true
  }
}

function init(): void {
  // Guarded HERE (not at registration) so a first caller whose mount never
  // fires — e.g. a hydration-time error swapping in error.vue — doesn't
  // permanently kill detection: the next caller that actually mounts wins.
  if (initialized) return
  initialized = true

  // Detached scope: the singleton's watchers must outlive whichever
  // component happened to call the composable first.
  const scope = effectScope(true)
  scope.run(() => {
    reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
    const coarse = useMediaQuery('(pointer: coarse)')

    watch(coarse, (v) => { isCoarsePointer.value = v }, { immediate: true })
    watch(tier, syncPanelBlur, { immediate: true })

    // OS setting flipped at runtime: with no explicit override, re-evaluate
    // (reduce → 'off'; back to no-preference → full re-detection).
    watch(reducedMotion, () => {
      if (override.value === null) void runDetection()
    })
  })

  override.value = readStoredOverride()
  if (override.value !== null) {
    tier.value = override.value
    ready.value = true
  } else {
    void runDetection()
  }
}

export function useEffectsTier() {
  if (import.meta.client && !initialized) {
    // Spec §4: detection starts on mount. Outside a component (plugin,
    // test) there is no mount hook — init immediately instead. Every
    // pre-mount caller registers; init() itself is idempotent.
    if (getCurrentInstance()) onMounted(init)
    else init()
  }

  return {
    tier: tierReadonly,
    override: overrideReadonly,
    ready: readyReadonly,
    setOverride,
    applyRuntimeTier,
    isCoarsePointer: isCoarsePointerReadonly,
  }
}
