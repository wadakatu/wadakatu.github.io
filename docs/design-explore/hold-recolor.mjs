/**
 * Regression: 人間用 must stay responsive after Hold rain, then a palette or theme change.
 * Run against the preview at 127.0.0.1:4321 (or BASE).
 *
 *   node docs/design-explore/hold-recolor.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:4321';
const CLICK_MS = 5000;
const FRAME_MS = 1500;
const MIN_FRAMES = 20;

const cases = [];
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  for (const sw of ['', '?switch=brace', '?switch=bits', '?switch=capsule']) {
    cases.push({ viewport, sw, hold: true, clicks: ['palette', 'theme', 'palette', 'theme'] });
  }
}
cases.push({ viewport: { width: 1440, height: 900 }, sw: '', hold: false, clicks: ['palette', 'theme'] });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
let failed = 0;
const crashes = [];

for (const c of cases) {
  const label = `${c.viewport.width}${c.hold ? '-hold' : '-nohold'}${c.sw || '-rain'}`;
  const ctx = await browser.newContext({
    viewport: c.viewport,
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('proto-matrix-boot', '1'); } catch {} });
  const page = await ctx.newPage();
  page.on('crash', () => crashes.push(label));
  try {
    await page.goto(BASE + '/proto/matrix/' + c.sw, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(400);
    if (c.hold) {
      await page.locator('#hold').check();
      await page.waitForFunction(() => document.documentElement.dataset.rain === 'held', { timeout: 3000 });
      await page.waitForTimeout(200);
    }
    for (const click of c.clicks) {
      const sel = click === 'theme' ? '#theme-toggle' : '#palette-toggle';
      const t0 = Date.now();
      await page.click(sel, { timeout: CLICK_MS });
      const clickWall = Date.now() - t0;
      const frames = await page.evaluate(async (budget) => {
        const start = performance.now();
        let n = 0;
        await new Promise((resolve) => {
          const tick = () => {
            n++;
            if (performance.now() - start >= budget) resolve();
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        // A live layout read: a hung style loop would stall this too.
        document.documentElement.offsetHeight;
        return { n, ms: performance.now() - start };
      }, FRAME_MS);
      const ok = clickWall < CLICK_MS && frames.n >= MIN_FRAMES;
      if (!ok) {
        failed++;
        console.log(`FAIL ${label} ${click}: click ${clickWall}ms, frames ${frames.n} in ${frames.ms.toFixed(0)}ms`);
      } else {
        console.log(`ok   ${label} ${click}: click ${clickWall}ms, frames ${frames.n}`);
      }
    }
  } catch (e) {
    failed++;
    console.log(`FAIL ${label}: ${String(e).slice(0, 300)}`);
  }
  await ctx.close();
}

try { await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 4000))]); } catch {}
if (crashes.length) {
  console.log('CRASH', crashes.join(', '));
  failed += crashes.length;
}
if (failed) {
  console.log(`${failed} failure(s)`);
  process.exit(1);
}
console.log('hold-recolor: all cases passed');
try { await Promise.race([Promise.resolve(), new Promise((r)=>setTimeout(r,0))]); } catch {}
process.exit(0);
