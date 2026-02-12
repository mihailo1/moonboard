import { watch } from 'vue'
import { useTheme } from '~/lib/composables/useTheme'

export default defineNuxtPlugin(() => {
  if (process.client) {
    const { isDark } = useTheme()
    const LIGHT = '#d4dadc'
    const DARK = '#262626'

    function setColors(darkMode: boolean) {
      const color = darkMode ? DARK : LIGHT
      document.documentElement.style.setProperty('--statusbar-bg', color)
      const themeMeta = document.querySelector('meta[name="theme-color"]')
      if (themeMeta) themeMeta.setAttribute('content', color)
      const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
      if (appleMeta) appleMeta.setAttribute('content', darkMode ? 'black-translucent' : 'default')
    }

    // inject minimal styles to fill the safe-area (notch) area on iOS
    if (!document.getElementById('pwa-statusbar-style')) {
      const style = document.createElement('style')
      style.id = 'pwa-statusbar-style'
      style.innerHTML = `:root{--statusbar-bg:${isDark.value ? DARK : LIGHT};}
.pwa-statusbar-fill{position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top);background:var(--statusbar-bg);z-index:9999;pointer-events:none}
body{background-color:var(--statusbar-bg)}`
      document.head.appendChild(style)
    }

    // add a fill element so the status bar area shows the desired color
    if (!document.querySelector('.pwa-statusbar-fill')) {
      const fill = document.createElement('div')
      fill.className = 'pwa-statusbar-fill'
      document.body.appendChild(fill)
    }

    setColors(isDark.value)
    watch(isDark, (val) => setColors(val))
  }
})
