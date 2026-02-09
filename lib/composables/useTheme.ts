import { ref, watch } from 'vue'

// Make isDark a module-level singleton
const isDark = ref(false)
let initialized = false

function applyThemeToDocument(val: boolean) {
  if (val) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

function applyCSSVariables(isDarkMode: boolean) {
  try {
    if (isDarkMode) {
      document.documentElement.style.setProperty('--color-background', '#37353E')
      document.documentElement.style.setProperty('--color-surface', '#44444E')
      document.documentElement.style.setProperty('--color-text', '#D3DAD9')
    } else {
      document.documentElement.style.setProperty('--color-background', '#FBF3D1')
      document.documentElement.style.setProperty('--color-surface', '#DEDED1')
      document.documentElement.style.setProperty('--color-text', '#3f3c37')
    }
  } catch (e) {
    // ignore
  }
}

function syncInitTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyThemeToDocument(isDark.value)
  }
  // Apply CSS variables immediately on init
  applyCSSVariables(isDark.value)
}

export function useTheme() {
  // Only initialize on the client – avoid marking initialized during SSR
  if (!initialized && typeof window !== 'undefined') {
    syncInitTheme()
    watch(isDark, (val) => {
      applyThemeToDocument(val)
      applyCSSVariables(val)
    })
    initialized = true
  }
  return { isDark }
}
