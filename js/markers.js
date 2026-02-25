/**
 * Waypoint markers along roads (Port, Direct/Indirect Fires, Main Operating Base, Combat Outpost icons).
 * Icons: deliverable-assets (pls.svg, jltv_rogue_fires.svg).
 */
let markerInstances = [];

// Four markers on roads in Taipei area (coordinates from Taiwan road network)
const MARKER_DEFINITIONS = [
    { name: 'Point 1', coords: [121.52107, 25.07489], icon: 'deliverable-assets/pls.svg' },
    { name: 'Point 2', coords: [121.50870, 25.03777], icon: 'deliverable-assets/jltv_rogue_fires.svg' },
    { name: 'Point 3', coords: [121.52932, 24.97178], icon: 'deliverable-assets/pls.svg' },
    { name: 'Point 4', coords: [121.54169, 24.95941], icon: 'deliverable-assets/jltv_rogue_fires.svg' }
];

function addMarkers(map) {
    MARKER_DEFINITIONS.forEach(marker => {
        const el = document.createElement('div');
        el.style.width = '48px';
        el.style.height = '48px';
        el.style.backgroundImage = `url(${marker.icon})`;
        el.style.backgroundSize = 'contain';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.cursor = 'pointer';
        const m = new mapboxgl.Marker(el).setLngLat(marker.coords).addTo(map);
        markerInstances.push(m);
    });
}

function removeMarkersAndReadd(map) {
    markerInstances.forEach(m => m.remove());
    markerInstances = [];
    addMarkers(map);
    addLayerControl(map);
}
