/**
 * useSceneState — module-scope, NON-reactive shared scene state.
 *
 * Per-frame data must never touch Vue reactivity: the render loop reads and
 * writes these plain objects directly (no refs, no computeds, no watchers).
 * SceneRoot owns every writer (pointermove / scroll listeners); Starfield and
 * the Phase 5 systems are read-only consumers inside the loop.
 */

export const sceneState = {
  /** Pointer in NDC (-1..1, +y up). Written by SceneRoot's window pointermove. */
  pointer: { x: 0, y: 0 },
  /** window.scrollY in CSS px. Written by SceneRoot's passive scroll listener. */
  scrollY: 0,
  /** scrollY > viewport height — drives the 30fps render cap (SceneRoot). */
  belowFold: false,
  /** Below-fold suppression: Starfield hides the near-dust layer while set. */
  thinned: false,
  /** Camera y (world units, scroll parallax) — written by SceneRoot's
   *  before-loop each frame BEFORE child loop callbacks run, so ship/laser
   *  screen-space projections always use the current frame's camera. */
  camY: 0,
  /**
   * Phase 5 play-layer contract (all plain fields, loop-read only):
   * - laserQueue: pending click-to-fire shots in NDC, pushed by useLaserInput
   *   via queueLaser() (bounded there, ≤ MAX_PLAYER_BOLTS pending), drained by
   *   LaserSystem each frame.
   * - hitCount: lifetime player near-misses on ships (LaserSystem increments;
   *   at 5 it shows TARGETING SYSTEMS: CALIBRATED once per session).
   * - eggActive: easter-egg dogfight window (useEasterEgg flips true for 8s;
   *   ShipSwarm/LaserSystem read it in-loop — extra ships, bolt cap 16).
   * - contactFlyby: one-shot trigger — ContactSection's reveal sets it via
   *   requestContactFlyby(); ShipSwarm consumes it (clears the flag) and runs
   *   a single scripted far-depth crossing, once per page load.
   */
  fx: {
    laserQueue: [] as Array<{ x: number; y: number }>,
    hitCount: 0,
    eggActive: false,
    contactFlyby: false,
  },
}

/** Player-shot caps (spec §6): pending queue and airborne player bolts share
 *  the same bound — LaserSystem re-enforces the airborne half at spawn. */
export const MAX_PLAYER_BOLTS = 4

/**
 * Bounded push for player shots (NDC). The ≤4 bound is enforced HERE at push
 * time — useLaserInput never has to know the pool's internals. Returns false
 * when the queue is saturated (caller skips the crosshair blip).
 */
export function queueLaser(ndcX: number, ndcY: number): boolean {
  if (sceneState.fx.laserQueue.length >= MAX_PLAYER_BOLTS) return false
  sceneState.fx.laserQueue.push({ x: ndcX, y: ndcY })
  return true
}

/** One-shot flyby trigger — ContactSection's reveal calls this; ShipSwarm
 *  clears the flag when it starts the crossing (and ignores repeats). */
export function requestContactFlyby(): void {
  sceneState.fx.contactFlyby = true
}

export function writePointer(ndcX: number, ndcY: number): void {
  sceneState.pointer.x = ndcX
  sceneState.pointer.y = ndcY
}

export function writeScroll(scrollY: number, belowFold: boolean): void {
  sceneState.scrollY = scrollY
  sceneState.belowFold = belowFold
  sceneState.thinned = belowFold
}

// ---------------------------------------------------------------------------
// Shared projection constants — SceneRoot's camera and Starfield's parallax
// math must agree on these or screen-px parallax targets drift apart.
// ---------------------------------------------------------------------------

/** Vertical FOV (deg) of the scene camera. */
export const SCENE_FOV = 60

/** Hard clamp (world units) on the camera's scroll-parallax y travel; the
 *  starfield pads its generated star coverage by exactly this much. */
export const CAM_SCROLL_MAX_WU = 50

/** Reference depth (|z|, world units) of the MID star layer — the plane the
 *  camera's scroll parallax is calibrated against. Starfield's MID spec and
 *  SceneRoot's camera math both read this; Phase 5 exclusion-zone projection
 *  should too. */
export const MID_REF_DEPTH = 250

export const HALF_FOV_TAN = Math.tan((SCENE_FOV / 2) * (Math.PI / 180))

/** World units per CSS pixel on a plane `depth` units in front of the camera —
 *  converts screen-px parallax targets into world-space offsets. */
export function worldUnitsPerCssPixel(depth: number, viewportCssHeight: number): number {
  return (2 * depth * HALF_FOV_TAN) / Math.max(viewportCssHeight, 1)
}

/** Axis-aligned world-space bounds on the plane z = −depth (camera-relative:
 *  callers add sceneState.camY to the y values for world space). */
export interface WorldBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/** CSS rect in viewport coordinates (px, origin top-left, +y down). */
export interface CssRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * cssRectToWorldBounds — project a CSS-pixel viewport rect onto the plane
 * `depth` world units in front of the camera. ALL screen↔world rect math for
 * the play layer lives here: the ship-patrol content exclusion zone and the
 * laser corner-spawn points both come through this one isotropic
 * `worldUnitsPerCssPixel` conversion, so they can never drift from the
 * starfield's parallax calibration.
 *
 * Output is camera-relative (camera on the z axis at the rect's depth):
 * world x grows right, world y grows UP — the CSS top edge maps to maxY.
 */
export function cssRectToWorldBounds(
  rect: CssRect,
  depth: number,
  viewportW: number,
  viewportH: number,
): WorldBounds {
  const wupp = worldUnitsPerCssPixel(depth, viewportH)
  return {
    minX: (rect.left - viewportW / 2) * wupp,
    maxX: (rect.left + rect.width - viewportW / 2) * wupp,
    minY: -(rect.top + rect.height - viewportH / 2) * wupp,
    maxY: -(rect.top - viewportH / 2) * wupp,
  }
}

// Dev-only inspection hook for headless verification (tree-shaken from prod
// builds): window.__sceneState mirrors the live module object.
if (import.meta.dev && import.meta.client) {
  ;(globalThis as Record<string, unknown>).__sceneState = sceneState
}
