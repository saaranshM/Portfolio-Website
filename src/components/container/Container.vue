<template>
  <div v-if="!loading" class="container">
    <Header></Header>
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
  <transition v-else leave-active-class="animate__animated animate__fadeOut">
    <LoadingPage></LoadingPage>
  </transition>
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
import LoadingPage from "../loading-page/LoadingPage";
export default {
  name: "Container",
  data: () => {
    return {
      loading: true
    };
  },
  components: {
    LoadingPage,
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
  },
  mounted() {
    setTimeout(() => {
      this.loading = false;
    }, 3500);
  }
};
</script>

<style scoped></style>
