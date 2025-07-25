<template>
  <div v-if="mounted" :class="[isMobile ? 'fixed bottom-6 left-6 right-auto top-auto' : 'absolute top-6 right-6', 'z-[1099] flex flex-col items-end']">
    <button :class="['w-16 h-16 rounded-full cursor-pointer flex items-center justify-center shadow-lg transition border-none outline-none', isDark ? 'bg-gray-800' : 'bg-white']" @click="toggleMenu">
      <span :class="['menu-icon', { open: menuOpen }, isDark ? 'menu-icon-dark' : '']">
      </span>
    </button>
    <!-- Overlay for mobile when drawer is open -->
    <transition name="overlay-fade">
      <div v-if="isMobile && menuOpen" class="fixed inset-0 bg-transparent backdrop-blur-[1px] z-[1099]" @click="menuOpen = false" aria-label="Close drawer overlay"></div>
    </transition>
    <transition name="menu-unfold">
      <div v-if="menuOpen" :class="[isMobile ? 'fixed left-0 bottom-0 w-full h-[60vh] rounded-t-2xl shadow-2xl px-4 pt-4 pb-4 flex flex-col items-center z-[1100] menu-bottom-sheet' : 'menu-fab-menu mt-4 rounded-xl shadow-2xl px-8 pt-8 pb-6 min-w-[220px] flex flex-col items-center', isDark ? 'bg-gray-800' : 'bg-white']" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
        <div v-if="isMobile" class="w-full flex justify-center mb-6">
          <div
            class="w-12 h-4 flex items-center justify-center relative"
          >
            <button
              class="absolute left-0 top-[-14px] w-12 h-10 cursor-pointer z-10 bg-transparent border-none p-0"
              @click="menuOpen = false"
              aria-label="Close drawer"
            ></button>
            <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full pointer-events-none"></div>
          </div>
        </div>
        <div class="theme-toggle flex items-center gap-4 text-lg font-medium">
          <span :class="['theme-toggle-span text-gray-400 min-w-12 text-center transition-colors', { 'theme-toggle-span-active': !isDark, 'text-gray-900': !isDark, 'text-white': isDark }]">light</span>
          <label class="switch">
            <input type="checkbox" v-model="isDark" @change="$emit('toggle-theme', isDark)">
            <span class="slider" :class="{ 'slider-dark': isDark }"></span>
          </label>
          <span :class="['theme-toggle-span text-gray-400 min-w-12 text-center transition-colors', { 'theme-toggle-span-active': isDark, 'text-gray-900': isDark, 'text-white': isDark }]">dark</span>
        </div>
        <FilterSelect
          id="layout-select"
          :label="'Layout'"
          :allLabel="'All layouts'"
          :options="layouts"
          :modelValue="modelValue"
          @update:modelValue="$emit('update:modelValue', $event)"
          :isDark="isDark"
          class="mt-6"
        />
        <FilterSelect
          id="angle-select"
          :label="'Angle'"
          :allLabel="'All angles'"
          :options="angles"
          :modelValue="angleValue"
          @update:modelValue="$emit('update:angleValue', $event)"
          :isDark="isDark"
          suffix="°"
          class="mt-4"
        />
      </div>
  </transition>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTheme } from '~/lib/composables/useTheme'
import { markers } from '~/lib/markers'
import FilterSelect from "../FilterSelect.vue"

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  angleValue: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:modelValue', 'toggle-theme', 'update:angleValue'])

const { isDark } = useTheme()
const menuOpen = ref(false)
const mounted = ref(false)

const layouts = computed(() => {
  // Flatten all layouts and deduplicate
  const all = markers.flatMap(m => m.layout)
  return Array.from(new Set(all))
})
const angles = computed(() => {
  const all = markers.flatMap(m => m.angle)
  return Array.from(new Set(all))
})

onMounted(() => {
  mounted.value = true
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

// Mobile detection
const isMobile = ref(false)
if (typeof window !== 'undefined') {
  isMobile.value = window.matchMedia('(max-width: 640px)').matches
  window.addEventListener('resize', () => {
    isMobile.value = window.matchMedia('(max-width: 640px)').matches
  })
}

// Swipe-to-close logic for bottom sheet
let startY = 0
let currentY = 0
let sheetRef: HTMLElement | null = null
let swipeActive = false
const SWIPE_ZONE_HEIGHT = 32 // px
const onTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return
  if (!sheetRef) return
  const touchY = e.touches[0].clientY
  const rect = sheetRef.getBoundingClientRect()
  // Only activate swipe if touch starts in the top SWIPE_ZONE_HEIGHT px
  if (touchY - rect.top < SWIPE_ZONE_HEIGHT) {
    swipeActive = true
    startY = touchY
  } else {
    swipeActive = false
  }
}
const onTouchMove = (e: TouchEvent) => {
  if (!isMobile.value || !swipeActive) return
  currentY = e.touches[0].clientY
  const diff = currentY - startY
  if (diff > 0 && sheetRef) {
    sheetRef.style.transform = `translateY(${diff}px)`
  }
}
const onTouchEnd = () => {
  if (!isMobile.value || !swipeActive) return
  const diff = currentY - startY
  if (diff > 80) {
    menuOpen.value = false
  }
  if (sheetRef) {
    sheetRef.style.transform = ''
  }
  swipeActive = false
}

// Get ref to bottom sheet div
import { onUpdated, nextTick } from 'vue'
onUpdated(() => {
  if (isMobile.value && menuOpen.value) {
    nextTick(() => {
      sheetRef = document.querySelector('.menu-bottom-sheet')
    })
  }
})
</script>

<style scoped>
/* Overlay fade transition */
.overlay-fade-enter-active, .overlay-fade-leave-active {
  transition: opacity 0.25s;
}
.overlay-fade-enter-from, .overlay-fade-leave-to {
  opacity: 0;
}
.overlay-fade-enter-to, .overlay-fade-leave-from {
  opacity: 1;
}
.menu-icon {
  width: 32px;
  height: 4px;
  background: #222;
  border-radius: 2px;
  position: relative;
  transition: all 0.4s cubic-bezier(.68,-0.55,.27,1.55);
  display: block;
}
.menu-icon-dark {
  background: #fff;
}
.menu-icon::before, .menu-icon::after {
  content: '';
  position: absolute;
  width: 32px;
  height: 4px;
  background: #222;
  border-radius: 2px;
  transition: all 0.4s cubic-bezier(.68,-0.55,.27,1.55);
  left: 0;
}
.menu-icon-dark::before, .menu-icon-dark::after {
  background: #fff;
}
.menu-icon::before {
  top: -10px;
}
.menu-icon::after {
  top: 10px;
}
.menu-icon.open {
  background: transparent;
}
.menu-icon.open::before {
  transform: translateY(10px) rotate(45deg);
}
.menu-icon.open::after {
  transform: translateY(-10px) rotate(-45deg);
}
.switch {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 32px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #e0e0e0;
  border-radius: 32px;
  transition: background 0.3s;
}
.slider-dark {
  background-color: #e0e0e0;
}
.slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 4px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.3s, background 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.slider-dark:before {
  background-color: #333;
}
.switch input:checked + .slider:before {
  transform: translateX(24px);
}
.theme-toggle-span-active {
  font-weight: bold;
}
@media (max-width: 640px) {
  .menu-fab-menu {
    display: none !important;
  }
}
.menu-bottom-sheet {
  animation: bottom-sheet-in 0.25s cubic-bezier(.68,-0.55,.27,1.55);
  will-change: transform;
  touch-action: pan-y;
}
@keyframes bottom-sheet-in {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
