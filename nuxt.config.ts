// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
      firebaseDatabaseUrl: process.env.NUXT_PUBLIC_FIREBASE_DB || 'https://moon-30159-default-rtdb.europe-west1.firebasedatabase.app',
    },
  },
  tailwindcss: {
    cssPath: '~/assets/tailwind.css',
    configPath: 'tailwind.config',
    exposeConfig: false,
    exposeLevel: 2,
    injectPosition: 'first',
    viewer: true,
  },
  // css: ['@/assets/tailwind.css'],
  vite: {
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth', 'firebase/database'],
    },
    server: {
      watch: {
        // ignore large/generated folders to avoid creating excessive FS watchers
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/.nuxt/**',
          '**/.output/**',
          '**/.vercel/**',
          '**/.cache/**',
          'public/**',
          'functions/**',
          'scripts/**'
        ],
        // avoid following symlinks which may expand watching footprint
        followSymlinks: false,
        // prefer native events (no polling) to reduce handles
        usePolling: false
      }
    }
  }
})
