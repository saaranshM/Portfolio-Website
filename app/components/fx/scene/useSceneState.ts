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
  /**
   * Phase 5 contract — kept minimal until ShipSwarm/LaserSystem land:
   * - laserQueue: pending click-to-fire shots in NDC. useLaserInput pushes
   *   (bounded, max 4 player bolts airborne), LaserSystem drains per frame.
   * - warpActive: easter-egg dogfight mode, toggled by useEasterEgg.
   */
  fx: {
    laserQueue: [] as Array<{ x: number; y: number }>,
    warpActive: false,
  },
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

const HALF_FOV_TAN = Math.tan((SCENE_FOV / 2) * (Math.PI / 180))

/** World units per CSS pixel on a plane `depth` units in front of the camera —
 *  converts screen-px parallax targets into world-space offsets. */
export function worldUnitsPerCssPixel(depth: number, viewportCssHeight: number): number {
  return (2 * depth * HALF_FOV_TAN) / Math.max(viewportCssHeight, 1)
}
