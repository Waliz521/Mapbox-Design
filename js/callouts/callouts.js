/**
 * Callouts for Port, Main Operating Base, Combat Outpost, Direct & Indirect Fires (numbered).
 * Waypoint markers: Waypoint 1, Waypoint 2, etc.
 * Power poles: no callouts.
 * Uses dedicated GeoJSON sources with centroid points + labels (Port 1, Port 2, etc.).
 */
(function (global) {
    'use strict';

    var CALLOUT_LAYER_IDS = [
        'callout-port',
        'callout-main-operating-base',
        'callout-combat-outpost',
        'callout-direct-indirect-fires',
        'callout-vehicles'
    ];

    var CALLOUT_SOURCE_IDS = [
        'callout-port-src',
        'callout-main-operating-base-src',
        'callout-combat-outpost-src',
        'callout-direct-indirect-fires-src'
    ];

    var LAYER_DEFS = [
        { layerIds: ['Port', 'port'], calloutId: 'callout-port', sourceId: 'callout-port-src', label: 'Port', dataUrl: 'data/geojson/Port.geojson' },
        { layerIds: ['Main-Operating-Base', 'main-operating-base'], calloutId: 'callout-main-operating-base', sourceId: 'callout-main-operating-base-src', label: 'Main Operating Base', dataUrl: 'data/geojson/Main_Operating_Base.geojson' },
        { layerIds: ['Combat-Outpost', 'combat-outpost'], calloutId: 'callout-combat-outpost', sourceId: 'callout-combat-outpost-src', label: 'Combat Outpost', dataUrl: 'data/geojson/Combat_Outpost.geojson' },
        { layerIds: ['Direct-Indirect-Fires', 'direct-indirect-fires'], calloutId: 'callout-direct-indirect-fires', sourceId: 'callout-direct-indirect-fires-src', label: 'Direct & Indirect Fires', dataUrl: 'data/geojson/Direct_Indirect_Fires.geojson', isFires: true }
    ];

    function isDarkStyle(map) {
        var s = map && map.getStyle && map.getStyle();
        var name = (s && s.name) ? String(s.name).toLowerCase() : '';
        return name.indexOf('light') === -1;
    }

    function getCalloutStyle(map, isFires) {
        var base = isDarkStyle(map)
            ? (typeof CALLOUTS_DARK !== 'undefined' ? CALLOUTS_DARK : { textColor: '#edebeb', textHaloColor: '#292e29', textHaloWidth: 2, textSize: 12 })
            : (typeof CALLOUTS_LIGHT !== 'undefined' ? CALLOUTS_LIGHT : { textColor: '#292e29', textHaloColor: '#edebeb', textHaloWidth: 2, textSize: 12 });
        if (isFires && base.fires) {
            return { textColor: base.fires.textColor, textHaloColor: base.fires.textHaloColor, textHaloWidth: base.fires.textHaloWidth || 3, textSize: base.textSize || 12 };
        }
        return base;
    }

    function resolveLayer(map, layerIds) {
        if (!map || !layerIds) return null;
        for (var i = 0; i < layerIds.length; i++) {
            var layer = map.getLayer(layerIds[i]);
            if (layer) return { id: layerIds[i] };
        }
        return null;
    }

    /** Compute centroid of polygon ring (average of coordinates). */
    function ringCentroid(ring) {
        if (!ring || ring.length === 0) return null;
        var sumLng = 0, sumLat = 0, n = ring.length;
        for (var i = 0; i < n; i++) {
            sumLng += ring[i][0];
            sumLat += ring[i][1];
        }
        return [sumLng / n, sumLat / n];
    }

    /** Extract first ring from Polygon or MultiPolygon. */
    function getFirstRing(geom) {
        if (!geom || !geom.coordinates) return null;
        if (geom.type === 'Polygon') return geom.coordinates[0];
        if (geom.type === 'MultiPolygon') return geom.coordinates[0] && geom.coordinates[0][0];
        return null;
    }

    /** Convert polygon GeoJSON to point features at centroids with numbered labels. */
    function polygonsToCalloutPoints(geojson, labelPrefix) {
        if (!geojson || !geojson.features) return { type: 'FeatureCollection', features: [] };
        var points = [];
        for (var i = 0; i < geojson.features.length; i++) {
            var f = geojson.features[i];
            var ring = getFirstRing(f.geometry);
            var c = ring ? ringCentroid(ring) : null;
            if (c) {
                points.push({
                    type: 'Feature',
                    properties: { callout_label: labelPrefix + ' ' + (i + 1) },
                    geometry: { type: 'Point', coordinates: c }
                });
            }
        }
        return { type: 'FeatureCollection', features: points };
    }

    function removeCalloutLayers(map) {
        CALLOUT_LAYER_IDS.forEach(function (id) {
            if (map.getLayer(id)) {
                try { map.removeLayer(id); } catch (e) {}
            }
        });
        CALLOUT_SOURCE_IDS.forEach(function (id) {
            if (map.getSource(id)) {
                try { map.removeSource(id); } catch (e) {}
            }
        });
        if (map.getSource('callout-vehicles')) {
            try { map.removeSource('callout-vehicles'); } catch (e) {}
        }
    }

    function addVehicleCallouts(map) {
        var defs = typeof MARKER_DEFINITIONS !== 'undefined' ? MARKER_DEFINITIONS : [];
        if (defs.length === 0) return;

        var features = defs.map(function (m, i) {
            return {
                type: 'Feature',
                properties: { callout_label: 'Waypoint ' + (i + 1) },
                geometry: { type: 'Point', coordinates: m.coords }
            };
        });
        var geojson = { type: 'FeatureCollection', features: features };

        if (map.getSource('callout-vehicles')) {
            map.getSource('callout-vehicles').setData(geojson);
        } else {
            try {
                map.addSource('callout-vehicles', { type: 'geojson', data: geojson });
            } catch (e) { return; }
        }

        var style = getCalloutStyle(map, false);
        if (map.getLayer('callout-vehicles')) return;
        try {
            map.addLayer({
                id: 'callout-vehicles',
                type: 'symbol',
                source: 'callout-vehicles',
                layout: {
                    'text-field': ['get', 'callout_label'],
                    'text-size': style.textSize || 12,
                    'text-font': ['Inter SemiBold', 'Space Grotesk Bold', 'Open Sans Regular', 'Arial Unicode MS Regular'],
                    'text-anchor': 'top',
                    'text-offset': [0, 0.8],
                    'text-allow-overlap': true,
                    'text-ignore-placement': true
                },
                paint: {
                    'text-color': style.textColor || '#edebeb',
                    'text-halo-color': style.textHaloColor || '#292e29',
                    'text-halo-width': style.textHaloWidth || 2
                }
            });
        } catch (e) {}
    }

    function addPolygonCallout(map, def, resolved) {
        var style = getCalloutStyle(map, def.isFires || false);

        fetch(def.dataUrl)
            .then(function (r) { return r.json(); })
            .then(function (gj) {
                var points = polygonsToCalloutPoints(gj, def.label);
                if (points.features.length === 0) return;

                if (map.getSource(def.sourceId)) {
                    map.getSource(def.sourceId).setData(points);
                } else {
                    try {
                        map.addSource(def.sourceId, { type: 'geojson', data: points });
                    } catch (e) { return; }
                }

                if (map.getLayer(def.calloutId)) return;
                try {
                    map.addLayer({
                        id: def.calloutId,
                        type: 'symbol',
                        source: def.sourceId,
                        layout: {
                            'text-field': ['get', 'callout_label'],
                            'text-size': style.textSize || 12,
                            'text-font': ['Inter SemiBold', 'Space Grotesk Bold', 'Open Sans Regular', 'Arial Unicode MS Regular'],
                            'text-anchor': 'center',
                            'text-allow-overlap': def.isFires ? true : false,
                            'text-ignore-placement': def.isFires ? true : false
                        },
                        paint: {
                            'text-color': style.textColor || '#edebeb',
                            'text-halo-color': style.textHaloColor || '#292e29',
                            'text-halo-width': style.textHaloWidth || 2
                        }
                    });
                    syncCalloutVisibility(map);
                } catch (e) {}
            })
            .catch(function () {});
    }

    function addCallouts(map) {
        if (!map || !map.getStyle) return;
        var dark = isDarkStyle(map);
        removeCalloutLayers(map);

        LAYER_DEFS.forEach(function (def) {
            var resolved = resolveLayer(map, def.layerIds);
            addPolygonCallout(map, def, resolved);
        });

        addVehicleCallouts(map);
        attachCalloutVisibilityListener(map);
    }

    var _calloutListenerAttached = false;
    function attachCalloutVisibilityListener(map) {
        if (_calloutListenerAttached || !map || !map.getContainer) return;
        _calloutListenerAttached = true;
        map.getContainer().addEventListener('change', function (e) {
            if (e.target && e.target.type === 'checkbox' && e.target.id && String(e.target.id).indexOf('layer-') === 0) {
                setTimeout(function () { syncCalloutVisibility(map); }, 0);
            }
        });
    }

    function syncCalloutVisibility(map) {
        if (!map) return;
        LAYER_DEFS.forEach(function (def) {
            var resolved = resolveLayer(map, def.layerIds);
            var baseVisibility = 'visible';
            if (resolved) baseVisibility = map.getLayoutProperty(resolved.id, 'visibility') === 'none' ? 'none' : 'visible';
            if (map.getLayer(def.calloutId)) {
                try { map.setLayoutProperty(def.calloutId, 'visibility', baseVisibility); } catch (e) {}
            }
        });
    }

    if (typeof window !== 'undefined') {
        window.addCallouts = addCallouts;
        window.removeCalloutLayers = removeCalloutLayers;
        window.syncCalloutVisibility = syncCalloutVisibility;
    }
})(typeof window !== 'undefined' ? window : this);
