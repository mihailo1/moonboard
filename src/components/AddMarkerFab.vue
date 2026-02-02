<template>
  <div v-if="mounted">
    <!-- Desktop FAB (visible on sm and up) -->
    <button
      :class="[ 'hidden sm:flex items-center justify-center w-14 h-14 rounded-full shadow-lg fixed left-6 bottom-6 z-[1098] cursor-pointer', isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800', !canSubmit ? (isDark ? 'opacity-60 bg-gray-700 text-gray-400' : 'opacity-60 bg-gray-100 text-gray-400') : '' ]"
      @click="handleOpen"
      aria-label="Add marker"
      :aria-disabled="!canSubmit"
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
      :class="[ 'sm:hidden flex items-center justify-center w-16 h-16 rounded-full shadow-lg fixed left-6 bottom-24 z-[1098] cursor-pointer', isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800', !canSubmit ? (isDark ? 'opacity-60 bg-gray-700 text-gray-400' : 'opacity-60 bg-gray-100 text-gray-400') : '' ]"
      @click="handleOpen"
      aria-label="Add marker"
      :aria-disabled="!canSubmit"
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

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useTheme } from '~/lib/composables/useTheme'
import { getSubmitCountToday } from '~/src/composables/useSubmitQuota'
import showToast from '~/src/composables/useToast'
const emit = defineEmits(['open'])

const { isDark } = useTheme()
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const submitCount = ref(getSubmitCountToday())
const onQuotaChange = (e: any) => {
  submitCount.value = e?.detail?.count ?? getSubmitCountToday()
}

onMounted(() => {
  window.addEventListener('mb-submit-quota-changed', onQuotaChange as EventListener)
})
onBeforeUnmount(() => {
  window.removeEventListener('mb-submit-quota-changed', onQuotaChange as EventListener)
})

const canSubmit = computed(() => submitCount.value < 5)

function handleOpen() {
  if (!canSubmit.value) {
    showToast('You have reached 5 submits today. Please try again tomorrow.', 'error')
    return
  }
  // emit open
  emit('open')
}
// Emits 'open'
</script>

<style scoped>
/* Desktop only (hidden on small screens) - Tailwind utilities used in template */
</style>
