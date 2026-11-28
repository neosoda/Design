/* Velora Shell V4: application frame shared by every template.
   Header + tabs (stretching capsule), rail (ecosystem launcher, 3 modes), mobile bottom bar,
   hash router with interruptible transitions, keyboard shortcuts and help. */
(function (g) {
  'use strict';
  const V = g.Velora, { h, $, $$, esc, icon, motion: M, ui } = V;

  const ECOSYSTEM = [
    { id: 'hub', label: 'Accueil Velora', icon: 'home', href: 'index.html' },
    { id: 'crm', label: 'CRM commercial', icon: 'target', href: 'templates/crm.html' },
    { id: 'itsm', label: 'Service desk', icon: 'ticket', href: 'templates/itsm.html' },
    { id: 'admin', label: 'Administration', icon: 'shield', href: 'templates/admin.html' },
    { id: 'monitoring', label: 'Supervision', icon: 'pulse', href: 'templates/monitoring.html' },
    { id: 'analytics', label: 'Analytique', icon: 'bars', href: 'templates/analytics.html' },
    { id: 'playground', label: 'Playground', icon: 'book', href: 'playground/index.html', tool: true },
    { id: 'studio', label: 'Studio', icon: 'palette', href: 'studio/index.html', tool: true }
  ];

  const SHORTCUTS = [
    ['Ctrl K', 'Ouvrir le Command Center (⌘ K sur Mac)'], ['/', 'Rechercher dans la vue'], ['?', 'Afficher cette aide'],
    ['g puis 1 à 9', 'Aller à la section n'], ['n', 'Créer un élément'], ['.', 'Centre d’activité'], [',', 'Personnaliser l’interface'],
    ['[', 'Déplier ou replier le rail'], ['Échap', 'Fermer le panneau du dessus'],
    ['j / k', 'Élément suivant / précédent dans l’inspecteur'], ['Espace puis flèches', 'Déplacer une carte ou un widget au clavier']
  ];

  function app(cfg) {
    const base = cfg.base || '';
    const views = cfg.views;
    const state = { route: null, params: [], scroll: {}, cleanup: null, nav: 0 };
    document.body.classList.add('vl-body');
    document.title = cfg.title || cfg.name;

    /* ---------- Frame ---------- */
    const tabs = h('nav.vl-tabs', { 'aria-label': 'Sections' }, h('span.vl-tabs__ind', { 'aria-hidden': 'true' }));
    views.filter(v => !v.hidden).forEach(v => tabs.append(h('a.vl-tabs__tab', { href: '#/' + v.id, dataset: { view: v.id }, text: v.label })));
    const bell = h('button.vl-icon-btn', { type: 'button', id: 'vl-activity-btn', 'aria-label': 'Centre d’activité', 'data-vl-tip': 'Activité', html: icon('bell') + '<span class="vl-badge-count" aria-hidden="true"></span>' });
    const search = h('button.vl-searchbtn', { type: 'button', id: 'vl-command-btn', 'aria-keyshortcuts': 'Control+K Meta+K' },
      h('span', { html: icon('search') }), h('span.vl-searchbtn__text', { text: 'Rechercher, agir…' }), h('span.vl-sr', { text: ' (Command Center)' }), h('kbd.vl-kbd', { text: /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K' }));
    const createBtn = cfg.create ? h('button.vl-btn.vl-btn--strong.vl-top__create', { type: 'button', 'aria-keyshortcuts': 'N', html: icon('plus') + `<span>${esc(cfg.create.label)}</span>`, onclick: () => cfg.create.run(ctx) }) : null;
    const me = h('button.vl-top__me', { type: 'button', 'aria-haspopup': 'menu', html: V.avatar(cfg.user || 'Vous Démo', 'vl-avatar--lg').replace(' aria-hidden="true"', '') + '<span class="vl-sr">, menu du profil de démonstration</span>' });
    const header = h('header.vl-top', null,
      h('a.vl-logo', { href: base + 'index.html' }, h('i', { text: 'V', 'aria-hidden': 'true' }), h('span.vl-logo__name', { text: 'Velora' }), h('span.vl-logo__app', { text: cfg.short || cfg.name }), h('span.vl-sr', { text: ', accueil Velora UI' })),
      h('span.vl-grow'), search, createBtn, bell, me);
    const main = h('main.vl-view', { id: 'vl-main', tabindex: '-1' });
    const footer = h('footer.vl-foot', null, h('span', { text: cfg.footnote || 'Données fictives de démonstration. Aucune donnée réelle n’est affichée ni transmise.' }), h('a', { href: base + 'playground/index.html', text: 'Documentation des composants' }));
    const shell = h('div.vl-app', { id: 'vl-app' }, h('a.vl-skip', { href: '#vl-main', text: 'Aller au contenu', onclick: e => { e.preventDefault(); main.focus(); } }), header, tabs, main, footer);

    /* Rail: the ecosystem launcher and quick tools. */
    const rail = h('nav.vl-rail.vl-on-strong', { id: 'vl-rail', 'aria-label': 'Applications Velora et outils' });
    const railBtn = (o) => {
      const el = h(o.href ? 'a' : 'button', { class: 'vl-rail__btn', href: o.href, type: o.href ? null : 'button', 'aria-current': o.current ? 'page' : null, 'aria-label': o.label, onclick: o.run, dataset: o.data || {} });
      el.innerHTML = icon(o.icon) + `<span class="vl-rail__label">${esc(o.label)}</span>`;
      return el;
    };
    ECOSYSTEM.filter(a => !a.tool).forEach(a => rail.append(railBtn({ ...a, href: base + a.href, current: a.id === cfg.id })));
    rail.append(h('hr.vl-rail__sep'));
    rail.append(railBtn({ icon: 'search', label: 'Command Center', run: () => V.command && V.command.open() }));
    rail.append(railBtn({ icon: 'sliders', label: 'Personnaliser', run: () => V.studio && V.studio.open(), data: { action: 'studio' } }));
    ECOSYSTEM.filter(a => a.tool).forEach(a => rail.append(railBtn({ ...a, href: base + a.href, current: a.id === cfg.id })));
    const themeBtn = railBtn({ icon: 'moon', label: 'Thème sombre', run: () => toggleTheme(), data: { action: 'theme' } });
    rail.append(themeBtn, h('hr.vl-rail__sep.vl-rail__ctl'));
    const pinBtn = railBtn({ icon: 'railOpen', label: 'Déplier le menu', run: () => setRail(V.prefs.get().rail === 'expanded' ? 'collapsed' : 'expanded'), data: { action: 'rail-pin' } });
    const autoBtn = railBtn({ icon: 'auto', label: 'Ouverture automatique', run: () => setRail(V.prefs.get().rail === 'auto' ? 'collapsed' : 'auto'), data: { action: 'rail-auto' } });
    pinBtn.classList.add('vl-rail__ctl'); autoBtn.classList.add('vl-rail__ctl');
    rail.append(pinBtn, autoBtn);

    /* Mobile bottom bar: first four sections + "Menu" sheet with the rest. */
    const bottom = h('nav.vl-bottomnav', { 'aria-label': 'Navigation principale' });
    const primary = views.filter(v => !v.hidden).slice(0, 4);
    primary.forEach(v => bottom.append(h('a.vl-bottomnav__item', { href: '#/' + v.id, dataset: { view: v.id }, html: icon(v.icon || 'grid') + `<span>${esc(v.short || v.label)}</span>` })));
    bottom.append(h('button.vl-bottomnav__item', { type: 'button', 'aria-label': 'Menu complet', html: icon('menu') + '<span>Menu</span>', onclick: () => openMobileMenu() }));

    document.body.prepend(shell, rail, bottom);

    /* ---------- Rail modes ---------- */
    function setRail(mode) {
      V.prefs.set({ rail: mode });
      ui.toast(mode === 'expanded' ? 'Menu déplié en permanence' : mode === 'auto' ? 'Le menu s’ouvre au survol' : 'Menu compact');
    }
    function applyRail() {
      const mode = V.prefs.get().rail;
      document.body.dataset.vlRail = mode;
      pinBtn.querySelector('.vl-rail__label').textContent = mode === 'expanded' ? 'Replier le menu' : 'Déplier le menu';
      pinBtn.setAttribute('aria-label', mode === 'expanded' ? 'Replier le menu' : 'Déplier le menu');
      pinBtn.setAttribute('aria-pressed', String(mode === 'expanded'));
      pinBtn.querySelector('svg').outerHTML = icon(mode === 'expanded' ? 'railClose' : 'railOpen');
      autoBtn.setAttribute('aria-pressed', String(mode === 'auto'));
      rail.classList.remove('is-peek');
    }
    rail.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch' && document.body.dataset.vlRail === 'auto') rail.classList.add('is-peek'); });
    rail.addEventListener('pointerleave', () => rail.classList.remove('is-peek'));
    rail.addEventListener('focusin', () => { if (document.body.dataset.vlRail === 'auto') rail.classList.add('is-peek'); });
    rail.addEventListener('focusout', e => { if (!rail.contains(e.relatedTarget)) rail.classList.remove('is-peek'); });
    rail.addEventListener('keydown', e => { if (e.key === 'Escape' && rail.classList.contains('is-peek')) { rail.classList.remove('is-peek'); e.preventDefault(); } });

    function toggleTheme() {
      const now = V.prefs.palette();
      V.prefs.set({ palette: now === 'dark' ? (cfg.lightPalette || 'light') : 'dark' });
    }
    function applyTheme() {
      const dark = V.prefs.palette() === 'dark';
      themeBtn.querySelector('svg').outerHTML = icon(dark ? 'sun' : 'moon');
      themeBtn.querySelector('.vl-rail__label').textContent = dark ? 'Thème clair' : 'Thème sombre';
      themeBtn.setAttribute('aria-label', dark ? 'Passer au thème clair' : 'Passer au thème sombre');
    }
    V.on('prefs', () => { applyRail(); applyTheme(); placeIndicator(false); });

    /* ---------- Tabs indicator: the capsule stretches toward its target (V3 navigation gesture) ---------- */
    const ind = tabs.querySelector('.vl-tabs__ind');
    let indPos = null;
    function placeIndicator(animate) {
      const tab = tabs.querySelector('.vl-tabs__tab[aria-current="page"]');
      if (!tab) { ind.style.width = '0'; return; }
      const to = { l: tab.offsetLeft, w: tab.offsetWidth };
      if (animate && indPos && indPos.l !== to.l && !M.reduced()) {
        const a = indPos, mn = Math.min(a.l, to.l), mx = Math.max(a.l + a.w, to.l + to.w);
        M.play(ind, [{ left: a.l + 'px', width: a.w + 'px' }, { left: (to.l > a.l ? a.l : mn) + 'px', width: (mx - mn) * .92 + 'px', offset: .45 }, { left: to.l + 'px', width: to.w + 'px' }], { duration: 'tab', easing: M.ease('tab') }, 'ind');
      }
      ind.style.left = to.l + 'px'; ind.style.width = to.w + 'px'; indPos = to;
      if (animate) tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: M.reduced() ? 'auto' : 'smooth' });
    }
    addEventListener('resize', V.debounce(() => placeIndicator(false), 60));

    /* ---------- Router: hash "#/view/param". Navigation interrupts navigation, it never queues. ---------- */
    const ctx = {
      app: cfg, base, params: [],
      navigate: (id, ...params) => { location.hash = '#/' + [id, ...params].map(encodeURIComponent).join('/'); },
      get view() { return state.route; },
      onLeave(fn) { (state.leave = state.leave || []).push(fn); }
    };
    const parse = () => {
      const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
      const v = views.find(x => x.id === parts[0]) || views[0];
      return { view: v, params: v.id === parts[0] ? parts.slice(1) : [] };
    };
    async function go() {
      const { view, params } = parse();
      const key = view.id + '/' + params.join('/');
      if (key === state.key) return;
      const token = ++state.nav;
      const first = state.key == null;
      if (state.key) state.scroll[state.key] = scrollY;
      state.key = key; state.route = view.id; ctx.params = params;
      $$('.vl-tabs__tab, .vl-bottomnav__item[data-view]').forEach(t => t.toggleAttribute('aria-current', false));
      $$(`[data-view="${view.id}"]`).forEach(t => t.setAttribute('aria-current', 'page'));
      placeIndicator(!first);
      if (!first) await M.viewOut(main);
      if (token !== state.nav) return;
      (state.leave || []).forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
      state.leave = [];
      main.innerHTML = '';
      try {
        const out = view.render(ctx, params);
        if (out != null) { if (typeof out === 'string') main.innerHTML = out; else main.append(out); }
        view.mount && view.mount(main, ctx, params);
      } catch (err) {
        console.error(err);
        main.append(ui.state.error({ title: 'Cette vue n’a pas pu s’afficher', text: String(err.message || err), retry: () => { state.key = null; go(); } }));
      }
      document.title = `${view.label} · ${cfg.name}`;
      M.viewIn(main);
      countAll(main);
      const saved = state.scroll[key];
      scrollTo({ top: saved || 0 });
      if (!first) { main.focus({ preventScroll: true }); V.announce(view.label); }
    }
    addEventListener('hashchange', go);

    /* ---------- Mobile menu ---------- */
    function openMobileMenu() {
      const list = h('div.vl-mobilemenu');
      list.append(h('h3.vl-mobilemenu__title', { text: 'Sections' }));
      views.filter(v => !v.hidden).forEach(v => list.append(h('a.vl-mobilemenu__link', { href: '#/' + v.id, 'aria-current': state.route === v.id ? 'page' : null, html: icon(v.icon || 'grid') + esc(v.label), onclick: () => s.close() })));
      list.append(h('h3.vl-mobilemenu__title', { text: 'Applications' }));
      ECOSYSTEM.forEach(a => list.append(h('a.vl-mobilemenu__link', { href: base + a.href, 'aria-current': a.id === cfg.id ? 'page' : null, html: icon(a.icon) + esc(a.label) })));
      list.append(h('h3.vl-mobilemenu__title', { text: 'Outils' }));
      list.append(h('button.vl-mobilemenu__link', { type: 'button', html: icon('search') + 'Command Center', onclick: () => { s.close(); V.command && V.command.open(); } }));
      list.append(h('button.vl-mobilemenu__link', { type: 'button', html: icon('sliders') + 'Personnaliser l’interface', onclick: () => { s.close(); V.studio && V.studio.open(); } }));
      list.append(h('button.vl-mobilemenu__link', { type: 'button', html: icon(V.prefs.palette() === 'dark' ? 'sun' : 'moon') + (V.prefs.palette() === 'dark' ? 'Thème clair' : 'Thème sombre'), onclick: () => { toggleTheme(); s.close(); } }));
      const s = ui.sheet({ title: 'Menu', eyebrow: cfg.name, body: list, className: 'vl-sheet--menu' });
    }

    /* ---------- Profile menu (demo profile: honest placeholder) ---------- */
    me.addEventListener('click', () => ui.menu(me, [
      { heading: 'Profil de démonstration' },
      { label: 'Personnaliser l’interface', icon: 'sliders', run: () => V.studio && V.studio.open(), hint: ',' },
      { label: 'Raccourcis clavier', icon: 'keyboard', run: () => help(), hint: '?' },
      { divider: true },
      { label: 'Réinitialiser les données de démo', icon: 'refresh', run: () => resetDemo() }
    ], { label: 'Profil' }));
    async function resetDemo() {
      const ok = await ui.confirm({ title: 'Réinitialiser cette démo ?', message: 'Les enregistrements, vues, dispositions et notifications de ' + cfg.name + ' reviennent à leur état d’origine. Vos préférences d’affichage sont conservées.', confirm: 'Réinitialiser', tone: 'danger' });
      if (!ok) return;
      Object.keys(localStorage).filter(k => k.startsWith('velora.v4.' + cfg.id + '.')).forEach(k => localStorage.removeItem(k));
      location.reload();
    }

    /* ---------- Help ---------- */
    function help() {
      const list = h('dl.vl-shortcuts');
      SHORTCUTS.concat(cfg.shortcuts || []).forEach(([k, d]) => list.append(h('dt', null, ...k.split(' ').map(p => ['puis', 'à', '/'].includes(p) ? ' ' + p + ' ' : h('kbd.vl-kbd', { text: p }))), h('dd', { text: d })));
      ui.dialog({ title: 'Raccourcis clavier', eyebrow: cfg.name, body: list, size: 'md' });
    }

    /* ---------- Keyboard shortcuts (ignored while typing) ---------- */
    let gPending = 0;
    const typing = t => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); V.command && V.command.toggle(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target) || e.defaultPrevented) return;
      if (ui.layers.list.some(l => l.modal)) return;
      if (gPending && /^[1-9]$/.test(e.key)) { const v = views.filter(x => !x.hidden)[+e.key - 1]; gPending = 0; if (v) { e.preventDefault(); ctx.navigate(v.id); } return; }
      gPending = 0;
      switch (e.key) {
        case 'g': gPending = setTimeout(() => { gPending = 0; }, 1200); break;
        case '/': { e.preventDefault(); const s = $('[data-vl-search]', main); if (s) s.focus(); else V.command && V.command.open(); break; }
        case '?': e.preventDefault(); help(); break;
        case '.': e.preventDefault(); V.activity && V.activity.open(); break;
        case ',': e.preventDefault(); V.studio && V.studio.open(); break;
        case '[': e.preventDefault(); setRail(V.prefs.get().rail === 'expanded' ? 'collapsed' : 'expanded'); break;
        case 'n': if (cfg.create) { e.preventDefault(); cfg.create.run(ctx); } break;
      }
    });

    search.addEventListener('click', () => V.command && V.command.open());
    bell.addEventListener('click', () => V.activity && V.activity.open());

    /* ---------- Command registrations: navigation, apps, appearance ---------- */
    if (V.command) {
      views.filter(v => !v.hidden).forEach((v, i) => V.command.register({ id: 'nav.' + v.id, group: 'Aller à', label: v.label, icon: v.icon || 'grid', keywords: v.keywords, hint: 'g ' + (i + 1), run: () => ctx.navigate(v.id) }));
      ECOSYSTEM.filter(a => a.id !== cfg.id).forEach(a => V.command.register({ id: 'app.' + a.id, group: 'Applications Velora', label: 'Ouvrir ' + a.label, icon: a.icon, run: () => { location.href = base + a.href; } }));
      if (cfg.create) V.command.register({ id: 'create', group: 'Actions', label: cfg.create.label, icon: 'plus', hint: 'n', run: () => cfg.create.run(ctx) });
      V.command.register({ id: 'ui.theme', group: 'Apparence', label: 'Basculer thème clair / sombre', icon: 'moon', keywords: 'dark nuit', run: toggleTheme });
      V.command.register({ id: 'ui.rail', group: 'Apparence', label: 'Déplier ou replier le menu latéral', icon: 'railOpen', hint: '[', run: () => setRail(V.prefs.get().rail === 'expanded' ? 'collapsed' : 'expanded') });
      V.command.register({ id: 'ui.help', group: 'Aide', label: 'Raccourcis clavier', icon: 'keyboard', hint: '?', run: help });
      V.command.register({ id: 'ui.activity', group: 'Actions', label: 'Ouvrir le centre d’activité', icon: 'bell', hint: '.', run: () => V.activity && V.activity.open() });
      V.command.register({ id: 'demo.reset', group: 'Aide', label: 'Réinitialiser les données de démo', icon: 'refresh', run: resetDemo });
      (cfg.commands || []).forEach(c => V.command.register(c));
      if (cfg.search) V.command.provider(cfg.search);
    }
    if (V.activity) V.activity.init({ app: cfg.id, seed: cfg.notifications || [], badge: bell });

    applyRail(); applyTheme();
    if (document.fonts) document.fonts.ready.then(() => placeIndicator(false));
    V.current = ctx;
    go();
    return ctx;
  }

  /* Page header helper: title types itself in, optional KPI row and actions. */
  function pageHead(o) {
    const head = h('div.vl-pagehead');
    const t = h('h1.vl-title', { 'data-vl-letters-in': '', text: o.title });
    head.append(h('div.vl-pagehead__title', null, o.eyebrow ? h('div.vl-pagehead__eyebrow', { text: o.eyebrow }) : null, t));
    if (o.stats) {
      const stats = h('div.vl-stats');
      o.stats.forEach(s => stats.append(h('div.vl-stat', { 'data-vl-reveal': '' },
        h('span.vl-stat__icon', { html: icon(s.icon || 'trend') }),
        h('div', null, h('b.vl-stat__value', null, h('span', { 'data-vl-count': s.value, 'data-vl-format': s.format || 'int', text: (V.fmt[s.format || 'int'] || V.fmt.int)(s.value) }), s.delta ? h('span.vl-pill' + (s.deltaTone ? '.vl-pill--' + s.deltaTone : '.vl-pill--soft'), { text: s.delta }) : null), h('small.vl-stat__label', { text: s.label })))));
      head.append(stats);
    }
    if (o.actions) { const a = h('div.vl-pagehead__actions'); o.actions.forEach(x => a.append(x)); head.append(a); }
    return head;
  }
  /* Count every [data-vl-count] inside root (called after mount). */
  function countAll(root) {
    $$('[data-vl-count]', root).forEach(el => { const f = V.fmt[el.dataset.vlFormat] || V.fmt.int; el._vlValue = null; M.countTo(el, +el.dataset.vlCount, f); });
  }

  V.app = app;
  V.shell = { ECOSYSTEM, SHORTCUTS, pageHead, countAll };
})(window);
