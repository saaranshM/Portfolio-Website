<template>
  <li id="project-card" class="other-projects__item" @click="goToProject">
    <div class="project-card">
      <div class="project-card__head">
        <div class="project-card__top">
          <div class="project-card__top-folder">
            <SvgIcon name="folder"></SvgIcon>
          </div>
          <div class="project-card__top-links">
            <a
              @click.stop
              v-if="project.github"
              :id="'githubLink-' + project.id"
              :href="project.github"
              target="_blank"
            >
              <SvgIcon name="github"></SvgIcon>
            </a>
            <a
              @click.stop
              :id="'projectUrl-' + project.id"
              v-if="project.url"
              :href="project.url"
              target="_blank"
            >
              <SvgIcon name="linkto"></SvgIcon>
            </a>
          </div>
        </div>
        <h3 class="project-card__title">
          {{ project.title }}
        </h3>
        <div
          v-html="project.description"
          class="project-card__description"
        ></div>
      </div>
      <div class="project-card__foot">
        <ul class="project-card__list">
          <li v-for="(tech, index) in project.techList" :key="index">
            {{ tech }}
          </li>
        </ul>
      </div>
    </div>
  </li>
</template>

<script>
import SvgIcon from "../common/SvgIcon";
export default {
  name: "ProjectCard",
  components: { SvgIcon },
  props: ["project"],

  methods: {
    goToProject() {
      const link = this.project.url ? this.project.url : this.project.github;
      window.open(link);
    }
  }
};
</script>

<style scoped></style>
