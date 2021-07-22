<template>
  <section class="other-projects">
    <div
      v-observe-visibility="{ callback: isViewableNow, once: true }"
      :class="{
        'visible animate__animated animate__fadeInUp visible': showAnimation,
        invisible: !showAnimation
      }"
    >
      <h2 class="other-projects__heading">Some Other Projects</h2>
      <ul class="other-projects__grid">
        <ProjectCard
          :project="project"
          v-for="(project, index) in projects"
          :key="index"
        ></ProjectCard>
      </ul>
    </div>
  </section>
</template>

<script>
import ProjectCard from "../project-card/ProjectCard";
import visibility from "../../mixins/visibility";
export default {
  name: "OtherProjects",
  components: { ProjectCard },
  mixins: [visibility],
  data: () => {
    return {
      projects: [
        {
          id: 1,
          title: "Movie Review Sentiment Analyzer",
          description:
            "An NLP model which can predict the sentiment of a movie review.",
          techList: ["Tensorflow", "Python"],
          github: "https://github.com/saaranshM/movie-review-sentiment-analysis"
        },
        {
          id: 2,
          title: "Task Manager API",
          description:
            "A Task manager app built using with Node, Express and MonogoDb. This api includes authentication and per each user take management.",
          techList: ["Node.js", "Express", "MongoDb"],
          github: "https://github.com/saaranshM/task-manager-node-api"
        },
        {
          id: 3,
          title: "Gostore Storefront",
          description:
            "A storefront for sellers whose stores were created using the <a href='https://xenonshop.in' id='inline-link' target='_blank'  class='inline-link' >Xenonshop</a> app.",
          techList: ["Vue", "Firebase"],
          url: "https://gostore.app/dailyshop/home"
        },
        {
          id: 4,
          title: "Portfolio Website",
          description:
            "A Portfolio website explaining my experience and skills.",
          techList: ["Vue", "Sass"],
          url: "https://saaranshmenon.me/",
          github: "https://github.com/saaranshM/Portfolio-Website"
        },
        {
          id: 5,
          title: "Phishing Website Detector",
          description:
            "A Machine leaning model which predicts if the given url is a phishing url or not.",
          techList: ["Scikit-Learn", "Python", "Requests"],
          url:
            "https://share.streamlit.io/saaranshm/phishing-website-detector-streamlit/app.py",
          github: "https://github.com/saaranshM/movie-review-sentiment-analysis"
        },
        {
          id: 6,
          title: "Breast Cancer Detector Api",
          description:
            "The breast cancer detector model deployed as an API on Heroku.",
          techList: ["Flask", "Tensorflow", "OpenCV"],
          github: "https://github.com/saaranshM/breast-cancer-detector-flask"
        }
      ]
    };
  }
};
</script>

<style scoped></style>
