/**
 * Callout styles for FORTERRA_Light basemap.
 * Brand-aligned: Dark Forest Green #292e29 text on light background.
 * See README.md and js/colors.js.
 */
(function (global) {
    'use strict';

    var c = typeof FORTERRA_COLORS !== 'undefined' ? FORTERRA_COLORS : {};
    var primary = c.primary || {};
    var CALLOUTS_LIGHT = {
        textColor: (primary.darkForestGreen || '#292e29'),
        textHaloColor: '#ffffff',
        textHaloWidth: 3,
        textSize: 13,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '600',
        fires: { textColor: (primary.darkForestGreen || '#292e29'), textHaloColor: '#ffffff', textHaloWidth: 3 }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CALLOUTS_LIGHT;
    } else {
        global.CALLOUTS_LIGHT = CALLOUTS_LIGHT;
    }
})(typeof window !== 'undefined' ? window : this);
