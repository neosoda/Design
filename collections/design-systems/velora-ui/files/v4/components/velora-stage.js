/* Velora Stage Dialog V4: the shared dialog born from a coloured card (V3 signature, generalised).
   The card grows into the dialog and keeps its colour; changing the stage recolours the dialog,
   fills the stepper, recounts the figures and relabels the action, without closing or remounting.
   Closing morphs back to wherever the card is now. */
(function (g) {
  'use strict';
  const V = g.Velora;
  function stageDialog(o) {
    const { h, icon, esc, ui, motion: M } = V;
    const stages = o.stages;
    const idx = () => stages.findIndex(s => s.id === o.stageOf(o.item));
    const tone = () => (stages[idx()] || {}).tone || 'yellow';
    const body = h('div.vl-stagedlg');
    const value = h('div.vl-stagedlg__value.vl-num', { 'data-vl-morph-reveal': '' });
    const sub = h('div.vl-stagedlg__sub', { 'data-vl-morph-reveal': '' });
    const stepper = h('ol.vl-stepper', { 'data-vl-morph-reveal': '', 'aria-label': 'Progression' });
    stages.forEach(s => stepper.append(h('li', { dataset: { id: s.id } }, h('i', null, h('b')), h('span', { text: s.label }))));
    const facts = h('div.vl-stagedlg__facts', { 'data-vl-morph-reveal': '' });
    const people = h('div.vl-stagedlg__people', { 'data-vl-morph-reveal': '' });
    const note = h('div.vl-stagedlg__note', { 'data-vl-morph-reveal': '' });
    body.append(sub, value, stepper, facts, people, note);
    const advance = h('button.vl-btn.vl-stagedlg__next', { type: 'button' });
    const secondary = o.secondary ? h('button.vl-btn.vl-stagedlg__alt', { type: 'button' }) : null;
    let lastFacts = null, d = null;
    function paint(first) {
      const i = idx(), next = stages[i + 1];
      if (d) { d.el.className = d.el.className.replace(/\bvl-tile--\w+/g, '').trim() + ' vl-tile--' + tone(); d.setTitle(o.title(o.item)); }
      sub.textContent = o.sub ? o.sub(o.item) : '';
      value.textContent = o.value ? o.value(o.item) : '';
      Array.from(stepper.children).forEach((li, k) => { li.classList.toggle('is-current', k === i); li.classList.toggle('is-done', k <= i); li.setAttribute('aria-current', k === i ? 'step' : 'false'); });
      const f = o.facts(o.item);
      facts.innerHTML = '';
      f.forEach(([label, v, num, format], k) => {
        const b = h('b.vl-num', { text: format && num != null ? format(num) : v });
        facts.append(h('div', null, h('small', { text: label }), b));
        if (!first && num != null && lastFacts && lastFacts[k] && lastFacts[k][2] != null && lastFacts[k][2] !== num) { b._vlValue = lastFacts[k][2]; M.countTo(b, num, format); }
      });
      lastFacts = f;
      const ppl = o.people ? o.people(o.item) : [];
      people.innerHTML = ppl.map(n => `<span>${V.avatar(n)}${esc(n)}</span>`).join('');
      people.hidden = !ppl.length;
      note.innerHTML = o.note && o.note(o.item) ? icon('note') + `<span>${esc(o.note(o.item))}</span>` : '';
      note.hidden = !(o.note && o.note(o.item));
      const label = next ? (o.nextLabel ? o.nextLabel(next) : 'Passer à ' + next.label) : (o.doneLabel || 'Étape finale');
      if (!first) M.play(advance, [{ opacity: .2 }, { opacity: 1 }], { duration: 'control' }, 'lbl');
      advance.innerHTML = esc(label) + icon(next ? 'chevR' : 'check');
      advance.disabled = !next;
      if (secondary) {
        const l = typeof o.secondary.label === 'function' ? o.secondary.label(o.item) : o.secondary.label;
        secondary.hidden = !l;
        if (l) secondary.innerHTML = (o.secondary.icon ? icon(o.secondary.icon) : '') + esc(l);
      }
    }
    const foot = h('div.vl-dialog__foot', { 'data-vl-morph-reveal': '' }, secondary, advance);
    paint(true);
    d = ui.dialog({
      title: o.title(o.item), eyebrow: o.eyebrow ? o.eyebrow(o.item) : '', body, footer: foot, source: o.source,
      className: 'vl-dialog--stage vl-tile--' + tone(), width: 520,
      onClose: () => o.onClose && o.onClose()
    });
    advance.addEventListener('click', () => {
      const i = idx(), next = stages[i + 1]; if (!next) return;
      const from = stages[i].id;
      o.setStage(o.item, next.id, from);
      paint(false);
      V.announce(o.title(o.item) + ' : ' + next.label);
      V.activity && V.activity.log({ title: `${o.title(o.item)} : ${next.label}`, detail: `${stages[i].label} → ${next.label}`, icon: 'chevR', undo: () => { o.setStage(o.item, from, next.id); if (d.el.isConnected) paint(false); } });
      o.onChange && o.onChange(o.item, from, next.id);
    });
    if (secondary) secondary.addEventListener('click', () => { o.secondary.run(o.item, d); paint(false); });
    d.repaint = () => paint(false);
    return d;
  }
  V.stageDialog = stageDialog;
})(window);
