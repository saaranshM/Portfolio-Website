<template>
  <header class="header" :class="{ 'navbar-hidden': !showNavbar }">
    <transition appear appear-active-class="navigation-logo-animation">
      <SvgIcon class="header__logo" name="colored-logo"></SvgIcon>
    </transition>
    <nav class="navigation">
      <ul class="navigation__list">
        <transition appear appear-active-class="navigation-fade-in-1">
          <li class="navigation__item">
            <span class="navigation__number">01.</span
            ><a href="#" class="navigation__link">About</a>
          </li>
        </transition>
        <transition appear appear-active-class="navigation-fade-in-2">
          <li class="navigation__item">
            <span class="navigation__number">02.</span>
            <a href="#" class="navigation__link">Projects</a>
          </li>
        </transition>
        <transition appear appear-active-class="navigation-fade-in-3">
          <li class="navigation__item">
            <span class="navigation__number">03.</span
            ><a href="#" class="navigation__link">Experience</a>
          </li>
        </transition>
        <transition appear appear-active-class="navigation-fade-in-4">
          <li class="navigation__item">
            <span class="navigation__number">04.</span
            ><a href="#" class="navigation__link">Contact</a>
          </li>
        </transition>
      </ul>
    </nav>
  </header>
</template>

<script>
import SvgIcon from "@/components/common/SvgIcon";
export default {
  name: "Header",
  components: { SvgIcon },
  data() {
    return {
      show: false,
      showNavbar: true,
      lastScrollPosition: 0
    };
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;

      if (currentScrollPosition < 0) {
        return;
      }

      if (Math.abs(currentScrollPosition - this.lastScrollPosition) < 60) {
        return;
      }

      this.showNavbar = currentScrollPosition < this.lastScrollPosition;

      this.lastScrollPosition = currentScrollPosition;
    }
  }
};
</script>

<style scoped></style>
