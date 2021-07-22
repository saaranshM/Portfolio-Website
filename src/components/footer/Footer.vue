<template>
  <footer class="footer">
    <div>
      <ul class="footer__icons">
        <li class="footer__list">
          <a href="https://github.com/saaranshM" target="_blank">
            <SvgIcon class="footer__icon" name="github"></SvgIcon
          ></a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/in/saaransh-sunil-menon/"
            target="_blank"
          >
            <SvgIcon class="footer__icon" name="linkedin"></SvgIcon
          ></a>
        </li>

        <li class="footer__list">
          <a href="https://www.instagram.com/saaransh_28/" target="_blank">
            <SvgIcon class="footer__icon" name="insta"></SvgIcon
          ></a>
        </li>
        <li class="footer__list">
          <a href="https://twitter.com/saaransh_28" target="_blank">
            <SvgIcon class="footer__icon" name="twitter"></SvgIcon
          ></a>
        </li>
        <li class="footer__list">
          <a href="https://saaransh-menon2000.medium.com/" target="_blank">
            <SvgIcon class="footer__icon medium-icon" name="medium"></SvgIcon
          ></a>
        </li>
      </ul>
      <div class="footer__main">Made with <span>♥</span> by me.</div>
      <div class="footer__sub">
        Design inspired by
        <a
          href="https://brittanychiang.com/"
          target="_blank"
          class="underlined-link"
          :style="'--bottom: 0'"
          >brittanychiang.com</a
        >
      </div>
    </div>
  </footer>
</template>

<script>
import SvgIcon from "../common/SvgIcon";
export default {
  name: "Footer",
  components: { SvgIcon }
};
</script>

<style scoped></style>
