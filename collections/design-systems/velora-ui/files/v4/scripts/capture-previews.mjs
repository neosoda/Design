#!/usr/bin/env node
/* Captures real screenshots of each template (light palette, motion reduced) for the hub and the README.
   Requires Playwright with Chromium (development only). Usage: node scripts/capture-previews.mjs */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shots = [['itsm', 'flow'], ['crm', 'overview'], ['monitoring', 'services'], ['admin', 'roles'], ['analytics', 'overview']];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: .5, reducedMotion: 'reduce' });
await ctx.addInitScript(() => localStorage.setItem('velora.v4.prefs', JSON.stringify({ palette: 'light' })));
const page = await ctx.newPage();
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
for (const [id, view] of shots) {
  await page.goto(pathToFileURL(join(root, 'templates', id + '.html')).href + '#/' + view);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: join(root, 'assets', `template-${id}.jpg`), type: 'jpeg', quality: 82 });
  console.log('captured', id);
}
await browser.close();
