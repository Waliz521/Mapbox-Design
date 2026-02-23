/**
 * Building height classification for dark basemap using Forterra brand colors.
 * Applies data-driven fill-extrusion-color to 3D building layers by height (meters).
 * Color tiers: low (dark) → high (lighter). See FORTERRA_COLORS.md and js/colors.js.
 */

function getBuildingHeightColorExpression() {
    var tiers = (typeof FORTERRA_COLORS !== 'undefined' && FORTERRA_COLORS.buildings && FORTERRA_COLORS.buildings.heightColors)
        ? FORTERRA_COLORS.buildings.heightColors
        : [
            { maxMeters: 8, color: '#2e2e30' },
            { maxMeters: 15, color: '#473f3a' },
            { maxMeters: 30, color: '#292e29' },
            { maxMeters: 60, color: '#758273' },
            { maxMeters: Infinity, color: '#b0a194' }
        ];
    var defaultColor = tiers[0] ? tiers[0].color : '#2e2e30';
    var heightValue = ['coalesce', ['get', 'height'], ['get', 'min_height'], 5];
    var stepArgs = [heightValue, defaultColor];
    for (var i = 0; i < tiers.length; i++) {
        if (tiers[i].maxMeters !== Infinity) {
            stepArgs.push(tiers[i].maxMeters);
            stepArgs.push(tiers[i].color);
        }
    }
    return ['step'].concat(stepArgs);
}

function applyBuildingHeightClassification(map) {
    if (!map || !map.getStyle || !map.getStyle().layers) return;
    var style = map.getStyle();
    var colorExpr = getBuildingHeightColorExpression();
    var applied = [];
    style.layers.forEach(function (layer) {
        if (layer.type === 'fill-extrusion') {
            try {
                map.setPaintProperty(layer.id, 'fill-extrusion-color', colorExpr);
                applied.push(layer.id);
            } catch (e) {
                if (typeof console !== 'undefined' && console.warn) console.warn('[Mapbox-Design] buildingHeight: setPaintProperty failed for ' + layer.id, e);
            }
        }
    });
    if (typeof console !== 'undefined' && console.log) {
        if (applied.length) console.log('[Mapbox-Design] buildingHeight: applied to layers', applied);
        else console.log('[Mapbox-Design] buildingHeight: no fill-extrusion layers found in style');
    }
}

if (typeof window !== 'undefined') {
    window.applyBuildingHeightClassification = applyBuildingHeightClassification;
}
