import { ref } from "vue";
import { useRuntimeConfig } from "#app";
// No local fallback: rely exclusively on the Realtime Database

export function useMarkers() {
  const markers = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const runtimeConfig = useRuntimeConfig();
  const dbUrl: string = String(
    runtimeConfig.public?.firebaseDatabaseUrl ||
      process.env.NUXT_PUBLIC_FIREBASE_DB ||
      "https://moon-30159-default-rtdb.europe-west1.firebasedatabase.app"
  );

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${dbUrl.replace(/\/$/, "")}/markers.json`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      }
      const body = await res.json();
      if (!body) {
        markers.value = []
      } else if (Array.isArray(body)) {
        markers.value = body;
      } else {
        // Realtime DB returns an object keyed by push ids
        markers.value = Object.keys(body).map((k) => ({ id: k, ...body[k] }));
      }
    } catch (err: any) {
      error.value = err?.message || String(err);
      // no local fallback; keep an empty markers array on error
      markers.value = []
    } finally {
      loading.value = false;
    }
  }

  // auto-load (callers can still call load() to refresh)
  void load();

  return { markers, loading, error, load };
}
