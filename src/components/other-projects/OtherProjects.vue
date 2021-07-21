<template>
  <section class="other-projects">
    <div
      v-observe-visibility="{ callback: isViewableNow, once: true }"
      :class="{
        'visible animate__animated animate__fadeInUp visible': showAnimation,
        invisible: !showAnimation
      }"
    >
      <h2 class="other-projects__heading">Some Other Projects</h2>
      <ul class="other-projects__grid">
        <ProjectCard v-for="i in 6" :key="i"></ProjectCard>
      </ul>
    </div>
  </section>
</template>

<script>
import ProjectCard from "../project-card/ProjectCard";
import visibility from "../../mixins/visibility";
export default {
  name: "OtherProjects",
  components: { ProjectCard },
  mixins: [visibility]
};
</script>

<style scoped></style>
