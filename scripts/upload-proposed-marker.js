#!/usr/bin/env node
/*
 Example: Upload a proposed marker to Firebase Realtime Database

 This script uses the Realtime Database REST API to POST a new entry
 under the top-level node `/proposedMarkers`. The DB will generate a
 unique key for the new object and return it in the response as
 `{ "name": "-M..." }`.

 Difference note:
 - `markers` is the app's approved dataset used to render markers on the map.
 - `proposedMarkers` is a separate top-level node intended for user-submitted
   suggestions. Entries here include `status`, `submittedAt`, and `submittedBy`
   for review workflows and are NOT automatically shown as approved `markers`.

 Usage:
   node scripts/upload-proposed-marker.js

 Requirements:
 - Node 18+ (global `fetch` available). If you're on an older Node.js, install
   `node-fetch` and run with a compatible loader, or upgrade Node.
*/

(async function main() {
  const dbUrl =
    process.env.FIREBASE_DB_URL ||
    process.env.NUXT_PUBLIC_FIREBASE_DB ||
    "https://moon-30159-default-rtdb.europe-west1.firebasedatabase.app";

  // Ensure `fetch` exists (Node 18+ provides it). If not, attempt a dynamic import of node-fetch.
  if (typeof fetch === "undefined") {
    try {
      const nf = await import("node-fetch");
      // node-fetch v3 default export
      globalThis.fetch = nf.default || nf;
    } catch (e) {
      console.error(
        "Global fetch is not available and dynamic import of node-fetch failed. Use Node 18+ or install node-fetch.",
      );
      process.exit(1);
    }
  }

  // Example proposed marker object
  const proposedMarker = {
    url: "https://www.google.com/maps/place/Example+Gym/@51.9225,4.47917,17z",
    title: "Example Gym (proposed)",
    coords: { lat: 51.9225, lng: 4.47917 },
    layout: ["MBM 2019"],
    angle: [40],
    website: "https://example-gym.local/",
    instagram: "https://www.instagram.com/example_gym/",
    status: "pending", // pending | approved | rejected
    submittedAt: Date.now(),
    submittedBy: "user@example.com",
  };

  try {
    const endpoint = `${dbUrl.replace(/\/$/, "")}/proposedMarkers.json`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proposedMarker),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Upload failed:", data);
      process.exit(1);
    }
    console.log("Proposed marker uploaded. Generated key:", data.name);
    console.log(
      "You can review it at:",
      `${dbUrl.replace(/\/$/, "")}/proposedMarkers/${data.name}.json`,
    );
  } catch (err) {
    console.error("Error uploading proposed marker:", err);
    process.exit(1);
  }
})();
