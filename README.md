# MoonBoard Gyms Map (Nuxt 3)

A Nuxt 3 + Vue 3 web app for exploring MoonBoards in bouldering gyms, with filtering, search, and a beautiful interactive map UI. Built with Tailwind CSS and Leaflet.

[🌐 Live Demo](https://moonboard-six.vercel.app)

## Features

- 🌍 Interactive map of MoonBoard gyms (Leaflet.js)
- 🔎 Search by gym name
- 🏷️ Filter by layout and wall angle
- 🌓 Light/Dark theme toggle (remembers your choice)
- 📱 Responsive, mobile-friendly UI
- 🗺️ Live map markers served from a Firebase Realtime Database
- ✉️ Submit proposed markers (stored under `proposedMarkers`) for review
- 🛠️ Admin review UI and upload helper scripts for managing the canonical `markers` dataset

## Quick Start

### 1. Install dependencies

```bash
yarn install
```

### 2. Start the dev server

```bash
yarn dev
```

App runs at http://localhost:3000

## Project Structure
 
- `app.vue` — App entry, renders the map
- `components/MapLeaflet.vue` — Main map UI, shows gyms, handles theme, search, and filters
- `src/components/` — UI components used by the app (see `src/components/*` for `AddMarkerFab`, `AddMarkerForm`, `FilterSelect`, `MultiFilterSelect`, `SearchBar`, `MenuFab`)
- `lib/composables/` — composables such as `useMarkers.ts` and `useTheme.ts` (database hooks and theme handling)
- `pages/` — `index.vue` (public map) and `admin.vue` (marker review / admin tools)
- `scripts/` — helper scripts for uploads and Firebase setup (`firebase.ts`, `upload-markers.ts`, `upload-markers-rest.js`, `upload-proposed-marker.js`)
- `server/api/` — simple server endpoints (e.g. `resolve-map-url.post.ts`)
- `types/` — TypeScript types
- `assets/`, `public/`, and other standard Nuxt folders

Note: the app now reads its approved dataset from a Firebase Realtime Database top-level node `markers`. A separate `proposedMarkers` node is used for user-submitted suggestions that must be reviewed before promotion.

### proposedMarkers (Realtime DB)

This project uses a Realtime Database top-level node called `markers` for the
approved dataset rendered in the app. There's also a separate top-level node
`proposedMarkers` intended for user-submitted suggestions. Entries in
`proposedMarkers` include review metadata (`status`, `submittedAt`,
`submittedBy`) and should be reviewed/approved before moving them into the
public `markers` node.

## Tech Stack

- [Nuxt 3](https://nuxt.com/) (Vue 3, Vite)
- [Leaflet.js](https://leafletjs.com/) (interactive maps)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first styling)
- [Firebase Realtime Database](https://firebase.google.com/products/realtime-database) (markers + proposedMarkers)
