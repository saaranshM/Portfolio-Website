import type { NavItem, SocialLink } from './types'

export const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    icon: 'simple-icons:github',
    url: 'https://github.com/saaranshM',
  },
  {
    name: 'LinkedIn',
    icon: 'simple-icons:linkedin',
    url: 'https://www.linkedin.com/in/saaransh-sunil-menon/',
  },
  {
    name: 'Twitter',
    icon: 'simple-icons:x',
    url: 'https://twitter.com/saaransh_28',
  },
  // TODO(saaransh): confirm the Medium account is still active
  {
    name: 'Medium',
    icon: 'simple-icons:medium',
    url: 'https://saaransh-menon2000.medium.com',
  },
  {
    name: 'Instagram',
    icon: 'simple-icons:instagram',
    url: 'https://www.instagram.com/saaransh_28/',
  },
]

export const navItems: NavItem[] = [
  { label: 'ABOUT', anchor: '#about', index: '01' },
  { label: 'SYSTEMS', anchor: '#systems', index: '02' },
  { label: 'MISSIONS', anchor: '#missions', index: '03' },
  { label: 'CONTACT', anchor: '#contact', index: '04' },
]
