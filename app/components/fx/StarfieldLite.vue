<script setup lang="ts">
/**
 * StarfieldLite — Canvas-2D parallax starfield for the 'lite' tier (and,
 * until Phase 4 lands the WebGL scene, the 'full' tier too).
 *
 * Two depth layers (far/mid) of seeded-PRNG stars in normalized 0–1 space —
 * resizes rescale, they never reshuffle. Motion is a slow +x drift per layer
 * plus rAF-lerped pointer parallax (far ×0.02 / mid ×0.06; disabled on
 * coarse pointers). A small fraction of stars twinkle on a sine.
 *
 * Frame budget: one rAF loop over plain (non-reactive) state, zero per-frame
 * allocations in steady state — target <4ms/frame. The loop pauses entirely
 * when the tab is hidden, and under prefers-reduced-motion it draws exactly
 * one static frame.
 */

interface LiteStar {
  x: number // normalized 0–1
  y: number // normalized 0–1
  size: number // CSS px
  alpha: number
  color: string
  twinkle: boolean
  twinklePhase: number
  twinkleSpeed: number // rad/s
}

interface StarLayer {
  stars: LiteStar[]
  drift: number // px/s, +x
  parallax: number // pointer multiplier
  driftX: number // accumulated drift offset (px)
  px: number // lerped pointer offset (px)
  py: number
}

const ICE = '#cfe9ff'
const WHITE_HOT = '#eafffe'
const CYAN_TINT = '#9fe8f5'

const DPR_CAP = 2
const TWINKLE_FRACTION = 0.15
const POINTER_LERP_RATE = 6 // 1/s — exponential smoothing constant

// Constant seed: the same sky every visit, on every viewport.
const rand = mulberry32(0x11735a17)

function makeStars(
  count: number,
  sizes: readonly number[],
  alphaBase: number,
  alphaSpread: number,
  colors: readonly string[],
): LiteStar[] {
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    size: sizes[Math.floor(rand() * sizes.length)] ?? 1,
    alpha: alphaBase + rand() * alphaSpread,
    color: colors[Math.floor(rand() * colors.length)] ?? ICE,
    twinkle: rand() < TWINKLE_FRACTION,
    twinklePhase: rand() * Math.PI * 2,
    twinkleSpeed: 0.8 + rand() * 1.6,
  }))
}

// Plain objects — the rAF loop must never touch Vue reactivity.
const layers: StarLayer[] = [
  {
    stars: makeStars(120, [1], 0.3, 0.25, [ICE]),
    drift: 2,
    parallax: 0.02,
    driftX: 0,
    px: 0,
    py: 0,
  },
  {
    stars: makeStars(50, [1.5, 2], 0.55, 0.35, [ICE, WHITE_HOT, CYAN_TINT]),
    drift: 4,
    parallax: 0.06,
    driftX: 0,
    px: 0,
    py: 0,
  },
]

const canvasRef = ref<HTMLCanvasElement | null>(null)

const visibility = useDocumentVisibility()
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const { isCoarsePointer } = useEffectsTier()

// --- non-reactive runtime state ---------------------------------------------
let ctx: CanvasRenderingContext2D | null = null
let cssW = 0
let cssH = 0
let rafId = 0
let lastT = 0
let pointerX = 0 // px from viewport center, set by pointermove
let pointerY = 0
let parallaxOn = true // mirrors !isCoarsePointer (no ref reads in the loop)
let resizeObserver: ResizeObserver | null = null

// Dev-only frame instrumentation: rolling average, logged once after 5s.
let perfSum = 0
let perfFrames = 0
let perfStart = 0
let perfLogged = false

function resize(): void {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  const rect = canvas.getBoundingClientRect()
  cssW = Math.max(rect.width, 1)
  cssH = Math.max(rect.height, 1)
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
  canvas.width = Math.round(cssW * dpr)
  canvas.height = Math.round(cssH * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  // While paused (reduced motion / hidden tab) keep the static frame intact.
  if (rafId === 0) draw(performance.now() / 1000)
}

function onPointerMove(e: PointerEvent): void {
  // Passive listener just records the position; the rAF loop consumes it.
  // True viewport center — not canvas-derived, so the parallax origin stays
  // correct even if this component is ever mounted at non-viewport size.
  pointerX = e.clientX - window.innerWidth / 2
  pointerY = e.clientY - window.innerHeight / 2
}

function step(dt: number): void {
  const targetX = parallaxOn ? pointerX : 0
  const targetY = parallaxOn ? pointerY : 0
  // Frame-rate-independent exponential smoothing toward the pointer.
  const k = 1 - Math.exp(-dt * POINTER_LERP_RATE)
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]!
    layer.driftX = (layer.driftX + layer.drift * dt) % cssW
    layer.px += (targetX * layer.parallax - layer.px) * k
    layer.py += (targetY * layer.parallax - layer.py) * k
  }
}

function draw(now: number): void {
  if (!ctx) return
  ctx.clearRect(0, 0, cssW, cssH)
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]!
    const ox = layer.driftX + layer.px
    const oy = layer.py
    const stars = layer.stars
    for (let j = 0; j < stars.length; j++) {
      const s = stars[j]!
      let x = s.x * cssW + ox
      x = ((x % cssW) + cssW) % cssW
      let y = s.y * cssH + oy
      y = ((y % cssH) + cssH) % cssH
      let a = s.alpha
      if (s.twinkle) a *= 0.55 + 0.45 * Math.sin(now * s.twinkleSpeed + s.twinklePhase)
      ctx.globalAlpha = a
      ctx.fillStyle = s.color
      ctx.fillRect(x - s.size / 2, y - s.size / 2, s.size, s.size)
    }
  }
  ctx.globalAlpha = 1
}

function frame(t: number): void {
  rafId = requestAnimationFrame(frame)
  const now = t / 1000
  const dt = Math.min(now - lastT, 0.1) // clamp resume gaps
  lastT = now

  if (import.meta.dev) {
    const t0 = performance.now()
    step(dt)
    draw(now)
    perfSum += performance.now() - t0
    perfFrames++
    if (perfStart === 0) perfStart = t
    if (!perfLogged && t - perfStart > 5000) {
      perfLogged = true
      console.debug(
        `[StarfieldLite] avg frame ${(perfSum / perfFrames).toFixed(2)}ms over ${perfFrames} frames (budget 4ms)`,
      )
    }
    return
  }

  step(dt)
  draw(now)
}

function start(): void {
  if (rafId !== 0 || !ctx) return
  lastT = performance.now() / 1000
  rafId = requestAnimationFrame(frame)
}

function stop(): void {
  if (rafId !== 0) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function applyRunState(): void {
  if (reducedMotion.value) {
    stop()
    draw(performance.now() / 1000) // exactly one static frame
    return
  }
  if (visibility.value !== 'visible') {
    stop()
    return
  }
  start()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)

  window.addEventListener('pointermove', onPointerMove, { passive: true })

  watch(isCoarsePointer, (coarse) => { parallaxOn = !coarse }, { immediate: true })
  watch([visibility, reducedMotion], applyRunState, { immediate: true })
})

onBeforeUnmount(() => {
  stop()
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('pointermove', onPointerMove)
  ctx = null
})
</script>

<template>
  <canvas ref="canvasRef" class="starfield-lite" />
</template>

<style lang="scss" scoped>
.starfield-lite {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
