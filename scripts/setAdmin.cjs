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
 * 3. Replace "PASTE_YOUR_UID_HERE" below with the actual UID
 * 4. Ensure serviceAccountKey.json exists in this directory
 * 
 * Run with: node scripts/setAdmin.cjs
 */

const uid = "tnK08vhrNeQqITnMkpNFHCu89N82"; // Replace with actual Firebase user UID

if (uid === "PASTE_YOUR_UID_HERE") {
  console.error("\n❌ Error: Please replace 'PASTE_YOUR_UID_HERE' with a real Firebase user UID");
  console.error("   You can find the UID in Firebase Console > Authentication > Users\n");
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
