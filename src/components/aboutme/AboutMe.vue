<template>
  <section id="about" class="about">
    <div
      v-observe-visibility="{ callback: isViewableNow, once: true }"
      :class="{
        'visible animate__animated animate__fadeInUp visible': showAnimation,
        invisible: !showAnimation
      }"
      class="about__container"
    >
      <h2 class="numbered-heading">
        <span class="heading-number">01.</span>
        About Me
      </h2>
      <div class="about__content">
        <div class="about__content-text">
          <div class="about__content-text-content">
            <p>
              Hey! My name is Saaransh and I was fascinated by the Web and how
              it is intertwined with our daily lives. Before diving into the web
              I was into Machine Learning and Deep Learning built small projects
              it just felt unreal how all of it worked.
            </p>
            <p>
              Now I am trying to put best of both worlds together by building ML
              &#38; DL models and finding new and innovative ways to combine
              them with the web.
            </p>
            <p>Here are a few technologies I've been working with recently:</p>
          </div>
          <ul class="about__content-text-list">
            <li class="about__content-text-list-item">
              Javascript (ES6+)
            </li>
            <li class="about__content-text-list-item">
              Vue
            </li>
            <li class="about__content-text-list-item">
              Node.js
            </li>
            <li class="about__content-text-list-item">
              CSS/SCSS
            </li>
            <li class="about__content-text-list-item">
              Tensorflow
            </li>
            <li class="about__content-text-list-item">
              Open CV
            </li>
          </ul>
        </div>
        <div class="about__image-wrapper">
          <img
            src="../../assets/img/me/me.webp"
            alt="Me Photo"
            class="about__image"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import visibility from "../../mixins/visibility";

export default {
  name: "AboutMe",
  mixins: [visibility]
};
</script>

<style scoped></style>
