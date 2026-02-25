/**
 * Callout styles for FORTERRA_Dark basemap.
 * Brand-aligned: UI text #edebeb, halo Dark Forest Green #292e29, fires #ffffff on #6b2a2a.
 * See README.md and js/colors.js.
 */
(function (global) {
    'use strict';

    var c = typeof FORTERRA_COLORS !== 'undefined' ? FORTERRA_COLORS : {};
    var ui = c.ui || {};
    var opt = c.optional || {};
    var CALLOUTS_DARK = {
        textColor: (ui.text || '#edebeb'),
        textHaloColor: (c.primary && c.primary.darkForestGreen) || '#292e29',
        textHaloWidth: 2,
        textSize: 13,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '600',
        fires: { textColor: '#ffffff', textHaloColor: (opt.firesOutline || '#6b2a2a'), textHaloWidth: 3 }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CALLOUTS_DARK;
    } else {
        global.CALLOUTS_DARK = CALLOUTS_DARK;
    }
})(typeof window !== 'undefined' ? window : this);
