/**
 * Elevation mesh layer: samples terrain elevation on a grid and draws dots (mesh-of-elevation look).
 * Taiwan: plains/cities ~0–150 m, mountains up to ~3,952 m. Dots are transparent in low-elevation
 * (cities) and visible in mountainous regions. In 3D view many dots are occluded by terrain; we use
 * a denser grid when pitched so the visible subset stays dense.
 */
var ELEVATION_MESH_GRID_SIZE_BASE = 72;
var ELEVATION_MESH_GRID_SIZE_3D = 110;
var ELEVATION_MESH_SOURCE_ID = 'elevation-mesh';
var ELEVATION_MESH_LAYER_ID = 'elevation-mesh';

/** Set to true to log grid updates and help debug dots disappearing in 3D (data vs occlusion). */
var ELEVATION_MESH_DEBUG = false;

function getRasterDemSourceId(style) {
    if (!style || !style.sources) return null;
    if (style.sources['mapbox-dem']) return 'mapbox-dem';
    var ids = Object.keys(style.sources);
    for (var i = 0; i < ids.length; i++) {
        if (style.sources[ids[i]] && style.sources[ids[i]].type === 'raster-dem') return ids[i];
    }
    return null;
}

function ensureTerrainForMesh(map) {
    try {
        var style = map.getStyle();
        if (!style || !style.sources) return;
        var demId = getRasterDemSourceId(style);
        if (!demId) {
            demId = 'mapbox-dem';
            map.addSource(demId, {
                type: 'raster-dem',
                url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                tileSize: 512,
                maxzoom: 14
            });
        }
        map.setTerrain({ source: demId, exaggeration: 1 });
    } catch (e) {}
}

function updateElevationMeshGrid(map) {
    var source = map.getSource(ELEVATION_MESH_SOURCE_ID);
    if (!source) return;

    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    var lngMin = sw.lng, latMin = sw.lat, lngMax = ne.lng, latMax = ne.lat;
    var pitch = typeof map.getPitch === 'function' ? map.getPitch() : 0;
    var n = pitch > 25 ? ELEVATION_MESH_GRID_SIZE_3D : ELEVATION_MESH_GRID_SIZE_BASE;
    var features = [];
    var lngStep = (lngMax - lngMin) / (n - 1);
    var latStep = (latMax - latMin) / (n - 1);

    var elevations = [];
    var nullIndices = [];
    var i, j, lng, lat, elev, idx;
    idx = 0;
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            lng = lngMin + j * lngStep;
            lat = latMin + i * latStep;
            elev = null;
            try {
                elev = map.queryTerrainElevation([lng, lat], { exaggerated: true });
            } catch (err) {}
            if (elev == null) {
                nullIndices.push(idx);
                elevations.push(null);
            } else {
                elevations.push(elev);
            }
            idx++;
        }
    }

    var sum = 0;
    var count = 0;
    for (i = 0; i < elevations.length; i++) {
        if (elevations[i] != null) {
            sum += elevations[i];
            count++;
        }
    }
    var fallbackElev = count > 0 ? sum / count : 400;

    for (i = 0; i < nullIndices.length; i++) {
        elevations[nullIndices[i]] = fallbackElev;
    }

    var nullCount = nullIndices.length;
    var visibleCount = 0;
    idx = 0;
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            lng = lngMin + j * lngStep;
            lat = latMin + i * latStep;
            elev = elevations[idx];
            if (elev >= 600) visibleCount++;
            features.push({
                type: 'Feature',
                properties: { elevation: elev },
                geometry: { type: 'Point', coordinates: [lng, lat] }
            });
            idx++;
        }
    }

    source.setData({ type: 'FeatureCollection', features: features });
}

function addElevationMesh(map) {
    if (map.getSource(ELEVATION_MESH_SOURCE_ID)) return;
    ensureTerrainForMesh(map);

    map.addSource(ELEVATION_MESH_SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
    });

    var beforeId = map.getLayer('roads') ? 'roads' : (map.getLayer('Roads') ? 'Roads' : undefined);
    map.addLayer({
        id: ELEVATION_MESH_LAYER_ID,
        type: 'circle',
        source: ELEVATION_MESH_SOURCE_ID,
        minzoom: 9,
        maxzoom: 24,
        layout: { visibility: 'none' },
        paint: {
            'circle-pitch-alignment': 'viewport',
            'circle-pitch-scale': 'viewport',
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 0.6, 12, 1, 14, 1.5],
            'circle-color': '#ffffff',
            'circle-opacity': [
                'interpolate', ['linear'], ['get', 'elevation'],
                0, 0,
                120, 0,
                200, 0.35,
                400, 0.75,
                600, 1,
                1000, 1
            ],
            'circle-emissive-strength': 1,
            'circle-blur': 0.1,
            'circle-stroke-width': 0
        }
    }, beforeId);

    function onMoveEnd() {
        updateElevationMeshGrid(map);
    }

    function onPitchEnd() {
        updateElevationMeshGrid(map);
    }

    map.on('moveend', onMoveEnd);
    map.on('pitchend', onPitchEnd);
    map.once('idle', function () {
        updateElevationMeshGrid(map);
    });
}

/** On-screen notes shown when user turns elevation mesh on. */
var ELEVATION_MESH_NOTES = [
    'Samples terrain elevation on a grid (mesh-of-elevation look).',
    'Taiwan: plains/cities ~0–150 m, mountains up to ~3,952 m.',
    'Dots are transparent in low-elevation areas and visible in mountainous regions.',
    'In 3D view a denser grid is used when pitched so the visible subset stays dense.'
];

var elevationMeshNotesEl = null;

function showElevationMeshNotes() {
    if (elevationMeshNotesEl && elevationMeshNotesEl.parentNode) return;
    var wrap = document.createElement('div');
    wrap.id = 'elevation-mesh-notes';
    wrap.className = 'elevation-mesh-notes';
    var title = document.createElement('div');
    title.className = 'elevation-mesh-notes-title';
    title.textContent = 'Elevation mesh';
    var list = document.createElement('ul');
    list.className = 'elevation-mesh-notes-list';
    ELEVATION_MESH_NOTES.forEach(function (line) {
        var li = document.createElement('li');
        li.textContent = line;
        list.appendChild(li);
    });
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'elevation-mesh-notes-close';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '×';
    close.addEventListener('click', hideElevationMeshNotes);
    wrap.appendChild(title);
    wrap.appendChild(list);
    wrap.appendChild(close);
    document.body.appendChild(wrap);
    elevationMeshNotesEl = wrap;
}

function hideElevationMeshNotes() {
    if (elevationMeshNotesEl && elevationMeshNotesEl.parentNode) {
        elevationMeshNotesEl.parentNode.removeChild(elevationMeshNotesEl);
    }
    elevationMeshNotesEl = null;
}

if (typeof window !== 'undefined') {
    window.showElevationMeshNotes = showElevationMeshNotes;
    window.hideElevationMeshNotes = hideElevationMeshNotes;
}
