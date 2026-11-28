/* Velora Dashboard V4: a 12-column widget grid the user can rearrange.
   Move: drag the handle (lifted, tilted card) or focus it and use the arrow keys.
   Resize: corner handle (snaps to 3/4/6/8/12 columns and 1 to 4 rows) or the width/height buttons.
   Hide / add / reset, saved per dashboard. Every widget can expand into a detail window (morph). */
(function (g) {
  'use strict';
  const V = g.Velora;
  const WIDTHS = [3, 4, 6, 8, 12];
  const snapW = w => WIDTHS.reduce((a, b) => Math.abs(b - w) < Math.abs(a - w) ? b : a, 12);

  /* Pure layout sanitizer (unit-tested): unknown ids dropped, new widgets appended, sizes snapped. */
  function sanitizeLayout(raw, widgets) {
    const ids = widgets.map(w => w.id);
    const r = raw && typeof raw === 'object' ? raw : {};
    const order = (Array.isArray(r.order) ? r.order : []).filter((id, i, a) => ids.includes(id) && a.indexOf(id) === i);
    ids.forEach(id => { if (!order.includes(id)) order.push(id); });
    const hidden = (Array.isArray(r.hidden) ? r.hidden : raw ? [] : widgets.filter(w => w.hidden).map(w => w.id)).filter((id, i, a) => ids.includes(id) && a.indexOf(id) === i);
    const size = {};
    widgets.forEach(w => {
      const s = r.size && r.size[w.id] || {};
      const minW = w.minW || 3;
      const ww = Number.isFinite(+s.w) ? snapW(+s.w) : (w.w || 4);
      size[w.id] = { w: Math.max(minW, ww), h: Math.max(1, Math.min(4, Number.isFinite(+s.h) ? Math.round(+s.h) : (w.h || 1))) };
    });
    return { order, hidden: hidden.length >= ids.length ? hidden.slice(0, ids.length - 1) : hidden, size };
  }
  const defaultLayout = widgets => sanitizeLayout(null, widgets);

  function dashboard(container, o) {
    const { h, icon, esc, ui, motion: M, store } = V;
    const widgets = o.widgets;
    const byId = id => widgets.find(w => w.id === id);
    let L = sanitizeLayout(store.get(o.id + '.layout', null), widgets);
    let editing = false;
    const instances = {};
    const save = () => store.set(o.id + '.layout', L);

    const toolbar = h('div.vl-dash-toolbar');
    const editBtn = h('button.vl-btn.vl-btn--sm', { type: 'button', 'aria-pressed': 'false' });
    const addBtn = h('button.vl-btn.vl-btn--sm', { type: 'button', 'aria-haspopup': 'menu', html: icon('plus') + 'Ajouter un widget', hidden: true });
    const resetBtn = h('button.vl-btn.vl-btn--sm.vl-btn--ghost', { type: 'button', html: icon('refresh') + 'Disposition d’origine', hidden: true });
    const help = h('p.vl-dash-help.vl-caption', { hidden: true, id: V.uid('dash-help'), text: 'Glissez la poignée pour déplacer, ou utilisez les flèches quand elle a le focus. Le coin inférieur droit redimensionne.' });
    toolbar.append(editBtn, addBtn, resetBtn, help);
    const grid = h('div.vl-dash', { role: 'list', 'aria-label': o.label || 'Tableau de bord' });
    container.append(toolbar, grid);

    function paintToolbar() {
      editBtn.innerHTML = editing ? icon('check') + 'Terminer' : icon('grid') + 'Modifier la disposition';
      editBtn.setAttribute('aria-pressed', String(editing));
      addBtn.hidden = resetBtn.hidden = help.hidden = !editing;
      addBtn.disabled = !L.hidden.length;
      grid.classList.toggle('is-editing', editing);
    }
    function snapshot() { return JSON.parse(JSON.stringify(L)); }
    function commit(label, before) {
      save();
      V.activity && V.activity.log({ title: label, detail: o.label || 'Tableau de bord', icon: 'grid', undo: () => { L = before; save(); renderAll(true); } });
    }

    function sizeStyle(el, s) { el.style.gridColumn = `span ${s.w}`; el.style.gridRow = `span ${s.h}`; el.dataset.w = s.w; el.dataset.h = s.h; }
    function widgetEl(w) {
      const s = L.size[w.id];
      const titleId = V.uid('wt');
      const el = h('article.vl-widget.vl-card', { role: 'listitem', 'aria-labelledby': titleId, dataset: { id: w.id }, 'data-vl-reveal': '' });
      sizeStyle(el, s);
      const handle = h('button.vl-widget__handle', { type: 'button', 'aria-label': `Déplacer ${w.title}`, 'aria-describedby': help.id, html: icon('drag') });
      const expand = w.expand !== false ? h('button.vl-icon-btn.vl-icon-btn--sm.vl-icon-btn--ghost.vl-widget__expand', { type: 'button', 'aria-label': `Agrandir ${w.title}`, 'data-vl-tip': 'Agrandir', html: icon('expand') }) : null;
      const head = h('header.vl-widget__head', null, handle, h('h2.vl-widget__title', { id: titleId, text: w.title }), w.note ? h('span.vl-card__note', { text: typeof w.note === 'function' ? w.note() : w.note }) : null, h('span.vl-grow'), expand);
      const body = h('div.vl-widget__body');
      const tools = h('div.vl-widget__tools', { role: 'group', 'aria-label': 'Réglages de ' + w.title },
        h('button.vl-icon-btn.vl-icon-btn--sm', { type: 'button', 'aria-label': `Réduire la largeur de ${w.title}`, html: icon('chevL'), dataset: { act: 'w-' } }),
        h('span.vl-widget__size.vl-num', { 'aria-hidden': 'true' }),
        h('button.vl-icon-btn.vl-icon-btn--sm', { type: 'button', 'aria-label': `Élargir ${w.title}`, html: icon('chevR'), dataset: { act: 'w+' } }),
        h('button.vl-icon-btn.vl-icon-btn--sm', { type: 'button', 'aria-label': `Réduire la hauteur de ${w.title}`, html: icon('chevU'), dataset: { act: 'h-' } }),
        h('button.vl-icon-btn.vl-icon-btn--sm', { type: 'button', 'aria-label': `Augmenter la hauteur de ${w.title}`, html: icon('chevD'), dataset: { act: 'h+' } }),
        h('button.vl-icon-btn.vl-icon-btn--sm', { type: 'button', 'aria-label': `Masquer ${w.title}`, html: icon('eyeOff'), dataset: { act: 'hide' } }));
      const grip = h('span.vl-widget__resize', { 'aria-hidden': 'true', html: icon('resize') });
      el.append(head, body, tools, grip);
      paintSize(el);
      tools.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) act(w.id, b.dataset.act, b); });
      if (expand) expand.addEventListener('click', () => openDetail(w, el));
      handle.addEventListener('keydown', e => {
        if (!editing) return;
        const d = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
        if (d) { e.preventDefault(); moveBy(w.id, d); }
      });
      handle.addEventListener('click', () => { if (!editing) { setEditing(true); requestAnimationFrame(() => handle.focus()); } });
      M.drag(handle, {
        item: el,
        onStart: () => { if (!editing) setEditing(true); state.before = snapshot(); el.classList.add('is-placeholder'); },
        onMove: ({ x, y }) => reorderAt(el, x, y),
        autoScroll: (x, y) => { if (y < 60) scrollBy(0, -12); else if (y > innerHeight - 60) scrollBy(0, 12); },
        onDrop: () => { el.classList.remove('is-placeholder'); return el; },
        onEnd: () => { const order = Array.from(grid.children).map(c => c.dataset.id); const changed = order.join() !== L.order.filter(id => !L.hidden.includes(id)).join(); L.order = order.concat(L.order.filter(id => !order.includes(id))); if (changed) { commit(`Widget « ${w.title} » déplacé`, state.before); V.announce(`${w.title} déplacé en position ${order.indexOf(w.id) + 1}`); } }
      });
      grip.addEventListener('pointerdown', e => startResize(e, w, el));
      return el;
    }
    const state = { before: null };
    function paintSize(el) { const s = el.querySelector('.vl-widget__size'); if (s) s.textContent = `${el.dataset.w}×${el.dataset.h}`; }
    function reorderAt(el, x, y) {
      const target = document.elementsFromPoint(x, y).map(n => n.closest && n.closest('.vl-widget')).find(n => n && n !== el && grid.contains(n));
      if (!target) return;
      const r = target.getBoundingClientRect();
      const after = (x - r.left) / r.width > .5 || (y - r.top) / r.height > .66;
      const ref = after ? target.nextElementSibling : target;
      if (ref === el || el.nextElementSibling === ref) return;
      M.flip(Array.from(grid.children), () => grid.insertBefore(el, ref));
    }
    function moveBy(id, d) {
      const vis = L.order.filter(x => !L.hidden.includes(x));
      const i = vis.indexOf(id), j = i + d;
      if (j < 0 || j >= vis.length) { V.announce(d < 0 ? 'Déjà en première position' : 'Déjà en dernière position'); return; }
      const before = snapshot();
      [vis[i], vis[j]] = [vis[j], vis[i]];
      L.order = vis.concat(L.order.filter(x => L.hidden.includes(x)));
      const el = grid.querySelector(`[data-id="${id}"]`), other = grid.querySelector(`[data-id="${vis[i]}"]`);
      M.flip(Array.from(grid.children), () => { if (d < 0) grid.insertBefore(el, other); else grid.insertBefore(el, other.nextElementSibling); });
      el.querySelector('.vl-widget__handle').focus();
      commit(`Widget « ${byId(id).title} » déplacé`, before);
      V.announce(`${byId(id).title} en position ${j + 1} sur ${vis.length}`);
    }
    function resizeTo(id, s, announce) {
      const el = grid.querySelector(`[data-id="${id}"]`);
      M.flip(Array.from(grid.children), () => { L.size[id] = s; sizeStyle(el, s); paintSize(el); });
      if (announce) V.announce(`${byId(id).title} : ${s.w} colonnes sur 12, ${s.h} rangée${s.h > 1 ? 's' : ''}`);
    }
    function act(id, a) {
      const w = byId(id), s = { ...L.size[id] }, before = snapshot();
      if (a === 'hide') { L.hidden.push(id); commit(`Widget « ${w.title} » masqué`, before); renderAll(true); ui.toast(`« ${w.title} » masqué`, { action: { label: 'Annuler', run: () => { L = before; save(); renderAll(true); } } }); return; }
      const i = WIDTHS.indexOf(s.w);
      if (a === 'w-') s.w = Math.max(w.minW || 3, WIDTHS[Math.max(0, i - 1)]);
      if (a === 'w+') s.w = WIDTHS[Math.min(WIDTHS.length - 1, i + 1)];
      if (a === 'h-') s.h = Math.max(1, s.h - 1);
      if (a === 'h+') s.h = Math.min(4, s.h + 1);
      if (s.w === L.size[id].w && s.h === L.size[id].h) { V.announce('Taille limite atteinte'); return; }
      resizeTo(id, s, true); commit(`Widget « ${w.title} » redimensionné`, before);
    }
    function startResize(e, w, el) {
      if (!editing || e.button !== 0) return;
      e.preventDefault();
      const before = snapshot();
      const gr = grid.getBoundingClientRect(), gap = parseFloat(getComputedStyle(grid).columnGap) || 14;
      const colW = (gr.width - gap * 11) / 12, rowH = parseFloat(getComputedStyle(grid).gridAutoRows) || 150;
      const r = el.getBoundingClientRect(), sx = e.clientX, sy = e.clientY;
      el.classList.add('is-resizing');
      const move = ev => {
        const w2 = Math.max(w.minW || 3, snapW(Math.round((r.width + ev.clientX - sx + gap) / (colW + gap))));
        const h2 = Math.max(1, Math.min(4, Math.round((r.height + ev.clientY - sy + gap) / (rowH + gap))));
        const cur = L.size[w.id];
        if (w2 !== cur.w || h2 !== cur.h) resizeTo(w.id, { w: w2, h: h2 }, false);
      };
      const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); el.classList.remove('is-resizing'); if (JSON.stringify(before.size[w.id]) !== JSON.stringify(L.size[w.id])) { commit(`Widget « ${w.title} » redimensionné`, before); V.announce(`${w.title} : ${L.size[w.id].w} colonnes, ${L.size[w.id].h} rangées`); } };
      addEventListener('pointermove', move); addEventListener('pointerup', up);
    }

    async function fillWidget(w, el) {
      const body = el.querySelector('.vl-widget__body');
      const run = async () => {
        body.innerHTML = '';
        let data;
        if (w.load) {
          body.append(ui.state.loading({ kind: w.skeleton || 'chart', height: 90 }));
          try { data = await w.load(); }
          catch (err) { body.innerHTML = ''; body.append(ui.state.error({ title: 'Widget indisponible', text: err && err.message ? err.message : undefined, retry: run })); return; }
          body.innerHTML = '';
        }
        instances[w.id] = w.render(body, { data, size: L.size[w.id], refresh: run, el }) || {};
        M.play(body, [{ opacity: 0 }, { opacity: 1 }], { duration: 'fast' });
      };
      await run();
    }
    function renderAll(animate) {
      const old = new Map(Array.from(grid.children).map(c => [c.dataset.id, c]));
      const keep = [];
      const frag = [];
      L.order.filter(id => !L.hidden.includes(id)).forEach(id => {
        let el = old.get(id);
        if (el) { keep.push(el); sizeStyle(el, L.size[id]); paintSize(el); }
        else { el = widgetEl(byId(id)); el._fresh = true; }
        frag.push(el);
      });
      const mutate = () => { old.forEach((el, id) => { if (!frag.includes(el)) el.remove(); }); frag.forEach(el => grid.append(el)); };
      if (animate) M.flip(keep, mutate); else mutate();
      frag.filter(el => el._fresh).forEach(el => { el._fresh = false; fillWidget(byId(el.dataset.id), el); if (animate) M.play(el, [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 'control', easing: M.ease('out') }); });
      paintToolbar();
    }
    function setEditing(on) {
      editing = on; paintToolbar();
      V.announce(on ? 'Mode personnalisation activé' : 'Disposition enregistrée');
    }
    editBtn.addEventListener('click', () => setEditing(!editing));
    resetBtn.addEventListener('click', () => { const before = snapshot(); L = defaultLayout(widgets); commit('Disposition réinitialisée', before); renderAll(true); ui.toast('Disposition d’origine restaurée', { action: { label: 'Annuler', run: () => { L = before; save(); renderAll(true); } } }); });
    addBtn.addEventListener('click', () => ui.menu(addBtn, L.hidden.map(id => ({ label: byId(id).title, icon: byId(id).icon || 'plus', run: () => { const before = snapshot(); L.hidden = L.hidden.filter(x => x !== id); commit(`Widget « ${byId(id).title} » ajouté`, before); renderAll(true); const el = grid.querySelector(`[data-id="${id}"]`); el && (el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), M.flash(el)); } })), { label: 'Widgets masqués', align: 'start' }));

    function openDetail(w, el) {
      const body = h('div.vl-widget-detail');
      const d = ui.dialog({ title: w.title, eyebrow: o.label, size: 'lg', source: el, body, fromColor: getComputedStyle(el).backgroundColor });
      const content = () => { if (w.detail) w.detail(body, { data: instances[w.id] && instances[w.id].data }); else { const inner = h('div', { style: { minHeight: '260px' } }); body.append(inner); w.render(inner, { data: instances[w.id] && instances[w.id].data, size: { w: 12, h: 2 }, detail: true }); } };
      setTimeout(content, M.reduced() ? 0 : M.duration('morph') * .35);
      return d;
    }

    renderAll(false);
    paintToolbar();
    return {
      widget: id => instances[id], refresh: id => { const el = grid.querySelector(`[data-id="${id}"]`); if (el) fillWidget(byId(id), el); },
      get layout() { return snapshot(); }, setEditing
    };
  }

  V.dashboard = Object.assign(dashboard, { sanitizeLayout, defaultLayout, WIDTHS, snapW });
})(typeof window !== 'undefined' ? window : globalThis);
