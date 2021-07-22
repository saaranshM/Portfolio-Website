<template>
  <div id="sidenav" class="sidenav">
    <nav>
      <ol class="sidenav__list">
        <li class="sidenav__item">
          <span>01. </span>
          <a v-scroll-to="'#about'" href="#about">About</a>
        </li>
        <li class="sidenav__item">
          <span>02. </span>
          <a v-scroll-to="'#skills'" href="#skills">Skills</a>
        </li>
        <li class="sidenav__item">
          <span>03. </span>
          <a v-scroll-to="'#projects'" href="#projects">Projects</a>
        </li>
        <li class="sidenav__item">
          <span>04. </span>
          <a v-scroll-to="'#contact'" href="#contact">Contact</a>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script>
export default {
  name: "Sidenav"
};
</script>

<style scoped></style>
