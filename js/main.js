/**
 * Entry point: initializes map with style (terrain stripped), then adds controls, overlays, markers, layer control, and basemap switcher.
 */
var isInitialLoad = true;

if (typeof window !== 'undefined') {
    window.addEventListener('error', function () {});
    window.addEventListener('unhandledrejection', function () {});
}

if (typeof initMapboxMap === 'function') {
    initMapboxMap(function () {
        addControlsAndOverlays();
    });
}

function addControlsAndOverlays() {
    var map = window.map;
    if (!map) return;
    try { map.setTerrain(null); } catch (_) {}
    map.addControl(new mapboxgl.NavigationControl());
    addOverlays(map);
    addMarkers(map);
    if (typeof addElevationMesh === 'function') addElevationMesh(map);
    initBasemapSwitcher(map);
    if (typeof updateMeshToggleForStyle === 'function') updateMeshToggleForStyle(map);
    addLayerControl(map);

    map.on('style.load', function () {
        try { map.setTerrain(null); } catch (_) {}
        if (typeof removeDeprecatedSourcesFromMap === 'function') removeDeprecatedSourcesFromMap(map);
        if (typeof removeHillshadeLayersFromMap === 'function') removeHillshadeLayersFromMap(map);
        if (!isInitialLoad) {
            addOverlays(map);
            removeMarkersAndReadd(map);
            if (typeof addElevationMesh === 'function') addElevationMesh(map);
            addLayerControl(map);
        }
        if (typeof updateMeshToggleForStyle === 'function') updateMeshToggleForStyle(map);
        isInitialLoad = false;
    });
}
