<template>
  <section class="other-projects">
    <h2 class="other-projects__heading">Some Other Projects</h2>
    <ul class="other-projects__grid">
      <ProjectCard v-for="i in 4" :key="i"></ProjectCard>
    </ul>
  </section>
</template>

<script>
import SvgIcon from "../common/SvgIcon";
import ProjectCard from "../project-card/ProjectCard";
export default {
  name: "OtherProjects",
  components: { ProjectCard }
};
</script>

<style scoped></style>
