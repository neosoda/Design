/* Velora Kanban V4: the V3 drag grammar as a reusable component.
   Pointer: lifted card tilts with speed, neighbours make room (FLIP), target column gets a fine dark outline.
   Touch: long press. Keyboard: Space picks up, arrows move, Space drops, Escape cancels.
   Card colour = the column's stage, never the priority. */
(function (g) {
  'use strict';
  const V = g.Velora;
  function kanban(container, o) {
    const { h, icon, esc, ui, motion: M } = V;
    const board = h('div.vl-kanban', { role: 'list', 'aria-label': o.label || 'Tableau kanban' });
    const zones = o.zones ? h('div.vl-kzones') : null;
    container.append(board);
    if (zones) container.append(zones);
    const colEls = {};
    const key = it => String(it[o.key || 'id']);
    const itemsIn = cid => o.items.filter(it => o.colOf(it) === cid).sort((a, b) => (a._order ?? 0) - (b._order ?? 0));
    const tone = cid => (o.columns.find(c => c.id === cid) || {}).tone || 'yellow';

    function cardEl(it) {
      const el = h('div', { class: 'vl-tile vl-tile--' + tone(o.colOf(it)) + ' vl-kcard', tabindex: '0', role: 'button', 'aria-roledescription': 'carte déplaçable', 'aria-describedby': helpId, dataset: { key: key(it) } });
      el.innerHTML = o.card(it);
      el.addEventListener('click', e => { if (grab || e.target.closest('[data-stop]')) return; o.onOpen && o.onOpen(it, el); });
      el.addEventListener('keydown', e => onKey(e, it, el));
      M.drag(el, {
        ignore: '[data-stop]',
        onStart: () => { before = snapshot(); el.classList.add('is-placeholder'); },
        onMove: ({ x, y }) => hover(el, x, y),
        autoScroll: (x, y) => { const r = board.getBoundingClientRect(); if (x < r.left + 50) board.scrollLeft -= 14; else if (x > r.right - 50) board.scrollLeft += 14; if (y < 50) scrollBy(0, -10); else if (y > innerHeight - 50) scrollBy(0, 10); },
        onDrop: ({ cancelled }) => {
          el.classList.remove('is-placeholder');
          clearOver();
          if (cancelled) { restore(); return null; }
          if (zoneHit) { const z = zoneHit; zoneHit = null; dropZone(it, el, z); return null; }
          return el;
        },
        onEnd: () => finishMove(it, el)
      });
      return el;
    }
    const helpId = V.uid('khelp');
    container.append(h('p.vl-sr', { id: helpId, text: 'Entrée pour ouvrir. Espace pour saisir la carte, puis flèches pour la déplacer, Espace pour la déposer, Échap pour annuler.' }));

    function colTotal(cid) { return o.total ? o.total(itemsIn(cid)) : ''; }
    function renderColumn(c) {
      const list = h('div.vl-kcol__list', { role: 'group', 'aria-label': 'Cartes ' + c.label });
      const count = h('span.vl-kcol__count.vl-num');
      const total = h('div.vl-kcol__total.vl-num');
      const head = h('header.vl-kcol__head', null, h('i.vl-kcol__dot', { 'data-tone': c.tone, 'aria-hidden': 'true' }), h('h3', { text: c.label }), count, h('span.vl-grow'),
        o.onCreate ? h('button.vl-icon-btn.vl-icon-btn--sm.vl-icon-btn--ghost', { type: 'button', 'aria-label': `Ajouter dans ${c.label}`, html: icon('plus'), onclick: () => o.onCreate(c.id) }) : null);
      const col = h('section.vl-kcol', { role: 'listitem', dataset: { col: c.id } }, head, total, list);
      colEls[c.id] = { col, list, count, total };
      board.append(col);
    }
    function fillColumns(animate) {
      const prev = Array.from(board.querySelectorAll('.vl-kcard'));
      const existing = new Map(prev.map(e => [e.dataset.key, e]));
      const mutate = () => o.columns.forEach(c => {
        const ce = colEls[c.id]; const items = itemsIn(c.id);
        ce.list.innerHTML = '';
        items.forEach(it => { let el = existing.get(key(it)); if (el) { el.innerHTML = o.card(it); el.className = 'vl-tile vl-tile--' + tone(c.id) + ' vl-kcard'; } else el = cardEl(it); ce.list.append(el); });
        if (!items.length) ce.list.append(h('p.vl-kcol__empty', { text: o.emptyColumn || 'Déposez une carte ici' }));
      });
      if (animate) M.flip(prev, mutate); else mutate();
      counts();
    }
    function counts() {
      o.columns.forEach(c => { const n = itemsIn(c.id).length; colEls[c.id].count.textContent = String(n); colEls[c.id].count.setAttribute('aria-label', n + ' carte' + (n > 1 ? 's' : '')); colEls[c.id].total.textContent = colTotal(c.id); });
    }
    o.columns.forEach(renderColumn);
    if (zones) o.zones.forEach(z => zones.append(h('div.vl-kzone', { dataset: { zone: z.id, tone: z.tone || '' }, html: icon(z.icon || 'check') + `<span>${esc(z.label)}</span><b class="vl-num" data-zone-count></b>` })));
    fillColumns(false);
    paintZones();
    function paintZones() { if (!zones) return; o.zones.forEach(z => { const el = zones.querySelector(`[data-zone="${z.id}"] [data-zone-count]`); if (el) el.textContent = z.count ? z.count() : ''; }); }

    /* ---------- Pointer move: placeholder follows, neighbours FLIP ---------- */
    let before = null, zoneHit = null;
    const snapshot = () => o.items.map(it => [key(it), o.colOf(it), it._order]);
    function clearOver() { board.querySelectorAll('.vl-kcol.is-over').forEach(c => c.classList.remove('is-over')); zones && zones.querySelectorAll('.is-over').forEach(z => z.classList.remove('is-over')); }
    function hover(el, x, y) {
      const under = document.elementsFromPoint(x, y);
      const zone = under.map(n => n.closest && n.closest('.vl-kzone')).find(Boolean);
      clearOver();
      if (zone) { zone.classList.add('is-over'); zoneHit = zone.dataset.zone; return; }
      zoneHit = null;
      const col = under.map(n => n.closest && n.closest('.vl-kcol')).find(Boolean);
      if (!col) return;
      col.classList.add('is-over');
      const list = col.querySelector('.vl-kcol__list');
      const cards = Array.from(list.querySelectorAll('.vl-kcard')).filter(c => c !== el);
      const ref = cards.find(c => { const r = c.getBoundingClientRect(); return y < r.top + r.height / 2; }) || null;
      if (el.parentNode === list && (el.nextElementSibling === ref || (ref === null && !el.nextElementSibling))) return;
      const affected = Array.from(board.querySelectorAll('.vl-kcard')).filter(c => c !== el);
      M.flip(affected, () => { const empty = list.querySelector('.vl-kcol__empty'); if (empty) empty.remove(); list.insertBefore(el, ref); });
    }
    function readDOM() {
      const pos = {};
      o.columns.forEach(c => Array.from(colEls[c.id].list.querySelectorAll('.vl-kcard')).forEach((el, i) => { pos[el.dataset.key] = [c.id, i]; }));
      return pos;
    }
    function applyPositions(pos, moved) {
      o.items.forEach(it => { const p = pos[key(it)]; if (p) { const from = o.colOf(it); it._order = p[1]; if (from !== p[0]) o.setCol(it, p[0], from); } });
      fillColumns(false); paintZones();
      if (moved) { const el = board.querySelector(`[data-key="${CSS.escape(key(moved))}"]`); if (el) M.flash(el); }
    }
    function restore() { const snap = before; if (!snap) return; snap.forEach(([k, c, ord]) => { const it = o.items.find(x => key(x) === k); if (!it) return; it._order = ord; if (o.colOf(it) !== c) o.setCol(it, c, o.colOf(it)); }); fillColumns(true); paintZones(); }
    function finishMove(it, el) {
      if (!before) return;
      const snap = before; before = null;
      if (!el.isConnected) return;
      const from = snap.find(s => s[0] === key(it))[1];
      applyPositions(readDOM(), it);
      const to = o.colOf(it);
      const label = o.title ? o.title(it) : key(it);
      if (from !== to) {
        const colName = id => (o.columns.find(c => c.id === id) || {}).label || id;
        V.activity && V.activity.log({ title: `${label} déplacé`, detail: `${colName(from)} → ${colName(to)}`, icon: 'board', undo: () => { before = snap; restore(); before = null; } });
        ui.toast(`${label} : ${colName(to)}`, { action: { label: 'Annuler', run: () => { before = snap; restore(); before = null; } } });
        V.announce(`${label} déplacé dans ${colName(to)}`);
        o.onMoved && o.onMoved(it, from, to);
      }
    }
    async function dropZone(it, el, zid) {
      const z = o.zones.find(x => x.id === zid);
      const snap = before; before = null;
      const zr = zones.querySelector(`[data-zone="${zid}"]`).getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (!M.reduced()) await M.finished(el.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${zr.left + zr.width / 2 - r.left - r.width / 2}px, ${zr.top + zr.height / 2 - r.top - r.height / 2}px) scale(.15)`, opacity: 0 }], { duration: 430, easing: M.ease('in-out'), fill: 'forwards' }));
      const from = o.colOf(it);
      o.onZone(it, zid, from);
      fillColumns(true); paintZones();
      const label = o.title ? o.title(it) : key(it);
      const undo = () => { o.onZoneUndo ? o.onZoneUndo(it, zid, from) : o.setCol(it, from, zid); before = snap; restore(); before = null; };
      V.activity && V.activity.log({ title: `${label} : ${z.label}`, icon: z.icon || 'check', undo });
      ui.toast(`${label} : ${z.label}`, { action: { label: 'Annuler', run: undo } });
    }

    /* ---------- Keyboard grab ---------- */
    let grab = null;
    function onKey(e, it, el) {
      if (!grab) {
        if (e.key === 'Enter') { e.preventDefault(); o.onOpen && o.onOpen(it, el); }
        else if (e.key === ' ') { e.preventDefault(); grab = { it, el, snap: snapshot() }; el.classList.add('is-grabbed'); el.setAttribute('aria-pressed', 'true'); V.announce('Carte saisie. Flèches pour déplacer, Espace pour déposer, Échap pour annuler.', true); }
        return;
      }
      if (grab.el !== el) return;
      const list = el.parentNode, col = list.closest('.vl-kcol');
      const ci = o.columns.findIndex(c => c.id === col.dataset.col);
      const sib = Array.from(list.querySelectorAll('.vl-kcard'));
      const i = sib.indexOf(el);
      const affected = Array.from(board.querySelectorAll('.vl-kcard'));
      if (e.key === 'ArrowUp' && i > 0) { e.preventDefault(); M.flip(affected, () => list.insertBefore(el, sib[i - 1])); el.focus(); V.announce(`Position ${i} dans ${o.columns[ci].label}`); }
      else if (e.key === 'ArrowDown' && i < sib.length - 1) { e.preventDefault(); M.flip(affected, () => list.insertBefore(el, sib[i + 1].nextElementSibling)); el.focus(); V.announce(`Position ${i + 2} dans ${o.columns[ci].label}`); }
      else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const ni = ci + (e.key === 'ArrowRight' ? 1 : -1);
        if (ni < 0 || ni >= o.columns.length) return;
        const target = colEls[o.columns[ni].id].list;
        const tc = Array.from(target.querySelectorAll('.vl-kcard'));
        M.flip(affected, () => { const empty = target.querySelector('.vl-kcol__empty'); if (empty) empty.remove(); target.insertBefore(el, tc[Math.min(i, tc.length)] || null); });
        el.className = 'vl-tile vl-tile--' + o.columns[ni].tone + ' vl-kcard is-grabbed';
        el.focus(); el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        V.announce(`Colonne ${o.columns[ni].label}`);
      }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); const g2 = grab; grab = null; el.classList.remove('is-grabbed'); el.removeAttribute('aria-pressed'); before = g2.snap; finishMove(it, el); const again = board.querySelector(`[data-key="${CSS.escape(key(it))}"]`); again && again.focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); const g2 = grab; grab = null; before = g2.snap; restore(); before = null; V.announce('Déplacement annulé'); const again = board.querySelector(`[data-key="${CSS.escape(key(it))}"]`); again && again.focus(); }
    }

    return {
      el: board,
      refresh(animate) { fillColumns(animate !== false); paintZones(); },
      cardOf: it => board.querySelector(`[data-key="${CSS.escape(key(it))}"]`)
    };
  }
  V.kanban = kanban;
})(window);
