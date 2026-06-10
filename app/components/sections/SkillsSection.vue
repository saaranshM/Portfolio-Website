<script setup lang="ts">
import { skillGroups } from '~/data/skills'

/**
 * SkillsSection — "02 // SYSTEMS MATRIX".
 * 2×2 grid (1-col mobile) of sub-panels, one per skill group. Each skill is
 * a row: mono name + a 5-segment parallelogram power cell (honest ordinal,
 * not a percentage). On reveal, lit segments "charge" left → right with a
 * 30ms stagger and the last lit segment flickers briefly. At rest / no-JS /
 * reduced-motion the lit segments are simply shown.
 */
const SEGMENTS = [1, 2, 3, 4, 5] as const

const { target, revealed } = useReveal(0.15)
</script>

<template>
  <section
    id="systems"
    ref="target"
    class="skills content-section"
    :class="{ 'is-revealed': revealed }"
    aria-labelledby="systems-heading"
  >
    <SectionHeading
      id="systems-heading"
      class="skills__heading"
      index="02"
      title="SYSTEMS MATRIX"
      :revealed="revealed"
    />

    <div class="skills__grid">
      <HudPanel
        v-for="(group, g) in skillGroups"
        :key="group.id"
        class="skills__panel reveal-item"
        :style="{ '--reveal-delay': `${200 + g * 60}ms` }"
        :strap="group.label"
        :revealed="revealed"
      >
        <ul class="skills__list" role="list">
          <li
            v-for="skill in group.skills"
            :key="skill.name"
            class="skills__row"
            :aria-label="`${skill.name}: level ${skill.level} of 5`"
          >
            <span class="skills__name t-mono-sm">{{ skill.name }}</span>
            <span class="skills__cells" aria-hidden="true">
              <span
                v-for="seg in SEGMENTS"
                :key="seg"
                class="skills__cell"
                :class="{
                  'skills__cell--lit': seg <= skill.level,
                  'skills__cell--last': seg === skill.level,
                }"
                :style="{ '--cell-delay': `${200 + g * 60 + 150 + (seg - 1) * 30}ms` }"
              />
            </span>
          </li>
        </ul>
      </HudPanel>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.skills__heading {
  margin-bottom: t.$space-6;
}

.skills__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: t.$space-5;

  @include t.mobile {
    grid-template-columns: minmax(0, 1fr);
  }
}

.skills__list {
  display: flex;
  flex-direction: column;
  gap: t.$space-3;
}

.skills__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: t.$space-3;
}

.skills__name {
  color: t.$ice;
}

// --- power cell ----------------------------------------------------------------
.skills__cells {
  display: inline-flex;
  gap: 4px;
  flex-shrink: 0;
}

.skills__cell {
  width: 14px;
  height: 9px;
  transform: skewX(-18deg);
  border: 1px solid t.$cyan-dim;
  background: transparent;
}

// Lit at rest — the no-JS / reduced-motion baseline is the finished state.
.skills__cell--lit {
  border-color: rgba(t.$cyan, 0.7);
  background: t.$cyan;
  box-shadow: 0 0 6px rgba(t.$cyan, 0.45);
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes cell-charge {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  // Charge sequence: lit cells pop in left → right (30ms stagger, offset by
  // their panel's fade-up delay); the segment at the skill's level gets the
  // global decode-flicker (one-shot, ≤600ms) as it lands.
  .skills.is-revealed {
    .skills__cell--lit {
      animation: cell-charge 200ms t.$ease-hud both;
      animation-delay: var(--cell-delay, 0ms);
    }

    .skills__cell--last {
      animation:
        cell-charge 200ms t.$ease-hud both,
        decode-flicker 600ms steps(8, jump-none) both;
      animation-delay: var(--cell-delay, 0ms);
    }
  }
}
</style>
