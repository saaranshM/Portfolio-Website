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
    <li class="navigation__ham-item">
      <div @click="toggle" class="navigation__hamburger">
        <div class="navigation__hamburger-inner"></div>
      </div>
    </li>
    <Sidenav></Sidenav>
  </header>
</template>

<script>
import SvgIcon from "@/components/common/SvgIcon";
import Sidenav from "../sidenav/Sidenav";
export default {
  name: "Header",
  components: { Sidenav, SvgIcon },
  data() {
    return {
      show: false,
      showNavbar: true,
      lastScrollPosition: 0,
      btnToggle: false
    };
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    toggle() {
      const btnLogo = document.querySelector(":root");
      const sideNav = document.getElementById("sidenav");
      if (this.btnToggle) {
        sideNav.style.transform = "translateX(100%)";
        btnLogo.setAttribute(
          "style",
          "--after-deg: 0deg; --before-deg: 0deg;--after-top: 1rem;--before-top: -1rem; --middle-background-color: #64ffda; --ham-bottom-width: 80%; --ham-top-width: 120%; --sidenav-pos: 0"
        );
        this.btnToggle = !this.btnToggle;
      } else {
        sideNav.style.transform = "translateX(0)";
        btnLogo.setAttribute(
          "style",
          "--after-deg: 135deg; --before-deg:-135deg; --after-top: 0;   --before-top: 0px; --middle-background-color: transparent; --ham-bottom-width: 100%; --ham-top-width: 100%; --sidenav-pos: -100%;"
        );
        this.btnToggle = !this.btnToggle;
      }
    },
    // "--after-deg: 0deg; --before-deg: 0deg;--after-top: 1rem;--before-top: -1rem; --middle-background-color: #64ffda; --ham-bottom-width: 80%; --ham-top-width: 120%; --sidenav-pos: 0"
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
