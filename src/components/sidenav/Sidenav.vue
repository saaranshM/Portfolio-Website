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
        <li class="sidenav__item">
          <a
            href="https://firebasestorage.googleapis.com/v0/b/vue-express-54b2e.appspot.com/o/RESUME%2FMy%20Resume.pdf?alt=media&token=2527058b-c6e7-416b-8290-240f8c2d7344"
            target="_blank"
            class="sidenav__resume"
            >Resume</a
          >
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
