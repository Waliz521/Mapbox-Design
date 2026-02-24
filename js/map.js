/**
 * Map init and basemap switching. Loads style by fetch, strips terrain to avoid mapbox-dem errors, then creates the map.
 */
var LOG = function () {};
var LOG_WARN = function () {};
var LOG_ERROR = function () {};

var initialStyleUri = typeof INITIAL_STYLE_URI !== 'undefined' ? INITIAL_STYLE_URI : (BASEMAP_STYLES && BASEMAP_STYLES[0] ? BASEMAP_STYLES[0].uri : null);

function fetchStyleJson(styleUrl) {
    var url = styleUrl;
    if (typeof styleUrl === 'string' && styleUrl.indexOf('mapbox://styles/') === 0) {
        var path = styleUrl.replace('mapbox://styles/', '');
        url = 'https://api.mapbox.com/styles/v1/' + path + '?access_token=' + (mapboxgl.accessToken || '');
    }
    return fetch(url).then(function (r) {
        if (!r.ok) {
            var err = new Error('Style fetch failed: ' + r.status + ' ' + r.statusText);
            err.status = r.status;
            throw err;
        }
        return r.json();
    }).then(function (style) {
        return style;
    });
}

function stripTerrain(style) {
    if (style && typeof style === 'object') delete style.terrain;
    return style;
}

/** Disable landmark/POI in imported Standard style to avoid 404s (mapbox-landmark-pois tileset no longer available). */
function disableLandmarkImportConfig(style) {
    if (!style || typeof style !== 'object' || !Array.isArray(style.imports)) return;
    style.imports.forEach(function (imp) {
        if (imp && imp.config && typeof imp.config === 'object') {
            imp.config.showLandmarkIcons = false;
            imp.config.showPointOfInterestLabels = false;
        }
    });
}

/** Remove hillshade layer(s) that use the DEM source so elevation mesh dots are not drawn under them in 3D. Keeps the raster-dem source for terrain and queryTerrainElevation. */
function removeHillshadeLayersFromMap(map) {
    if (!map || !map.getStyle) return;
    var style = map.getStyle();
    if (!style || !Array.isArray(style.layers)) return;
    style.layers.forEach(function (ly) {
        if (ly.type === 'hillshade' && ly.source) {
            try { map.removeLayer(ly.id); } catch (e) {}
        }
    });
}

/** After style (and imports) are loaded, remove deprecated landmark source and its layers from the map to stop 404s. */
function removeDeprecatedSourcesFromMap(map) {
    if (!map || !map.getStyle) return;
    var style = map.getStyle();
    if (!style || !style.sources || !Array.isArray(style.layers)) return;
    var deprecated = ['mapbox.mapbox-landmark-pois-v1', 'mapbox-landmark-pois'];
    var sourceIdsToRemove = [];
    Object.keys(style.sources).forEach(function (id) {
        var s = style.sources[id];
        if (s && s.url && deprecated.some(function (d) { return s.url.indexOf(d) !== -1; })) {
            sourceIdsToRemove.push(id);
        }
    });
    sourceIdsToRemove.forEach(function (sourceId) {
        style.layers.filter(function (ly) { return ly.source === sourceId; }).forEach(function (ly) {
            try { map.removeLayer(ly.id); } catch (e) {}
        });
        try { map.removeSource(sourceId); } catch (e) {}
    });
}

/** Remove deprecated mapbox-landmark-pois source and its layers from root style (if present) to avoid 404s. */
function stripDeprecatedSources(style) {
    if (!style || typeof style !== 'object' || !style.sources) return;
    if (!Array.isArray(style.layers)) return;
    var deprecated = ['mapbox.mapbox-landmark-pois-v1', 'mapbox-landmark-pois'];
    var sourceIdsToRemove = {};
    Object.keys(style.sources).forEach(function (id) {
        var s = style.sources[id];
        if (s && s.url && deprecated.some(function (d) { return s.url.indexOf(d) !== -1; })) {
            sourceIdsToRemove[id] = true;
        }
    });
    if (Object.keys(sourceIdsToRemove).length === 0) return;
    style.layers = style.layers.filter(function (ly) {
        if (ly.source && sourceIdsToRemove[ly.source]) return false;
        return true;
    });
    Object.keys(sourceIdsToRemove).forEach(function (id) { delete style.sources[id]; });
}

/**
 * Creates the map with the initial style (terrain stripped), then calls onLoad when ready.
 * Call this from main.js so the style never references mapbox-dem.
 */
function initMapboxMap(onLoad) {
    if (!initialStyleUri) return;
    fetchStyleJson(initialStyleUri).then(function (style) {
        stripTerrain(style);
        disableLandmarkImportConfig(style);
        stripDeprecatedSources(style);
        // Keep style layers (Power-poles, Roads, Port, etc.) when published from Studio; overlays.js adds only missing ones
        var map = new mapboxgl.Map({
            container: 'map',
            style: style,
            center: MAP_OPTIONS.center,
            zoom: MAP_OPTIONS.zoom,
            pitch: MAP_OPTIONS.pitch,
            bearing: MAP_OPTIONS.bearing
        });
        window.map = map;

        var originalSetStyle = map.setStyle.bind(map);
        map.setStyle = function (styleArg, options) {
            var opts = options || {};
            opts.diff = opts.diff !== undefined ? opts.diff : false;
            if (typeof styleArg === 'string') {
                return fetchStyleJson(styleArg).then(function (s) {
                    stripTerrain(s);
                    disableLandmarkImportConfig(s);
                    stripDeprecatedSources(s);
                    return originalSetStyle(s, opts);
                }).catch(function (err) {
                    throw err;
                });
            }
            stripTerrain(styleArg);
            disableLandmarkImportConfig(styleArg);
            stripDeprecatedSources(styleArg);
            return originalSetStyle(styleArg, opts);
        };

        map.on('load', function () {
            removeDeprecatedSourcesFromMap(map);
            removeHillshadeLayersFromMap(map);
            if (onLoad) onLoad();
        });
        if (typeof window !== 'undefined') {
            window.removeDeprecatedSourcesFromMap = removeDeprecatedSourcesFromMap;
            window.removeHillshadeLayersFromMap = removeHillshadeLayersFromMap;
            window.MapboxDesignLOG = LOG;
            window.MapboxDesignLOG_WARN = LOG_WARN;
            window.MapboxDesignLOG_ERROR = LOG_ERROR;
        }
    }).catch(function () {});
}
