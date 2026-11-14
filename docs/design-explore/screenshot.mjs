/**
 * Capture each prototype at 1440 and 390, light and dark.
 * Usage: node docs/design-explore/screenshot.mjs [baseUrl] [outDir]
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:4321';
const outDir = process.argv[3] || path.resolve('docs/design-explore/shots');
const routes = [
  { id: 'construct', path: '/proto/construct/', name: 'construct-home' },
  { id: 'construct', path: '/proto/construct/projects/', name: 'construct-projects' },
  { id: 'source', path: '/proto/source/', name: 'source-home' },
  { id: 'source', path: '/proto/source/projects/', name: 'source-projects' },
  { id: 'source-raw', path: '/proto/source/raw/', name: 'source-raw-home' },
  { id: 'operator', path: '/proto/operator/', name: 'operator-home' },
  { id: 'operator', path: '/proto/operator/projects/', name: 'operator-projects' },
  { id: 'spoon', path: '/proto/spoon/', name: 'spoon-home' },
  { id: 'spoon', path: '/proto/spoon/projects/', name: 'spoon-projects' },
  { id: 'control', path: '/proto/b/', name: 'control-spectrum-home' },
];
const viewports = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'mobile', width: 390, height: 844 },
];
const themes = ['light', 'dark'];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});

const results = [];
for (const route of routes) {
  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme,
        reducedMotion: 'reduce',
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const url = base + route.path;
      const file = `${route.name}-${vp.id}-${theme}.png`;
      const dest = path.join(outDir, file);
      try {
        const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const status = res?.status() ?? 0;
        // Force theme if the page exposes data-theme or a toggle
        await page.evaluate((t) => {
          const root = document.documentElement;
          root.dataset.theme = t;
          root.style.colorScheme = t;
          root.classList.remove('light', 'dark', 'tombo', 'hotaru');
          root.classList.add(t);
          try { localStorage.setItem('theme', t); } catch {}
        }, theme);
        await page.evaluate(() => document.fonts ? document.fonts.ready : null);
        await page.waitForTimeout(600);
        await page.screenshot({ path: dest, fullPage: true });
        results.push({ file, status, url, ok: status === 200 });
        console.log((status === 200 ? 'OK' : 'FAIL') + ` ${status} ${file}`);
      } catch (err) {
        results.push({ file, status: 0, url, ok: false, error: String(err) });
        console.log('ERR', file, err.message);
      }
      await context.close();
    }
  }
}
await browser.close();
const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`Failed ${failed.length} of ${results.length} shots`);
  process.exitCode = 1;
} else {
  console.log(`Captured ${results.length} shots in ${outDir}`);
}
