<template>
  <div id="map" style="height: 100vh; width: 100vw; border-radius: 0; overflow: hidden; position: relative;">
    <MenuFab v-model="isDark" @toggle-theme="toggleTheme" />
    <div id="leaflet-map"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import MenuFab from '~/src/components/MenuFab/MenuFab.vue'

const isDark = ref(false)
let map: any = null
let tileLayer: any = null

const lightTile = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const darkTile = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const lightAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const darkAttr = '&copy; <a href="https://carto.com/attributions">CARTO</a>'

const toggleTheme = () => {
  if (tileLayer && map) {
    map.removeLayer(tileLayer)
    tileLayer = window.L.tileLayer(isDark.value ? darkTile : lightTile, {
      attribution: isDark.value ? darkAttr : lightAttr,
      maxZoom: 18,
    }).addTo(map)
  }
  // Tailwind dark mode toggle
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

onMounted(async () => {
  if (process.client) {
    const L = await import('leaflet')
    await import('leaflet/dist/leaflet.css')
    map = L.default.map('leaflet-map').setView([51.9225, 4.47917], 8)
    tileLayer = L.default.tileLayer(lightTile, {
      attribution: lightAttr,
      maxZoom: 18,
    }).addTo(map)
    L.default.marker([51.9225, 4.47917]).addTo(map)
      .bindPopup('Роттердам')
      .openPopup()
    window.L = L.default // for theme switching
  }
})

watch(isDark, toggleTheme)
</script>

<style scoped>
#map {
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  background: var(--map-bg, #fff);
}
#leaflet-map {
  height: 100vh;
  width: 100vw;
  z-index: 1;
}
</style>
<style>
body.dark-map {
  background: #181a1b !important;
}
</style>
