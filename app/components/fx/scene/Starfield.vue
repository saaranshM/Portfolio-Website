<script setup lang="ts">
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Points,
  PointsMaterial,
} from 'three'
import { useLoop, useTresContext } from '@tresjs/core'
import {
  CAM_SCROLL_MAX_WU,
  HALF_FOV_TAN,
  MID_REF_DEPTH,
  sceneState,
  worldUnitsPerCssPixel,
} from './useSceneState'

/**
 * Starfield — three THREE.Points layers (3 draw calls total), spec §2.1:
 *
 *   FAR   ~2500 stars  z −600..−400  ~1px   ice, 40–70% bright  parallax ×0.02
 *   MID    ~800 stars  z −350..−150  ~2px   30% cyan-tinted     parallax ×0.06
 *   DUST    ~90 discs  z −130..−70   3–5px  15% opacity         parallax ×0.14
 *                                           +x drift ~2px/s; hidden below fold
 *
 * Positions come from a constant-seed mulberry32 PRNG — the same sky every
 * visit. Points use a runtime canvas radial-gradient sprite: round stars with
 * a soft pre-glowed falloff, no shaders and no postprocessing (see the bloom
 * decision in SceneRoot). Per-star "alpha" rides vertex colors — under
 * additive blending, scaling RGB is visually equivalent to scaling alpha.
 *
 * Twinkle: deliberately skipped. Uniform material-opacity twinkle is wrong
 * (whole layer pulses) and per-star twinkle needs a custom shader attribute;
 * parallax depth + near-dust drift carry the motion instead.
 *
 * The loop callback only mutates plain objects and preallocated buffers —
 * zero per-frame allocations, no Vue reactivity.
 */

const { isCoarsePointer } = useEffectsTier()

// --- deterministic generation ------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Constant seed: the same sky every visit, on every viewport.
const rand = mulberry32(0x57a2f1e1)

/** Stars are generated to fill the frustum up to this aspect ratio (21:9 ≈
 *  2.33) at each layer's far edge, so ultrawide viewports stay covered. */
const ASPECT_MAX = 2.4
const POINTER_LERP_RATE = 6 // 1/s — exponential smoothing constant
const DUST_DRIFT_PX_S = 2 // screen-space +x drift at the dust reference depth

interface LayerSpec {
  count: number
  zNear: number // less negative
  zFar: number // more negative
  /** World point size; on screen ≈ size × viewportH / (2·|z|) CSS px. */
  size: number
  /** Pointer parallax multiplier (spec §2.1). */
  parallax: number
  /** Depth used to convert screen-px parallax/drift into world units. */
  refDepth: number
}

const FAR: LayerSpec = { count: 2500, zNear: -400, zFar: -600, size: 1.0, parallax: 0.02, refDepth: 500 }
const MID: LayerSpec = { count: 800, zNear: -150, zFar: -350, size: 1.2, parallax: 0.06, refDepth: MID_REF_DEPTH }
const DUST: LayerSpec = { count: 90, zNear: -70, zFar: -130, size: 0.8, parallax: 0.14, refDepth: 100 }

const ICE = new Color('#cfe9ff')
const CYAN_TINT = new Color('#9fe8f5')

function makeDiscTexture(px: number, stops: ReadonlyArray<[number, number]>): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = px
  canvas.height = px
  const ctx = canvas.getContext('2d')!
  const half = px / 2
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half)
  for (const [offset, alpha] of stops) grad.addColorStop(offset, `rgba(255,255,255,${alpha})`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, px, px)
  return new CanvasTexture(canvas)
}

// Pre-glowed star: hot core with a soft halo baked into the sprite — this IS
// the "bloom" of the full tier (see SceneRoot's postprocessing decision).
const starTexture = makeDiscTexture(32, [[0, 1], [0.3, 0.9], [0.6, 0.25], [1, 0]])
// Dust: no core, just a soft disc.
const dustTexture = makeDiscTexture(64, [[0, 0.85], [0.5, 0.32], [1, 0]])

interface Layer {
  spec: LayerSpec
  points: Points
  ox: number // eased pointer-parallax offset (world units)
  oy: number
}

function buildGeometry(spec: LayerSpec, color: ((r: () => number) => Color) | null): BufferGeometry {
  const halfH = Math.abs(spec.zFar) * HALF_FOV_TAN * 1.1 + CAM_SCROLL_MAX_WU
  const halfW = Math.abs(spec.zFar) * HALF_FOV_TAN * ASPECT_MAX * 1.05
  const positions = new Float32Array(spec.count * 3)
  const colors = color ? new Float32Array(spec.count * 3) : null
  for (let i = 0; i < spec.count; i++) {
    positions[i * 3] = (rand() * 2 - 1) * halfW
    positions[i * 3 + 1] = (rand() * 2 - 1) * halfH
    positions[i * 3 + 2] = spec.zNear + rand() * (spec.zFar - spec.zNear)
    if (colors) {
      const c = color!(rand)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  if (colors) geometry.setAttribute('color', new BufferAttribute(colors, 3))
  return geometry
}

const scratchColor = new Color()

function makeLayer(
  spec: LayerSpec,
  material: PointsMaterial,
  color: ((r: () => number) => Color) | null,
): Layer {
  const points = new Points(buildGeometry(spec, color), material)
  // Layers always cover the screen; skip bounding-sphere culling (offsets
  // move the whole layer, which would otherwise need per-frame recomputes).
  points.frustumCulled = false
  return { spec, points: markRaw(points), ox: 0, oy: 0 }
}

const far = makeLayer(
  FAR,
  new PointsMaterial({
    size: FAR.size,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  }),
  // 40–70% brightness ≈ 40–70% alpha under additive blending.
  (r) => scratchColor.copy(ICE).multiplyScalar(0.4 + r() * 0.3),
)

const mid = makeLayer(
  MID,
  new PointsMaterial({
    size: MID.size,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  }),
  // 30% cyan-tinted, the rest ice; a touch brighter than the far shell.
  (r) => scratchColor.copy(r() < 0.3 ? CYAN_TINT : ICE).multiplyScalar(0.5 + r() * 0.4),
)

const dust = makeLayer(
  DUST,
  new PointsMaterial({
    size: DUST.size,
    map: dustTexture,
    color: ICE,
    opacity: 0.15,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  }),
  null,
)

const layers: Layer[] = [far, mid, dust]

// Dust drift needs per-star x wrapping (a pure group offset would empty the
// band): base positions are kept, wrapped copies are written into the
// attribute in place — 90 floats/frame, no allocations.
const dustAttr = dust.points.geometry.getAttribute('position') as BufferAttribute
const dustArray = dustAttr.array as Float32Array
const dustBaseX = new Float32Array(DUST.count)
for (let i = 0; i < DUST.count; i++) dustBaseX[i] = dustArray[i * 3]!
const DUST_HALF_W = Math.abs(DUST.zFar) * HALF_FOV_TAN * ASPECT_MAX * 1.05
const DUST_SPAN = DUST_HALF_W * 2

// --- per-frame ---------------------------------------------------------------

let parallaxOn = true // mirrors !isCoarsePointer (no ref reads in the loop)
watch(isCoarsePointer, (coarse) => { parallaxOn = !coarse }, { immediate: true })

// Canvas size mirrored into plain numbers — same no-ref-reads-in-the-loop
// discipline as parallaxOn.
const { sizes } = useTresContext()
let viewportW = 1
let viewportH = 1
watch(
  [sizes.width, sizes.height],
  ([w, h]) => {
    viewportW = w || 1
    viewportH = h || 1
  },
  { immediate: true },
)

let driftPx = 0

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta }) => {
  const dt = Math.min(delta, 0.25) // clamp resume gaps
  const w = viewportW
  const h = viewportH

  // Frame-rate-independent easing toward the pointer, per-layer multipliers.
  const k = 1 - Math.exp(-dt * POINTER_LERP_RATE)
  const targetPxX = parallaxOn ? sceneState.pointer.x * (w / 2) : 0
  const targetPxY = parallaxOn ? sceneState.pointer.y * (h / 2) : 0
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]!
    const wupp = worldUnitsPerCssPixel(layer.spec.refDepth, h)
    layer.ox += (targetPxX * layer.spec.parallax * wupp - layer.ox) * k
    layer.oy += (targetPxY * layer.spec.parallax * wupp - layer.oy) * k
    layer.points.position.x = layer.ox
    layer.points.position.y = layer.oy
  }

  // Below the fold the near dust is hidden entirely (suppression matrix).
  dust.points.visible = !sceneState.thinned
  if (dust.points.visible) {
    driftPx += DUST_DRIFT_PX_S * dt
    const driftWu = (driftPx * worldUnitsPerCssPixel(DUST.refDepth, h)) % DUST_SPAN
    for (let i = 0; i < DUST.count; i++) {
      let x = dustBaseX[i]! + driftWu
      if (x > DUST_HALF_W) x -= DUST_SPAN
      dustArray[i * 3] = x
    }
    dustAttr.needsUpdate = true
  }
})

// Tres disposes the scene graph on canvas unmount, but objects mounted via
// <primitive> are exempt from its automatic disposal — release them here.
// (three's dispose() is idempotent, double-dispose is safe.)
onUnmounted(() => {
  for (const layer of layers) {
    layer.points.geometry.dispose()
    ;(layer.points.material as PointsMaterial).dispose()
  }
  starTexture.dispose()
  dustTexture.dispose()
})
</script>

<template>
  <primitive :object="far.points" />
  <primitive :object="mid.points" />
  <primitive :object="dust.points" />
</template>
