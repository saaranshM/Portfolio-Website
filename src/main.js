import Vue from "vue";
import "animate.css";
import App from "./App.vue";
import VueTypedJs from "vue-typed-js";
import VueObserveVisibility from "vue-observe-visibility";

Vue.use(VueObserveVisibility);

Vue.config.productionTip = false;

Vue.use(VueTypedJs);

new Vue({
  render: h => h(App)
}).$mount("#app");
