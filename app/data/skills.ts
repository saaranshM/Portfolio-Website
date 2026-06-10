import type { SkillGroup } from './types'

// TODO(saaransh): adjust levels — honest ordinals on the 5-segment power cells, not percentages
export const skillGroups: SkillGroup[] = [
  {
    id: 'sys-01',
    label: 'SYS.01 — FRONTEND ARRAY',
    skills: [
      { name: 'Vue & Nuxt', level: 5 },
      { name: 'TypeScript & JavaScript', level: 5 },
      { name: 'HTML & CSS/SCSS', level: 5 },
      { name: 'React & Redux', level: 3 },
      { name: 'Next.js', level: 3 },
    ],
  },
  {
    id: 'sys-02',
    label: 'SYS.02 — BACKEND CORE',
    skills: [
      { name: 'Node.js', level: 4 },
      { name: 'Express', level: 4 },
      { name: 'MongoDB & NoSQL', level: 4 },
      { name: 'Firebase', level: 4 },
      { name: 'Socket.io', level: 3 },
    ],
  },
  {
    id: 'sys-03',
    label: 'SYS.03 — ML/NLP LAB',
    skills: [
      { name: 'Python', level: 4 },
      { name: 'NLP & NER (GLiNER)', level: 4 },
      { name: 'TensorFlow', level: 3 },
      { name: 'Scikit-Learn', level: 3 },
      { name: 'OpenCV', level: 3 },
    ],
  },
  {
    id: 'sys-04',
    label: 'SYS.04 — DEPLOY BAY',
    skills: [
      { name: 'Git & GitHub', level: 5 },
      { name: 'Firebase Hosting', level: 4 },
      { name: 'Vercel', level: 3 },
      { name: 'Streamlit & Flask', level: 3 },
      { name: 'Linux & CI', level: 3 },
    ],
  },
]
