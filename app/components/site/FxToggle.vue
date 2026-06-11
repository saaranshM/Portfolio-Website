<script setup lang="ts">
import type { Tier } from '~/utils/constants'

/**
 * FxToggle — mono HUD radiogroup in the footer: `FX  AUTO / FULL / LITE / OFF`.
 *
 * AUTO clears the localStorage override (detection re-runs) and shows the
 * tier detection resolved to as a dim suffix, e.g. `AUTO (FULL)`. The other
 * three pin the tier via useEffectsTier's persisted override.
 *
 * SSR renders AUTO active with tier 'off' — identical to the client's
 * pre-detection state, so hydration never mismatches; any stored override
 * applies reactively after mount.
 */
const { tier, override, setOverride } = useEffectsTier()

const options: ReadonlyArray<{ value: Tier | null; label: string }> = [
  { value: null, label: 'AUTO' },
  { value: 'full', label: 'FULL' },
  { value: 'lite', label: 'LITE' },
  { value: 'off', label: 'OFF' },
]
</script>

<template>
  <div class="fx-toggle t-mono-sm" role="radiogroup" aria-label="Effects level">
    <span class="fx-toggle__label" aria-hidden="true">FX</span>
    <button
      v-for="option in options"
      :key="option.label"
      type="button"
      class="fx-toggle__option"
      :class="{ 'fx-toggle__option--active': override === option.value }"
      role="radio"
      :aria-checked="override === option.value"
      @click="setOverride(option.value)"
    >
      {{ option.label
      }}<span
        v-if="option.value === null && override === null"
        class="fx-toggle__resolved"
      >&nbsp;({{ tier.toUpperCase() }})</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.fx-toggle {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  column-gap: t.$space-2;
}

.fx-toggle__label {
  margin-right: t.$space-2;
  color: t.$ice-dim;

  &::after {
    content: ' //';
  }
}

// 44px tap-target floor on every option.
.fx-toggle__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0 t.$space-2;
  font: inherit;
  letter-spacing: inherit;
  color: t.$ice-dim;

  @media (prefers-reduced-motion: no-preference) {
    transition: color t.$duration-fast t.$ease-hud;
  }

  &:hover {
    color: t.$ice;
  }
}

.fx-toggle__option--active {
  color: t.$cyan;

  @include t.glow-text;
}

.fx-toggle__resolved {
  color: t.$ice-dim;
  text-shadow: none;
}
</style>
