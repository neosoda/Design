/* Velora Activity Center V4: notifications, events and the user's own action history.
   Persisted per app (read state, history). Undo is kept in memory for the session only. */
(function (g) {
  'use strict';
  const V = g.Velora, { h, icon, esc, ui, fmt } = V;
  let cfg = null, seedMap = new Map(), badge = null, panel = null;
  const undoers = new Map();
  const key = k => cfg.app + '.activity.' + k;
  const load = () => ({
    read: new Set(V.store.get(key('read'), [])),
    dismissed: new Set(V.store.get(key('dismissed'), [])),
    custom: V.store.get(key('custom'), []),
    history: V.store.get(key('history'), [])
  });
  let S = null;
  const save = () => {
    V.store.set(key('read'), [...S.read]); V.store.set(key('dismissed'), [...S.dismissed]);
    V.store.set(key('custom'), S.custom.slice(0, 40)); V.store.set(key('history'), S.history.slice(0, 60));
  };
  const notifications = () => [...S.custom, ...[...seedMap.values()]].filter(n => !S.dismissed.has(n.id)).sort((a, b) => new Date(b.time) - new Date(a.time));
  const unread = () => notifications().filter(n => !S.read.has(n.id)).length;

  function refreshBadge() {
    if (!badge) return;
    const n = unread();
    const b = badge.querySelector('.vl-badge-count');
    if (b) b.textContent = n ? String(n > 9 ? '9+' : n) : '';
    badge.setAttribute('aria-label', n ? `Centre d’activité, ${n} non lue${n > 1 ? 's' : ''}` : 'Centre d’activité');
  }

  function init(o) {
    cfg = o; badge = o.badge; S = load();
    seedMap = new Map((o.seed || []).map(n => [n.id, n]));
    refreshBadge();
  }
  function notify(n) {
    const item = { id: n.id || V.uid('n') + Date.now().toString(36), time: n.time || new Date().toISOString(), ...n };
    S.custom.unshift({ id: item.id, title: item.title, body: item.body, tone: item.tone, icon: item.icon, time: item.time, kind: item.kind || 'event' });
    if (n.actions) seedMap.set(item.id, item);
    save(); refreshBadge(); render();
    return item.id;
  }
  /* Every reversible change goes through log(): it shows in "Historique" with an Undo button. */
  function log(entry) {
    if (!S) return;
    const item = { id: V.uid('h') + Date.now().toString(36), time: new Date().toISOString(), title: entry.title, detail: entry.detail || '', icon: entry.icon || 'history' };
    S.history.unshift(item);
    if (entry.undo) undoers.set(item.id, entry.undo);
    save(); render();
    return item.id;
  }
  const dayLabel = d => {
    const t = new Date(d), now = new Date();
    const diff = Math.floor((new Date(now.toDateString()) - new Date(t.toDateString())) / 864e5);
    return diff === 0 ? 'Aujourd’hui' : diff === 1 ? 'Hier' : fmt.date(t);
  };

  let tab = 'notifications', onlyUnread = false;
  function body() {
    const wrap = h('div.vl-activity');
    const tablist = h('div.vl-activity__tabs', { role: 'tablist', 'aria-label': 'Contenu du centre d’activité' });
    [['notifications', 'Notifications'], ['history', 'Mes actions']].forEach(([v, l]) => tablist.append(h('button.vl-activity__tab', { type: 'button', role: 'tab', id: 'vl-act-tab-' + v, 'aria-controls': 'vl-act-panel', 'aria-selected': String(tab === v), tabindex: tab === v ? '0' : '-1', dataset: { value: v }, text: l })));
    const panelEl = h('div', { id: 'vl-act-panel', role: 'tabpanel', 'aria-labelledby': 'vl-act-tab-' + tab });
    ui.tabs(tablist, v => { tab = v; render(true); });
    wrap.append(tablist, panelEl);

    if (tab === 'notifications') {
      const list = notifications().filter(n => !onlyUnread || !S.read.has(n.id));
      const n = unread();
      const bar = h('div.vl-activity__bar', null,
        h('button.vl-chip', { type: 'button', 'aria-pressed': String(onlyUnread), text: `Non lues (${n})`, onclick: () => { onlyUnread = !onlyUnread; render(true); } }),
        h('span.vl-grow'),
        h('button.vl-btn.vl-btn--ghost.vl-btn--sm', { type: 'button', disabled: !n, text: 'Tout marquer comme lu', onclick: () => { notifications().forEach(x => S.read.add(x.id)); save(); refreshBadge(); render(true); V.announce('Toutes les notifications sont lues'); } }));
      panelEl.append(bar);
      if (!list.length) panelEl.append(ui.state.empty({ title: onlyUnread ? 'Tout est lu' : 'Aucune notification', text: onlyUnread ? 'Les nouvelles alertes et mentions apparaîtront ici.' : 'Les événements de ' + (V.current ? V.current.app.name : 'l’application') + ' apparaîtront ici.' }));
      let day = null, ul = null;
      list.forEach(nf => {
        const d = dayLabel(nf.time);
        if (d !== day) { day = d; panelEl.append(h('h3.vl-activity__day', { text: d })); ul = h('ul.vl-feed'); panelEl.append(ul); }
        const isRead = S.read.has(nf.id);
        const li = h('li.vl-feed__item' + (isRead ? '' : '.is-unread'), { dataset: { id: nf.id } },
          h('span.vl-feed__icon', { 'data-tone': nf.tone || 'info', html: icon(nf.icon || (nf.tone === 'crit' ? 'alert' : 'bell')) }),
          h('div.vl-feed__main', null,
            h('div.vl-feed__title', null, h('b', { text: nf.title }), isRead ? null : h('span.vl-sr', { text: ' (non lue)' })),
            nf.body ? h('p.vl-feed__body', { text: nf.body }) : null,
            h('div.vl-feed__meta', null, h('time', { datetime: nf.time, text: fmt.relative(nf.time) + ' · ' + fmt.time(nf.time) })),
            h('div.vl-feed__actions', null,
              ...((seedMap.get(nf.id) || {}).actions || []).map(a => h('button.vl-btn.vl-btn--sm' + (a.primary ? '.vl-btn--strong' : ''), { type: 'button', text: a.label, onclick: () => { S.read.add(nf.id); save(); refreshBadge(); close(); a.run(); } })),
              h('button.vl-btn.vl-btn--sm.vl-btn--ghost', { type: 'button', text: isRead ? 'Marquer non lue' : 'Marquer comme lue', onclick: () => { isRead ? S.read.delete(nf.id) : S.read.add(nf.id); save(); refreshBadge(); render(true); } }),
              h('button.vl-icon-btn.vl-icon-btn--sm.vl-icon-btn--ghost', { type: 'button', 'aria-label': 'Supprimer la notification « ' + nf.title + ' »', html: icon('x'), onclick: () => { S.dismissed.add(nf.id); save(); refreshBadge(); render(true); ui.toast('Notification supprimée', { action: { label: 'Annuler', run: () => { S.dismissed.delete(nf.id); save(); refreshBadge(); render(true); } } }); } }))));
        ul.append(li);
      });
    } else {
      const items = S.history;
      if (!items.length) panelEl.append(ui.state.empty({ title: 'Aucune action pour le moment', text: 'Vos modifications (édition, déplacement, création) sont listées ici et peuvent être annulées pendant la session.' }));
      else panelEl.append(h('div.vl-activity__bar', null, h('span.vl-caption', { text: items.length + ' action' + (items.length > 1 ? 's' : '') + ' enregistrée' + (items.length > 1 ? 's' : '') + ' sur cet appareil' }), h('span.vl-grow'), h('button.vl-btn.vl-btn--ghost.vl-btn--sm', { type: 'button', text: 'Effacer l’historique', onclick: () => { S.history = []; undoers.clear(); save(); render(true); } })));
      let day = null, ul = null;
      items.forEach(it => {
        const d = dayLabel(it.time);
        if (d !== day) { day = d; panelEl.append(h('h3.vl-activity__day', { text: d })); ul = h('ul.vl-feed'); panelEl.append(ul); }
        const undo = undoers.get(it.id);
        ul.append(h('li.vl-feed__item', null,
          h('span.vl-feed__icon', { 'data-tone': 'idle', html: icon(it.icon) }),
          h('div.vl-feed__main', null, h('div.vl-feed__title', null, h('b', { text: it.title })), it.detail ? h('p.vl-feed__body', { text: it.detail }) : null,
            h('div.vl-feed__meta', null, h('time', { datetime: it.time, text: fmt.relative(it.time) + ' · ' + fmt.time(it.time) })),
            undo ? h('div.vl-feed__actions', null, h('button.vl-btn.vl-btn--sm', { type: 'button', html: icon('undo') + 'Annuler cette action', onclick: () => { undoers.delete(it.id); S.history = S.history.filter(x => x.id !== it.id); save(); try { undo(); } catch (e) { console.error(e); } ui.toast('Action annulée'); render(true); } })) : null)));
      });
    }
    return wrap;
  }
  function render(keepFocus) {
    if (!panel) return;
    const focusedTab = keepFocus && document.activeElement && document.activeElement.closest('.vl-activity__tab') ? tab : null;
    panel.body.innerHTML = '';
    panel.body.append(body());
    if (focusedTab) { const t = panel.body.querySelector(`[data-value="${focusedTab}"]`); t && t.focus(); }
  }
  function open(which) {
    if (which) tab = which;
    if (panel) { panel.close(); return; }
    panel = ui.sheetOnce('side', { title: 'Centre d’activité', eyebrow: V.current ? V.current.app.name : '', modal: 'auto', body: body(), onClose: () => { panel = null; }, opener: badge });
  }
  function close() { if (panel) panel.close(); }

  V.activity = { init, notify, log, open, close, unread: () => (S ? unread() : 0), get history() { return S ? S.history : []; } };
})(window);
