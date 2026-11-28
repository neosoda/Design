/* Velora Templates: shared demo helpers. Everything here is fictitious sample data,
   generated relative to "now" so durations stay coherent, and persisted locally per template. */
(function (g) {
  'use strict';
  const V = g.Velora;
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 1e6) / 1e6; }; }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  /* Simulated latency so loading states are visible; instant when motion is reduced. */
  const wait = ms => new Promise(res => setTimeout(res, V.motion && V.motion.reduced() ? 0 : ms));
  const hoursAgo = h => new Date(Date.now() - h * 36e5).toISOString();
  const daysAgo = d => new Date(Date.now() - d * 864e5).toISOString();
  function records(app, name, generate, version) {
    const key = app + '.records.' + name;
    const saved = V.store.get(key, null);
    if (saved && saved.v === (version || 1) && Array.isArray(saved.items)) return saved.items;
    const items = generate();
    V.store.set(key, { v: version || 1, items });
    return items;
  }
  const save = (app, name, items, version) => V.store.set(app + '.records.' + name, { v: version || 1, items });
  const TEAM = ['Inès Moreau', 'Karim Benali', 'Léa Fontaine', 'Hugo Martin', 'Sofia Laurent', 'Yanis Girard', 'Chloé Petit', 'Malik Robert'];
  const days14 = () => Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 864e5); return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); });
  /* A visible, honest marker for sample data (antislop R-38). */
  const badge = () => V.h('span.vl-demo-note', { html: V.icon('info') + 'Données de démonstration' });
  V.demo = { rng, pick, wait, hoursAgo, daysAgo, records, save, TEAM, days14, badge };
})(window);
