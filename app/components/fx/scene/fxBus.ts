/**
 * fxBus — module-scope, NON-reactive coordination channel between ShipSwarm
 * and LaserSystem (both live in the lazy scene chunk; nothing here imports
 * three, Vue, or DOM).
 *
 * Same discipline as useSceneState: plain objects only, read/written inside
 * the render loop, zero per-frame allocations — every slot below is
 * preallocated and recycled via `active`/`pending` flags.
 *
 * Frame ordering contract (enforced via onBeforeRender priorities in the two
 * components): ShipSwarm (priority 0) steers and publishes ship positions +
 * screen projections into `ships`, THEN LaserSystem (priority 1) moves bolts,
 * runs near-miss checks against those fresh projections, and raises
 * `nearMiss` flags that ShipSwarm consumes on the NEXT frame (one frame of
 * dodge latency — invisible at 60fps).
 */

export type BoltFaction = 'cyan' | 'magenta'

/** One ship's per-frame contact record. ShipSwarm owns position/projection
 *  fields; LaserSystem owns the nearMiss/threat fields. */
export interface ShipContact {
  /** Targetable this frame (visible, not warp-streaking in). */
  active: boolean
  /** World position (mirrored from the ship group after steering). */
  x: number
  y: number
  z: number
  /** Screen projection in CSS px (written alongside x/y/z). */
  cssX: number
  cssY: number
  /** Player bolt passed within 90 css px — set by LaserSystem, consumed
   *  (dodge burst + 200ms shield shimmer) and cleared by ShipSwarm. */
  nearMiss: boolean
  /** World position of the offending bolt (dodge-away direction). */
  threatX: number
  threatY: number
  threatZ: number
}

export function makeShipContact(): ShipContact {
  return {
    active: false,
    x: 0,
    y: 0,
    z: 0,
    cssX: 0,
    cssY: 0,
    nearMiss: false,
    threatX: 0,
    threatY: 0,
    threatZ: 0,
  }
}

/** A queued ambient ship-to-ship volley (2 bolts, slight stagger). */
interface VolleySlot {
  pending: boolean
  sx: number
  sy: number
  sz: number
  tx: number
  ty: number
  tz: number
  faction: BoltFaction
}

const VOLLEY_SLOTS = 4

export const fxBus = {
  /** Ship contact registry — ShipSwarm installs its preallocated records on
   *  mount and empties the array on unmount. */
  ships: [] as ShipContact[],
  /** Preallocated volley request ring; fireVolley fills, LaserSystem drains. */
  volleys: Array.from({ length: VOLLEY_SLOTS }, (): VolleySlot => ({
    pending: false,
    sx: 0,
    sy: 0,
    sz: 0,
    tx: 0,
    ty: 0,
    tz: 0,
    faction: 'cyan',
  })),
  /** Live ambient (ship-fired) bolts — maintained by LaserSystem; ShipSwarm
   *  reads it to honor the max-1-ambient-volley-airborne rule (spec §5). */
  ambientBoltsAlive: 0,
}

/**
 * fireVolley — ShipSwarm's ambient-combat API (spec §5: one ship "paints"
 * another every 8–14s → 2-bolt volley). Coordinates are world-space; the
 * faction picks the sleeve color (cyan darts / magenta raider). Silently
 * drops when all slots are pending — caps always win over requests.
 */
export function fireVolley(
  sx: number,
  sy: number,
  sz: number,
  tx: number,
  ty: number,
  tz: number,
  faction: BoltFaction,
): void {
  for (let i = 0; i < fxBus.volleys.length; i++) {
    const slot = fxBus.volleys[i]!
    if (slot.pending) continue
    slot.pending = true
    slot.sx = sx
    slot.sy = sy
    slot.sz = sz
    slot.tx = tx
    slot.ty = ty
    slot.tz = tz
    slot.faction = faction
    return
  }
}

/** Full reset — both components call this on unmount so a tier flip can
 *  never leave stale cross-component state behind. */
export function resetFxBus(): void {
  fxBus.ships.length = 0
  fxBus.ambientBoltsAlive = 0
  for (let i = 0; i < fxBus.volleys.length; i++) fxBus.volleys[i]!.pending = false
}

// Dev-only inspection hook for headless verification (tree-shaken from prod
// builds): exposes live ship screen positions so tests can aim at them.
if (import.meta.dev && import.meta.client) {
  ;(globalThis as Record<string, unknown>).__fxBus = fxBus
}
