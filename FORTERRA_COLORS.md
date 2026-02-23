# Forterra Mapbox — Color Reference

Colors follow **FORTERRA Brand Guidelines**. Use this list in **Mapbox Studio** for the FORTERRA_Dark style and in code for overlays, UI, and building height classification.

---

## Brand palette (guidelines)

### Primary colors
Use for most creative and visual pieces.

| Name | HEX | RGB | CMYK |
|------|-----|-----|------|
| **Dark Forest Green** | `#292e29` | 41/46/41 | 71/61/67/65 |
| **Light Army Green** | `#758273` | 117/130/115 | 56/38/54/10 |
| **Cool Charcoal** | `#2e2e30` | 46/46/48 | 71/65/61/62 |
| **Light Gray** | `#dbdbdb` | 219/219/219 | 13/10/10/0 |

### Secondary colors
Use when primary is insufficient or an element should look uniquely different yet on-brand.

| Name | HEX | RGB | CMYK |
|------|-----|-----|------|
| **Bark** | `#473f3a` | 71/63/58 | 61/61/64/49 |
| **Dust** | `#b0a194` | 176/161/148 | 33/34/40/1 |
| **Desert Sand** | `#a88f69` | 168/143/105 | 34/40/64/5 |
| **Light Warm Neutral** | `#edebeb` | 237/235/235 | 6/5/5/0 |
| **Medium Gray** | `#6e6e6e` | 110/110/110 | 58/49/49/16 |

### Logo colors
- **Standard:** Cool Charcoal, Light Warm Neutral, Dark Forest Green  
- **High contrast:** Black `#000000`, White `#ffffff`

---

## Why does the map still look like default Mapbox?

If the **console** shows the correct style URL and style name but the **map** still looks like generic light/dark Mapbox (green land, blue water, or gray night), the style is loading correctly—but its **content** is still the default.

- **Mapbox Standard** styles get land, water, and roads from an **import**. Your style JSON has 0 top-level layers, so our code **cannot** override those colors from the app; they must be set **in Mapbox Studio**.
- **Fix:** Open **FORTERRA_Light** and **FORTERRA_Dark** in Studio and set the basemap colors in the left panel (Land & water, Roads, Places & boundaries, etc.) using the hex codes below. Save and **Publish** each style. After that, the same style URLs will serve your custom look.

---

## 1. Set in Mapbox Studio (FORTERRA_Dark basemap)

Enter these hex codes in the **Styles > FORTERRA_Dark** editor.

### Basemap
| Setting | Value |
|--------|--------|
| Type | Standard |
| Color theme | Monochrome |
| Light preset | **Night** |

### Typography
| Setting | Value |
|--------|--------|
| Font | **Space Grotesk** |

### Places & boundaries
| Setting | Hex | Notes |
|--------|-----|------|
| Place labels | **ON** | |
| Place labels color | `#8a8f8a` | Muted sage grey, readable on dark |
| Administrative boundaries | **ON** | |
| Administrative boundaries color | `#5a635a` | Dark olive grey (Forterra-aligned) |

### Land & water (Night-style dark base)
| Setting | Hex | Notes |
|--------|-----|------|
| Land color | `#1e2220` | Dark base (near black-green) |
| Water color | `#252a28` | Slightly lighter than land |
| Commercial land use | `#2e3330` | |
| Education land use | `#262b28` | |
| Medical land use | `#262b28` | |
| Industrial & airport land use | `#2a2f2c` | |
| Greenspace color | `#28302a` | Slightly greener tint |

### Road & transit network
| Setting | Hex | Notes |
|--------|-----|------|
| Road labels | **ON** | |
| Road labels color | `#7a8278` | Muted, matches place labels |
| Transit labels | **ON** | |
| Motorways color | `#3c4240` | Dark grey |
| Trunk roads color | `#4a504e` | Medium dark grey |
| Other roads color | `#5a605e` | Lighter grey for hierarchy |
| Pedestrian paths | **ON** (optional) | |

### Points of interest
| Setting | Value |
|--------|--------|
| POI labels | **ON** |
| POI density | Medium (slider) |
| POI background | Circle |
| POI color mode | Default |
| Landmark icons | **ON** |

### 3D buildings & models
| Setting | Hex | Notes |
|--------|-----|------|
| All 3D objects | **ON** | |
| 3D buildings | **ON** | |
| 3D building facades | **ON** | |
| Building color | `#6b655c` | Dark taupe (Forterra) |
| 3D trees | **ON** (optional) | |

### Interactivity (highlight / select)
| Setting | Hex | Notes |
|--------|-----|------|
| Place labels — Highlight | `#758273` | Forterra green |
| Place labels — Select | `#758273` | Forterra green |
| Buildings — Highlight | `#3d423d` | Dark sage |
| Buildings — Select | `#758273` | Forterra green |

---

## 2. Set in code (overrides after style load)

These run in your app when the style loads. They override **base map layers** that Studio may not expose or that you want to keep in version control.

### In `js/layers/overlays.js` — base layer overrides

| Layer | Paint property | Hex | Purpose |
|-------|----------------|-----|--------|
| `water` | fill-color | `#b0a194` | Forterra water (warm grey) |
| `landcover` | fill-color | `#edebeb` | Light landcover (if style has it) |
| `landuse` | fill-color | `#dbdbdb` | Light landuse (if style has it) |

*Note: For a dark basemap, your Studio land/water colors above define the main look. Use these overrides only if you switch to a light style or need different defaults per style.*

### In `js/layers/overlays.js` — overlay layers (GeoJSON)

| Layer / use | Property | Hex |
|-------------|----------|-----|
| **Roads** (Taiwan) | line-color | `#6e6e6e` |
| **Port** | fill-color | `#a88f69` |
| **Port** | fill-outline-color | `#473f3a` |
| **Main Operating Base** | fill-color | `#758273` |
| **Main Operating Base** | fill-outline-color | `#292e29` |
| **Combat Outpost** | fill-color | `#473f3a` |
| **Combat Outpost** | fill-outline-color | `#2e2e30` |

### In `css/style.css` — UI (popups, layer control, basemap switcher)

| Element | Property | Hex |
|---------|----------|-----|
| Popup background | background | `#292e29` |
| Popup text | color | `#edebeb` |
| Popup title (h3) | color | `#758273` |
| Popup tip | border-top-color | `#292e29` |
| Layer control panel | background | `#292e29` |
| Layer control header | color | `#758273` |
| Layer control border | border-color | `#2e2e30` |
| Layer list item | color | `#edebeb` |
| Layer item hover | background | `#2e2e30` |
| Checkbox accent | accent-color | `#758273` |
| Basemap toggle container | background | `#292e29` |
| Basemap toggle label | color | `#758273` |
| Basemap button default | background | `#2e2e30`, color `#edebeb` |
| Basemap button hover | background | `#3d423d` |
| Basemap button active | background | `#758273`, border `#758273` |

---

## 3. Quick-copy hex list (Mapbox Studio)

Paste these into Studio where each setting has a color picker:

```
Place labels:           #8a8f8a
Admin boundaries:       #5a635a
Land:                   #1e2220
Water:                  #252a28
Commercial land use:    #2e3330
Education land use:     #262b28
Medical land use:       #262b28
Industrial & airport:   #2a2f2c
Greenspace:             #28302a
Road labels:            #7a8278
Motorways:              #3c4240
Trunk roads:            #4a504e
Other roads:            #5a605e
Building color:         #6b655c
Place labels highlight: #758273
Place labels select:    #758273
Buildings highlight:    #3d423d
Buildings select:       #758273
```

---

## 4. Quick-copy hex list (code — overlays & UI)

Already used in your project; keep these consistent:

```
Water (override):      #b0a194
Landcover (override):  #edebeb
Landuse (override):    #dbdbdb
Roads line:            #6e6e6e
Port fill:             #a88f69
Port outline:          #473f3a
MOB fill:              #758273
MOB outline:           #292e29
Combat outpost fill:   #473f3a
Combat outpost outline:#2e2e30
UI background:         #292e29
UI text:               #edebeb
UI accent / titles:    #758273
UI borders / hover:    #2e2e30, #3d423d
```

---

## 5. Building height classification (code)

3D buildings are colored by height (meters) using the brand palette for a dark basemap. Applied in `js/layers/buildingHeightLayer.js`; tiers are defined in `js/colors.js` under `FORTERRA_COLORS.buildings.heightColors`.

| Height range | Color (name) | HEX |
|--------------|---------------|-----|
| 0–8 m | Cool Charcoal | `#2e2e30` |
| 8–15 m | Bark | `#473f3a` |
| 15–30 m | Dark Forest Green | `#292e29` |
| 30–60 m | Light Army Green | `#758273` |
| 60+ m | Dust | `#b0a194` |

---

## 6. Optional: future overlays (from visual references)

When you add **Direct & Indirect Fires** or **network lines**:

| Use | Hex |
|-----|-----|
| Fires / danger zone fill | `#8b3a3a` (semi-transparent) |
| Fires outline | `#6b2a2a` |
| Network/connection lines | `#6b9bb8` (light blue) |
| FOB/PB accent (markers) | `#c45c3a` (red-orange) |

Use the **Mapbox Studio** section for everything you can set in FORTERRA_Dark; use the **code** section for overlay layers and UI so they stay consistent across styles and deployments.
