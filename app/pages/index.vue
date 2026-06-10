<script setup lang="ts">
/**
 * Flight Deck — single-page composition.
 * Hero floats free over the scene; everything below sits inside
 * `.content-bands`, a subtle full-width scrim so body text never reads
 * raw against the starfield (§6 guardrail).
 */
useSeoMeta({
  description:
    'Saaransh Menon — Tech Lead building full-stack products and NLP systems.',
  ogTitle: 'Saaransh Menon — Tech Lead · Full-Stack + NLP',
  ogDescription:
    'Saaransh Menon — Tech Lead building full-stack products and NLP systems.',
  ogImage: '/og-image.png',
  ogUrl: SITE_URL,
  twitterCard: 'summary_large_image',
  twitterCreator: '@saaransh_28',
})
</script>

<template>
  <div>
    <HeroSection />

    <div class="content-bands">
      <AboutSection />
      <SkillsSection />
      <FeaturedProjects />
      <OtherProjects />
      <ContactSection />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// The scrim band behind every below-the-fold section. Inside <main>
// (z-content) the background simply paints behind the sections' panels —
// the z-scrim layer of the stack contract, fused to the content column.
.content-bands {
  position: relative;
  background: rgba(3, 0, 20, 0.35);
}
</style>
