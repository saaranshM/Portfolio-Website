<template>
  <main class="notfound">
    <transition
      appear
      appear-active-class="animate__animated animate__jackInTheBox"
    >
      <div>
        <h1 class="notfound__heading">404</h1>
        <h2 class="notfound__text">Page Not Found</h2>
        <router-link class="neon-button" style="padding: 1.5rem" to="/"
          >Go home</router-link
        >
      </div>
    </transition>
  </main>
</template>

<script>
export default {
  name: "Page404"
};
</script>

<style scoped></style>
