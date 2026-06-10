/**
 * Flight Deck — content model.
 * ALL site copy lives in `app/data/*.ts`; components never hardcode content.
 * Unverified values carry a TODO marker on the line above — those markers
 * live in data files ONLY and are enumerated in the README "Content checklist".
 */

export interface Profile {
  name: string
  role: string
  /** Mono HUD role line, e.g. 'TECH LEAD // FULL-STACK + NLP'. */
  roleLine: string
  /** Bio paragraphs, rendered in order. */
  bio: string[]
  email: string
  location: string
  resumeUrl?: string
  /** Mono pull-stats for the PERSONNEL FILE panel (YRS / REPOS / ROLE). */
  stats: { label: string; value: string }[]
}

export interface Skill {
  name: string
  /** Honest ordinal on the 5-segment power cell — not a percentage. */
  level: 1 | 2 | 3 | 4 | 5
  note?: string
}

export interface SkillGroup {
  id: string
  /** Panel label, e.g. 'SYS.01 — FRONTEND ARRAY'. */
  label: string
  skills: Skill[]
}

export interface Project {
  slug: string
  title: string
  description: string
  tech: string[]
  github?: string
  liveUrl?: string
  /** Path under `app/assets/img/`, e.g. 'projects/chat-app.jpg'. */
  image?: string
}

export interface SocialLink {
  name: string
  /** Iconify id, e.g. 'simple-icons:github'. */
  icon: string
  url: string
}

export interface NavItem {
  label: string
  /** In-page anchor, e.g. '#about'. */
  anchor: string
  /** Mono nav index, '01'…'04'. */
  index: string
}
