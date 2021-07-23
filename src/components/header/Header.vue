<template>
  <header class="header" :class="{ 'navbar-hidden': !showNavbar }">
    <transition appear appear-active-class="navigation-logo-animation">
      <div @click="refresh">
        <SvgIcon class="header__logo" name="colored-logo"></SvgIcon>
      </div>
    </transition>

    <nav class="navigation">
      <ul class="navigation__list">
        <transition appear appear-active-class="navigation-fade-in-1">
          <li class="navigation__item">
            <span class="navigation__number">01.</span
            ><a v-scroll-to="'#about'" href="#about" class="navigation__link"
              >About</a
            >
          </li>
        </transition>
        <transition appear appear-active-class="navigation-fade-in-2">
          <li class="navigation__item">
            <span class="navigation__number">02.</span>
            <a v-scroll-to="'#skills'" href="#skills" class="navigation__link"
              >Skills</a
            >
          </li>
        </transition>
        <transition appear appear-active-class="navigation-fade-in-3">
          <li class="navigation__item">
            <span class="navigation__number">03.</span
            ><a
              v-scroll-to="'#projects'"
              href="#projects"
              class="navigation__link"
              >Projects</a
            >
          </li>
        </transition>
        <transition appear appear-active-class="navigation-fade-in-4">
          <li class="navigation__item">
            <span class="navigation__number">04.</span
            ><a
              v-scroll-to="'#contact'"
              href="#contact"
              class="navigation__link"
              >Contact</a
            >
          </li>
        </transition>
        <transition appear appear-active-class="navigation-fade-in-5">
          <li class="navigation__item">
            <a
              href="https://firebasestorage.googleapis.com/v0/b/vue-express-54b2e.appspot.com/o/RESUME%2FMy%20Resume.pdf?alt=media&token=84b70296-7c92-4444-900b-c707961a6e30"
              target="_blank"
              class="navigation__resume"
              >Resume</a
            >
          </li>
        </transition>
      </ul>
    </nav>
    <transition appear appear-active-class="navigation__ham-fadeIn">
      <li id="ham-li" @click="toggle" class="navigation__ham-item">
        <div id="ham-item" class="navigation__hamburger">
          <div id="ham-item-inner" class="navigation__hamburger-inner"></div>
        </div>
      </li>
    </transition>
    <Sidenav v-scroll-lock="btnToggle"></Sidenav>
    <transition
      enter-active-class="animate__animated animate__fadeIn"
      leave-active-class="animate__animated animate__fadeOut"
    >
      <BlurContainer v-if="btnToggle"></BlurContainer>
    </transition>
  </header>
</template>

<script>
import SvgIcon from "@/components/common/SvgIcon";
import Sidenav from "../sidenav/Sidenav";
import BlurContainer from "../blur-container/BlurContainer";
export default {
  name: "Header",
  components: { BlurContainer, Sidenav, SvgIcon },
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
    window.addEventListener("click", this.closeNav);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("click", this.closeNav);
  },
  methods: {
    refresh() {
      console.log("yes");
      this.$router.go();
    },
    closeNav(e) {
      if (
        e.target.id !== "sidenav" &&
        e.target.id !== "ham-item" &&
        e.target.id !== "ham-item-inner" &&
        e.target.id !== "ham-li"
      ) {
        const btnLogo = document.querySelector(":root");
        const sideNav = document.getElementById("sidenav");
        if (this.btnToggle) {
          sideNav.style.transform = "translateX(100%)";
          btnLogo.setAttribute(
            "style",
            "--after-deg: 0deg; --before-deg: 0deg;--after-top: 1rem;--before-top: -1rem; --middle-background-color: #64ffda; --ham-bottom-width: 80%; --ham-top-width: 120%; --sidenav-pos: 0"
          );
          this.btnToggle = !this.btnToggle;
        }
      }
    },
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
