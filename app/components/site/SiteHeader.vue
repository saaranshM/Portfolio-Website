<script setup lang="ts">
import { navItems } from '~/data/socials'
import { profile } from '~/data/profile'

/**
 * SiteHeader — fixed 64px HUD bar.
 *
 * - "SM" hexagon emblem; the hexagon stroke self-draws once on load
 *   (`is-booted`, JS-added so the no-JS baseline is simply a drawn hexagon).
 * - Desktop: mono nav `01 // ABOUT …` with underline-sweep hover and
 *   `aria-current` from useScrollSpy, plus a [ RESUME ] bracket chip.
 * - Hides on scroll-down / returns on scroll-up (never while the mobile
 *   menu is open, always visible near the top).
 * - Mobile (≤780px): hamburger → native <dialog> full-screen overlay
 *   (free focus trap + Esc); items decode in staggered; body scroll locked.
 */

const SCROLL_TOP_ZONE = 80
const SCROLL_DELTA = 4

// HANGAR BAY is an unnumbered annex with no nav item — it's observed so the
// highlight doesn't go dark between MISSIONS and CONTACT, and aliased to the
// MISSIONS band for display. The ids MUST stay in document order: useScrollSpy
// resolves "topmost" and "page bottom → last" from array order.
const { activeAnchor: rawAnchor } = useScrollSpy(
  navItems.flatMap((item) =>
    item.anchor === '#missions' ? ['missions', 'hangar'] : [item.anchor.slice(1)],
  ),
)
const activeAnchor = computed(() =>
  rawAnchor.value === '#hangar' ? '#missions' : rawAnchor.value,
)

// --- emblem self-draw + hide-on-scroll ------------------------------------
const booted = ref(false)
const hidden = ref(false)
let lastY = 0

function onScroll() {
  const y = window.scrollY
  if (menuOpen.value || y < SCROLL_TOP_ZONE) {
    hidden.value = false
  } else if (y > lastY + SCROLL_DELTA) {
    hidden.value = true
  } else if (y < lastY - SCROLL_DELTA) {
    hidden.value = false
  }
  lastY = y
}

// The <dialog> menu only exists ≤780px: if the viewport crosses to desktop
// while it's open (rotation, window resize), close it — otherwise the modal
// scroll-lock lingers with no visible menu to dismiss it.
let desktopQuery: MediaQueryList | null = null

function onDesktopChange(event: MediaQueryListEvent) {
  if (event.matches) closeMenu()
}

onMounted(() => {
  booted.value = true
  lastY = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
  desktopQuery = window.matchMedia('(min-width: 781px)')
  desktopQuery.addEventListener('change', onDesktopChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  desktopQuery?.removeEventListener('change', onDesktopChange)
  desktopQuery = null
  staggerTimers.forEach((t) => window.clearTimeout(t))
  staggerTimers = []
  unlockScroll()
})

// --- mobile <dialog> menu ---------------------------------------------------
const dialogRef = ref<HTMLDialogElement | null>(null)
const menuOpen = ref(false)
/** Remount key so the DecodeText stagger replays on every open. */
const openCount = ref(0)
const itemPlay = ref<boolean[]>(navItems.map(() => false))
let staggerTimers: number[] = []

function lockScroll() {
  document.documentElement.style.overflow = 'hidden'
}

function unlockScroll() {
  if (import.meta.client) document.documentElement.style.overflow = ''
}

function openMenu() {
  const dialog = dialogRef.value
  if (!dialog || menuOpen.value) return
  openCount.value += 1
  itemPlay.value = navItems.map(() => false)
  menuOpen.value = true
  hidden.value = false
  dialog.showModal()
  lockScroll()
  navItems.forEach((_, i) => {
    staggerTimers.push(
      window.setTimeout(() => {
        itemPlay.value[i] = true
      }, 120 + i * 90),
    )
  })
}

function closeMenu() {
  dialogRef.value?.close()
}

/** Single cleanup path — fires for Esc, backdrop, anchor clicks and close(). */
function onDialogClose() {
  menuOpen.value = false
  staggerTimers.forEach((t) => window.clearTimeout(t))
  staggerTimers = []
  unlockScroll()
}

/** Click on the dialog's own surface (not a link/button) = backdrop close. */
function onDialogClick(event: MouseEvent) {
  if (!(event.target as HTMLElement).closest('a, button')) closeMenu()
}
</script>

<template>
  <header class="site-header" :class="{ 'site-header--hidden': hidden }">
    <!-- data-egg-tap: 5 taps in 2s = the touch easter-egg trigger (useEasterEgg). -->
    <a class="site-header__emblem" :class="{ 'is-booted': booted }" href="#" aria-label="Saaransh Menon — back to top" data-egg-tap>
      <svg viewBox="0 0 40 44" width="34" height="38" aria-hidden="true">
        <path
          class="site-header__hex"
          pathLength="100"
          d="M20 2 L37 12 V32 L20 42 L3 32 V12 Z"
        />
        <text class="site-header__monogram" x="20" y="27" text-anchor="middle">SM</text>
      </svg>
    </a>

    <nav class="site-header__nav" aria-label="Primary">
      <ul class="site-header__list" role="list">
        <li v-for="item in navItems" :key="item.anchor">
          <a
            class="site-header__link t-mono"
            :href="item.anchor"
            :aria-current="activeAnchor === item.anchor ? 'true' : undefined"
          >
            <span class="site-header__index">{{ item.index }}</span>
            <span aria-hidden="true">&nbsp;//&nbsp;</span>{{ item.label }}
          </a>
        </li>
      </ul>

      <HudCta v-if="profile.resumeUrl" :href="profile.resumeUrl" external size="sm">
        [ RESUME ]
      </HudCta>
    </nav>

    <button
      class="site-header__burger"
      type="button"
      aria-label="Open navigation menu"
      :aria-expanded="menuOpen"
      aria-haspopup="dialog"
      @click="openMenu"
    >
      <Icon name="lucide:menu" size="24" />
    </button>

    <dialog
      ref="dialogRef"
      class="site-menu"
      aria-label="Navigation menu"
      @close="onDialogClose"
      @click="onDialogClick"
    >
      <button
        class="site-menu__close"
        type="button"
        aria-label="Close navigation menu"
        @click="closeMenu"
      >
        <Icon name="lucide:x" size="26" />
      </button>

      <nav aria-label="Menu">
        <ul :key="openCount" class="site-menu__list" role="list">
          <li v-for="(item, i) in navItems" :key="item.anchor">
            <a class="site-menu__link" :href="item.anchor" @click="closeMenu">
              <DecodeText
                class="site-menu__label"
                :text="`${item.index} // ${item.label}`"
                :play="itemPlay[i] ?? false"
                :duration="500"
              />
            </a>
          </li>
        </ul>
      </nav>

      <HudCta
        v-if="profile.resumeUrl"
        class="site-menu__resume"
        :href="profile.resumeUrl"
        external
        @click="closeMenu"
      >
        [ RESUME ]
      </HudCta>
    </dialog>
  </header>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 t.$space-6;

  // HudPanel surface, sans corner brackets — a continuous instrument rail.
  background: t.$panel;
  -webkit-backdrop-filter: blur(var(--panel-blur, 12px));
  backdrop-filter: blur(var(--panel-blur, 12px));
  border-bottom: 1px solid t.$cyan-dim;

  @include t.mobile {
    padding: 0 t.$space-4;
  }

  @media (prefers-reduced-motion: no-preference) {
    transition: transform 300ms t.$ease-hud;
  }
}

.site-header--hidden {
  transform: translateY(-100%);
}

// --- emblem ------------------------------------------------------------------
.site-header__emblem {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
}

.site-header__hex {
  fill: none;
  stroke: t.$cyan;
  stroke-width: 1.5;
  stroke-linejoin: round;
}

.site-header__monogram {
  font-family: t.$font-mono;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  fill: t.$ice;
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes hex-draw {
    from {
      stroke-dashoffset: 100;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  // Self-draw plays once when JS lands `is-booted`; without JS the hexagon
  // is simply drawn (no dasharray at rest).
  .site-header__emblem.is-booted .site-header__hex {
    stroke-dasharray: 100;
    animation: hex-draw 600ms t.$ease-hud both;
  }
}

// --- desktop nav ---------------------------------------------------------------
.site-header__nav {
  display: flex;
  align-items: center;
  gap: t.$space-4;

  @include t.mobile {
    display: none;
  }
}

.site-header__list {
  display: flex;
  align-items: center;
}

.site-header__link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 t.$space-3;
  color: t.$ice-dim;
  text-decoration: none;

  // Cyan underline sweep, left → right.
  background-image: linear-gradient(t.$cyan, t.$cyan);
  background-repeat: no-repeat;
  background-position: left calc(50% + 1.2em);
  background-size: 0% 1px;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      color t.$duration-fast t.$ease-hud,
      background-size t.$duration-fast t.$ease-hud;
  }

  &:hover,
  &:focus-visible,
  &[aria-current] {
    color: t.$ice;
    background-size: calc(100% - #{t.$space-3} * 2) 1px;
  }

  &[aria-current] .site-header__index {
    @include t.glow-text(t.$cyan);
  }
}

.site-header__index {
  color: t.$cyan;
}

// --- hamburger ------------------------------------------------------------------
.site-header__burger {
  display: none;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  color: t.$cyan;

  @include t.mobile {
    display: inline-flex;
  }
}

// --- mobile menu dialog ----------------------------------------------------------
.site-menu {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh; // fallback for browsers without dynamic viewport units
  height: 100dvh;
  max-width: none;
  max-height: none;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: t.$space-7;
  padding: t.$space-7 t.$space-5;
  border: none;
  color: t.$ice;
  background: rgba(3, 0, 20, 0.92);
  -webkit-backdrop-filter: blur(var(--panel-blur, 12px));
  backdrop-filter: blur(var(--panel-blur, 12px));

  &[open] {
    display: flex;
  }

  &::backdrop {
    background: transparent;
  }
}

.site-menu__close {
  position: absolute;
  top: t.$space-3;
  right: t.$space-3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  color: t.$cyan;
}

.site-menu__list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: t.$space-3;
}

.site-menu__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: t.$space-2 t.$space-4;
  text-decoration: none;
  color: t.$ice;

  &:hover .site-menu__label,
  &:focus-visible .site-menu__label {
    color: t.$cyan;
  }
}

.site-menu__label {
  font-family: t.$font-mono;
  font-size: 2rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;

  @media (prefers-reduced-motion: no-preference) {
    transition: color t.$duration-fast t.$ease-hud;
  }
}
</style>
