/**
 * Layer control: panel with checkboxes to show/hide overlay layers (roads, port, bases).
 * Right-click a layer for "Zoom to layer" context menu.
 */
function getBoundsFromGeoJSON(geojson) {
    var minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    function addPoint(lng, lat) {
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
    }
    function processCoords(c) {
        if (typeof c[0] === 'number') {
            addPoint(c[0], c[1]);
            return;
        }
        c.forEach(processCoords);
    }
    var features = (geojson.features || [geojson]);
    features.forEach(function (f) {
        var g = f.geometry;
        if (!g || !g.coordinates) return;
        processCoords(g.coordinates);
    });
    if (minLng === Infinity) return null;
    return [[minLng, minLat], [maxLng, maxLat]];
}

class BasicLayerControl {
    constructor(layers) {
        this.layers = layers;
        this.expanded = false;
        this.contextMenu = null;
    }

    onAdd(map) {
        this.map = map;
        this.container = document.createElement('div');
        this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-layers';

        const header = document.createElement('div');
        header.className = 'mapboxgl-ctrl-layers-header';

        const title = document.createElement('span');
        title.textContent = 'Layers';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mapboxgl-ctrl-layers-toggle';
        toggleBtn.innerHTML = '☰';
        toggleBtn.setAttribute('aria-label', 'Toggle layers');
        toggleBtn.addEventListener('click', () => this.toggle());

        header.appendChild(title);
        header.appendChild(toggleBtn);
        this.container.appendChild(header);

        const list = document.createElement('ul');
        list.className = 'mapboxgl-ctrl-layers-list';
        this.list = list;

        var self = this;
        this.layers.forEach(layer => {
            const item = document.createElement('li');
            item.className = 'mapboxgl-ctrl-layers-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `layer-${layer.id}`;
            checkbox.checked = layer.visible !== false;
            checkbox.addEventListener('change', function (e) {
                if (!map.getLayer(layer.id)) return;
                var visibility = e.target.checked ? 'visible' : 'none';
                map.setLayoutProperty(layer.id, 'visibility', visibility);
            });

            const label = document.createElement('label');
            label.htmlFor = `layer-${layer.id}`;
            label.textContent = layer.name;

            item.appendChild(checkbox);
            item.appendChild(label);

            if (layer.dataUrl) {
                item.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                    self.showContextMenu(e, layer);
                });
            }

            list.appendChild(item);
        });

        this._boundCloseContext = function () { self.closeContextMenu(); };
        document.addEventListener('click', this._boundCloseContext);
        this.container.appendChild(list);
        this.collapse();
        return this.container;
    }

    showContextMenu(e, layer) {
        this.closeContextMenu();
        var menu = document.createElement('div');
        menu.className = 'mapboxgl-ctrl-layers-contextmenu';
        menu.innerHTML = '<button type="button" class="mapboxgl-ctrl-layers-zoom">Zoom to layer</button>';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        document.body.appendChild(menu);
        this.contextMenu = menu;

        var self = this;
        menu.querySelector('.mapboxgl-ctrl-layers-zoom').addEventListener('click', function () {
            self.zoomToLayer(layer);
            self.closeContextMenu();
        });
    }

    closeContextMenu() {
        if (this.contextMenu && this.contextMenu.parentNode) {
            this.contextMenu.parentNode.removeChild(this.contextMenu);
        }
        this.contextMenu = null;
    }

    zoomToLayer(layer) {
        if (!layer.dataUrl || !this.map) return;
        var self = this;
        fetch(layer.dataUrl)
            .then(function (r) { return r.json(); })
            .then(function (geojson) {
                var bbox = getBoundsFromGeoJSON(geojson);
                if (bbox) {
                    self.map.fitBounds(bbox, { padding: 60, maxZoom: 14, duration: 800 });
                }
            })
            .catch(function () {});
    }

    toggle() {
        this.expanded = !this.expanded;
        if (this.expanded) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    expand() {
        this.list.style.display = 'block';
        this.container.classList.add('expanded');
    }

    collapse() {
        this.list.style.display = 'none';
        this.container.classList.remove('expanded');
    }

    onRemove() {
        this.closeContextMenu();
        if (this._boundCloseContext) {
            document.removeEventListener('click', this._boundCloseContext);
        }
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
}

let layerControlInstance = null;

/** Possible layer ids: style (Mapbox Studio) vs our GeoJSON. First id that exists on the map is used. (Elevation mesh is separate; see addMeshToggleControl.) */
const LAYER_DEFINITIONS = [
    { ids: ['Roads', 'roads'], name: 'Roads', visible: true, dataUrl: 'data/geojson/Taiwan_Roads.geojson' },
    { ids: ['Port', 'port'], name: 'Port', visible: true, dataUrl: 'data/geojson/Port.geojson' },
    { ids: ['Main-Operating-Base', 'main-operating-base'], name: 'Main Operating Base', visible: true, dataUrl: 'data/geojson/Main_Operating_Base.geojson' },
    { ids: ['Combat-Outpost', 'combat-outpost'], name: 'Combat Outpost', visible: true, dataUrl: 'data/geojson/Combat_Outpost.geojson' },
    { ids: ['Direct-Indirect-Fires', 'direct-indirect-fires'], name: 'Direct & Indirect Fires', visible: true, dataUrl: 'data/geojson/Direct_Indirect_Fires.geojson' },
    { ids: ['Power-poles', 'power-poles', 'forterra-power-poles'], name: 'Power poles', visible: true, dataUrl: 'data/geojson/Power_poles.geojson' }
];

function resolveLayerId(map, def) {
    if (!map || !def.ids) return null;
    for (var i = 0; i < def.ids.length; i++) {
        if (map.getLayer(def.ids[i])) return def.ids[i];
    }
    return null;
}

function addLayerControl(map) {
    if (layerControlInstance) map.removeControl(layerControlInstance);
    var resolved = LAYER_DEFINITIONS.map(function (def) {
        var id = resolveLayerId(map, def);
        return id ? { id: id, name: def.name, visible: def.visible !== false, dataUrl: def.dataUrl } : null;
    }).filter(Boolean);
    if (typeof console !== 'undefined' && console.log) {
        console.log('[Mapbox-Design] addLayerControl: resolved layers', resolved.map(function (r) { return r.id + ' (' + r.name + ')'; }));
    }
    layerControlInstance = new BasicLayerControl(resolved);
    map.addControl(layerControlInstance, 'top-left');
}

/** Separate toggle for elevation mesh layer (off by default). When turned on, shows on-screen notes. Added only once on initial load; use syncMeshToggleAfterStyleLoad on style.load to fix duplicates and sync state. */
var meshToggleControlInstance = null;

function addMeshToggleControl(map) {
    if (!map.getLayer('elevation-mesh')) {
        if (typeof console !== 'undefined' && console.warn) console.warn('[Mapbox-Design] addMeshToggleControl: elevation-mesh layer not found, skip');
        return;
    }
    if (meshToggleControlInstance) map.removeControl(meshToggleControlInstance);
    if (typeof console !== 'undefined' && console.log) console.log('[Mapbox-Design] addMeshToggleControl: adding control');

    var container = document.createElement('div');
    container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mesh-toggle-ctrl';

    var label = document.createElement('span');
    label.className = 'mesh-toggle-label';
    label.textContent = 'Elevation mesh';
    container.appendChild(label);

    var wrap = document.createElement('label');
    wrap.className = 'mesh-toggle-wrap';
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = false;
    checkbox.className = 'mesh-toggle-checkbox';
    checkbox.id = 'mesh-layer-toggle';
    wrap.appendChild(checkbox);
    var span = document.createElement('span');
    span.textContent = 'Show elevation dots';
    wrap.appendChild(span);
    container.appendChild(wrap);

    checkbox.addEventListener('change', function () {
        var visible = checkbox.checked ? 'visible' : 'none';
        map.setLayoutProperty('elevation-mesh', 'visibility', visible);
        if (checkbox.checked) {
            if (typeof updateElevationMeshGrid === 'function') updateElevationMeshGrid(map);
            if (typeof window.showElevationMeshNotes === 'function') window.showElevationMeshNotes();
        } else {
            if (typeof window.hideElevationMeshNotes === 'function') window.hideElevationMeshNotes();
        }
    });

    meshToggleControlInstance = {
        onAdd: function () { return container; },
        onRemove: function () {
            if (typeof window.hideElevationMeshNotes === 'function') window.hideElevationMeshNotes();
        }
    };
    map.addControl(meshToggleControlInstance, 'top-left');
}

/** Call after style.load: remove duplicate mesh toggle panels (orphaned DOM) and sync checkbox to layer visibility. Do not re-add the control. */
function syncMeshToggleAfterStyleLoad(map) {
    if (!map || !map.getContainer) return;
    var topLeft = map.getContainer().querySelector('.mapboxgl-ctrl-top-left');
    if (!topLeft) return;
    var meshPanels = topLeft.querySelectorAll('.mesh-toggle-ctrl');
    if (meshPanels.length > 1 && typeof console !== 'undefined' && console.log) {
        console.log('[Mapbox-Design] syncMeshToggleAfterStyleLoad: removing duplicate mesh toggles', { count: meshPanels.length, removing: meshPanels.length - 1 });
    }
    for (var i = 1; i < meshPanels.length; i++) {
        var p = meshPanels[i].parentNode;
        if (p) p.removeChild(meshPanels[i]);
    }
    var first = topLeft.querySelector('.mesh-toggle-ctrl');
    if (first) {
        var cb = first.querySelector('input.mesh-toggle-checkbox');
        if (cb) {
            cb.checked = false;
        }
    }
    if (typeof window.hideElevationMeshNotes === 'function') window.hideElevationMeshNotes();
}
