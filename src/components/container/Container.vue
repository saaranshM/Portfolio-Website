<template>
  <div class="container">
    <Header></Header>
    <SidebarLeft></SidebarLeft>
    <SidebarRight></SidebarRight>
    <Main></Main>
    <AboutMe></AboutMe>
    <Projects></Projects>
    <OtherProjects></OtherProjects>
  </div>
</template>

<script>
import Header from "@/components/header/Header";
import SidebarLeft from "@/components/sidebar/SidebarLeft";
import SidebarRight from "@/components/sidebar/SidebarRight";
import Main from "@/components/mian/Main";
import AboutMe from "../aboutme/AboutMe";
import Projects from "../projects/Projects";
import OtherProjects from "../other-projects/OtherProjects";
export default {
  name: "Container",
  components: {
    OtherProjects,
    Projects,
    AboutMe,
    Main,
    SidebarRight,
    SidebarLeft,
    Header
  }
};
</script>

<style scoped></style>
