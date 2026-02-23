/**
 * Entry point: initializes map with style (terrain stripped), then adds controls, overlays, markers, layer control, and basemap switcher.
 */
var isInitialLoad = true;

if (typeof window !== 'undefined') {
    window.addEventListener('error', function (ev) {
        console.error('[Mapbox-Design] uncaught error', {
            message: ev.message,
            filename: ev.filename,
            lineno: ev.lineno,
            colno: ev.colno,
            error: ev.error
        });
    });
    window.addEventListener('unhandledrejection', function (ev) {
        console.error('[Mapbox-Design] unhandled promise rejection', { reason: ev.reason });
    });
}

function logMain(msg, data) {
    if (typeof console !== 'undefined' && console.log) {
        if (data !== undefined) console.log('[Mapbox-Design]', msg, data);
        else console.log('[Mapbox-Design]', msg);
    }
}

if (typeof initMapboxMap === 'function') {
    initMapboxMap(function () {
        addControlsAndOverlays();
    });
} else {
    console.warn('[Mapbox-Design] initMapboxMap not found.');
}

function addControlsAndOverlays() {
    var map = window.map;
    if (!map) {
        logMain('addControlsAndOverlays: no map, skip');
        return;
    }
    logMain('addControlsAndOverlays: start');
    try { map.setTerrain(null); } catch (_) {}
    map.addControl(new mapboxgl.NavigationControl());
    addOverlays(map);
    addMarkers(map);
    if (typeof applyBuildingHeightClassification === 'function') applyBuildingHeightClassification(map);
    if (typeof addElevationMesh === 'function') addElevationMesh(map);
    initBasemapSwitcher(map);
    if (typeof addMeshToggleControl === 'function') addMeshToggleControl(map);
    addLayerControl(map);

    map.on('style.load', function () {
        logMain('style.load fired', { isInitialLoad: isInitialLoad });
        try { map.setTerrain(null); } catch (_) {}
        if (typeof removeDeprecatedSourcesFromMap === 'function') removeDeprecatedSourcesFromMap(map);
        if (typeof removeHillshadeLayersFromMap === 'function') removeHillshadeLayersFromMap(map);
        if (!isInitialLoad) {
            logMain('style.load: re-adding overlays, markers, layer control, syncing mesh toggle');
            addOverlays(map);
            removeMarkersAndReadd(map);
            if (typeof applyBuildingHeightClassification === 'function') applyBuildingHeightClassification(map);
            if (typeof addElevationMesh === 'function') addElevationMesh(map);
            addLayerControl(map);
            if (typeof syncMeshToggleAfterStyleLoad === 'function') syncMeshToggleAfterStyleLoad(map);
        }
        isInitialLoad = false;
    });
    logMain('addControlsAndOverlays: done');
}
