<template>
  <div
    id="map"
    style="
      height: 100vh;
      width: 100vw;
      border-radius: 0;
      overflow: hidden;
      position: relative;
    "
  >
    <MenuFab
      v-model="selectedLayout"
      v-model:angleValue="selectedAngle"
      v-model:isDark="isDark"
      @toggle-theme="toggleTheme"
      @open-add-marker="showAddForm = true"
    />
    <AddMarkerFab @open="showAddForm = true" />
    <AddMarkerForm
      :show="showAddForm"
      :googleApiKey="googleApiKey"
      @close="showAddForm = false"
      @submit="handleAddMarker"
    />
    <SearchBar @select="onSearchSelect" />
    <div id="leaflet-map"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from "vue";
import MenuFab from "~/src/components/MenuFab/MenuFab.vue";
import SearchBar from "~/src/components/SearchBar.vue";
import AddMarkerFab from "~/src/components/AddMarkerFab.vue";
import AddMarkerForm from "~/src/components/AddMarkerForm.vue";
import { useTheme } from "~/lib/composables/useTheme";
import { useRuntimeConfig } from "#app";
import { useMarkers } from "~/lib/composables/useMarkers";
// markers will be loaded from Firebase (with local fallback)
import type { Marker } from "~/types";

const { isDark } = useTheme();
const runtimeConfig = useRuntimeConfig();
const googleApiKey: string = String(
  runtimeConfig.public?.googleMapsApiKey || "",
);

let map: any = null;
let tileLayer: any = null;
let markerList: any[] = [];

const selectedLayout = ref<string[]>([]);
const selectedAngle = ref("");
const showAddForm = ref(false);

// baseMarkers holds the original markers plus any added by the user
const baseMarkers = ref<Marker[]>([] as Marker[]);

const { markers: fetchedMarkers } = useMarkers();

const lightTile =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const darkTile =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const lightAttr = '&copy; <a href="https://carto.com/attributions">CARTO</a>';
const darkAttr = '&copy; <a href="https://carto.com/attributions">CARTO</a>';

const toggleTheme = () => {
  if (tileLayer && map) {
    map.removeLayer(tileLayer);
    tileLayer = window.L.tileLayer(isDark.value ? darkTile : lightTile, {
      attribution: isDark.value ? darkAttr : lightAttr,
      maxZoom: 18,
    }).addTo(map);
  }
};

const clearMarkers = () => {
  markerList.forEach((marker) => marker.remove());
  markerList = [];
};

// Move iconColor and iconStyle outside renderMarkers
const iconColor = "#444";
const iconStyle =
  "width:16px;height:16px;display:inline-block;vertical-align:middle;";

// Extract SVG marker icon generator
function getDropIconSvg(fill: string) {
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><g transform='rotate(180 16 16)'><path d='M16 4C16 4 8 14 8 20a8 8 0 1 0 16 0c0-6-8-16-8-16z' fill='${fill}'/></g></svg>`;
}

function getDropIcon(isDark: boolean) {
  return window.L.icon({
    iconUrl: getDropIconSvg(isDark ? "white" : "black"),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: "custom-drop-marker",
  });
}

// Use Marker type for marker data
const renderMarkers = (markers: Marker[]) => {
  if (!map) return;
  clearMarkers();
  const L = window.L;
  markerList = markers.map((data) => {
    const webIcon = data.website
      ? `<a href="${data.website}" target="_blank" rel="noopener" title="Website" style="margin-right:6px;${iconStyle}"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" stroke="${iconColor}" stroke-width="2"/><path d="M10 1v18M1 10h18M3.5 3.5c2 2 11 2 13 0M3.5 16.5c2-2 11-2 13 0" stroke="${iconColor}" stroke-width="1.2"/></svg></a>`
      : "";
    const instaIcon = data.instagram
      ? `<a href="${data.instagram}" target="_blank" rel="noopener" title="Instagram" style="${iconStyle}"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="14" height="14" rx="4" stroke="${iconColor}" stroke-width="2"/><circle cx="10" cy="10" r="3.5" stroke="${iconColor}" stroke-width="1.2"/><circle cx="14.2" cy="5.8" r="1" fill="${iconColor}"/></svg></a>`
      : "";
    const popupHtml = `
      <div style=\"min-width:180px;\">
        <div style=\"font-weight:bold;font-size:1.1em;\">${data.title}</div>
        <hr style=\"margin:8px 0 6px 0; border:none; border-top:1px solid #e5e7eb;\" />
        <div style=\"margin-top:2px;\">${Array.isArray(data.layout) && data.layout.length > 1 ? "Layouts" : "Layout"}: ${data.layout.join(", ")}</div>
        <div style=\"margin-top:6px;\">Angle: ${data.angle.map((a: string) => a + "°").join(", ")}</div>
        <div style=\"margin-top:10px;display:flex;align-items:center;gap:4px;\">${webIcon}${instaIcon}</div>
      </div>
    `;
    return L.marker(data.coords as [number, number], {
      icon: getDropIcon(isDark.value),
    })
      .addTo(map)
      .bindPopup(popupHtml);
  });
};

const filterMarkers = () => {
  let filtered = baseMarkers.value;
  if (Array.isArray(selectedLayout.value) && selectedLayout.value.length > 0) {
    filtered = filtered.filter((m) =>
      m.layout.some((l: string) => selectedLayout.value.includes(l)),
    );
  }
  if (selectedAngle.value) {
    filtered = filtered.filter((m) => m.angle.includes(selectedAngle.value));
  }
  renderMarkers(filtered);
};

function handleAddMarker(marker: Marker) {
  baseMarkers.value.push(marker);
  filterMarkers();
}

watch([selectedLayout, selectedAngle], filterMarkers);

// when fetched markers change populate baseMarkers
watch(
  fetchedMarkers,
  (v) => {
    baseMarkers.value = Array.isArray(v) ? v.slice() : [];
    filterMarkers();
  },
  { immediate: true },
);

onMounted(async () => {
  if (process.client) {
    const L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    map = L.default.map("leaflet-map").setView([51.9225, 4.47917], 8);
    tileLayer = L.default
      .tileLayer(isDark.value ? darkTile : lightTile, {
        attribution: isDark.value ? darkAttr : lightAttr,
        maxZoom: 18,
      })
      .addTo(map);
    window.L = L.default; // for theme switching
    // Move zoom control to bottom right
    map.zoomControl.setPosition("bottomright");
    renderMarkers(baseMarkers.value);
    // Слежение за темой для смены цвета маркеров
    watch(isDark, (val) => {
      markerList.forEach((marker) =>
        marker.setIcon(
          window.L.icon({
            iconUrl: getDropIconSvg(val ? "white" : "black"),
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            className: "custom-drop-marker",
          }),
        ),
      );
    });
  }
});

watch(isDark, toggleTheme);

function onSearchSelect(marker: any) {
  if (!map || !window.L) return;
  const targetZoom = 14;
  // Always use flyTo to guarantee centering and smooth animation
  map.flyTo(marker.coords, targetZoom, { animate: true });
  // Find the marker instance by coords
  setTimeout(() => {
    const found = markerList.find((m) => {
      const latlng = m.getLatLng();
      return latlng.lat === marker.coords[0] && latlng.lng === marker.coords[1];
    });
    if (found) {
      found.openPopup();
    }
  }, 500); // Wait for flyTo animation to finish
}
</script>

<style scoped>
#map {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  background: var(--color-background);
}
#leaflet-map {
  height: 100vh;
  width: 100vw;
  z-index: 1;
}
</style>
<style>
body.dark-map {
  background: var(--color-background) !important;
}

.leaflet-control-attribution {
  visibility: hidden;
}
</style>
