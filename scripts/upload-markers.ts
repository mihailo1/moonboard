// @ts-nocheck
/**
 * Upload example markers to Realtime Database at /markers using push().
 * - Uses Firebase v9 modular SDK (client)
 * - Adds `createdAt: Date.now()` to each marker
 *
 * Run with ts-node (recommended for TypeScript):
 *   npm install firebase ts-node typescript --save-dev
 *   npx ts-node ./scripts/upload-markers.ts
 *
 * Or compile to JS and run with node.
 */
import { db } from "./firebase";
import { ref, push } from "firebase/database";

type MarkerPayload = {
  title: string;
  coords: { lat: number; lng: number };
  layout: string[];
  angle: number[];
  website?: string;
  instagram?: string;
};

// Example markers array (clean minimal structure)
const markers: MarkerPayload[] = [
  {
    title: "Monk Bouldergym Rotterdam",
    coords: { lat: 51.941639762636086, lng: 4.473290146216643 },
    layout: ["MBM 2017"],
    angle: [40],
    website: "https://monk.nl/rotterdam/",
    instagram: "https://www.instagram.com/monk_rotterdam/",
  },
  {
    title: "Radium Boulders",
    coords: { lat: 50.856788381871205, lng: 5.682432886939089 },
    layout: ["MBM 2019"],
    angle: [40, 25],
    website: "https://www.radiumboulders.nl/",
    instagram: "https://www.instagram.com/radiumboulders/",
  },
];

async function uploadAll() {
  const root = ref(db, "/markers");
  for (const marker of markers) {
    const payload = {
      ...marker,
      createdAt: Date.now(),
    };
    // push() creates an auto-generated key
    await push(root, payload);
    console.log("Pushed marker:", marker.title);
  }
  console.log("All markers uploaded");
}

uploadAll().catch((err) => {
  console.error("Upload failed:", err);
  process.exitCode = 1;
});
