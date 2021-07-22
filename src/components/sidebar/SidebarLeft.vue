<template>
  <div class="sidebar-left">
    <transition appear appear-active-class="sidebar-left-animation">
      <ul class="sidebar-left__icons">
        <li class="sidebar-left__list">
          <a href="https://github.com/saaranshM" target="_blank">
            <SvgIcon class="sidebar-left__icon" name="github"></SvgIcon
          ></a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/in/saaransh-sunil-menon/"
            target="_blank"
          >
            <SvgIcon class="sidebar-left__icon" name="linkedin"></SvgIcon
          ></a>
        </li>

        <li class="sidebar-left__list">
          <a href="https://www.instagram.com/saaransh_28/" target="_blank">
            <SvgIcon class="sidebar-left__icon" name="insta"></SvgIcon
          ></a>
        </li>
        <li class="sidebar-left__list">
          <a href="https://twitter.com/saaransh_28" target="_blank">
            <SvgIcon class="sidebar-left__icon" name="twitter"></SvgIcon
          ></a>
        </li>
        <li class="sidebar-left__list">
          <a href="https://saaransh-menon2000.medium.com/" target="_blank">
            <SvgIcon
              class="sidebar-left__icon medium-icon"
              name="medium"
            ></SvgIcon
          ></a>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
import SvgIcon from "@/components/common/SvgIcon";
export default {
  name: "SidebarLeft",
  components: { SvgIcon }
};
</script>

<style scoped></style>
