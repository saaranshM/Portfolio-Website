<template>
  <div class="sidebar-left">
    <transition appear appear-active-class="sidebar-left-animation">
      <ul class="sidebar-left__icons">
        <li class="sidebar-left__list">
          <a href="#">
            <SvgIcon class="sidebar-left__icon" name="github"></SvgIcon
          ></a>
        </li>
        <li>
          <a href="#">
            <SvgIcon class="sidebar-left__icon" name="linkedin"></SvgIcon
          ></a>
        </li>

        <li class="sidebar-left__list">
          <a href="#">
            <SvgIcon class="sidebar-left__icon" name="insta"></SvgIcon
          ></a>
        </li>
        <li class="sidebar-left__list">
          <a href="#">
            <SvgIcon class="sidebar-left__icon" name="twitter"></SvgIcon
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
