/**
 * useScrollSpy — tracks which page section currently owns the viewport, for
 * nav highlighting (`aria-current`).
 *
 * One IntersectionObserver over the given section ids with the root shrunk
 * to a horizontal band in the upper third of the viewport: whichever section
 * box intersects the band is "active". `activeAnchor` is the matching
 * '#id' anchor, or null near the top of the page (hero — nothing active).
 */
export function useScrollSpy(ids: string[]) {
  const activeAnchor = ref<string | null>(null)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeAnchor.value = `#${entry.target.id}`
        }
      },
      // Active band: 25% → 45% from the top of the viewport.
      { rootMargin: '-25% 0px -55% 0px', threshold: 0 },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return { activeAnchor }
}
