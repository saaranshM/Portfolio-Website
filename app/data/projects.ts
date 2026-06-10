import type { Project } from './types'

/** MISSION LOGS — 4 featured dossiers, rendered in order. */
export const featuredProjects: Project[] = [
  {
    slug: 'instagram-comment-analyzer',
    title: 'Instagram Comment Analyzer',
    description:
      'Hybrid NER pipeline that extracts entities from Instagram comments — GLiNER zero-shot models fused with fuzzy matching for robust real-world text.',
    tech: ['Python', 'GLiNER', 'NLP'],
    github: 'https://github.com/saaranshM/instagram-comment-analyzer',
    // TODO(saaransh): add a screenshot to app/assets/img/projects/ and set `image`
  },
  {
    slug: 'vue-account-manager',
    title: 'Vue Account Manager',
    // TODO(saaransh): expand description — what does the account manager actually do?
    description: 'Account management tool with a Vue front end.',
    tech: ['Vue', 'JavaScript'],
    github: 'https://github.com/saaranshM/vue-account-manager',
    // TODO(saaransh): add a screenshot to app/assets/img/projects/ and set `image`
  },
  {
    slug: 'node-chat-app',
    title: 'Live Chat App With Rooms',
    description:
      'Real-time chat with named users and rooms, built on Node.js, Express and Socket.io.',
    tech: ['Node.js', 'Express', 'Socket.io'],
    github: 'https://github.com/saaranshM/node-chat-app',
    // TODO(saaransh): old Heroku liveUrl is dead — redeploy somewhere or leave SRC-only
    image: '/img/projects/chat-app.jpg',
  },
  {
    slug: 'breast-cancer-detector',
    title: 'Breast Cancer Detector',
    description:
      'CNN that classifies breast-tissue images, served through a Streamlit web app.',
    tech: ['TensorFlow', 'OpenCV', 'Python', 'Streamlit'],
    github: 'https://github.com/saaranshM/breast-cancer-detector-streamlit-app',
    // TODO(saaransh): verify the Streamlit share deployment is still live
    liveUrl:
      'https://share.streamlit.io/saaranshm/breast-cancer-detector-streamlit-app/app.py',
    image: '/img/projects/breast-cancer.jpg',
  },
]

/** HANGAR BAY — 6 smaller craft, rendered in order as CRAFT-01…06. */
export const otherProjects: Project[] = [
  {
    slug: 'expense-tracker',
    title: 'Expense Tracker',
    description:
      'Full-stack expense tracker — log income and spending in a JavaScript client backed by a Node.js API, and watch the balance update live.',
    tech: ['JavaScript', 'Node.js'],
    // TODO(saaransh): confirm client + server repo names (expense-tracker-client / -server?)
    github: 'https://github.com/saaranshM/expense-tracker-client',
  },
  {
    slug: 'contact-manager',
    title: 'Contact Manager',
    description:
      'CRUD contact book with React on the screen and Redux running the show — every add, edit and delete flows through a single store.',
    tech: ['React', 'Redux'],
    github: 'https://github.com/saaranshM/contactmanager-react-redux',
  },
  {
    slug: 'movie-review-sentiment-analyzer',
    title: 'Movie Review Sentiment Analyzer',
    description:
      'TensorFlow model trained on labelled movie reviews that reads a review and calls it: positive or negative.',
    tech: ['Python', 'TensorFlow', 'NLP'],
    github: 'https://github.com/saaranshM/movie-review-sentiment-analysis',
  },
  {
    slug: 'phishing-website-detector',
    title: 'Phishing Website Detector',
    description:
      'Scikit-Learn classifier that flags phishing URLs from website features, wrapped in a Streamlit app for instant checks.',
    tech: ['Python', 'Scikit-Learn', 'Streamlit'],
    // TODO(saaransh): confirm exact repo name for the phishing detector
    github: 'https://github.com/saaranshM/phishing-website-detector',
  },
  {
    slug: 'node-weather-app',
    title: 'Node Weather App',
    description:
      'Server-rendered weather lookup that chains geocoding and forecast APIs to turn any address into a live forecast.',
    tech: ['Node.js', 'APIs'],
    github: 'https://github.com/saaranshM/node-weather-app',
  },
  {
    slug: 'next-demo-app',
    title: 'Next.js Demo App',
    description:
      'Small Next.js application built to explore file-based routing and data fetching, deployed on Vercel.',
    tech: ['Next.js', 'React'],
    github: 'https://github.com/saaranshM/next--demo-app',
    liveUrl: 'https://next-demo-app-self.vercel.app',
  },
]
