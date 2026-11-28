/* Velora Components V4: layers (dialog, sheet, menu), toast, confirm, states, segmented, tabs.
   Layer rules: Escape closes the top layer, modal layers make everything behind them inert,
   focus returns to the element that opened the layer. */
(function (g) {
  'use strict';
  const V = g.Velora, { h, $, $$, esc, icon, motion: M } = V;

  /* ---------- Layer stack ---------- */
  const layers = [];
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function syncInert() {
    let top = -1;
    layers.forEach((l, i) => { if (l.modal) top = i; });
    const keep = new Set(layers.slice(Math.max(top, 0)).map(l => l.root));
    Array.from(document.body.children).forEach(el => {
      if (el.matches('script,.vl-sr,.vl-toasts,.vl-drag-ghost')) return;
      const inLayer = layers.some(l => l.root === el);
      el.inert = top >= 0 && !keep.has(el) && (!inLayer || layers.findIndex(l => l.root === el) < top);
    });
    document.documentElement.classList.toggle('vl-modal-open', top >= 0);
  }
  function pushLayer(layer) {
    layer.opener = layer.opener || document.activeElement;
    layers.push(layer);
    syncInert();
    return layer;
  }
  function popLayer(layer, restoreFocus) {
    const i = layers.indexOf(layer);
    if (i < 0) return false;
    layers.splice(i, 1);
    syncInert();
    if (restoreFocus !== false && layer.opener && layer.opener.isConnected && document.contains(layer.opener)) {
      try { layer.opener.focus({ preventScroll: true }); } catch (e) { /* element gone */ }
    }
    return true;
  }
  const topLayer = () => layers[layers.length - 1];
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const l = topLayer();
    if (l && l.close) { e.preventDefault(); l.close(); }
  });
  function focusFirst(root) {
    const target = root.querySelector('[autofocus]') || root.querySelector('[data-vl-initial-focus]') || root.querySelector(FOCUSABLE) || root;
    if (target === root && !root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
    requestAnimationFrame(() => { try { target.focus({ preventScroll: true }); } catch (e) { /* noop */ } });
  }
  function fill(el, content) {
    if (content == null) return;
    if (typeof content === 'function') content(el);
    else if (typeof content === 'string') el.innerHTML = content;
    else el.append(content);
  }

  /* ---------- Dialog (centered, modal). With a source element it morphs from it (card to window). ---------- */
  function dialog(o) {
    const titleId = V.uid('dlg');
    const root = h('div.vl-layer.vl-layer--center');
    const scrim = h('div.vl-scrim');
    const panel = h('div.vl-dialog' + (o.size ? '.vl-dialog--' + o.size : ''), { class: o.className || null, role: o.role || 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId });
    const content = h('div.vl-dialog__content', { 'data-vl-morph-content': '' });
    const head = h('div.vl-dialog__head', null,
      h('div.vl-grow', null, o.eyebrow ? h('div.vl-dialog__eyebrow', { text: o.eyebrow }) : null, h('h2.vl-dialog__title', { id: titleId, text: o.title || '' })),
      h('button.vl-icon-btn.vl-icon-btn--sm.vl-icon-btn--ghost', { type: 'button', 'aria-label': 'Fermer', html: icon('x'), onclick: () => api.close() }));
    const body = h('div.vl-dialog__body');
    content.append(head, body);
    fill(body, o.body);
    if (o.actions && o.actions.length) {
      const foot = h('div.vl-dialog__foot', { 'data-vl-morph-reveal': '' });
      o.actions.forEach(a => foot.append(h('button.vl-btn' + (a.variant ? '.vl-btn--' + a.variant : ''), { type: a.type || 'button', disabled: a.disabled, onclick: () => a.run && a.run(api), html: (a.icon ? icon(a.icon) : '') + esc(a.label) })));
      content.append(foot);
    }
    if (o.footer) content.append(o.footer);
    panel.append(content);
    root.append(scrim, panel);
    document.body.append(root);
    let closing = false;
    const api = {
      el: panel, body, root,
      setTitle(t) { $('#' + titleId).textContent = t; },
      async close(result) {
        if (closing) return; closing = true;
        o.onClose && o.onClose(result);
        popLayer(layer);
        M.play(scrim, [{ opacity: 1 }, { opacity: 0 }], { duration: 'exit', fill: 'forwards' }, 'scrim');
        if (o.source && o.source.isConnected) await M.morphClose(o.source, panel);
        else await M.finished(M.play(panel, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px) scale(.98)' }], { duration: 'exit', easing: M.ease('out'), fill: 'forwards' }, 'morph'));
        root.remove();
      }
    };
    scrim.addEventListener('click', () => api.close());
    const layer = pushLayer({ root, modal: true, close: () => api.close(), opener: o.opener });
    /* Measure at the final size, then play the morph from the source. */
    const W = Math.min(o.width || (o.size === 'lg' ? 760 : o.size === 'sm' ? 420 : 540), innerWidth - 24);
    content.style.width = W + 'px';
    const H = Math.min(content.scrollHeight + 2, innerHeight - 24);
    Object.assign(panel.style, { left: (innerWidth - W) / 2 + 'px', top: Math.max(12, (innerHeight - H) / 2) + 'px', width: W + 'px', height: H + 'px' });
    content.style.width = '';
    M.play(scrim, [{ opacity: 0 }, { opacity: 1 }], { duration: 'fast' }, 'scrim');
    if (o.source) M.morphOpen(o.source, panel, { fromColor: o.fromColor, toColor: o.toColor }).then(() => { panel.style.height = 'auto'; panel.style.maxHeight = (innerHeight - 24) + 'px'; });
    else { M.play(panel, [{ opacity: 0, transform: 'translateY(10px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 'morph', easing: M.ease('sheet') }, 'morph'); panel.style.height = 'auto'; panel.style.maxHeight = (innerHeight - 24) + 'px'; M.reveal(content, '[data-vl-morph-reveal]'); }
    focusFirst(panel);
    return api;
  }

  /* ---------- Sheet (side panel). modal:'auto' docks without a scrim on wide screens so the page stays usable. ---------- */
  function sheet(o) {
    const titleId = V.uid('sheet');
    const wide = () => matchMedia('(min-width: 1180px)').matches;
    const modal = o.modal === 'auto' ? !wide() : o.modal !== false;
    const root = h('div.vl-layer.vl-layer--side' + (modal ? '' : '.is-docked') + (o.className ? '.' + o.className : ''));
    const scrim = modal ? h('div.vl-scrim') : null;
    const panel = h('section.vl-sheet', { role: modal ? 'dialog' : 'complementary', 'aria-modal': modal ? 'true' : null, 'aria-labelledby': titleId, tabindex: '-1' });
    const head = h('header.vl-sheet__head');
    const titleWrap = h('div.vl-grow', null, h('div.vl-sheet__eyebrow', { text: o.eyebrow || '' }), h('h2.vl-sheet__title', { id: titleId, text: o.title || '' }));
    const tools = h('div.vl-sheet__tools');
    (o.tools || []).forEach(t => tools.append(h('button.vl-icon-btn.vl-icon-btn--sm.vl-icon-btn--ghost', { type: 'button', 'aria-label': t.label, 'data-vl-tip': t.label, html: icon(t.icon), disabled: t.disabled, onclick: e => t.run(e, api), dataset: { tool: t.id || t.icon } })));
    tools.append(h('button.vl-icon-btn.vl-icon-btn--sm.vl-icon-btn--ghost', { type: 'button', 'aria-label': 'Fermer le panneau', html: icon('x'), onclick: () => api.close() }));
    head.append(titleWrap, tools);
    const body = h('div.vl-sheet__body');
    const foot = h('footer.vl-sheet__foot');
    panel.append(head, body, foot);
    if (scrim) root.append(scrim);
    root.append(panel);
    document.body.append(root);
    if (!modal) document.documentElement.classList.add('vl-has-docked');
    fill(body, o.body);
    if (o.footer) fill(foot, o.footer); else foot.hidden = true;
    let closing = false;
    const api = {
      el: panel, body, foot, root, modal,
      setTitle(t, eyebrow) { $('#' + titleId).textContent = t; if (eyebrow != null) titleWrap.firstChild.textContent = eyebrow; },
      setFooter(c) { foot.innerHTML = ''; fill(foot, c); foot.hidden = !c; },
      tool: id => tools.querySelector(`[data-tool="${id}"]`),
      async close() {
        if (closing) return; closing = true;
        o.onClose && o.onClose();
        popLayer(layer, o.restoreFocus);
        if (!modal && !$$('.vl-layer--side.is-docked').some(x => x !== root)) document.documentElement.classList.remove('vl-has-docked');
        if (scrim) M.play(scrim, [{ opacity: 1 }, { opacity: 0 }], { duration: 'exit', fill: 'forwards' }, 'scrim');
        await M.finished(M.play(panel, [{ transform: 'none', opacity: 1 }, { transform: 'translateX(40px)', opacity: 0 }], { duration: 'exit', easing: M.ease('out'), fill: 'forwards' }, 'sheet'));
        root.remove();
      }
    };
    if (scrim) scrim.addEventListener('click', () => api.close());
    const layer = pushLayer({ root, modal, close: () => api.close(), opener: o.opener });
    if (scrim) M.play(scrim, [{ opacity: 0 }, { opacity: 1 }], { duration: 'fast' }, 'scrim');
    M.play(panel, [{ transform: 'translateX(48px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 'sheet', easing: M.ease('sheet') }, 'sheet');
    if (o.focus !== false) focusFirst(o.initialFocus === 'panel' ? panel : body.querySelector(FOCUSABLE) ? body : panel);
    return api;
  }
  /* One docked panel per name: reopening swaps content instead of stacking panels. */
  const named = {};
  function sheetOnce(name, o) {
    if (named[name]) { named[name].close(); }
    const s = sheet({ ...o, onClose: () => { if (named[name] === s) delete named[name]; o.onClose && o.onClose(); } });
    named[name] = s;
    return s;
  }

  /* ---------- Menu (popover, ARIA menu with arrow keys) ---------- */
  let openMenu = null;
  function menu(anchor, items, opts) {
    opts = opts || {};
    if (openMenu) { const same = openMenu.anchor === anchor; openMenu.close(); if (same) return null; }
    const id = V.uid('menu');
    const el = h('div.vl-menu', { role: 'menu', id, 'aria-label': opts.label || 'Actions' });
    const buttons = [];
    items.forEach(it => {
      if (it.divider) { el.append(h('div.vl-menu__sep', { role: 'separator' })); return; }
      if (it.heading) { el.append(h('div.vl-menu__heading', { text: it.heading })); return; }
      const role = it.checked != null ? 'menuitemcheckbox' : 'menuitem';
      const b = h('button.vl-menu__item', { type: 'button', role, 'aria-checked': it.checked != null ? String(!!it.checked) : null, disabled: it.disabled, tabindex: '-1' },
        h('span.vl-menu__icon', { html: it.checked != null ? (it.checked ? icon('check') : '') : (it.icon ? icon(it.icon) : '') }),
        h('span.vl-grow', { text: it.label }),
        it.hint ? h('span.vl-menu__hint', { text: it.hint }) : null);
      b.addEventListener('click', () => {
        if (it.keepOpen && it.checked != null) { it.checked = !it.checked; b.setAttribute('aria-checked', String(it.checked)); b.firstChild.innerHTML = it.checked ? icon('check') : ''; it.run && it.run(it.checked); return; }
        api.close(); it.run && it.run(it.checked != null ? !it.checked : undefined);
      });
      buttons.push(b); el.append(b);
    });
    document.body.append(el);
    const r = anchor.getBoundingClientRect();
    const mw = el.offsetWidth, mh = el.offsetHeight;
    let left = opts.align === 'start' ? r.left : r.right - mw;
    left = Math.max(8, Math.min(left, innerWidth - mw - 8));
    let top = r.bottom + 6;
    if (top + mh > innerHeight - 8) top = Math.max(8, r.top - mh - 6);
    Object.assign(el.style, { left: left + 'px', top: top + 'px' });
    anchor.setAttribute('aria-expanded', 'true');
    anchor.setAttribute('aria-controls', id);
    M.play(el, [{ opacity: 0, transform: 'translateY(-4px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 'fast', easing: M.ease('out') });
    const focusAt = i => { const list = buttons.filter(b => !b.disabled); if (!list.length) return; const k = (i + list.length) % list.length; list[k].focus(); };
    el.addEventListener('keydown', e => {
      const list = buttons.filter(b => !b.disabled), i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); focusAt(i + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); focusAt(i - 1); }
      else if (e.key === 'Home') { e.preventDefault(); focusAt(0); }
      else if (e.key === 'End') { e.preventDefault(); focusAt(list.length - 1); }
      else if (e.key === 'Tab') { api.close(false); }
    });
    const outside = e => { if (!el.contains(e.target) && !anchor.contains(e.target)) api.close(false); };
    setTimeout(() => document.addEventListener('pointerdown', outside), 0);
    const api = {
      anchor, el,
      close(restore) {
        if (!el.isConnected) return;
        document.removeEventListener('pointerdown', outside);
        popLayer(layer, false);
        anchor.setAttribute('aria-expanded', 'false');
        el.remove(); openMenu = null;
        if (restore !== false) anchor.focus({ preventScroll: true });
      }
    };
    const layer = pushLayer({ root: el, modal: false, close: () => api.close() });
    openMenu = api;
    focusAt(Math.max(0, buttons.findIndex(b => b.getAttribute('aria-checked') === 'true')));
    return api;
  }

  /* ---------- Toast (polite live region, optional Undo action) ---------- */
  function toast(message, o) {
    o = o || {};
    let wrap = $('.vl-toasts');
    if (!wrap) { wrap = h('div.vl-toasts', { role: 'region', 'aria-label': 'Notifications temporaires' }); document.body.append(wrap); }
    const t = h('div.vl-toast' + (o.tone ? '.vl-toast--' + o.tone : ''), { role: 'status' },
      h('span.vl-toast__icon', { html: icon(o.icon || (o.tone === 'crit' ? 'alert' : 'check')) }),
      h('span.vl-grow', { text: message }));
    if (o.action) t.append(h('button.vl-toast__action', { type: 'button', text: o.action.label, onclick: () => { o.action.run(); dismiss(); } }));
    t.append(h('button.vl-toast__close', { type: 'button', 'aria-label': 'Masquer', html: icon('x'), onclick: () => dismiss() }));
    wrap.append(t);
    while (wrap.children.length > 3) wrap.firstElementChild.remove();
    M.play(t, [{ opacity: 0, transform: 'translateY(12px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 'control', easing: M.ease('spring') });
    let timer = setTimeout(() => dismiss(), o.duration || (o.action ? 6000 : 3200));
    t.addEventListener('pointerenter', () => clearTimeout(timer));
    t.addEventListener('pointerleave', () => { timer = setTimeout(() => dismiss(), 2000); });
    t.addEventListener('focusin', () => clearTimeout(timer));
    async function dismiss() {
      clearTimeout(timer);
      if (!t.isConnected) return;
      await M.finished(M.play(t, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(6px)' }], { duration: 'exit', fill: 'forwards' }));
      t.remove();
    }
    return { dismiss };
  }

  function confirm(o) {
    return new Promise(resolve => {
      let answered = false;
      const d = dialog({
        title: o.title, size: 'sm', role: 'alertdialog',
        body: h('p.vl-muted', { text: o.message || '' }),
        actions: [
          { label: o.cancel || 'Annuler', variant: 'ghost', run: api => { answered = true; resolve(false); api.close(); } },
          { label: o.confirm || 'Confirmer', variant: o.tone === 'danger' ? 'danger' : 'strong', run: api => { answered = true; resolve(true); api.close(); } }
        ],
        onClose: () => { if (!answered) resolve(false); }
      });
      return d;
    });
  }

  /* ---------- States: empty (with the Velora card-stack motif), error, loading ---------- */
  const motif = () => h('div.vl-motif', { 'aria-hidden': 'true' }, h('i.vl-motif__a'), h('i.vl-motif__b'), h('i.vl-motif__c'));
  const state = {
    empty(o) {
      o = o || {};
      return h('div.vl-state.vl-state--empty', { role: 'status' }, o.motif === false ? null : motif(),
        h('h3.vl-state__title', { text: o.title || 'Rien à afficher pour le moment' }),
        o.text ? h('p.vl-state__text', { text: o.text }) : null,
        o.action ? h('button.vl-btn.vl-btn--strong.vl-btn--sm', { type: 'button', onclick: o.action.run, html: (o.action.icon ? icon(o.action.icon) : '') + esc(o.action.label) }) : null);
    },
    error(o) {
      o = o || {};
      return h('div.vl-state.vl-state--error', { role: 'alert' },
        h('span.vl-state__icon', { html: icon('alert') }),
        h('h3.vl-state__title', { text: o.title || 'Chargement impossible' }),
        h('p.vl-state__text', { text: o.text || 'La source de données ne répond pas. Vos réglages sont conservés.' }),
        o.retry ? h('button.vl-btn.vl-btn--sm', { type: 'button', onclick: o.retry, html: icon('refresh') + 'Réessayer' }) : null);
    },
    loading(o) {
      o = o || {};
      const el = h('div.vl-state--loading', { role: 'status', 'aria-live': 'polite', 'aria-busy': 'true' }, h('span.vl-sr', { text: o.label || 'Chargement en cours' }));
      const kind = o.kind || 'lines';
      if (kind === 'chart') el.append(h('span.vl-skeleton.vl-skeleton--title'), h('span.vl-skeleton.vl-skeleton--block', { style: { height: (o.height || 160) + 'px', marginTop: '14px' } }));
      else if (kind === 'figure') el.append(h('span.vl-skeleton.vl-skeleton--line', { style: { width: '40%' } }), h('span.vl-skeleton', { style: { height: '34px', width: '62%', marginTop: '12px' } }), h('span.vl-skeleton.vl-skeleton--line', { style: { width: '80%', marginTop: '14px' } }));
      else for (let i = 0; i < (o.lines || 4); i++) el.append(h('span.vl-skeleton.vl-skeleton--line', { style: { width: (92 - (i * 17) % 40) + '%', marginTop: i ? '12px' : '0' } }));
      return el;
    },
    motif
  };

  /* ---------- Segmented control: buttons with aria-pressed and a sliding knob ---------- */
  function seg(el, onChange) {
    let knob = el.querySelector('.vl-seg__knob');
    if (!knob) { knob = h('span.vl-seg__knob', { 'aria-hidden': 'true' }); el.prepend(knob); }
    const place = () => { const on = el.querySelector('[aria-pressed="true"]'); if (!on) return; knob.style.left = on.offsetLeft + 'px'; knob.style.width = on.offsetWidth + 'px'; };
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || !el.contains(b) || b.getAttribute('aria-pressed') === 'true') return;
      el.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      place(); onChange && onChange(b.dataset.value, b);
    });
    requestAnimationFrame(place);
    if (document.fonts) document.fonts.ready.then(place);
    new ResizeObserver(place).observe(el);
    return { place, set(v) { el.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.value === v))); place(); } };
  }
  const segHTML = (label, options, value) => `<div class="vl-seg" role="group" aria-label="${esc(label)}">${options.map(([v, l]) => `<button type="button" data-value="${esc(v)}" aria-pressed="${String(v) === String(value)}">${esc(l)}</button>`).join('')}</div>`;

  /* ---------- Tabs (ARIA tabs with roving focus) ---------- */
  function tabs(list, onChange) {
    const tabsEls = () => $$('[role="tab"]', list);
    const select = (t, focus) => {
      tabsEls().forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; const p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on; });
      if (focus) t.focus();
      onChange && onChange(t.dataset.value, t);
    };
    list.addEventListener('click', e => { const t = e.target.closest('[role="tab"]'); if (t) select(t); });
    list.addEventListener('keydown', e => {
      const all = tabsEls(), i = all.indexOf(document.activeElement); if (i < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(all[(i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length], true); }
      if (e.key === 'Home') { e.preventDefault(); select(all[0], true); }
      if (e.key === 'End') { e.preventDefault(); select(all[all.length - 1], true); }
    });
    return { select: v => { const t = tabsEls().find(x => x.dataset.value === v); if (t) select(t); } };
  }

  /* Copy helper with honest feedback when the clipboard is blocked. */
  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); toast(label || 'Copié dans le presse-papiers'); return true; }
    catch (e) {
      const ta = h('textarea', { style: { position: 'fixed', opacity: '0' } }); ta.value = text; document.body.append(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove(); toast(ok ? (label || 'Copié dans le presse-papiers') : 'Copie bloquée par le navigateur', { tone: ok ? null : 'crit' }); return ok;
    }
  }
  function download(name, text, type) {
    const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: type || 'text/plain' })), download: name });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  V.ui = { dialog, sheet, sheetOnce, menu, toast, confirm, state, seg, segHTML, tabs, copy, download, layers: { push: pushLayer, pop: popLayer, top: topLayer, list: layers }, focusFirst };
})(window);
