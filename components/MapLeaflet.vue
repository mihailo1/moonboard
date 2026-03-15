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
      v-model:countryValue="selectedCountry"
      v-model:cityValue="selectedCity"
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
const selectedCountry = ref("");
const prevCountry = ref("");
const selectedCity = ref("");
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
  "width:18px;height:18px;display:inline-block;vertical-align:middle;";

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
function isValidHttpsUrl(u: unknown) {
  if (!u || typeof u !== 'string') return false;
  try {
    const url = new URL(u);
    return url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Heroicons-style globe for website links
const WEB_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="${iconColor}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.038 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.038-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"/></svg>`;
// Clean Instagram icon
const INSTA_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="${iconColor}" stroke-width="1.7"/><circle cx="12" cy="12" r="4.5" stroke="${iconColor}" stroke-width="1.7"/><circle cx="17.8" cy="6.2" r="1.3" fill="${iconColor}"/></svg>`;
// Google Maps pin — outline style to match globe and Instagram
const GMAPS_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="${iconColor}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.2" stroke="${iconColor}" stroke-width="1.4"/></svg>`;

const renderMarkers = (markers: Marker[]) => {
  if (!map) return;
  clearMarkers();
  const L = window.L;
  markerList = markers.map((data) => {
    // Build popup DOM nodes instead of interpolated HTML to avoid XSS
    const container = document.createElement('div');
    container.style.minWidth = '180px';

    const titleDiv = document.createElement('div');
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.fontSize = '1.1em';
    titleDiv.textContent = String(data.title || '');
    container.appendChild(titleDiv);

    // City / country line
    const location = [(data as any).city, (data as any).country].filter(Boolean).join(', ');
    if (location) {
      const locationDiv = document.createElement('div');
      locationDiv.style.fontSize = '0.82em';
      locationDiv.style.color = '#6b7280';
      locationDiv.style.marginTop = '2px';
      locationDiv.textContent = location;
      container.appendChild(locationDiv);
    }

    const hr = document.createElement('hr');
    hr.style.margin = '8px 0 6px 0';
    hr.style.border = 'none';
    hr.style.borderTop = '1px solid #e5e7eb';
    container.appendChild(hr);

    const layoutDiv = document.createElement('div');
    layoutDiv.style.marginTop = '2px';
    const layoutArr = Array.isArray(data.layout) ? data.layout : [];
    layoutDiv.textContent = `${layoutArr.length > 1 ? 'Layouts' : 'Layout'}: ${layoutArr.join(', ')}`;
    container.appendChild(layoutDiv);

    const angleDiv = document.createElement('div');
    angleDiv.style.marginTop = '6px';
    const angleArr = Array.isArray(data.angle) ? data.angle : [];
    angleDiv.textContent = `Angle: ${angleArr.map((a: any) => String(a) + '°').join(', ')}`;
    container.appendChild(angleDiv);

    const linksDiv = document.createElement('div');
    linksDiv.style.marginTop = '10px';
    linksDiv.style.display = 'flex';
    linksDiv.style.alignItems = 'center';
    linksDiv.style.gap = '4px';

    if (data.website && isValidHttpsUrl(data.website)) {
      const a = document.createElement('a');
      a.href = String(data.website);
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = 'Website';
      a.style.cssText += iconStyle;
      a.innerHTML = WEB_SVG;
      linksDiv.appendChild(a);
    }
    if (data.instagram && isValidHttpsUrl(data.instagram)) {
      const a = document.createElement('a');
      a.href = String(data.instagram);
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = 'Instagram';
      a.style.cssText += iconStyle;
      a.innerHTML = INSTA_SVG;
      linksDiv.appendChild(a);
    }
    const gmapsUrl = (data as any).gmapsUrl;
    if (gmapsUrl && isValidHttpsUrl(gmapsUrl)) {
      const a = document.createElement('a');
      a.href = String(gmapsUrl);
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = 'Open in Google Maps';
      a.style.cssText += iconStyle;
      a.innerHTML = GMAPS_SVG;
      linksDiv.appendChild(a);
    }
    container.appendChild(linksDiv);

    return L.marker(data.coords as [number, number], {
      icon: getDropIcon(isDark.value),
    })
      .addTo(map)
      .bindPopup(container);
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
  if (selectedCountry.value) {
    filtered = filtered.filter((m) => (m as any).country === selectedCountry.value);
  }
  if (selectedCity.value) {
    filtered = filtered.filter((m) => (m as any).city === selectedCity.value);
  }
  renderMarkers(filtered);

  // If a country filter is active, zoom the map to fit all markers in that country.
  // This ensures users see the full extent of the selected country's markers.
  if (selectedCountry.value && map && filtered && filtered.length) {
    // Only animate when the selected country actually changes to avoid
    // repeated jumps while toggling other filters.
    if (selectedCountry.value !== prevCountry.value) {
      try {
        const L = window.L;
        const latlngs = filtered.map((m) => {
          const c = m.coords as any;
          return L.latLng(c[0], c[1]);
        });
        const bounds = L.latLngBounds(latlngs);
        // Prefer smooth flyToBounds when available, fallback to fitBounds.
        const opts = { padding: [48, 48], maxZoom: 14, animate: true } as any;
        if (typeof map.flyToBounds === "function") {
          map.flyToBounds(bounds, opts);
        } else {
          map.fitBounds(bounds, opts);
        }
      } catch (e) {
        // ignore any errors calculating bounds
      }
      prevCountry.value = selectedCountry.value;
    }
  } else {
    // clear previous country when filter cleared so next selection animates
    if (!selectedCountry.value) prevCountry.value = "";
  }
};

function handleAddMarker(marker: Marker) {
  baseMarkers.value.push(marker);
  filterMarkers();
}

watch([selectedLayout, selectedAngle, selectedCountry, selectedCity], filterMarkers);

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
