<script setup lang="ts">
useHead({
  link: [
    // TODO(saaransh): confirm canonical domain before Phase 6 deploy
    { rel: 'canonical', href: 'https://saaranshmenon.me/' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
