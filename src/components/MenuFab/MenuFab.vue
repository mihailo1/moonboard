<template>
  <div class="absolute top-8 right-8 z-[1000] flex flex-col items-end">
    <button class="menu-fab-btn bg-white dark:bg-gray-800" @click="toggleMenu">
      <span :class="['menu-icon', { open: menuOpen }]">
      </span>
    </button>
    <transition name="menu-unfold">
      <div v-if="menuOpen" class="menu-fab-menu">
        <div class="theme-toggle">
          <span :class="['theme-toggle-span', { 'theme-toggle-span-active': !isDark }]">light</span>
          <label class="switch">
            <input type="checkbox" v-model="isDark" @change="$emit('toggle-theme', isDark)">
            <span class="slider"></span>
          </label>
          <span :class="['theme-toggle-span', { 'theme-toggle-span-active': isDark }]">dark</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue'
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'toggle-theme'])
const menuOpen = ref(false)
const isDark = ref(props.modelValue)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

onMounted(() => {
  // Синхронизация с localStorage и prefers-color-scheme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    // Если нет сохранённой темы — использовать системную
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
})

watch(() => props.modelValue, (val) => {
  isDark.value = val
})
watch(isDark, (val) => {
  emit('update:modelValue', val)
  if (val) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
})
</script>

<style scoped>
.menu-icon {
  /* Оставляем только стили для ::before и ::after */
  width: 32px;
  height: 4px;
  background: #222;
  border-radius: 2px;
  position: relative;
  transition: all 0.4s cubic-bezier(.68,-0.55,.27,1.55);
  display: block;
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
.switch input:checked + .slider {
  background-color: #232526;
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
  transition: transform 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.switch input:checked + .slider:before {
  transform: translateX(24px);
  background: #232526;
}
.menu-wrapper.dark .slider {
  background: #444;
}
.menu-wrapper.dark .slider:before {
  background: #fff;
}
</style>
