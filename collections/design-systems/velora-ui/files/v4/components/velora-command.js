/* Velora Command Center V4: Ctrl/Cmd+K palette with global actions, favourites and history.
   ARIA combobox + listbox. Fuzzy matching ignores accents and case, and highlights the match.
   Favourites: Shift+Enter on the active row (or click the star). */
(function (g) {
  'use strict';
  const V = g.Velora;
  const hasDOM = typeof document !== 'undefined';

  /* ---------- Pure matching (unit-tested) ---------- */
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function score(query, text) {
    const q = norm(query).trim(), t = norm(text);
    if (!q) return { score: 1, indices: [] };
    const direct = t.indexOf(q);
    if (direct >= 0) {
      const wordStart = direct === 0 || /[\s\-_/.]/.test(t[direct - 1]);
      return { score: 100 - direct + (wordStart ? 40 : 0) + (direct === 0 ? 30 : 0), indices: Array.from({ length: q.length }, (_, i) => direct + i) };
    }
    /* Fuzzy: every character must start a word or continue the previous match (initials, word prefixes). */
    const isStart = i => i === 0 || /[\s\-_/.'’]/.test(t[i - 1]);
    let s = 0, prev = -1; const idx = [];
    for (const ch of q.replace(/\s+/g, '')) {
      let found = -1;
      if (prev >= 0 && t[prev + 1] === ch) found = prev + 1;
      else for (let i = prev + 1; i < t.length; i++) if (t[i] === ch && isStart(i)) { found = i; break; }
      if (found < 0) return null;
      s += found === prev + 1 ? 6 : 9;
      idx.push(found); prev = found;
    }
    return { score: s - (t.length - q.length) * .05, indices: idx };
  }
  function rank(query, items) {
    return items.map(it => {
      const m = score(query, it.label);
      const k = it.keywords ? score(query, it.keywords + ' ' + (it.group || '')) : score(query, it.group || '');
      const best = m ? m : k ? { score: k.score * .5, indices: [] } : null;
      return best ? { item: it, score: best.score + (it.boost || 0), indices: best.indices } : null;
    }).filter(Boolean).sort((a, b) => b.score - a.score);
  }
  function highlight(text, indices) {
    const set = new Set(indices);
    let out = '', open = false;
    [...String(text)].forEach((c, i) => {
      if (set.has(i) && !open) { out += '<mark>'; open = true; }
      if (!set.has(i) && open) { out += '</mark>'; open = false; }
      out += V.esc(c);
    });
    return out + (open ? '</mark>' : '');
  }

  const registry = new Map();
  const providers = [];
  const appKey = () => (V.current && V.current.app.id) || 'global';
  const getList = k => V.store.get(appKey() + '.command.' + k, []);
  const setList = (k, v) => V.store.set(appKey() + '.command.' + k, v);

  let open = null;
  function show(initial) {
    if (open) { open.input.focus(); return; }
    const { h, icon, ui, motion: M } = V;
    const listId = V.uid('cmd-list');
    const root = h('div.vl-layer.vl-layer--top');
    const scrim = h('div.vl-scrim');
    const panel = h('div.vl-command', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Command Center' });
    const input = h('input.vl-command__input', { type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': listId, 'aria-autocomplete': 'list', 'aria-label': 'Rechercher une action, une page ou un élément', placeholder: 'Rechercher une action, une page, un élément…', autocomplete: 'off', spellcheck: 'false' });
    const list = h('div.vl-command__list', { id: listId, role: 'listbox', 'aria-label': 'Résultats' });
    const foot = h('div.vl-command__foot', { html: '<span><kbd class="vl-kbd">↑</kbd><kbd class="vl-kbd">↓</kbd> naviguer</span><span><kbd class="vl-kbd">Entrée</kbd> exécuter</span><span><kbd class="vl-kbd">Maj</kbd>+<kbd class="vl-kbd">Entrée</kbd> favori</span><span><kbd class="vl-kbd">Échap</kbd> fermer</span>' });
    panel.append(h('div.vl-command__bar', { html: icon('search') }, input), list, foot);
    root.append(scrim, panel);
    document.body.append(root);
    let rows = [], active = 0;

    function build(query) {
      const favs = getList('favorites'), hist = getList('history');
      const all = Array.from(registry.values());
      const dynamic = query.trim().length >= 2 ? providers.flatMap(p => { try { return p(query) || []; } catch (e) { return []; } }) : [];
      const groups = [];
      if (!query.trim()) {
        const f = favs.map(id => registry.get(id)).filter(Boolean);
        if (f.length) groups.push(['Favoris', f.map(it => ({ item: it, indices: [] }))]);
        const r = hist.filter(id => !favs.includes(id)).map(id => registry.get(id)).filter(Boolean).slice(0, 5);
        if (r.length) groups.push(['Récents', r.map(it => ({ item: it, indices: [] }))]);
        const seen = new Set([...f, ...r]);
        const byGroup = {};
        all.filter(it => !seen.has(it)).forEach(it => { (byGroup[it.group || 'Actions'] = byGroup[it.group || 'Actions'] || []).push({ item: it, indices: [] }); });
        Object.entries(byGroup).forEach(([gname, items]) => groups.push([gname, items]));
      } else {
        const ranked = rank(query, all.concat(dynamic.map(d => ({ ...d, dynamic: true, boost: (d.boost || 0) + 5 })))).slice(0, 40);
        const byGroup = {};
        ranked.forEach(r => { const gname = r.item.group || 'Actions'; (byGroup[gname] = byGroup[gname] || []).push(r); });
        Object.entries(byGroup).forEach(([gname, items]) => groups.push([gname, items]));
      }
      list.innerHTML = ''; rows = [];
      if (!groups.length) {
        list.append(h('div.vl-command__empty', null, h('b', { text: 'Aucun résultat pour « ' + query + ' »' }), h('span', { text: 'Essayez un autre mot, par exemple le nom d’une section ou d’un élément.' })));
        input.removeAttribute('aria-activedescendant');
        return;
      }
      groups.forEach(([gname, items]) => {
        const hid = V.uid('cmd-g');
        const grp = h('div.vl-command__group', { role: 'group', 'aria-labelledby': hid }, h('div.vl-command__heading', { id: hid, text: gname }));
        items.forEach(({ item, indices }) => {
          const fav = favs.includes(item.id);
          const opt = h('div.vl-command__option', { role: 'option', id: V.uid('cmd-o'), 'aria-selected': 'false', 'aria-label': item.label + (item.sub ? ', ' + item.sub : '') + (fav ? ', favori' : '') },
            h('span.vl-command__icon', { html: icon(item.icon || 'chevR') }),
            h('span.vl-command__label', null, h('span', { html: highlight(item.label, indices) }), item.sub ? h('small', { text: item.sub }) : null),
            item.hint ? h('kbd.vl-kbd', { text: item.hint }) : null,
            item.dynamic ? null : h('span.vl-command__star', { 'aria-hidden': 'true', 'data-on': String(fav), title: fav ? 'Retirer des favoris' : 'Ajouter aux favoris', html: icon('star') }));
          opt.addEventListener('click', e => { if (e.target.closest('.vl-command__star')) { toggleFav(item); return; } run(item); });
          opt.addEventListener('pointermove', () => { const i = rows.indexOf(rowRef); if (i !== active) setActive(i, false); });
          const rowRef = { el: opt, item };
          rows.push(rowRef);
          grp.append(opt);
        });
        list.append(grp);
      });
      setActive(0, true);
    }
    function setActive(i, scroll) {
      if (!rows.length) return;
      active = (i + rows.length) % rows.length;
      rows.forEach((r, k) => r.el.setAttribute('aria-selected', String(k === active)));
      input.setAttribute('aria-activedescendant', rows[active].el.id);
      if (scroll) rows[active].el.scrollIntoView({ block: 'nearest' });
    }
    function toggleFav(item) {
      if (item.dynamic) return;
      const favs = getList('favorites');
      const on = favs.includes(item.id);
      setList('favorites', on ? favs.filter(x => x !== item.id) : [item.id, ...favs].slice(0, 12));
      V.announce(on ? item.label + ' retiré des favoris' : item.label + ' ajouté aux favoris');
      const keep = active; build(input.value); setActive(keep, true);
    }
    function run(item) {
      if (!item.dynamic) setList('history', [item.id, ...getList('history').filter(x => x !== item.id)].slice(0, 8));
      close(false);
      setTimeout(() => { try { item.run(); } catch (e) { console.error(e); ui.toast('Action impossible : ' + e.message, { tone: 'crit' }); } }, 10);
    }
    input.addEventListener('input', () => build(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1, true); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1, true); }
      else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); setActive(0, true); }
      else if (e.key === 'End' && e.ctrlKey) { e.preventDefault(); setActive(rows.length - 1, true); }
      else if (e.key === 'Enter') { e.preventDefault(); const r = rows[active]; if (!r) return; if (e.shiftKey) toggleFav(r.item); else run(r.item); }
    });
    scrim.addEventListener('click', () => close());
    const layer = ui.layers.push({ root, modal: true, close: () => close() });
    function close(restore) {
      if (!open) return;
      open = null;
      ui.layers.pop(layer, restore !== false);
      M.play(scrim, [{ opacity: 1 }, { opacity: 0 }], { duration: 'exit', fill: 'forwards' });
      M.finished(M.play(panel, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px) scale(.985)' }], { duration: 'exit', fill: 'forwards' })).then(() => root.remove());
    }
    open = { input, close };
    M.play(scrim, [{ opacity: 0 }, { opacity: 1 }], { duration: 'fast' });
    M.play(panel, [{ opacity: 0, transform: 'translateY(-10px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 'control', easing: M.ease('out') });
    input.value = initial || '';
    build(input.value);
    requestAnimationFrame(() => input.focus());
  }

  V.command = {
    score, rank, highlight, norm,
    register(cmd) { if (cmd && cmd.id && typeof cmd.run === 'function') registry.set(cmd.id, cmd); return () => registry.delete(cmd.id); },
    unregister: id => registry.delete(id),
    provider(fn) { providers.push(fn); },
    list: () => Array.from(registry.values()),
    open: q => hasDOM && show(q),
    close: () => open && open.close(),
    toggle: () => open ? open.close() : show(),
    get isOpen() { return !!open; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
