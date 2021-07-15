<template>
  <div class="container">
    <Header></Header>
    <SidebarLeft></SidebarLeft>
  </div>
</template>

<script>
import Header from "@/components/header/Header";
import SidebarLeft from "@/components/sidebar/SidebarLeft";
export default {
  name: "Container",
  components: { SidebarLeft, Header }
};
</script>

<style scoped></style>
