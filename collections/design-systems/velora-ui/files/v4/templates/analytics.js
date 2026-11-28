/* Velora Analytique: one filter row scopes every figure below it; one hero figure per view;
   refetch keeps the frame (charts dim, then morph to the new values). Two measures never share an axis. */
(function () {
  'use strict';
  const V = window.Velora, { h, icon, esc, fmt, ui, demo, motion: M } = V;
  const APP = 'analytics';
  const CHANNELS = ['Recherche', 'Direct', 'E-mail', 'Réseaux sociaux'];
  const SEGMENTS = [{ value: 'all', label: 'Tous les visiteurs' }, { value: 'new', label: 'Nouveaux visiteurs' }, { value: 'back', label: 'Visiteurs fidèles' }];
  const RANGES = [['7', '7 jours'], ['30', '30 jours'], ['90', '90 jours']];
  const PAGES = ['/accueil', '/tarifs', '/documentation', '/blog/guide-migration', '/contact', '/fonctionnalites', '/blog/securite', '/inscription'];
  let F = V.store.get(APP + '.filters', { range: '30', segment: 'all' });
  if (!RANGES.some(r => r[0] === F.range)) F.range = '30';
  if (!SEGMENTS.some(s => s.value === F.segment)) F.segment = 'all';

  /* Deterministic sample generator: the same filters always give the same numbers, all aggregates agree. */
  function dataset(f) {
    const days = +f.range, seed = days * 7 + SEGMENTS.findIndex(s => s.value === f.segment) * 101;
    const r = demo.rng(seed + 1);
    const k = f.segment === 'all' ? 1 : f.segment === 'new' ? .58 : .42;
    const labels = Array.from({ length: days }, (_, i) => fmt.dateShort(Date.now() - (days - 1 - i) * 864e5));
    const sessions = labels.map((_, i) => Math.round(k * (1800 + Math.sin(i / 3.2) * 260 + (i % 7 > 4 ? -420 : 0) + r() * 240 + i * 4)));
    const conv = sessions.map(s => Math.round(s * (.021 + r() * .012)));
    const split = [.44, .26, .17, .13].map(x => x + (r() - .5) * .04);
    const byChannel = CHANNELS.map((_, c) => sessions.map(s => Math.round(s * split[c])));
    const weeks = Math.min(12, Math.floor(days / 7));
    const weekLabels = Array.from({ length: weeks }, (_, i) => 'S-' + (weeks - 1 - i)).map(x => x === 'S-0' ? 'Cette sem.' : x);
    const weekly = CHANNELS.map((_, c) => weekLabels.map((_, w) => byChannel[c].slice(Math.max(0, days - (weeks - w) * 7), days - (weeks - 1 - w) * 7).reduce((a, b) => a + b, 0)));
    const devices = [['Ordinateur', .56], ['Mobile', .37], ['Tablette', .07]].map(([l, p]) => ({ label: l, value: Math.round(sessions.reduce((a, b) => a + b, 0) * (p + (r() - .5) * .04)) }));
    const pages = PAGES.map(p => ({ label: p, value: Math.round(k * days * (40 + r() * 260)) }));
    const total = sessions.reduce((a, b) => a + b, 0), totalConv = conv.reduce((a, b) => a + b, 0);
    return { labels, sessions, conv, byChannel, weekLabels, weekly, devices, pages, total, totalConv, rate: totalConv / total * 100, avg: Math.round(total / days) };
  }

  function overview() {
    const root = h('div');
    let D = dataset(F);
    root.append(V.shell.pageHead({ eyebrow: 'Analytique', title: 'Audience et conversions', actions: [demo.badge()] }));
    /* Filter row: date range first, then segment. Scopes everything below. */
    const segSel = h('select.vl-select', { id: 'an-seg', 'aria-label': 'Segment' }, ...SEGMENTS.map(s => h('option', { value: s.value, text: s.label, selected: s.value === F.segment })));
    const filters = h('div.vl-filterbar', { role: 'group', 'aria-label': 'Filtres de la page', 'data-vl-reveal': '' }, h('span.vl-filterbar__label', { text: 'Période' }), h('div', { html: ui.segHTML('Période', RANGES, F.range) }), h('label.vl-filterbar__label', { for: 'an-seg', text: 'Segment' }), segSel, h('span.vl-grow'), h('span.vl-caption', { 'aria-live': 'polite', 'data-status': '' }));
    root.append(filters);
    const hero = h('section.vl-card.vl-heroband', { 'data-vl-reveal': '' });
    root.append(hero);
    const charts = {};
    function paintHero() {
      hero.innerHTML = '';
      hero.append(
        h('div', null, h('div.vl-kpi__label', { text: `Sessions sur ${F.range} jours` }), h('div.vl-hero', { 'data-vl-count': D.total, 'data-vl-format': 'int', text: fmt.int(D.total) })),
        h('div.vl-heroband__tiles', null,
          tile('Conversions', D.totalConv, fmt.int, D.conv),
          tile('Taux de conversion', D.rate, v => fmt.pct(v, 2), D.conv.map((c, i) => c / D.sessions[i] * 100)),
          tile('Moyenne quotidienne', D.avg, fmt.int, D.sessions)));
      V.shell.countAll(hero);
    }
    function tile(label, value, format, trend) {
      return h('div.vl-kpi', null, h('span.vl-kpi__label', { text: label }), h('div.vl-kpi__row', null, h('b.vl-kpi__value', { 'data-vl-count': value, 'data-vl-format': format === fmt.int ? 'int' : 'pct2', text: format(value) }), h('span', { html: V.charts.spark(trend.slice(-12)) })));
    }
    V.fmt.pct2 = v => fmt.pct(v, 2);
    paintHero();
    const host = h('div'); root.append(host);
    const dash = V.dashboard(host, {
      id: APP + '.dash', label: 'Audience',
      widgets: [
        { id: 'sessions', title: 'Sessions par jour', w: 6, h: 2, render: (b, c) => { const el = h('div'); b.append(el); charts.sessions = V.charts.line(el, { label: 'Sessions par jour', labels: D.labels, series: [{ name: 'Sessions', values: D.sessions }], height: c.detail ? 320 : 200, xLabel: 'Jour' }); return { chart: charts.sessions }; } },
        { id: 'conv', title: 'Conversions par jour', w: 6, h: 2, note: 'graphique séparé : autre échelle', render: (b, c) => { const el = h('div'); b.append(el); charts.conv = V.charts.line(el, { label: 'Conversions par jour', labels: D.labels, series: [{ name: 'Conversions', values: D.conv, slot: 1 }], height: c.detail ? 320 : 200, xLabel: 'Jour' }); return { chart: charts.conv }; } },
        { id: 'channels', title: 'Sessions par canal et par semaine', w: 8, h: 2, render: b => { const el = h('div'); b.append(el); charts.channels = V.charts.columns(el, { label: 'Sessions par canal et par semaine', labels: D.weekLabels, series: CHANNELS.map((n, i) => ({ name: n, values: D.weekly[i], slot: i })), format: fmt.int, height: 210, xLabel: 'Semaine' }); } },
        { id: 'devices', title: 'Appareils', w: 4, h: 2, render: b => { const el = h('div'); b.append(el); charts.devices = V.charts.donut(el, { label: 'Sessions par appareil', items: D.devices, format: fmt.int, centerLabel: 'sessions', centerValue: t => fmt.compact(t) }); } },
        { id: 'pages', title: 'Pages les plus vues', w: 12, h: 2, render: b => { const el = h('div'); b.append(el); charts.pages = V.charts.bars(el, { label: 'Pages les plus vues', items: D.pages }); } }
      ]
    });
    /* Refetch keeps the frame: charts dim at 50 %, then morph to the new values. */
    let pending = 0;
    async function apply() {
      V.store.set(APP + '.filters', F);
      const token = ++pending;
      const status = filters.querySelector('[data-status]');
      status.textContent = 'Mise à jour…';
      Object.values(charts).forEach(c => c && c.setBusy(true));
      await demo.wait(450);
      if (token !== pending) return;
      D = dataset(F);
      paintHero();
      charts.sessions && charts.sessions.update({ labels: D.labels, series: [{ name: 'Sessions', values: D.sessions }] });
      charts.conv && charts.conv.update({ labels: D.labels, series: [{ name: 'Conversions', values: D.conv, slot: 1 }] });
      charts.channels && charts.channels.update({ labels: D.weekLabels, series: CHANNELS.map((n, i) => ({ name: n, values: D.weekly[i], slot: i })) });
      charts.devices && charts.devices.update({ items: D.devices });
      charts.pages && charts.pages.update({ items: D.pages });
      Object.values(charts).forEach(c => c && c.setBusy(false));
      status.textContent = `${SEGMENTS.find(s => s.value === F.segment).label}, ${F.range} derniers jours`;
    }
    ui.seg(filters.querySelector('.vl-seg'), v => { F.range = v; apply(); });
    segSel.addEventListener('change', () => { F.segment = segSel.value; apply(); });
    filters.querySelector('[data-status]').textContent = `${SEGMENTS.find(s => s.value === F.segment).label}, ${F.range} derniers jours`;
    return root;
  }

  const campaigns = demo.records(APP, 'campaigns', () => {
    const r = demo.rng(31);
    const names = ['Lancement printemps', 'Relance clients inactifs', 'Webinaire sécurité', 'Newsletter mensuelle', 'Guide de migration', 'Salon professionnel', 'Offre éducation', 'Parrainage', 'Démo produit', 'Étude de cas'];
    return names.map((n, i) => { const s = Math.round(800 + r() * 9000); const c = Math.round(s * (.01 + r() * .05)); return { id: 'C' + i, name: n, channel: demo.pick(r, CHANNELS), sessions: s, conversions: c, rate: +(c / s * 100).toFixed(2), cost: Math.round(200 + r() * 4800), status: demo.pick(r, ['Active', 'Active', 'Terminée', 'Planifiée']) }; });
  });
  function explore() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Analytique', title: 'Campagnes', actions: [demo.badge()] }));
    const card = h('section.vl-card', { 'data-vl-reveal': '' }); root.append(card);
    V.table(card, {
      id: APP + '.campaigns', caption: 'Campagnes marketing', rowKey: 'id', allLabel: 'Toutes les campagnes',
      columns: [
        { key: 'name', label: 'Campagne', primary: true },
        { key: 'channel', label: 'Canal', filterable: true },
        { key: 'status', label: 'Statut', filterable: true, tone: c => ({ Active: 'ok', 'Terminée': 'idle', 'Planifiée': 'info' })[c.status] },
        { key: 'sessions', label: 'Sessions', type: 'number', align: 'end' },
        { key: 'conversions', label: 'Conversions', type: 'number', align: 'end' },
        { key: 'rate', label: 'Taux', align: 'end', render: c => `<span class="vl-num">${esc(fmt.pct(c.rate, 2))}</span>` },
        { key: 'cost', label: 'Coût', type: 'money', align: 'end', editable: true },
        { key: 'cpa', label: 'Coût par conversion', type: 'money', align: 'end', value: c => c.conversions ? c.cost / c.conversions : 0, search: false }
      ],
      views: [{ id: 'best', name: 'Meilleurs taux', state: { sort: [{ key: 'rate', dir: 'desc' }] } }, { id: 'active', name: 'Campagnes actives', state: { filters: { status: ['Active'] } } }],
      searchPlaceholder: 'Rechercher une campagne…', searchHint: 'tapez « canal:e-mail » ou « statut:active ».',
      load: async () => { await demo.wait(450); return campaigns; },
      onOpen: (c, tr, list) => V.inspector.open({ record: c, list, opener: tr.querySelector('button'), title: x => x.name, eyebrow: x => x.channel,
        summary: x => `<div class="vl-grid" style="grid-template-columns:1fr 1fr"><div class="vl-kpi"><span class="vl-kpi__label">Sessions</span><b class="vl-kpi__value vl-num">${fmt.int(x.sessions)}</b></div><div class="vl-kpi"><span class="vl-kpi__label">Conversions</span><b class="vl-kpi__value vl-num">${fmt.int(x.conversions)}</b></div></div>`,
        fields: [{ key: 'name', label: 'Nom', required: true }, { key: 'channel', label: 'Canal', type: 'select', options: CHANNELS }, { key: 'status', label: 'Statut', type: 'select', options: ['Active', 'Terminée', 'Planifiée'] }, { key: 'cost', label: 'Coût (€)', type: 'number', min: 0 }],
        onSave: (x, v) => { Object.assign(x, v); demo.save(APP, 'campaigns', campaigns); V.activity.log({ title: 'Campagne ' + x.name + ' modifiée', icon: 'edit' }); return true; } }),
      onEdit: (c, k, v) => { c[k] = Math.max(0, +v || 0); demo.save(APP, 'campaigns', campaigns); return true; }
    });
    return root;
  }

  const reports = demo.records(APP, 'reports', () => [
    { id: 'R1', name: 'Synthèse hebdomadaire', freq: 'Chaque lundi', scheduled: true, recipients: 'direction@exemple.org' },
    { id: 'R2', name: 'Performance des campagnes', freq: 'Chaque mois', scheduled: false, recipients: 'marketing@exemple.org' }
  ]);
  function reportsView() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Analytique', title: 'Rapports', actions: [h('button.vl-btn.vl-btn--strong', { type: 'button', html: icon('plus') + 'Nouveau rapport', onclick: () => newReport() }), demo.badge()] }));
    const list = h('div.vl-stack', { 'data-vl-reveal': '' }); root.append(list);
    function paint() {
      list.innerHTML = '';
      if (!reports.length) { list.append(h('section.vl-card', null, ui.state.empty({ title: 'Aucun rapport', text: 'Créez un rapport pour recevoir une synthèse à intervalle régulier.', action: { label: 'Créer un rapport', icon: 'plus', run: newReport } }))); return; }
      reports.forEach(rep => {
        const id = V.uid('rp');
        const sw = h('input', { type: 'checkbox', id, checked: rep.scheduled });
        sw.addEventListener('change', () => { rep.scheduled = sw.checked; demo.save(APP, 'reports', reports); ui.toast(rep.scheduled ? 'Envoi planifié : ' + rep.freq.toLowerCase() : 'Envoi suspendu'); });
        list.append(h('section.vl-card.vl-report', null,
          h('span.vl-stat__icon', { html: icon('receipt') }),
          h('div.vl-grow', null, h('h2.vl-card__title', { text: rep.name }), h('p.vl-caption', { text: `${rep.freq} · ${rep.recipients}` })),
          h('label.vl-switch', { for: id }, sw, h('span', { text: 'Envoi planifié' })),
          h('button.vl-icon-btn.vl-icon-btn--sm.vl-icon-btn--ghost', { type: 'button', 'aria-label': 'Supprimer le rapport ' + rep.name, html: icon('trash'), onclick: async () => { if (!await ui.confirm({ title: 'Supprimer « ' + rep.name + ' » ?', message: 'Les envois planifiés de ce rapport s’arrêtent.', confirm: 'Supprimer', tone: 'danger' })) return; const i = reports.indexOf(rep); reports.splice(i, 1); demo.save(APP, 'reports', reports); paint(); ui.toast('Rapport supprimé', { action: { label: 'Annuler', run: () => { reports.splice(i, 0, rep); demo.save(APP, 'reports', reports); paint(); } } }); } })));
      });
    }
    function newReport() {
      const id = V.uid('nr');
      const name = h('input.vl-input', { id, required: true, autocomplete: 'off', 'aria-describedby': id + '-e' });
      const err = h('span.vl-field__error', { id: id + '-e', hidden: true, text: 'Donnez un nom au rapport.' });
      const freq = h('select.vl-select', { id: id + 'f' }, ...['Chaque jour', 'Chaque lundi', 'Chaque mois'].map(x => h('option', { text: x })));
      const form = h('form.vl-stack', { novalidate: true, style: { gap: '12px' } }, h('div.vl-field', null, h('label', { for: id, text: 'Nom du rapport (obligatoire)' }), name, err), h('div.vl-field', null, h('label', { for: id + 'f', text: 'Fréquence' }), freq));
      const submit = () => { if (!name.value.trim()) { err.hidden = false; name.setAttribute('aria-invalid', 'true'); name.focus(); return; } reports.push({ id: 'R' + Date.now().toString(36), name: name.value.trim(), freq: freq.value, scheduled: true, recipients: 'vous@exemple.org' }); demo.save(APP, 'reports', reports); d.close(); paint(); ui.toast('Rapport créé'); };
      form.addEventListener('submit', e => { e.preventDefault(); submit(); });
      const d = ui.dialog({ title: 'Nouveau rapport', size: 'sm', body: form, actions: [{ label: 'Annuler', variant: 'ghost', run: x => x.close() }, { label: 'Créer le rapport', variant: 'strong', run: submit }] });
    }
    paint();
    return root;
  }

  V.app({
    id: APP, name: 'Velora Analytique', short: 'Analytique', base: '../',
    views: [
      { id: 'overview', label: 'Audience', short: 'Audience', icon: 'trend', render: overview },
      { id: 'campaigns', label: 'Campagnes', icon: 'target', render: explore },
      { id: 'reports', label: 'Rapports', icon: 'receipt', render: reportsView }
    ],
    commands: RANGES.map(([v, l]) => ({ id: 'an.range.' + v, group: 'Filtres', label: 'Période : ' + l, icon: 'cal', run: () => { F.range = v; V.store.set(APP + '.filters', F); if (V.current.view === 'overview') { const b = document.querySelector(`.vl-filterbar [data-value="${v}"]`); b && b.click(); } else V.current.navigate('overview'); } })),
    search: q => V.command.rank(q, campaigns.map(c => ({ id: 'cp.' + c.id, label: c.name, sub: c.channel + ' · ' + c.status, icon: 'target', group: 'Campagnes', run: () => V.current.navigate('campaigns') }))).slice(0, 6).map(x => x.item),
    notifications: [{ id: 'an1', title: 'Rapport hebdomadaire prêt', body: 'La synthèse de la semaine est disponible.', tone: 'ok', icon: 'receipt', time: demo.hoursAgo(9), actions: [{ label: 'Voir les rapports', primary: true, run: () => V.current.navigate('reports') }] }]
  });
})();
