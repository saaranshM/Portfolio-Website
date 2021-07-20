<template>
  <header id="navbar" class="header">
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
      show: false
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
      let prevScrollpos = window.pageYOffset;
      window.onscroll = () => {
        let currentScrollPos = window.pageYOffset;
        if (prevScrollpos > currentScrollPos) {
          console.log("yes");
          document.getElementById("navbar").style.top = "0";
        } else {
          console.log("no");
          document.getElementById("navbar").style.top = "-80px";
        }
        prevScrollpos = currentScrollPos;
      };
    }
  }
};
</script>

<style scoped></style>
