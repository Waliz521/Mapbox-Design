# Mapbox-Design

Forterra-branded Mapbox GL map (Taiwan scenario): basemap switcher (Light/Dark), overlays (roads, port, MOB, combat outpost, direct/indirect fires, power poles), building height styling, and optional elevation mesh.

**Static site** — no backend or database. All data is in this repo (GeoJSON, config, Mapbox style URLs).

## Run locally

Open `index.html` in a browser, or serve the folder (e.g. `npx serve .`).

## Deploy on Vercel

1. Connect this repo to [Vercel](https://vercel.com).
2. Leave **Build Command** empty (or set to `null` in `vercel.json`).
3. **Mapbox token:** In Vercel, add an environment variable `MAPBOX_ACCESS_TOKEN` with your [Mapbox](https://account.mapbox.com/) token. The build step injects it into `js/config.js`. For local dev, replace `REPLACE_MAPBOX_TOKEN` in `js/config.js` with your token.

## Structure

- `index.html` — entry
- `js/` — config, map, controls, layers, markers
- `css/style.css` — layout and UI
- `data/geojson/` — GeoJSON layers
- `deliverable-assets/` — marker icons (SVG)
