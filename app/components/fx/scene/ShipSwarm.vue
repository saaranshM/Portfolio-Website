<script setup lang="ts">
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  RingGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three'
import { useLoop, useTresContext } from '@tresjs/core'
import { fireVolley, fxBus, makeShipContact, resetFxBus, resetVolleys } from './fxBus'
import { makeDiscTexture } from './textures'
import {
  HALF_FOV_TAN,
  cssRectToWorldBounds,
  sceneState,
} from './useSceneState'
import type { CssRect } from './useSceneState'

/**
 * ShipSwarm — the patrol layer (spec §5/§6): 3 cyan "darts" + 1 magenta
 * "raider" on closed CatmullRom loops that arc around the content exclusion
 * zone, with cursor-flee steering, near-miss shield shimmers, ambient
 * volleys, the contact-section flyby, and the easter-egg dogfight.
 *
 * House rules (same as Starfield): procedural BufferGeometry (no glTF, no
 * lights — shading is baked into vertex colors), markRaw'd primitives, one
 * seeded mulberry32 stream, ZERO Vue reactivity and zero allocations in the
 * loop (preallocated scratch vectors; curves/pools built once), manual
 * disposal of everything on unmount.
 *
 * Loop ordering: each useLoop() gets its OWN priority hook, so cross-component
 * order comes from REGISTRATION order — SceneRoot's template mounts ShipSwarm
 * before LaserSystem, so steering runs and publishes ship positions/screen
 * projections into fxBus.ships BEFORE LaserSystem consumes them for targeting
 * and near-miss checks.
 *
 * Suppression matrix:
 * - coarse pointer  → 2 ships total, no cursor-dodge (flee skipped)
 * - below the fold  → ships 2..3 hidden, survivors eased ~120 wu deeper,
 *                     ambient volleys suppressed
 * - easter egg (8s) → +6 extra ships warp-streak in, rapid volleys,
 *                     dreadnought silhouette at z −500, magenta EMP ring at
 *                     t≈7s clears the extras
 */

const { isCoarsePointer } = useEffectsTier()

// --- spec §6 steering constants ------------------------------------------------
const K_FOLLOW = 1.2 // accel per world-unit of offset toward the curve point
const K_FLEE = 6 // flee accel gain inside the cursor radius
const FLEE_RADIUS_PX = 120 // cursor flee radius, CSS px, screen space
const MAX_ACCEL = 40 // world units / s²
const DAMP = 0.92 // velocity damp per 60fps frame (framerate-normalized)
const BURST_MULT = 1.5 // startled burst = 1.5× maxAccel…
const BURST_S = 0.3 // …for 0.3s on radius ENTRY (and on near-miss)
const EASE_BACK_S = 1.2 // follow gain ramps back to full over ~1.2s
const BANK_MAX = (35 * Math.PI) / 180 // banking roll clamp ±35°
const BANK_K = 0.04 // rad of roll per world-unit/s² of lateral accel
const SHIMMER_S = 0.2 // shield shimmer duration

// --- patrol / combat tuning -----------------------------------------------------
const SHIP_COUNT = 4 // 3 darts + 1 raider (hard cap, spec §6)
const EXTRA_COUNT = 6 // easter-egg reinforcements
const PATROL_Z_NEAR = -80
const PATROL_Z_FAR = -200
const LAP_MIN_S = 20
const LAP_MAX_S = 35
const VOLLEY_MIN_S = 8 // ambient volley cadence 8–14s
const VOLLEY_SPAN_S = 6
const EGG_VOLLEY_MIN_S = 0.5 // rapid cadence during the egg
const EGG_VOLLEY_SPAN_S = 0.7
const BELOW_FOLD_Z_PUSH = -120 // survivors steer this much deeper below fold
const WARP_S = 0.35 // extra-ship stretch-in duration
const EGG_S = 8
const EMP_AT_S = 7
const EMP_S = 0.8
const FLYBY_S = 7 // scripted contact crossing duration
const FLYBY_Z = -300

// --- palette ---------------------------------------------------------------------
const HULL = new Color('#101935')
const CYAN = new Color('#00f0ff')
const MAGENTA = new Color('#ff2d78')
const DREAD_HULL = new Color('#0a1124')

const rand = mulberry32(0x5417e770)

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

// ==============================================================================
// Procedural geometry — wedge fuselage (8-point rings), two swept fin pairs,
// tail fin, emissive exhaust quad. ~50 flat-shaded tris per ship (inside the
// ~80-tri budget). No lights in the scene: a fixed lambert term against a
// baked light direction + a cyan/magenta accent tint on upward facets are
// written straight into vertex colors; MeshBasicMaterial renders them as-is.
// ==============================================================================

const LIGHT_DIR = new Vector3(0.35, 0.8, 0.45).normalize()

interface GeoAcc {
  pos: number[]
  col: number[]
}

/** Push one flat-shaded triangle (a,b,c are [x,y,z]); `emissive` skips
 *  shading and writes the accent at full brightness (the exhaust quad). */
function addTri(
  acc: GeoAcc,
  a: readonly number[],
  b: readonly number[],
  c: readonly number[],
  base: Color,
  accent: Color,
  accentAmt: number,
  emissive = false,
): void {
  const ux = b[0]! - a[0]!
  const uy = b[1]! - a[1]!
  const uz = b[2]! - a[2]!
  const vx = c[0]! - a[0]!
  const vy = c[1]! - a[1]!
  const vz = c[2]! - a[2]!
  let nx = uy * vz - uz * vy
  let ny = uz * vx - ux * vz
  let nz = ux * vy - uy * vx
  const nl = Math.hypot(nx, ny, nz) || 1
  nx /= nl
  ny /= nl
  nz /= nl

  let r: number
  let g: number
  let bl: number
  if (emissive) {
    r = accent.r
    g = accent.g
    bl = accent.b
  } else {
    const lambert = Math.max(nx * LIGHT_DIR.x + ny * LIGHT_DIR.y + nz * LIGHT_DIR.z, 0)
    const shade = 0.3 + 0.7 * lambert
    const mix = clamp(accentAmt * (0.35 + 0.65 * Math.max(ny, 0)), 0, 1)
    r = (base.r * (1 - mix) + accent.r * mix) * shade
    g = (base.g * (1 - mix) + accent.g * mix) * shade
    bl = (base.b * (1 - mix) + accent.b * mix) * shade
  }
  acc.pos.push(a[0]!, a[1]!, a[2]!, b[0]!, b[1]!, b[2]!, c[0]!, c[1]!, c[2]!)
  for (let i = 0; i < 3; i++) acc.col.push(r, g, bl)
}

function ringPoints(z: number, rx: number, ry: number, n: number): number[][] {
  const pts: number[][] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    pts.push([Math.cos(a) * rx, Math.sin(a) * ry, z])
  }
  return pts
}

function accToGeometry(acc: GeoAcc): BufferGeometry {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(acc.pos), 3))
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(acc.col), 3))
  return geometry
}

/** Dart/raider hull — nose along local +Z, exhaust at the tail. */
function buildShipGeometry(accent: Color): BufferGeometry {
  const acc: GeoAcc = { pos: [], col: [] }
  const N = 8
  const nose = [0, 0, 3.2]
  const tail = [0, 0.05, -2.6]
  const ringA = ringPoints(0.6, 0.85, 0.45, N)
  const ringB = ringPoints(-1.8, 0.55, 0.3, N)

  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N
    // nose cone fan + mid band + tail fan
    addTri(acc, nose, ringA[i]!, ringA[j]!, HULL, accent, 0.22)
    addTri(acc, ringA[i]!, ringB[i]!, ringB[j]!, HULL, accent, 0.14)
    addTri(acc, ringA[i]!, ringB[j]!, ringA[j]!, HULL, accent, 0.14)
    addTri(acc, ringB[i]!, tail, ringB[j]!, HULL, accent, 0.1)
  }

  // Swept main fins (double-sided via material), one quad each.
  for (const s of [1, -1]) {
    const rootF = [s * 0.6, 0, 0.4]
    const rootB = [s * 0.55, 0.05, -2.1]
    const tipB = [s * 2.7, 0.18, -3.0]
    const tipF = [s * 2.2, 0.14, -2.0]
    addTri(acc, rootF, rootB, tipB, HULL, accent, 0.45)
    addTri(acc, rootF, tipB, tipF, HULL, accent, 0.45)
    // Smaller ventral fins.
    const vRootF = [s * 0.45, -0.12, -0.6]
    const vRootB = [s * 0.4, -0.15, -2.2]
    const vTip = [s * 1.4, -0.5, -2.7]
    addTri(acc, vRootF, vRootB, vTip, HULL, accent, 0.3)
  }

  // Dorsal tail fin.
  addTri(acc, [0, 0.4, -1.0], [0, 1.15, -2.8], [0, 0.35, -2.4], HULL, accent, 0.5)
  // Canopy bump.
  addTri(acc, [0, 0.65, 0.9], [-0.3, 0.4, 1.6], [0.3, 0.4, 1.6], HULL, accent, 0.6)
  addTri(acc, [0, 0.65, 0.9], [0.3, 0.4, 0.2], [-0.3, 0.4, 0.2], HULL, accent, 0.6)
  // Emissive exhaust quad at the tail (the sprite glow sits over it).
  const e = 0.42
  addTri(acc, [-e, e * 0.6, -2.55], [-e, -e * 0.6, -2.55], [e, -e * 0.6, -2.55], HULL, accent, 0, true)
  addTri(acc, [-e, e * 0.6, -2.55], [e, -e * 0.6, -2.55], [e, e * 0.6, -2.55], HULL, accent, 0, true)

  return accToGeometry(acc)
}

/** Dreadnought silhouette — a long faceted slab with a conning tower; lives
 *  at z −500 so detail is wasted, darkness is the feature. */
function buildDreadnoughtGeometry(): BufferGeometry {
  const acc: GeoAcc = { pos: [], col: [] }
  const N = 6
  const nose = [0, 0, 46]
  const tail = [0, 1, -46]
  const ringA = ringPoints(20, 7, 3.4, N)
  const ringB = ringPoints(-30, 9, 4.2, N)
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N
    addTri(acc, nose, ringA[i]!, ringA[j]!, DREAD_HULL, MAGENTA, 0.05)
    addTri(acc, ringA[i]!, ringB[i]!, ringB[j]!, DREAD_HULL, MAGENTA, 0.04)
    addTri(acc, ringA[i]!, ringB[j]!, ringA[j]!, DREAD_HULL, MAGENTA, 0.04)
    addTri(acc, ringB[i]!, tail, ringB[j]!, DREAD_HULL, MAGENTA, 0.03)
  }
  // Conning tower.
  addTri(acc, [0, 4, 2], [-2.4, 9, -16], [2.4, 9, -16], DREAD_HULL, MAGENTA, 0.08)
  addTri(acc, [0, 4, 2], [2.4, 9, -16], [0, 4, -26], DREAD_HULL, MAGENTA, 0.06)
  addTri(acc, [0, 4, 2], [0, 4, -26], [-2.4, 9, -16], DREAD_HULL, MAGENTA, 0.06)
  return accToGeometry(acc)
}

// ==============================================================================
// Patrol curve generation — control points biased toward screen edges + the
// upper third, REJECTED while inside the projected content exclusion zone.
// ==============================================================================

/** Central content column in CSS px: the hero column unioned with the
 *  centered `.content-section` column, + margin (layout dims live in
 *  app/utils/constants.ts next to the breakpoints). Vertically the top ~28%
 *  of the viewport is the open sky corridor the upper-third bias aims for. */
function contentExclusionRect(w: number, h: number): CssRect {
  const left = Math.min(HERO_LEFT_PX, Math.max((w - SECTION_WIDTH_PX) / 2, 0)) - EXCLUSION_MARGIN_PX
  const right =
    Math.max(HERO_LEFT_PX + HERO_WIDTH_PX, Math.min((w + SECTION_WIDTH_PX) / 2, w)) +
    EXCLUSION_MARGIN_PX
  const top = h * 0.28
  return { left, top, width: right - left, height: h - top }
}

/** Extra world-unit padding around the exclusion bounds: damped steering lags
 *  the curve point and cuts corners inward by roughly this much. */
const EXCLUSION_PAD_WU = 12

function makePatrolCurve(
  w: number,
  h: number,
  fast: boolean,
): { curve: CatmullRomCurve3; period: number } {
  const aspect = w / Math.max(h, 1)
  const ex = contentExclusionRect(w, h)
  const n = 5 + Math.floor(rand() * 3) // 5–7 control points
  const cx = (rand() * 2 - 1) * 18
  const cy = 8 + rand() * 22 // loop center biased into the upper third
  const points: Vector3[] = []

  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.5
    const z = PATROL_Z_NEAR + rand() * (PATROL_Z_FAR - PATROL_Z_NEAR) // −80..−200
    const az = Math.abs(z)
    const hw = az * HALF_FOV_TAN * aspect
    const hh = az * HALF_FOV_TAN
    const bounds = cssRectToWorldBounds(ex, az, w, h)
    let x = 0
    let y = 0
    let outside = false
    for (let attempt = 0; attempt < 6 && !outside; attempt++) {
      const r = 0.55 + 0.4 * rand() + attempt * 0.12
      x = cx + Math.cos(ang) * hw * 0.8 * r
      y = cy + Math.sin(ang) * hh * 0.85 * r
      outside =
        x < bounds.minX - EXCLUSION_PAD_WU ||
        x > bounds.maxX + EXCLUSION_PAD_WU ||
        y < bounds.minY - EXCLUSION_PAD_WU ||
        y > bounds.maxY + EXCLUSION_PAD_WU
    }
    if (!outside) {
      // Radius growth couldn't escape (lower arc on narrow viewports): push
      // the point out past the nearest vertical edge of the exclusion zone.
      x =
        Math.cos(ang) >= 0
          ? bounds.maxX + EXCLUSION_PAD_WU + rand() * 12
          : bounds.minX - EXCLUSION_PAD_WU - rand() * 12
      const xClamped = clamp(x, -hw * 1.3, hw * 1.3) // a little offscreen is fine
      if (xClamped !== x && xClamped > bounds.minX && xClamped < bounds.maxX) {
        // Exclusion column spans the whole frustum (narrow viewports) — lift
        // the point into the sky corridor above the content instead.
        y = bounds.maxY + EXCLUSION_PAD_WU + rand() * hh * 0.3
      }
      x = xClamped
    }
    points.push(new Vector3(x, y, z))
  }

  const curve = new CatmullRomCurve3(points, true, 'catmullrom', 0.5)
  // Period from arc length at a believable cruise speed, clamped to the spec
  // lap band (20–35s; egg extras run hotter laps). EVERY curve passes through
  // here, so this getLength() also warms the arc-length cache that the
  // getPointAt() sampling in the loop depends on (uniform-speed traversal).
  const speed = fast ? 9 + rand() * 4 : 5.5 + rand() * 2.5
  const period = clamp(
    curve.getLength() / speed,
    fast ? 12 : LAP_MIN_S,
    fast ? 20 : LAP_MAX_S,
  )
  return { curve, period }
}

// ==============================================================================
// Construction — shared geometries/materials, per-ship groups
// ==============================================================================

const glowTexture = makeDiscTexture(64, [[0, 1], [0.25, 0.8], [0.6, 0.22], [1, 0]])

const hullMaterial = new MeshBasicMaterial({ vertexColors: true, side: DoubleSide })
const dartGeometry = buildShipGeometry(CYAN)
const raiderGeometry = buildShipGeometry(MAGENTA)
const dreadGeometry = buildDreadnoughtGeometry()

const exhaustCyan = new SpriteMaterial({
  map: glowTexture,
  color: CYAN,
  transparent: true,
  opacity: 0.85,
  blending: AdditiveBlending,
  depthWrite: false,
})
const exhaustMagenta = exhaustCyan.clone()
exhaustMagenta.color = MAGENTA

interface Ship {
  group: Group
  exhaust: Sprite
  shield: Sprite
  /** Per-ship material — the only way to fade shimmer opacity per ship. */
  shieldMaterial: SpriteMaterial
  raider: boolean
  extra: boolean
  scale: number
  curve: CatmullRomCurve3 | null
  period: number
  pathT: number
  vel: Vector3
  fwd: Vector3
  roll: number
  burstLeft: number
  burstDir: Vector3
  easeBackLeft: number
  inFleeRadius: boolean
  shimmerLeft: number
  warpLeft: number
  zOff: number // eased below-fold depth push
  shown: boolean // current visibility decision (mirrors group.visible)
  contact: ReturnType<typeof makeShipContact>
}

function makeShip(raider: boolean, extra: boolean): Ship {
  const group = new Group()
  const hull = new Mesh(raider ? raiderGeometry : dartGeometry, hullMaterial)
  const scale = raider ? 1.3 : 1
  group.scale.setScalar(scale)

  const exhaust = new Sprite(raider ? exhaustMagenta : exhaustCyan)
  exhaust.position.set(0, 0, -2.9)
  exhaust.scale.set(1.2, 1.2, 1)

  const shieldMaterial = new SpriteMaterial({
    map: glowTexture,
    color: CYAN,
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  })
  const shield = new Sprite(shieldMaterial)
  shield.visible = false

  group.add(hull, exhaust, shield)
  group.visible = false

  return {
    group: markRaw(group),
    exhaust: markRaw(exhaust),
    shield: markRaw(shield),
    shieldMaterial: markRaw(shieldMaterial),
    raider,
    extra,
    scale,
    curve: null,
    period: 25,
    pathT: rand(),
    vel: new Vector3(),
    fwd: new Vector3(0, 0, 1),
    roll: 0,
    burstLeft: 0,
    burstDir: new Vector3(0, 1, 0),
    easeBackLeft: 0,
    inFleeRadius: false,
    shimmerLeft: 0,
    warpLeft: 0,
    zOff: 0,
    shown: false,
    contact: makeShipContact(),
  }
}

// Ships 0..2 darts, 3 = the raider; extras 4..9 (4 darts + 2 raiders).
const ships: Ship[] = []
for (let i = 0; i < SHIP_COUNT; i++) ships.push(makeShip(i === 3, false))
for (let i = 0; i < EXTRA_COUNT; i++) ships.push(makeShip(i >= 4, true))

const dreadnought = markRaw(new Mesh(dreadGeometry, hullMaterial))
dreadnought.visible = false

const empMaterial = new MeshBasicMaterial({
  color: MAGENTA,
  transparent: true,
  opacity: 0,
  blending: AdditiveBlending,
  side: DoubleSide,
  depthWrite: false,
})
const empRing = markRaw(new Mesh(new RingGeometry(0.96, 1, 48), empMaterial))
empRing.visible = false

const root = markRaw(new Group())
for (const ship of ships) root.add(ship.group)
root.add(dreadnought, empRing)
// Everything here moves/scales manually — skip bounding-sphere culling.
root.traverse((obj) => {
  obj.frustumCulled = false
})

// ==============================================================================
// Per-frame state (plain mirrors, scratch objects — no reactivity, no allocs)
// ==============================================================================

let dodgeOn = true // mirrors !isCoarsePointer (cursor-dodge OFF on coarse)
let coarse = false
watch(
  isCoarsePointer,
  (c) => {
    coarse = c
    dodgeOn = !c
  },
  { immediate: true },
)

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

const WORLD_UP = new Vector3(0, 1, 0)
const Z_AXIS = new Vector3(0, 0, 1)
const V_CURVE = new Vector3()
const V_ACCEL = new Vector3()
const V_FLEE = new Vector3()
const V_TMP = new Vector3()
const V_EYE = new Vector3()
const V_SIDE = new Vector3()
const M_LOOK = new Matrix4()
const Q_TARGET = new Quaternion()
const Q_ROLL = new Quaternion()

let inited = false
let elapsed = 0

// Ambient combat scheduling.
let volleyIn = VOLLEY_MIN_S + rand() * VOLLEY_SPAN_S
let eggVolleyIn = 0

// Easter egg runtime.
let eggWas = false
let eggTime = 0
let empFired = false
let empT = 0
let eggCamY = 0

// Contact flyby (once per page load).
let flybyDone = false
let flybyActive = false
let flybyT = 0
let flybyY = 0
let flybySpeed = 0

function init(): void {
  inited = true
  for (const ship of ships) {
    const { curve, period } = makePatrolCurve(viewportW, viewportH, ship.extra)
    ship.curve = curve
    ship.period = period
    curve.getPointAt(ship.pathT, V_CURVE)
    ship.group.position.copy(V_CURVE)
  }
  // LaserSystem reads positions/projections from these — install once.
  fxBus.ships.length = 0
  for (const ship of ships) fxBus.ships.push(ship.contact)
}

// --- resize → patrol rebuild (debounced) -----------------------------------------
// Patrol curves bake the viewport's exclusion-zone projection in at build
// time, so a real resize needs fresh loops. Debounced ~300ms past the last
// size change; each ship KEEPS its pathT and the follow steering eases it
// onto the new curve. Deferred while the egg is live (extras are mid-
// dogfight) and flushed when it ends.
const REBUILD_DEBOUNCE_MS = 300
let rebuildTimer: ReturnType<typeof setTimeout> | undefined
let rebuildPending = false

function rebuildPatrols(): void {
  rebuildPending = false
  for (const ship of ships) {
    const { curve, period } = makePatrolCurve(viewportW, viewportH, ship.extra)
    ship.curve = curve
    ship.period = period
  }
}

watch([sizes.width, sizes.height], () => {
  if (!inited) return // init() builds against the live viewport anyway
  clearTimeout(rebuildTimer)
  rebuildTimer = setTimeout(() => {
    if (sceneState.fx.eggActive) rebuildPending = true // defer to endEgg()
    else rebuildPatrols()
  }, REBUILD_DEBOUNCE_MS)
})

/** Visibility policy for one frame. Below the fold only ships 0..1 remain;
 *  coarse pointers also run 2 ships total (spec §4). Extras only exist while
 *  the egg is live (and before the EMP clears them). */
function decideShown(ship: Ship, index: number, egg: boolean): boolean {
  if (ship.extra) return egg && !empFired
  if (index >= 2 && (coarse || sceneState.belowFold)) return false
  return true
}

function startEgg(): void {
  eggTime = 0
  empFired = false
  empT = 0
  eggCamY = sceneState.camY
  eggVolleyIn = 0.4
  for (const ship of ships) {
    if (!ship.extra || !ship.curve) continue
    ship.pathT = rand()
    ship.curve.getPointAt(ship.pathT, V_CURVE)
    ship.group.position.copy(V_CURVE)
    ship.warpLeft = WARP_S
    ship.vel.set(0, 0, 0)
    // Enter facing along the loop (cheap tangent: a point slightly ahead).
    ship.curve.getPointAt((ship.pathT + 0.02) % 1, V_TMP)
    V_TMP.sub(V_CURVE)
    if (V_TMP.lengthSq() > 1e-6) ship.fwd.copy(V_TMP).normalize()
    ship.vel.copy(ship.fwd).multiplyScalar(30)
    // Face along the entry vector immediately (steer() skips orientation
    // while the warp stretch plays).
    V_EYE.copy(ship.group.position).add(ship.fwd)
    M_LOOK.lookAt(V_EYE, ship.group.position, WORLD_UP)
    ship.group.quaternion.setFromRotationMatrix(M_LOOK)
    ship.roll = 0
  }
  dreadnought.visible = true
  dreadnought.position.set(0, eggCamY + 30, -500)
}

function endEgg(): void {
  empFired = true // ensures decideShown hides extras even on early teardown
  dreadnought.visible = false
  empRing.visible = false
  empMaterial.opacity = 0
  for (const ship of ships) {
    if (ship.extra) {
      ship.group.visible = false
      ship.shown = false
      ship.contact.active = false
      ship.contact.nearMiss = false
    }
  }
  // Queued volleys from now-gone shooters must not materialize from nothing.
  resetVolleys()
  // Flush a resize rebuild that arrived mid-egg.
  if (rebuildPending) rebuildPatrols()
}

function updateEgg(dt: number): void {
  eggTime += dt
  // Dreadnought: one slow far-depth crossing across the whole egg window.
  const aspect = viewportW / viewportH
  const span = 500 * HALF_FOV_TAN * aspect + 80
  const p = clamp(eggTime / EGG_S, 0, 1)
  dreadnought.position.x = -span + 2 * span * p

  if (!empFired && eggTime >= EMP_AT_S) {
    empFired = true
    empT = 0
    empRing.visible = true
    empRing.position.set(0, sceneState.camY, -240)
    // EMP "clears all extras" — they cut out on the flash.
    for (const ship of ships) {
      if (ship.extra) {
        ship.group.visible = false
        ship.shown = false
        ship.contact.active = false
        ship.contact.nearMiss = false
      }
    }
    // …and so do their queued-but-unspawned volleys.
    resetVolleys()
  }
  if (empFired && empRing.visible) {
    empT += dt
    const q = clamp(empT / EMP_S, 0, 1)
    const ease = 1 - (1 - q) ** 3
    const r = 30 + 380 * ease
    empRing.scale.set(r, r, 1)
    empMaterial.opacity = 0.85 * (1 - q)
    if (q >= 1) empRing.visible = false
  }
}

/** Pick two distinct active ships and queue a 2-bolt volley between them. */
function fireRandomVolley(): void {
  let count = 0
  for (const ship of ships) if (ship.contact.active) count++
  if (count < 2) return
  let si = Math.floor(rand() * count)
  let ti = Math.floor(rand() * (count - 1))
  if (ti >= si) ti++
  let shooter: Ship | null = null
  let target: Ship | null = null
  let k = 0
  for (const ship of ships) {
    if (!ship.contact.active) continue
    if (k === si) shooter = ship
    if (k === ti) target = ship
    k++
  }
  if (!shooter || !target) return
  const sp = shooter.group.position
  const tp = target.group.position
  fireVolley(
    sp.x + shooter.fwd.x * 3.5,
    sp.y + shooter.fwd.y * 3.5,
    sp.z + shooter.fwd.z * 3.5,
    // Lead the target a beat ahead of its current velocity.
    tp.x + target.vel.x * 0.4,
    tp.y + target.vel.y * 0.4,
    tp.z + target.vel.z * 0.4,
    shooter.raider ? 'magenta' : 'cyan',
  )
}

function steer(ship: Ship, dt: number): void {
  const pos = ship.group.position
  const c = ship.contact
  const aspect = viewportW / viewportH
  const camY = sceneState.camY

  // Warp-in stretch (egg extras): not steerable/targetable yet.
  if (ship.warpLeft > 0) {
    ship.warpLeft -= dt
    const q = clamp(1 - ship.warpLeft / WARP_S, 0, 1)
    ship.group.scale.set(ship.scale, ship.scale, ship.scale * (1 + 9 * (1 - q)))
    pos.addScaledVector(ship.vel, dt)
    ship.exhaust.visible = false
    c.active = false
    c.nearMiss = false // inactive contacts must never carry a stale flag
    return
  }
  ship.group.scale.setScalar(ship.scale)
  ship.exhaust.visible = true

  // --- follow the patrol spline -------------------------------------------------
  ship.pathT = (ship.pathT + dt / ship.period) % 1
  ship.curve!.getPointAt(ship.pathT, V_CURVE)
  // Below the fold the survivors ease ~120 wu deeper (far-depth presence).
  const zTarget = sceneState.belowFold && !ship.extra ? BELOW_FOLD_Z_PUSH : 0
  ship.zOff += (zTarget - ship.zOff) * (1 - Math.exp(-dt * 2))

  const followGain = K_FOLLOW * (1 - 0.75 * (ship.easeBackLeft / EASE_BACK_S))
  V_ACCEL.set(
    (V_CURVE.x - pos.x) * followGain,
    (V_CURVE.y - pos.y) * followGain,
    (V_CURVE.z + ship.zOff - pos.z) * followGain,
  )

  // --- screen projection (shared by flee + LaserSystem near-miss) ---------------
  const az = Math.max(-pos.z, 1)
  const cssX = ((pos.x / (az * HALF_FOV_TAN * aspect) + 1) / 2) * viewportW
  const cssY = ((1 - (pos.y - camY) / (az * HALF_FOV_TAN)) / 2) * viewportH

  // --- cursor flee (fine pointers only) ------------------------------------------
  let fleeing = false
  if (dodgeOn) {
    const px = ((sceneState.pointer.x + 1) / 2) * viewportW
    const py = ((1 - sceneState.pointer.y) / 2) * viewportH
    const d = Math.hypot(cssX - px, cssY - py)
    if (d < FLEE_RADIUS_PX) {
      fleeing = true
      // Cursor unprojected to the ship's depth — flee straight away from it.
      const cwx = sceneState.pointer.x * HALF_FOV_TAN * aspect * az
      const cwy = camY + sceneState.pointer.y * HALF_FOV_TAN * az
      V_FLEE.set(pos.x - cwx, pos.y - cwy, 0)
      const fl = V_FLEE.length()
      if (fl > 1e-4) V_FLEE.multiplyScalar(1 / fl)
      else V_FLEE.set(0, 1, 0)
      if (!ship.inFleeRadius) {
        // Startled burst on radius ENTRY: 1.5× maxAccel for 0.3s.
        ship.burstLeft = BURST_S
        ship.burstDir.copy(V_FLEE)
      }
      V_ACCEL.addScaledVector(V_FLEE, K_FLEE * (1 - d / FLEE_RADIUS_PX))
      ship.easeBackLeft = EASE_BACK_S
    }
  }
  ship.inFleeRadius = fleeing

  // --- near-miss reaction (flag raised by LaserSystem last frame) ----------------
  if (c.nearMiss) {
    c.nearMiss = false
    ship.shimmerLeft = SHIMMER_S
    ship.burstLeft = BURST_S
    ship.easeBackLeft = EASE_BACK_S
    V_TMP.set(pos.x - c.threatX, pos.y - c.threatY, pos.z - c.threatZ)
    if (V_TMP.lengthSq() > 1e-6) ship.burstDir.copy(V_TMP).normalize()
    else ship.burstDir.set(0, 1, 0)
  }

  // --- burst / clamp / integrate ---------------------------------------------------
  let maxA = MAX_ACCEL
  if (ship.burstLeft > 0) {
    ship.burstLeft -= dt
    maxA = MAX_ACCEL * BURST_MULT
    V_ACCEL.addScaledVector(ship.burstDir, MAX_ACCEL * BURST_MULT)
  }
  if (!fleeing && ship.burstLeft <= 0) {
    ship.easeBackLeft = Math.max(ship.easeBackLeft - dt, 0)
  }
  const aLen = V_ACCEL.length()
  if (aLen > maxA) V_ACCEL.multiplyScalar(maxA / aLen)
  ship.vel.addScaledVector(V_ACCEL, dt)
  ship.vel.multiplyScalar(Math.pow(DAMP, dt * 60)) // 0.92/frame @60fps, fps-normalized
  pos.addScaledVector(ship.vel, dt)

  orient(ship, dt)

  // --- publish to fxBus (LaserSystem runs right after us) -------------------------
  c.active = true
  c.x = pos.x
  c.y = pos.y
  c.z = pos.z
  c.cssX = cssX
  c.cssY = cssY
}

/** Orientation from velocity + banking roll (clamp(lateralAccel·k, ±35°)). */
function orient(ship: Ship, dt: number): void {
  const pos = ship.group.position
  if (ship.vel.lengthSq() > 0.4) ship.fwd.copy(ship.vel).normalize()
  V_EYE.copy(pos).add(ship.fwd)
  M_LOOK.lookAt(V_EYE, pos, WORLD_UP) // local +Z (the nose) → velocity
  V_SIDE.setFromMatrixColumn(M_LOOK, 0)
  const lateral = V_ACCEL.dot(V_SIDE)
  const rollTarget = clamp(-lateral * BANK_K, -BANK_MAX, BANK_MAX)
  ship.roll += (rollTarget - ship.roll) * (1 - Math.exp(-dt * 6))
  Q_TARGET.setFromRotationMatrix(M_LOOK)
  Q_ROLL.setFromAxisAngle(Z_AXIS, ship.roll)
  Q_TARGET.multiply(Q_ROLL)
  ship.group.quaternion.slerp(Q_TARGET, 1 - Math.exp(-dt * 10))
}

/** Scripted contact-section crossing: slow, far (z −300), screen-centered at
 *  the scroll position where the reveal fired. Steering is bypassed; the
 *  patrol resumes (snapping back to the — mostly offscreen — curve point)
 *  when the crossing completes. */
function flyby(ship: Ship, dt: number): void {
  const aspect = viewportW / viewportH
  const hw = Math.abs(FLYBY_Z) * HALF_FOV_TAN * aspect
  flybyT += dt
  const p = flybyT / FLYBY_S
  if (p >= 1) {
    flybyActive = false
    ship.curve!.getPointAt(ship.pathT, V_CURVE)
    ship.group.position.copy(V_CURVE)
    ship.vel.set(0, 0, 0)
    return
  }
  const pos = ship.group.position
  pos.set(-hw - 30 + 2 * (hw + 30) * p, flybyY, FLYBY_Z)
  ship.vel.set(flybySpeed, 0, 0)
  V_ACCEL.set(0, 0, 0)
  orient(ship, dt)
  const c = ship.contact
  c.active = true
  c.x = pos.x
  c.y = pos.y
  c.z = pos.z
  c.cssX = ((pos.x / (Math.abs(FLYBY_Z) * HALF_FOV_TAN * aspect) + 1) / 2) * viewportW
  c.cssY = ((1 - (pos.y - sceneState.camY) / (Math.abs(FLYBY_Z) * HALF_FOV_TAN)) / 2) * viewportH
}

const { onBeforeRender } = useLoop()

// Runs BEFORE LaserSystem's callback: each useLoop() registers its own hook
// with the renderer, so execution order = registration (template) order —
// SceneRoot mounts ShipSwarm first.
onBeforeRender(({ delta }) => {
  const dt = Math.min(delta, 0.25)
  if (!inited) {
    if (viewportW <= 1) return
    init() // one-time build (needs real viewport for exclusion projection)
  }
  elapsed += dt

  // --- easter egg lifecycle -------------------------------------------------------
  const egg = sceneState.fx.eggActive
  if (egg && !eggWas) startEgg()
  if (!egg && eggWas) endEgg()
  eggWas = egg
  if (egg) updateEgg(dt)

  // --- contact flyby trigger (one-shot per page load) -------------------------------
  if (sceneState.fx.contactFlyby) {
    sceneState.fx.contactFlyby = false
    if (!flybyDone) {
      flybyDone = true
      flybyActive = true
      flybyT = 0
      flybyY = sceneState.camY + Math.abs(FLYBY_Z) * HALF_FOV_TAN * 0.12
      const hw = Math.abs(FLYBY_Z) * HALF_FOV_TAN * (viewportW / viewportH)
      flybySpeed = (2 * (hw + 30)) / FLYBY_S
    }
  }

  // --- per-ship update ---------------------------------------------------------------
  for (let i = 0; i < ships.length; i++) {
    const ship = ships[i]!
    const shown = decideShown(ship, i, egg)
    if (shown !== ship.shown) {
      ship.shown = shown
      ship.group.visible = shown
      if (!shown) {
        // Hidden (fold crossing / coarse trim): clear BOTH the contact and
        // any near-miss raised last frame — it must not fire on re-show.
        ship.contact.active = false
        ship.contact.nearMiss = false
      }
    }
    if (!shown) continue

    if (flybyActive && i === 0) flyby(ship, dt)
    else steer(ship, dt)

    // Shield shimmer (~200ms): per-ship additive sprite, scale pulse + fade.
    if (ship.shimmerLeft > 0) {
      ship.shimmerLeft -= dt
      const p = 1 - Math.max(ship.shimmerLeft, 0) / SHIMMER_S
      ship.shield.visible = true
      const s = 3 + 2.5 * p
      ship.shield.scale.set(s, s, 1)
      ship.shieldMaterial.opacity = 0.5 * (1 - p)
    } else if (ship.shield.visible) {
      ship.shield.visible = false
    }

    // Exhaust flicker — scale only (materials are shared per faction).
    if (ship.exhaust.visible) {
      const e = 1.1 * (0.85 + 0.3 * (0.5 + 0.5 * Math.sin(elapsed * 27 + i * 2.4)))
      ship.exhaust.scale.set(e, e, 1)
    }
  }

  // --- ambient combat ------------------------------------------------------------------
  // Below the fold: ZERO ambient volleys (spec §5).
  if (!sceneState.belowFold) {
    if (egg) {
      eggVolleyIn -= dt
      if (eggVolleyIn <= 0) {
        fireRandomVolley() // rapid; airborne cap = LaserSystem's egg budget
        eggVolleyIn = EGG_VOLLEY_MIN_S + rand() * EGG_VOLLEY_SPAN_S
      }
    } else {
      if (volleyIn > 0) volleyIn -= dt
      // Max ONE ambient volley airborne: hold fire (timer pinned at 0) until
      // the previous bolts are gone, then the 8–14s clock restarts.
      if (volleyIn <= 0 && fxBus.ambientBoltsAlive <= 0) {
        fireRandomVolley()
        volleyIn = VOLLEY_MIN_S + rand() * VOLLEY_SPAN_S
      }
    }
  }
})

// Tres exempts <primitive> subtrees from automatic disposal — release all
// GL resources here (tier flips must not leak; dispose() is idempotent).
onUnmounted(() => {
  clearTimeout(rebuildTimer)
  dartGeometry.dispose()
  raiderGeometry.dispose()
  dreadGeometry.dispose()
  empRing.geometry.dispose()
  hullMaterial.dispose()
  exhaustCyan.dispose()
  exhaustMagenta.dispose()
  empMaterial.dispose()
  for (const ship of ships) ship.shieldMaterial.dispose()
  glowTexture.dispose()
  resetFxBus()
})
</script>

<template>
  <primitive :object="root" />
</template>
