import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'
import { useRuntimeConfig } from '#app'

let app: FirebaseApp
let auth: Auth
let database: Database

// Initialize Firebase (client-side only)
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { app: null, auth: null, database: null }
  }

  const config = useRuntimeConfig()
  
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    databaseURL: config.public.firebaseDatabaseUrl,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    database = getDatabase(app)
  } else {
    app = getApps()[0]
    auth = getAuth(app)
    database = getDatabase(app)
  }

  return { app, auth, database }
}

// Getters for Firebase instances
export function getFirebaseAuth(): Auth {
  if (!auth && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return auth
}

export function getFirebaseDatabase(): Database {
  if (!database && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return database
}

export function getFirebaseApp(): FirebaseApp {
  if (!app && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return app
}
