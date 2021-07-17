<template>
  <section class="main">
    <div class="main__container">
      <transition appear appear-active-class="label-animation">
        <vue-typed-js v-bind="typedJsPropsLabel">
          <h1 class="main__name-label">
            <span class="typing"></span>
          </h1>
        </vue-typed-js>
      </transition>
      <transition appear appear-active-class="name-animation">
        <vue-typed-js v-bind="typedJsPropsName">
          <h1 class="main__name"><span class="typing"></span></h1>
        </vue-typed-js>
      </transition>
      <transition appear appear-active-class="who-animation">
        <vue-typed-js v-bind="typedJsPropsWho">
          <h2 class="main__who"><span class="typing"></span></h2>
        </vue-typed-js>
      </transition>
      <transition appear appear-active-class="description-animation">
        <p class="main__description .d">
          I am a software engineering student currently trying to grasp all the
          knowledge there is about web development and Machine Learning residing
          in India. Always open for <a href="#">new opportunities.</a>
        </p>
      </transition>
      <transition appear appear-active-class="main-button-animation">
        <a href="#" class=" main__btn neon-button">Get in touch</a>
      </transition>
    </div>
  </section>
</template>

<script>
export default {
  name: "Main",
  data: () => {
    return {
      typedJsPropsLabel: {
        typeSpeed: 70,
        showCursor: false,
        startDelay: 2600,
        strings: ["Hi, my name is"]
      },
      typedJsPropsName: {
        typeSpeed: 60,
        showCursor: false,
        startDelay: 3500,
        strings: ["Saaransh Menon."]
      },
      typedJsPropsWho: {
        typeSpeed: 50,
        showCursor: false,
        startDelay: 3200,
        strings: ["Full stack developer and ML Enthusiast."]
      }
    };
  }
};
</script>

<style scoped></style>
