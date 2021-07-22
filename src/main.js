import Vue from "vue";
import "animate.css";
import App from "./App.vue";
import VueTypedJs from "vue-typed-js";
import VueObserveVisibility from "vue-observe-visibility";
import VScrollLock from "v-scroll-lock";
import router from "./router";
import VueScrollTo from "vue-scrollto";

Vue.use(VueObserveVisibility);
Vue.use(VScrollLock);

Vue.use(VueScrollTo, {
  container: "body",
  duration: 1000,
  easing: "ease",
  offset: 0,
  force: true,
  cancelable: true,
  onStart: false,
  onDone: false,
  onCancel: false,
  x: false,
  y: true
});

Vue.config.productionTip = false;

Vue.use(VueTypedJs);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
