import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App";
import Page404 from "./components/404/Page404";
import Container from "./components/container/Container";

Vue.use(VueRouter);

let router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  scrollBehavior(to, from) {
    return { x: 0, y: 0 };
  },
  routes: [
    {
      path: "/",
      name: "Home",
      component: Container
    },
    {
      path: "*",
      name: "404",
      component: Page404
    }
  ]
});

export default router;
