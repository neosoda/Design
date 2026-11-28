/* Velora CRM: the V3 sales CRM, now built from Velora components.
   Card colour = deal stage (yellow Qualification, green Proposition, rust Négociation, charcoal Signature). */
(function () {
  'use strict';
  const V = window.Velora, { h, icon, esc, fmt, ui, demo, motion: M } = V;
  const APP = 'crm';
  const STAGES = [
    { id: 'qual', label: 'Qualification', tone: 'yellow', prob: 20 }, { id: 'prop', label: 'Proposition', tone: 'green', prob: 45 },
    { id: 'nego', label: 'Négociation', tone: 'rust', prob: 70 }, { id: 'close', label: 'Signature', tone: 'charcoal', prob: 90 }, { id: 'won', label: 'Gagné', tone: 'won', prob: 100 }
  ];
  const ST = id => STAGES.find(s => s.id === id) || { label: id === 'lost' ? 'Perdu' : id, prob: 0, tone: 'muted' };
  const SALES = demo.TEAM.slice(2, 7);
  const ACCOUNTS = [
    ['Marée Haute Logistique', 'Grand compte', 'Le Havre'], ['Atelier Brun & Fils', 'PME', 'Lyon'], ['Clinique des Tilleuls', 'Grand compte', 'Nancy'],
    ['Ferme Solaire du Causse', 'ETI', 'Rodez'], ['Hôtels Rive Gauche', 'Grand compte', 'Paris'], ['Studio Quillon Data', 'PME', 'Nantes'],
    ['Transports Vauclair', 'ETI', 'Metz'], ['Céramiques Atlas', 'PME', 'Limoges'], ['Mutuelle Horizon', 'Grand compte', 'Strasbourg'], ['Bois & Rivages', 'PME', 'Annecy'],
    ['Cinémas du Nord', 'ETI', 'Lille'], ['Laboratoire Vela', 'ETI', 'Grenoble']
  ];
  const OFFERS = ['Extension de licences', 'Renouvellement annuel', 'Module analytique', 'Support premium', 'Migration de données', 'Intégration API', 'Formation des équipes', 'Déploiement multi-sites'];

  function generate() {
    const r = demo.rng(97);
    const deals = Array.from({ length: 34 }, (_, i) => {
      const st = demo.pick(r, ['qual', 'qual', 'prop', 'prop', 'nego', 'nego', 'close', 'won']);
      const acc = ACCOUNTS[Math.floor(r() * ACCOUNTS.length)];
      return { id: 'D-' + (480 + i), title: demo.pick(r, OFFERS), account: acc[0], amount: Math.round((3 + r() * 60) * 1000 / 10) * 10, stage: st, owner: demo.pick(r, SALES), team: [demo.pick(r, SALES), demo.pick(r, SALES)].filter((v, k, a) => a.indexOf(v) === k), close: new Date(Date.now() + (r() * 80 - 10) * 864e5).toISOString(), note: demo.pick(r, ['Le sponsor attend une proposition révisée.', 'Budget confirmé pour le prochain trimestre.', 'Revue juridique en cours.', 'Souhaite un pilote sur un site avant extension.']) };
    });
    return { deals, lost: 9 };
  }
  const DATA = demo.records(APP, 'deals', generate, 2);
  const DEALS = DATA.deals;
  const persist = () => demo.save(APP, 'deals', DATA, 2);
  const open = () => DEALS.filter(d => !['won', 'lost'].includes(d.stage));
  const weighted = d => d.amount * ST(d.stage).prob / 100;

  const accounts = demo.records(APP, 'accounts', () => {
    const r = demo.rng(5);
    return ACCOUNTS.map(([name, seg, city], i) => ({ id: 'A' + i, name, seg, city, owner: SALES[i % SALES.length], health: Math.round(42 + r() * 55), contact: demo.daysAgo(r() * 30), star: r() < .3 }));
  });
  const saveAccounts = () => demo.save(APP, 'accounts', accounts);

  function openDeal(d, el, board) {
    return V.stageDialog({
      item: d, source: el, stages: STAGES, stageOf: x => x.stage,
      setStage: (x, s) => { x.stage = s; persist(); board && board.refresh(false); },
      title: x => x.title, eyebrow: x => `${x.id} · clôture prévue le ${fmt.date(x.close)}`, sub: x => x.account,
      value: x => fmt.money(x.amount),
      facts: x => [['Clôture', fmt.dateShort(x.close)], ['Probabilité', '', ST(x.stage).prob, v => fmt.int(v) + ' %'], ['Pondéré', '', weighted(x), fmt.money]],
      people: x => x.team, note: x => x.note,
      nextLabel: n => n.id === 'won' ? 'Marquer gagné' : 'Passer en ' + n.label.toLowerCase(), doneLabel: 'Affaire gagnée',
      secondary: { label: x => x.stage === 'won' ? null : 'Voir le compte', icon: 'building', run: (x, dlg) => { dlg.close(); const a = accounts.find(c => c.name === x.account); if (a) setTimeout(() => inspectAccount(a), 300); } }
    });
  }
  function inspectAccount(a, opener, list) {
    V.inspector.open({
      record: a, list: list || [a], opener,
      title: r => r.name, eyebrow: r => `${r.seg} · ${r.city}`,
      summary: r => { const deals = DEALS.filter(d => d.account === r.name); const pipe = deals.filter(d => !['won', 'lost'].includes(d.stage)).reduce((s, d) => s + d.amount, 0); return `<div class="vl-row"><span class="vl-status" data-tone="${r.health < 60 ? 'warn' : 'ok'}">Santé ${r.health} / 100</span><span class="vl-caption">${deals.length} affaire${deals.length > 1 ? 's' : ''} · ${esc(fmt.money(pipe))} en cours</span></div><div class="vl-meter" data-tone="${r.health < 60 ? 'crit' : 'ok'}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${r.health}" aria-label="Santé du compte"><i style="--v:${r.health}%"></i></div>`; },
      fields: [{ key: 'name', label: 'Société', required: true }, { key: 'seg', label: 'Segment', type: 'select', options: ['PME', 'ETI', 'Grand compte'] }, { key: 'city', label: 'Ville' }, { key: 'owner', label: 'Responsable', type: 'select', options: SALES }],
      activity: r => DEALS.filter(d => d.account === r.name).slice(0, 4).map(d => ({ when: fmt.date(d.close), text: `${d.title} · ${ST(d.stage).label} · ${fmt.money(d.amount)}` })),
      onSave: (r, v) => { const before = { ...r }; Object.assign(r, v); saveAccounts(); V.activity.log({ title: `Compte ${r.name} modifié`, icon: 'building', undo: () => { Object.assign(r, before); saveAccounts(); } }); refresh(); return true; }
    });
  }
  let refresh = () => {};

  function newDeal(ctx, stage) {
    const id = V.uid('nd');
    const form = h('form.vl-stack', { novalidate: true, style: { gap: '12px' } },
      h('div.vl-field', null, h('label', { for: id + 't', text: 'Intitulé (obligatoire)' }), h('input.vl-input', { id: id + 't', name: 'title', required: true, autocomplete: 'off' }), h('span.vl-field__error', { hidden: true })),
      h('div.vl-field', null, h('label', { for: id + 'a', text: 'Compte' }), h('select.vl-select', { id: id + 'a', name: 'account' }, ...ACCOUNTS.map(a => h('option', { text: a[0] })))),
      h('div.vl-grid', { style: { gridTemplateColumns: '1fr 1fr' } },
        h('div.vl-field', null, h('label', { for: id + 'm', text: 'Montant (€)' }), h('input.vl-input', { id: id + 'm', name: 'amount', type: 'number', min: '0', step: '10', value: '10000' })),
        h('div.vl-field', null, h('label', { for: id + 's', text: 'Étape' }), h('select.vl-select', { id: id + 's', name: 'stage' }, ...STAGES.slice(0, 4).map(s => h('option', { value: s.id, text: s.label, selected: s.id === (stage || 'qual') }))))));
    const submit = () => {
      const fd = new FormData(form); const t = String(fd.get('title') || '').trim();
      const err = form.querySelector('.vl-field__error'), input = form.elements.title;
      if (!t) { err.hidden = false; err.textContent = 'Donnez un intitulé à l’affaire.'; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
      const d = { id: 'D-' + (Math.max(...DEALS.map(x => +x.id.slice(2))) + 1), title: t, account: fd.get('account'), amount: Math.max(0, +fd.get('amount') || 0), stage: fd.get('stage'), owner: SALES[0], team: [SALES[0]], close: new Date(Date.now() + 30 * 864e5).toISOString(), note: '' };
      DEALS.unshift(d); persist(); dlg.close();
      V.activity.log({ title: `Affaire ${d.id} créée`, detail: `${d.title} · ${d.account}`, icon: 'plus', undo: () => { DEALS.splice(DEALS.indexOf(d), 1); persist(); refresh(); } });
      ui.toast('Affaire créée dans ' + ST(d.stage).label);
      if (ctx.view !== 'pipeline') ctx.navigate('pipeline'); else refresh();
    };
    form.addEventListener('submit', e => { e.preventDefault(); submit(); });
    const dlg = ui.dialog({ title: 'Nouvelle affaire', eyebrow: 'CRM', body: form, actions: [{ label: 'Annuler', variant: 'ghost', run: x => x.close() }, { label: 'Créer l’affaire', variant: 'strong', icon: 'plus', run: submit }] });
  }

  const tileHTML = d => `<div class="vl-tile__meta">Clôture ${esc(fmt.dateShort(d.close))}</div><h4 class="vl-tile__title">${esc(d.title)}</h4><div class="vl-tile__sub">${esc(d.account)}</div><div class="vl-tile__foot"><span><span class="vl-tile__value vl-num">${esc(fmt.money(d.amount))}</span><br><span class="vl-tile__sub">${esc(ST(d.stage).label)} · ${ST(d.stage).prob} %</span></span>${V.avatars(d.team)}</div>`;

  function overview() {
    const root = h('div');
    const o = open();
    const pipe = o.reduce((s, d) => s + d.amount, 0), wsum = o.reduce((s, d) => s + weighted(d), 0), won = DEALS.filter(d => d.stage === 'won');
    root.append(V.shell.pageHead({ eyebrow: 'Ventes', title: 'Vue d’ensemble', stats: [
      { icon: 'euro', value: pipe, format: 'money', label: 'en pipeline' },
      { icon: 'target', value: wsum, format: 'money', label: 'pondéré par étape' },
      { icon: 'check', value: won.length, label: 'affaires gagnées', delta: DATA.lost + ' perdues', deltaTone: 'soft' }
    ], actions: [demo.badge()] }));
    const host = h('div'); root.append(host);
    const months = ['déc.', 'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.'];
    const rr = demo.rng(3);
    const revenue = months.map((_, i) => Math.round(38000 + i * 2600 + rr() * 9000));
    const target = 60000;
    V.dashboard(host, {
      id: APP + '.dash', label: 'Tableau de bord commercial',
      widgets: [
        { id: 'revenue', title: 'Chiffre d’affaires signé', w: 8, h: 2, render: (b, c) => {
          const head = h('div.vl-split', { style: { marginBottom: '4px' } }, h('div', null, h('div.vl-figure.vl-num', { text: fmt.money(revenue[11]) }), h('div.vl-caption', { text: 'en novembre, objectif mensuel ' + fmt.money(target) })), h('div', { html: ui.segHTML('Période', [['6', '6 mois'], ['12', '12 mois']], '12') }));
          const el = h('div'); b.append(head, el);
          const chart = V.charts.line(el, { label: 'Chiffre d’affaires signé par mois', labels: months, series: [{ name: 'Chiffre d’affaires', values: revenue }], target: { value: target, label: 'Objectif' }, format: fmt.money, height: c.detail ? 320 : 210, xLabel: 'Mois' });
          /* Period change morphs the points instead of redrawing (V3 grammar). */
          ui.seg(head.querySelector('.vl-seg'), v => chart.update({ labels: months.slice(-v), series: [{ name: 'Chiffre d’affaires', values: revenue.slice(-v) }] }));
          return { chart };
        } },
        { id: 'mix', title: 'Répartition par étape', w: 4, h: 2, render: b => { const el = h('div'); b.append(el); V.charts.donut(el, { label: 'Montant en pipeline par étape', items: STAGES.slice(0, 4).map(s => ({ label: s.label, value: o.filter(d => d.stage === s.id).reduce((a, d) => a + d.amount, 0), color: `var(--vl-stage-${s.tone === 'charcoal' ? 'charcoal' : s.tone})` })), format: fmt.money, centerLabel: 'en pipeline', centerValue: t => fmt.compact(t) + ' €' }); } },
        { id: 'hot', title: 'Affaires à conclure', w: 12, h: 1, note: 'clôture la plus proche', render: b => {
          const list = o.slice().sort((a, c) => new Date(a.close) - new Date(c.close)).slice(0, 4);
          const grid = h('div.vl-grid', { style: { gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' } });
          list.forEach(d => { const t = h('div', { class: 'vl-tile vl-tile--' + ST(d.stage).tone, tabindex: '0', role: 'button' }); t.innerHTML = tileHTML(d); const go = () => openDeal(d, t); t.addEventListener('click', go); t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); grid.append(t); });
          b.append(grid);
        } },
        { id: 'quota', title: 'Pondéré par commercial', w: 6, h: 2, render: b => { const el = h('div'); b.append(el); V.charts.bars(el, { label: 'Montant pondéré par commercial', items: SALES.map(n => ({ label: n, value: Math.round(o.filter(d => d.owner === n).reduce((a, d) => a + weighted(d), 0)) })), format: fmt.money }); } },
        { id: 'monthly', title: 'Affaires signées par mois', w: 6, h: 2, render: b => { const el = h('div'); b.append(el); const r2 = demo.rng(11); V.charts.columns(el, { label: 'Affaires signées par segment et par mois', labels: months.slice(-6), series: [{ name: 'PME', values: months.slice(-6).map(() => Math.round(2 + r2() * 5)) }, { name: 'ETI', values: months.slice(-6).map(() => Math.round(1 + r2() * 4)) }, { name: 'Grands comptes', values: months.slice(-6).map(() => Math.round(r2() * 3)) }], height: 210 }); } }
      ]
    });
    return root;
  }

  function pipeline() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Ventes', title: 'Pipeline', actions: [demo.badge()] }));
    const host = h('div', { 'data-vl-reveal': '' }); root.append(host);
    const board = V.kanban(host, {
      label: 'Pipeline commercial', items: DEALS, columns: STAGES.slice(0, 4),
      colOf: d => d.stage, setCol: (d, s) => { d.stage = s; persist(); },
      title: d => d.title + ' (' + d.account + ')', card: tileHTML, cardLabel: d => `${d.title}, ${d.account}, ${fmt.money(d.amount)}, ${ST(d.stage).label}`,
      total: items => items.length ? fmt.money(items.reduce((a, d) => a + d.amount, 0)) : '',
      zones: [{ id: 'won', label: 'Gagné', icon: 'check', count: () => String(DEALS.filter(d => d.stage === 'won').length) }, { id: 'lost', label: 'Perdu', icon: 'x', count: () => String(DATA.lost) }],
      onZone: (d, z) => { if (z === 'lost') { d._prevStage = d.stage; d.stage = 'lost'; DATA.lost++; } else d.stage = 'won'; persist(); },
      onZoneUndo: (d, z, from) => { if (z === 'lost') DATA.lost--; d.stage = from; persist(); },
      onCreate: st => newDeal(V.current, st),
      onOpen: (d, el) => openDeal(d, el, board)
    });
    refresh = () => board.refresh();
    V.current.onLeave(() => { refresh = () => {}; });
    return root;
  }

  function accountsView() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Ventes', title: 'Comptes', stats: [
      { icon: 'building', value: accounts.length, label: 'comptes suivis' },
      { icon: 'alert', value: accounts.filter(a => a.health < 60).length, label: 'santé fragile' }
    ], actions: [demo.badge()] }));
    const card = h('section.vl-card', { 'data-vl-reveal': '' }); root.append(card);
    const pipeOf = a => DEALS.filter(d => d.account === a.name && !['won', 'lost'].includes(d.stage)).reduce((s, d) => s + d.amount, 0);
    const t = V.table(card, {
      id: APP + '.accounts', caption: 'Comptes clients', rowKey: 'id',
      columns: [
        { key: 'name', label: 'Société', primary: true },
        { key: 'star', label: 'Suivi', render: a => `<span class="vl-status" data-tone="${a.star ? 'info' : 'idle'}">${a.star ? 'Prioritaire' : 'Standard'}</span>`, value: a => a.star ? 'Prioritaire' : 'Standard', filterable: true },
        { key: 'seg', label: 'Segment', filterable: true, editable: true, options: ['PME', 'ETI', 'Grand compte'] },
        { key: 'city', label: 'Ville' },
        { key: 'owner', label: 'Responsable', type: 'person', filterable: true, editable: true, options: SALES },
        { key: 'health', label: 'Santé', type: 'number', align: 'end', render: a => `<span class="vl-status vl-status--text" data-tone="${a.health < 60 ? 'warn' : 'ok'}">${a.health}</span>` },
        { key: 'pipe', label: 'En cours', type: 'money', align: 'end', value: pipeOf, search: false },
        { key: 'contact', label: 'Dernier contact', type: 'date' }
      ],
      views: [{ id: 'fragile', name: 'Santé fragile', state: { sort: [{ key: 'health', dir: 'asc' }] } }, { id: 'big', name: 'Grands comptes', state: { filters: { seg: ['Grand compte'] } } }],
      allLabel: 'Tous les comptes', searchPlaceholder: 'Rechercher un compte, une ville…', searchHint: 'tapez « segment:pme » ou « ville:lyon ».',
      load: async () => { await demo.wait(500); return accounts; },
      onOpen: (a, tr, list) => inspectAccount(a, tr.querySelector('button'), list),
      onEdit: (a, k, v) => { a[k] = v; saveAccounts(); return true; }
    });
    refresh = () => t.refresh();
    V.current.onLeave(() => { refresh = () => {}; });
    return root;
  }

  V.app({
    id: APP, name: 'Velora CRM', short: 'CRM', base: '../',
    views: [
      { id: 'overview', label: 'Vue d’ensemble', short: 'Accueil', icon: 'grid', render: overview },
      { id: 'pipeline', label: 'Pipeline', icon: 'board', render: pipeline, keywords: 'kanban affaires deals' },
      { id: 'accounts', label: 'Comptes', icon: 'building', render: accountsView, keywords: 'clients societes' }
    ],
    create: { label: 'Nouvelle affaire', run: ctx => newDeal(ctx) },
    search: q => V.command.rank(q, DEALS.map(d => ({ id: 'deal.' + d.id, label: d.title + ' · ' + d.account, sub: `${ST(d.stage).label} · ${fmt.money(d.amount)}`, icon: 'target', group: 'Affaires', run: () => { V.current.navigate('pipeline'); setTimeout(() => openDeal(d, null), 500); } })).concat(accounts.map(a => ({ id: 'acc.' + a.id, label: a.name, sub: a.city, icon: 'building', group: 'Comptes', run: () => inspectAccount(a) })))).slice(0, 8).map(x => x.item),
    notifications: [
      { id: 'c1', title: 'Clôture dans 3 jours', body: 'Renouvellement annuel, Hôtels Rive Gauche : la signature est attendue vendredi.', tone: 'warn', icon: 'cal', time: demo.hoursAgo(1.5) },
      { id: 'c2', title: 'Nouvelle demande entrante', body: 'Bois & Rivages souhaite une démonstration du module analytique.', tone: 'info', icon: 'mail', time: demo.hoursAgo(5) }
    ]
  });
})();
