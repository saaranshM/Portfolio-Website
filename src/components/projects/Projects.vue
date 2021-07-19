<template>
  <section class="projects">
    <h2 class="numbered-heading">
      <span class="heading-number">02.</span>
      Projects I have done
    </h2>
    <ul class="projects__list">
      <li class="project">
        <div class="project__content">
          <div>
            <p class="project__overline">Featured Project</p>
            <h3 class="project__title">
              <a href="#" class="project__link">Breast Cancer Detector</a>
            </h3>
            <div class="project__description">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Commodi cupiditate eius enim nulla numquam quae quaerat
                recusandae sunt ullam? Beatae!
              </p>
            </div>
            <ul class="project__tech-list">
              <li>Python</li>
              <li>Tensorflow</li>
              <li>Open CV</li>
            </ul>
            <div class="project__links">
              <a class="project__icon" href="#">
                <SvgIcon name="github"></SvgIcon>
              </a>
              <a class="project__icon" href="#">
                <SvgIcon name="linkto"></SvgIcon>
              </a>
            </div>
          </div>
        </div>
        <div class="project__image-content">
          <a href="#" class="project__image-link">
            <div class="project__image-wrapper">
              <img
                src="../../assets/img/projects/breast-cancer.jpg"
                alt="Breast Cancer Project"
                class="project__image"
              />
            </div>
          </a>
        </div>
      </li>
      <li class="project">
        <div class="project__content">
          <div>
            <p class="project__overline">Featured Project</p>
            <h3 class="project__title">
              <a href="#" class="project__link">Breast Cancer Detector</a>
            </h3>
            <div class="project__description">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Commodi cupiditate eius enim nulla numquam quae quaerat
                recusandae sunt ullam? Beatae!
              </p>
            </div>
            <ul class="project__tech-list">
              <li>Python</li>
              <li>Tensorflow</li>
              <li>Open CV</li>
            </ul>
            <div class="project__links">
              <a class="project__icon" href="#">
                <SvgIcon name="github"></SvgIcon>
              </a>
              <a class="project__icon" href="#">
                <SvgIcon name="linkto"></SvgIcon>
              </a>
            </div>
          </div>
        </div>
        <div class="project__image-content">
          <a href="#" class="project__image-link">
            <div class="project__image-wrapper">
              <img
                src="../../assets/img/projects/breast-cancer.jpg"
                alt="Breast Cancer Project"
                class="project__image"
              />
            </div>
          </a>
        </div>
      </li>
      <li class="project">
        <div class="project__content">
          <div>
            <p class="project__overline">Featured Project</p>
            <h3 class="project__title">
              <a href="#" class="project__link">Breast Cancer Detector</a>
            </h3>
            <div class="project__description">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Commodi cupiditate eius enim nulla numquam quae quaerat
                recusandae sunt ullam? Beatae!
              </p>
            </div>
            <ul class="project__tech-list">
              <li>Python</li>
              <li>Tensorflow</li>
              <li>Open CV</li>
            </ul>
            <div class="project__links">
              <a class="project__icon" href="#">
                <SvgIcon name="github"></SvgIcon>
              </a>
              <a class="project__icon" href="#">
                <SvgIcon name="linkto"></SvgIcon>
              </a>
            </div>
          </div>
        </div>
        <div class="project__image-content">
          <a href="#" class="project__image-link">
            <div class="project__image-wrapper">
              <img
                src="../../assets/img/projects/breast-cancer.jpg"
                alt="Breast Cancer Project"
                class="project__image"
              />
            </div>
          </a>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
import SvgIcon from "../common/SvgIcon";
export default {
  name: "Projects",
  components: { SvgIcon }
};
</script>

<style scoped></style>
