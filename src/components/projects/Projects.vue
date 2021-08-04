<template>
  <section id="projects" class="projects">
    <div
      v-observe-visibility="{ callback: isViewableNow, once: true }"
      :class="{
        'visible animate__animated animate__fadeInUp visible': showAnimation,
        invisible: !showAnimation
      }"
    >
      <h2 class="numbered-heading">
        <span class="heading-number">03.</span>
        Projects I have done
      </h2>
      <ul class="projects__list">
        <li class="project" v-for="(project, index) in projects" :key="index">
          <div @click="goToProject(project.id)" class="project__content">
            <div>
              <p class="project__overline">Featured Project</p>
              <h3 class="project__title">
                <a
                  :id="'project-link-' + project.id"
                  :href="project.url ? project.url : project.github"
                  target="_blank"
                  class="project__link"
                  >{{ project.title }}</a
                >
              </h3>
              <div class="project__description">
                <p>
                  {{ project.description }}
                </p>
              </div>
              <ul class="project__tech-list">
                <li v-for="(tech, index) in project.techList" :key="index">
                  {{ tech }}
                </li>
              </ul>
              <div class="project__links">
                <a
                  class="project__icon"
                  v-if="project.github"
                  :href="project.github"
                  target="_blank"
                  @click.stop
                >
                  <SvgIcon name="github"></SvgIcon>
                </a>
                <a
                  class="project__icon"
                  target="_blank"
                  v-if="project.url"
                  :href="project.url"
                  @click.stop
                >
                  <SvgIcon name="linkto"></SvgIcon>
                </a>
              </div>
            </div>
          </div>
          <div class="project__image-content">
            <a
              :href="project.url ? project.url : project.github"
              target="_blank"
              class="project__image-link"
              @click.stop
            >
              <div class="project__image-wrapper">
                <img
                  :src="project.src"
                  alt="Breast Cancer Project"
                  class="project__image"
                />
              </div>
            </a>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import SvgIcon from "../common/SvgIcon";
import visibility from "../../mixins/visibility";
export default {
  name: "Projects",
  components: { SvgIcon },
  data: () => {
    return {
      projects: [
        {
          id: 1,
          src: require("../../assets/img/projects/breast-cancer.jpg"),
          title: "Breast Cancer Detector",
          description:
            "This web app takes in images of breast tissue and sends it over to a CNN model trained on tissue samples using tensorflow and is deployed as and api using flask on Heroku.",
          github:
            "https://github.com/saaranshM/breast-cancer-detector-streamlit-app",
          url:
            "https://share.streamlit.io/saaranshm/breast-cancer-detector-streamlit-app/app.py",
          techList: ["Tensorflow", "OpenCV", "Python"]
        },
        {
          id: 2,
          src: require("../../assets/img/projects/chat-app.jpg"),
          title: "Live Chat App With Rooms",
          description:
            "A chat app built using Node.js, Express and Socket.io. You can have a name and chat in different rooms.",
          github: "https://github.com/saaranshM/node-chat-app",
          url: "https://saaransh-node-chat-app.herokuapp.com/",
          techList: ["Node.js", "Express", "Socket.io"]
        },
        {
          id: 3,
          src: require("../../assets/img/projects/rps.jpg"),
          title: "Rock Paper Scissors Bot",
          description:
            "A bot with which you can play Rock Paper Scissors. It is built using OpenCV and Tensorflow. It detects your hand and plays its moves accordingly.",
          github: "https://github.com/saaranshM/rock-paper-scissors-tensorflow",
          techList: ["Tensorflow", "OpenCV", "Python"]
        }
      ]
    };
  },
  methods: {
    goToProject(id) {
      const width = window.innerWidth;
      if (width < 780) {
        document.getElementById("project-link-" + id).click();
      }
    }
  },
  mixins: [visibility]
};
</script>

<style scoped></style>
