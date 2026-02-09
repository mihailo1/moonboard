<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Admin — Proposed Markers</h1>
    <div v-if="!authInitialized" class="text-gray-500">
      <p>Loading authentication...</p>
    </div>
    <div v-else-if="!isAdmin">
      <div class="mb-4">
        <label class="block mb-2 font-medium">Email</label>
        <input
          v-model="email"
          type="email"
          class="border rounded px-3 py-2 w-64 mb-3"
          placeholder="Enter admin email"
        />
        <label class="block mb-2 font-medium">Password</label>
        <input
          v-model="password"
          type="password"
          class="border rounded px-3 py-2 w-64"
          placeholder="Enter password"
          @keyup.enter="handleLogin"
        />
        <div class="mt-3">
          <button
            class="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
            :disabled="loggingIn"
            @click="handleLogin"
          >
            {{ loggingIn ? 'Logging in...' : 'Login' }}
          </button>
        </div>
        <div v-if="loginError" class="text-sm text-red-500 mt-2">
          {{ loginError }}
        </div>
      </div>
      <div class="text-sm text-gray-600">
        This page requires Firebase Authentication with admin privileges.
      </div>
    </div>
    <div v-else>
      <div class="mb-4 flex items-center">
        <button
          class="px-3 py-1 rounded bg-blue-600 text-white"
          @click="loadProposed"
        >
          Refresh
        </button>
        <button
          class="px-3 py-1 rounded bg-gray-200 text-gray-800 ml-3"
          @click="handleLogout"
        >
          Logout
        </button>
        <span v-if="loading" class="ml-3 text-sm text-gray-500">Loading…</span>
        <span v-if="error" class="ml-3 text-sm text-red-500">{{ error }}</span>
      </div>

      <div v-if="!proposedList.length && !loading" class="text-gray-600">
        No proposed markers found.
      </div>

      <ul class="space-y-4">
        <li
          v-for="p in proposedList"
          :key="p.id"
          class="p-4 border rounded shadow-sm admin-card"
        >
          <div class="flex justify-between items-start gap-4">
            <div>
              <div class="text-lg font-medium">{{ p.title }}</div>
              <div class="text-sm text-gray-500">
                Submitted by: {{ p.submittedBy || "unknown" }} —
                {{ new Date(p.submittedAt).toLocaleString() }}
              </div>
              <div class="mt-2 text-sm">
                <div>
                  <strong>Coords:</strong> {{ p.coords?.lat }},
                  {{ p.coords?.lng }}
                </div>
                <div>
                  <strong>Layouts:</strong> {{ (p.layout || []).join(", ") }}
                </div>
                <div>
                  <strong>Angles:</strong> {{ (p.angle || []).join(", ") }}
                </div>
                <div v-if="p.website">
                  <strong>Website:</strong>
                  <a :href="p.website" target="_blank" class="text-blue-600">{{
                    p.website
                  }}</a>
                </div>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <a
                v-if="p.url"
                :href="p.url"
                target="_blank"
                class="text-sm underline text-blue-600"
                >Open maps</a
              >
              <div class="flex gap-2">
                <button
                  class="px-3 py-1 bg-green-600 text-white rounded"
                  :disabled="actioning[p.id]"
                  @click="approve(p)"
                >
                  Approve
                </button>
                <button
                  class="px-3 py-1 bg-red-500 text-white rounded"
                  :disabled="actioning[p.id]"
                  @click="reject(p)"
                >
                  Reject
                </button>
              </div>
              <div v-if="actionError[p.id]" class="text-sm text-red-500 mt-1">
                {{ actionError[p.id] }}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRuntimeConfig } from "#app";
import { useAuth } from "~/lib/composables/useAuth";

const runtimeConfig = useRuntimeConfig();
const dbUrl: string = String(
  runtimeConfig.public?.firebaseDatabaseUrl ||
    process.env.NUXT_PUBLIC_FIREBASE_DB ||
    "https://moon-30159-default-rtdb.europe-west1.firebasedatabase.app",
);

const proposedList = ref<any[]>([]);
const loading = ref(false);
const error = ref("");
const actioning = ref<Record<string, boolean>>({});
const actionError = ref<Record<string, string>>({});

// Firebase Authentication
const { currentUser, isAdmin, authInitialized, login, logout: authLogout, getIdToken } = useAuth();
const email = ref("");
const password = ref("");
const loginError = ref("");
const loggingIn = ref(false);

async function handleLogin() {
  loginError.value = "";
  loggingIn.value = true;
  try {
    await login(email.value, password.value);
    email.value = "";
    password.value = "";
    await loadProposed();
  } catch (err: any) {
    loginError.value = err?.message || "Login failed";
  } finally {
    loggingIn.value = false;
  }
}

async function handleLogout() {
  try {
    await authLogout();
    proposedList.value = [];
  } catch (err: any) {
    error.value = err?.message || "Logout failed";
  }
}

// Watch for auth changes and load data when admin logs in
watch(isAdmin, async (newValue) => {
  if (newValue) {
    await loadProposed();
  }
});

function asArrayFromObj(obj: any) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  return Object.keys(obj).map((k) => ({ id: k, ...obj[k] }));
}

async function loadProposed() {
  loading.value = true;
  error.value = "";
  try {
    const token = await getIdToken();
    const endpoint = `${dbUrl.replace(/\/$/, "")}/proposedMarkers.json${token ? `?auth=${token}` : ''}`;
    const r = await fetch(endpoint, { cache: "no-store" });
    const body = await r.json();
    if (!r.ok)
      throw new Error(body?.error || r.statusText || "Failed to fetch");
    proposedList.value = asArrayFromObj(body);
  } catch (err: any) {
    error.value = err?.message || String(err);
    proposedList.value = [];
  } finally {
    loading.value = false;
  }
}

// Transform proposed into app marker schema and post to /markers.json, then delete proposed
async function approve(item: any) {
  actionError.value[item.id] = "";
  actioning.value[item.id] = true;
  try {
    const newMarker = {
      coords: [Number(item.coords?.lat), Number(item.coords?.lng)],
      title: item.title || "",
      layout: Array.isArray(item.layout)
        ? item.layout
        : item.layout
          ? [item.layout]
          : [],
      angle: (item.angle || []).map((a: any) => String(a)),
      website: item.website || "",
      instagram: item.instagram || "",
    };

    const token = await getIdToken();
    
    // POST to markers
    const postEndpoint = `${dbUrl.replace(/\/$/, "")}/markers.json${token ? `?auth=${token}` : ''}`;
    const pr = await fetch(postEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMarker),
    });
    const postBody = await pr.json();
    if (!pr.ok)
      throw new Error(
        postBody?.error || pr.statusText || "Failed to post marker",
      );

    // DELETE proposed
    const delEndpoint = `${dbUrl.replace(/\/$/, "")}/proposedMarkers/${item.id}.json${token ? `?auth=${token}` : ''}`;
    const dr = await fetch(delEndpoint, { method: "DELETE" });
    if (!dr.ok) {
      const db = await dr.json().catch(() => ({}));
      throw new Error(
        db?.error || dr.statusText || "Failed to delete proposed marker",
      );
    }

    // remove from local list
    proposedList.value = proposedList.value.filter((p) => p.id !== item.id);
  } catch (err: any) {
    actionError.value[item.id] = err?.message || String(err);
  } finally {
    actioning.value[item.id] = false;
  }
}

async function reject(item: any) {
  actionError.value[item.id] = "";
  actioning.value[item.id] = true;
  try {
    const token = await getIdToken();
    const delEndpoint = `${dbUrl.replace(/\/$/, "")}/proposedMarkers/${item.id}.json${token ? `?auth=${token}` : ''}`;
    const dr = await fetch(delEndpoint, { method: "DELETE" });
    if (!dr.ok) {
      const db = await dr.json().catch(() => ({}));
      throw new Error(
        db?.error || dr.statusText || "Failed to delete proposed marker",
      );
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
/* small admin styles */
body.dark .bg-white {
  background: #111827;
}

/* Force admin card to be white with black border regardless of theme */
.admin-card {
  background: #ffffff !important;
  border-color: #000000 !important;
  color: #000000 !important;
}

.admin-card a { color: #1d4ed8; }
</style>
