// @ts-nocheck
/**
 * Minimal Firebase v9 initialization for Realtime Database (client SDK)
 * Usage: import { db } from './firebase' in Node script.
 * Install: npm install firebase
 */
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Use explicit databaseURL as requested
const firebaseConfig = {
  // Realtime Database URL (project's DB)
  databaseURL:
    "https://moon-30159-default-rtdb.europe-west1.firebasedatabase.app",
  // Optional: you may add apiKey/projectId if available, but DB rules are assumed open.
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export default app;
