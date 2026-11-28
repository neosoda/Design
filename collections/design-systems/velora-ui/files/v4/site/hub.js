/* Velora UI V4 hub: where to start (templates), what is inside (modules), how to integrate. */
(function () {
  'use strict';
  const V = window.Velora, { h, icon, esc, ui } = V;
  const TEMPLATES = [
    { id: 'itsm', name: 'Service desk', tone: 'yellow', href: 'templates/itsm.html', text: 'Tickets avec SLA, flux de traitement en kanban, inspecteur et actions groupées.', views: 'Tableau de bord · Tickets · Flux' },
    { id: 'crm', name: 'CRM commercial', tone: 'green', href: 'templates/crm.html', text: 'Pipeline à étapes colorées, fiche d’affaire née de la carte, comptes clients.', views: 'Vue d’ensemble · Pipeline · Comptes' },
    { id: 'monitoring', name: 'Supervision', tone: 'rust', href: 'templates/monitoring.html', text: 'État des services, latence en direct avec pause, alertes à acquitter.', views: 'Vue d’ensemble · Services · Alertes' },
    { id: 'admin', name: 'Administration', tone: 'charcoal', href: 'templates/admin.html', text: 'Utilisateurs, matrice de permissions avec validation, journal d’audit, paramètres.', views: 'Utilisateurs · Rôles · Audit · Paramètres' },
    { id: 'analytics', name: 'Analytique', tone: 'won', href: 'templates/analytics.html', text: 'Filtres qui pilotent toute la page, chiffre héros, graphiques qui se recalculent sans saut.', views: 'Audience · Campagnes · Rapports' }
  ];
  const MODULES = [
    ['Velora Core', 'Tokens (une seule source JSON), quatre palettes, densités, primitives CSS, préférences persistantes, icônes.', 'core/tokens.json · core/velora-core.css · core/velora-core.js'],
    ['Velora Motion', 'Grammaire de mouvement interruptible : morph carte vers fenêtre, FLIP, révélation progressive, comptage, glisser-déposer.', 'motion/velora-motion.css · motion/velora-motion.js'],
    ['Velora Components', 'Shell, Command Center, centre d’activité, inspecteur, tableaux avancés, dashboard, graphiques, kanban.', 'components/*.js · components/velora-components.css'],
    ['Velora Studio', 'Personnalisation en direct, export du thème en CSS ou JSON, couleurs d’étape contrôlées en contraste.', 'studio/index.html · studio/velora-studio.js'],
    ['Velora Templates', 'Cinq applications de départ, chacune avec ses propres écrans et ses données fictives.', 'templates/*.html'],
    ['Velora Playground', 'Catalogue vivant : chaque composant, ses états (chargement, vide, erreur) et son code.', 'playground/index.html']
  ];

  function start() {
    const root = h('div');
    const head = h('div.vl-hub-head', { 'data-vl-reveal': '' },
      h('p.vl-pagehead__eyebrow', { text: 'Velora UI 4.0' }),
      h('h1.vl-display.vl-hub-title', { 'data-vl-letters-in': '', text: 'Soft by nature, fluid by design.' }),
      h('p.vl-hub-lead', { text: 'Un design system pour applications métier : toile pêche-sauge, surfaces givrées, objets colorés par étape et mouvement qui explique ce qui se passe. Tout se personnalise, tout se réutilise, sans framework ni étape de build.' }),
      h('div.vl-row', null,
        h('a.vl-btn.vl-btn--strong', { href: 'templates/itsm.html', html: icon('ticket') + 'Ouvrir le service desk' }),
        h('a.vl-btn', { href: 'playground/index.html', html: icon('book') + 'Parcourir les composants' }),
        h('a.vl-btn.vl-btn--ghost', { href: 'studio/index.html', html: icon('palette') + 'Composer un thème' })));
    root.append(head);
    root.append(h('h2.vl-section-title', { text: 'Choisir un point de départ', 'data-vl-reveal': '' }));
    const grid = h('div.vl-hub-templates');
    TEMPLATES.forEach((t, i) => {
      const a = h('a', { class: 'vl-tile vl-tile--' + t.tone + ' vl-hub-tpl' + (i === 0 ? ' is-lead' : ''), href: t.href, 'data-vl-reveal': '' },
        h('span.vl-tile__meta', { text: t.views }),
        h('span.vl-tile__title', { text: t.name }),
        h('span.vl-tile__sub', { text: t.text }),
        h('img.vl-hub-shot', { src: 'assets/template-' + t.id + '.jpg', alt: 'Aperçu réel du modèle ' + t.name, loading: 'lazy', width: '720', height: '450', onerror: e => { e.target.hidden = true; } }));
      grid.append(a);
    });
    root.append(grid);
    root.append(h('h2.vl-section-title', { text: 'Ce que contient Velora', 'data-vl-reveal': '' }));
    const dl = h('dl.vl-hub-modules', { 'data-vl-reveal': '' });
    MODULES.forEach(([name, text, files]) => dl.append(h('div', null, h('dt', { text: name }), h('dd', null, h('p', { text }), h('code.vl-code', { text: files })))));
    root.append(dl);
    const prefs = h('section.vl-card.vl-hub-prefs', { 'data-vl-reveal': '' },
      h('div', null, h('h2.vl-card__title', { text: 'Votre réglage s’applique partout' }), h('p.vl-caption', { text: 'Palette, densité, arrondis, transparence, animations et menu se règlent une fois, restent mémorisés sur cet appareil et s\u2019appliquent à toutes les pages Velora ouvertes.' })),
      h('button.vl-btn.vl-btn--accent', { type: 'button', html: icon('sliders') + 'Personnaliser maintenant', onclick: () => V.studio.open() }));
    root.append(prefs);
    return root;
  }

  const snippet = `<!-- Dans <head> : les préférences s'appliquent avant le premier affichage -->
<link rel="stylesheet" href="velora/core/velora-tokens.css">
<link rel="stylesheet" href="velora/core/velora-core.css">
<link rel="stylesheet" href="velora/motion/velora-motion.css">
<link rel="stylesheet" href="velora/components/velora-components.css">
<script src="velora/core/velora-tokens.js"></script>
<script src="velora/core/velora-core.js"></script>

<!-- En fin de <body> : seulement les modules utilisés -->
<script src="velora/motion/velora-motion.js"></script>
<script src="velora/components/velora-ui.js"></script>
<script src="velora/components/velora-table.js"></script>`;
  const usage = `const table = Velora.table(document.querySelector('#parc'), {
  id: 'parc.postes',            // clé de mémorisation (vues, colonnes, tri)
  caption: 'Postes de travail',
  columns: [
    { key: 'nom', label: 'Poste', primary: true },
    { key: 'salle', label: 'Salle', filterable: true },
    { key: 'etat', label: 'État', filterable: true, editable: true,
      options: ['En service', 'En panne', 'En stock'] }
  ],
  load: () => fetch('/api/postes').then(r => r.json()),
  onEdit: (poste, champ, valeur) => api.patch(poste.id, { [champ]: valeur })
});`;
  function integrate() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Velora UI', title: 'Intégrer Velora' }));
    const block = (title, text, code) => {
      const pre = h('pre.vl-codeblock', null, h('code', { text: code }));
      return h('section.vl-card.vl-stack', { 'data-vl-reveal': '' }, h('div.vl-split', null, h('h2.vl-card__title', { text: title }), h('button.vl-btn.vl-btn--sm', { type: 'button', html: icon('copy') + 'Copier', onclick: () => ui.copy(code, 'Code copié') })), h('p.vl-muted', { text }), pre);
    };
    root.append(h('div.vl-stack', null,
      block('1. Charger le socle', 'Quatre feuilles de style et deux scripts en tête de page. Aucun framework, aucune étape de build : les fichiers s’ouvrent aussi en local.', snippet),
      block('2. Brancher un composant sur vos données', 'Chaque composant reçoit une configuration et des fonctions. Ici, un tableau avancé alimenté par une API, avec édition directe.', usage),
      h('section.vl-card.vl-stack', { 'data-vl-reveal': '' }, h('h2.vl-card__title', { text: '3. Adapter le thème' }), h('p.vl-muted', { text: 'Composez votre réglage dans le Studio, puis exportez-le en CSS (variables résolues) ou en JSON (préférences). Les couleurs d’étape personnalisées sont vérifiées en contraste avant export.' }), h('div.vl-row', null, h('a.vl-btn.vl-btn--strong', { href: 'studio/index.html', html: icon('palette') + 'Ouvrir le Studio' })))));
    return root;
  }

  V.app({
    id: 'hub', name: 'Velora UI', short: 'Accueil', base: '',
    views: [
      { id: 'start', label: 'Démarrer', icon: 'home', render: start },
      { id: 'integrate', label: 'Intégrer', icon: 'layout', render: integrate }
    ],
    footnote: 'Velora UI 4.0. Les modèles utilisent des données fictives de démonstration.',
    commands: [{ id: 'hub.studio', group: 'Actions', label: 'Composer un thème dans le Studio', icon: 'palette', run: () => { location.href = 'studio/index.html'; } }]
  });
})();
