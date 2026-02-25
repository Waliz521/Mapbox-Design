/**
 * Map and basemap configuration. Style URLs only; no basemap overrides in code.
 */
// Token: Vercel injects MAPBOX_ACCESS_TOKEN at build. For local dev, copy js/config.local.example.js to js/config.local.js and add your token.
// Get a token at https://account.mapbox.com/ — without a valid token you'll see CORS / "Failed to fetch" errors.
mapboxgl.accessToken = 'REPLACE_MAPBOX_TOKEN';

/** Basemap style URLs (Mapbox Studio). */
const BASEMAP_STYLES = [
    { title: 'Light', uri: 'mapbox://styles/wali521/cmlujwwhz003h01s9c2wd11n9' },
    { title: 'Dark', uri: 'mapbox://styles/wali521/cmluky4bp003f01saceol0z8w' }
];

/** Initial style URL (your Mapbox Studio base map). Default: Dark. */
const INITIAL_STYLE_URI = BASEMAP_STYLES[1].uri;

/** Default map options (center, zoom, etc.). */
const MAP_OPTIONS = {
    center: [121.51387640265938, 25.04423110324336],
    zoom: 11,
    pitch: 0,
    bearing: 0
};
