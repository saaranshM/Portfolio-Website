<template>
  <li class="other-projects__item" @click="goToProject">
    <div class="project-card">
      <div class="project-card__head">
        <div class="project-card__top">
          <div class="project-card__top-folder">
            <SvgIcon name="folder"></SvgIcon>
          </div>
          <div class="project-card__top-links">
            <a id="githubLink" href="#" target="_blank">
              <SvgIcon name="github"></SvgIcon>
            </a>
            <a href="#">
              <SvgIcon name="linkto"></SvgIcon>
            </a>
          </div>
        </div>
        <h3 class="project-card__title">
          <a href="#">
            Breast Cancer Detector
          </a>
        </h3>
        <div class="project-card__description">
          An app that helps pathologists detect breast cancer more efficiently
        </div>
      </div>
      <div class="project-card__foot">
        <ul class="project-card__list">
          <li>Vue</li>
          <li>Node.js</li>
          <li>Javascript</li>
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
  methods: {
    goToProject() {
      const link = document.getElementById("githubLink");
      link.click();
    }
  }
};
</script>

<style scoped></style>
