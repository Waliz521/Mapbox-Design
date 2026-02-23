// Export script for multi-angle PNG images
// Run from project root: node scripts/export.js
// Requires: puppeteer (npm install puppeteer)

const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

const PROJECT_ROOT = path.join(__dirname, '..');

const views = [
    { name: 'view1-overview', zoom: 8, pitch: 0, bearing: 0 },
    { name: 'view2-angled', zoom: 10, pitch: 45, bearing: 30 },
    { name: 'view3-closeup', zoom: 11, pitch: 30, bearing: -15 }
];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const htmlPath = path.join(PROJECT_ROOT, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    await page.setContent(html);

    await page.waitForSelector('#map');
    await page.waitForTimeout(3000);

    for (const view of views) {
        await page.evaluate((v) => {
            if (window.map) {
                window.map.setZoom(v.zoom);
                window.map.setPitch(v.pitch);
                window.map.setBearing(v.bearing);
            }
        }, view);

        await page.waitForTimeout(2000);
        const screenshotPath = path.join(PROJECT_ROOT, `${view.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
    }

    await browser.close();
})();
