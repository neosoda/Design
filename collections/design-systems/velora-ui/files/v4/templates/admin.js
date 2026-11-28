/* Velora Administration: users, roles and permissions, audit log, organisation settings.
   Sensitive changes go through an explicit save with a pending-changes bar and a confirmation. */
(function () {
  'use strict';
  const V = window.Velora, { h, icon, esc, fmt, ui, demo } = V;
  const APP = 'admin';
  const ROLES = ['Administrateur', 'Technicien', 'Gestionnaire', 'Lecteur'];
  const STATUS = [{ value: 'active', label: 'Actif' }, { value: 'invited', label: 'Invité' }, { value: 'suspended', label: 'Suspendu' }];
  const tone = s => ({ active: 'ok', invited: 'info', suspended: 'crit' })[s];
  const PEOPLE = demo.TEAM.concat(['Nora Lambert', 'Théo Garnier', 'Amel Haddad', 'Lucas Perrin', 'Jade Rousseau', 'Samir Aït', 'Emma Faure', 'Paul Mercier', 'Lina Chevalier', 'Adam Roux', 'Zoé Marchand', 'Rayan Colin']);
  const slug = n => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '');

  const users = demo.records(APP, 'users', () => {
    const r = demo.rng(23);
    return PEOPLE.map((n, i) => ({ id: 'U' + (100 + i), name: n, email: slug(n) + '@exemple.org', role: i < 2 ? 'Administrateur' : demo.pick(r, ROLES.slice(1)), status: i > 16 ? 'invited' : r() < .1 ? 'suspended' : 'active', mfa: r() < .75, last: i > 16 ? null : demo.hoursAgo(r() * 300) }));
  });
  const saveUsers = () => demo.save(APP, 'users', users);
  const PERMS = [
    ['tickets.read', 'Consulter les tickets'], ['tickets.write', 'Créer et modifier les tickets'], ['assets.write', 'Gérer le parc'],
    ['users.read', 'Consulter les utilisateurs'], ['users.write', 'Gérer les utilisateurs'], ['billing', 'Accéder à la facturation'], ['audit', 'Consulter le journal d’audit'], ['settings', 'Modifier les paramètres']
  ];
  const matrix = demo.records(APP, 'matrix', () => ({
    Administrateur: PERMS.map(p => p[0]), Technicien: ['tickets.read', 'tickets.write', 'assets.write', 'users.read'],
    Gestionnaire: ['tickets.read', 'users.read', 'billing', 'audit'], Lecteur: ['tickets.read']
  }));
  const audit = demo.records(APP, 'audit', () => {
    const r = demo.rng(61);
    const kinds = [['Connexion', 'key', 'a ouvert une session'], ['Rôle', 'shield', 'a modifié le rôle de'], ['Compte', 'user', 'a invité'], ['Paramètre', 'sliders', 'a modifié la durée de session'], ['Export', 'down', 'a exporté la liste des utilisateurs']];
    return Array.from({ length: 40 }, (_, i) => { const k = demo.pick(r, kinds); const who = demo.pick(r, PEOPLE.slice(0, 6)); return { id: 'E' + (900 - i), type: k[0], icon: k[1], actor: who, text: `${who} ${k[2]}${k[0] === 'Rôle' || k[0] === 'Compte' ? ' ' + demo.pick(r, PEOPLE.slice(6)) : ''}`, ip: '10.0.' + Math.floor(r() * 20) + '.' + Math.floor(r() * 250), time: demo.hoursAgo(i * 3.7 + r() * 3) }; });
  });
  const logAudit = (type, text, ic) => { audit.unshift({ id: 'E' + Date.now().toString(36), type, icon: ic || 'history', actor: 'Vous (démo)', text: 'Vous (démo) ' + text, ip: '10.0.0.1', time: new Date().toISOString() }); demo.save(APP, 'audit', audit); };
  const settings = demo.records(APP, 'settings', () => ({ org: 'Organisation de démonstration', timeout: 30, mfa: true, minLength: 12, domain: 'exemple.org', retention: 365 }));

  let refresh = () => {};
  function inspectUser(u, opener, list) {
    V.inspector.open({
      record: u, list: list || [u], opener, title: r => r.name, eyebrow: r => r.email,
      summary: r => `<div class="vl-row">${V.avatar(r.name, 'vl-avatar--lg')}<span class="vl-status" data-tone="${tone(r.status)}">${esc(STATUS.find(s => s.value === r.status).label)}</span><span class="vl-status" data-tone="${r.mfa ? 'ok' : 'warn'}">${r.mfa ? 'MFA activée' : 'MFA absente'}</span></div>`,
      fields: [{ key: 'name', label: 'Nom', required: true }, { key: 'email', label: 'Adresse e-mail', type: 'email', required: true, validate: v => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v) ? null : 'Adresse e-mail invalide.' }, { key: 'role', label: 'Rôle', type: 'select', options: ROLES }, { key: 'status', label: 'Statut', type: 'select', options: STATUS }, { key: 'last', label: 'Dernière connexion', type: 'readonly', display: r => r.last ? fmt.relative(r.last) : 'Jamais' }],
      activity: r => audit.filter(e => e.text.includes(r.name)).slice(0, 5).map(e => ({ when: fmt.relative(e.time), text: e.text })),
      actions: [{ label: 'Réinitialiser la MFA', icon: 'key', run: async (r, api) => { if (await ui.confirm({ title: 'Réinitialiser la MFA ?', message: `${r.name} devra configurer un nouveau facteur à sa prochaine connexion.`, confirm: 'Réinitialiser', tone: 'danger' })) { r.mfa = false; saveUsers(); logAudit('Compte', 'a réinitialisé la MFA de ' + r.name, 'key'); api.refresh(); refresh(); ui.toast('MFA réinitialisée'); } } }],
      onSave: (r, v) => { const before = { ...r }; Object.assign(r, v); saveUsers(); logAudit('Compte', 'a modifié le compte de ' + r.name, 'user'); V.activity.log({ title: 'Compte de ' + r.name + ' modifié', icon: 'user', undo: () => { Object.assign(r, before); saveUsers(); refresh(); } }); refresh(); return true; }
    });
  }
  function invite(ctx) {
    const id = V.uid('inv');
    const email = h('input.vl-input', { id, type: 'email', name: 'email', required: true, autocomplete: 'off', placeholder: 'prenom.nom@exemple.org', 'aria-describedby': id + '-e' });
    const err = h('span.vl-field__error', { id: id + '-e', hidden: true });
    const role = h('select.vl-select', { id: id + 'r', name: 'role' }, ...ROLES.map(r => h('option', { text: r, selected: r === 'Lecteur' })));
    const form = h('form.vl-stack', { novalidate: true, style: { gap: '12px' } }, h('div.vl-field', null, h('label', { for: id, text: 'Adresse e-mail (obligatoire)' }), email, err), h('div.vl-field', null, h('label', { for: id + 'r', text: 'Rôle' }), role), h('p.vl-caption', { text: 'Démonstration : aucun e-mail n’est réellement envoyé.' }));
    const submit = () => {
      const v = email.value.trim();
      const bad = !v ? 'Saisissez une adresse e-mail.' : !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v) ? 'Cette adresse n’est pas valide.' : users.some(u => u.email === v) ? 'Un compte existe déjà avec cette adresse.' : null;
      err.hidden = !bad; err.textContent = bad || ''; email.setAttribute('aria-invalid', String(!!bad));
      if (bad) { email.focus(); return; }
      const name = v.split('@')[0].split(/[._-]/).map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
      const u = { id: 'U' + (Math.max(...users.map(x => +x.id.slice(1))) + 1), name, email: v, role: role.value, status: 'invited', mfa: false, last: null };
      users.unshift(u); saveUsers(); logAudit('Compte', 'a invité ' + name, 'mail');
      V.activity.log({ title: 'Invitation envoyée à ' + v, icon: 'mail', undo: () => { users.splice(users.indexOf(u), 1); saveUsers(); refresh(); } });
      d.close(); ui.toast('Invitation préparée pour ' + v);
      if (ctx.view !== 'users') ctx.navigate('users'); else refresh();
    };
    form.addEventListener('submit', e => { e.preventDefault(); submit(); });
    const d = ui.dialog({ title: 'Inviter un utilisateur', size: 'sm', body: form, actions: [{ label: 'Annuler', variant: 'ghost', run: x => x.close() }, { label: 'Envoyer l’invitation', variant: 'strong', icon: 'mail', run: submit }] });
  }

  function usersView() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Administration', title: 'Utilisateurs', stats: [
      { icon: 'users', value: users.filter(u => u.status === 'active').length, label: 'comptes actifs' },
      { icon: 'mail', value: users.filter(u => u.status === 'invited').length, label: 'invitations en attente' },
      { icon: 'shield', value: users.filter(u => !u.mfa && u.status === 'active').length, label: 'sans MFA', delta: users.some(u => !u.mfa && u.status === 'active') ? 'à corriger' : null, deltaTone: 'yellow' }
    ], actions: [demo.badge()] }));
    const card = h('section.vl-card', { 'data-vl-reveal': '' }); root.append(card);
    const t = V.table(card, {
      id: APP + '.users', caption: 'Utilisateurs', rowKey: 'id', allLabel: 'Tous les utilisateurs',
      columns: [
        { key: 'name', label: 'Nom', primary: true, render: u => `<span class="vl-person">${V.avatar(u.name)}<span>${esc(u.name)}</span></span>` },
        { key: 'email', label: 'E-mail' },
        { key: 'role', label: 'Rôle', filterable: true, editable: true, options: ROLES },
        { key: 'status', label: 'Statut', filterable: true, editable: true, options: STATUS, tone: u => tone(u.status) },
        { key: 'mfa', label: 'MFA', filterable: true, value: u => u.mfa ? 'Activée' : 'Absente', render: u => `<span class="vl-status" data-tone="${u.mfa ? 'ok' : 'warn'}">${u.mfa ? 'Activée' : 'Absente'}</span>` },
        { key: 'last', label: 'Dernière connexion', type: 'date', sortValue: u => u.last ? new Date(u.last).getTime() : 0, render: u => u.last ? `<time datetime="${u.last}">${esc(fmt.relative(u.last))}</time>` : '<span class="vl-muted">Jamais</span>' }
      ],
      views: [{ id: 'nomfa', name: 'Comptes sans MFA', state: { filters: { mfa: ['Absente'], status: ['active'] } } }, { id: 'admins', name: 'Administrateurs', state: { filters: { role: ['Administrateur'] } } }],
      searchPlaceholder: 'Rechercher un nom, un e-mail…', searchHint: 'tapez « role:technicien » ou « statut:invite ».',
      load: async () => { await demo.wait(450); return users; },
      onOpen: (u, tr, list) => inspectUser(u, tr.querySelector('button'), list),
      onEdit: (u, k, v, old) => { u[k] = v; saveUsers(); logAudit(k === 'role' ? 'Rôle' : 'Compte', `a modifié ${k === 'role' ? 'le rôle' : 'le statut'} de ${u.name}`, k === 'role' ? 'shield' : 'user'); return true; },
      bulk: [
        { label: 'Suspendre', icon: 'lock', run: async list => { if (!await ui.confirm({ title: `Suspendre ${list.length} compte(s) ?`, message: 'Les sessions ouvertes seront fermées. Vous pourrez réactiver les comptes ensuite.', confirm: 'Suspendre', tone: 'danger' })) return; const before = list.map(u => [u, u.status]); list.forEach(u => { u.status = 'suspended'; }); saveUsers(); logAudit('Compte', `a suspendu ${list.length} compte(s)`, 'lock'); V.activity.log({ title: `${list.length} compte(s) suspendu(s)`, icon: 'lock', undo: () => { before.forEach(([u, s]) => { u.status = s; }); saveUsers(); refresh(); } }); ui.toast(`${list.length} compte(s) suspendu(s)`); } },
        { label: 'Réactiver', icon: 'check', run: list => { list.forEach(u => { u.status = 'active'; }); saveUsers(); logAudit('Compte', `a réactivé ${list.length} compte(s)`, 'check'); ui.toast(`${list.length} compte(s) réactivé(s)`); } }
      ]
    });
    refresh = () => t.refresh();
    V.current.onLeave(() => { refresh = () => {}; });
    return root;
  }

  function rolesView() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Administration', title: 'Rôles et permissions', actions: [demo.badge()] }));
    const draft = JSON.parse(JSON.stringify(matrix));
    const card = h('section.vl-card', { 'data-vl-reveal': '' });
    const bar = h('div.vl-savebar', { hidden: true, role: 'region', 'aria-label': 'Modifications en attente' });
    const tableEl = h('table.vl-matrix');
    const caption = h('caption.vl-sr', { text: 'Permissions par rôle' });
    const head = h('tr', null, h('th', { scope: 'col', text: 'Permission' }), ...ROLES.map(r => h('th', { scope: 'col', text: r })));
    const body = h('tbody');
    PERMS.forEach(([pid, label]) => {
      const tr = h('tr', null, h('th', { scope: 'row', text: label }));
      ROLES.forEach(role => {
        const id = V.uid('pm');
        const cb = h('input', { type: 'checkbox', id, checked: draft[role].includes(pid), disabled: role === 'Administrateur', 'aria-label': `${label} pour ${role}` });
        cb.addEventListener('change', () => { draft[role] = cb.checked ? [...draft[role], pid] : draft[role].filter(x => x !== pid); paintBar(); });
        tr.append(h('td', null, h('label.vl-switch', { for: id }, cb, h('span.vl-sr', { text: label + ' pour ' + role }))));
      });
      body.append(tr);
    });
    tableEl.append(caption, h('thead', null, head), body);
    const diff = () => ROLES.reduce((n, r) => n + PERMS.filter(([p]) => matrix[r].includes(p) !== draft[r].includes(p)).length, 0);
    function paintBar() {
      const n = diff();
      bar.hidden = !n; bar.innerHTML = '';
      if (!n) return;
      bar.append(h('span', { html: icon('alert') }), h('b', { text: `${n} modification${n > 1 ? 's' : ''} non enregistrée${n > 1 ? 's' : ''}` }), h('span.vl-grow'),
        h('button.vl-btn.vl-btn--sm', { type: 'button', text: 'Annuler', onclick: () => { ROLES.forEach(r => { draft[r] = matrix[r].slice(); }); body.querySelectorAll('input').forEach((cb, i) => { const role = ROLES[i % ROLES.length], pid = PERMS[Math.floor(i / ROLES.length)][0]; cb.checked = draft[role].includes(pid); }); paintBar(); } }),
        h('button.vl-btn.vl-btn--sm.vl-btn--accent', { type: 'button', text: 'Enregistrer les permissions', onclick: async () => {
          if (!await ui.confirm({ title: 'Appliquer les nouvelles permissions ?', message: `${n} changement${n > 1 ? 's' : ''} prendront effet à la prochaine action des utilisateurs concernés.`, confirm: 'Appliquer' })) return;
          const before = JSON.parse(JSON.stringify(matrix));
          ROLES.forEach(r => { matrix[r] = draft[r].slice(); }); demo.save(APP, 'matrix', matrix);
          logAudit('Rôle', `a modifié ${n} permission(s)`, 'shield');
          V.activity.log({ title: `${n} permission(s) modifiée(s)`, icon: 'shield', undo: () => { ROLES.forEach(r => { matrix[r] = before[r]; }); demo.save(APP, 'matrix', matrix); } });
          paintBar(); ui.toast('Permissions enregistrées');
        } }));
    }
    const scroller = h('div.vl-scroll-x', null, tableEl);
    card.append(h('p.vl-caption', { style: { marginBottom: '10px' }, text: 'Le rôle Administrateur conserve toutes les permissions. Les changements ne s’appliquent qu’après enregistrement.' }), scroller);
    root.append(bar, card);
    return root;
  }

  function auditView() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Administration', title: 'Journal d’audit', actions: [demo.badge()] }));
    const card = h('section.vl-card', { 'data-vl-reveal': '' }); root.append(card);
    V.table(card, {
      id: APP + '.audit', caption: 'Journal d’audit', rowKey: 'id', pageSize: 15, allLabel: 'Tous les événements',
      columns: [
        { key: 'time', label: 'Date', type: 'date', primary: false, render: e => `<time datetime="${e.time}">${esc(fmt.dateShort(e.time))} · ${esc(fmt.time(e.time))}</time>`, sortValue: e => new Date(e.time).getTime() },
        { key: 'type', label: 'Type', filterable: true, render: e => `<span class="vl-person">${icon(e.icon)}<span>${esc(e.type)}</span></span>` },
        { key: 'text', label: 'Événement' },
        { key: 'actor', label: 'Auteur', filterable: true, type: 'person' },
        { key: 'ip', label: 'Adresse IP', render: e => `<span class="vl-num">${esc(e.ip)}</span>` }
      ],
      views: [{ id: 'sensitive', name: 'Changements de droits', state: { filters: { type: ['Rôle', 'Compte'] } } }],
      searchPlaceholder: 'Rechercher un événement, une personne…',
      load: async () => { await demo.wait(400); return audit; }
    });
    return root;
  }

  function settingsView() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Administration', title: 'Paramètres', actions: [demo.badge()] }));
    const form = h('form.vl-card.vl-settings', { novalidate: true, 'data-vl-reveal': '' });
    const field = (key, label, input, hint) => { const id = V.uid('set'); input.id = id; input.name = key; input.setAttribute('aria-describedby', id + '-h ' + id + '-e'); return h('div.vl-field', null, h('label', { for: id, text: label }), input, h('span.vl-field__hint', { id: id + '-h', text: hint || '' }), h('span.vl-field__error', { id: id + '-e', hidden: true })); };
    const num = (v, min, max) => h('input.vl-input', { type: 'number', value: v, min, max, inputmode: 'numeric' });
    const mfaId = V.uid('mfa');
    form.append(
      h('h2.vl-card__title', { text: 'Organisation' }),
      field('org', 'Nom affiché', h('input.vl-input', { value: settings.org, required: true, maxlength: '60' }), 'Visible dans l’en-tête et les e-mails.'),
      field('domain', 'Domaine autorisé pour les invitations', h('input.vl-input', { value: settings.domain }), 'Ex. exemple.org, sans « @ ».'),
      h('hr.vl-divider'), h('h2.vl-card__title', { text: 'Sécurité' }),
      field('timeout', 'Expiration de session (minutes)', num(settings.timeout, 5, 480), 'Entre 5 et 480 minutes.'),
      field('minLength', 'Longueur minimale des mots de passe', num(settings.minLength, 8, 64), '12 caractères ou plus sont recommandés.'),
      h('label.vl-switch', { for: mfaId }, h('input', { type: 'checkbox', id: mfaId, name: 'mfa', checked: settings.mfa }), h('span', { text: 'Exiger la double authentification pour tous les comptes' })),
      h('hr.vl-divider'), h('h2.vl-card__title', { text: 'Conservation' }),
      field('retention', 'Durée de conservation du journal (jours)', num(settings.retention, 30, 3650), 'Entre 30 et 3 650 jours.'),
      h('div.vl-settings__foot', null, h('span.vl-caption', { 'data-dirty': '', 'aria-live': 'polite' }), h('span.vl-grow'), h('button.vl-btn.vl-btn--ghost', { type: 'reset', text: 'Annuler les modifications' }), h('button.vl-btn.vl-btn--strong', { type: 'submit', html: icon('check') + 'Enregistrer' })));
    const dirtyEl = form.querySelector('[data-dirty]');
    const read = () => { const fd = new FormData(form); return { org: String(fd.get('org')).trim(), domain: String(fd.get('domain')).trim(), timeout: +fd.get('timeout'), minLength: +fd.get('minLength'), mfa: !!fd.get('mfa'), retention: +fd.get('retention') }; };
    const isDirty = () => JSON.stringify(read()) !== JSON.stringify({ org: settings.org, domain: settings.domain, timeout: settings.timeout, minLength: settings.minLength, mfa: settings.mfa, retention: settings.retention });
    form.addEventListener('input', () => { dirtyEl.textContent = isDirty() ? 'Modifications non enregistrées' : ''; });
    form.addEventListener('reset', () => setTimeout(() => { dirtyEl.textContent = ''; form.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid')); form.querySelectorAll('.vl-field__error').forEach(x => { x.hidden = true; }); }, 0));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = read();
      const rules = { org: !v.org ? 'Le nom est obligatoire.' : null, domain: v.domain.includes('@') || (v.domain && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v.domain)) ? 'Saisissez un domaine, par exemple exemple.org.' : null, timeout: !(v.timeout >= 5 && v.timeout <= 480) ? 'Choisissez une durée entre 5 et 480 minutes.' : null, minLength: !(v.minLength >= 8 && v.minLength <= 64) ? 'Choisissez une longueur entre 8 et 64.' : null, retention: !(v.retention >= 30 && v.retention <= 3650) ? 'Choisissez une durée entre 30 et 3 650 jours.' : null };
      let first = null;
      Object.entries(rules).forEach(([k, msg]) => { const el = form.elements[k]; const err = form.querySelector('#' + el.id + '-e'); el.setAttribute('aria-invalid', String(!!msg)); err.hidden = !msg; err.textContent = msg || ''; if (msg && !first) first = el; });
      if (first) { first.focus(); V.announce('Le formulaire contient des erreurs', true); return; }
      const before = { ...settings };
      Object.assign(settings, v); demo.save(APP, 'settings', settings);
      logAudit('Paramètre', 'a modifié les paramètres de l’organisation', 'sliders');
      V.activity.log({ title: 'Paramètres enregistrés', icon: 'sliders', undo: () => { Object.assign(settings, before); demo.save(APP, 'settings', settings); } });
      dirtyEl.textContent = ''; ui.toast('Paramètres enregistrés');
    });
    root.append(form);
    return root;
  }

  V.app({
    id: APP, name: 'Velora Administration', short: 'Administration', base: '../',
    views: [
      { id: 'users', label: 'Utilisateurs', icon: 'users', render: usersView, keywords: 'comptes' },
      { id: 'roles', label: 'Rôles et permissions', short: 'Rôles', icon: 'shield', render: rolesView, keywords: 'droits acl' },
      { id: 'audit', label: 'Journal d’audit', short: 'Audit', icon: 'history', render: auditView, keywords: 'logs journal' },
      { id: 'settings', label: 'Paramètres', icon: 'sliders', render: settingsView, keywords: 'securite mfa session' }
    ],
    create: { label: 'Inviter', run: ctx => invite(ctx) },
    search: q => V.command.rank(q, users.map(u => ({ id: 'u.' + u.id, label: u.name, sub: `${u.role} · ${u.email}`, icon: 'user', group: 'Utilisateurs', run: () => inspectUser(u) }))).slice(0, 6).map(x => x.item),
    notifications: [
      { id: 'a1', title: '3 comptes actifs sans MFA', body: 'Activez la double authentification ou exigez-la dans les paramètres.', tone: 'warn', icon: 'shield', time: demo.hoursAgo(3), actions: [{ label: 'Voir les comptes', primary: true, run: () => V.current.navigate('users') }] },
      { id: 'a2', title: 'Export de la liste des utilisateurs', body: 'Un export CSV a été réalisé depuis le poste 10.0.4.18.', tone: 'info', icon: 'down', time: demo.hoursAgo(28) }
    ]
  });
})();
