/* Velora Data Table V4: search (with "field:value" tokens), faceted filters, configurable columns,
   multi-sort (Shift+click), inline editing with undo, saved views, bulk selection, CSV export,
   loading / empty / error states, FLIP when rows reorder. The query engine is pure and unit-tested. */
(function (g) {
  'use strict';
  const V = g.Velora;
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  /* ---------- Pure engine ---------- */
  const cellValue = (col, row) => col.value ? col.value(row) : row[col.key];
  const cellText = (col, row) => {
    const v = cellValue(col, row);
    if (col.options) { const o = col.options.find(x => (x.value ?? x) === v); if (o) return o.label ?? o; }
    return v == null ? '' : String(v);
  };
  function tokenize(q) {
    const out = []; const re = /(-?)(?:(\w[\w-]*):)?(?:"([^"]*)"|(\S+))/g; let m;
    while ((m = re.exec(String(q || '')))) out.push({ neg: !!m[1], field: m[2] ? norm(m[2]) : null, text: norm(m[3] != null ? m[3] : m[4]) });
    return out.filter(t => t.text);
  }
  function findColumn(columns, field) {
    return columns.find(c => norm(c.key) === field) || columns.find(c => norm(c.label).replace(/\s+/g, '').startsWith(field)) || null;
  }
  function compare(a, b, type) {
    if (a == null && b == null) return 0; if (a == null) return 1; if (b == null) return -1;
    if (type === 'date') return new Date(a) - new Date(b);
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b), 'fr', { numeric: true, sensitivity: 'base' });
  }
  function query(rows, columns, state) {
    const tokens = tokenize(state.q);
    const searchable = columns.filter(c => c.search !== false);
    let out = rows.filter(row => {
      for (const [key, values] of Object.entries(state.filters || {})) {
        if (!values || !values.length) continue;
        const col = columns.find(c => c.key === key); if (!col) continue;
        if (!values.map(String).includes(String(cellValue(col, row)))) return false;
      }
      return tokens.every(t => {
        let hit;
        if (t.field) { const col = findColumn(columns, t.field); hit = col ? norm(cellText(col, row)).includes(t.text) : false; }
        else hit = searchable.some(c => norm(cellText(c, row)).includes(t.text));
        return t.neg ? !hit : hit;
      });
    });
    const sorts = (state.sort || []).filter(s => columns.some(c => c.key === s.key));
    if (sorts.length) {
      out = out.map((r, i) => [r, i]).sort((A, B) => {
        for (const s of sorts) {
          const col = columns.find(c => c.key === s.key);
          const d = compare(col.sortValue ? col.sortValue(A[0]) : cellValue(col, A[0]), col.sortValue ? col.sortValue(B[0]) : cellValue(col, B[0]), col.type);
          if (d) return s.dir === 'desc' ? -d : d;
        }
        return A[1] - B[1];
      }).map(x => x[0]);
    }
    return out;
  }
  function facets(rows, col) {
    const m = new Map();
    rows.forEach(r => { const v = cellValue(col, r); if (v == null || v === '') return; m.set(v, (m.get(v) || 0) + 1); });
    const order = col.options ? col.options.map(o => o.value ?? o) : null;
    return [...m.entries()].sort((a, b) => order ? order.indexOf(a[0]) - order.indexOf(b[0]) : String(a[0]).localeCompare(String(b[0]), 'fr')).map(([value, count]) => ({ value, count, label: col.options ? ((col.options.find(o => (o.value ?? o) === value) || {}).label ?? value) : value }));
  }
  function sanitizeState(raw, columns, defaults) {
    const r = raw && typeof raw === 'object' ? raw : {};
    const keys = columns.map(c => c.key);
    const d = defaults || {};
    let cols = Array.isArray(r.columns) ? r.columns.filter((k, i, a) => keys.includes(k) && a.indexOf(k) === i) : null;
    if (!cols || !cols.length) cols = d.columns || columns.filter(c => !c.hidden).map(c => c.key);
    const primary = columns.find(c => c.primary);
    if (primary && !cols.includes(primary.key)) cols.unshift(primary.key);
    const filters = {};
    Object.entries(r.filters && typeof r.filters === 'object' ? r.filters : (d.filters || {})).forEach(([k, v]) => { if (keys.includes(k) && Array.isArray(v) && v.length) filters[k] = v.slice(0, 50); });
    const sort = (Array.isArray(r.sort) ? r.sort : (d.sort || [])).filter(s => s && keys.includes(s.key) && (s.dir === 'asc' || s.dir === 'desc')).slice(0, 3);
    return { q: typeof r.q === 'string' ? r.q.slice(0, 200) : (d.q || ''), filters, sort, columns: cols, view: typeof r.view === 'string' ? r.view : (d.view || 'all'), page: 0 };
  }
  function toCSV(rows, columns) {
    const q = v => { const s = String(v == null ? '' : v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return '﻿' + [columns.map(c => q(c.label)).join(';'), ...rows.map(r => columns.map(c => q(cellText(c, r))).join(';'))].join('\n');
  }

  /* ---------- Popover (non-modal layer for filters and column settings) ---------- */
  let openPop = null;
  function popover(anchor, node, label) {
    const { h, ui, motion: M } = V;
    if (openPop) { const same = openPop.anchor === anchor; openPop.close(); if (same) return null; }
    const el = h('div.vl-popover', { role: 'dialog', 'aria-label': label });
    el.append(node);
    document.body.append(el);
    const r = anchor.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.left, innerWidth - el.offsetWidth - 8));
    let top = r.bottom + 6; if (top + el.offsetHeight > innerHeight - 8) top = Math.max(8, r.top - el.offsetHeight - 6);
    Object.assign(el.style, { left: left + 'px', top: top + 'px' });
    anchor.setAttribute('aria-expanded', 'true');
    M.play(el, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 'fast' });
    const outside = e => { if (!el.contains(e.target) && !anchor.contains(e.target)) api.close(false); };
    setTimeout(() => document.addEventListener('pointerdown', outside), 0);
    const api = {
      anchor, el,
      close(restore) { if (!el.isConnected) return; document.removeEventListener('pointerdown', outside); ui.layers.pop(layer, false); anchor.setAttribute('aria-expanded', 'false'); el.remove(); openPop = null; if (restore !== false) anchor.focus({ preventScroll: true }); }
    };
    const layer = ui.layers.push({ root: el, modal: false, close: () => api.close() });
    openPop = api;
    ui.focusFirst(el);
    return api;
  }

  /* ---------- Component ---------- */
  function table(container, o) {
    const { h, icon, esc, ui, motion: M, fmt, store } = V;
    const cols = o.columns;
    const colBy = k => cols.find(c => c.key === k);
    const presets = [{ id: 'all', name: o.allLabel || 'Tous les éléments', state: {} }, ...(o.views || [])];
    const userViews = () => store.get(o.id + '.views', []);
    const allViews = () => presets.concat(userViews());
    const viewState = id => { const v = allViews().find(x => x.id === id) || presets[0]; return sanitizeState({ ...v.state, view: v.id }, cols); };
    let st = sanitizeState(store.get(o.id + '.state', null), cols, viewState('all'));
    let rows = o.rows || [], status = o.load ? 'loading' : 'ready', selected = new Set();
    const pageSize = o.pageSize || 12;
    const key = r => r[o.rowKey || 'id'];
    const persist = () => store.set(o.id + '.state', { ...st, page: 0 });
    const viewOf = () => allViews().find(v => v.id === st.view);
    const dirty = () => { const v = viewOf(); if (!v) return true; const base = viewState(v.id); return JSON.stringify([base.q, base.filters, base.sort, base.columns]) !== JSON.stringify([st.q, st.filters, st.sort, st.columns]); };

    const root = h('div.vl-table-wrap');
    const searchId = V.uid('tq');
    const search = h('input', { id: searchId, type: 'search', placeholder: o.searchPlaceholder || 'Rechercher…', 'data-vl-search': '', 'aria-describedby': searchId + '-hint', value: st.q, autocomplete: 'off' });
    const viewBtn = h('button.vl-btn.vl-btn--sm', { type: 'button', 'aria-haspopup': 'menu' });
    const filterBtn = h('button.vl-btn.vl-btn--sm', { type: 'button', 'aria-haspopup': 'dialog', html: icon('filter') + 'Filtrer' });
    const colBtn = h('button.vl-btn.vl-btn--sm', { type: 'button', 'aria-haspopup': 'dialog', html: icon('columns') + 'Colonnes' });
    const exportBtn = h('button.vl-btn.vl-btn--sm.vl-btn--ghost', { type: 'button', html: icon('down') + 'CSV', 'aria-label': 'Exporter les lignes filtrées en CSV' });
    const toolbar = h('div.vl-table-toolbar', null,
      h('label.vl-search', { for: searchId }, h('span', { html: icon('search') }), h('span.vl-sr', { text: 'Rechercher dans ' + (o.caption || 'le tableau') }), search),
      viewBtn, filterBtn, colBtn, exportBtn);
    const hint = h('p.vl-table-hint.vl-caption', { id: searchId + '-hint', text: 'Astuce : ' + (o.searchHint || 'tapez « statut:ouvert » pour filtrer une colonne, « -mot » pour exclure.') });
    const chips = h('div.vl-table-chips', { 'aria-live': 'polite' });
    const bulk = h('div.vl-table-bulk', { hidden: true, role: 'region', 'aria-label': 'Actions groupées' });
    const scroller = h('div.vl-table-scroll');
    const tableEl = h('table.vl-table');
    const caption = h('caption.vl-sr', { text: o.caption || '' });
    const thead = h('thead'), tbody = h('tbody');
    tableEl.append(caption, thead, tbody);
    scroller.append(tableEl);
    const stateHost = h('div.vl-table-state');
    const pager = h('div.vl-table-pager');
    root.append(toolbar, hint, chips, bulk, scroller, stateHost, pager);
    container.append(root);

    /* Header */
    function renderHead() {
      thead.innerHTML = '';
      const tr = h('tr');
      if (o.bulk) {
        const all = h('input', { type: 'checkbox', 'aria-label': 'Sélectionner toutes les lignes visibles' });
        all.addEventListener('change', () => { pageRows().forEach(r => all.checked ? selected.add(key(r)) : selected.delete(key(r))); render(false); });
        tr.append(h('th.vl-table__check', { scope: 'col' }, all));
      }
      st.columns.map(colBy).filter(Boolean).forEach(c => {
        const s = st.sort.find(x => x.key === c.key);
        const th = h('th', { scope: 'col', class: (c.align === 'end' ? 'is-end' : '') + (c.primary ? ' is-primary' : ''), 'aria-sort': s ? (s.dir === 'asc' ? 'ascending' : 'descending') : null, style: c.width ? { width: c.width } : null });
        if (c.sortable === false) th.textContent = c.label;
        else {
          const b = h('button.vl-table__sort', { type: 'button', title: 'Trier (Maj + clic pour un tri secondaire)' }, h('span', { text: c.label }), h('span.vl-table__sorticon', { 'aria-hidden': 'true', html: s ? icon(s.dir === 'asc' ? 'chevU' : 'chevD') : '' }), st.sort.length > 1 && s ? h('small', { text: String(st.sort.indexOf(s) + 1), 'aria-label': 'priorité de tri ' + (st.sort.indexOf(s) + 1) }) : null);
          b.addEventListener('click', e => toggleSort(c.key, e.shiftKey));
          th.append(b);
        }
        tr.append(th);
      });
      thead.append(tr);
    }
    function toggleSort(k, add) {
      const s = st.sort.find(x => x.key === k);
      if (!add) st.sort = s ? (s.dir === 'asc' ? [{ key: k, dir: 'desc' }] : []) : [{ key: k, dir: 'asc' }];
      else if (!s) st.sort = [...st.sort, { key: k, dir: 'asc' }].slice(0, 3);
      else if (s.dir === 'asc') s.dir = 'desc';
      else st.sort = st.sort.filter(x => x !== s);
      st.page = 0; changed();
      const label = colBy(k).label, now = st.sort.find(x => x.key === k);
      V.announce(now ? `Tri par ${label}, ${now.dir === 'asc' ? 'croissant' : 'décroissant'}` : `Tri par ${label} retiré`);
    }

    /* Cells */
    function cellHTML(c, r) {
      if (c.render) return c.render(r);
      const v = cellValue(c, r);
      if (c.type === 'money') return `<span class="vl-num">${esc(fmt.money(v || 0))}</span>`;
      if (c.type === 'number') return `<span class="vl-num">${esc(v == null ? '' : fmt.int(v))}</span>`;
      if (c.type === 'date') return v ? `<time datetime="${esc(v)}">${esc(fmt.date(v))}</time>` : '';
      if (c.type === 'person') return v ? `<span class="vl-person">${V.avatar(v)}<span>${esc(v)}</span></span>` : '<span class="vl-muted">Non assigné</span>';
      if (c.tone) return `<span class="vl-status" data-tone="${esc(c.tone(r))}">${esc(cellText(c, r))}</span>`;
      return esc(cellText(c, r));
    }
    function buildRow(r, tr) {
      tr = tr || h('tr');
      tr.innerHTML = '';
      tr.dataset.key = key(r);
      tr.classList.toggle('is-selected', selected.has(key(r)));
      if (o.bulk) {
        const cb = h('input', { type: 'checkbox', checked: selected.has(key(r)), 'aria-label': 'Sélectionner ' + cellText(cols.find(c => c.primary) || cols[0], r) });
        cb.addEventListener('change', () => { cb.checked ? selected.add(key(r)) : selected.delete(key(r)); tr.classList.toggle('is-selected', cb.checked); renderBulk(); syncAll(); });
        tr.append(h('td.vl-table__check', null, cb));
      }
      st.columns.map(colBy).filter(Boolean).forEach(c => {
        const td = h('td', { class: (c.align === 'end' ? 'is-end' : '') + (c.primary ? ' is-primary' : ''), 'data-label': c.label });
        if (c.primary && o.onOpen) {
          const b = h('button.vl-table__open', { type: 'button', html: cellHTML(c, r) });
          b.addEventListener('click', e => { e.stopPropagation(); openRow(r, tr); });
          td.append(b);
        } else if (c.editable && o.onEdit) {
          const b = h('button.vl-cell-edit', { type: 'button', html: `<span class="vl-sr">Modifier ${esc(c.label)} : </span><span>${cellHTML(c, r) || '<span class="vl-muted">vide</span>'}</span>${icon('edit')}` });
          b.addEventListener('click', e => { e.stopPropagation(); edit(td, c, r); });
          td.append(b);
        } else td.innerHTML = cellHTML(c, r);
        tr.append(td);
      });
      return tr;
    }
    function openRow(r, tr) {
      if (!o.onOpen) return;
      tbody.querySelectorAll('tr.is-active').forEach(x => x.classList.remove('is-active'));
      tr.classList.add('is-active');
      o.onOpen(r, tr, filtered(), api);
    }
    tbody.addEventListener('click', e => {
      if (e.target.closest('button,input,select,a,label')) return;
      const tr = e.target.closest('tr[data-key]'); if (!tr) return;
      const r = rows.find(x => String(key(x)) === tr.dataset.key); if (r) openRow(r, tr);
    });

    /* Inline edit: Enter or blur commits, Escape cancels, a toast offers Undo. */
    function edit(td, c, r) {
      const old = cellValue(c, r);
      const id = V.uid('ed');
      const input = c.options
        ? h('select.vl-select.vl-cell-input', { id, 'aria-label': c.label }, ...c.options.map(op => h('option', { value: op.value ?? op, text: op.label ?? op, selected: String(op.value ?? op) === String(old) })))
        : h('input.vl-input.vl-cell-input', { id, type: c.type === 'number' || c.type === 'money' ? 'number' : 'text', value: old ?? '', 'aria-label': c.label });
      td.innerHTML = ''; td.append(input); input.focus();
      let done = false;
      const finish = async commit => {
        if (done) return; done = true;
        let v = input.value;
        if (c.type === 'number' || c.type === 'money') v = v === '' ? null : Number(v);
        if (commit && String(v) !== String(old)) {
          const ok = await o.onEdit(r, c.key, v, old);
          if (ok !== false) {
            const tr = td.closest('tr');
            buildRow(r, tr); M.flash(tr, 'vl-row-flash');
            V.activity && V.activity.log({ title: `${c.label} modifié`, detail: `${cellText(cols.find(x => x.primary) || cols[0], r)} : ${old ?? 'vide'} → ${cellText(c, r)}`, icon: 'edit', undo: () => { o.onEdit(r, c.key, old, v); render(false); } });
            ui.toast(`Colonne « ${c.label} » mise à jour`, { action: { label: 'Annuler', run: () => { o.onEdit(r, c.key, old, v); render(false); V.announce('Modification annulée'); } } });
            renderChips();
            const btn = tr.querySelector(`td[data-label="${CSS.escape(c.label)}"] button`); btn && btn.focus();
            return;
          }
        }
        const tr = td.closest('tr'); buildRow(r, tr);
        const btn = tr.querySelector(`td[data-label="${CSS.escape(c.label)}"] button`); btn && btn.focus();
      };
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); finish(true); } if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); } });
      input.addEventListener('blur', () => finish(true));
      if (c.options) input.addEventListener('change', () => finish(true));
    }

    const filtered = () => query(rows, cols, st);
    const pageRows = () => { const f = filtered(); const pages = Math.max(1, Math.ceil(f.length / pageSize)); st.page = Math.min(st.page, pages - 1); return f.slice(st.page * pageSize, st.page * pageSize + pageSize); };
    function syncAll() {
      const all = thead.querySelector('input[type=checkbox]'); if (!all) return;
      const vis = pageRows(); const n = vis.filter(r => selected.has(key(r))).length;
      all.checked = n > 0 && n === vis.length; all.indeterminate = n > 0 && n < vis.length;
    }
    function renderBulk() {
      if (!o.bulk) return;
      const n = selected.size;
      bulk.hidden = !n; bulk.innerHTML = '';
      if (!n) return;
      bulk.append(h('b', { text: n + ' sélectionné' + (n > 1 ? 's' : '') }));
      o.bulk.forEach(a => bulk.append(h('button.vl-btn.vl-btn--sm', { type: 'button', html: (a.icon ? icon(a.icon) : '') + esc(a.label), onclick: async () => { const list = rows.filter(r => selected.has(key(r))); await a.run(list, api); selected.clear(); render(false); } })));
      bulk.append(h('span.vl-grow'), h('button.vl-btn.vl-btn--sm.vl-btn--ghost', { type: 'button', text: 'Désélectionner', onclick: () => { selected.clear(); render(false); } }));
    }
    function renderChips() {
      chips.innerHTML = '';
      const f = filtered();
      chips.append(h('span.vl-table-count', { text: `${f.length} sur ${rows.length}` }));
      Object.entries(st.filters).forEach(([k, values]) => {
        const c = colBy(k); if (!c) return;
        values.forEach(v => chips.append(h('button.vl-chip', { type: 'button', 'aria-label': `Retirer le filtre ${c.label} : ${labelOf(c, v)}`, html: `<span>${esc(c.label)} : <b>${esc(labelOf(c, v))}</b></span>${icon('x')}`, onclick: () => { st.filters[k] = values.filter(x => x !== v); if (!st.filters[k].length) delete st.filters[k]; st.page = 0; changed(); } })));
      });
      if (Object.keys(st.filters).length || st.q) chips.append(h('button.vl-btn.vl-btn--sm.vl-btn--ghost', { type: 'button', text: 'Tout effacer', onclick: clearFilters }));
      const v = viewOf();
      viewBtn.innerHTML = icon('layout') + `<span>${esc(v ? v.name : 'Vue personnalisée')}</span>` + (dirty() ? '<span class="vl-table-dirty">modifiée</span>' : '') + icon('chevD');
      viewBtn.setAttribute('aria-label', 'Vue : ' + (v ? v.name : 'personnalisée') + (dirty() ? ', modifiée' : ''));
      const nf = Object.values(st.filters).reduce((a, x) => a + x.length, 0);
      filterBtn.innerHTML = icon('filter') + 'Filtrer' + (nf ? ` <span class="vl-pill vl-pill--soft">${nf}</span>` : '');
    }
    const labelOf = (c, v) => { if (!c.options) return v; const op = c.options.find(x => String(x.value ?? x) === String(v)); return op ? (op.label ?? op) : v; };
    function clearFilters() { st.q = ''; search.value = ''; st.filters = {}; st.page = 0; changed(); search.focus(); }

    function renderPager(total) {
      pager.innerHTML = '';
      const pages = Math.max(1, Math.ceil(total / pageSize));
      if (pages <= 1) return;
      pager.append(
        h('button.vl-btn.vl-btn--sm', { type: 'button', disabled: st.page === 0, html: icon('chevL') + 'Précédent', onclick: () => { st.page--; render(true); } }),
        h('span.vl-caption', { text: `Page ${st.page + 1} sur ${pages}` }),
        h('button.vl-btn.vl-btn--sm', { type: 'button', disabled: st.page >= pages - 1, html: 'Suivant' + icon('chevR'), onclick: () => { st.page++; render(true); } }));
    }

    function render(animate) {
      renderHead();
      stateHost.innerHTML = '';
      if (status === 'loading') {
        tbody.innerHTML = '';
        for (let i = 0; i < 6; i++) { const tr = h('tr.vl-table__skeleton', { 'aria-hidden': 'true' }); (o.bulk ? [0] : []).concat(st.columns).forEach((_, k) => tr.append(h('td', null, h('span.vl-skeleton.vl-skeleton--line', { style: { width: (50 + (i * 13 + k * 17) % 45) + '%' } })))); tbody.append(tr); }
        stateHost.append(h('span.vl-sr', { role: 'status', text: 'Chargement des données' }));
        chips.innerHTML = ''; pager.innerHTML = ''; tableEl.setAttribute('aria-busy', 'true');
        return;
      }
      tableEl.removeAttribute('aria-busy');
      if (status === 'error') {
        tbody.innerHTML = ''; scroller.hidden = true; chips.innerHTML = ''; pager.innerHTML = '';
        stateHost.append(ui.state.error({ title: 'Impossible de charger ' + (o.caption || 'les données'), text: o.errorText, retry: () => load() }));
        return;
      }
      scroller.hidden = false;
      const list = pageRows();
      const existing = new Map(Array.from(tbody.children).filter(tr => tr.dataset.key).map(tr => [tr.dataset.key, tr]));
      const keep = Array.from(existing.values());
      const mutate = () => {
        const frag = document.createDocumentFragment();
        list.forEach(r => frag.append(buildRow(r, existing.get(String(key(r))))));
        tbody.innerHTML = ''; tbody.append(frag);
      };
      if (animate && keep.length && list.length <= 60) M.flip(keep, mutate); else mutate();
      if (animate) Array.from(tbody.children).filter(tr => !existing.has(tr.dataset.key)).forEach((tr, i) => M.play(tr, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 'control', delay: Math.min(i * 20, 200), easing: M.ease('out'), fill: 'backwards' }));
      if (!rows.length) { scroller.hidden = true; stateHost.append(ui.state.empty({ title: o.emptyTitle || 'Aucun élément pour le moment', text: o.emptyText, action: o.createAction })); }
      else if (!list.length) { scroller.hidden = true; stateHost.append(ui.state.empty({ title: 'Aucun résultat', text: 'Aucun élément ne correspond à la recherche et aux filtres actifs.', action: { label: 'Effacer les filtres', icon: 'x', run: clearFilters } })); }
      renderChips(); renderBulk(); syncAll(); renderPager(filtered().length);
    }
    function changed() { persist(); render(true); }
    search.addEventListener('input', V.debounce(() => { st.q = search.value; st.page = 0; changed(); }, 140));
    search.addEventListener('keydown', e => { if (e.key === 'Escape' && search.value) { e.preventDefault(); e.stopPropagation(); clearFilters(); } });

    /* Filters popover: one fieldset per filterable column with counts. */
    filterBtn.addEventListener('click', () => {
      const wrap = h('div.vl-pop-filters');
      cols.filter(c => c.filterable).forEach(c => {
        const fs = h('fieldset.vl-pop-group', null, h('legend', { text: c.label }));
        facets(rows, c).forEach(f => {
          const cb = h('input', { type: 'checkbox', checked: (st.filters[c.key] || []).map(String).includes(String(f.value)) });
          cb.addEventListener('change', () => {
            const cur = new Set((st.filters[c.key] || []).map(String));
            cb.checked ? cur.add(String(f.value)) : cur.delete(String(f.value));
            const typed = [...cur].map(x => { const orig = facets(rows, c).find(ff => String(ff.value) === x); return orig ? orig.value : x; });
            if (typed.length) st.filters[c.key] = typed; else delete st.filters[c.key];
            st.page = 0; changed();
          });
          fs.append(h('label.vl-check', null, cb, h('span.vl-grow', { text: f.label }), h('small.vl-muted.vl-num', { text: String(f.count) })));
        });
        wrap.append(fs);
      });
      wrap.append(h('div.vl-pop-foot', null, h('button.vl-btn.vl-btn--sm.vl-btn--ghost', { type: 'button', text: 'Effacer les filtres', onclick: () => { st.filters = {}; changed(); openPop && openPop.close(); } })));
      popover(filterBtn, wrap, 'Filtres');
    });

    /* Columns popover: show/hide + reorder with buttons (keyboard friendly). */
    colBtn.addEventListener('click', () => {
      const wrap = h('div.vl-pop-columns');
      const paint = (focusKey, focusDir) => {
        wrap.innerHTML = '';
        wrap.append(h('p.vl-caption', { text: 'Affichez, masquez et réordonnez les colonnes. Le réglage est mémorisé.' }));
        const ordered = st.columns.concat(cols.map(c => c.key).filter(k => !st.columns.includes(k)));
        ordered.forEach((k, i) => {
          const c = colBy(k), on = st.columns.includes(k);
          const cb = h('input', { type: 'checkbox', checked: on, disabled: c.primary });
          cb.addEventListener('change', () => { st.columns = cb.checked ? [...st.columns, k] : st.columns.filter(x => x !== k); changed(); paint(k); });
          const up = h('button.vl-icon-btn.vl-icon-btn--sm.vl-icon-btn--ghost', { type: 'button', 'aria-label': 'Monter ' + c.label, html: icon('chevU'), disabled: !on || st.columns.indexOf(k) === 0, dataset: { k, d: 'up' } });
          const dn = h('button.vl-icon-btn.vl-icon-btn--sm.vl-icon-btn--ghost', { type: 'button', 'aria-label': 'Descendre ' + c.label, html: icon('chevD'), disabled: !on || st.columns.indexOf(k) === st.columns.length - 1, dataset: { k, d: 'down' } });
          const mv = d => { const a = st.columns.slice(), j = a.indexOf(k), t = j + d; if (t < 0 || t >= a.length) return; [a[j], a[t]] = [a[t], a[j]]; st.columns = a; changed(); paint(k, d < 0 ? 'up' : 'down'); };
          up.onclick = () => mv(-1); dn.onclick = () => mv(1);
          wrap.append(h('div.vl-pop-col', null, h('label.vl-check.vl-grow', null, cb, h('span', { text: c.label + (c.primary ? ' (toujours visible)' : '') })), up, dn));
        });
        if (focusKey) { const b = wrap.querySelector(`[data-k="${focusKey}"][data-d="${focusDir || 'up'}"]`); if (b && !b.disabled) b.focus(); else { const any = wrap.querySelector(`[data-k="${focusKey}"]:not(:disabled)`); any && any.focus(); } }
      };
      paint();
      wrap.append(h('div.vl-pop-foot', null, h('button.vl-btn.vl-btn--sm.vl-btn--ghost', { type: 'button', text: 'Colonnes par défaut', onclick: () => { st.columns = viewState(st.view).columns; changed(); openPop && openPop.close(); } })));
      popover(colBtn, wrap, 'Colonnes');
    });

    /* Views menu */
    viewBtn.addEventListener('click', () => {
      const items = [{ heading: 'Vues' }];
      allViews().forEach(v => items.push({ label: v.name, checked: v.id === st.view, run: () => { st = viewState(v.id); search.value = st.q; changed(); ui.toast('Vue « ' + v.name + ' » appliquée'); } }));
      items.push({ divider: true }, { label: 'Enregistrer la vue actuelle…', icon: 'plus', run: saveView });
      const v = viewOf();
      if (v && userViews().some(x => x.id === v.id)) items.push({ label: 'Supprimer la vue « ' + v.name + ' »', icon: 'trash', run: () => { store.set(o.id + '.views', userViews().filter(x => x.id !== v.id)); st.view = 'all'; changed(); ui.toast('Vue supprimée'); } });
      ui.menu(viewBtn, items, { label: 'Vues enregistrées', align: 'start' });
    });
    function saveView() {
      const id = V.uid('vn');
      const input = h('input.vl-input', { id, required: true, maxlength: '40', value: '', placeholder: 'Ex. Mes priorités de la semaine' });
      const err = h('span.vl-field__error', { hidden: true, id: id + '-e', text: 'Donnez un nom à la vue.' });
      input.setAttribute('aria-describedby', id + '-e');
      const form = h('form', { novalidate: true }, h('div.vl-field', null, h('label', { for: id, text: 'Nom de la vue' }), input, err), h('p.vl-caption', { style: { marginTop: '10px' }, text: 'La vue mémorise la recherche, les filtres, le tri et les colonnes.' }));
      const submit = () => {
        const name = input.value.trim();
        if (!name) { err.hidden = false; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
        const view = { id: 'u-' + Date.now().toString(36), name, state: { q: st.q, filters: st.filters, sort: st.sort, columns: st.columns } };
        store.set(o.id + '.views', [...userViews(), view].slice(-20));
        st.view = view.id; changed(); d.close(); ui.toast('Vue « ' + name + ' » enregistrée');
      };
      form.addEventListener('submit', e => { e.preventDefault(); submit(); });
      const d = ui.dialog({ title: 'Enregistrer la vue', size: 'sm', body: form, actions: [{ label: 'Annuler', variant: 'ghost', run: x => x.close() }, { label: 'Enregistrer la vue', variant: 'strong', run: submit }] });
    }

    exportBtn.addEventListener('click', () => {
      const f = filtered();
      ui.download((o.id || 'export').replace(/\W+/g, '-') + '.csv', toCSV(f, st.columns.map(colBy).filter(Boolean)), 'text/csv;charset=utf-8');
      ui.toast(`${f.length} ligne${f.length > 1 ? 's' : ''} exportée${f.length > 1 ? 's' : ''} en CSV`);
    });

    async function load() {
      if (!o.load) { status = 'ready'; render(false); return; }
      status = 'loading'; render(false);
      try { rows = await o.load(); status = 'ready'; } catch (e) { console.warn(e); status = 'error'; }
      render(true);
    }
    const api = {
      get rows() { return rows; }, get state() { return { ...st }; }, filtered,
      setRows(r) { rows = r; render(true); }, refresh: (anim) => render(anim !== false), reload: load,
      focusSearch: () => search.focus(),
      apply(patch) { st = sanitizeState({ ...st, ...patch }, cols); search.value = st.q; changed(); }
    };
    load();
    return api;
  }

  V.table = Object.assign(table, { query, facets, tokenize, sanitizeState, toCSV, cellText });
  if (V.ui) V.ui.popover = popover;
})(typeof window !== 'undefined' ? window : globalThis);
