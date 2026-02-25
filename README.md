# Forterra Mapbox Design

Forterra-branded Mapbox GL JS map for a Taiwan military scenario. Includes Light/Dark basemaps, overlays (roads, port, Main Operating Base, Combat Outpost, Direct & Indirect Fires, power poles), waypoint markers with route line, numbered callouts, map legend, and optional elevation mesh.

**Static site** — no backend. Deploy to Vercel or any static host.

---

## Project structure

| Path | Purpose |
|------|---------|
| `index.html` | Entry point |
| `js/` | Config, map init, controls, layers, markers, callouts |
| `css/style.css` | Layout and Forterra UI styling |
| `data/geojson/` | Taiwan roads, Port, MOB, Combat Outpost, Direct & Indirect Fires, Power poles |
| `deliverable-assets/` | Waypoint marker icons (PLS, JLTV Rogue Fires) — see `deliverable-assets/README.md` |

---

## Brand guidelines implemented

All colors, typography, and symbology follow **Forterra Brand Guidelines**.

### Brand palette

| Name | HEX | Use |
|------|-----|-----|
| **Dark Forest Green** | `#292e29` | UI background, overlays outline, text (light mode) |
| **Light Army Green** | `#758273` | Accent, MOB fill, waypoint route, highlights |
| **Cool Charcoal** | `#2e2e30` | Borders, Combat Outpost outline |
| **Bark** | `#473f3a` | Port outline, Combat Outpost fill |
| **Desert Sand** | `#a88f69` | Port fill |
| **Light Warm Neutral** | `#edebeb` | UI text (dark mode) |
| **Medium Gray** | `#6e6e6e` | Roads |
| **Dust** | `#b0a194` | Tall buildings, water override |

### Basemap symbology (Mapbox Studio)

**FORTERRA_Dark**
- Land: `#1e2220` | Water: `#252a28`
- Place labels: `#8a8f8a` | Road labels: `#7a8278`
- Admin boundaries: `#5a635a`
- Roads: motorways `#3c4240`, trunk `#4a504e`, other `#5a605e`
- 3D buildings: `#6b655c` (dark taupe)
- Typography: **Space Grotesk**

**FORTERRA_Light**
- Forterra light tones for land, water, roads, labels
- Building fill: `#edebeb`, `#b0a194`, `#a88f69`, `#6e6e6e`

### Overlay symbology (code)

| Layer | Fill / line | Outline |
|-------|-------------|---------|
| Roads | `#6e6e6e` | — |
| Port | `#a88f69` | `#473f3a` |
| Main Operating Base | `#758273` | `#292e29` |
| Combat Outpost | `#473f3a` | `#2e2e30` |
| Direct & Indirect Fires | `#8b3a3a` (striped) | `#6b2a2a` |
| Waypoint route | `#758273` (dashed) | — |

### 3D building height (Mapbox Studio)

Data-driven fill color by `height` (meters), linear interpolation, range 0–1500 m.

**FORTERRA_Light** — stops: 0 m (light), 7 m, 21 m, 40 m, 1500 m (dark grey). Gradient from light to dark.

**FORTERRA_Dark** — stops: 0 m, 3 m, 20 m, 70 m, 1500 m. Dark Forterra tones throughout.

### Label typography (Mapbox Studio)

- **place_label**: Space Grotesk Bold
- **natural / airport / transit**: Inter Bold
- **poi / housenum**: Inter Regular

### UI (code)

- Panel background: `#292e29`
- Text: `#edebeb`
- Accent / titles: `#758273`
- Borders / hover: `#2e2e30`, `#3d423d`

---

## Features

- **Basemap switcher** — Light / Dark
- **Layer control** — Toggle overlays; right-click for “Zoom to layer”
- **Waypoint markers** — 4 markers with callouts (Waypoint 1–4)
- **Waypoint route** — Dashed line connecting waypoints (toggleable)
- **Numbered callouts** — Port 1, Main Operating Base 1, etc.; Direct & Indirect Fires; Waypoint 1–4
- **Map legend** — Overlays + waypoint markers
- **Elevation mesh** — Optional (dark basemap only)
- **Responsive** — Layout adapts to tablet and mobile
