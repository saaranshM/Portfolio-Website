<template>
  <header class="header">
    <SvgIcon class="header__logo" name="colored-logo"></SvgIcon>
    <nav class="navigation">
      <ul class="navigation__list">
        <li class="navigation__item">
          <span class="navigation__number">01.</span
          ><a href="#" class="navigation__link">About</a>
        </li>
        <li class="navigation__item">
          <span class="navigation__number">02.</span>
          <a href="#" class="navigation__link">Projects</a>
        </li>
        <li class="navigation__item">
          <span class="navigation__number">03.</span
          ><a href="#" class="navigation__link">Experience</a>
        </li>
        <li class="navigation__item">
          <span class="navigation__number">04.</span
          ><a href="#" class="navigation__link">Contact</a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
import SvgIcon from "@/components/common/SvgIcon";
export default {
  name: "Header",
  components: { SvgIcon }
};
</script>

<style scoped></style>
