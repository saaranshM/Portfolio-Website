<script setup lang="ts">
import { featuredProjects } from '~/data/projects'

/**
 * FeaturedProjects — "03 // MISSION LOGS".
 * Four alternating MissionDossier entries; each dossier runs its own
 * useReveal so the slide-in plays as it enters the viewport, not when the
 * (very tall) section does. The heading reveals on its own observer.
 */
const { target, revealed } = useReveal()
</script>

<template>
  <section
    id="missions"
    class="missions content-section"
    aria-labelledby="missions-heading"
  >
    <div ref="target" :class="{ 'is-revealed': revealed }">
      <SectionHeading
        id="missions-heading"
        class="missions__heading"
        index="03"
        title="MISSION LOGS"
        :revealed="revealed"
      />
    </div>

    <div class="missions__list">
      <MissionDossier
        v-for="(project, i) in featuredProjects"
        :key="project.slug"
        :project="project"
        :index="i + 1"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.missions__heading {
  margin-bottom: t.$space-7;
}

.missions__list {
  display: flex;
  flex-direction: column;
  gap: t.$space-8;

  @include t.mobile {
    gap: t.$space-7;
  }
}
</style>
