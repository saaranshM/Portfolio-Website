/**
 * WebGL2 capability probe — creates a throwaway context and immediately
 * releases it (WEBGL_lose_context) so repeated probes can't exhaust the
 * browser's context pool. Shared by useEffectsTier's detection pipeline and
 * SceneRoot's preflight (an override of 'full' skips detection, so the scene
 * must re-probe before constructing a renderer).
 */
export function hasWebGl2Support(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}
