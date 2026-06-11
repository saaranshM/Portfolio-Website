<script setup lang="ts">
import { NoToneMapping, PerspectiveCamera } from 'three'
import LaserSystem from './LaserSystem.vue'
import ShipSwarm from './ShipSwarm.vue'
import Starfield from './Starfield.vue'
import {
  CAM_SCROLL_MAX_WU,
  MID_REF_DEPTH,
  SCENE_FOV,
  sceneState,
  worldUnitsPerCssPixel,
  writePointer,
  writeScroll,
} from './useSceneState'

/**
 * SceneRoot — owner of the WebGL canvas, render loop, and FPS watchdog
 * (tier 'full' only; this file heads the lazy three.js chunk, loaded by
 * FxLayer as <LazyFxSceneRoot> and never on 'lite'/'off').
 *
 * Suppression matrix (spec §4):
 * - tab hidden        → loop stopped completely
 * - below the fold    → 30fps cap (reactive fpsLimit) + near-dust thinning
 * - coarse pointer    → DPR cap 1.5 (vs 2) + pointer parallax off (Starfield)
 * - <45fps for 5s     → live downgrade to 'lite' + POWER SAVING MODE toast
 * - context fail/lost → live downgrade to 'lite'
 * Runtime downgrades go through applyRuntimeTier — session-only, the user's
 * stored FxToggle override is never touched.
 *
 * Bloom decision (spec §1 risk) — SKIPPED, postprocessing-free:
 * @tresjs/post-processing 3.7.2 + postprocessing 6.39 install cleanly against
 * three 0.184 / @tresjs/core 5.8.1 (no version conflict), but (a) bloom halos
 * land on alpha-0 pixels of this transparent canvas and vanish against the
 * CSS nebula behind it, (b) the composer replaces Tres's render function and
 * never restores it on unmount, which breaks the coarse-pointer "no bloom"
 * row above, and (c) nothing in Phase 4 crosses a bloom threshold anyway.
 * Instead the star sprites are pre-glowed radial-gradient discs (Starfield).
 * PHASE 5 SEAM: laser glow = additive sprite "sleeve" quads around the
 * white-hot core quad — same look as bloom strength 1.2/radius 0.4 on
 * emissives, zero fullscreen passes.
 */

const { applyRuntimeTier, isCoarsePointer } = useEffectsTier()
const { show: showToast } = useHudToast()
const visibility = useDocumentVisibility()

// --- camera ------------------------------------------------------------------
// At origin looking down −Z; pointer parallax lives on the starfield layers,
// the camera only eases on y for scroll parallax (§2.1 MID row: ×0.1).
const camera = markRaw(new PerspectiveCamera(SCENE_FOV, 1, 1, 800))

const SCROLL_PARALLAX = 0.1
const CAM_EASE_RATE = 6 // 1/s

// --- watchdog tuning -----------------------------------------------------------
const GRACE_S = 3 // ignore load jank after mount
const BUCKET_S = 0.5 // FPS sampling window
const MIN_FPS = 45
const SUSTAIN_S = 5

// --- reactive shell state ------------------------------------------------------
/** Override 'full' skips useEffectsTier's WebGL2 probe, so a context-creation
 *  failure must be caught live here instead of crashing the layer. */
const webglOk = ref(true)
const entered = ref(false)
/** Mirrors sceneState.belowFold, but only flips on fold crossings — it feeds
 *  the reactive fpsLimit prop and must not churn on every scroll event. */
const belowFold = ref(false)

// --- non-reactive runtime state -------------------------------------------------
let loopCtl: { start: () => void; stop: () => void } | null = null
let rendererCanvas: HTMLCanvasElement | null = null
let viewportH = 1
let camY = 0
let graceLeft = GRACE_S
let bucketTime = 0
let bucketFrames = 0
let lowTime = 0
/** The watchdog only arms once a bucket has DEMONSTRATED ≥ MIN_FPS — a 30Hz
 *  display or OS Low Power Mode caps rAF below the threshold from the very
 *  first frame, and downgrading those would punish capable GPUs. The trade:
 *  a device janky from frame one never fires, but detect-gpu's tiering
 *  already routes those to 'lite'. */
let watchdogArmed = false
let downgraded = false

function downgrade(toast = false): void {
  if (downgraded) return
  downgraded = true
  applyRuntimeTier('lite')
  if (toast) showToast('POWER SAVING MODE')
}

// --- per-frame data writers (window listeners owned here, spec §2.1) -----------
function onPointerMove(e: PointerEvent): void {
  writePointer(
    (e.clientX / window.innerWidth) * 2 - 1,
    -((e.clientY / window.innerHeight) * 2 - 1),
  )
}

function syncScroll(): void {
  viewportH = window.innerHeight
  const y = window.scrollY
  const below = y > viewportH
  writeScroll(y, below)
  if (belowFold.value !== below) belowFold.value = below
}

function resetWatchdogWindow(): void {
  bucketTime = 0
  bucketFrames = 0
  lowTime = 0
}

// --- render loop (TresCanvas @before-loop; plain math, zero allocations) -------
function onBeforeLoop({ delta }: { delta: number }): void {
  const dt = Math.min(delta, 0.25) // clamp resume gaps

  // Scroll parallax: camera y eased toward −scrollY×0.1 (screen px converted
  // to world units at the mid depth), clamped so deep pages can't scroll the
  // sky out of its generated bounds.
  const targetY = -Math.min(
    sceneState.scrollY * SCROLL_PARALLAX * worldUnitsPerCssPixel(MID_REF_DEPTH, viewportH),
    CAM_SCROLL_MAX_WU,
  )
  camY += (targetY - camY) * (1 - Math.exp(-dt * CAM_EASE_RATE))
  camera.position.y = camY
  // Published BEFORE child useLoop callbacks run (Tres fires @before-loop
  // first) — ShipSwarm/LaserSystem screen-space projections read this.
  sceneState.camY = camY

  // FPS watchdog. Loop stop() already covers hidden tabs; the 30fps cap makes
  // below-fold frames meaningless, so measurement pauses there too.
  if (downgraded) return
  if (sceneState.belowFold) {
    resetWatchdogWindow()
    return
  }
  if (graceLeft > 0) {
    graceLeft -= dt
    return
  }
  bucketTime += dt
  bucketFrames++
  if (bucketTime >= BUCKET_S) {
    const fps = bucketFrames / bucketTime
    if (fps >= MIN_FPS) watchdogArmed = true
    lowTime = fps < MIN_FPS ? lowTime + bucketTime : 0
    bucketTime = 0
    bucketFrames = 0
    if (watchdogArmed && lowTime >= SUSTAIN_S) downgrade(true)
  }
}

// --- context lifecycle ----------------------------------------------------------
function onContextLost(): void {
  downgrade()
}

// Structural slice of Tres's context — verified against @tresjs/core 5.8.1
// (loop start/stop semantics and the live-reactive fpsLimit prop are the two
// implementation details a minor Tres release could plausibly change).
interface TresReadyContext {
  renderer: {
    loop: { start: () => void; stop: () => void }
    instance: { domElement: HTMLCanvasElement }
  }
}

/** Exposed surface of <TresCanvas> — dispose() is the force-teardown path. */
const tresCanvasRef = ref<{ dispose?: () => void } | null>(null)

function onReady(ctx: TresReadyContext): void {
  loopCtl = ctx.renderer.loop
  rendererCanvas = ctx.renderer.instance.domElement
  rendererCanvas.addEventListener('webglcontextlost', onContextLost)
  if (visibility.value !== 'visible') loopCtl.stop()
  // Entrance: WebGL is never on the critical path — the canvas fades in over
  // 600ms (CSS, reduced-motion gated) once the first frame can exist.
  requestAnimationFrame(() => { entered.value = true })
}

function onRendererError(): void {
  downgrade()
}

// WebGLRenderer construction throws synchronously when context creation fails
// (the probe can pass and the real context still be refused) — catch anything
// the scene subtree throws and degrade instead of crashing the page. Logged
// in dev: a silent downgrade would otherwise mask real bugs in scene children.
onErrorCaptured((err) => {
  if (import.meta.dev) console.error('[SceneRoot] scene error — downgrading to lite:', err)
  downgrade()
  return false
})

onMounted(() => {
  if (!hasWebGl2Support()) {
    webglOk.value = false
    downgrade()
    return
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('scroll', syncScroll, { passive: true })
  window.addEventListener('resize', syncScroll, { passive: true })
  syncScroll()
})

// Pause COMPLETELY while the tab is hidden (rAF throttling is not guaranteed
// to be total); stale watchdog windows are discarded on every flip.
watch(visibility, (v) => {
  if (!loopCtl) return
  resetWatchdogWindow()
  if (v === 'visible') loopCtl.start()
  else loopCtl.stop()
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('scroll', syncScroll)
  window.removeEventListener('resize', syncScroll)
  // Listener off FIRST: the forced context loss below must not re-enter
  // downgrade() and clobber a user-selected tier.
  rendererCanvas?.removeEventListener('webglcontextlost', onContextLost)
  rendererCanvas = null
  loopCtl = null
  // Tres 5.8.1's own unmount only disposes the scene graph (force=false) —
  // renderer.dispose() + forceContextLoss() live behind the EXPOSED dispose()
  // and nothing else calls it. Without this, every FxToggle flip away from
  // 'full' orphans a live GL context until GC. Starfield disposes its
  // <primitive> objects (exempt from Tres auto-disposal) itself.
  tresCanvasRef.value?.dispose?.()
})
</script>

<template>
  <div
    v-if="webglOk"
    class="scene-root"
    :class="{ 'scene-root--entered': entered }"
  >
    <!-- alpha: transparent over the CSS void/nebula. antialias off: points/
         sprites only, save the fill rate. DPR cap 2, 1.5 on coarse pointers.
         fpsLimit is reactive — 30fps below the fold. -->
    <TresCanvas
      ref="tresCanvasRef"
      :camera="camera"
      :alpha="true"
      :antialias="false"
      power-preference="high-performance"
      :dpr="isCoarsePointer ? [1, 1.5] : [1, 2]"
      :fps-limit="belowFold ? 30 : undefined"
      :tone-mapping="NoToneMapping"
      style="pointer-events: none"
      @ready="onReady"
      @error="onRendererError"
      @before-loop="onBeforeLoop"
    >
      <Starfield />
      <!-- Loop order matters and comes from REGISTRATION order (each
           useLoop() gets its own priority hook, so priority args can't order
           across components): the @before-loop emit above registers first
           (camY), then template order — ShipSwarm steers, THEN LaserSystem
           targets/near-misses against the fresh projections. -->
      <ShipSwarm />
      <LaserSystem />
    </TresCanvas>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.scene-root {
  position: absolute;
  inset: 0;

  @media (prefers-reduced-motion: no-preference) {
    opacity: 0;
    transition: opacity 600ms t.$ease-hud;

    &.scene-root--entered {
      opacity: 1;
    }
  }
}
</style>
