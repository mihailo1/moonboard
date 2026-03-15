<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center p-0 sm:p-4"
  >
    <div
      class="absolute inset-0 bg-black opacity-40"
      @click="$emit('close')"
    ></div>
    <form
      @submit.prevent="onSubmit"
      :class="[
        'relative z-10 w-full max-w-full sm:max-w-md p-6',
        // full-screen on small devices, modal on larger screens
        'h-full sm:h-auto rounded-none sm:rounded-lg p-0 sm:p-6 max-h-[100vh] sm:max-h-[90vh] overflow-auto',
        // remove heavy shadow/frame on mobile, keep on larger screens
        'sm:shadow-lg',
        isDark ? 'bg-gray-800' : 'bg-white',
      ]"
    >
      <h3
        :class="[
          'text-lg font-semibold mb-4 flex justify-center ',
          isDark ? 'text-white' : 'text-gray-900',
        ]"
      >
        Add Marker
      </h3>
      <div class="grid gap-3">
        <label
          :class="[
            'block text-base font-semibold tracking-wide',
            isDark ? 'text-white' : 'text-gray-800',
          ]"
          >
          Google Maps URL
          <span :class="isDark ? 'text-red-400 ml-1' : 'text-red-500 ml-1'" aria-hidden="true">*</span>
          <input
            v-model="googleUrl"
            @input="onUrlInput"
            class="w-full rounded-lg px-3 py-2 mt-1 border transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0"
            :class="[
              isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
              urlError
                ? 'border-red-500 ring-1 ring-red-300'
                : isDark
                  ? 'border-gray-700'
                  : 'border-gray-300',
            ]"
            placeholder="https://maps.app.goo.gl/..."
            :aria-invalid="!!urlError"
            :aria-describedby="urlError ? 'url-error' : undefined"
            aria-required="true"
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
            <span v-if="parsedCity || parsedCountry"> · {{ [parsedCity, parsedCountry].filter(Boolean).join(', ') }}</span>
            <span v-if="reverseGeocoding" class="ml-1 opacity-60">…</span>
          </div>
        </label>
        <div>
          <MultiFilterSelect
            id="add-layouts"
            :label="'Layouts'"
            :required="true"
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
            :required="true"
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
        <!-- Google Maps URL required explicitly in admin mode -->
        <label
          v-if="bypassQuota"
          :class="[
            'block text-base font-semibold tracking-wide',
            isDark ? 'text-white' : 'text-gray-800',
          ]"
        >
          Coordinates
          <span :class="isDark ? 'text-red-400 ml-1' : 'text-red-500 ml-1'" aria-hidden="true">*</span>
          <div class="flex gap-2 mt-1">
            <input
              v-model="lat"
              type="text"
              placeholder="Latitude"
              class="w-1/2 rounded-lg px-3 py-2 border transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0"
              :class="[
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
                coordsError
                  ? 'border-red-500 ring-1 ring-red-300'
                  : isDark ? 'border-gray-700' : 'border-gray-300',
              ]"
              :aria-invalid="!!coordsError"
            />
            <input
              v-model="lng"
              type="text"
              placeholder="Longitude"
              class="w-1/2 rounded-lg px-3 py-2 border transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0"
              :class="[
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
                coordsError
                  ? 'border-red-500 ring-1 ring-red-300'
                  : isDark ? 'border-gray-700' : 'border-gray-300',
              ]"
              :aria-invalid="!!coordsError"
            />
          </div>
          <div v-if="coordsError" class="text-sm text-red-500 mt-0.5">{{ coordsError }}</div>
        </label>

        <label
          :class="[
            'block text-base font-semibold tracking-wide',
            isDark ? 'text-white' : 'text-gray-800',
          ]"
          >Website
          <input
            v-model="website"
            class="w-full rounded-lg px-3 py-2 mt-1 border transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0"
            :class="
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-800'
            "
          />
        </label>
        <label
          :class="[
            'block text-base font-semibold tracking-wide',
            isDark ? 'text-white' : 'text-gray-800',
          ]"
          >Instagram
          <input
            v-model="instagram"
            class="w-full rounded-lg px-3 py-2 mt-1 border transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0"
            :class="
              isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-800'
            "
          />
        </label>
        <label
          :class="[
            'block text-base font-semibold tracking-wide',
            isDark ? 'text-white' : 'text-gray-800',
          ]"
        >
          Author
          <input
            v-model="author"
            @input="onAuthorInput"
            class="w-full rounded-lg px-3 py-2 mt-1 border transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0"
            :class="[
              isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
              authorError
                ? 'border-red-500 ring-1 ring-red-300'
                : isDark ? 'border-gray-700' : 'border-gray-300',
            ]"
            :aria-invalid="!!authorError"
            :aria-describedby="authorError ? 'author-error' : undefined"
          />
          <div v-if="authorError" id="author-error" class="text-sm text-red-500 mt-0.5">
            {{ authorError }}
          </div>
        </label>
      </div>
      <div class="mt-4 w-full flex flex-col sm:flex-row sm:justify-end items-center gap-3">
        <button
          type="button"
          :class="[
            'w-full sm:w-auto px-4 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-0 cursor-pointer',
            isDark
              ? 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
              : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50',
          ]"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <div class="flex flex-col items-end w-full sm:w-auto">
          <div v-if="submitError" class="text-sm text-red-500 mb-2">
            {{ submitError }}
          </div>
          <button
            type="submit"
            :disabled="submitting || resolving || reverseGeocoding"
            tabindex="0"
            :aria-disabled="submitting || resolving || reverseGeocoding"
            :class="[
              'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 border-[0.5px] cursor-pointer',
              (submitting || resolving || reverseGeocoding)
                ? 'opacity-70 cursor-not-allowed pointer-events-none'
                : isDark
                  ? 'bg-white text-gray-800 border-white hover:bg-gray-200 active:shadow-inner'
                  : 'bg-gray-800 text-white border-gray-800 hover:bg-gray-700 active:shadow-inner',
            ]"
            @keydown.enter.prevent="onSubmit"
            @keydown.space.prevent="onSubmit"
          >
            <svg v-if="resolving || reverseGeocoding" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            <span v-if="submitting">{{ isEditing ? 'Saving…' : 'Submitting…' }}</span>
            <span v-else-if="resolving || reverseGeocoding">Parsing…</span>
            <span v-else>{{ isEditing ? 'Save' : 'Submit' }}</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from "vue";
import showToast from '~/src/composables/useToast'
import { incrementSubmitCount, canSubmitToday } from '~/src/composables/useSubmitQuota'
import { useTheme } from "~/lib/composables/useTheme";
import type { Marker } from "~/types";
import MultiFilterSelect from "~/src/components/MultiFilterSelect.vue";
import { useMarkers } from "~/lib/composables/useMarkers";
import { useRuntimeConfig } from "#app";
import { useAuth } from "~/lib/composables/useAuth";
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
  // 'proposed' (default) posts to proposedMarkers, 'markers' posts to markers
  target: { type: String, default: 'proposed' },
  // when true, skip public submit quota checks (admin usage)
  bypassQuota: { type: Boolean, default: false },
  // initial object to prefill the form when editing
  initial: { type: Object as () => any, default: null },
  // explicit editing id (overrides initial.id)
  editingId: { type: String, default: '' },
});
const emit = defineEmits(["close", "submit"]);

// True when editing an existing entry (drives Save vs Submit label)
const isEditing = computed(() => !!(props.editingId || (props.initial && (props.initial.id || props.initial.key))))

const title = ref("");
const lat = ref("");
const lng = ref("");
const selectedLayouts = ref<string[]>([]);
const selectedAngles = ref<string[]>([]);
const website = ref("");
const instagram = ref("");
const author = ref("");
const { isDark } = useTheme();
const { getIdToken } = useAuth();
// Google Maps URL parsing state
const googleUrl = ref("");
const parsedTitle = ref("");
const parsedLat = ref("");
const parsedLng = ref("");
// Reverse geocode state
const parsedCity = ref("");
const parsedCountry = ref("");
const reverseGeocoding = ref(false);
// per-field errors for consistent styling
const urlError = ref("");
const layoutsError = ref("");
const anglesError = ref("");
const authorError = ref("");
const coordsError = ref("");

function isUrl(value: string): boolean {
  return /https?:\/\/|www\./i.test(value.trim());
}

/**
 * Strip query-string (and hash) from a URL, keeping origin + pathname only.
 * Returns the original string unchanged if it can't be parsed as a URL.
 */
function cleanUrl(raw: string): string {
  if (!raw) return raw;
  const trimmed = raw.trim();
  try {
    const u = new URL(trimmed);
    // origin + pathname, normalised (no trailing query/hash)
    const clean = u.origin + u.pathname;
    // remove any trailing slash that wasn't in the original, except root
    return clean.endsWith('/') && u.pathname !== '/' ? clean.replace(/\/$/, '') : clean;
  } catch {
    return trimmed;
  }
}

function onAuthorInput() {
  if (!props.bypassQuota && isUrl(author.value)) {
    authorError.value = "Please enter a name, not a URL.";
  } else {
    authorError.value = "";
  }
}
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

// Prefill when editing
function prefillFromInitial() {
  const init = props.initial;
  if (!init) return;
  // marker-style coords may be array or object
  if (Array.isArray(init.coords)) {
    lat.value = String(init.coords[0] ?? "");
    lng.value = String(init.coords[1] ?? "");
  } else if (init.coords && typeof init.coords === 'object') {
    lat.value = String(init.coords.lat ?? init.coords[0] ?? "");
    lng.value = String(init.coords.lng ?? init.coords[1] ?? "");
  }
  title.value = init.title || "";
  selectedLayouts.value = Array.isArray(init.layout) ? init.layout.slice() : (init.layout ? String(init.layout).split(",").map(s=>s.trim()).filter(Boolean) : []);
  selectedAngles.value = Array.isArray(init.angle) ? init.angle.map((a:any)=>String(a)) : (init.angle ? String(init.angle).split(",").map(s=>s.trim()).filter(Boolean) : []);
  website.value = init.website || "";
  instagram.value = init.instagram || "";
  author.value = init.author || "";
  // Restore city/country from stored data so they survive round-trips
  parsedCity.value = init.city || "";
  parsedCountry.value = init.country || "";
  // If initial has URL, populate googleUrl
  if (init.url || init.gmapsUrl) googleUrl.value = init.url || init.gmapsUrl || "";
}

// Watch for initial changes (when admin opens edit modal)
watch(() => props.initial, () => {
  if (props.initial) prefillFromInitial();
});

// Also prefill on mount if already provided
if (props.initial) prefillFromInitial();

const onEscClose = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    emit("close");
  }
};

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
  parsedCity.value = "";
  parsedCountry.value = "";
  resolving.value = true;
  try {
    // Always try the server-side resolver: it handles both short URLs (redirects)
    // and long URLs (HTML scraping for high-precision coords).
    const serverResult = await resolveViaServer(url);
    if (serverResult) {
      // Use server-scraped parsed data when available (higher precision)
      if (serverResult.parsed?.lat) {
        parsedLat.value = serverResult.parsed.lat;
        parsedLng.value = serverResult.parsed.lng || "";
        if (serverResult.parsed.title) parsedTitle.value = serverResult.parsed.title;
        lat.value = parsedLat.value;
        lng.value = parsedLng.value;
      } else {
        // Server returned finalUrl but no coords in parsed — try client-side parsing
        parseGoogleMapsUrl(serverResult.finalUrl);
      }
      if (!parsedLat.value && !parsedLng.value) {
        urlError.value = "Could not extract coordinates from URL.";
      } else {
        urlError.value = "";
      }
    } else {
      // Server unavailable — fall back to purely client-side parsing
      const shortHostPattern = /(^|:\/\/)(maps.app.goo.gl|goo\.gl|goo\.gl\/maps)/i;
      if (shortHostPattern.test(url)) {
        urlError.value = "Could not resolve short Google Maps URL. Please paste the full Maps URL (Share → Copy link).";
      } else {
        try {
          parseGoogleMapsUrl(url);
        } catch (e) {
          urlError.value = "Could not parse URL";
        }
      }
    }
  } finally {
    resolving.value = false;
  }
  // Kick off reverse geocode once coords are known
  if (parsedLat.value && parsedLng.value) {
    fetchReverseGeocode(parsedLat.value, parsedLng.value);
  }
}

/** Calls the server-side resolver which follows redirects and scrapes HTML. */
async function resolveViaServer(url: string): Promise<{ finalUrl: string; parsed: { lat?: string; lng?: string; title?: string } } | null> {
  try {
    const res = await fetch("/api/resolve-map-url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success && data.finalUrl) {
      return { finalUrl: data.finalUrl, parsed: data.parsed || {} };
    }
  } catch {
    // ignore — fall through to null
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
    // Populate manual lat/lng inputs so admin coordinate fields show parsed values
    lat.value = parsedLat.value;
    lng.value = parsedLng.value;
  }
}

async function fetchReverseGeocode(latVal: string, lngVal: string) {
  parsedCity.value = "";
  parsedCountry.value = "";
  reverseGeocoding.value = true;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latVal}&lon=${lngVal}&format=json&accept-language=en`,
    );
    if (!res.ok) return;
    const data = await res.json();
    parsedCity.value = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.municipality || "";
    parsedCountry.value = data?.address?.country || "";
  } catch {
    // silently ignore — city/country is best-effort
  } finally {
    reverseGeocoding.value = false;
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
const anglesOptions = computed(() => {
  const raw = (markers.value || []).flatMap((m: any) => m.angle || []);
  // normalize to strings to avoid duplicates like 40 and '40', then dedupe
  const normalized = raw.map((v: any) => String(v).trim());
  const unique = Array.from(new Set(normalized));
  // sort numerically when possible
  unique.sort((a, b) => Number(a) - Number(b));
  return unique;
});

// (cancelStyle removed) Cancel styles handled via responsive classes so hover works in light theme

watch(
  () => props.show,
  (v) => {
    if (v) {
      window.addEventListener("keydown", onEscClose);
    } else {
      window.removeEventListener("keydown", onEscClose);
    }
    if (!v) {
      // reset fields when closed
      title.value = "";
      lat.value = "";
      lng.value = "";
      googleUrl.value = "";
      parsedTitle.value = "";
      parsedLat.value = "";
      parsedLng.value = "";
      parsedCity.value = "";
      parsedCountry.value = "";
      // parseError removed; ensure parse-related fields cleared via specific refs
      if (urlResolveTimer) {
        clearTimeout(urlResolveTimer);
        urlResolveTimer = null;
      }
      selectedLayouts.value = [];
      selectedAngles.value = [];
      website.value = "";
      instagram.value = "";
      author.value = "";
      // clear field errors
      urlError.value = "";
      layoutsError.value = "";
      anglesError.value = "";
      authorError.value = "";
      coordsError.value = "";
    }
  },
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onEscClose);
});

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
  // Validate author field — no URLs allowed in public form
  if (!props.bypassQuota && isUrl(author.value)) {
    authorError.value = "Please enter a name, not a URL.";
    return;
  } else {
    authorError.value = "";
  }

  // prefer parsed coords from Google Maps URL, fallback to manual lat/lng
  const latitude = parsedLat.value
    ? parseFloat(parsedLat.value)
    : parseFloat(lat.value);
  const longitude = parsedLng.value
    ? parseFloat(parsedLng.value)
    : parseFloat(lng.value);
  const titleText = parsedTitle.value || title.value || "";

  // Admin forms: require coordinates and Google Maps URL explicitly
  if (props.bypassQuota) {
    const manualLat = parseFloat(lat.value);
    const manualLng = parseFloat(lng.value);
    const hasCoords = (parsedLat.value && parsedLng.value) ||
      (!Number.isNaN(manualLat) && !Number.isNaN(manualLng));
    if (!hasCoords) {
      coordsError.value = "Please provide valid coordinates (latitude and longitude).";
      return;
    } else {
      coordsError.value = "";
    }
    if (!googleUrl.value || !googleUrl.value.trim()) {
      urlError.value = "Please provide the Google Maps URL.";
      return;
    }
  }

  // Validate required fields: parsed coordinates, at least one layout and one angle, and a title
  if (!titleText || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    urlError.value = "Please provide a valid Google Maps URL";
    return;
  }
  // For proposed submissions, require the Google Maps URL (`gmapsUrl`)
  if (!props.bypassQuota && props.target !== 'markers') {
    if (!googleUrl.value || !googleUrl.value.trim()) {
      urlError.value = 'Please provide the Google Maps share URL.';
      return;
    }
  }
  if (!selectedLayouts.value || selectedLayouts.value.length === 0) {
    layoutsError.value = "Please select at least one layout.";
    return;
  }
  if (!selectedAngles.value || selectedAngles.value.length === 0) {
    anglesError.value = "Please select at least one angle.";
    return;
  }
  // Clean URLs — strip tracking query params before storing
  const cleanGmapsUrl = googleUrl.value ? cleanUrl(googleUrl.value) : undefined;
  const cleanWebsite = website.value ? cleanUrl(website.value) : '';
  const cleanInstagram = instagram.value ? cleanUrl(instagram.value) : '';

  const marker: Marker = {
    coords: [latitude, longitude],
    title: titleText,
    layout: selectedLayouts.value.slice(),
    angle: selectedAngles.value.slice(),
    website: cleanWebsite,
    instagram: cleanInstagram,
    gmapsUrl: cleanGmapsUrl,
    ...(author.value.trim() ? { author: author.value.trim() } : {}),
    ...(parsedCity.value ? { city: parsedCity.value } : {}),
    ...(parsedCountry.value ? { country: parsedCountry.value } : {}),
  };

  // Build proposedMarker payload per required server schema
  const proposed = {
    url: cleanGmapsUrl || "",
    gmapsUrl: cleanGmapsUrl || '-',
    title: titleText,
    coords: { lat: latitude, lng: longitude },
    layout: selectedLayouts.value.slice(),
    angle: selectedAngles.value.map((a) => Number(a)),
    website: cleanWebsite || undefined,
    instagram: cleanInstagram || undefined,
    status: "pending",
    submittedAt: Date.now(),
    submittedBy: "anonymous",
    ...(author.value.trim() ? { author: author.value.trim() } : {}),
    ...(parsedCity.value ? { city: parsedCity.value } : {}),
    ...(parsedCountry.value ? { country: parsedCountry.value } : {}),
  };

  // quota check must happen before performing the DB write to avoid bypass
  if (!props.bypassQuota && props.target !== 'markers') {
    if (!canSubmitToday()) {
      showToast('You have reached 5 submits today. Please try again tomorrow.', 'error');
      return;
    }
  }

  submitting.value = true;
  submitError.value = "";
  try {
    const collection = props.target === 'markers' ? 'markers' : 'proposedMarkers';
    const editingKey = props.editingId || (props.initial && (props.initial.id || props.initial.key)) || '';
    const isEditing = !!editingKey;
    const baseEndpoint = isEditing
      ? `${dbUrl.replace(/\/$/, "")}/${collection}/${editingKey}.json`
      : `${dbUrl.replace(/\/$/, "")}/${collection}.json`;
    // attach auth token when available (admin users)
    const token = await getIdToken().catch(() => null);
    const endpoint = token ? `${baseEndpoint}?auth=${token}` : baseEndpoint;
    const method = isEditing ? 'PUT' : 'POST';
    const body = props.target === 'markers' ? marker : proposed;
    const r = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const resBody = await r.json().catch(()=>({}));
    if (!r.ok) {
      submitError.value = `Failed to submit: ${resBody.error || r.statusText}`;
      return;
    }
    // eslint-disable-next-line no-console
    console.log("Proposed marker uploaded, key=", resBody.name);

    // increment quota for public proposed submissions, skip when bypassQuota
    if (!props.bypassQuota && props.target !== 'markers') {
      if (!canSubmitToday()) {
        showToast('You have reached 5 submits today. Please try again tomorrow.', 'error')
        return
      }
      try { incrementSubmitCount() } catch (e) { /* ignore */ }
    }
    const toastMsg = props.target === 'markers'
      ? `${titleText} — Marker saved.`
      : `${titleText} — Thanks! Your submission will be reviewed and approved soon.`;
    showToast(toastMsg, 'success')
    // emit submit with id when available
    const returnedKey = resBody.name || editingKey || '';
    emit("submit", { ...marker, id: returnedKey });
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
