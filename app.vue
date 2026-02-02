<template>
  <NuxtPage />
  <ToastContainer />
</template>

<script setup lang="ts">
// Root app now delegates to page components via Nuxt routing
import ToastContainer from '~/src/components/ToastContainer.vue'
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
