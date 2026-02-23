/**
 * Basic style switcher: buttons that switch between BASEMAP_STYLES (no vendor).
 */
function initBasemapSwitcher(map) {
    var styles = typeof BASEMAP_STYLES !== 'undefined' && Array.isArray(BASEMAP_STYLES) ? BASEMAP_STYLES : [];
    if (styles.length === 0) return;

    var container = document.createElement('div');
    container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group basemap-toggle-ctrl';

    var label = document.createElement('span');
    label.className = 'basemap-toggle-label';
    label.textContent = 'Style';
    container.appendChild(label);

    var buttons = [];
    styles.forEach(function (s, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'basemap-btn' + (i === 0 ? ' active' : '');
        btn.textContent = s.title;
        btn.dataset.uri = s.uri;
        btn.addEventListener('click', function () {
            var uri = btn.dataset.uri;
            if (!uri) return;
            if (typeof console !== 'undefined' && console.log) console.log('[Mapbox-Design] basemapSwitcher: setStyle', uri);
            map.setStyle(uri);
            buttons.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
        });
        container.appendChild(btn);
        buttons.push(btn);
    });

    map.on('style.load', function () {
        var style = map.getStyle();
        if (!style || !style.name) return;
        var name = style.name;
        styles.forEach(function (s, i) {
            if (name === 'FORTERRA_Light' && s.title === 'Light' || name === 'FORTERRA_Dark' && s.title === 'Dark') {
                buttons.forEach(function (b) { b.classList.remove('active'); });
                buttons[i].classList.add('active');
            }
        });
    });

    map.addControl({
        onAdd: function () { return container; },
        onRemove: function () { }
    }, 'top-left');
}
