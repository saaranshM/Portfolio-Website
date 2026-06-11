// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-06-10',

  modules: ['@nuxt/image', '@nuxt/fonts', '@nuxt/icon', '@vueuse/nuxt', '@tresjs/nuxt'],

  components: [
    // UI primitives, sections and site chrome are used bare (<HudPanel>,
    // <HeroSection>, <SideRails>), no folder prefix; each folder is ignored
    // in the default scan below so every component registers exactly once.
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components/sections', pathPrefix: false },
    { path: '~/components/site', pathPrefix: false },
    { path: '~/components', ignore: ['ui/**', 'sections/**', 'site/**'] },
  ],

  css: ['~/assets/scss/main.scss'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Saaransh Menon — Tech Lead · Full-Stack + NLP',
      meta: [
        { name: 'theme-color', content: '#030014' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ],
    },
  },

  nitro: {
    prerender: {
      routes: ['/'],
    },
  },

  typescript: {
    strict: true,
  },

  fonts: {
    families: [
      { name: 'Chakra Petch', weights: [500, 600, 700] },
      { name: 'Space Grotesk', weights: [400, 500] },
      { name: 'JetBrains Mono', weights: [400, 600] },
    ],
    defaults: { styles: ['normal'], subsets: ['latin'] },
  },
})
