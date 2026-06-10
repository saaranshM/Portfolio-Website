<template>
  <span class="tech-tag t-mono-sm"><slot /></span>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

// Small mono chip — outline only, no fill. t-mono-sm is 1.2rem (12px floor).
.tech-tag {
  display: inline-block;
  padding: t.$space-1 t.$space-2;
  border: 1px solid t.$cyan-dim;
  border-radius: 2px;
  color: t.$ice-dim;
  white-space: nowrap;
}
</style>
