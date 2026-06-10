<script setup lang="ts">
import { otherProjects } from '~/data/projects'

/**
 * OtherProjects — "// HANGAR BAY" (unnumbered annex).
 * 3/2/1-column grid of ProjectCard craft, fading up with a 60ms stagger
 * when the bay doors open.
 */
const { target, revealed } = useReveal(0.1)
</script>

<template>
  <section
    id="hangar"
    ref="target"
    class="hangar content-section"
    :class="{ 'is-revealed': revealed }"
    aria-labelledby="hangar-heading"
  >
    <SectionHeading
      id="hangar-heading"
      class="hangar__heading"
      index="//"
      title="HANGAR BAY"
      :revealed="revealed"
    />

    <ul class="hangar__grid" role="list">
      <li
        v-for="(project, i) in otherProjects"
        :key="project.slug"
        class="reveal-item"
        :style="{ '--reveal-delay': `${200 + i * 60}ms` }"
      >
        <ProjectCard :project="project" :index="i + 1" />
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.hangar__heading {
  margin-bottom: t.$space-6;
}

.hangar__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: t.$space-5;

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

// Cards stretch to equal heights per row.
.hangar__grid > li {
  display: flex;
  flex-direction: column;
}

.hangar__grid > li > :deep(.project-card) {
  flex: 1;
}
</style>
