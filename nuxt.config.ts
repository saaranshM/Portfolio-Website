// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-06-10',

  modules: ['@nuxt/image', '@nuxt/fonts', '@nuxt/icon', '@vueuse/nuxt'],

  css: ['~/assets/scss/main.scss'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Saaransh Menon — Tech Lead · Full-Stack + NLP',
      meta: [
        { name: 'theme-color', content: '#030014' },
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
  },
})
