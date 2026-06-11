<script setup lang="ts">
/**
 * LaserLite — Canvas-2D laser streaks for the 'lite' tier, mounted by
 * FxLayer as a sibling canvas over StarfieldLite. Shares the exact same
 * input path as the WebGL bolts (useLaserInput calls the exposed `fire`),
 * so suppression/cooldown rules are identical across tiers.
 *
 * Zero idle cost: this component runs NO rAF loop at rest — the loop starts
 * on fire() and stops the moment the streak pool empties (the canvas is
 * cleared on stop). Twin 2D lines sweep from the bottom viewport corners to
 * the click point over ~0.4s, glow via layered strokes (no shadowBlur — it
 * rasterizes per draw and would blow the lite frame budget), max 4 streaks
 * alive (oldest recycled). DPR-aware (cap 2), reduced-motion never reaches
 * here (useLaserInput is inert under it).
 */

const STREAK_POOL = 4
const STREAK_S = 0.4
const DPR_CAP = 2
const CYAN = '0, 240, 255'
const WHITE_HOT = '#eafffe'

interface Streak {
  active: boolean
  t: number
  x0: number
  y0: number
  tx: number
  ty: number
}

// Plain pool — no Vue reactivity anywhere near the draw loop.
const streaks: Streak[] = Array.from({ length: STREAK_POOL }, () => ({
  active: false,
  t: 0,
  x0: 0,
  y0: 0,
  tx: 0,
  ty: 0,
}))

const canvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let cssW = 0
let cssH = 0
let rafId = 0
let lastT = 0
let resizeObserver: ResizeObserver | null = null

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
  ctx.lineCap = 'round'
}

function claimSlot(): Streak {
  let oldest = streaks[0]!
  for (let i = 0; i < streaks.length; i++) {
    const s = streaks[i]!
    if (!s.active) return s
    if (s.t > oldest.t) oldest = s // most-elapsed = closest to death
  }
  return oldest
}

/** Twin streaks from the bottom corners converging on the click (CSS px). */
function fire(cssX: number, cssY: number): void {
  if (!ctx) return
  const left = claimSlot()
  left.active = true
  left.t = 0
  left.x0 = 0
  left.y0 = cssH
  left.tx = cssX
  left.ty = cssY
  const right = claimSlot()
  right.active = true
  right.t = 0
  right.x0 = cssW
  right.y0 = cssH
  right.tx = cssX
  right.ty = cssY
  start()
}

defineExpose({ fire })

function drawStreak(c: CanvasRenderingContext2D, s: Streak): void {
  const p = s.t / STREAK_S
  // Head races ahead, tail follows — a moving tracer segment.
  const head = Math.min(p / 0.8, 1)
  const tail = Math.max((p - 0.25) / 0.75, 0)
  const hx = s.x0 + (s.tx - s.x0) * head
  const hy = s.y0 + (s.ty - s.y0) * head
  const tx = s.x0 + (s.tx - s.x0) * tail
  const ty = s.y0 + (s.ty - s.y0) * tail
  const fade = 1 - p

  // Layered strokes = the lite-tier "glow sleeve".
  c.beginPath()
  c.moveTo(tx, ty)
  c.lineTo(hx, hy)
  c.strokeStyle = `rgba(${CYAN}, ${0.22 * fade})`
  c.lineWidth = 5
  c.stroke()
  c.strokeStyle = `rgba(${CYAN}, ${0.55 * fade})`
  c.lineWidth = 2.5
  c.stroke()
  c.strokeStyle = WHITE_HOT
  c.globalAlpha = fade
  c.lineWidth = 1
  c.stroke()
  c.globalAlpha = 1

  // Arrival flash at the click point.
  if (head >= 1) {
    const q = Math.max((p - 0.8) / 0.2, 0)
    c.beginPath()
    c.arc(s.tx, s.ty, 2 + 7 * q, 0, Math.PI * 2)
    c.strokeStyle = `rgba(${CYAN}, ${0.7 * (1 - q)})`
    c.lineWidth = 1
    c.stroke()
  }
}

function frame(t: number): void {
  if (!ctx) return
  const now = t / 1000
  const dt = Math.min(now - lastT, 0.05) // clamp hidden-tab resume gaps
  lastT = now

  ctx.clearRect(0, 0, cssW, cssH)
  let anyAlive = false
  for (let i = 0; i < streaks.length; i++) {
    const s = streaks[i]!
    if (!s.active) continue
    s.t += dt
    if (s.t >= STREAK_S) {
      s.active = false
      continue
    }
    anyAlive = true
    drawStreak(ctx, s)
  }

  if (anyAlive) {
    rafId = requestAnimationFrame(frame)
  } else {
    // Pool drained: stop completely (zero idle cost) and leave a clean canvas.
    rafId = 0
    ctx.clearRect(0, 0, cssW, cssH)
  }
}

function start(): void {
  if (rafId !== 0 || !ctx) return
  lastT = performance.now() / 1000
  rafId = requestAnimationFrame(frame)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return
  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
})

onBeforeUnmount(() => {
  if (rafId !== 0) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
  resizeObserver?.disconnect()
  resizeObserver = null
  ctx = null
})
</script>

<template>
  <canvas ref="canvasRef" class="laser-lite" />
</template>

<style lang="scss" scoped>
.laser-lite {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
