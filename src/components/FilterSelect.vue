<template>
  <div class="filter-select w-full flex flex-col items-center">
    <label :for="id" class="block mb-2 text-base font-semibold tracking-wide" :class="isDark ? 'text-white' : 'text-gray-800'">{{ label }}</label>
    <div class="relative w-full">
      <button
        type="button"
        class="appearance-none w-full rounded-lg px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-colors duration-200 flex justify-between items-center cursor-pointer"
        :class="isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-300'"
        @click="toggleDropdown"
        :aria-expanded="open"
        :aria-controls="id + '-dropdown'"
      >
        <span>
          {{ selectedLabel }}
        </span>
        <span :class="isDark ? 'ml-2 text-gray-300' : 'ml-2 text-gray-400'">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </button>
      <ul
        v-if="open"
        :id="id + '-dropdown'"
        class="absolute left-0 mt-2 w-full rounded-lg shadow-lg z-50 max-h-60 overflow-auto border"
        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'"
      >
        <li
          class="px-4 py-2 cursor-pointer transition-colors"
          :class="[isDark ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100', { 'font-semibold': modelValue === '' } ]"
          @click="select('')"
        >
          {{ allLabel }}
        </li>
        <li
          v-for="option in options"
          :key="option"
          class="px-4 py-2 cursor-pointer transition-colors"
          :class="[isDark ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100', { 'font-semibold': modelValue === option } ]"
          @click="select(option)"
        >
          {{ option }}<span v-if="suffix">{{ suffix }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, computed, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
  id: String,
  label: String,
  allLabel: {
    type: String,
    default: 'All'
  },
  options: {
    type: Array as () => string[],
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  },
  isDark: {
    type: Boolean,
    default: false
  },
  suffix: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:modelValue'])
const { options, modelValue, isDark, id, label, allLabel, suffix } = toRefs(props)

const open = ref(false)

const selectedLabel = computed(() => {
  if (!modelValue.value) return allLabel.value
  const found = options.value.find(o => o === modelValue.value)
  return found ? found + (suffix.value || '') : allLabel.value
})

function toggleDropdown() {
  open.value = !open.value
}
function select(val: string) {
  emit('update:modelValue', val)
  open.value = false
}
function onClickOutside(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.filter-select')) {
    open.value = false
  }
}
onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>

<style scoped>
.filter-select label {
  font-weight: 600;
  letter-spacing: 0.01em;
}
.filter-select ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.filter-select li {
  user-select: none;
}
</style>
