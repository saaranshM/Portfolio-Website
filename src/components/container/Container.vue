<template>
  <div class="container">
    <Header></Header>
    <SidebarLeft></SidebarLeft>
    <SidebarRight></SidebarRight>
  </div>
</template>

<script>
import Header from "@/components/header/Header";
import SidebarLeft from "@/components/sidebar/SidebarLeft";
import SidebarRight from "@/components/sidebar/SidebarRight";
export default {
  name: "Container",
  components: { SidebarRight, SidebarLeft, Header }
};
</script>

<style scoped></style>
