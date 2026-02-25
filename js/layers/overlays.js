/**
 * GeoJSON overlay layers: roads, port, main operating base, combat outpost, direct & indirect fires.
 * When the basemap style (e.g. FORTERRA_Dark) already includes these layers from Mapbox Studio,
 * we use those; otherwise we add sources/layers from local GeoJSON. No custom popups.
 * Hex values: see js/colors.js and README.md.
 *
 * Direct & Indirect Fires (client inspiration from refs):
 * - Tactical CONOPS: semi-transparent red polygons for engagement/danger zones; optional explosion graphics.
 * - US Navy / Rogue Fires: red conical “strike” zones; red for strike/danger, clear “fires” label.
 * Implement as: red fill (semi-transparent) + diagonal-stripe pattern (danger-zone style) + darker red outline.
 */

var DIRECT_INDIRECT_FIRES_PATTERN_ID = 'direct-indirect-fires-stripes';

/** Creates a diagonal-stripe pattern image for danger/fire zones (tactical style). Returns a Promise that resolves when the image is ready to add. */
function createDirectIndirectFiresPatternImage(stripeColor) {
    stripeColor = stripeColor || '#6b2a2a';
    var size = 32;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    var stripeSpacing = 10;
    var lineWidth = 2;
    ctx.strokeStyle = stripeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'square';
    for (var i = -size; i <= size * 2; i += stripeSpacing) {
        ctx.beginPath();
        ctx.moveTo(i, -size);
        ctx.lineTo(i + size, size * 2);
        ctx.stroke();
    }
    return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { reject(new Error('Pattern image failed')); };
        img.src = canvas.toDataURL('image/png');
    });
}

function hasLayer(map, possibleIds) {
    return possibleIds.some(function (id) { return map.getLayer(id); });
}

function addOverlays(map) {
    const c = (typeof FORTERRA_COLORS !== 'undefined' ? FORTERRA_COLORS : {
        overlays: { roads: '#6e6e6e', port: { fill: '#a88f69', outline: '#473f3a' }, mainOperatingBase: { fill: '#758273', outline: '#292e29' }, combatOutpost: { fill: '#473f3a', outline: '#2e2e30' } },
        optional: { firesFill: '#8b3a3a', firesOutline: '#6b2a2a' }
    });

    // Roads – use style layer (Roads) if present, else add from GeoJSON
    if (!hasLayer(map, ['Roads', 'roads'])) {
        map.addSource('roads', {
            type: 'geojson',
            data: 'data/geojson/Taiwan_Roads.geojson'
        });
        map.addLayer({
            id: 'roads',
            type: 'line',
            source: 'roads',
            layout: { 'visibility': 'visible' },
            paint: {
                'line-color': c.overlays.roads,
                'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1, 12, 2, 15, 3]
            },
            metadata: { name: 'Roads' }
        });
    }

    // Port – use style layer (Port) if present, else add from GeoJSON
    if (!hasLayer(map, ['Port', 'port'])) {
        map.addSource('port', {
            type: 'geojson',
            data: 'data/geojson/Port.geojson'
        });
        map.addLayer({
            id: 'port',
            type: 'fill',
            source: 'port',
            layout: { 'visibility': 'visible' },
            paint: {
                'fill-color': c.overlays.port.fill,
                'fill-opacity': 0.6,
                'fill-outline-color': c.overlays.port.outline
            },
            metadata: { name: 'Port' }
        });
    }

    // Main Operating Base – use style layer if present, else add from GeoJSON
    if (!hasLayer(map, ['Main-Operating-Base', 'main-operating-base'])) {
        map.addSource('main-operating-base', {
            type: 'geojson',
            data: 'data/geojson/Main_Operating_Base.geojson'
        });
        map.addLayer({
            id: 'main-operating-base',
            type: 'fill',
            source: 'main-operating-base',
            layout: { 'visibility': 'visible' },
            paint: {
                'fill-color': c.overlays.mainOperatingBase.fill,
                'fill-opacity': 0.7,
                'fill-outline-color': c.overlays.mainOperatingBase.outline
            },
            metadata: { name: 'Main Operating Base' }
        });
    }

    // Combat Outpost – use style layer if present, else add from GeoJSON
    if (!hasLayer(map, ['Combat-Outpost', 'combat-outpost'])) {
        map.addSource('combat-outpost', {
            type: 'geojson',
            data: 'data/geojson/Combat_Outpost.geojson'
        });
        map.addLayer({
            id: 'combat-outpost',
            type: 'fill',
            source: 'combat-outpost',
            layout: { 'visibility': 'visible' },
            paint: {
                'fill-color': c.overlays.combatOutpost.fill,
                'fill-opacity': 0.7,
                'fill-outline-color': c.overlays.combatOutpost.outline
            },
            metadata: { name: 'Combat Outpost' }
        });
    }

    // Direct & Indirect Fires (engagement/danger zones – patterned fill + outline)
    var firesFill = (c.optional && c.optional.firesFill) ? c.optional.firesFill : '#8b3a3a';
    var firesOutline = (c.optional && c.optional.firesOutline) ? c.optional.firesOutline : '#6b2a2a';
    var existingFiresLayerId = map.getLayer('direct-indirect-fires') ? 'direct-indirect-fires' : (map.getLayer('Direct-Indirect-Fires') ? 'Direct-Indirect-Fires' : null);

    if (!existingFiresLayerId) {
        map.addSource('direct-indirect-fires', {
            type: 'geojson',
            data: 'data/geojson/Direct_Indirect_Fires.geojson'
        });
    }

    function applyFiresPattern(patternImg) {
        try {
            map.addImage(DIRECT_INDIRECT_FIRES_PATTERN_ID, patternImg, { pixelRatio: 2 });
        } catch (e) {}
        if (existingFiresLayerId) {
            map.setPaintProperty(existingFiresLayerId, 'fill-pattern', DIRECT_INDIRECT_FIRES_PATTERN_ID);
            map.setPaintProperty(existingFiresLayerId, 'fill-opacity', 0.26);
            map.setPaintProperty(existingFiresLayerId, 'fill-color', firesFill);
            map.setPaintProperty(existingFiresLayerId, 'fill-outline-color', firesOutline);
        } else if (map.getSource('direct-indirect-fires') && !map.getLayer('direct-indirect-fires')) {
            map.addLayer({
                id: 'direct-indirect-fires',
                type: 'fill',
                source: 'direct-indirect-fires',
                layout: { 'visibility': 'visible' },
                paint: {
                    'fill-color': firesFill,
                    'fill-opacity': 0.26,
                    'fill-pattern': DIRECT_INDIRECT_FIRES_PATTERN_ID,
                    'fill-outline-color': firesOutline
                },
                metadata: { name: 'Direct & Indirect Fires' }
            });
            if (typeof addLayerControl === 'function') addLayerControl(map);
        }
    }

    createDirectIndirectFiresPatternImage(firesOutline).then(function (patternImg) {
        applyFiresPattern(patternImg);
    }).catch(function () {
        if (!existingFiresLayerId && !map.getLayer('direct-indirect-fires') && map.getSource('direct-indirect-fires')) {
            map.addLayer({
                id: 'direct-indirect-fires',
                type: 'fill',
                source: 'direct-indirect-fires',
                layout: { 'visibility': 'visible' },
                paint: {
                    'fill-color': firesFill,
                    'fill-opacity': 0.24,
                    'fill-outline-color': firesOutline
                },
                metadata: { name: 'Direct & Indirect Fires' }
            });
            if (typeof addLayerControl === 'function') addLayerControl(map);
        }
    });

    // Power poles – use style layer (Power-poles) if present, else add from GeoJSON. Do not draw yellow circles (dots) so style’s power-pole symbology (e.g. blue icons) is not duplicated.
    if (!hasLayer(map, ['Power-poles', 'power-poles', 'forterra-power-poles'])) {
        map.addSource('forterra-power-poles', {
            type: 'geojson',
            data: 'data/geojson/Power_poles.geojson'
        });
        map.addLayer({
            id: 'forterra-power-poles',
            type: 'circle',
            source: 'forterra-power-poles',
            layout: { 'visibility': 'visible' },
            paint: {
                'circle-radius': 0,
                'circle-opacity': 0,
                'circle-color': '#ffff00',
                'circle-stroke-width': 0
            },
            metadata: { name: 'Power poles' }
        });
    }

    // Waypoint route – line connecting marker waypoints (from MARKER_DEFINITIONS). Styled like roads, uses accent color to distinguish.
    addWaypointRoute(map);
}

/** Adds a route line connecting waypoint markers. Uses roads-style color from brand palette. */
function addWaypointRoute(map) {
    var defs = typeof MARKER_DEFINITIONS !== 'undefined' ? MARKER_DEFINITIONS : [];
    if (defs.length < 2) return;
    var coords = defs.map(function (d) { return d.coords; });
    var routeGeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: coords }
    };
    var routeData = { type: 'FeatureCollection', features: [routeGeoJSON] };
    var lineColor = (typeof FORTERRA_COLORS !== 'undefined' && FORTERRA_COLORS.ui && FORTERRA_COLORS.ui.accent) ? FORTERRA_COLORS.ui.accent : '#758273';
    if (map.getSource('waypoint-route')) {
        map.getSource('waypoint-route').setData(routeData);
    } else {
        map.addSource('waypoint-route', { type: 'geojson', data: routeData });
    }
    if (!map.getLayer('waypoint-route')) {
        map.addLayer({
            id: 'waypoint-route',
            type: 'line',
            source: 'waypoint-route',
            layout: { 'visibility': 'visible' },
            paint: {
                'line-color': lineColor,
                'line-width': ['interpolate', ['linear'], ['zoom'], 8, 2, 12, 3, 15, 4],
                'line-dasharray': [2, 1]
            },
            metadata: { name: 'Waypoint route' }
        });
    }
}
