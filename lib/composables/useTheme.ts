import { ref, watch } from 'vue'

// Make isDark a module-level singleton
const isDark = ref(false)
let initialized = false

function syncInitTheme() {
  if (typeof window === 'undefined') return
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

export function useTheme() {
  if (!initialized) {
    syncInitTheme()
    watch(isDark, (val) => {
      if (val) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    })
    initialized = true
  }
  return { isDark }
}
