# MoonBoard Gyms Map (Nuxt 3)

A Nuxt 3 + Vue 3 web app for exploring MoonBoards in bouldering gyms, with filtering, search, and a beautiful interactive map UI. Built with Tailwind CSS and Leaflet.

[🌐 Live Demo](https://moonboard-six.vercel.app)

## Features

- 🌍 Interactive map of MoonBoard gyms (Leaflet.js)
- 🔎 Search by gym name
- 🏷️ Filter by layout and wall angle
- 🌓 Light/Dark theme toggle (remembers your choice)
- 📱 Responsive, mobile-friendly UI
- 🗺️ Map markers with gym info and links

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
- `src/components/MenuFab/MenuFab.vue` — Floating action button, opens filter & theme menu
- `src/components/SearchBar.vue` — Search input
- `src/components/FilterSelect.vue` — Custom select for filtering
 - `lib` — Database-backed markers are now read from the Realtime Database; the previous local `lib/markers.ts` file has been removed.

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
