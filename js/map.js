/**
 * Map init and basemap switching. Loads style by fetch, strips terrain to avoid mapbox-dem errors, then creates the map.
 */
var LOG = function (msg, data) {
    if (typeof console !== 'undefined' && console.log) {
        if (data !== undefined) console.log('[Mapbox-Design]', msg, data);
        else console.log('[Mapbox-Design]', msg);
    }
};
var LOG_WARN = function (msg, data) {
    if (typeof console !== 'undefined' && console.warn) {
        if (data !== undefined) console.warn('[Mapbox-Design]', msg, data);
        else console.warn('[Mapbox-Design]', msg);
    }
};
var LOG_ERROR = function (msg, err) {
    if (typeof console !== 'undefined' && console.error) {
        if (err !== undefined) console.error('[Mapbox-Design]', msg, err);
        else console.error('[Mapbox-Design]', msg);
    }
};

var initialStyleUri = typeof INITIAL_STYLE_URI !== 'undefined' ? INITIAL_STYLE_URI : (BASEMAP_STYLES && BASEMAP_STYLES[0] ? BASEMAP_STYLES[0].uri : null);

function fetchStyleJson(styleUrl) {
    var url = styleUrl;
    if (typeof styleUrl === 'string' && styleUrl.indexOf('mapbox://styles/') === 0) {
        var path = styleUrl.replace('mapbox://styles/', '');
        url = 'https://api.mapbox.com/styles/v1/' + path + '?access_token=' + (mapboxgl.accessToken || '');
    }
    LOG('fetchStyleJson', styleUrl);
    return fetch(url).then(function (r) {
        if (!r.ok) {
            LOG_ERROR('fetchStyleJson failed', { status: r.status, statusText: r.statusText, url: styleUrl });
            var err = new Error('Style fetch failed: ' + r.status + ' ' + r.statusText);
            err.status = r.status;
            throw err;
        }
        return r.json();
    }).then(function (style) {
        LOG('fetchStyleJson ok', { styleName: style && style.name, sources: style && style.sources && Object.keys(style.sources).length });
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
    if (sourceIdsToRemove.length > 0 && typeof LOG !== 'undefined') {
        LOG('removeDeprecatedSourcesFromMap: removing', { sourceIds: sourceIdsToRemove });
    }
    sourceIdsToRemove.forEach(function (sourceId) {
        style.layers.filter(function (ly) { return ly.source === sourceId; }).forEach(function (ly) {
            try { map.removeLayer(ly.id); } catch (e) { if (typeof LOG_ERROR === 'function') LOG_ERROR('removeDeprecatedSourcesFromMap: removeLayer failed', { layerId: ly.id, err: e }); }
        });
        try { map.removeSource(sourceId); } catch (e) { if (typeof LOG_ERROR === 'function') LOG_ERROR('removeDeprecatedSourcesFromMap: removeSource failed', { sourceId: sourceId, err: e }); }
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
    var removedLayers = style.layers.filter(function (ly) { return ly.source && sourceIdsToRemove[ly.source]; }).map(function (ly) { return ly.id; });
    LOG('stripDeprecatedSources: removing sources and layers', { sources: Object.keys(sourceIdsToRemove), layers: removedLayers });
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
    if (!initialStyleUri) {
        console.warn('Mapbox Design: no INITIAL_STYLE_URI, map not initialized.');
        return;
    }
    LOG('initMapboxMap: loading initial style', initialStyleUri);
    fetchStyleJson(initialStyleUri).then(function (style) {
        stripTerrain(style);
        disableLandmarkImportConfig(style);
        stripDeprecatedSources(style);
        LOG('initMapboxMap: creating map', { styleName: style && style.name });
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
            LOG('setStyle called', typeof styleArg === 'string' ? styleArg : (styleArg && styleArg.name ? styleArg.name : 'object'));
            if (typeof styleArg === 'string') {
                return fetchStyleJson(styleArg).then(function (s) {
                    stripTerrain(s);
                    disableLandmarkImportConfig(s);
                    stripDeprecatedSources(s);
                    return originalSetStyle(s, opts);
                }).catch(function (err) {
                    LOG_ERROR('setStyle failed', err);
                    throw err;
                });
            }
            stripTerrain(styleArg);
            disableLandmarkImportConfig(styleArg);
            stripDeprecatedSources(styleArg);
            return originalSetStyle(styleArg, opts);
        };

        map.on('load', function () {
            LOG('map.load fired');
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
    }).catch(function (err) {
        LOG_ERROR('initMapboxMap: failed to load initial style', err);
    });
}
