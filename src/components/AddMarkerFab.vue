<template>
  <!-- Desktop FAB (visible on sm and up) -->
  <button
    class="hidden sm:flex items-center justify-center w-14 h-14 rounded-full shadow-lg fixed left-6 bottom-6 z-[1200] bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
    @click="$emit('open')"
    aria-label="Add marker"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>

  <!-- Mobile FAB (visible only on small screens), match menu toggle size/styling and positioned higher to avoid overlap -->
  <button
    class="sm:hidden flex items-center justify-center w-16 h-16 rounded-full shadow-lg fixed left-6 bottom-24 z-[1210] bg-white text-gray-800 dark:bg-gray-800 dark:text-white"
    @click="$emit('open')"
    aria-label="Add marker"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
// Emits 'open'
</script>

<style scoped>
/* Desktop only (hidden on small screens) - Tailwind utilities used in template */
</style>
