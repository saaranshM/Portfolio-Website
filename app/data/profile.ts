import type { Profile } from './types'

export const profile: Profile = {
  name: 'Saaransh Menon',
  role: 'Tech Lead @ Mosambee',
  roleLine: 'TECH LEAD // FULL-STACK + NLP',
  heroIntro:
    'Parked on the glass bridge above a quiet skirmish in deep space. I build production web systems and NLP pipelines — calm interfaces over a lot of moving machinery.',
  // TODO(saaransh): review bio wording
  bio: [
    'I got into programming through machine-learning experiments — training a CNN to read breast-tissue scans, teaching scripts to judge movie reviews. Building interfaces for those models is what pulled me into the web, and the web is where I stayed: Vue, Node, real products in front of real people.',
    'These days I’m a Tech Lead at Mosambee in Mumbai, building payment technology that has to work every single time. After hours I’m back in the lab with NLP — most recently a hybrid entity-extraction pipeline that fuses GLiNER zero-shot models with fuzzy matching to pull structure out of messy social-media text.',
  ],
  contactBlurb: [
    'I’m always up for interesting problems — full-stack products, NLP pipelines, or something stranger in between.',
    'The inbox is open; transmissions usually get a reply within a day or two.',
  ],
  // TODO(saaransh): confirm contact email — GitHub profile shows a different work email; old site used saaransh.dev2811@gmail.com
  email: 'saaransh.dev2811@gmail.com',
  location: 'Mumbai, India',
  avatar: '/img/me.jpg',
  // TODO(saaransh): drop the new resume PDF into public/resume.pdf
  resumeUrl: '/resume.pdf',
  stats: [
    { label: 'YRS', value: '05+' },
    { label: 'REPOS', value: '27' },
    { label: 'ROLE', value: 'TECH LEAD' },
  ],
}
