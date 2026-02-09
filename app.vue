<template>
  <NuxtPage />
  <ToastContainer />
</template>

<script setup lang="ts">
// Root app now delegates to page components via Nuxt routing
import ToastContainer from '~/src/components/ToastContainer.vue'
// Ensure theme is initialized early on client
if (typeof window !== 'undefined') {
  // lazy import to avoid SSR issues
  import('~/lib/composables/useTheme').then((m) => {
    try { m.useTheme(); } catch (e) { /* ignore */ }
  }).catch(() => {});
}
</script>

<style>
html,
body,
#__nuxt {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
