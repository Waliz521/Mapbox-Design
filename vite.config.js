/**
 * Minimal Vite build for mapboxgl-legend bundle.
 * Output: dist/legend.js (IIFE) + dist/legend.css
 */
import { resolve } from 'path';

export default {
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'js/legendInit.js'),
      name: 'ForterraLegend',
      formats: ['iife'],
      fileName: () => 'legend.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: 'legend.[ext]'
      }
    }
  }
};
