/**
 * Legend initialization: unified panel with overlay layers + vehicle markers.
 * All overlay layers in one Overlays section.
 * Bundled by Vite; exposes window.addLegendControl(map).
 */

/** Manual legend entries for all overlay layers. */
var MANUAL_LEGEND_ENTRIES = [
  { name: 'Roads', type: 'line', color: '#6e6e6e' },
  { name: 'Waypoint route', type: 'line', color: '#758273' },
  { name: 'Port', type: 'fill', fill: '#a88f69', outline: '#473f3a' },
  { name: 'Main Operating Base', type: 'fill', fill: '#758273', outline: '#292e29' },
  { name: 'Combat Outpost', type: 'fill', fill: '#473f3a', outline: '#2e2e30' },
  { name: 'Direct & Indirect Fires', type: 'fill', fill: '#8b3a3a', outline: '#6b2a2a' }
];

var legendControlInstance = null;

/**
 * Creates the manual overlay section (Roads, Port, MOB, Combat Outpost).
 */
function createManualOverlaysSection() {
  var section = document.createElement('div');
  section.className = 'forterra-legend-overlays';

  MANUAL_LEGEND_ENTRIES.forEach(function (entry) {
    var item = document.createElement('div');
    item.className = 'forterra-legend-overlay-item';

    var swatch = document.createElement('span');
    swatch.className = 'forterra-legend-swatch forterra-legend-swatch--' + entry.type;
    if (entry.type === 'line') {
      swatch.style.backgroundColor = entry.color;
    } else if (entry.type === 'circle') {
      swatch.style.backgroundColor = entry.color;
    } else {
      swatch.style.backgroundColor = entry.fill;
      swatch.style.borderColor = entry.outline;
    }

    var label = document.createElement('span');
    label.className = 'forterra-legend-label';
    label.textContent = entry.name;

    item.appendChild(swatch);
    item.appendChild(label);
    section.appendChild(item);
  });

  return section;
}

/**
 * Creates the vehicle markers section.
 */
function createVehicleMarkersSection() {
  var wrap = document.createElement('div');
  wrap.className = 'forterra-legend-vehicles';

  var list = document.createElement('ul');
  list.className = 'forterra-legend-vehicles-list';

  var items = [
    { label: 'PLS', icon: 'deliverable-assets/pls.svg' },
    { label: 'JLTV Rogue Fires', icon: 'deliverable-assets/jltv_rogue_fires.svg' }
  ];

  items.forEach(function (item) {
    var li = document.createElement('li');
    var icon = document.createElement('span');
    icon.className = 'forterra-legend-vehicle-icon';
    icon.style.backgroundImage = 'url(' + item.icon + ')';
    var label = document.createElement('span');
    label.textContent = item.label;
    li.appendChild(icon);
    li.appendChild(label);
    list.appendChild(li);
  });

  wrap.appendChild(list);
  return wrap;
}

/**
 * Unified legend control: overlays + vehicle markers.
 * Single control so Mapbox attribution stays below.
 */
function ForterraLegendControl() {
  this._map = null;
  this._container = null;
}

ForterraLegendControl.prototype.onAdd = function (map) {
  this._map = map;

  var container = document.createElement('div');
  container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group forterra-legend-wrapper';

  var header = document.createElement('div');
  header.className = 'forterra-legend-header';
  header.textContent = 'Legend';

  var manualSection = document.createElement('details');
  manualSection.className = 'forterra-legend-section';
  manualSection.setAttribute('open', '');
  var manualSummary = document.createElement('summary');
  manualSummary.textContent = 'Overlays';
  manualSection.appendChild(manualSummary);
  manualSection.appendChild(createManualOverlaysSection());

  var vehiclesSection = document.createElement('details');
  vehiclesSection.className = 'forterra-legend-section';
  vehiclesSection.setAttribute('open', '');
  var vehiclesSummary = document.createElement('summary');
  vehiclesSummary.textContent = 'Waypoint markers';
  vehiclesSection.appendChild(vehiclesSummary);
  vehiclesSection.appendChild(createVehicleMarkersSection());

  container.appendChild(header);
  container.appendChild(manualSection);
  container.appendChild(vehiclesSection);

  this._container = container;
  return container;
};

ForterraLegendControl.prototype.onRemove = function () {
  this._map = null;
  this._container = null;
};

/**
 * Adds the legend control to the map. Call after overlays are loaded.
 * Re-call after style.load to refresh the legend for Light/Dark basemap.
 */
function addLegendControl(map) {
  if (!map) return;
  if (legendControlInstance) {
    try { map.removeControl(legendControlInstance); } catch (e) {}
    legendControlInstance = null;
  }

  var control = new ForterraLegendControl();
  map.addControl(control, 'bottom-right');
  legendControlInstance = control;
}

if (typeof window !== 'undefined') {
  window.addLegendControl = addLegendControl;
}
