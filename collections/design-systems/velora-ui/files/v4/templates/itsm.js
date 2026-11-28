/* Velora Service desk: ITSM template (tickets, SLA, flow board). Colours = processing stage (V3 §07):
   yellow À qualifier, green En cours, rust En attente, charcoal Résolu. Priority P1 to P4 is text, never a fill. */
(function () {
  'use strict';
  const V = window.Velora, { h, icon, esc, fmt, ui, demo } = V;
  const APP = 'itsm';

  const STATES = [
    { id: 'qualify', label: 'À qualifier', tone: 'yellow' }, { id: 'progress', label: 'En cours', tone: 'green' },
    { id: 'waiting', label: 'En attente', tone: 'rust' }, { id: 'resolved', label: 'Résolu', tone: 'charcoal' }, { id: 'closed', label: 'Clos', tone: 'won' }
  ];
  const STATE_OPTS = STATES.map(s => ({ value: s.id, label: s.label })).concat([{ value: 'rejected', label: 'Rejeté' }]);
  const OPEN = ['qualify', 'progress', 'waiting'];
  const SLA_H = { P1: 4, P2: 8, P3: 24, P4: 72 };
  const PRIOS = [{ value: 'P1', label: 'P1 critique' }, { value: 'P2', label: 'P2 haute' }, { value: 'P3', label: 'P3 normale' }, { value: 'P4', label: 'P4 basse' }];
  const SITES = ['Siège', 'Bâtiment A', 'Bâtiment B', 'Atelier', 'Annexe Est'];
  const CATS = ['Matériel', 'Réseau', 'Comptes et accès', 'Logiciel', 'Téléphonie'];
  const TECHS = demo.TEAM.slice(0, 5);
  const ME = TECHS[0];
  const SUBJECTS = [
    ['Imprimante du 2e étage hors ligne', 'Matériel'], ['Accès VPN refusé depuis le domicile', 'Réseau'], ['Poste ne démarre plus après mise à jour', 'Matériel'],
    ['Création de compte pour un nouvel arrivant', 'Comptes et accès'], ['Wi-Fi instable en salle B12', 'Réseau'], ['Vidéoprojecteur sans signal HDMI', 'Matériel'],
    ['Licence du logiciel de PAO expirée', 'Logiciel'], ['Boîte aux lettres pleine', 'Logiciel'], ['Écran qui scintille', 'Matériel'], ['Mot de passe expiré, compte verrouillé', 'Comptes et accès'],
    ['Partage réseau « Projets » inaccessible', 'Réseau'], ['Badge d’accès désactivé', 'Comptes et accès'], ['Mise à jour bloquée à 30 %', 'Logiciel'], ['Téléphone IP sans tonalité', 'Téléphonie'],
    ['Demande de second écran', 'Matériel'], ['Sauvegarde nocturne en échec', 'Logiciel'], ['Lenteurs sur l’ERP', 'Logiciel'], ['Renvoi d’appel à configurer', 'Téléphonie'],
    ['Switch du local technique qui redémarre', 'Réseau'], ['Droits manquants sur le dossier RH', 'Comptes et accès']
  ];
  const REQUESTERS = ['Nora Lambert', 'Théo Garnier', 'Amel Haddad', 'Lucas Perrin', 'Jade Rousseau', 'Samir Aït', 'Emma Faure', 'Paul Mercier', 'Lina Chevalier', 'Adam Roux'];

  function generate() {
    const r = demo.rng(41);
    const weights = ['qualify', 'qualify', 'progress', 'progress', 'progress', 'waiting', 'waiting', 'resolved', 'resolved', 'closed', 'closed', 'rejected'];
    return Array.from({ length: 38 }, (_, i) => {
      const [subject, category] = SUBJECTS[i % SUBJECTS.length];
      const state = demo.pick(r, weights);
      const priority = demo.pick(r, ['P1', 'P2', 'P2', 'P3', 'P3', 'P3', 'P4', 'P4']);
      const ageH = .4 + r() * (OPEN.includes(state) ? 30 : 140);
      const t = {
        id: 'INC-' + (2140 - i), subject, category, priority, state,
        requester: demo.pick(r, REQUESTERS), site: demo.pick(r, SITES),
        assignee: state === 'qualify' && r() < .6 ? '' : demo.pick(r, TECHS),
        created: demo.hoursAgo(ageH), notes: r() < .5 ? 'L’utilisateur est joignable sur son poste fixe jusqu’à 17 h.' : 'Diagnostic à distance possible, prise en main autorisée.'
      };
      if (['resolved', 'closed'].includes(state)) t.resolvedAfter = +(SLA_H[priority] * (.25 + r() * 1.1)).toFixed(2);
      return t;
    });
  }
  let TICKETS = demo.records(APP, 'tickets', generate, 2);
  const persist = () => demo.save(APP, 'tickets', TICKETS, 2);
  const byId = id => TICKETS.find(t => t.id === id);
  const stateLabel = id => (STATE_OPTS.find(s => s.value === id) || {}).label || id;

  const dur = hrs => { const m = Math.round(Math.abs(hrs) * 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); };
  function sla(t) {
    if (t.state === 'rejected') return { text: 'Rejeté', tone: 'idle', left: Infinity };
    if (!OPEN.includes(t.state)) return { text: 'Résolu en ' + dur(t.resolvedAfter || 1), tone: (t.resolvedAfter || 0) <= SLA_H[t.priority] ? 'ok' : 'warn', left: Infinity };
    const left = SLA_H[t.priority] - (Date.now() - new Date(t.created)) / 36e5;
    if (left < 0) return { text: 'Dépassé de ' + dur(left), tone: 'crit', left };
    return { text: dur(left) + ' restantes', tone: left < SLA_H[t.priority] * .25 ? 'warn' : 'ok', left };
  }
  const prio = p => `<span class="vl-prio" data-p="${esc(p)}">${esc(p)}</span>`;
  const stateTone = s => ({ qualify: 'warn', progress: 'ok', waiting: 'crit', resolved: 'idle', closed: 'idle', rejected: 'idle' })[s];

  /* ---------- Shared actions ---------- */
  function change(t, patch, label) {
    const before = { ...t };
    Object.assign(t, patch);
    if (patch.state && !OPEN.includes(patch.state) && OPEN.includes(before.state) && patch.state !== 'rejected') t.resolvedAfter = +((Date.now() - new Date(t.created)) / 36e5).toFixed(2);
    persist();
    if (label) V.activity.log({ title: `${t.id} : ${label}`, detail: t.subject, icon: 'ticket', undo: () => { Object.assign(t, before); persist(); refresh(); } });
    return before;
  }
  let refresh = () => {};
  function inspect(t, opener, list) {
    V.inspector.open({
      record: t, list: list || [t], opener,
      title: r => r.subject, eyebrow: r => `${r.id} · ouvert ${fmt.relative(r.created)}`,
      summary: r => { const s = sla(r); return `<div class="vl-row">${prio(r.priority)}<span class="vl-status" data-tone="${stateTone(r.state)}">${esc(stateLabel(r.state))}</span><span class="vl-status vl-status--text" data-tone="${s.tone}">SLA : ${esc(s.text)}</span></div>`; },
      fields: [
        { key: 'subject', label: 'Sujet', required: true },
        { key: 'requester', label: 'Demandeur', required: true },
        { key: 'site', label: 'Site', type: 'select', options: SITES },
        { key: 'category', label: 'Catégorie', type: 'select', options: CATS },
        { key: 'priority', label: 'Priorité', type: 'select', options: PRIOS },
        { key: 'state', label: 'État', type: 'select', options: STATE_OPTS },
        { key: 'assignee', label: 'Assigné à', type: 'select', options: [{ value: '', label: 'Non assigné' }, ...TECHS] },
        { key: 'notes', label: 'Notes internes', type: 'textarea' }
      ],
      activity: r => [
        { when: fmt.relative(r.created), text: `Créé par ${r.requester} (${r.site})` },
        r.assignee ? { when: fmt.relative(new Date(new Date(r.created).getTime() + 18 * 6e4)), text: `Assigné à ${r.assignee}` } : null,
        !OPEN.includes(r.state) && r.state !== 'rejected' ? { when: 'après ' + dur(r.resolvedAfter || 1), text: 'Résolu' } : null
      ].filter(Boolean),
      actions: [{ label: 'Résoudre', icon: 'check', run: (r, api) => { if (!OPEN.includes(r.state)) { ui.toast('Ce ticket est déjà traité'); return; } change(r, { state: 'resolved' }, 'résolu'); api.refresh(); refresh(); ui.toast(`${r.id} résolu`); } }],
      onSave: (r, values) => { change(r, values, 'modifié'); refresh(); return true; }
    });
  }
  function createTicket(ctx) {
    const form = h('form.vl-stack', { novalidate: true, style: { gap: '12px' } });
    const field = (name, label, el) => { const id = V.uid('nt'); el.id = id; el.name = name; return h('div.vl-field', null, h('label', { for: id, text: label }), el, h('span.vl-field__error', { hidden: true, id: id + '-e' })); };
    const sel = (opts, v) => h('select.vl-select', null, ...opts.map(o => h('option', { value: o.value ?? o, text: o.label ?? o, selected: (o.value ?? o) === v })));
    form.append(
      field('subject', 'Sujet (obligatoire)', h('input.vl-input', { required: true, autocomplete: 'off', placeholder: 'Ex. Imprimante hors ligne au 1er étage' })),
      field('requester', 'Demandeur (obligatoire)', h('input.vl-input', { required: true, autocomplete: 'off' })),
      h('div.vl-grid', { style: { gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' } }, field('site', 'Site', sel(SITES, SITES[0])), field('category', 'Catégorie', sel(CATS, CATS[0])), field('priority', 'Priorité', sel(PRIOS, 'P3'))),
      field('notes', 'Description', h('textarea.vl-textarea', { rows: '3' })));
    const submit = () => {
      const fd = new FormData(form); let bad = null;
      ['subject', 'requester'].forEach(k => { const el = form.elements[k], err = form.querySelector('#' + el.id + '-e'); const miss = !String(fd.get(k) || '').trim(); el.setAttribute('aria-invalid', String(miss)); err.hidden = !miss; err.textContent = miss ? 'Ce champ est obligatoire.' : ''; if (miss && !bad) bad = el; });
      if (bad) { bad.focus(); return; }
      const t = { id: 'INC-' + (Math.max(...TICKETS.map(x => +x.id.slice(4))) + 1), subject: fd.get('subject').trim(), requester: fd.get('requester').trim(), site: fd.get('site'), category: fd.get('category'), priority: fd.get('priority'), state: 'qualify', assignee: '', created: new Date().toISOString(), notes: fd.get('notes') };
      TICKETS.unshift(t); persist();
      V.activity.log({ title: `${t.id} créé`, detail: t.subject, icon: 'plus', undo: () => { TICKETS = TICKETS.filter(x => x !== t); persist(); refresh(); } });
      V.activity.notify({ title: `Nouveau ticket ${t.id}`, body: `${t.subject} (${t.priority})`, tone: t.priority === 'P1' ? 'crit' : 'info', icon: 'ticket' });
      d.close();
      ui.toast(`${t.id} créé`);
      if (ctx.view !== 'tickets') ctx.navigate('tickets'); else refresh();
    };
    form.addEventListener('submit', e => { e.preventDefault(); submit(); });
    const d = ui.dialog({ title: 'Nouveau ticket', eyebrow: 'Service desk', body: form, actions: [{ label: 'Annuler', variant: 'ghost', run: x => x.close() }, { label: 'Créer le ticket', variant: 'strong', icon: 'plus', run: submit }] });
  }

  /* ---------- Views ---------- */
  const columnsDef = [
    { key: 'id', label: 'Ticket', primary: true, render: t => `<span class="vl-num">${esc(t.id)}</span>`, width: '96px' },
    { key: 'subject', label: 'Sujet' },
    { key: 'priority', label: 'Priorité', filterable: true, editable: true, options: PRIOS, render: t => prio(t.priority), sortValue: t => t.priority },
    { key: 'state', label: 'État', filterable: true, editable: true, options: STATE_OPTS, tone: t => stateTone(t.state), sortValue: t => STATE_OPTS.findIndex(s => s.value === t.state) },
    { key: 'sla', label: 'SLA', value: t => sla(t).text, sortValue: t => sla(t).left, render: t => { const s = sla(t); return `<span class="vl-status vl-status--text" data-tone="${s.tone}">${esc(s.text)}</span>`; }, search: false },
    { key: 'assignee', label: 'Assigné', filterable: true, editable: true, options: [{ value: '', label: 'Non assigné' }, ...TECHS], type: 'person' },
    { key: 'requester', label: 'Demandeur' },
    { key: 'site', label: 'Site', filterable: true },
    { key: 'category', label: 'Catégorie', filterable: true, hidden: true },
    { key: 'created', label: 'Créé', type: 'date', hidden: true }
  ];

  const open = () => TICKETS.filter(t => OPEN.includes(t.state));
  function dashboardView() {
    const root = h('div');
    const o = open();
    root.append(V.shell.pageHead({ eyebrow: 'Service desk', title: 'Tableau de bord', actions: [demo.badge()] }));
    const series = (() => {
      const r = demo.rng(7), c = [], s = [];
      for (let i = 0; i < 14; i++) { const base = i % 7 > 4 ? 4 : 11; c.push(Math.round(base + r() * 6)); s.push(Math.round(base - 1 + r() * 6)); }
      c[13] = TICKETS.filter(t => Date.now() - new Date(t.created) < 864e5).length;
      s[13] = TICKETS.filter(t => !OPEN.includes(t.state) && t.state !== 'rejected' && Date.now() - new Date(t.created) < 2 * 864e5).length;
      return { c, s };
    })();
    const within = o.filter(t => sla(t).tone !== 'crit').length;
    const pct = o.length ? within / o.length * 100 : 100;
    const kpi = (value, label, extra) => { const el = h('div.vl-kpi', null, h('span.vl-kpi__label', { text: label }), h('div.vl-kpi__row', null, h('b.vl-kpi__value', { 'data-vl-count': value, 'data-vl-format': 'int', text: fmt.int(value) }), extra || null)); return el; };
    const host = h('div');
    root.append(host);
    V.dashboard(host, {
      id: APP + '.dash', label: 'Tableau de bord du service desk',
      widgets: [
        { id: 'open', title: 'Tickets ouverts', w: 3, render: b => { b.append(kpi(o.length, 'à traiter', h('span', { html: V.charts.spark(series.c) }))); b.append(h('p.vl-caption', { text: `dont ${o.filter(t => t.priority === 'P1').length} en P1` })); V.shell.countAll(b); } },
        { id: 'sla', title: 'Dans les délais', w: 3, render: b => { const k = h('div.vl-kpi', null, h('span.vl-kpi__label', { text: 'tickets ouverts sous SLA' }), h('b.vl-kpi__value', { text: fmt.pct(pct) })); const m = h('div.vl-meter', { 'data-tone': pct < 70 ? 'crit' : pct < 85 ? 'warn' : 'ok', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': Math.round(pct), 'aria-label': 'Part des tickets sous SLA' }, h('i')); b.append(k, m, h('p.vl-caption', { text: `${o.length - within} ticket${o.length - within > 1 ? 's' : ''} hors délai` })); requestAnimationFrame(() => requestAnimationFrame(() => m.firstChild.style.setProperty('--v', pct + '%'))); } },
        { id: 'today', title: 'Aujourd’hui', w: 3, render: b => { b.append(kpi(series.c[13], 'tickets créés'), h('p.vl-caption', { text: `${series.s[13]} résolus depuis hier` })); V.shell.countAll(b); } },
        { id: 'wait', title: 'En attente', w: 3, render: b => { const w = TICKETS.filter(t => t.state === 'waiting'); const oldest = w.sort((a, c) => new Date(a.created) - new Date(c.created))[0]; b.append(kpi(w.length, 'en attente d’un retour'), h('p.vl-caption', { text: oldest ? `le plus ancien : ${fmt.relative(oldest.created)}` : 'aucun ticket en attente' })); V.shell.countAll(b); } },
        { id: 'volume', title: 'Volume sur 14 jours', w: 8, h: 2, note: 'créés et résolus par jour', render: (b, c) => { const el = h('div'); b.append(el); const chart = V.charts.line(el, { label: 'Tickets créés et résolus par jour', labels: demo.days14(), series: [{ name: 'Créés', values: series.c }, { name: 'Résolus', values: series.s }], height: c.detail ? 320 : 220, yMin: 0, xLabel: 'Jour' }); return { chart }; } },
        { id: 'cats', title: 'Ouverts par catégorie', w: 4, h: 2, render: b => { const el = h('div'); b.append(el); V.charts.bars(el, { label: 'Tickets ouverts par catégorie', items: CATS.map(c => ({ label: c, value: o.filter(t => t.category === c).length })) }); } },
        { id: 'urgent', title: 'À traiter en priorité', w: 6, h: 2, note: 'SLA le plus court', render: b => {
          const list = o.slice().sort((a, c) => sla(a).left - sla(c).left).slice(0, 5);
          if (!list.length) { b.append(ui.state.empty({ title: 'Aucun ticket urgent', text: 'Tous les tickets ouverts sont dans les délais.' })); return; }
          const ul = h('ul.vl-list');
          list.forEach(t => { const s = sla(t); const btn = h('button.vl-table__open', { type: 'button', text: t.subject }); btn.addEventListener('click', () => inspect(t, btn, list)); ul.append(h('li', null, h('span', { html: prio(t.priority) }), h('div.vl-grow', null, btn, h('div.vl-caption', { text: `${t.id} · ${t.site}` })), h('span.vl-status.vl-status--text', { 'data-tone': s.tone, text: s.text }))); });
          b.append(ul);
        } },
        { id: 'load', title: 'Charge par technicien', w: 6, h: 2, render: b => { const el = h('div'); b.append(el); V.charts.bars(el, { label: 'Tickets ouverts par technicien', items: TECHS.map(n => ({ label: n, value: o.filter(t => t.assignee === n).length })).concat([{ label: 'Non assignés', value: o.filter(t => !t.assignee).length }]), slot: 2 }); } },
        { id: 'probe', title: 'Connecteur supervision', w: 6, note: 'simulation d’erreur', skeleton: 'lines', load: (() => { let n = 0; return async () => { await demo.wait(700); if (n++ % 2 === 0) throw new Error('Le connecteur de supervision n’a pas répondu (simulation pour illustrer l’état d’erreur).'); return { ok: true }; }; })(), render: b => b.append(h('p', { html: `<span class="vl-status" data-tone="ok">Connecteur joignable</span>` }), h('p.vl-caption', { style: { marginTop: '8px' }, text: 'Réessayez plusieurs fois : la simulation alterne succès et échec.' })) }
      ].map(w => w.id === 'probe' ? { ...w, hidden: true } : w)
    });
    return root;
  }

  function ticketsView() {
    const root = h('div');
    const o = open();
    root.append(V.shell.pageHead({ eyebrow: 'Service desk', title: 'Tickets', stats: [
      { icon: 'ticket', value: o.length, label: 'ouverts' },
      { icon: 'alert', value: o.filter(t => sla(t).tone === 'crit').length, label: 'hors délai', delta: o.filter(t => sla(t).tone === 'crit').length ? 'à traiter' : null, deltaTone: 'rust' },
      { icon: 'user', value: o.filter(t => !t.assignee).length, label: 'non assignés' }
    ], actions: [demo.badge()] }));
    const card = h('section.vl-card', { 'data-vl-reveal': '' });
    root.append(card);
    const table = V.table(card, {
      id: APP + '.tickets', caption: 'Tickets du service desk', rowKey: 'id', columns: columnsDef,
      searchPlaceholder: 'Rechercher un ticket, un demandeur…', searchHint: 'tapez « priorite:p1 » ou « site:atelier », « -resolu » pour exclure.',
      allLabel: 'Tous les tickets',
      views: [
        { id: 'mine', name: 'Mes tickets ouverts', state: { filters: { assignee: [ME], state: OPEN } } },
        { id: 'urgent', name: 'P1 et P2 ouverts', state: { filters: { priority: ['P1', 'P2'], state: OPEN }, sort: [{ key: 'sla', dir: 'asc' }] } },
        { id: 'unassigned', name: 'À dispatcher', state: { filters: { assignee: [''], state: ['qualify'] } } }
      ],
      load: async () => { await demo.wait(650); return TICKETS; },
      onOpen: (t, tr, list) => inspect(t, tr.querySelector('button') || tr, list),
      onEdit: (t, key, value, old) => { change(t, { [key]: value }); return true; },
      bulk: [
        { label: 'Prendre en charge', icon: 'user', run: list => { const before = list.map(t => ({ ...t })); list.forEach(t => Object.assign(t, { assignee: ME, state: t.state === 'qualify' ? 'progress' : t.state })); persist(); V.activity.log({ title: `${list.length} tickets pris en charge`, icon: 'user', undo: () => { before.forEach(b => Object.assign(byId(b.id), b)); persist(); refresh(); } }); ui.toast(`${list.length} ticket(s) assigné(s) à ${ME}`); } },
        { label: 'Marquer résolus', icon: 'check', run: list => { const before = list.map(t => ({ ...t })); list.filter(t => OPEN.includes(t.state)).forEach(t => change(t, { state: 'resolved' })); V.activity.log({ title: `${list.length} tickets résolus`, icon: 'check', undo: () => { before.forEach(b => Object.assign(byId(b.id), b)); persist(); refresh(); } }); ui.toast(`${list.length} ticket(s) résolu(s)`); } }
      ],
      emptyTitle: 'Aucun ticket', emptyText: 'Les demandes des utilisateurs apparaîtront ici.', createAction: { label: 'Créer un ticket', icon: 'plus', run: () => createTicket(V.current) }
    });
    refresh = () => table.refresh();
    currentTable = table;
    if (pendingView) { applyView(pendingView); pendingView = null; }
    V.current.onLeave(() => { refresh = () => {}; currentTable = null; });
    return root;
  }
  let currentTable = null, pendingView = null;
  const VIEWS = {
    mine: { view: 'mine', filters: { assignee: [ME], state: OPEN }, sort: [] },
    urgent: { view: 'urgent', filters: { priority: ['P1', 'P2'], state: OPEN }, sort: [{ key: 'sla', dir: 'asc' }] }
  };
  function applyView(id) { if (currentTable) currentTable.apply({ q: '', ...VIEWS[id] }); }
  function showView(id) { if (currentTable) applyView(id); else { pendingView = id; V.current.navigate('tickets'); } }

  function boardView() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Service desk', title: 'Flux de traitement', actions: [demo.badge()] }));
    const host = h('div', { 'data-vl-reveal': '' });
    root.append(host);
    const cardHTML = t => { const s = sla(t); return `<div class="vl-tile__meta">${esc(t.id)} · ${esc(fmt.relative(t.created))}</div><h4 class="vl-tile__title">${esc(t.subject)}</h4><div class="vl-tile__sub">${esc(t.site)} · ${esc(t.category)}</div><div class="vl-tile__foot"><span class="vl-tile__sla">${prio(t.priority)} ${esc(s.text)}</span>${t.assignee ? V.avatars([t.assignee]) : '<span class="vl-tile__sub">Non assigné</span>'}</div>`; };
    const board = V.kanban(host, {
      label: 'Flux des tickets', key: 'id', items: TICKETS, columns: STATES.slice(0, 4),
      colOf: t => t.state, setCol: (t, col) => { change(t, { state: col }); },
      title: t => t.id, card: cardHTML, cardLabel: t => `${t.id}, ${t.subject}, ${t.priority}, ${sla(t).text}`,
      total: items => items.length ? `${items.filter(t => sla(t).tone === 'crit').length} hors délai` : '',
      zones: [{ id: 'closed', label: 'Clore', icon: 'check', count: () => String(TICKETS.filter(t => t.state === 'closed').length) }, { id: 'rejected', label: 'Rejeter', icon: 'x', count: () => String(TICKETS.filter(t => t.state === 'rejected').length) }],
      onZone: (t, z) => change(t, { state: z }), onZoneUndo: (t, z, from) => change(t, { state: from }),
      onCreate: col => createTicket(V.current),
      onOpen: (t, el) => V.stageDialog({
        item: t, source: el, stages: STATES,
        stageOf: x => x.state, setStage: (x, s) => { change(x, { state: s }); board.refresh(false); },
        title: x => x.subject, eyebrow: x => `${x.id} · ouvert ${fmt.relative(x.created)}`, sub: x => `${x.requester} · ${x.site} · ${x.category}`,
        value: x => sla(x).text, facts: x => [['Priorité', (PRIOS.find(p => p.value === x.priority) || {}).label], ['Délai SLA', SLA_H[x.priority] + ' h'], ['Assigné', x.assignee || 'Personne']],
        people: x => x.assignee ? [x.assignee] : [], note: x => x.notes,
        nextLabel: n => ({ progress: 'Prendre en charge', waiting: 'Mettre en attente', resolved: 'Marquer résolu', closed: 'Clore le ticket' })[n.id],
        doneLabel: 'Ticket clos',
        secondary: { label: x => x.state === 'waiting' ? 'Reprendre' : x.state === 'progress' ? 'Résoudre directement' : null, icon: 'check', run: x => { change(x, { state: x.state === 'waiting' ? 'progress' : 'resolved' }, x.state === 'waiting' ? 'repris' : 'résolu'); board.refresh(false); } }
      })
    });
    refresh = () => board.refresh();
    V.current.onLeave(() => { refresh = () => {}; });
    return root;
  }

  V.app({
    id: APP, name: 'Velora Service desk', short: 'Service desk', base: '../',
    views: [
      { id: 'dashboard', label: 'Tableau de bord', short: 'Accueil', icon: 'grid', render: dashboardView },
      { id: 'tickets', label: 'Tickets', icon: 'ticket', render: ticketsView, keywords: 'incidents demandes' },
      { id: 'flow', label: 'Flux', icon: 'board', render: boardView, keywords: 'kanban' }
    ],
    create: { label: 'Nouveau ticket', run: ctx => createTicket(ctx) },
    search: q => V.command.rank(q, TICKETS.map(t => ({ id: 'tk.' + t.id, label: t.subject, sub: `${t.id} · ${stateLabel(t.state)} · ${t.priority}`, icon: 'ticket', group: 'Tickets', run: () => inspect(t) }))).slice(0, 6).map(x => x.item),
    commands: [
      { id: 'itsm.mine', group: 'Vues', label: 'Voir mes tickets ouverts', icon: 'user', run: () => showView('mine') },
      { id: 'itsm.urgent', group: 'Vues', label: 'Voir les P1 et P2 ouverts', icon: 'alert', run: () => showView('urgent') }
    ],
    notifications: [
      { id: 'n1', title: 'P1 : switch du local technique', body: 'INC-2122 dépasse son SLA dans moins d’une heure.', tone: 'crit', icon: 'alert', time: demo.hoursAgo(.6), actions: [{ label: 'Ouvrir le ticket', primary: true, run: () => { const t = byId('INC-2122') || open()[0]; inspect(t); } }] },
      { id: 'n2', title: 'Mention de Léa Fontaine', body: '« Peux-tu regarder le partage Projets avant midi ? »', tone: 'info', icon: 'mail', time: demo.hoursAgo(2.2) },
      { id: 'n3', title: 'Maintenance planifiée ce soir', body: 'Redémarrage des serveurs de fichiers à 21 h.', tone: 'warn', icon: 'cal', time: demo.hoursAgo(26) }
    ]
  });
})();
