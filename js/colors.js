/**
 * Forterra brand colors (FORTERRA Brand Guidelines). See README.md.
 * Primary: Dark Forest Green, Light Army Green, Cool Charcoal, Light Gray.
 * Secondary: Bark, Dust, Desert Sand, Light Warm Neutral, Medium Gray.
 */
const FORTERRA_COLORS = {
    primary: {
        darkForestGreen: '#292e29',
        lightArmyGreen: '#758273',
        coolCharcoal: '#2e2e30',
        lightGray: '#dbdbdb'
    },
    secondary: {
        bark: '#473f3a',
        dust: '#b0a194',
        desertSand: '#a88f69',
        lightWarmNeutral: '#edebeb',
        mediumGray: '#6e6e6e'
    },
    overlays: {
        roads: '#6e6e6e',
        port: { fill: '#a88f69', outline: '#473f3a' },
        mainOperatingBase: { fill: '#758273', outline: '#292e29' },
        combatOutpost: { fill: '#473f3a', outline: '#2e2e30' }
    },
    ui: {
        background: '#292e29',
        text: '#edebeb',
        accent: '#758273',
        border: '#2e2e30',
        hover: '#3d423d'
    },
    /** Building height classification (dark basemap): low → high = dark → light. Heights in meters. */
    buildings: {
        heightColors: [
            { maxMeters: 8, color: '#2e2e30' },
            { maxMeters: 15, color: '#473f3a' },
            { maxMeters: 30, color: '#292e29' },
            { maxMeters: 60, color: '#758273' },
            { maxMeters: Infinity, color: '#b0a194' }
        ]
    },
    optional: {
        firesFill: '#8b3a3a',
        firesOutline: '#6b2a2a',
        networkLine: '#6b9bb8',
        accentRedOrange: '#c45c3a'
    }
};

// Expose for use in overlays and other modules
if (typeof window !== 'undefined') window.FORTERRA_COLORS = FORTERRA_COLORS;
