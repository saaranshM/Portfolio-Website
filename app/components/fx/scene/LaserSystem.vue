<script setup lang="ts">
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RingGeometry,
  Vector3,
} from 'three'
import { useLoop, useTresContext } from '@tresjs/core'
import { fxBus } from './fxBus'
import type { BoltFaction } from './fxBus'
import { makeDiscTexture } from './textures'
import {
  HALF_FOV_TAN,
  MAX_PLAYER_BOLTS,
  cssRectToWorldBounds,
  sceneState,
} from './useSceneState'

/**
 * LaserSystem — pooled bolts + impact effects (spec §5/§6).
 *
 * Bolt look = the documented bloom replacement (SceneRoot's PHASE 5 SEAM):
 * a white-hot (#eafffe) stretched-quad core inside a larger additive glow
 * "sleeve" quad (cyan for player shots/dart volleys, magenta for the
 * raider). Orientation is fixed at spawn: an axial billboard basis (length
 * along the flight dir, face toward the camera) — bolts live ≤0.7s and the
 * camera barely moves, so per-frame re-billboarding is skipped.
 *
 * Caps (spec §6 hard limits): pool of 16, ≤8 alive normally (player shots ≤4
 * of those — enforced once at queue time in queueLaser and again at spawn
 * here), the 8s easter egg raises the ceiling to the full 16.
 *
 * Impacts: 6 recycled slots, each a 12-particle Points burst + an expanding
 * thin ring (~200ms) — all buffers preallocated, zero steady-state
 * allocations.
 *
 * Loop ordering: each useLoop() gets its OWN priority hook, so cross-component
 * order comes from REGISTRATION order — SceneRoot's template mounts ShipSwarm
 * first, so this runs AFTER it and near-miss checks (player bolt within 90
 * css px of a ship) read this frame's ship projections; the `nearMiss` flag
 * raised here is consumed by ShipSwarm next frame (dodge + shimmer). Ships
 * are never destroyed.
 */

const { show: showToast } = useHudToast()

// --- tuning ----------------------------------------------------------------------
const BOLT_POOL = 16
const MAX_BOLTS = 8 // alive cap, spec §6…
const EGG_MAX_BOLTS = 16 // …raised for the 8s egg window
const BOLT_SPEED = 260 // wu/s ≈ 0.5s viewport crossing at patrol depths
const BOLT_TTL_MAX = 0.7 // hard lifetime ceiling (spec ≤0.7s)
const NEAR_MISS_PX = 90 // player-bolt shield-shimmer radius (CSS px)
const HIT_TOAST_AT = 5 // TARGETING SYSTEMS: CALIBRATED threshold
const PLAYER_SPAWN_DEPTH = 60 // twin bolts leave the bottom viewport corners here
const PLAYER_TARGET_DEPTH = 120 // click point unprojected to this plane
const VOLLEY_STAGGER_S = 0.1 // gap between the 2 bolts of an ambient volley
const VOLLEY_SPREAD_WU = 1.6 // lateral offset of the second bolt
const IMPACT_POOL = 6
const IMPACT_S = 0.3 // particle burst lifetime
const RING_S = 0.2 // expanding-ring lifetime (~200ms)
const SPARK_COUNT = 12

const WHITE_HOT = new Color('#eafffe')
const CYAN = new Color('#00f0ff')
const MAGENTA = new Color('#ff2d78')

const rand = mulberry32(0x1a5e7b01)

// --- shared GL resources ------------------------------------------------------------
// Soft capsule glow when stretched; reused by cores, sleeves and sparks.
const boltTexture = makeDiscTexture(64, [[0, 1], [0.35, 0.85], [0.7, 0.25], [1, 0]])
const quadGeometry = new PlaneGeometry(1, 1)

const coreMaterial = new MeshBasicMaterial({
  map: boltTexture,
  color: WHITE_HOT,
  transparent: true,
  opacity: 0.95,
  blending: AdditiveBlending,
  depthWrite: false,
})
const sleeveCyan = new MeshBasicMaterial({
  map: boltTexture,
  color: CYAN,
  transparent: true,
  opacity: 0.6,
  blending: AdditiveBlending,
  depthWrite: false,
})
const sleeveMagenta = sleeveCyan.clone()
sleeveMagenta.color = MAGENTA

// --- bolt pool -------------------------------------------------------------------------
interface Bolt {
  group: Group
  sleeve: Mesh
  alive: boolean
  player: boolean
  life: number
  ttl: number
  vel: Vector3
  tx: number
  ty: number
  tz: number
  faction: BoltFaction
}

const bolts: Bolt[] = []
const root = markRaw(new Group())

for (let i = 0; i < BOLT_POOL; i++) {
  const group = new Group()
  const core = new Mesh(quadGeometry, coreMaterial)
  core.scale.set(0.5, 7, 1)
  const sleeve = new Mesh(quadGeometry, sleeveCyan)
  sleeve.scale.set(2.2, 9, 1)
  sleeve.renderOrder = 5
  core.renderOrder = 6
  group.add(sleeve, core)
  group.visible = false
  root.add(group)
  bolts.push({
    group: markRaw(group),
    sleeve: markRaw(sleeve),
    alive: false,
    player: false,
    life: 0,
    ttl: 0,
    vel: new Vector3(),
    tx: 0,
    ty: 0,
    tz: 0,
    faction: 'cyan',
  })
}

let aliveBolts = 0
let alivePlayerBolts = 0

// Sole owner of the airborne-ambient counter (ShipSwarm only reads it):
// reset on mount AND unmount so a remount can never inherit a stale count.
fxBus.ambientBoltsAlive = 0

// Second bolt of each ambient volley fires VOLLEY_STAGGER_S later — small
// preallocated ring, capacity matches fxBus's volley slots.
interface PendingSecond {
  pending: boolean
  t: number
  sx: number
  sy: number
  sz: number
  tx: number
  ty: number
  tz: number
  faction: BoltFaction
}
const seconds: PendingSecond[] = Array.from({ length: 4 }, () => ({
  pending: false,
  t: 0,
  sx: 0,
  sy: 0,
  sz: 0,
  tx: 0,
  ty: 0,
  tz: 0,
  faction: 'cyan',
}))

// --- impact pool ------------------------------------------------------------------------
interface Impact {
  active: boolean
  t: number
  points: Points
  positions: Float32Array
  attr: BufferAttribute
  velocities: Float32Array
  pointsMaterial: PointsMaterial
  ring: Mesh
  ringMaterial: MeshBasicMaterial
}

const ringGeometry = new RingGeometry(0.9, 1.0, 32) // thin annulus ≈ the "1px ring"
const impacts: Impact[] = []

for (let i = 0; i < IMPACT_POOL; i++) {
  const positions = new Float32Array(SPARK_COUNT * 3)
  const attr = new BufferAttribute(positions, 3)
  attr.setUsage(DynamicDrawUsage)
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', attr)
  const pointsMaterial = new PointsMaterial({
    map: boltTexture,
    color: CYAN,
    size: 0.9,
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })
  const points = new Points(geometry, pointsMaterial)
  points.visible = false
  const ringMaterial = new MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  })
  const ring = new Mesh(ringGeometry, ringMaterial)
  ring.visible = false
  root.add(points, ring)
  impacts.push({
    active: false,
    t: 0,
    points: markRaw(points),
    positions,
    attr: markRaw(attr),
    velocities: new Float32Array(SPARK_COUNT * 3),
    pointsMaterial: markRaw(pointsMaterial),
    ring: markRaw(ring),
    ringMaterial: markRaw(ringMaterial),
  })
}
let impactCursor = 0

// Everything moves/scales manually — skip bounding-sphere culling.
root.traverse((obj) => {
  obj.frustumCulled = false
})

// --- plain mirrors (no ref reads in the loop) ----------------------------------------------
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

// --- scratch ------------------------------------------------------------------------------
const V_DIR = new Vector3()
const V_TOCAM = new Vector3()
const V_SIDE = new Vector3()
const V_NORM = new Vector3()
/** Explicit OUTPUT of spawnBolt: the spawned bolt's billboard side axis,
 *  copied out so callers (the volley spread) never read raw scratch. */
const V_SPREAD = new Vector3()
const M_BASIS = new Matrix4()

let calibratedToastShown = false

// ==============================================================================
// Spawning
// ==============================================================================

function maxAlive(): number {
  return sceneState.fx.eggActive ? EGG_MAX_BOLTS : MAX_BOLTS
}

function spawnBolt(
  sx: number,
  sy: number,
  sz: number,
  tx: number,
  ty: number,
  tz: number,
  faction: BoltFaction,
  player: boolean,
): boolean {
  if (aliveBolts >= maxAlive()) return false
  let bolt: Bolt | null = null
  for (let i = 0; i < bolts.length; i++) {
    if (!bolts[i]!.alive) {
      bolt = bolts[i]!
      break
    }
  }
  if (!bolt) return false

  V_DIR.set(tx - sx, ty - sy, tz - sz)
  const dist = V_DIR.length()
  if (dist < 1e-3) return false
  V_DIR.multiplyScalar(1 / dist)

  // Axial billboard basis: Y along flight, Z toward the camera.
  V_TOCAM.set(-(sx + tx) / 2, sceneState.camY - (sy + ty) / 2, -(sz + tz) / 2)
  V_SIDE.crossVectors(V_DIR, V_TOCAM)
  if (V_SIDE.lengthSq() < 1e-6) V_SIDE.set(1, 0, 0)
  else V_SIDE.normalize()
  V_NORM.crossVectors(V_SIDE, V_DIR)
  M_BASIS.makeBasis(V_SIDE, V_DIR, V_NORM)
  V_SPREAD.copy(V_SIDE) // export the side axis for the volley's twin offset

  bolt.group.quaternion.setFromRotationMatrix(M_BASIS)
  bolt.group.position.set(sx, sy, sz)
  bolt.group.visible = true
  bolt.vel.copy(V_DIR).multiplyScalar(BOLT_SPEED)
  bolt.life = 0
  bolt.ttl = Math.min(dist / BOLT_SPEED, BOLT_TTL_MAX)
  bolt.tx = tx
  bolt.ty = ty
  bolt.tz = tz
  bolt.faction = faction
  bolt.player = player
  bolt.sleeve.material = faction === 'magenta' ? sleeveMagenta : sleeveCyan
  bolt.alive = true

  aliveBolts++
  if (player) alivePlayerBolts++
  else fxBus.ambientBoltsAlive++
  return true
}

function killBolt(bolt: Bolt): void {
  if (!bolt.alive) return
  bolt.alive = false
  bolt.group.visible = false
  aliveBolts--
  if (bolt.player) alivePlayerBolts--
  else fxBus.ambientBoltsAlive--
}

function spawnImpact(x: number, y: number, z: number, color: Color): void {
  const impact = impacts[impactCursor % IMPACT_POOL]!
  impactCursor++
  impact.active = true
  impact.t = 0
  for (let i = 0; i < SPARK_COUNT; i++) {
    impact.positions[i * 3] = x
    impact.positions[i * 3 + 1] = y
    impact.positions[i * 3 + 2] = z
    // Random direction, speed 8–22 wu/s.
    const theta = rand() * Math.PI * 2
    const cphi = rand() * 2 - 1
    const sphi = Math.sqrt(1 - cphi * cphi)
    const speed = 8 + rand() * 14
    impact.velocities[i * 3] = Math.cos(theta) * sphi * speed
    impact.velocities[i * 3 + 1] = Math.sin(theta) * sphi * speed
    impact.velocities[i * 3 + 2] = cphi * speed
  }
  impact.attr.needsUpdate = true
  impact.pointsMaterial.color.copy(color)
  impact.pointsMaterial.opacity = 1
  impact.points.visible = true
  impact.ring.position.set(x, y, z)
  impact.ring.scale.set(1, 1, 1)
  impact.ring.lookAt(0, sceneState.camY, 0) // billboard the ring at the camera
  impact.ringMaterial.color.copy(color)
  impact.ringMaterial.opacity = 0.9
  impact.ring.visible = true
}

function boltColor(faction: BoltFaction): Color {
  return faction === 'magenta' ? MAGENTA : CYAN
}

// ==============================================================================
// Per-frame — registered AFTER ShipSwarm's steering callback (registration
// order = SceneRoot's template order; see the loop-ordering note up top)
// ==============================================================================

const { onBeforeRender } = useLoop()

let eggWas = false

onBeforeRender(({ delta }) => {
  const dt = Math.min(delta, 0.25)
  const aspect = viewportW / viewportH
  const camY = sceneState.camY
  const cap = maxAlive()

  // Egg falling edge: drop pending staggered seconds — their shooters are
  // gone, and a bolt must not materialize from empty space after the wipe.
  const egg = sceneState.fx.eggActive
  if (!egg && eggWas) {
    for (let i = 0; i < seconds.length; i++) seconds[i]!.pending = false
  }
  eggWas = egg

  // --- drain player clicks (twin corner bolts per click) -------------------------
  const queue = sceneState.fx.laserQueue
  while (
    queue.length > 0 &&
    alivePlayerBolts + 2 <= MAX_PLAYER_BOLTS &&
    aliveBolts + 2 <= cap
  ) {
    const shot = queue.shift()!
    // Click point unprojected onto the z = −PLAYER_TARGET_DEPTH plane.
    const tx = shot.x * HALF_FOV_TAN * aspect * PLAYER_TARGET_DEPTH
    const ty = camY + shot.y * HALF_FOV_TAN * PLAYER_TARGET_DEPTH
    const tz = -PLAYER_TARGET_DEPTH
    // Bottom viewport corners on the z = −PLAYER_SPAWN_DEPTH plane.
    const corners = cssRectToWorldBounds(
      { left: 0, top: 0, width: viewportW, height: viewportH },
      PLAYER_SPAWN_DEPTH,
      viewportW,
      viewportH,
    )
    spawnBolt(corners.minX, camY + corners.minY, -PLAYER_SPAWN_DEPTH, tx, ty, tz, 'cyan', true)
    spawnBolt(corners.maxX, camY + corners.minY, -PLAYER_SPAWN_DEPTH, tx, ty, tz, 'cyan', true)
  }

  // --- drain ambient volley requests (ShipSwarm's fireVolley) ---------------------
  for (let i = 0; i < fxBus.volleys.length; i++) {
    const slot = fxBus.volleys[i]!
    if (!slot.pending || aliveBolts >= cap) continue
    if (spawnBolt(slot.sx, slot.sy, slot.sz, slot.tx, slot.ty, slot.tz, slot.faction, false)) {
      slot.pending = false
      // Schedule the volley's second bolt with a slight stagger + spread
      // along V_SPREAD (the first bolt's side axis, exported by spawnBolt).
      for (let j = 0; j < seconds.length; j++) {
        const second = seconds[j]!
        if (second.pending) continue
        second.pending = true
        second.t = VOLLEY_STAGGER_S
        second.sx = slot.sx + V_SPREAD.x * VOLLEY_SPREAD_WU
        second.sy = slot.sy + V_SPREAD.y * VOLLEY_SPREAD_WU
        second.sz = slot.sz + V_SPREAD.z * VOLLEY_SPREAD_WU
        second.tx = slot.tx
        second.ty = slot.ty
        second.tz = slot.tz
        second.faction = slot.faction
        break
      }
    }
  }
  for (let i = 0; i < seconds.length; i++) {
    const second = seconds[i]!
    if (!second.pending) continue
    second.t -= dt
    if (second.t > 0) continue
    if (aliveBolts < cap) {
      spawnBolt(second.sx, second.sy, second.sz, second.tx, second.ty, second.tz, second.faction, false)
    }
    second.pending = false // fire-or-drop: caps always win
  }

  // --- move bolts, expire into impacts ----------------------------------------------
  for (let i = 0; i < bolts.length; i++) {
    const bolt = bolts[i]!
    if (!bolt.alive) continue
    bolt.life += dt
    if (bolt.life >= bolt.ttl) {
      spawnImpact(bolt.tx, bolt.ty, bolt.tz, boltColor(bolt.faction))
      killBolt(bolt)
      continue
    }
    bolt.group.position.addScaledVector(bolt.vel, dt)

    // Near-miss: player bolts within 90 css px of a ship → shield shimmer +
    // dodge (flag consumed by ShipSwarm next frame). Ships are NEVER
    // destroyed — the bolt dies, the ship shrugs it off.
    if (bolt.player) {
      const pos = bolt.group.position
      const az = Math.max(-pos.z, 1)
      const cssX = ((pos.x / (az * HALF_FOV_TAN * aspect) + 1) / 2) * viewportW
      const cssY = ((1 - (pos.y - camY) / (az * HALF_FOV_TAN)) / 2) * viewportH
      for (let s = 0; s < fxBus.ships.length; s++) {
        const ship = fxBus.ships[s]!
        if (!ship.active) continue
        const dx = cssX - ship.cssX
        const dy = cssY - ship.cssY
        if (dx * dx + dy * dy > NEAR_MISS_PX * NEAR_MISS_PX) continue
        ship.nearMiss = true
        ship.threatX = pos.x
        ship.threatY = pos.y
        ship.threatZ = pos.z
        spawnImpact(pos.x, pos.y, pos.z, CYAN)
        killBolt(bolt)
        sceneState.fx.hitCount++
        if (sceneState.fx.hitCount === HIT_TOAST_AT && !calibratedToastShown) {
          calibratedToastShown = true
          try {
            if (!sessionStorage.getItem(CALIBRATED_SESSION_KEY)) {
              sessionStorage.setItem(CALIBRATED_SESSION_KEY, '1')
              showToast('TARGETING SYSTEMS: CALIBRATED')
            }
          } catch {
            showToast('TARGETING SYSTEMS: CALIBRATED')
          }
        }
        break
      }
    }
  }

  // --- impacts: 12-spark burst + expanding ring (~200ms) ------------------------------
  const drag = Math.pow(0.88, dt * 60)
  for (let i = 0; i < impacts.length; i++) {
    const impact = impacts[i]!
    if (!impact.active) continue
    impact.t += dt
    const p = impact.t / IMPACT_S
    if (p >= 1) {
      impact.active = false
      impact.points.visible = false
      impact.ring.visible = false
      continue
    }
    for (let j = 0; j < SPARK_COUNT * 3; j++) {
      impact.positions[j]! += impact.velocities[j]! * dt
      impact.velocities[j]! *= drag
    }
    impact.attr.needsUpdate = true
    impact.pointsMaterial.opacity = 1 - p
    if (impact.ring.visible) {
      const q = impact.t / RING_S
      if (q >= 1) {
        impact.ring.visible = false
      } else {
        const ease = 1 - (1 - q) ** 3
        const r = 1 + 13 * ease
        impact.ring.scale.set(r, r, 1)
        impact.ringMaterial.opacity = 0.9 * (1 - q)
      }
    }
  }
})

// Tres exempts <primitive> subtrees from automatic disposal — release all GL
// resources on unmount (tier flips must not leak; dispose() is idempotent).
onUnmounted(() => {
  quadGeometry.dispose()
  ringGeometry.dispose()
  coreMaterial.dispose()
  sleeveCyan.dispose()
  sleeveMagenta.dispose()
  for (const impact of impacts) {
    impact.points.geometry.dispose()
    impact.pointsMaterial.dispose()
    impact.ringMaterial.dispose()
  }
  boltTexture.dispose()
  // Drop airborne-ambient bookkeeping so a remount starts clean (this
  // component is the counter's sole owner — reset on mount and unmount).
  fxBus.ambientBoltsAlive = 0
  // Stale clicks queued while no LaserSystem exists must not fire after a
  // full→lite→full round-trip.
  sceneState.fx.laserQueue.length = 0
})
</script>

<template>
  <primitive :object="root" />
</template>
