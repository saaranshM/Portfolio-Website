<template>
  <div class="container">
    <Header></Header>
    <!--    <Sidenav></Sidenav>-->
    <SidebarLeft></SidebarLeft>
    <SidebarRight></SidebarRight>
    <Main></Main>
    <AboutMe></AboutMe>
    <Skills></Skills>
    <Projects></Projects>
    <OtherProjects></OtherProjects>
    <ContactUs></ContactUs>
    <Footer></Footer>
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
import ContactUs from "../contact/Contact";
import Skills from "../skills/Skills";
import Footer from "../footer/Footer";
import Sidenav from "../sidenav/Sidenav";
export default {
  name: "Container",
  components: {
    Footer,
    Skills,
    ContactUs,
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
