/* Velora Inspector V4: look at and edit one record without leaving the page.
   Docked (non-modal) at 1180 px and wider so the list behind stays usable; modal sheet below.
   j / k (or the arrows in the header) move to the next / previous record. */
(function (g) {
  'use strict';
  const V = g.Velora, { h, icon, esc, ui, motion: M } = V;
  let cur = null;

  function fieldView(f, r) {
    const v = f.display ? f.display(r) : r[f.key];
    if (f.render) { const n = h('dd'); n.innerHTML = f.render(r); return n; }
    if (f.type === 'select' && f.options) { const o = f.options.find(x => (x.value ?? x) === v); return h('dd', { text: o ? (o.label ?? o) : (v ?? '') }); }
    return h('dd', { text: v == null || v === '' ? 'Non renseigné' : String(v), class: v == null || v === '' ? 'vl-muted' : '' });
  }
  function fieldInput(f, r, id) {
    const v = r[f.key] ?? '';
    if (f.type === 'select') {
      const s = h('select.vl-select', { id, name: f.key, required: f.required });
      (f.options || []).forEach(o => { const val = o.value ?? o; s.append(h('option', { value: val, text: o.label ?? o, selected: String(val) === String(v) })); });
      return s;
    }
    if (f.type === 'textarea') { const t = h('textarea.vl-textarea', { id, name: f.key, required: f.required, rows: '4' }); t.value = v; return t; }
    return h('input.vl-input', { id, name: f.key, type: f.type || 'text', value: v, required: f.required, min: f.min, max: f.max, step: f.step, autocomplete: 'off' });
  }

  function open(o) {
    const list = o.list || [o.record];
    let index = Math.max(0, o.index != null ? o.index : list.indexOf(o.record));
    let editing = !!o.edit;
    const record = () => list[index];
    const fields = o.fields.filter(f => !f.hidden);

    function content() {
      const r = record();
      const wrap = h('div.vl-inspector');
      if (o.summary) { const s = h('div.vl-inspector__summary', { 'data-vl-reveal': '' }); const out = o.summary(r); if (typeof out === 'string') s.innerHTML = out; else if (out) s.append(out); wrap.append(s); }
      if (!editing) {
        const dl = h('dl.vl-inspector__fields', { 'data-vl-reveal': '' });
        fields.forEach(f => dl.append(h('div.vl-inspector__field', null, h('dt', { text: f.label }), fieldView(f, r))));
        wrap.append(dl);
      } else {
        const form = h('form.vl-inspector__form', { novalidate: true });
        fields.filter(f => f.type !== 'readonly').forEach(f => {
          const id = V.uid('f');
          const err = h('span.vl-field__error', { id: id + '-err', hidden: true });
          const input = fieldInput(f, r, id);
          input.setAttribute('aria-describedby', id + '-err');
          form.append(h('div.vl-field', null, h('label', { for: id, text: f.label + (f.required ? ' (obligatoire)' : '') }), input, err));
        });
        form.addEventListener('submit', e => { e.preventDefault(); save(form); });
        wrap.append(form);
      }
      if (o.activity) {
        const items = o.activity(r) || [];
        const sec = h('section.vl-inspector__activity', { 'data-vl-reveal': '' }, h('h3', { text: 'Activité' }));
        if (!items.length) sec.append(h('p.vl-caption', { text: 'Aucune activité enregistrée pour cet élément.' }));
        else { const ul = h('ul.vl-timeline'); items.forEach(it => ul.append(h('li', null, h('time', { text: it.when }), h('span', { text: it.text })))); sec.append(ul); }
        wrap.append(sec);
      }
      return wrap;
    }
    function footer() {
      const f = h('div.vl-inspector__foot');
      if (editing) {
        f.append(h('button.vl-btn.vl-btn--ghost', { type: 'button', text: 'Annuler', onclick: () => { editing = false; paint(0); } }),
          h('button.vl-btn.vl-btn--strong', { type: 'button', html: icon('check') + 'Enregistrer', onclick: () => save(sheet.body.querySelector('form')) }));
      } else {
        (o.actions || []).forEach(a => f.append(h('button.vl-btn' + (a.variant ? '.vl-btn--' + a.variant : ''), { type: 'button', html: (a.icon ? icon(a.icon) : '') + esc(a.label), onclick: () => a.run(record(), api) })));
        if (o.onSave) f.append(h('button.vl-btn.vl-btn--strong', { type: 'button', html: icon('edit') + 'Modifier', onclick: () => { editing = true; paint(0); } }));
      }
      return f;
    }
    async function save(form) {
      const values = {};
      let firstBad = null;
      fields.filter(f => f.type !== 'readonly').forEach(f => {
        const input = form.elements[f.key];
        const v = f.type === 'number' ? (input.value === '' ? null : Number(input.value)) : input.value.trim();
        const err = form.querySelector('#' + input.id + '-err');
        const bad = f.required && (v === '' || v == null) ? 'Ce champ est obligatoire.' : f.validate ? f.validate(v) : null;
        input.setAttribute('aria-invalid', String(!!bad));
        err.hidden = !bad; err.textContent = bad || '';
        if (bad && !firstBad) firstBad = input;
        values[f.key] = v;
      });
      if (firstBad) { firstBad.focus(); V.announce('Le formulaire contient des erreurs', true); return; }
      const r = record();
      const before = { ...r };
      const ok = await o.onSave(r, values, before);
      if (ok === false) return;
      editing = false;
      paint(0);
      ui.toast('Modifications enregistrées');
    }
    function paint(dir) {
      sheet.setTitle(o.title(record()), o.eyebrow ? o.eyebrow(record()) : '');
      const node = content();
      sheet.body.innerHTML = '';
      sheet.body.append(node);
      sheet.setFooter(footer());
      if (dir) M.play(node, [{ opacity: 0, transform: `translateY(${dir * 14}px)` }, { opacity: 1, transform: 'none' }], { duration: 'control', easing: M.ease('out') }, 'swap');
      else M.reveal(node);
      const prev = sheet.tool('prev'), next = sheet.tool('next');
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= list.length - 1;
      if (editing) { const first = sheet.body.querySelector('input,select,textarea'); first && first.focus(); }
      o.onNavigate && o.onNavigate(record(), index);
    }
    function move(d) {
      const ni = index + d;
      if (ni < 0 || ni >= list.length || editing) return;
      index = ni; paint(d);
      V.announce(o.title(record()));
    }
    const tools = list.length > 1 ? [
      { id: 'prev', icon: 'chevU', label: 'Élément précédent (k)', run: () => move(-1) },
      { id: 'next', icon: 'chevD', label: 'Élément suivant (j)', run: () => move(1) }
    ] : [];
    const sheet = ui.sheetOnce('side', { title: '', modal: 'auto', tools, className: 'vl-sheet--inspector', opener: o.opener, initialFocus: 'panel', onClose: () => { document.removeEventListener('keydown', keys); cur = null; o.onClose && o.onClose(); } });
    const keys = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (ui.layers.top() && ui.layers.top().root !== sheet.root) return;
      if (e.key === 'j') { e.preventDefault(); move(1); }
      if (e.key === 'k') { e.preventDefault(); move(-1); }
    };
    document.addEventListener('keydown', keys);
    const api = {
      close: () => sheet.close(),
      refresh: () => paint(0),
      get record() { return record(); },
      select(r) { const i = list.indexOf(r); if (i >= 0) { index = i; editing = false; paint(0); } },
      edit() { editing = true; paint(0); }
    };
    paint(0);
    cur = api;
    return api;
  }

  V.inspector = { open, get current() { return cur; } };
})(window);
