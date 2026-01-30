<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[1300] flex items-center justify-center"
  >
    <div
      class="absolute inset-0 bg-black opacity-40"
      @click="$emit('close')"
    ></div>
    <form
      @submit.prevent="onSubmit"
      :class="[
        'relative z-10 rounded-lg shadow-lg w-full max-w-md p-6',
        isDark ? 'bg-gray-800' : 'bg-white',
      ]"
    >
      <h3
        :class="[
          'text-lg font-semibold mb-4',
          isDark ? 'text-white' : 'text-gray-900',
        ]"
      >
        Add Marker
      </h3>
      <div class="grid gap-3">
        <label
          :class="[
            'block mb-2 text-base font-semibold tracking-wide',
            isDark ? 'text-white' : 'text-gray-800',
          ]"
          >Google Maps URL
          <input
            v-model="googleUrl"
            @input="onUrlInput"
            class="w-full rounded-lg px-3 py-2 mt-1 border transition-colors"
            :class="[
              isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
              urlError
                ? 'border-red-500 ring-1 ring-red-300'
                : isDark
                  ? 'border-gray-700'
                  : 'border-gray-300',
            ]"
            placeholder="https://www.google.com/maps/place/..."
            :aria-invalid="!!urlError"
            :aria-describedby="urlError ? 'url-error' : undefined"
          />
          <div
            v-if="urlError"
            id="url-error"
            class="text-sm text-red-500 mt-0.5"
          >
            {{ urlError }}
          </div>
          <div
            v-else-if="parsedLat && parsedLng"
            class="text-sm text-gray-600 dark:text-gray-300 mt-0.5"
          >
            Parsed: <strong>{{ parsedTitle || "—" }}</strong> ({{ parsedLat }},
            {{ parsedLng }})
          </div>
        </label>
        <div>
          <MultiFilterSelect
            id="add-layouts"
            :label="'Layouts'"
            :options="layoutsOptions"
            :modelValue="selectedLayouts"
            @update:modelValue="onUpdateLayoutsClear"
            :isDark="isDark"
            :selectAllOnMount="false"
            noneLabel="Select layout"
            :hasError="!!layoutsError"
          />
          <div v-if="layoutsError" class="text-sm text-red-500 mt-0.5">
            {{ layoutsError }}
          </div>
        </div>
        <div>
          <MultiFilterSelect
            id="add-angles"
            :label="'Angles'"
            :options="anglesOptions"
            :modelValue="selectedAngles"
            @update:modelValue="onUpdateAnglesClear"
            :isDark="isDark"
            suffix="°"
            :selectAllOnMount="false"
            noneLabel="Select angle"
            :hasError="!!anglesError"
          />
          <div v-if="anglesError" class="text-sm text-red-500 mt-0.5">
            {{ anglesError }}
          </div>
        </div>
        <label
          :class="[
            'block mb-2 text-base font-semibold tracking-wide',
            isDark ? 'text-white' : 'text-gray-800',
          ]"
          >Website
          <input
            v-model="website"
            class="w-full rounded-lg px-3 py-2 mt-1 border transition-colors"
            :class="
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-800'
            "
          />
        </label>
        <label
          :class="[
            'block mb-2 text-base font-semibold tracking-wide',
            isDark ? 'text-white' : 'text-gray-800',
          ]"
          >Instagram
          <input
            v-model="instagram"
            class="w-full rounded-lg px-3 py-2 mt-1 border transition-colors"
            :class="
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-800'
            "
          />
        </label>
      </div>
      <div class="mt-4 flex justify-end items-center gap-3">
        <button
          type="button"
          class="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <div class="flex flex-col items-end">
          <div v-if="submitError" class="text-sm text-red-500 mb-2">
            {{ submitError }}
          </div>
          <button
            type="submit"
            :disabled="submitting"
            :class="[
              'px-4 py-2 rounded-lg text-white shadow-sm',
              submitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700',
            ]"
          >
            <span v-if="submitting">Submitting…</span>
            <span v-else>Add</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useTheme } from "~/lib/composables/useTheme";
import type { Marker } from "~/types";
import MultiFilterSelect from "~/src/components/MultiFilterSelect.vue";
import { useMarkers } from "~/lib/composables/useMarkers";
import { useRuntimeConfig } from "#app";
const { markers } = useMarkers();
const runtimeConfig = useRuntimeConfig();
const dbUrl: string = String(
  runtimeConfig.public?.firebaseDatabaseUrl ||
    process.env.NUXT_PUBLIC_FIREBASE_DB ||
    "https://moon-30159-default-rtdb.europe-west1.firebasedatabase.app",
);

const submitting = ref(false);
const submitError = ref("");
const props = defineProps({
  show: { type: Boolean, default: false },
  googleApiKey: { type: String, default: "" },
});
const emit = defineEmits(["close", "submit"]);

const title = ref("");
const lat = ref("");
const lng = ref("");
const selectedLayouts = ref<string[]>([]);
const selectedAngles = ref<string[]>([]);
const website = ref("");
const instagram = ref("");
const { isDark } = useTheme();
// Google Maps URL parsing state
const googleUrl = ref("");
const parsedTitle = ref("");
const parsedLat = ref("");
const parsedLng = ref("");
// per-field errors for consistent styling
const urlError = ref("");
const layoutsError = ref("");
const anglesError = ref("");
// Search state
const searchQuery = ref("");
const suggestions = ref<any[]>([]);
const openSuggestions = ref(false);
let searchTimer: any = null;
let urlResolveTimer: any = null;
const focusedIndex = ref(-1);

const googleLoaded = ref(false);
let autocompleteService: any = null;
let placesService: any = null;
const resolving = ref(false);

function loadGooglePlaces(key: string) {
  return new Promise<void>((resolve, reject) => {
    if (
      (window as any).google &&
      (window as any).google.maps &&
      (window as any).google.maps.places
    ) {
      googleLoaded.value = true;
      autocompleteService = new (
        window as any
      ).google.maps.places.AutocompleteService();
      placesService = new (window as any).google.maps.places.PlacesService(
        document.createElement("div"),
      );
      return resolve();
    }
    if (!key) return reject(new Error("No Google API key"));
    const id = "google-maps-places";
    if (document.getElementById(id)) {
      const check = setInterval(() => {
        if (
          (window as any).google &&
          (window as any).google.maps &&
          (window as any).google.maps.places
        ) {
          clearInterval(check);
          googleLoaded.value = true;
          autocompleteService = new (
            window as any
          ).google.maps.places.AutocompleteService();
          placesService = new (window as any).google.maps.places.PlacesService(
            document.createElement("div"),
          );
          resolve();
        }
      }, 200);
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (
        (window as any).google &&
        (window as any).google.maps &&
        (window as any).google.maps.places
      ) {
        googleLoaded.value = true;
        autocompleteService = new (
          window as any
        ).google.maps.places.AutocompleteService();
        placesService = new (window as any).google.maps.places.PlacesService(
          document.createElement("div"),
        );
        resolve();
      } else {
        reject(new Error("Google loaded but places not available"));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function onSearchInput() {
  openSuggestions.value = true;
  focusedIndex.value = -1;
  if (searchTimer) clearTimeout(searchTimer);
  const q = searchQuery.value.trim();
  if (!q) {
    suggestions.value = [];
    return;
  }
  searchTimer = setTimeout(() => {
    // Try Google Places predictions when API key is provided, fallback to Nominatim
    const tryGoogle = async () => {
      if (!googleLoaded.value && props.googleApiKey) {
        try {
          await loadGooglePlaces(props.googleApiKey);
        } catch (e) {
          // ignore and fallback
        }
      }
      if (googleLoaded.value && autocompleteService) {
        autocompleteService.getPlacePredictions(
          { input: q, types: ["establishment"] },
          (preds: any[]) => {
            if (preds && preds.length) {
              suggestions.value = preds.map((p) => ({
                source: "google",
                place_id: p.place_id,
                display_name: p.description,
              }));
              return;
            }
            // fallback to nominatim
            fetch(
              `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(q)}`,
            )
              .then((r) => r.json())
              .then((data) => {
                suggestions.value = data || [];
              })
              .catch(() => {
                suggestions.value = [];
              });
          },
        );
      } else {
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(q)}`,
        )
          .then((r) => r.json())
          .then((data) => {
            suggestions.value = data || [];
          })
          .catch(() => {
            suggestions.value = [];
          });
      }
    };
    tryGoogle();
  }, 300);
}

function onUrlInput() {
  urlError.value = "";
  parsedTitle.value = "";
  parsedLat.value = "";
  parsedLng.value = "";
  const url = googleUrl.value.trim();
  if (!url) return;
  // Debounce resolution while user types
  if (urlResolveTimer) clearTimeout(urlResolveTimer);
  urlResolveTimer = setTimeout(() => {
    // attempt to resolve automatically
    resolveCurrentUrl().catch(() => {
      /* ignore */
    });
  }, 600);
}

async function resolveCurrentUrl() {
  const url = googleUrl.value.trim();
  if (!url) return;
  urlError.value = "";
  parsedTitle.value = "";
  parsedLat.value = "";
  parsedLng.value = "";
  resolving.value = true;
  try {
    const shortHostPattern =
      /(^|:\/\/)(maps.app.goo.gl|goo\.gl|goo\.gl\/maps)/i;
    if (shortHostPattern.test(url)) {
      const resolved = await resolveShortUrl(url);
      if (resolved) {
        parseGoogleMapsUrl(resolved);
      } else {
        urlError.value =
          "Could not resolve short Google Maps URL. Please paste the full Maps URL (Share → Copy link).";
      }
    } else {
      try {
        parseGoogleMapsUrl(url);
      } catch (e) {
        urlError.value = "Could not parse URL";
      }
    }
  } finally {
    resolving.value = false;
  }
}

async function resolveShortUrl(url: string) {
  // Use server-side resolver to avoid browser CORS issues. Falls back to client-side fetch if server fails.
  try {
    const res = await fetch("/api/resolve-map-url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success && data.finalUrl) return data.finalUrl;
  } catch (e) {
    // ignore and try client-side as last resort
  }
  try {
    const res2 = await fetch(url, { method: "GET", redirect: "follow" });
    if (res2 && (res2 as Response).url) return (res2 as Response).url;
  } catch (e) {
    // ignore
  }
  return null;
}

function parseGoogleMapsUrl(url: string) {
  // Try patterns: @lat,lng  | ll=lat,lng | !3dLAT!4dLNG
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    parsedLat.value = atMatch[1];
    parsedLng.value = atMatch[2];
  }
  const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!parsedLat.value && llMatch) {
    parsedLat.value = llMatch[1];
    parsedLng.value = llMatch[2];
  }
  const dMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (!parsedLat.value && dMatch) {
    parsedLat.value = dMatch[1];
    parsedLng.value = dMatch[2];
  }
  const placeMatch = url.match(/\/place\/([^\/\?]+)/);
  if (placeMatch) {
    try {
      parsedTitle.value = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    } catch (e) {
      parsedTitle.value = placeMatch[1];
    }
  }
  if (!parsedLat.value || !parsedLng.value) {
    urlError.value = "Could not extract coordinates from URL.";
  } else {
    urlError.value = "";
  }
}

async function selectSuggestion(s: any) {
  if (s.source === "google") {
    searchQuery.value = s.display_name;
    if (!placesService && props.googleApiKey) {
      try {
        await loadGooglePlaces(props.googleApiKey);
      } catch (e) {
        /* ignore */
      }
    }
    if (placesService) {
      placesService.getDetails(
        { placeId: s.place_id },
        (place: any, status: any) => {
          if (place && place.geometry && place.geometry.location) {
            lat.value = String(place.geometry.location.lat());
            lng.value = String(place.geometry.location.lng());
          }
        },
      );
    }
  } else {
    searchQuery.value = s.display_name;
    lat.value = s.lat;
    lng.value = s.lon;
  }
  suggestions.value = [];
  openSuggestions.value = false;
}

function focusNext() {
  if (!suggestions.value.length) return;
  focusedIndex.value = Math.min(
    focusedIndex.value + 1,
    suggestions.value.length - 1,
  );
}
function focusPrev() {
  if (!suggestions.value.length) return;
  focusedIndex.value = Math.max(focusedIndex.value - 1, 0);
}
function selectFocused() {
  if (focusedIndex.value >= 0 && suggestions.value[focusedIndex.value]) {
    selectSuggestion(suggestions.value[focusedIndex.value]);
  }
}

const layoutsOptions = computed(() =>
  Array.from(
    new Set((markers.value || []).flatMap((m: any) => m.layout || [])),
  ),
);
const anglesOptions = computed(() =>
  Array.from(new Set((markers.value || []).flatMap((m: any) => m.angle || []))),
);

watch(
  () => props.show,
  (v) => {
    if (!v) {
      // reset fields when closed
      title.value = "";
      lat.value = "";
      lng.value = "";
      googleUrl.value = "";
      parsedTitle.value = "";
      parsedLat.value = "";
      parsedLng.value = "";
      // parseError removed; ensure parse-related fields cleared via specific refs
      if (urlResolveTimer) {
        clearTimeout(urlResolveTimer);
        urlResolveTimer = null;
      }
      selectedLayouts.value = [];
      selectedAngles.value = [];
      website.value = "";
      instagram.value = "";
      // clear field errors
      urlError.value = "";
      layoutsError.value = "";
      anglesError.value = "";
    }
  },
);

function onUpdateLayouts(val: string[]) {
  selectedLayouts.value = Array.isArray(val) ? val : [];
}
function onUpdateAngles(val: string[]) {
  selectedAngles.value = Array.isArray(val) ? val : [];
}
// Clear field errors when user changes selections
function onUpdateLayoutsClear(val: string[]) {
  onUpdateLayouts(val);
  layoutsError.value = "";
}
function onUpdateAnglesClear(val: string[]) {
  onUpdateAngles(val);
  anglesError.value = "";
}

async function onSubmit() {
  // prefer parsed coords from Google Maps URL, fallback to manual lat/lng
  const latitude = parsedLat.value
    ? parseFloat(parsedLat.value)
    : parseFloat(lat.value);
  const longitude = parsedLng.value
    ? parseFloat(parsedLng.value)
    : parseFloat(lng.value);
  const titleText = parsedTitle.value || title.value || "";
  // Validate required fields: parsed coordinates, at least one layout and one angle, and a title
  if (!titleText || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    urlError.value = "Please provide a valid Google Maps URL";
    return;
  }
  if (!selectedLayouts.value || selectedLayouts.value.length === 0) {
    layoutsError.value = "Please select at least one layout.";
    return;
  }
  if (!selectedAngles.value || selectedAngles.value.length === 0) {
    anglesError.value = "Please select at least one angle.";
    return;
  }
  const marker: Marker = {
    coords: [latitude, longitude],
    title: titleText,
    layout: selectedLayouts.value.slice(),
    angle: selectedAngles.value.slice(),
    website: website.value,
    instagram: instagram.value,
  };

  // Build proposedMarker payload per required server schema
  const proposed = {
    url: googleUrl.value || "",
    title: titleText,
    coords: { lat: latitude, lng: longitude },
    layout: selectedLayouts.value.slice(),
    angle: selectedAngles.value.map((a) => Number(a)),
    website: website.value || undefined,
    instagram: instagram.value || undefined,
    status: "pending",
    submittedAt: Date.now(),
    submittedBy: "anonymous",
  };

  submitting.value = true;
  submitError.value = "";
  try {
    const endpoint = `${dbUrl.replace(/\/$/, "")}/proposedMarkers.json`;
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposed),
    });
    const resBody = await r.json();
    if (!r.ok) {
      submitError.value = `Failed to submit: ${resBody.error || r.statusText}`;
      return;
    }
    // eslint-disable-next-line no-console
    console.log("Proposed marker uploaded, key=", resBody.name);

    // emit submit so the app can optimistically add the marker locally
    emit("submit", marker);
    emit("close");
  } catch (err: any) {
    submitError.value = err?.message || String(err);
    return;
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
/* simple form styles rely on tailwind utilities in template */
</style>
