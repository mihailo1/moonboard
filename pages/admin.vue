<template>
  <div id="admin-root" class="min-h-screen transition-colors duration-200">
    <!-- Auth Loading -->
    <div v-if="!authInitialized" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading authentication...</p>
      </div>
    </div>

    <!-- Login Form -->
    <div v-else-if="!isAdmin" class="flex items-center justify-center min-h-screen px-4">
      <div class="w-full max-w-md">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div class="text-center mb-8">
            <h1 :class="['text-3xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900']">🌓 Admin</h1>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                v-model="email"
                type="email"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="admin@example.com"
                @keyup.enter="handleLogin"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                v-model="password"
                type="password"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="••••••••"
                @keyup.enter="handleLogin"
              />
            </div>

            <button
              @click="handleLogin"
              :disabled="loggingIn"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loggingIn ? 'Signing in...' : 'Sign In' }}
            </button>

            <div v-if="loginError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {{ loginError }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-else class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 :class="['text-3xl font-bold', isDark ? 'text-white' : 'text-gray-900']">Markers Admin</h1>
          <div class="flex items-center gap-3">
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg v-if="isDark" class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
              </svg>
              <svg v-else class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            </button>
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'markers'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'markers'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              ]"
            >
              Markers ({{ markersList.length }})
            </button>
            <button
              @click="activeTab = 'proposed'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'proposed'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              ]"
            >
              Proposed ({{ proposedList.length }})
            </button>
          </nav>
        </div>
      </div>

      <!-- Markers Tab -->
      <div v-if="activeTab === 'markers'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 :class="['text-xl font-semibold', isDark ? 'text-white' : 'text-gray-900']">Manage Markers</h2>
          <div class="flex gap-3">
            <button
              @click="loadMarkers"
              class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
            <button
              @click="openAddMarkerForm"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              + Add Marker
            </button>
          </div>
        </div>

        <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {{ error }}
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Coordinates</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Layout</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Angle</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="marker in markersList" :key="marker.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-6 py-4">
                    <div :class="['text-sm font-medium', isDark ? 'text-white' : 'text-gray-900']">{{ marker.title }}</div>
                    <div v-if="marker.website" class="text-xs text-blue-600 dark:text-blue-400 truncate max-w-xs">
                      <a :href="marker.website" target="_blank" class="hover:underline">{{ marker.website }}</a>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ Array.isArray(marker.coords) ? marker.coords[0] : marker.coords?.lat }},
                    {{ Array.isArray(marker.coords) ? marker.coords[1] : marker.coords?.lng }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div class="flex flex-wrap gap-1">
                      <span v-for="layout in (Array.isArray(marker.layout) ? marker.layout : (marker.layout ? [marker.layout] : []))" :key="layout" class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                        {{ layout }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ Array.isArray(marker.angle) ? marker.angle.join(', ') : (marker.angle ?? '') }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end items-center gap-2">
                      <button @click="editMarker(marker)" title="Edit" class="w-10 h-10 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                      <button @click="deleteMarker(marker)" :disabled="actioning[marker.id]" title="Delete" class="w-10 h-10 flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!markersList.length && !loading">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No markers found. Add your first marker!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Proposed Markers Tab (table like Markers) -->
      <div v-if="activeTab === 'proposed'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 :class="['text-xl font-semibold', isDark ? 'text-white' : 'text-gray-900']">Proposed Markers</h2>
          <div class="flex gap-3">
            <button @click="loadProposed" class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
            <button @click="openAddProposedForm" class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium">
              + Add Proposed
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Coordinates</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Layout</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Angle</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="p in proposedList" :key="p.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-6 py-4">
                    <div :class="['text-sm font-medium', isDark ? 'text-white' : 'text-gray-900']">{{ p.title }}</div>
                    <div v-if="p.website" class="text-xs text-blue-600 dark:text-blue-400 truncate max-w-xs">
                      <a :href="p.website" target="_blank" class="hover:underline">{{ p.website }}</a>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ Array.isArray(p.coords) ? p.coords[0] : p.coords?.lat }},
                    {{ Array.isArray(p.coords) ? p.coords[1] : p.coords?.lng }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div class="flex flex-wrap gap-1">
                      <span v-for="layout in (Array.isArray(p.layout) ? p.layout : (p.layout ? [p.layout] : []))" :key="layout" class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                        {{ layout }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ Array.isArray(p.angle) ? p.angle.join(', ') : (p.angle ?? '') }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>{{ p.submittedBy || 'unknown' }}</div>
                    <div class="text-xs text-gray-400">{{ p.submittedAt ? new Date(p.submittedAt).toLocaleDateString() : '' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end items-center gap-2">
                      <button @click="approve(p)" :disabled="actioning[p.id]" title="Approve" class="w-10 h-10 flex items-center justify-center rounded-md bg-green-600 hover:bg-green-700 text-white disabled:opacity-50">
                        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 11l3 3L17 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                      <button @click="editProposed(p)" title="Edit" class="w-10 h-10 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                      <button @click="reject(p)" :disabled="actioning[p.id]" title="Reject" class="w-10 h-10 flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </button>
                    </div>
                    <div v-if="actionError[p.id]" class="text-xs text-red-500 dark:text-red-400 mt-1 text-right">{{ actionError[p.id] }}</div>
                  </td>
                </tr>
                <tr v-if="!proposedList.length && !loading">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No proposed markers pending review.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Marker Form Modal (reused AddMarkerForm component) -->
    <AddMarkerForm
      :show="showMarkerForm"
      :googleApiKey="String(runtimeConfig.public?.googleMapsApiKey || '')"
      :target="formTarget"
      :bypassQuota="true"
      :initial="editingMarker"
      :editingId="editingMarker?.id || ''"
      @submit="onAddFormSubmit"
      @close="closeMarkerForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRuntimeConfig } from "#app";
import { useAuth } from "~/lib/composables/useAuth";
import { useTheme } from "~/lib/composables/useTheme";
import AddMarkerForm from "~/src/components/AddMarkerForm.vue";

const { isDark } = useTheme();
const runtimeConfig = useRuntimeConfig();
const dbUrl: string = String(runtimeConfig.public?.firebaseDatabaseUrl || "https://moon-30159-default-rtdb.europe-west1.firebasedatabase.app");

const { currentUser, isAdmin, authInitialized, login, logout: authLogout, getIdToken } = useAuth();
const email = ref("");
const password = ref("");
const loginError = ref("");
const loggingIn = ref(false);

const activeTab = ref<'markers' | 'proposed'>('markers');
const loading = ref(false);
const error = ref("");
const actioning = ref<Record<string, boolean>>({});
const actionError = ref<Record<string, string>>({});

const markersList = ref<any[]>([]);
const proposedList = ref<any[]>([]);

const showMarkerForm = ref(false);
const editingMarker = ref<any>(null);
const formTarget = ref<'markers' | 'proposed'>('markers');
const formSubmitting = ref(false);
const formError = ref("");
const markerForm = ref({
  title: "",
  lat: null as number | null,
  lng: null as number | null,
  layout: "",
  angle: "",
  website: "",
  instagram: "",
});

function toggleTheme() {
  const newVal = !isDark.value;
  isDark.value = newVal;
  if (typeof window !== 'undefined') {
    if (newVal) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch (e) {}
    }
  }
  console.log('[admin] toggleTheme ->', newVal, 'document has dark:', typeof document !== 'undefined' && document.documentElement.classList.contains('dark'))
}

async function handleLogin() {
  loginError.value = "";
  loggingIn.value = true;
  try {
    await login(email.value, password.value);
    email.value = "";
    password.value = "";
    await Promise.all([loadMarkers(), loadProposed()]);
  } catch (err: any) {
    loginError.value = err?.message || "Login failed";
  } finally {
    loggingIn.value = false;
  }
}

async function handleLogout() {
  try {
    await authLogout();
    markersList.value = [];
    proposedList.value = [];
  } catch (err: any) {
    error.value = err?.message || "Logout failed";
  }
}

watch(isAdmin, async (newValue) => {
  if (newValue) {
    await Promise.all([loadMarkers(), loadProposed()]);
  }
});

function asArrayFromObj(obj: any) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  return Object.keys(obj).map((k) => ({ id: k, ...obj[k] }));
}

async function loadMarkers() {
  loading.value = true;
  error.value = "";
  try {
    const token = await getIdToken();
    const endpoint = `${dbUrl.replace(/\/$/, "")}/markers.json${token ? `?auth=${token}` : ''}`;
    const r = await fetch(endpoint, { cache: "no-store" });
    const body = await r.json();
    if (!r.ok) throw new Error(body?.error || r.statusText || "Failed to fetch markers");
    markersList.value = asArrayFromObj(body);
  } catch (err: any) {
    error.value = err?.message || String(err);
    markersList.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadProposed() {
  loading.value = true;
  error.value = "";
  try {
    const token = await getIdToken();
    const endpoint = `${dbUrl.replace(/\/$/, "")}/proposedMarkers.json${token ? `?auth=${token}` : ''}`;
    const r = await fetch(endpoint, { cache: "no-store" });
    const body = await r.json();
    if (!r.ok) throw new Error(body?.error || r.statusText || "Failed to fetch proposed markers");
    proposedList.value = asArrayFromObj(body);
  } catch (err: any) {
    error.value = err?.message || String(err);
    proposedList.value = [];
  } finally {
    loading.value = false;
  }
}

function openAddMarkerForm() {
  editingMarker.value = null;
  formTarget.value = 'markers';
  markerForm.value = {
    title: "",
    lat: null,
    lng: null,
    layout: "",
    angle: "",
    website: "",
    instagram: "",
  };
  formError.value = "";
  showMarkerForm.value = true;
}

function openAddProposedForm() {
  editingMarker.value = null;
  formTarget.value = 'proposed';
  markerForm.value = {
    title: "",
    lat: null,
    lng: null,
    layout: "",
    angle: "",
    website: "",
    instagram: "",
  };
  formError.value = "";
  showMarkerForm.value = true;
}

function editMarker(marker: any) {
  editingMarker.value = marker;
  formTarget.value = 'markers';
  const coords = Array.isArray(marker.coords) 
    ? { lat: marker.coords[0], lng: marker.coords[1] }
    : marker.coords;
  
  markerForm.value = {
    title: marker.title || "",
    lat: coords.lat,
    lng: coords.lng,
    layout: Array.isArray(marker.layout) ? marker.layout.join(", ") : "",
    angle: Array.isArray(marker.angle) ? marker.angle.join(", ") : "",
    website: marker.website || "",
    instagram: marker.instagram || "",
  };
  formError.value = "";
  showMarkerForm.value = true;
}

function editProposed(item: any) {
  editingMarker.value = item;
  formTarget.value = 'proposed';
  const coords = item.coords || (Array.isArray(item.coords) ? { lat: item.coords[0], lng: item.coords[1] } : item.coords);
  markerForm.value = {
    title: item.title || "",
    lat: coords?.lat ?? (Array.isArray(item.coords) ? item.coords[0] : null),
    lng: coords?.lng ?? (Array.isArray(item.coords) ? item.coords[1] : null),
    layout: Array.isArray(item.layout) ? item.layout.join(", ") : (item.layout || ""),
    angle: Array.isArray(item.angle) ? item.angle.join(", ") : (item.angle || ""),
    website: item.website || "",
    instagram: item.instagram || "",
  };
  formError.value = "";
  showMarkerForm.value = true;
}

function closeMarkerForm() {
  showMarkerForm.value = false;
  editingMarker.value = null;
  formError.value = "";
}

function onAddFormSubmit(marker: any) {
  // Refresh appropriate lists after AddMarkerForm posts
  if (formTarget.value === 'markers') {
    loadMarkers();
    activeTab.value = 'markers';
  } else {
    loadProposed();
    activeTab.value = 'proposed';
  }
}

async function saveMarker() {
  formSubmitting.value = true;
  formError.value = "";
  
  try {
    const newMarker = {
      coords: [markerForm.value.lat, markerForm.value.lng],
      title: markerForm.value.title,
      layout: markerForm.value.layout.split(",").map((s) => s.trim()).filter(Boolean),
      angle: markerForm.value.angle.split(",").map((s) => s.trim()).filter(Boolean),
      website: markerForm.value.website || "",
      instagram: markerForm.value.instagram || "",
      gmapsUrl: (markerForm.value as any).gmapsUrl || '-',
    };

    const token = await getIdToken();
    const collection = formTarget.value === 'proposed' ? 'proposedMarkers' : 'markers';

    if (editingMarker.value) {
      const endpoint = `${dbUrl.replace(/\/$/, "")}/${collection}/${editingMarker.value.id}.json${token ? `?auth=${token}` : ''}`;
      const r = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMarker),
      });
      if (!r.ok) {
        const body = await r.json();
        throw new Error(body?.error || r.statusText || "Failed to update item");
      }
    } else {
      const endpoint = `${dbUrl.replace(/\/$/, "")}/${collection}.json${token ? `?auth=${token}` : ''}`;
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMarker),
      });
      if (!r.ok) {
        const body = await r.json();
        throw new Error(body?.error || r.statusText || "Failed to add item");
      }
    }

    closeMarkerForm();
    if (collection === 'markers') await loadMarkers();
    else await loadProposed();
  } catch (err: any) {
    formError.value = err?.message || String(err);
  } finally {
    formSubmitting.value = false;
  }
}

async function deleteMarker(marker: any) {
  if (!confirm(`Delete "${marker.title}"?`)) return;

  actioning.value[marker.id] = true;
  actionError.value[marker.id] = "";
  
  try {
    const token = await getIdToken();
    const endpoint = `${dbUrl.replace(/\/$/, "")}/markers/${marker.id}.json${token ? `?auth=${token}` : ''}`;
    const r = await fetch(endpoint, { method: "DELETE" });
    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      throw new Error(body?.error || r.statusText || "Failed to delete marker");
    }
    markersList.value = markersList.value.filter((m) => m.id !== marker.id);
  } catch (err: any) {
    actionError.value[marker.id] = err?.message || String(err);
  } finally {
    actioning.value[marker.id] = false;
  }
}

async function approve(item: any) {
  if (!confirm(`Approve "${item.title}" and move it to the main markers list?`)) return;
  actionError.value[item.id] = "";
  actioning.value[item.id] = true;
  
  try {
    const newMarker = {
      coords: [Number(item.coords?.lat), Number(item.coords?.lng)],
      title: item.title || "",
      layout: Array.isArray(item.layout) ? item.layout : item.layout ? [item.layout] : [],
      angle: (item.angle || []).map((a: any) => String(a)),
      website: item.website || "",
      instagram: item.instagram || "",
      gmapsUrl: item.gmapsUrl || item.url || '-',
      ...(item.author ? { author: item.author } : {}),
      ...(item.city ? { city: item.city } : {}),
      ...(item.country ? { country: item.country } : {}),
    };

    const token = await getIdToken();
    
    const postEndpoint = `${dbUrl.replace(/\/$/, "")}/markers.json${token ? `?auth=${token}` : ''}`;
    const pr = await fetch(postEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMarker),
    });
    if (!pr.ok) {
      const postBody = await pr.json();
      throw new Error(postBody?.error || pr.statusText || "Failed to post marker");
    }

    const delEndpoint = `${dbUrl.replace(/\/$/, "")}/proposedMarkers/${item.id}.json${token ? `?auth=${token}` : ''}`;
    const dr = await fetch(delEndpoint, { method: "DELETE" });
    if (!dr.ok) {
      const db = await dr.json().catch(() => ({}));
      throw new Error(db?.error || dr.statusText || "Failed to delete proposed marker");
    }

    proposedList.value = proposedList.value.filter((p) => p.id !== item.id);
    await loadMarkers();
  } catch (err: any) {
    actionError.value[item.id] = err?.message || String(err);
  } finally {
    actioning.value[item.id] = false;
  }
}

async function reject(item: any) {
  if (!confirm(`Reject "${item.title}"?`)) return;
  
  actionError.value[item.id] = "";
  actioning.value[item.id] = true;
  
  try {
    const token = await getIdToken();
    const delEndpoint = `${dbUrl.replace(/\/$/, "")}/proposedMarkers/${item.id}.json${token ? `?auth=${token}` : ''}`;
    const dr = await fetch(delEndpoint, { method: "DELETE" });
    if (!dr.ok) {
      const db = await dr.json().catch(() => ({}));
      throw new Error(db?.error || dr.statusText || "Failed to delete proposed marker");
    }
    proposedList.value = proposedList.value.filter((p) => p.id !== item.id);
  } catch (err: any) {
    actionError.value[item.id] = err?.message || String(err);
  } finally {
    actioning.value[item.id] = false;
  }
}
</script>

<style scoped>
* {
  transition-property: background-color, border-color, color;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}

#admin-root {
  background: var(--color-background);
  color: var(--color-text);
}

/* Table theming using palette variables */
#admin-root table {
  background: transparent;
  color: var(--color-text);
}

#admin-root thead {
  background: var(--color-surface) !important;
}

#admin-root thead th {
  color: var(--color-text) !important;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

#admin-root tbody tr {
  color: var(--color-text) !important;
}

#admin-root td {
  color: var(--color-text) !important;
  border-color: rgba(0,0,0,0.06);
}

#admin-root .bg-white {
  background-color: var(--color-surface) !important;
  color: var(--color-text) !important;
}
</style>
