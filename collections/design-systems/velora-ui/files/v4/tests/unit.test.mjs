/* Velora V4 unit tests (Node built-in test runner, no dependency): node --test tests/unit.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { loadVelora, ROOT } from './load.mjs';

const V = loadVelora();
const plain = x => JSON.parse(JSON.stringify(x));

test('tokens: generated CSS and JS are in sync with tokens.json', () => {
  execFileSync(process.execPath, [join(ROOT, 'scripts/build-tokens.mjs'), '--check'], { stdio: 'pipe' });
});

test('prefs: defaults and sanitizing', () => {
  const d = plain(V.prefs.sanitize(null));
  assert.deepEqual(d, { palette: 'auto', density: 'comfortable', motion: 'signature', rail: 'collapsed', contrast: 'normal', textScale: 1, radius: 24, alpha: .7, blur: 18 });
  const bad = plain(V.prefs.sanitize({ palette: 'neon', density: 'huge', motion: 'fast', rail: 'x', contrast: 'max', textScale: 3, radius: 999, alpha: -2, blur: 'a' }));
  assert.deepEqual(bad, { ...d, radius: 32, alpha: .5 });
  for (const p of ['light', 'dark', 'ivory', 'mist', 'auto']) assert.equal(V.prefs.sanitize({ palette: p }).palette, p);
  assert.equal(V.prefs.sanitize({ alpha: .73 }).alpha, .75, 'alpha snaps to .05');
  assert.equal(V.prefs.sanitize({ radius: '12' }).radius, 12, 'numeric strings accepted');
});

test('store: JSON round trip, broken JSON and blocked storage fall back safely', () => {
  const mem = new Map(); let blocked = false;
  const fake = { getItem: k => { if (blocked) throw new Error('blocked'); return mem.get(k) ?? null; }, setItem: (k, v) => { if (blocked) throw new Error('blocked'); mem.set(k, v); }, removeItem: k => mem.delete(k) };
  const W = loadVelora(fake);
  assert.equal(W.store.set('a', { x: 1 }), true);
  assert.deepEqual(plain(W.store.get('a')), { x: 1 });
  mem.set('velora.v4.b', '{broken');
  assert.equal(W.store.get('b', 'fallback'), 'fallback');
  blocked = true;
  assert.equal(W.store.set('c', 2), false, 'reports that persistence failed');
  assert.equal(W.store.get('c', null), 2, 'value still available for the session');
});

const cols = [
  { key: 'id', label: 'Ticket', primary: true },
  { key: 'subject', label: 'Sujet' },
  { key: 'state', label: 'État', filterable: true, options: [{ value: 'open', label: 'Ouvert' }, { value: 'done', label: 'Résolu' }] },
  { key: 'prio', label: 'Priorité', filterable: true },
  { key: 'created', label: 'Créé', type: 'date' },
  { key: 'n', label: 'Nombre', type: 'number' }
];
const rows = [
  { id: 'T1', subject: 'Imprimante hors ligne', state: 'open', prio: 'P2', created: '2026-01-03', n: 10 },
  { id: 'T2', subject: 'Accès VPN refusé', state: 'done', prio: 'P1', created: '2026-01-01', n: 2 },
  { id: 'T3', subject: 'Écran qui scintille', state: 'open', prio: 'P1', created: '2026-01-02', n: 33 }
];
test('table: free search ignores accents and case', () => {
  assert.deepEqual(V.table.query(rows, cols, { q: 'ecran' }).map(r => r.id), ['T3']);
  assert.deepEqual(V.table.query(rows, cols, { q: 'VPN' }).map(r => r.id), ['T2']);
});
test('table: field tokens, labels of options, negation and quotes', () => {
  assert.deepEqual(V.table.query(rows, cols, { q: 'etat:resolu' }).map(r => r.id), ['T2'], 'matches option label');
  assert.deepEqual(V.table.query(rows, cols, { q: 'priorite:p1 -vpn' }).map(r => r.id), ['T3'], 'label prefix + exclusion');
  assert.deepEqual(V.table.query(rows, cols, { q: '"hors ligne"' }).map(r => r.id), ['T1']);
  assert.deepEqual(V.table.query(rows, cols, { q: 'inconnu:x' }).map(r => r.id), [], 'unknown field matches nothing');
});
test('table: facet filters and multi-column sort (numbers, dates, stable)', () => {
  assert.deepEqual(V.table.query(rows, cols, { filters: { state: ['open'] } }).map(r => r.id), ['T1', 'T3']);
  assert.deepEqual(V.table.query(rows, cols, { sort: [{ key: 'n', dir: 'asc' }] }).map(r => r.id), ['T2', 'T1', 'T3'], 'numeric, not lexical');
  assert.deepEqual(V.table.query(rows, cols, { sort: [{ key: 'created', dir: 'desc' }] }).map(r => r.id), ['T1', 'T3', 'T2']);
  assert.deepEqual(V.table.query(rows, cols, { sort: [{ key: 'prio', dir: 'asc' }, { key: 'n', dir: 'desc' }] }).map(r => r.id), ['T3', 'T2', 'T1']);
  const f = plain(V.table.facets(rows, cols[2]));
  assert.deepEqual(f, [{ value: 'open', count: 2, label: 'Ouvert' }, { value: 'done', count: 1, label: 'Résolu' }], 'facets follow option order');
});
test('table: persisted state is sanitized', () => {
  const s = plain(V.table.sanitizeState({ q: 5, filters: { nope: ['x'], state: ['open'], prio: [] }, sort: [{ key: 'n', dir: 'up' }, { key: 'id', dir: 'desc' }], columns: ['subject', 'subject', 'ghost'] }, cols));
  assert.deepEqual(s, { q: '', filters: { state: ['open'] }, sort: [{ key: 'id', dir: 'desc' }], columns: ['id', 'subject'], view: 'all', page: 0 }, 'primary column always kept');
});
test('table: CSV uses ; separator, BOM and quoting', () => {
  const csv = V.table.toCSV([{ id: 'A;1', subject: 'Dit "bonjour"' }], cols.slice(0, 2));
  assert.equal(csv, '﻿Ticket;Sujet\n"A;1";"Dit ""bonjour"""');
});

test('command: matching is accent-insensitive and highlights', () => {
  const m = V.command.score('reseau', 'Réseau et Wi-Fi');
  assert.ok(m && m.score > 0);
  assert.deepEqual(plain(m.indices), [0, 1, 2, 3, 4, 5]);
  assert.equal(V.command.highlight('Réseau', [0, 1]), '<mark>Ré</mark>seau');
  assert.equal(V.command.highlight('<b>', []), '&lt;b&gt;', 'labels are escaped');
});
test('command: fuzzy only on word starts or contiguous letters', () => {
  assert.ok(V.command.score('tdb', 'Tableau de bord'), 'initials');
  assert.equal(V.command.score('vpn', 'Vidéoprojecteur sans signal'), null, 'scattered letters rejected');
  const ranked = V.command.rank('acc', [{ label: 'Comptes et accès' }, { label: 'Accès VPN' }, { label: 'Paramètres', keywords: 'acces securite' }]);
  assert.equal(ranked[0].item.label, 'Accès VPN', 'prefix ranks first');
  assert.equal(ranked.length, 3, 'keywords also match');
});

test('dashboard: layout sanitizer keeps known widgets, appends new ones, snaps sizes', () => {
  const W = [{ id: 'a', w: 4 }, { id: 'b', w: 8, h: 2 }, { id: 'c', w: 6, hidden: true }, { id: 'd', w: 3, minW: 4 }];
  assert.deepEqual(plain(V.dashboard.sanitizeLayout(null, W)), { order: ['a', 'b', 'c', 'd'], hidden: ['c'], size: { a: { w: 4, h: 1 }, b: { w: 8, h: 2 }, c: { w: 6, h: 1 }, d: { w: 4, h: 1 } } });
  const L = plain(V.dashboard.sanitizeLayout({ order: ['b', 'x', 'b', 'a'], hidden: ['a', 'b', 'c', 'd'], size: { a: { w: 5, h: 9 }, b: { w: 2, h: 0 } } }, W));
  assert.deepEqual(L.order, ['b', 'a', 'c', 'd']);
  assert.equal(L.hidden.length, 3, 'at least one widget stays visible');
  assert.deepEqual(L.size.a, { w: 4, h: 4 }, 'width snaps to 3/4/6/8/12, height clamps to 1..4');
  assert.deepEqual(L.size.b, { w: 3, h: 1 });
});

test('studio: WCAG contrast matches reference values', () => {
  assert.equal(+V.studio.contrast('#000000', '#ffffff').toFixed(1), 21);
  assert.equal(+V.studio.contrast('#ffffff', '#ffffff').toFixed(1), 1);
  assert.ok(V.studio.contrast('#ffffff', '#c64720') >= 4.5, 'white on rust is AA');
  assert.equal(V.studio.bestOn('#f0c94e'), '#181815');
  assert.equal(V.studio.bestOn('#2b5c4e'), '#ffffff');
});
test('studio: exported CSS is complete and sanitized', () => {
  const css = V.studio.themeCSS({ palette: 'mist', density: 'compact', motion: 'subtle', radius: 99 }, { yellow: '#e0b030' });
  assert.match(css, /--vl-radius: 32px;/);
  assert.match(css, /--vl-ink: #1f2a31;/);
  assert.match(css, /--vl-stage-yellow: #e0b030;/);
  assert.match(css, /--vl-pad: 12px;/);
  assert.match(css, /--vl-motion-morph: 300ms;/);
  assert.doesNotMatch(css, /—/, 'no em dash in generated copy');
  const json = JSON.parse(V.studio.themeJSON({ palette: 'ivory' }));
  assert.equal(json.preferences.palette, 'ivory');
});
