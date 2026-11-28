#!/usr/bin/env node
/* Velora V4 browser verification (development only: Playwright + Chromium, axe-core).
   1. axe-core (WCAG 2.0/2.1/2.2 A and AA) on every view, in the four palettes;
   2. no horizontal overflow at 390, 768 and 1440 px;
   3. scripted journeys through every template, logged step by step as evidence.
   Writes tests/e2e-report.md. Usage: node tests/e2e.mjs   (AXE_CORE=/path/to/axe.min.js to override) */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { ROOT } from './load.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSource = readFileSync(process.env.AXE_CORE || require.resolve('axe-core/axe.min.js'), 'utf8');
const url = (file, view) => pathToFileURL(join(ROOT, file)).href + (view ? '#/' + view : '');

const PAGES = [
  ['index.html', ['start', 'integrate']], ['studio/index.html', ['editor']],
  ['playground/index.html', ['components', 'foundations', 'motion', 'a11y']],
  ['templates/itsm.html', ['dashboard', 'tickets', 'flow']], ['templates/crm.html', ['overview', 'pipeline', 'accounts']],
  ['templates/admin.html', ['users', 'roles', 'audit', 'settings']], ['templates/monitoring.html', ['overview', 'services', 'alerts']],
  ['templates/analytics.html', ['overview', 'campaigns', 'reports']]
];
const PALETTES = ['light', 'dark', 'ivory', 'mist'];
const log = [], axeLog = [], overflowLog = [];
let failures = 0;
const step = (scenario, action, ok, detail) => { log.push({ scenario, action, ok, detail: detail || '' }); if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'} [${scenario}] ${action}${detail ? ' : ' + detail : ''}`); };

const browser = await chromium.launch();
async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, reducedMotion: opts.motion ? 'no-preference' : 'reduce', hasTouch: !!opts.touch, isMobile: !!opts.touch });
  /* Each context starts with empty storage: only seed the palette, never wipe what a journey saved. */
  if (opts.palette) await ctx.addInitScript(p => { if (!localStorage.getItem('velora.v4.prefs')) localStorage.setItem('velora.v4.prefs', JSON.stringify({ palette: p })); }, opts.palette);
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|fonts\.g/.test(m.text())) page.errors.push(m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  return page;
}
const settle = (page, ms = 900) => page.waitForTimeout(ms);

/* 1. axe-core */
for (const palette of PALETTES) {
  const page = await newPage({ palette });
  for (const [file, views] of PAGES) {
    for (const view of views) {
      await page.goto(url(file, view)); await settle(page, 1100);
      await page.evaluate(axeSource);
      const res = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] });
        return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, target: v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ') }));
      });
      axeLog.push({ palette, page: file, view, violations: res, errors: page.errors.splice(0) });
      if (res.length) { failures++; console.log(`AXE ${palette} ${file}#${view}:`, JSON.stringify(res)); }
    }
  }
  await page.context().close();
}

/* 2. Overflow */
for (const width of [390, 768, 1440]) {
  const page = await newPage({ viewport: { width, height: width < 500 ? 844 : 900 }, palette: 'light' });
  for (const [file, views] of PAGES) for (const view of views) {
    await page.goto(url(file, view)); await settle(page, 700);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    overflowLog.push({ width, page: file, view, ov });
    if (ov > 0) { failures++; console.log(`OVERFLOW ${width}px ${file}#${view}: ${ov}px`); }
  }
  await page.context().close();
}

/* 3. Journeys */
async function journey(name, opts, fn) {
  const page = await newPage(opts);
  try { await fn(page, (a, ok, d) => step(name, a, ok, d)); }
  catch (e) { step(name, 'exception', false, e.message.split('\n')[0]); }
  step(name, 'no JavaScript error during the journey', !page.errors.length, page.errors.join(' | '));
  await page.context().close();
}

await journey('ITSM, motion signature', { motion: true, palette: 'light' }, async (p, s) => {
  await p.goto(url('templates/itsm.html', 'flow')); await settle(p, 1400);
  const card = p.locator('.vl-kcard').first();
  await card.click(); await settle(p, 900);
  s('card opens the stage dialog (morph)', await p.locator('.vl-dialog--stage').isVisible());
  const before = await p.locator('.vl-dialog--stage').getAttribute('class');
  await p.locator('.vl-stagedlg__next').click(); await settle(p, 900);
  const after = await p.locator('.vl-dialog--stage').getAttribute('class');
  s('advancing the stage recolours the dialog without closing it', before !== after && await p.locator('.vl-dialog--stage').isVisible(), `${before.match(/vl-tile--\w+/)} → ${after.match(/vl-tile--\w+/)}`);
  await p.keyboard.press('Escape'); await settle(p, 700);
  s('Escape closes the dialog and focus returns to the card', await p.evaluate(() => document.activeElement && document.activeElement.classList.contains('vl-kcard')));
  const src = p.locator('.vl-kcol').nth(0).locator('.vl-kcard').first(); const b = await src.boundingBox(); const t = await p.locator('.vl-kcol').nth(2).boundingBox();
  const n0 = await p.locator('.vl-kcol').nth(2).locator('.vl-kcard').count();
  await p.mouse.move(b.x + 40, b.y + 30); await p.mouse.down(); await p.mouse.move(b.x + 70, b.y + 40, { steps: 4 }); await p.mouse.move(t.x + 100, t.y + 140, { steps: 18 }); await settle(p, 300);
  s('dragged card shows a lifted ghost', await p.locator('.vl-drag-ghost').count() === 1);
  await p.mouse.up(); await settle(p, 900);
  s('drop moves the card to the target column', await p.locator('.vl-kcol').nth(2).locator('.vl-kcard').count() === n0 + 1);
  await p.getByRole('button', { name: 'Annuler', exact: true }).last().click(); await settle(p, 700);
  s('toast "Annuler" reverts the move', await p.locator('.vl-kcol').nth(2).locator('.vl-kcard').count() === n0);
});

await journey('ITSM, keyboard', { palette: 'light' }, async (p, s) => {
  await p.goto(url('templates/itsm.html', 'flow')); await settle(p);
  await p.keyboard.press('Tab');
  s('first Tab reaches the skip link', await p.evaluate(() => document.activeElement.classList.contains('vl-skip')));
  const card = p.locator('.vl-kcol').nth(0).locator('.vl-kcard').first(); const id = await card.getAttribute('data-key');
  await card.focus(); await p.keyboard.press(' '); await p.keyboard.press('ArrowRight'); await p.keyboard.press(' '); await settle(p, 500);
  s('Space, arrow, Space moves a card to the next column', await p.locator('.vl-kcol').nth(1).locator(`[data-key="${id}"]`).count() === 1);
  await p.goto(url('templates/itsm.html', 'tickets')); await settle(p, 1200);
  await p.keyboard.press('/');
  s('"/" focuses the table search', await p.evaluate(() => document.activeElement.matches('[data-vl-search]')));
  await p.keyboard.type('priorite:p1'); await settle(p, 500);
  const pr = await p.locator('tbody tr[data-key]').evaluateAll(rows => rows.every(r => r.textContent.includes('P1')));
  s('"priorite:p1" keeps only P1 tickets', pr);
  await p.keyboard.press('Escape'); await settle(p, 300);
  await p.locator('.vl-table__open').first().focus(); await p.keyboard.press('Enter'); await settle(p, 700);
  s('Enter on a ticket opens the docked inspector', await p.locator('.vl-sheet--inspector').isVisible());
  const t1 = await p.locator('.vl-sheet__title').textContent();
  await p.locator('.vl-sheet').focus(); await p.keyboard.press('j'); await settle(p, 400);
  s('"j" shows the next ticket', t1 !== await p.locator('.vl-sheet__title').textContent());
  await p.getByRole('button', { name: 'Modifier', exact: true }).click();
  await p.locator('.vl-sheet input[name="subject"]').fill('');
  await p.getByRole('button', { name: 'Enregistrer' }).click(); await settle(p, 200);
  s('empty required field is flagged and focused', await p.evaluate(() => document.activeElement.name === 'subject' && document.activeElement.getAttribute('aria-invalid') === 'true'));
  await p.locator('.vl-sheet input[name="subject"]').fill('Sujet modifié en recette'); await p.getByRole('button', { name: 'Enregistrer' }).click(); await settle(p, 400);
  s('valid edit is saved and shown in the table', await p.locator('tbody').getByText('Sujet modifié en recette').count() === 1);
  await p.keyboard.press('Escape'); await settle(p, 400);
  await p.keyboard.press('Control+k'); await settle(p, 300);
  s('Ctrl+K opens the Command Center', await p.locator('.vl-command').isVisible());
  await p.keyboard.type('flux'); await p.keyboard.press('Shift+Enter'); await settle(p, 200);
  s('Shift+Enter adds the active command to favourites', await p.locator('.vl-command__option[aria-selected="true"] .vl-command__star[data-on="true"]').count() === 1);
  await p.keyboard.press('Enter'); await settle(p, 900);
  s('Enter runs the command (navigates to Flux)', p.url().endsWith('#/flow'));
  await p.keyboard.press('Control+k'); await settle(p, 300);
  s('favourites are listed first when the query is empty', (await p.locator('.vl-command__heading').first().textContent()) === 'Favoris');
  await p.keyboard.press('Escape');
  await p.keyboard.press('?'); await settle(p, 300);
  s('"?" opens the keyboard shortcuts', await p.getByRole('dialog', { name: 'Raccourcis clavier' }).isVisible());
});

await journey('ITSM, table and dashboard', { palette: 'light' }, async (p, s) => {
  await p.goto(url('templates/itsm.html', 'tickets')); await settle(p, 1200);
  await p.locator('.vl-cell-edit').first().click(); await p.locator('select.vl-cell-input').selectOption('P1'); await settle(p, 400);
  s('inline edit of a cell shows an undo toast', await p.locator('.vl-toast').filter({ hasText: 'Priorité' }).count() >= 1);
  await p.getByRole('button', { name: /Filtrer/ }).click(); await p.locator('.vl-popover label', { hasText: 'Réseau' }).click(); await settle(p, 300);
  s('facet filter adds a removable chip', await p.locator('.vl-table-chips .vl-chip').count() >= 1);
  await p.keyboard.press('Escape');
  await p.getByRole('button', { name: /^Vue/ }).click(); await p.getByRole('menuitem', { name: /Enregistrer la vue/ }).click();
  await p.getByLabel('Nom de la vue').fill('Réseau seulement'); await p.locator('.vl-dialog').getByRole('button', { name: 'Enregistrer la vue' }).click(); await settle(p, 300);
  await p.reload(); await settle(p, 1200);
  const vt = await p.getByRole('button', { name: /^Vue/ }).textContent();
  s('saved view and filters persist after reload', vt.includes('Réseau seulement') && await p.locator('.vl-table-chips .vl-chip').count() >= 1, vt);
  await p.getByRole('button', { name: 'Colonnes' }).click(); await p.locator('.vl-pop-col label', { hasText: 'Site' }).click(); await settle(p, 300);
  s('a column can be hidden', await p.locator('thead th', { hasText: 'Site' }).count() === 0);
  await p.keyboard.press('Escape');
  await p.locator('tbody input[type=checkbox]').nth(0).check(); await p.locator('tbody input[type=checkbox]').nth(1).check();
  s('row selection shows the bulk action bar', await p.locator('.vl-table-bulk').isVisible());
  await p.goto(url('templates/itsm.html', 'dashboard')); await settle(p, 1000);
  await p.getByRole('button', { name: 'Modifier la disposition' }).click();
  const first = await p.locator('.vl-widget').first().getAttribute('data-id');
  await p.locator('.vl-widget__handle').first().focus(); await p.keyboard.press('ArrowRight'); await settle(p, 300);
  s('arrow key on a widget handle moves the widget', (await p.locator('.vl-widget').nth(1).getAttribute('data-id')) === first);
  await p.getByRole('button', { name: /Élargir Tickets ouverts/ }).click(); await settle(p, 300);
  s('width button resizes the widget', (await p.locator('[data-id="open"]').getAttribute('data-w')) === '4');
  await p.getByRole('button', { name: /Ajouter un widget/ }).click(); await p.getByRole('menuitem', { name: /Connecteur/ }).click(); await settle(p, 1100);
  s('hidden widget can be added back and shows its error state', await p.locator('[data-id="probe"] .vl-state--error').count() === 1);
  await p.locator('[data-id="probe"]').getByRole('button', { name: 'Réessayer' }).click(); await settle(p, 1100);
  s('Retry recovers the widget', await p.locator('[data-id="probe"]').getByText('Connecteur joignable').count() === 1);
  await p.reload(); await settle(p, 1000);
  s('layout persists after reload', (await p.locator('[data-id="open"]').getAttribute('data-w')) === '4');
});

await journey('CRM', { palette: 'light' }, async (p, s) => {
  await p.goto(url('templates/crm.html', 'overview')); await settle(p, 1100);
  await p.getByRole('button', { name: '6 mois' }).click(); await settle(p, 900);
  s('period switch redraws the revenue chart on 6 months', (await p.locator('[data-id="revenue"] .vl-chart__axis').allTextContents()).some(t => t === 'nov.'));
  await p.locator('[data-id="hot"] .vl-tile').first().click(); await settle(p, 700);
  s('hot deal opens its stage dialog', await p.locator('.vl-dialog--stage').isVisible());
  await p.keyboard.press('Escape'); await settle(p, 500);
  await p.getByRole('button', { name: 'Nouvelle affaire' }).click();
  await p.locator('.vl-dialog').getByRole('button', { name: /Créer/ }).click();
  s('empty deal title is rejected with a message', await p.locator('.vl-dialog .vl-field__error').isVisible());
  await p.getByLabel('Intitulé (obligatoire)').fill('Recette Velora'); await p.locator('.vl-dialog').getByRole('button', { name: /Créer/ }).click(); await settle(p, 1100);
  s('new deal appears in the pipeline', await p.locator('.vl-kcard', { hasText: 'Recette Velora' }).count() === 1);
  await p.goto(url('templates/crm.html', 'accounts')); await settle(p, 1100);
  await p.locator('.vl-table__open').first().click(); await settle(p, 500);
  s('account opens in the inspector with its health meter', await p.locator('.vl-sheet .vl-meter').count() === 1);
});

await journey('Administration', { palette: 'light' }, async (p, s) => {
  await p.goto(url('templates/admin.html', 'users')); await settle(p, 1000);
  await p.getByRole('button', { name: 'Inviter' }).first().click();
  await p.getByLabel('Adresse e-mail (obligatoire)').fill('pas-une-adresse'); await p.getByRole('button', { name: 'Envoyer l’invitation' }).click();
  s('invalid e-mail is rejected', (await p.locator('.vl-dialog .vl-field__error').textContent()).includes('valide'));
  await p.getByLabel('Adresse e-mail (obligatoire)').fill('nouvelle.recrue@exemple.org'); await p.getByRole('button', { name: 'Envoyer l’invitation' }).click(); await settle(p, 900);
  s('invitation adds the user to the table', await p.locator('tbody').getByText('nouvelle.recrue@exemple.org').count() === 1);
  await p.goto(url('templates/admin.html', 'roles')); await settle(p);
  await p.getByLabel('Gérer le parc pour Lecteur').first().check({ force: true }); await settle(p, 200);
  s('changing a permission shows the pending-changes bar', await p.locator('.vl-savebar').isVisible());
  await p.getByRole('button', { name: 'Enregistrer les permissions' }).click(); await p.locator('.vl-dialog').getByRole('button', { name: 'Appliquer' }).click(); await settle(p, 500);
  s('confirmed save clears the bar', await p.locator('.vl-savebar').isHidden());
  await p.goto(url('templates/admin.html', 'audit')); await settle(p, 900);
  s('audit log records the permission change', await p.locator('tbody').getByText(/modifié 1 permission/).count() >= 1);
  await p.goto(url('templates/admin.html', 'settings')); await settle(p);
  await p.getByLabel('Expiration de session (minutes)').fill('2'); await p.getByRole('button', { name: 'Enregistrer' }).click();
  s('out-of-range setting is refused and focused', await p.evaluate(() => document.activeElement.name === 'timeout'));
});

await journey('Supervision', { palette: 'dark' }, async (p, s) => {
  await p.goto(url('templates/monitoring.html', 'overview')); await settle(p, 1200);
  s('probe widget shows its error state first', await p.locator('[data-id="probes"] .vl-state--error').count() === 1);
  await p.locator('[data-id="probes"]').getByRole('button', { name: 'Réessayer' }).click(); await settle(p, 1100);
  s('Retry loads the widget', await p.locator('[data-id="probes"]').getByText('Source rétablie').count() === 1);
  await p.getByRole('button', { name: 'Mettre en pause' }).click();
  s('live updates can be paused (WCAG 2.2.2)', await p.getByRole('button', { name: 'Reprendre le direct' }).count() === 1);
  await p.locator('[data-id="feed"]').getByRole('button', { name: 'Acquitter' }).first().click();
  s('an alert can be acknowledged from the feed', await p.locator('.vl-toast', { hasText: 'Alerte acquittée' }).count() === 1);
  await p.goto(url('templates/monitoring.html', 'services')); await settle(p);
  await p.locator('.vl-tile').first().press('Enter'); await settle(p, 500);
  s('service tile opens with the keyboard', await p.locator('.vl-sheet--inspector').isVisible());
});

await journey('Analytique', { palette: 'mist' }, async (p, s) => {
  await p.goto(url('templates/analytics.html', 'overview')); await settle(p, 1000);
  const before = await p.locator('.vl-hero').textContent();
  await p.getByRole('button', { name: '7 jours' }).click(); await settle(p, 1400);
  s('date range scopes the hero figure', before !== await p.locator('.vl-hero').textContent());
  await p.getByLabel('Segment').selectOption('new'); await settle(p, 1400);
  s('segment filter updates the status line', (await p.locator('[data-status]').textContent()).includes('Nouveaux'));
  await p.locator('[data-id="devices"]').getByRole('button', { name: /Voir les données/ }).click();
  s('every chart offers a data table view', await p.locator('[data-id="devices"] .vl-chart__table table').isVisible());
  await p.goto(url('templates/analytics.html', 'reports')); await settle(p);
  await p.getByRole('button', { name: 'Nouveau rapport' }).click(); await p.getByLabel('Nom du rapport (obligatoire)').fill('Recette'); await p.getByRole('button', { name: 'Créer le rapport' }).click(); await settle(p, 400);
  s('a report can be created', await p.getByText('Recette', { exact: true }).count() === 1);
});

await journey('Studio and preferences', { palette: 'light' }, async (p, s) => {
  await p.goto(url('studio/index.html', 'editor')); await settle(p);
  await p.locator('.vl-studio__choice', { hasText: 'Mist' }).first().click();
  await p.locator('.vl-studio__choice', { hasText: 'Compacte' }).first().click(); await settle(p, 300);
  s('palette and density apply live', await p.evaluate(() => document.documentElement.dataset.vlPalette === 'mist' && document.documentElement.dataset.vlDensity === 'compact'));
  s('CSS export reflects the settings', (await p.locator('.vl-codeblock code').textContent()).includes('--vl-ink: #1f2a31;'));
  await p.getByLabel('Importer un thème JSON').fill('{ broken'); await p.getByRole('button', { name: 'Appliquer le JSON' }).click();
  s('invalid JSON import is refused with a message', (await p.locator('.vl-field__error').last().textContent()).includes('JSON'));
  await p.goto(url('templates/itsm.html', 'dashboard')); await settle(p);
  s('preferences carry over to another page', await p.evaluate(() => document.documentElement.dataset.vlPalette === 'mist'));
  await p.keyboard.press(','); await settle(p, 400);
  await p.locator('.vl-studio__choice', { hasText: 'Toujours déplié' }).click(); await settle(p, 300);
  s('rail behaviour "always open" applies', await p.evaluate(() => document.body.dataset.vlRail === 'expanded'));
  await p.keyboard.press('Escape');
  await p.locator('#vl-activity-btn').click(); await settle(p, 400);
  await p.getByRole('button', { name: 'Tout marquer comme lu' }).click();
  s('activity center marks notifications read', (await p.locator('#vl-activity-btn').getAttribute('aria-label')) === 'Centre d’activité');
});

await journey('Mobile 390', { palette: 'light', viewport: { width: 390, height: 844 }, touch: true }, async (p, s) => {
  await p.goto(url('templates/itsm.html', 'dashboard')); await settle(p);
  s('bottom navigation is visible and the rail hidden', await p.locator('.vl-bottomnav').isVisible() && await p.locator('.vl-rail').isHidden());
  await p.locator('.vl-bottomnav__item', { hasText: 'Tickets' }).tap(); await settle(p, 1200);
  s('bottom navigation changes view', p.url().endsWith('#/tickets'));
  const target = await p.locator('.vl-bottomnav__item').first().boundingBox();
  s('bottom navigation targets are at least 44 px', target.height >= 44, Math.round(target.height) + ' px');
  await p.getByRole('button', { name: 'Menu complet' }).tap(); await settle(p, 500);
  s('menu sheet lists sections and applications', await p.locator('.vl-mobilemenu__link').count() >= 10);
  await p.keyboard.press('Escape');
});

await browser.close();

/* Report */
const axeFail = axeLog.filter(a => a.violations.length);
let md = '# Velora UI V4 : recette navigateur\n\n';
md += `Généré par \`node tests/e2e.mjs\` (Chromium via Playwright, axe-core ${JSON.parse(readFileSync(require.resolve('axe-core/package.json'), 'utf8')).version}).\n\n`;
md += `- axe-core, règles WCAG 2.0 / 2.1 / 2.2 niveaux A et AA : ${axeLog.length} vues analysées (${PAGES.reduce((a, p) => a + p[1].length, 0)} vues × ${PALETTES.length} palettes), **${axeFail.length} avec violation**.\n`;
md += `- Débordement horizontal à 390, 768 et 1 440 px : ${overflowLog.length} mesures, **${overflowLog.filter(o => o.ov > 0).length} débordement**.\n`;
md += `- Parcours : ${log.length} vérifications, **${log.filter(l => !l.ok).length} échec**.\n\n`;
md += 'Limites : axe-core ne détecte qu’une partie des problèmes d’accessibilité ; le contraste des surfaces translucides est vérifié séparément par `tests/contrast.mjs` (cas le plus défavorable). Aucun test avec lecteur d’écran réel n’a été mené.\n\n';
md += '## Parcours\n\n| Parcours | Vérification | Résultat | Détail |\n|---|---|---|---|\n';
log.forEach(l => { md += `| ${l.scenario} | ${l.action} | ${l.ok ? 'OK' : '**Échec**'} | ${l.detail.replace(/\|/g, '/')} |\n`; });
md += '\n## axe-core par vue\n\n| Palette | Page | Vue | Violations |\n|---|---|---|---|\n';
axeLog.forEach(a => { md += `| ${a.palette} | ${a.page} | ${a.view} | ${a.violations.length ? a.violations.map(v => `${v.id} (${v.n})`).join(', ') : 'aucune'} |\n`; });
writeFileSync(join(ROOT, 'tests/e2e-report.md'), md);
console.log(`\nVelora e2e: ${axeLog.length} axe scans (${axeFail.length} with violations), ${overflowLog.length} overflow checks, ${log.length} journey checks. Failures: ${failures}.`);
process.exit(failures ? 1 : 0);
