import { CanvasTexture } from 'three'

/**
 * makeDiscTexture — runtime radial-gradient sprite canvas, the scene's
 * universal "pre-glowed" building block (stars, exhaust glows, shield
 * shimmers, laser sleeves). This soft falloff IS the full tier's bloom:
 * see SceneRoot's postprocessing decision.
 *
 * Client-only (document) — every caller lives inside the lazy scene chunk.
 */
export function makeDiscTexture(
  px: number,
  stops: ReadonlyArray<[number, number]>,
): CanvasTexture {
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
