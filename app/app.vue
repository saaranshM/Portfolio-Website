<script setup lang="ts">
import { profile } from '~/data/profile'
import { socialLinks } from '~/data/socials'

useHead({
  link: [
    // TODO(saaransh): confirm canonical domain before Phase 6 deploy
    { rel: 'canonical', href: `${SITE_URL}/` },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.name,
        jobTitle: profile.role,
        url: SITE_URL,
        sameAs: socialLinks.map((social) => social.url),
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Mumbai',
          addressCountry: 'IN',
        },
      }),
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
