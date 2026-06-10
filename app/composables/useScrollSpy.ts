/**
 * useScrollSpy — tracks which page section currently owns the viewport, for
 * nav highlighting (`aria-current`).
 *
 * One IntersectionObserver over the given section ids with the root shrunk
 * to a horizontal band in the upper third of the viewport. The callback
 * maintains a Set of every section currently inside the band; `activeAnchor`
 * is the TOPMOST of those (ids are in document order), or null when the set
 * is empty (hero / top of page — nothing active).
 *
 * Bottom-of-page override: short final sections may never reach the band on
 * tall viewports, so a passive scroll listener forces the LAST id active
 * once the page is scrolled to the bottom (within 2px).
 */
export function useScrollSpy(ids: string[]) {
  const activeAnchor = ref<string | null>(null)
  let observer: IntersectionObserver | null = null
  const intersecting = new Set<string>()

  function atPageBottom() {
    return (
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2
    )
  }

  function update() {
    const last = ids[ids.length - 1]
    if (last && atPageBottom()) {
      activeAnchor.value = `#${last}`
      return
    }
    // `ids` follows document order, so the first hit is the topmost section.
    const topmost = ids.find((id) => intersecting.has(id))
    activeAnchor.value = topmost ? `#${topmost}` : null
  }

  function onScroll() {
    update()
  }

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id)
          else intersecting.delete(entry.target.id)
        }
        update()
      },
      // Active band: 25% → 45% from the top of the viewport.
      { rootMargin: '-25% 0px -55% 0px', threshold: 0 },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    intersecting.clear()
    window.removeEventListener('scroll', onScroll)
  })

  return { activeAnchor }
}
