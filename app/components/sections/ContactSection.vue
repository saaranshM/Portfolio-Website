<script setup lang="ts">
import { profile } from '~/data/profile'

/**
 * ContactSection — "04 // OPEN CHANNEL".
 * Narrow centered column: heading, display-size lede, two short sentences
 * (profile.contactBlurb), then the big [ SEND TRANSMISSION ] mailto CTA.
 */
const { target, revealed } = useReveal()
</script>

<template>
  <section
    id="contact"
    ref="target"
    class="contact content-section"
    :class="{ 'is-revealed': revealed }"
    aria-labelledby="contact-heading"
  >
    <div class="contact__inner">
      <SectionHeading
        id="contact-heading"
        class="contact__heading"
        index="04"
        title="OPEN CHANNEL"
        :revealed="revealed"
      />

      <p class="contact__lede t-display reveal-item" style="--reveal-delay: 200ms">
        Open a channel.
      </p>

      <p
        v-for="(line, i) in profile.contactBlurb"
        :key="i"
        class="contact__copy reveal-item"
        :style="{ '--reveal-delay': `${260 + i * 60}ms` }"
      >
        {{ line }}
      </p>

      <HudCta
        class="contact__cta reveal-item"
        :style="{ '--reveal-delay': `${260 + profile.contactBlurb.length * 60}ms` }"
        :href="`mailto:${profile.email}`"
      >
        [ SEND TRANSMISSION ]
      </HudCta>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/tokens' as t;

.contact__inner {
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
}

.contact__heading {
  justify-content: center;
  margin-bottom: t.$space-6;
}

.contact__lede {
  font-size: clamp(2.4rem, 3.4vw, 3.2rem);
  margin: 0 auto t.$space-4;
}

.contact__copy {
  margin: 0 auto t.$space-3;
}

.contact__cta {
  margin-top: t.$space-5;
}
</style>
