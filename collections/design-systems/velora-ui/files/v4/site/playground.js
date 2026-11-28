/* Velora Playground: interactive documentation. Every demo uses the real components;
   contrast figures are computed live from the tokens, not typed by hand. */
(function () {
  'use strict';
  const V = window.Velora, { h, icon, esc, ui, fmt, motion: M, demo } = V;
  const S = V.studio, T = V.tokens;

  const codeBlock = code => {
    const wrap = h('div.vl-pg-code');
    wrap.append(h('pre.vl-codeblock', { tabindex: '0' }, h('code', { text: code })), h('button.vl-btn.vl-btn--sm.vl-pg-copy', { type: 'button', html: icon('copy') + 'Copier', onclick: () => ui.copy(code, 'Code copié') }));
    return wrap;
  };
  function section(id, title, text, demoNode, code, states) {
    const sec = h('section.vl-card.vl-pg-section', { id: 'pg-' + id, 'data-vl-reveal': '', 'aria-labelledby': 'pg-' + id + '-t' });
    const head = h('div.vl-split', null, h('h2.vl-card__title', { id: 'pg-' + id + '-t', text: title }));
    sec.append(head, h('p.vl-muted.vl-pg-text', { text }));
    const stage = h('div.vl-pg-demo');
    if (states) {
      const seg = h('div', { html: ui.segHTML('État de ' + title, states.map(s => [s[0], s[1]]), states[0][0]) });
      head.append(seg);
      const paint = v => { stage.innerHTML = ''; states.find(s => s[0] === v)[2](stage); };
      ui.seg(seg.querySelector('.vl-seg'), paint);
      paint(states[0][0]);
    } else if (demoNode) stage.append(demoNode);
    sec.append(stage);
    if (code) sec.append(h('details.vl-pg-details', null, h('summary', { text: 'Voir le code' }), codeBlock(code)));
    return sec;
  }

  /* ---------- Foundations ---------- */
  function contrastRows(name) {
    const p = T.palettes[name];
    const base = p.canvas.base, alphaMin = T.preferences.alpha.min;
    const surf = a => S.over(p.surfaceRgb.split(' ').map(Number), a, base);
    const rows = [
      ['Texte principal sur surface pleine', p.ink, S.hexToRgb(p.solid), 4.5],
      ['Texte secondaire sur surface pleine', p.muted, S.hexToRgb(p.solid), 4.5],
      [`Texte secondaire sur surface givrée (opacité ${Math.round(alphaMin * 100)} %, cas le plus défavorable)`, p.muted, surf(alphaMin), 4.5],
      ['Texte principal sur la toile', p.ink, S.hexToRgb(base), 4.5],
      ['Statut « conforme » sur surface pleine', p.status.ok, S.hexToRgb(p.solid), 4.5],
      ['Statut « avertissement » sur surface pleine', p.status.warn, S.hexToRgb(p.solid), 4.5],
      ['Statut « critique » sur surface pleine', p.status.crit, S.hexToRgb(p.solid), 4.5],
      ['Texte encre sur carte jaune', '#181815', S.hexToRgb(p.stage.yellow), 4.5],
      ['Texte blanc sur carte sapin', '#ffffff', S.hexToRgb(p.stage.green), 4.5],
      ['Texte blanc sur carte rouille', '#ffffff', S.hexToRgb(p.stage.rust), 4.5],
      ['Contour de focus sur la toile (élément non textuel)', p.focus, S.hexToRgb(base), 3]
    ];
    return rows.map(([label, fg, bg, min]) => ({ label, ratio: S.contrast(fg, bg), min }));
  }
  function foundations() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Velora Core', title: 'Fondations' }));
    const pals = h('div.vl-pg-palettes');
    Object.entries(T.palettes).forEach(([k, p]) => {
      const rows = contrastRows(k);
      const worst = Math.min(...rows.map(r => r.ratio / r.min));
      const card = h('section.vl-card.vl-pg-pal', { 'data-vl-reveal': '' },
        h('div.vl-pg-pal__wash', { style: { background: `radial-gradient(80% 70% at 0% 0%, ${p.canvas.a}, transparent 70%), radial-gradient(80% 70% at 100% 100%, ${p.canvas.b}, transparent 70%), ${p.canvas.base}` } },
          ...['yellow', 'green', 'rust', 'charcoal'].map(s => h('i', { style: { background: p.stage[s] }, title: s }))),
        h('div.vl-split', null, h('h2.vl-card__title', { text: p.label }), h('button.vl-btn.vl-btn--sm', { type: 'button', text: V.prefs.palette() === k ? 'Palette active' : 'Essayer', disabled: V.prefs.palette() === k, onclick: () => { V.prefs.set({ palette: k }); ui.toast('Palette ' + p.label + ' appliquée'); } })),
        h('p.vl-caption', { text: worst >= 1 ? 'Toutes les paires vérifiées atteignent le niveau AA.' : 'Au moins une paire est sous le seuil AA.' }));
      const table = h('table.vl-table.vl-table--mini', null, h('caption.vl-sr', { text: 'Contrastes de la palette ' + p.label }), h('thead', null, h('tr', null, h('th', { scope: 'col', text: 'Paire' }), h('th', { scope: 'col', class: 'is-end', text: 'Ratio' }), h('th', { scope: 'col', class: 'is-end', text: 'Seuil' }))));
      const tb = h('tbody');
      rows.forEach(r => tb.append(h('tr', null, h('th', { scope: 'row', text: r.label }), h('td.is-end', null, h('span.vl-status.vl-status--text', { 'data-tone': r.ratio >= r.min ? 'ok' : 'crit', text: fmt.dec(r.ratio, 2) + ' : 1' })), h('td.is-end.vl-num', { text: r.min + ' : 1' }))));
      table.append(tb);
      card.append(h('details.vl-pg-details', null, h('summary', { text: 'Contrastes calculés' }), h('div.vl-table-scroll', null, table)));
      pals.append(card);
    });
    root.append(h('h2.vl-section-title', { text: 'Palettes', 'data-vl-reveal': '' }), pals);

    const type = h('section.vl-card.vl-pg-type', { 'data-vl-reveal': '' }, h('h2.vl-card__title', { text: 'Typographie : Urbanist, chiffres tabulaires dans les colonnes' }));
    [['display', 'Montant affiché', '44 040 €'], ['page-title', 'Titre de page', 'Tableau de bord'], ['figure', 'Chiffre de panneau', '57 839'], ['kpi', 'Indicateur', '26 ouverts'], ['card-title', 'Titre de carte', 'Imprimante hors ligne'], ['body', 'Corps', 'Le mouvement explique ce qui se passe.'], ['label', 'Libellé', 'Dernière connexion'], ['caption', 'Légende', 'Données de démonstration']].forEach(([tok, label, sample]) => type.append(h('div.vl-pg-typerow', null, h('code.vl-code', { text: '--vl-fs-' + tok }), h('span.vl-caption', { text: label }), h('span', { style: { fontSize: `var(--vl-fs-${tok})`, fontWeight: ['display', 'figure', 'kpi'].includes(tok) ? 600 : 500, letterSpacing: '-.02em' }, text: sample }))));
    const space = h('section.vl-card', { 'data-vl-reveal': '' }, h('h2.vl-card__title', { text: 'Espacements, arrondis, élévation' }));
    const sp = h('div.vl-pg-space');
    Object.entries(T.preferences).length;
    ['1', '2', '3', '4', '5', '6', '8', '10'].forEach(k => sp.append(h('div', null, h('i', { style: { width: `var(--vl-space-${k})` } }), h('code.vl-code', { text: '--vl-space-' + k }))));
    const radii = h('div.vl-pg-radii');
    ['field', 'card', 'column', 'panel', 'sheet', 'dialog', 'control'].forEach(k => radii.append(h('div', null, h('i', { style: { borderRadius: `var(--vl-r-${k})` } }), h('code.vl-code', { text: '--vl-r-' + k }))));
    const elev = h('div.vl-pg-radii');
    ['control', 'panel', 'float', 'dialog'].forEach(k => elev.append(h('div', null, h('i', { style: { boxShadow: `var(--vl-shadow-${k})`, borderRadius: '16px', background: 'var(--vl-solid)' } }), h('code.vl-code', { text: '--vl-shadow-' + k }))));
    space.append(sp, h('p.vl-caption', { text: 'Les arrondis dérivent tous de --vl-radius, réglable dans le Studio.' }), radii, h('p.vl-caption', { text: 'Ombres : uniquement pour signaler un niveau d’élévation.' }), elev);
    root.append(h('div.vl-stack', { style: { marginTop: 'var(--vl-gap)' } }, type, space));
    return root;
  }

  /* ---------- Components ---------- */
  const sampleRows = () => ['Salle 101', 'Salle 102', 'CDI', 'Atelier', 'Salle 204', 'Administration'].map((n, i) => ({ id: 'P' + i, nom: 'PC-' + (210 + i), salle: n, etat: ['En service', 'En panne', 'En service', 'En stock', 'En service', 'En panne'][i], maj: demo.daysAgo(i * 3 + 1) }));
  const tableCfg = (extra) => ({
    id: 'pg.table.' + V.uid('t'), caption: 'Postes de démonstration', rowKey: 'id', pageSize: 5, allLabel: 'Tous les postes',
    columns: [{ key: 'nom', label: 'Poste', primary: true }, { key: 'salle', label: 'Salle', filterable: true }, { key: 'etat', label: 'État', filterable: true, editable: true, options: ['En service', 'En panne', 'En stock'], tone: r => ({ 'En service': 'ok', 'En panne': 'crit', 'En stock': 'idle' })[r.etat] }, { key: 'maj', label: 'Mis à jour', type: 'date' }],
    onEdit: (r, k, v) => { r[k] = v; return true; }, onOpen: (r, tr) => V.inspector.open({ record: r, opener: tr.querySelector('button'), title: x => x.nom, eyebrow: x => x.salle, fields: [{ key: 'nom', label: 'Poste', required: true }, { key: 'salle', label: 'Salle' }, { key: 'etat', label: 'État', type: 'select', options: ['En service', 'En panne', 'En stock'] }], onSave: (x, v) => { Object.assign(x, v); return true; } }),
    bulk: [{ label: 'Marquer en service', icon: 'check', run: list => { list.forEach(r => { r.etat = 'En service'; }); ui.toast(list.length + ' poste(s) mis à jour'); } }],
    emptyTitle: 'Aucun poste enregistré', emptyText: 'Ajoutez un premier poste pour commencer l’inventaire.', createAction: { label: 'Ajouter un poste', icon: 'plus', run: () => ui.toast('Exemple : ouvrirait le formulaire de création') },
    ...extra
  });
  function components() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Velora Components', title: 'Composants' }));
    const toc = h('nav.vl-pg-toc', { 'aria-label': 'Sommaire des composants' });
    const list = h('div.vl-stack');
    const add = (id, title, ...rest) => { toc.append(h('a.vl-chip', { href: '#pg-' + id, text: title, onclick: e => { e.preventDefault(); document.getElementById('pg-' + id).scrollIntoView({ behavior: M.reduced() ? 'auto' : 'smooth', block: 'start' }); document.getElementById('pg-' + id).focus({ preventScroll: true }); } })); const s = section(id, title, ...rest); s.tabIndex = -1; list.append(s); };

    add('buttons', 'Boutons', 'Capsules à ressort léger (réservé aux contrôles). Une seule action forte par zone ; le jaune marque l’action du moment.',
      h('div.vl-row', null, h('button.vl-btn.vl-btn--strong', { type: 'button', html: icon('check') + 'Enregistrer', onclick: () => ui.toast('Action principale') }), h('button.vl-btn', { type: 'button', text: 'Annuler', onclick: () => ui.toast('Action secondaire') }), h('button.vl-btn.vl-btn--accent', { type: 'button', text: 'Valider la commande', onclick: () => ui.toast('Action mise en avant') }), h('button.vl-btn.vl-btn--ghost', { type: 'button', text: 'Plus tard', onclick: () => ui.toast('Action discrète') }), h('button.vl-btn.vl-btn--danger', { type: 'button', html: icon('trash') + 'Supprimer', onclick: async () => { const ok = await ui.confirm({ title: 'Supprimer cet élément ?', message: 'Exemple de confirmation pour une action destructive.', confirm: 'Supprimer', tone: 'danger' }); ui.toast(ok ? 'Confirmé' : 'Annulé'); } }), h('button.vl-btn', { type: 'button', disabled: true, text: 'Indisponible' }), h('button.vl-icon-btn', { type: 'button', 'aria-label': 'Ajouter', 'data-vl-tip': 'Ajouter', html: icon('plus'), onclick: () => ui.toast('Bouton icône') })),
      `<button class="vl-btn vl-btn--strong">Enregistrer</button>\n<button class="vl-btn">Annuler</button>\n<button class="vl-btn vl-btn--accent">Valider la commande</button>\n<button class="vl-icon-btn" aria-label="Ajouter" data-vl-tip="Ajouter">…</button>`);

    add('status', 'Puces et statuts', 'Un statut combine forme, libellé et couleur : il reste lisible sans la couleur. Les puces filtrent et annoncent leur état (aria-pressed).',
      (() => { const w = h('div.vl-stack', { style: { gap: '12px' } }); const chips = h('div.vl-row', { role: 'group', 'aria-label': 'Filtres d’exemple' }); ['Matériel', 'Réseau', 'Logiciel'].forEach((l, i) => { const c = h('button.vl-chip', { type: 'button', 'aria-pressed': String(i === 0), text: l }); c.addEventListener('click', () => c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'))); chips.append(c); }); w.append(chips, h('div.vl-row', null, ...[['ok', 'Opérationnel'], ['warn', 'Dégradé'], ['crit', 'Indisponible'], ['info', 'Planifié'], ['idle', 'Maintenance']].map(([t, l]) => h('span.vl-status', { 'data-tone': t, text: l }))), h('div.vl-row', null, h('span.vl-pill', { text: 'Gagné' }), h('span.vl-pill.vl-pill--yellow', { text: 'À relancer' }), h('span.vl-pill.vl-pill--rust', { text: '3 en retard' }), h('span.vl-pill.vl-pill--soft', { text: '12' }))); return w; })(),
      `<button class="vl-chip" aria-pressed="true">Matériel</button>\n<span class="vl-status" data-tone="crit">Indisponible</span>`);

    add('fields', 'Champs et formulaires', 'Libellé visible, aide et erreur reliées au champ (aria-describedby), erreur annoncée et focus porté sur le premier champ invalide.',
      (() => { const id = V.uid('f'); const input = h('input.vl-input', { id, type: 'email', placeholder: 'prenom.nom@exemple.org', 'aria-describedby': id + '-h ' + id + '-e' }); const err = h('span.vl-field__error', { id: id + '-e', hidden: true }); const sw = V.uid('s'); const form = h('form.vl-stack', { novalidate: true, style: { gap: '12px', maxWidth: '420px' } }, h('div.vl-field', null, h('label', { for: id, text: 'Adresse e-mail' }), input, h('span.vl-field__hint', { id: id + '-h', text: 'Utilisée pour les notifications.' }), err), h('label.vl-switch', { for: sw }, h('input', { type: 'checkbox', id: sw, checked: true }), h('span', { text: 'Recevoir le résumé quotidien' })), h('div.vl-row', null, h('button.vl-btn.vl-btn--strong', { type: 'submit', text: 'Valider' }))); form.addEventListener('submit', e => { e.preventDefault(); const ok = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(input.value); err.hidden = ok; err.textContent = ok ? '' : 'Saisissez une adresse e-mail valide.'; input.setAttribute('aria-invalid', String(!ok)); if (!ok) input.focus(); else ui.toast('Formulaire valide'); }); return form; })(),
      `<div class="vl-field">\n  <label for="mail">Adresse e-mail</label>\n  <input class="vl-input" id="mail" aria-describedby="mail-h mail-e">\n  <span class="vl-field__hint" id="mail-h">…</span>\n  <span class="vl-field__error" id="mail-e" hidden></span>\n</div>`);

    add('tiles', 'Tuiles d’objet', 'La couleur porte l’étape de l’objet, jamais sa priorité. Cliquez une tuile : elle grandit en fenêtre en gardant sa couleur.',
      (() => { const g = h('div.vl-grid', { style: { gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' } }); const STG = [{ id: 'a', label: 'À qualifier', tone: 'yellow' }, { id: 'b', label: 'En cours', tone: 'green' }, { id: 'c', label: 'En attente', tone: 'rust' }, { id: 'd', label: 'Résolu', tone: 'charcoal' }]; STG.forEach((s, i) => { const item = { st: s.id, title: ['Badge désactivé', 'Wi-Fi instable', 'Écran à remplacer', 'Compte débloqué'][i] }; const t = h('div', { class: 'vl-tile vl-tile--' + s.tone, tabindex: '0', role: 'button' }); const paint = () => { const st = STG.find(x => x.id === item.st); t.className = 'vl-tile vl-tile--' + st.tone; t.innerHTML = `<div class="vl-tile__meta">${esc(st.label)}</div><div class="vl-tile__title">${esc(item.title)}</div><div class="vl-tile__foot"><span class="vl-tile__value">P3</span>${V.avatars(['Léa Fontaine'])}</div>`; }; paint(); const go = () => V.stageDialog({ item, source: t, stages: STG, stageOf: x => x.st, setStage: (x, v) => { x.st = v; paint(); }, title: x => x.title, eyebrow: () => 'Démonstration', sub: () => 'Bâtiment A · Matériel', value: x => STG.find(z => z.id === x.st).label, facts: () => [['Priorité', 'P3'], ['Délai', '24 h'], ['Assigné', 'Léa Fontaine']], people: () => ['Léa Fontaine'], note: () => 'La fiche reste ouverte quand l’étape change.' }); t.addEventListener('click', go); t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); g.append(t); }); return g; })(),
      `Velora.stageDialog({\n  item, source: tuileCliquee, stages,\n  stageOf: x => x.etape, setStage: (x, e) => { x.etape = e; },\n  title: x => x.titre, facts: x => [['Priorité', x.priorite]]\n});`);

    add('table', 'Tableau avancé', 'Recherche avec « champ:valeur », filtres à facettes, colonnes configurables, tri multiple (Maj + clic), édition directe annulable, vues enregistrées, actions groupées, export CSV. Les quatre états sont prévus.', null,
      `Velora.table(conteneur, {\n  id: 'parc.postes', caption: 'Postes',\n  columns: [{ key: 'nom', label: 'Poste', primary: true }, …],\n  load: () => fetch('/api/postes').then(r => r.json()),\n  onEdit: (ligne, champ, valeur) => …\n});`,
      [['data', 'Données', st => V.table(st, tableCfg({ rows: sampleRows() }))], ['loading', 'Chargement', st => V.table(st, tableCfg({ load: () => new Promise(() => {}) }))], ['empty', 'Vide', st => V.table(st, tableCfg({ rows: [] }))], ['error', 'Erreur', st => V.table(st, tableCfg({ load: () => Promise.reject(new Error('démo')), errorText: 'Exemple : l’API a répondu 503. Réessayer relance le chargement.' }))]]);

    add('charts', 'Graphiques', 'Palette validée pour la vision des couleurs (quatre teintes, ordre fixe), légende dès deux séries, réticule et infobulle au survol comme au clavier, vue tableau pour chaque graphique. Changer de période fait glisser les valeurs.', null,
      `const c = Velora.charts.line(el, { labels, series: [{ name: 'Créés', values }] });\nc.update({ labels: nouveaux, series: [...] }); // les valeurs glissent, le cadre reste`,
      [['line', 'Courbe', st => { const el = h('div'); const seg = h('div', { html: ui.segHTML('Période', [['7', '7 jours'], ['14', '14 jours']], '14') }); st.append(seg, el); const days = demo.days14(); const a = [12, 15, 11, 17, 14, 6, 4, 13, 16, 12, 18, 15, 7, 5], b = [10, 13, 14, 15, 16, 7, 5, 11, 15, 14, 16, 16, 8, 6]; const c = V.charts.line(el, { label: 'Tickets créés et résolus', labels: days, series: [{ name: 'Créés', values: a }, { name: 'Résolus', values: b }], yMin: 0, height: 200 }); ui.seg(seg.querySelector('.vl-seg'), v => c.update({ labels: days.slice(-v), series: [{ name: 'Créés', values: a.slice(-v) }, { name: 'Résolus', values: b.slice(-v) }] })); }],
       ['columns', 'Colonnes', st => { const el = h('div'); st.append(el); V.charts.columns(el, { label: 'Interventions par site', labels: ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.'], series: [{ name: 'Matériel', values: [4, 6, 3, 7, 5] }, { name: 'Réseau', values: [2, 3, 4, 2, 3] }, { name: 'Logiciel', values: [3, 2, 5, 4, 2] }], height: 200 }); }],
       ['donut', 'Anneau', st => { const el = h('div'); st.append(el); V.charts.donut(el, { label: 'Parc par état', items: [{ label: 'En service', value: 412 }, { label: 'En stock', value: 58 }, { label: 'En panne', value: 23 }], centerLabel: 'postes' }); }],
       ['bars', 'Classement', st => { const el = h('div'); st.append(el); V.charts.bars(el, { label: 'Tickets par site', items: [{ label: 'Bâtiment A', value: 34 }, { label: 'Siège', value: 21 }, { label: 'Atelier', value: 12 }, { label: 'Annexe Est', value: 9 }] }); }]]);

    add('layers', 'Calques', 'Dialogue, panneau latéral, menu, notification temporaire. Échap ferme le calque du dessus, l’arrière-plan devient inerte, le focus revient au bouton d’origine.',
      h('div.vl-row', null,
        h('button.vl-btn', { type: 'button', html: icon('layout') + 'Dialogue', onclick: () => ui.dialog({ title: 'Dialogue d’exemple', body: h('p.vl-muted', { text: 'Le fond est inerte : essayez Tab, le focus reste ici.' }), actions: [{ label: 'Fermer', variant: 'strong', run: d => d.close() }] }) }),
        h('button.vl-btn', { type: 'button', html: icon('columns') + 'Panneau latéral', onclick: () => ui.sheet({ title: 'Panneau d’exemple', eyebrow: 'Démonstration', modal: 'auto', body: h('p.vl-muted', { text: 'À partir de 1 180 px, le panneau s’ancre sans voile : la page reste utilisable à côté.' }) }) }),
        (() => { const b = h('button.vl-btn', { type: 'button', 'aria-haspopup': 'menu', html: icon('dots') + 'Menu' }); b.addEventListener('click', () => ui.menu(b, [{ label: 'Dupliquer', icon: 'copy', run: () => ui.toast('Dupliqué') }, { label: 'Exporter', icon: 'down', run: () => ui.toast('Exporté') }, { divider: true }, { label: 'Supprimer', icon: 'trash', run: () => ui.toast('Supprimé', { action: { label: 'Annuler', run: () => ui.toast('Suppression annulée') } }) }], { align: 'start' })); return b; })(),
        h('button.vl-btn', { type: 'button', html: icon('bell') + 'Notification', onclick: () => ui.toast('Enregistré', { action: { label: 'Annuler', run: () => ui.toast('Annulé') } }) })),
      `Velora.ui.dialog({ title, body, actions: [{ label: 'Fermer', run: d => d.close() }] });\nVelora.ui.sheet({ title, modal: 'auto', body });\nVelora.ui.toast('Enregistré', { action: { label: 'Annuler', run } });`);

    add('kanban', 'Kanban', 'Carte soulevée et inclinée selon la vitesse, voisins qui s’écartent, colonne cible soulignée. Au clavier : Espace pour saisir, flèches pour déplacer, Espace pour déposer.',
      (() => { const host = h('div'); const items = [{ id: 'k1', t: 'Installer le vidéoprojecteur', c: 'todo' }, { id: 'k2', t: 'Remplacer le switch', c: 'todo' }, { id: 'k3', t: 'Mettre à jour les postes', c: 'doing' }, { id: 'k4', t: 'Inventaire du CDI', c: 'done' }]; setTimeout(() => V.kanban(host, { label: 'Kanban d’exemple', items, columns: [{ id: 'todo', label: 'À faire', tone: 'yellow' }, { id: 'doing', label: 'En cours', tone: 'green' }, { id: 'done', label: 'Terminé', tone: 'charcoal' }], colOf: x => x.c, setCol: (x, c) => { x.c = c; }, title: x => x.t, card: x => `<div class="vl-tile__title">${esc(x.t)}</div><div class="vl-tile__foot"><span class="vl-tile__sub">Démo</span></div>`, onOpen: (x) => ui.toast(x.t) }), 0); return host; })(),
      `Velora.kanban(el, { items, columns, colOf: x => x.etat, setCol: (x, c) => { x.etat = c; }, card: x => html });`);

    add('states', 'États vides, chargement, erreur', 'Chaque vue de données prévoit trois états. L’état vide porte le motif Velora (une pile de cartes d’étape) et propose l’action utile.', null,
      `Velora.ui.state.empty({ title, text, action: { label, run } });\nVelora.ui.state.loading({ kind: 'chart' });\nVelora.ui.state.error({ title, text, retry });`,
      [['empty', 'Vide', st => st.append(ui.state.empty({ title: 'Aucune alerte en cours', text: 'Les nouvelles alertes de supervision apparaîtront ici.', action: { label: 'Configurer les seuils', icon: 'sliders', run: () => ui.toast('Exemple d’action') } }))], ['loading', 'Chargement', st => { st.append(ui.state.loading({ kind: 'chart', height: 120 })); }], ['error', 'Erreur', st => st.append(ui.state.error({ retry: () => ui.toast('Nouvel essai lancé') }))]]);

    root.append(toc, list);
    return root;
  }

  /* ---------- Motion lab ---------- */
  function motionLab() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Velora Motion', title: 'Mouvement' }));
    const levels = T.motion;
    const tbl = h('table.vl-table.vl-table--mini', null, h('caption.vl-sr', { text: 'Durées par niveau d’animation' }), h('thead', null, h('tr', null, h('th', { scope: 'col', text: 'Jeton' }), ...Object.keys(levels).map(k => h('th', { scope: 'col', class: 'is-end', text: { signature: 'Signature', subtle: 'Subtile', reduced: 'Réduite' }[k] })))));
    const tb = h('tbody');
    const PURPOSE = { fast: 'Infobulles, couleurs de contrôle', control: 'Survol et appui des boutons', exit: 'Sortie d’écran', layout: 'Réorganisation (FLIP)', enter: 'Apparition progressive', morph: 'Carte vers fenêtre', morphBack: 'Fenêtre vers carte', sheet: 'Panneau latéral', chart: 'Changement de valeurs', draw: 'Tracé initial d’une courbe', count: 'Comptage des chiffres', tab: 'Capsule d’onglet', stagger: 'Décalage entre blocs' };
    Object.keys(levels.signature).filter(k => PURPOSE[k]).forEach(k => tb.append(h('tr', null, h('th', { scope: 'row' }, h('code.vl-code', { text: '--vl-motion-' + k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) }), h('div.vl-caption', { text: PURPOSE[k] })), ...Object.keys(levels).map(l => h('td.is-end.vl-num', { text: levels[l][k] })))));
    tbl.append(tb);
    const lvl = h('section.vl-card.vl-stack', { 'data-vl-reveal': '' }, h('div.vl-split', null, h('h2.vl-card__title', { text: 'Trois niveaux, un seul réglage' }), h('div', { html: ui.segHTML('Niveau d’animation', [['signature', 'Signature'], ['subtle', 'Subtile'], ['reduced', 'Réduite']], V.prefs.get().motion) })), h('p.vl-muted', { text: 'Toutes les durées viennent de jetons CSS lus aussi par le JavaScript. Si le système demande moins d’animations, Velora passe en « Réduite » quoi qu’il arrive.' }), h('div.vl-table-scroll', null, tbl));
    ui.seg(lvl.querySelector('.vl-seg'), v => { V.prefs.set({ motion: v }); ui.toast('Niveau d’animation : ' + { signature: 'Signature', subtle: 'Subtile', reduced: 'Réduite' }[v]); });
    root.append(lvl);

    const grid = h('div.vl-pg-motion');
    const demoCard = (title, why, body, actionLabel, run) => { const c = h('section.vl-card.vl-stack', { 'data-vl-reveal': '' }, h('h2.vl-card__title', { text: title }), h('p.vl-caption', { text: why }), body, h('div.vl-row', null, h('button.vl-btn.vl-btn--sm.vl-btn--strong', { type: 'button', html: icon('play') + esc(actionLabel), onclick: run }))); grid.append(c); return c; };

    const chips = h('div.vl-row', { 'aria-live': 'polite' }, ...['Matériel', 'Réseau', 'Comptes', 'Logiciel', 'Téléphonie', 'Impression'].map(l => h('span.vl-chip', { text: l })));
    demoCard('Réorganisation', 'FLIP : chaque élément glisse de son ancienne place à la nouvelle, l’œil suit le changement. Relancez pendant le mouvement : il repart de la position visible.', chips, 'Mélanger', () => { const els = Array.from(chips.children); M.flip(els, () => els.sort(() => Math.random() - .5).forEach(e => chips.append(e))); });

    const num = h('div.vl-display', { text: V.fmt.int(57839) });
    demoCard('Comptage', 'Les chiffres partent de leur valeur actuelle et accélèrent puis se posent : on voit l’ordre de grandeur changer.', num, 'Nouvelle valeur', () => M.countTo(num, Math.round(20000 + Math.random() * 80000), V.fmt.int));

    const sk = h('div', { style: { minHeight: '96px' } });
    const fillSk = () => { sk.innerHTML = ''; sk.append(ui.state.loading({ kind: 'figure' })); setTimeout(() => M.swap(sk, el => { el.innerHTML = ''; el.append(h('div.vl-kpi', null, h('span.vl-kpi__label', { text: 'Tickets ouverts' }), h('b.vl-kpi__value', { text: '26' }), h('span.vl-caption', { text: 'dont 2 en P1' }))); }), M.reduced() ? 0 : 1200); };
    demoCard('Squelette puis contenu', 'Le squelette annonce la forme exacte du contenu ; le contenu le remplace en fondu, sans saut de mise en page.', sk, 'Recharger', fillSk);
    fillSk();

    const stack = h('div.vl-stack', { style: { gap: '8px' } }, ...['Titre', 'Indicateurs', 'Graphique', 'Tableau'].map(l => h('div.vl-pg-block', { 'data-vl-reveal': '', text: l })));
    demoCard('Apparition progressive', 'Les blocs se révèlent dans l’ordre de lecture, plafonné à 900 ms. Ils sont cliquables dès la première image.', stack, 'Rejouer', () => M.reveal(stack));

    const src = h('div.vl-tile.vl-tile--green', { tabindex: '0', role: 'button' }, h('div.vl-tile__meta', { text: 'Carte' }), h('div.vl-tile__title', { text: 'Cliquez pour l’agrandir' }));
    const openIt = () => ui.dialog({ title: 'Fenêtre née de la carte', source: src, className: 'vl-dialog--stage vl-tile--green', body: h('p', { text: 'Même couleur, même objet : il a changé de forme sans changer d’identité. Fermez pour le voir revenir à sa place.' }), actions: [{ label: 'Fermer', run: d => d.close() }] });
    src.addEventListener('click', openIt); src.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIt(); } });
    demoCard('Carte vers fenêtre', 'La géométrie se transforme sans rebond (le rebond est réservé aux contrôles) ; le détail se révèle ensuite. Retour vers la position actuelle de la carte.', src, 'Ouvrir', openIt);

    const ttl = h('h3.vl-title', { text: 'Tableau de bord' });
    demoCard('Titre lettre à lettre', 'À l’arrivée sur un écran, le titre se compose : il dit où l’on est arrivé. Les lecteurs d’écran lisent le titre entier.', ttl, 'Rejouer', () => { ttl.removeAttribute('data-vl-letters'); ttl.textContent = 'Tableau de bord'; M.letters(ttl); });
    root.append(grid);
    return root;
  }

  /* ---------- Accessibility ---------- */
  function a11y() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Velora UI', title: 'Accessibilité' }));
    const pal = V.prefs.palette();
    const rows = contrastRows(pal);
    const ok = rows.filter(r => r.ratio >= r.min).length;
    const checks = [
      ['Contraste', `${ok} paires sur ${rows.length} au niveau AA pour la palette ${T.palettes[pal].label}, calculées à l’instant depuis les jetons. Recette automatisée : tests/contrast.mjs sur les quatre palettes.`],
      ['Clavier', 'Tout est utilisable au clavier : onglets, rail, tableaux, édition directe, kanban (Espace puis flèches), widgets (flèches sur la poignée), graphiques (flèches gauche et droite).'],
      ['Focus', 'Anneau de 2 px toujours visible, couleur adaptée à chaque palette ; focus rendu à l’élément d’origine à la fermeture d’un calque.'],
      ['Calques', 'Arrière-plan inerte derrière les dialogues, Échap ferme le calque du dessus, panneaux ancrés non modaux sur grand écran.'],
      ['Mouvement', 'Trois niveaux réglables ; la préférence système « réduire les animations » est toujours respectée ; le direct de supervision a un bouton pause.'],
      ['Annonces', 'Région live partagée : changement de vue, tri, déplacement de carte, sauvegarde, erreurs de formulaire.'],
      ['Couleur', 'Statuts doublés d’une forme et d’un libellé ; palette de graphiques validée pour la vision des couleurs, vue tableau pour chaque graphique.'],
      ['Tactile', 'Cibles de 44 px au doigt, appui long pour saisir une carte, barre de navigation basse sur mobile.']
    ];
    const dl = h('dl.vl-hub-modules', { 'data-vl-reveal': '' });
    checks.forEach(([t, d]) => dl.append(h('div', null, h('dt', { text: t }), h('dd', null, h('p', { text: d })))));
    root.append(dl);
    const sc = h('dl.vl-shortcuts');
    V.shell.SHORTCUTS.forEach(([k, d]) => sc.append(h('dt', null, ...k.split(' ').map(p => ['puis', 'à', '/'].includes(p) ? ' ' + p + ' ' : h('kbd.vl-kbd', { text: p }))), h('dd', { text: d })));
    root.append(h('section.vl-card.vl-stack', { 'data-vl-reveal': '', style: { marginTop: 'var(--vl-gap)' } }, h('h2.vl-card__title', { text: 'Raccourcis clavier' }), sc));
    root.append(h('p.vl-caption', { style: { marginTop: '16px' }, text: 'Limite connue : la recette automatique (axe-core, Chromium) ne remplace pas un test avec lecteur d’écran réel (NVDA, VoiceOver).' }));
    return root;
  }

  V.app({
    id: 'playground', name: 'Velora Playground', short: 'Playground', base: '../',
    views: [
      { id: 'components', label: 'Composants', icon: 'grid', render: components },
      { id: 'foundations', label: 'Fondations', icon: 'palette', render: foundations, keywords: 'couleurs tokens contraste' },
      { id: 'motion', label: 'Mouvement', icon: 'pulse', render: motionLab, keywords: 'animations' },
      { id: 'a11y', label: 'Accessibilité', short: 'A11y', icon: 'eye', render: a11y, keywords: 'wcag clavier' }
    ],
    footnote: 'Les exemples utilisent des données fictives.'
  });
})();
