<template>
  <div class="container">
    <Header></Header>
    <SidebarLeft></SidebarLeft>
    <SidebarRight></SidebarRight>
    <Main></Main>
    <AboutMe></AboutMe>
  </div>
</template>

<script>
import Header from "@/components/header/Header";
import SidebarLeft from "@/components/sidebar/SidebarLeft";
import SidebarRight from "@/components/sidebar/SidebarRight";
import Main from "@/components/mian/Main";
import AboutMe from "../aboutme/AboutMe";
export default {
  name: "Container",
  components: { AboutMe, Main, SidebarRight, SidebarLeft, Header }
};
</script>

<style scoped></style>
