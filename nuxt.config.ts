// https://nuxt.com/docs/api/configuration/nuxt-config
import { VitePWA } from 'vite-plugin-pwa'

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
  app: {
    head: {
      link: [
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'mask-icon', href: '/favicon.svg', color: '#fc8f58' }
      ],
      meta: [
        { name: 'theme-color', content: '#fc8f58' }
      ]
    }
  },
  // css: ['@/assets/tailwind.css'],
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'favicon-96x96.png'],
        manifest: {
          name: 'MoonMap',
          short_name: 'Moons',
          theme_color: '#fc8f58',
          background_color: '#fc8f58',
          display: 'standalone',
          icons: [
            { src: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        }
      })
    ],
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
