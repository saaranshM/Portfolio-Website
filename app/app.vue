<script setup lang="ts">
useHead({
  meta: [{ name: 'theme-color', content: '#030014' }],
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
