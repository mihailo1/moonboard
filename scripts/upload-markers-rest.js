/**
 * One-off uploader for Firebase Realtime Database (no external packages)
 * - Uses the REST API and Node's global `fetch` (Node 18+)
 * - Posts each marker to `/markers` (POST -> auto-generated keys)
 * - Adds `createdAt: Date.now()` to each marker
 *
 * Run with: `node scripts/upload-markers-rest.js`
 * Requires Node 18+ for global fetch.
 */

const DB_URL =
  "https://moon-30159-default-rtdb.europe-west1.firebasedatabase.app";

// Minimal markers array converted to the requested structure
const markers = [
  {
    title: "Beest Boulders Breda",
    coords: { lat: 51.595019593915254, lng: 4.757340097726425 },
    layout: ["MB 2024"],
    angle: [25],
    website: "https://beestboulders.com/vestigingen/beest-boulders-breda/",
    instagram: "https://www.instagram.com/beest.breda/",
  },
  {
    title: "Beest Boulders Den Haag HS",
    coords: { lat: 52.06934441903609, lng: 4.323514532060367 },
    layout: ["MBM 2019"],
    angle: [25],
    website: "https://beestboulders.com/vestigingen/beest-boulders-den-haag/",
    instagram: "https://www.instagram.com/beest.denhaaghs/",
  },
  {
    title: "Boulderhal Sterk",
    coords: { lat: 52.07654, lng: 5.10828 },
    layout: ["MB 2024", "MBM 2019"],
    angle: [40],
    website: "https://www.boulderhalsterk.nl/",
    instagram: "https://www.instagram.com/boulderhal_sterk/",
  },
  {
    title: "Boulderhal Energiehaven",
    coords: { lat: 52.09997008030096, lng: 5.070827429076791 },
    layout: ["MBM 2017"],
    angle: [40],
    website: "https://www.boulderhalenergiehaven.nl/",
    instagram: "https://www.instagram.com/boulderhalenergiehaven/",
  },
  {
    title: "Beta Boulders Amsterdam",
    coords: { lat: 52.34427194847903, lng: 4.855917995959056 },
    layout: ["MB 2024"],
    angle: [40],
    website: "https://betaboulders.nl/",
    instagram: "https://www.instagram.com/betabouldersamsterdam/",
  },
  {
    title: "Wildflower Climbing Gym",
    coords: { lat: 52.159490220046536, lng: 4.513829959246473 },
    layout: ["MBM 2019"],
    angle: [40],
    website: "https://wildflowerclimbinggym.org/",
    instagram: "",
  },
  {
    title: "Monk Bouldergym Eindhoven",
    coords: { lat: 51.44354413145449, lng: 5.458608803454979 },
    layout: ["MBM 2019"],
    angle: [40],
    website: "https://monk.nl/eindhoven/",
    instagram: "https://www.instagram.com/monk_eindhoven/",
  },
  {
    title: "Monk Bouldergym Hilversum",
    coords: { lat: 52.2200210683424, lng: 5.1492001627586745 },
    layout: ["MBM 2019"],
    angle: [40],
    website: "https://monk.nl/hilversum/",
    instagram: "https://www.instagram.com/monk_hilversum/",
  },
  {
    title: "Impact Boulderhal",
    coords: { lat: 52.37604990705676, lng: 5.238049570972661 },
    layout: ["MB 2024"],
    angle: [40],
    website: "https://www.impactboulderhal.nl/",
    instagram: "",
  },
  {
    title: "Beest Boulders het Lab",
    coords: { lat: 52.392419600074916, lng: 4.851315328965854 },
    layout: ["MBM 2019"],
    angle: [25],
    website: "https://beestboulders.com/vestigingen/het-lab-amsterdam/",
    instagram: "https://www.instagram.com/beest.hetlab/",
  },
  {
    title: "Boulderhal Roest",
    coords: { lat: 52.49877137187632, lng: 6.119803717929547 },
    layout: ["MBM 2017"],
    angle: [40],
    website: "https://www.boulderhalroest.nl/",
    instagram: "https://www.instagram.com/boulderhalroest/",
  },
];

async function pushMarker(marker) {
  const url = `${DB_URL.replace(/\/$/, "")}/markers.json`;
  const body = JSON.stringify({ ...marker, createdAt: Date.now() });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to push marker ${marker.title}: ${res.status} ${res.statusText} ${text}`,
    );
  }
  const data = await res.json();
  return data;
}

(async () => {
  try {
    for (const m of markers) {
      const r = await pushMarker(m);
      console.log("Pushed", m.title, "-> key:", r.name);
    }
    console.log("Done");
  } catch (err) {
    console.error("Upload failed:", err);
    process.exitCode = 1;
  }
})();
