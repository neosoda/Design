/* Velora Supervision: service health, live latency, alerts. Status = shape + label + colour.
   Live charts update every 4 s and can be paused (WCAG 2.2.2); updates keep the frame and morph values. */
(function () {
  'use strict';
  const V = window.Velora, { h, icon, esc, fmt, ui, demo, motion: M } = V;
  const APP = 'monitoring';
  const STATUS = { ok: 'Opérationnel', warn: 'Dégradé', crit: 'Indisponible', idle: 'Maintenance' };
  const SERVICES = demo.records(APP, 'services', () => {
    const r = demo.rng(77);
    return [
      ['api', 'API publique', 'Production', 'ok'], ['auth', 'Authentification', 'Production', 'ok'], ['files', 'Serveur de fichiers', 'Production', 'warn'],
      ['mail', 'Messagerie', 'Production', 'ok'], ['db', 'Base de données', 'Production', 'ok'], ['backup', 'Sauvegardes', 'Infrastructure', 'crit'],
      ['vpn', 'Passerelle VPN', 'Infrastructure', 'ok'], ['print', 'Serveur d’impression', 'Infrastructure', 'idle'], ['wifi', 'Contrôleur Wi-Fi', 'Réseau', 'ok']
    ].map(([id, name, group, status]) => ({ id, name, group, status, latency: Math.round(40 + r() * 160), checks: Math.round(4 + r() * 8), since: demo.hoursAgo(r() * 40) }));
  });
  const saveServices = () => demo.save(APP, 'services', SERVICES);
  const alerts = demo.records(APP, 'alerts', () => {
    const r = demo.rng(13);
    const msgs = [['backup', 'crit', 'Tâche de sauvegarde nocturne en échec (code 23)'], ['files', 'warn', 'Latence disque au-dessus de 120 ms'], ['files', 'warn', 'Espace libre sous 15 % sur le volume Projets'], ['api', 'info', 'Certificat TLS renouvelé'], ['vpn', 'warn', 'Pic de connexions simultanées'], ['db', 'info', 'Maintenance des index terminée'], ['mail', 'warn', 'File d’attente SMTP à 340 messages'], ['wifi', 'info', 'Mise à jour du firmware disponible']];
    return msgs.map(([svc, sev, text], i) => ({ id: 'AL-' + (310 - i), svc, sev, text, state: sev === 'info' ? 'resolved' : i < 3 ? 'open' : demo.pick(r, ['open', 'ack']), time: demo.hoursAgo(i * 2.6 + r() * 2) }));
  });
  const saveAlerts = () => demo.save(APP, 'alerts', alerts);
  const SEV = [{ value: 'crit', label: 'Critique' }, { value: 'warn', label: 'Avertissement' }, { value: 'info', label: 'Information' }];
  const ASTATE = [{ value: 'open', label: 'Ouverte' }, { value: 'ack', label: 'Acquittée' }, { value: 'resolved', label: 'Résolue' }];
  const svcName = id => (SERVICES.find(s => s.id === id) || {}).name || id;

  /* Live series: 30 points per service, one every 4 s. */
  const r = demo.rng(5);
  const watched = ['api', 'auth', 'files'];
  const series = Object.fromEntries(watched.map((id, k) => [id, Array.from({ length: 30 }, (_, i) => Math.round(70 + k * 30 + Math.sin(i / 3 + k) * 18 + r() * 14))]));
  const stamps = () => Array.from({ length: 30 }, (_, i) => fmt.time(Date.now() - (29 - i) * 4000));
  let live = true, timer = null;
  const subscribers = new Set();
  function tick() {
    watched.forEach((id, k) => { const s = series[id]; s.shift(); s.push(Math.max(20, Math.round(s[s.length - 1] + (r() - .5) * 30 + (id === 'files' ? 2 : 0)))); });
    subscribers.forEach(fn => fn());
  }
  function startLive() { stopLive(); if (live) timer = setInterval(tick, 4000); }
  function stopLive() { clearInterval(timer); timer = null; }

  function liveToggle() {
    const b = h('button.vl-btn.vl-btn--sm', { type: 'button', 'aria-pressed': String(!live) });
    const paint = () => { b.innerHTML = (live ? icon('pause') + 'Mettre en pause' : icon('play') + 'Reprendre le direct'); b.setAttribute('aria-pressed', String(!live)); };
    b.addEventListener('click', () => { live = !live; live ? startLive() : stopLive(); paint(); document.querySelectorAll('.vl-pulse[data-live]').forEach(p => p.classList.toggle('is-paused', !live)); V.announce(live ? 'Mise à jour en direct reprise' : 'Mise à jour en direct en pause'); });
    paint();
    return b;
  }
  const liveDot = () => h('span.vl-row', { style: { gap: '8px' } }, h('span.vl-pulse' + (live ? '' : '.is-paused'), { 'data-tone': 'ok', 'data-live': '' }), h('span.vl-caption', { text: 'Direct, toutes les 4 s' }));

  function inspectService(s, opener, list) {
    V.inspector.open({
      record: s, list: list || [s], opener, title: x => x.name, eyebrow: x => x.group,
      summary: x => `<div class="vl-row"><span class="vl-status" data-tone="${x.status}">${esc(STATUS[x.status])}</span><span class="vl-caption">depuis ${esc(fmt.relative(x.since))}</span></div>`,
      fields: [{ key: 'name', label: 'Nom', required: true }, { key: 'group', label: 'Groupe', type: 'select', options: ['Production', 'Infrastructure', 'Réseau'] }, { key: 'status', label: 'État', type: 'select', options: Object.entries(STATUS).map(([value, label]) => ({ value, label })) }, { key: 'latency', label: 'Latence médiane', type: 'readonly', display: x => x.latency + ' ms' }, { key: 'checks', label: 'Sondes actives', type: 'readonly' }],
      activity: x => alerts.filter(a => a.svc === x.id).map(a => ({ when: fmt.relative(a.time), text: `${a.text} (${ASTATE.find(z => z.value === a.state).label.toLowerCase()})` })),
      actions: [{ label: 'Tester maintenant', icon: 'refresh', run: async (x, api) => { ui.toast('Test lancé sur ' + x.name); await demo.wait(900); ui.toast(x.status === 'crit' ? x.name + ' ne répond toujours pas' : x.name + ' répond en ' + x.latency + ' ms', { tone: x.status === 'crit' ? 'crit' : null }); } }],
      onSave: (x, v) => { const before = { ...x }; Object.assign(x, v); if (v.status !== before.status) x.since = new Date().toISOString(); saveServices(); V.activity.log({ title: x.name + ' modifié', icon: 'server', undo: () => { Object.assign(x, before); saveServices(); refresh(); } }); refresh(); return true; }
    });
  }
  let refresh = () => {};
  function ack(a) { if (a.state !== 'open') return false; a.state = 'ack'; saveAlerts(); return true; }

  function overview() {
    const root = h('div');
    const counts = k => SERVICES.filter(s => s.status === k).length;
    root.append(V.shell.pageHead({ eyebrow: 'Supervision', title: 'Vue d’ensemble', stats: [
      { icon: 'check', value: counts('ok'), label: 'services opérationnels' },
      { icon: 'alert', value: counts('warn') + counts('crit'), label: 'services à surveiller', delta: counts('crit') ? counts('crit') + ' indisponible' : null, deltaTone: 'rust' },
      { icon: 'bell', value: alerts.filter(a => a.state === 'open').length, label: 'alertes ouvertes' }
    ], actions: [liveToggle(), demo.badge()] }));
    const host = h('div'); root.append(host);
    V.dashboard(host, {
      id: APP + '.dash', label: 'Supervision',
      widgets: [
        { id: 'latency', title: 'Latence p95', w: 8, h: 2, note: 'millisecondes', render: (b, c) => {
          b.append(liveDot());
          const el = h('div'); b.append(el);
          const chart = V.charts.line(el, { label: 'Latence p95 par service, en millisecondes', labels: stamps(), series: watched.map((id, k) => ({ name: svcName(id), values: series[id].slice(), slot: k })), format: v => fmt.int(v) + ' ms', height: c.detail ? 320 : 220, area: false, yMin: 0, xLabel: 'Heure' });
          const sub = () => chart.update({ labels: stamps(), series: watched.map((id, k) => ({ name: svcName(id), values: series[id].slice(), slot: k })) });
          subscribers.add(sub); V.current.onLeave(() => subscribers.delete(sub));
          return { chart };
        } },
        { id: 'status', title: 'État des services', w: 4, h: 2, render: b => { const ul = h('ul.vl-list'); SERVICES.forEach(s => { const btn = h('button.vl-table__open', { type: 'button', text: s.name }); btn.addEventListener('click', () => inspectService(s, btn, SERVICES)); ul.append(h('li', null, h('div.vl-grow', null, btn), h('span.vl-status', { 'data-tone': s.status, text: STATUS[s.status] }))); }); b.append(ul); } },
        { id: 'errors', title: 'Erreurs 5xx par heure', w: 6, h: 2, render: b => { const el = h('div'); b.append(el); const rr = demo.rng(9); const hrs = Array.from({ length: 12 }, (_, i) => fmt.time(Date.now() - (11 - i) * 36e5).slice(0, 2) + ' h'); V.charts.columns(el, { label: 'Erreurs serveur par heure', labels: hrs, series: [{ name: 'Erreurs 5xx', values: hrs.map((_, i) => Math.round(rr() * 18 + (i === 9 ? 40 : 0))) }], height: 200, xLabel: 'Heure' }); } },
        { id: 'feed', title: 'Dernières alertes', w: 6, h: 2, render: b => { const ul = h('ul.vl-list'); alerts.slice(0, 5).forEach(a => { const st = ASTATE.find(z => z.value === a.state); const li = h('li', null, h('span.vl-status', { 'data-tone': a.sev === 'info' ? 'info' : a.sev, text: SEV.find(s => s.value === a.sev).label }), h('div.vl-grow', null, h('div', { text: a.text }), h('div.vl-caption', { text: `${svcName(a.svc)} · ${fmt.relative(a.time)} · ${st.label}` }))); if (a.state === 'open') { const bt = h('button.vl-btn.vl-btn--sm', { type: 'button', text: 'Acquitter' }); bt.addEventListener('click', () => { ack(a); V.activity.log({ title: `${a.id} acquittée`, detail: a.text, icon: 'check', undo: () => { a.state = 'open'; saveAlerts(); } }); ui.toast('Alerte acquittée'); bt.replaceWith(h('span.vl-caption', { text: 'Acquittée' })); }); li.append(bt); } ul.append(li); }); b.append(ul); } },
        { id: 'probes', title: 'Journal des sondes', w: 6, note: 'source externe simulée', skeleton: 'lines', load: (() => { let n = 0; return async () => { await demo.wait(800); if (n++ === 0) throw new Error('La source des sondes a répondu « 503 Service indisponible » (simulation pour illustrer l’état d’erreur).'); return true; }; })(), render: b => { b.append(h('p', { html: '<span class="vl-status" data-tone="ok">Source rétablie</span>' }), h('p.vl-caption', { style: { marginTop: '8px' }, text: '128 sondes rapportées sur les 5 dernières minutes.' })); } }
      ]
    });
    startLive();
    V.current.onLeave(stopLive);
    return root;
  }

  function servicesView() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Supervision', title: 'Services', actions: [demo.badge()] }));
    const groups = [...new Set(SERVICES.map(s => s.group))];
    const toneClass = { ok: 'green', warn: 'yellow', crit: 'rust', idle: 'muted' };
    function paint() {
      body.innerHTML = '';
      groups.forEach(gname => {
        body.append(h('h2.vl-section-title', { text: gname, 'data-vl-reveal': '' }));
        const grid = h('div.vl-grid', { style: { gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' } });
        SERVICES.filter(s => s.group === gname).forEach(s => {
          const t = h('div', { class: 'vl-tile vl-tile--' + toneClass[s.status], tabindex: '0', role: 'button', 'data-vl-reveal': '' });
          t.innerHTML = `<div class="vl-tile__meta">Depuis ${esc(fmt.relative(s.since))}</div><h3 class="vl-tile__title">${esc(s.name)}</h3><div class="vl-tile__sub">${s.checks} sondes</div><div class="vl-tile__foot"><span class="vl-tile__value vl-num">${s.latency} ms</span><span class="vl-status vl-tile__status" data-tone="${s.status}">${esc(STATUS[s.status])}</span></div>`;
          const go = () => inspectService(s, t, SERVICES);
          t.addEventListener('click', go); t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
          grid.append(t);
        });
        body.append(grid);
      });
      M.reveal(body);
    }
    const body = h('div'); root.append(body); paint();
    refresh = paint; V.current.onLeave(() => { refresh = () => {}; });
    return root;
  }

  function alertsView() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Supervision', title: 'Alertes', stats: [{ icon: 'alert', value: alerts.filter(a => a.state === 'open').length, label: 'ouvertes' }, { icon: 'check', value: alerts.filter(a => a.state === 'ack').length, label: 'acquittées' }], actions: [demo.badge()] }));
    const card = h('section.vl-card', { 'data-vl-reveal': '' }); root.append(card);
    const t = V.table(card, {
      id: APP + '.alerts', caption: 'Alertes de supervision', rowKey: 'id', allLabel: 'Toutes les alertes',
      columns: [
        { key: 'id', label: 'Alerte', primary: true, render: a => `<span class="vl-num">${esc(a.id)}</span>` },
        { key: 'sev', label: 'Sévérité', filterable: true, options: SEV, tone: a => a.sev, sortValue: a => ['crit', 'warn', 'info'].indexOf(a.sev) },
        { key: 'text', label: 'Message' },
        { key: 'svc', label: 'Service', filterable: true, value: a => svcName(a.svc) },
        { key: 'state', label: 'État', filterable: true, editable: true, options: ASTATE, tone: a => ({ open: 'crit', ack: 'warn', resolved: 'ok' })[a.state] },
        { key: 'time', label: 'Depuis', type: 'date', render: a => `<time datetime="${a.time}">${esc(fmt.relative(a.time))}</time>`, sortValue: a => -new Date(a.time) }
      ],
      views: [{ id: 'open', name: 'À traiter', state: { filters: { state: ['open'] }, sort: [{ key: 'sev', dir: 'asc' }] } }],
      searchPlaceholder: 'Rechercher un message, un service…',
      load: async () => { await demo.wait(400); return alerts; },
      onOpen: (a, tr) => { const s = SERVICES.find(x => x.id === a.svc); if (s) inspectService(s, tr.querySelector('button')); },
      onEdit: (a, k, v) => { a[k] = v; saveAlerts(); return true; },
      bulk: [{ label: 'Acquitter', icon: 'check', run: list => { const n = list.filter(ack).length; ui.toast(n ? `${n} alerte(s) acquittée(s)` : 'Aucune alerte ouverte dans la sélection'); } }]
    });
    refresh = () => t.refresh(); V.current.onLeave(() => { refresh = () => {}; });
    return root;
  }

  V.app({
    id: APP, name: 'Velora Supervision', short: 'Supervision', base: '../',
    views: [
      { id: 'overview', label: 'Vue d’ensemble', short: 'Accueil', icon: 'grid', render: overview },
      { id: 'services', label: 'Services', icon: 'server', render: servicesView },
      { id: 'alerts', label: 'Alertes', icon: 'alert', render: alertsView }
    ],
    commands: [{ id: 'mon.live', group: 'Actions', label: 'Mettre en pause ou reprendre le direct', icon: 'pause', run: () => { const b = document.querySelector('.vl-pagehead__actions .vl-btn'); if (b) b.click(); else ui.toast('Le direct est disponible sur la vue d’ensemble'); } }],
    search: q => V.command.rank(q, SERVICES.map(s => ({ id: 's.' + s.id, label: s.name, sub: STATUS[s.status], icon: 'server', group: 'Services', run: () => inspectService(s) }))).slice(0, 6).map(x => x.item),
    notifications: [
      { id: 'm1', title: 'Sauvegardes indisponibles', body: 'La tâche nocturne a échoué deux fois de suite.', tone: 'crit', icon: 'alert', time: demo.hoursAgo(.3), actions: [{ label: 'Voir les alertes', primary: true, run: () => V.current.navigate('alerts') }] },
      { id: 'm2', title: 'Serveur de fichiers dégradé', body: 'Latence disque au-dessus du seuil depuis 40 minutes.', tone: 'warn', icon: 'server', time: demo.hoursAgo(.8) }
    ]
  });
})();
