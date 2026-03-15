import { useState } from '#app';
import { useRuntimeConfig } from "#app";
import type { Marker } from "~/types";

// simple inflight dedupe
let inflight: Promise<void> | null = null;

export function useMarkers() {
  const runtimeConfig = useRuntimeConfig();
  const dbUrl: string = String(
    runtimeConfig.public?.firebaseDatabaseUrl ||
      process.env.NUXT_PUBLIC_FIREBASE_DB ||
      "https://moon-30159-default-rtdb.europe-west1.firebasedatabase.app"
  );

  // Shared state via Nuxt `useState` must be created inside a setup/composable call
  const markersState = useState<Marker[]>('markers_store', () => []);
  const loadingState = useState<boolean>('markers_loading', () => false);
  const errorState = useState<string | null>('markers_error', () => null);

  async function load() {
    if (inflight) return inflight;
    loadingState.value = true;
    errorState.value = null;
    inflight = (async () => {
      try {
        const res = await fetch(`${dbUrl.replace(/\/$/, "")}/markers.json`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        }
        const body = await res.json();
        if (!body) {
          markersState.value = [];
        } else if (Array.isArray(body)) {
          markersState.value = (body as Marker[]).map((m) => ({ ...m, gmapsUrl: (m as any).gmapsUrl || '-'}));
        } else {
          markersState.value = Object.keys(body).map((k) => ({ id: k, ...body[k], gmapsUrl: (body as any)[k]?.gmapsUrl || '-'})) as Marker[];
        }
      } catch (err: any) {
        errorState.value = err?.message || String(err);
        markersState.value = [];
      } finally {
        loadingState.value = false;
        inflight = null;
      }
    })();
    return inflight;
  }

  // auto-load once when the composable is first used
  if (!markersState.value.length && !inflight) {
    void load();
  }

  return { markers: markersState, loading: loadingState, error: errorState, load };
}
