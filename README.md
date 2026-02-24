# Mapbox-Design

Forterra-branded Mapbox GL map (Taiwan scenario): basemap switcher (Light/Dark), overlays (roads, port, MOB, combat outpost, direct/indirect fires, power poles), building height styling, and optional elevation mesh.

**Static site** — no backend or database. All data is in this repo (GeoJSON, config, Mapbox style URLs).

## Run locally

1. Copy `js/config.local.example.js` to `js/config.local.js` and add your [Mapbox token](https://account.mapbox.com/).
2. Open `index.html` in a browser, or serve the folder (e.g. `npx serve .`).

`config.local.js` is gitignored — your token never gets committed.

## Deploy on Vercel

1. Connect this repo to [Vercel](https://vercel.com).
2. **Mapbox token:** Add environment variable `MAPBOX_ACCESS_TOKEN` with your [Mapbox](https://account.mapbox.com/) token. The build step injects it into `js/config.js`.

## Structure

- `index.html` — entry
- `js/` — config, map, controls, layers, markers
- `css/style.css` — layout and UI
- `data/geojson/` — GeoJSON layers
- `deliverable-assets/` — marker icons (SVG)
