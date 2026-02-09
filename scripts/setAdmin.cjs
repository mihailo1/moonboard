const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://moon-30159-default-rtdb.europe-west1.firebasedatabase.app"
});

/**
 * Set Admin Custom Claims Script
 * 
 * This script grants admin privileges to a Firebase Authentication user.
 * 
 * Prerequisites:
 * 1. Create a user in Firebase Console > Authentication > Users
 * 2. Copy the user's UID
 * 3. Ensure serviceAccountKey.json exists in this directory
 * 
 * Run with:
 *   UID=YOUR_USER_UID node scripts/setAdmin.cjs
 * or:
 *   node scripts/setAdmin.cjs YOUR_USER_UID
 */

const uid = process.argv[2] || process.env.FIREBASE_ADMIN_UID || process.env.UID;

if (!uid || uid === "PASTE_YOUR_UID_HERE") {
  console.error("\n❌ Error: No Firebase user UID provided.");
  console.error("   Usage:");
  console.error("     UID=YOUR_USER_UID node scripts/setAdmin.cjs");
  console.error("       or");
  console.error("     node scripts/setAdmin.cjs YOUR_USER_UID\n");
  console.error("   You can find the UID in Firebase Console > Authentication > Users.\n");
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("✅ Admin claim set successfully for user:", uid);
    console.log("   The user must sign out and sign in again for the new claims to take effect.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error setting admin claim:", error);
    process.exit(1);
  });
