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
        Always open for new opportunities in Full Stack Development and Machine
        Learning / Deep Learning. If you are looking for such an individual, you
        can contact me by clicking the button bellow.
      </p>
      <a href="mailto:saaransh.dev2811@gmail.com" class=" main__btn neon-button"
        >Say Hello</a
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
