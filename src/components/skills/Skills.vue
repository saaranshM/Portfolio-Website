<template>
  <section id="skills" class="skills">
    <div
      v-observe-visibility="{ callback: isViewableNow, once: true }"
      :class="{
        'visible animate__animated animate__fadeInUp visible': showAnimation,
        invisible: !showAnimation
      }"
    >
      <h2 class="numbered-heading">
        <span class="heading-number">02.</span>
        Skills
      </h2>
      <div class="skills__container">
        <ul class="skills__grid">
          <li
            v-for="(skill, index) in skills"
            :key="index"
            class="skills__item"
          >
            <h4 class="skills__item-heading">{{ skill.name }}</h4>
            <div class="skills__item-progress">
              <div
                class="skills__item-progress-bar"
                :style="`--width: ${skill.percentage}`"
              ></div>
              <p class="skills__item-progress-percent">
                {{ skill.percentage }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import visibility from "../../mixins/visibility";

export default {
  name: "Skills",
  mixins: [visibility],
  data: () => {
    return {
      skills: [
        {
          name: "Javascript",
          percentage: "80%"
        },
        {
          name: "Vue",
          percentage: "90%"
        },
        {
          name: "NoSQL",
          percentage: "70%"
        },
        {
          name: "Tensorflow",
          percentage: "65%"
        },
        {
          name: "HTML",
          percentage: "90%"
        },
        {
          name: "CSS/SCSS",
          percentage: "80%"
        },
        {
          name: "Python",
          percentage: "80%"
        },
        {
          name: "C++",
          percentage: "65%"
        },
        {
          name: "Express.js",
          percentage: "70%"
        }
      ]
    };
  }
};
</script>

<style scoped></style>
