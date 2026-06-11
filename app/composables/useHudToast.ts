/**
 * useHudToast — singleton mono HUD toast (bottom-left chip, see HudToast.vue).
 *
 * `show('POWER SAVING MODE')` displays one message for ~4s. Max one visible:
 * a new show() replaces the current text and restarts the clock (no queue —
 * the newest signal wins). Module-scope state: every caller shares the same
 * outlet, which default.vue mounts exactly once.
 */

const TOAST_DURATION_MS = 4000

const message = ref<string | null>(null)
let hideTimer = 0

function show(text: string): void {
  if (!import.meta.client) return
  message.value = text
  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => {
    message.value = null
  }, TOAST_DURATION_MS)
}

export function useHudToast() {
  return {
    message: readonly(message),
    show,
  }
}
