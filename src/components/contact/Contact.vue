<template>
  <section id="contact" class="contact">
    <div
      v-observe-visibility="{ callback: isViewableNow, once: true }"
      :class="{
        'visible animate__animated animate__fadeInUp visible': showAnimation,
        invisible: !showAnimation
      }"
    >
      <h2 class="contact__heading">04. What's Next?</h2>
      <h2 class="contact__heading-main">Get In Touch</h2>
      <p class="contact__text">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam
        consequatur dolores est ex fugiat illo ipsam iure magni nisi odit
        perspiciatis sit, voluptate voluptatibus voluptatum?
      </p>
      <a href="mailto:saaransh.dev2811@gmail.com" class=" main__btn neon-button"
        >Get in touch</a
      >
    </div>
  </section>
</template>

<script>
import visibility from "../../mixins/visibility";

export default {
  name: "ContactUs",
  mixins: [visibility]
};
</script>

<style scoped></style>
