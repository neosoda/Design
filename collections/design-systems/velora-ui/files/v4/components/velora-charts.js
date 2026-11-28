/* Velora Charts V4. Rules (dataviz method, validated palette in tokens.json):
   - categorical slots 1..4 in fixed order (pine, ochre, slate, rust); a 5th series folds into "Autres";
   - 2px lines, area wash ~10 %, bars <= 24px with a 4px rounded data end, 2px surface gaps in stacks;
   - legend for 2+ series, none for one; text always in text inks, never in the series colour;
   - hover AND keyboard: crosshair + one tooltip listing every series; every chart has a table view;
   - updates morph values and keep the frame (no skeleton flash on refetch). */
(function (g) {
  'use strict';
  const V = g.Velora, { h, esc, icon, motion: M, fmt } = V;
  const NS = 'http://www.w3.org/2000/svg';
  const slot = i => i == null ? 'var(--vl-chart-other)' : `var(--vl-chart-${(i % 4) + 1})`;

  function niceTicks(min, max, count) {
    const span = max - min || 1;
    const step0 = span / (count || 4);
    const mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= step0) || step0;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const out = []; for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(10));
    return out;
  }
  const tickFmt = (v, max) => max >= 10000 ? fmt.compact(v) : fmt.int(v);

  /* Frame: wrapper with optional table view toggle and a tooltip element. */
  function frame(el, o) {
    el.classList.add('vl-chart');
    el.innerHTML = '';
    const plot = h('div.vl-chart__plot', { style: { height: (o.height || 200) + 'px' } });
    const tip = h('div.vl-chart__tip', { role: 'presentation' });
    const legend = h('div.vl-chart__legend');
    const tableHost = h('div.vl-chart__table', { hidden: true });
    const toggle = o.table === false ? null : h('button.vl-chart__toggle', { type: 'button', 'aria-pressed': 'false', html: icon('list') + '<span>Voir les données</span>' });
    plot.append(tip);
    const foot = h('div.vl-chart__foot', null, legend);
    el.append(plot, tableHost, foot);
    if (toggle) {
      foot.append(toggle);
      toggle.addEventListener('click', () => {
        const on = toggle.getAttribute('aria-pressed') !== 'true';
        toggle.setAttribute('aria-pressed', String(on));
        toggle.querySelector('span').textContent = on ? 'Voir le graphique' : 'Voir les données';
        tableHost.hidden = !on; plot.hidden = on;
      });
    }
    return { plot, tip, legend, tableHost };
  }
  function dataTable(host, caption, head, rows) {
    host.innerHTML = '';
    const t = h('table.vl-table.vl-table--mini', null, h('caption.vl-sr', { text: caption }));
    const tr = h('tr'); head.forEach((c, i) => tr.append(h('th', { scope: 'col', class: i ? 'is-end' : '', text: c })));
    t.append(h('thead', null, tr));
    const tb = h('tbody');
    rows.forEach(r => { const row = h('tr'); r.forEach((c, i) => row.append(h(i ? 'td' : 'th', { scope: i ? null : 'row', class: i ? 'is-end vl-num' : '', text: c }))); tb.append(row); });
    t.append(tb); host.append(t);
  }
  function legendHTML(legend, items, kind) {
    legend.innerHTML = '';
    if (items.length < 2) { legend.classList.add('is-empty'); return; }
    legend.classList.remove('is-empty');
    items.forEach(it => legend.append(h('span.vl-chart__key', null, h('i', { class: 'vl-chart__swatch vl-chart__swatch--' + (kind || 'rect'), style: { background: it.color } }), h('span', { text: it.label }), it.value != null ? h('b.vl-num', { text: it.value }) : null)));
  }
  function svgEl(tag, attrs) { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs || {})) if (v != null) e.setAttribute(k, v); return e; }
  function svgText(x, y, text, attrs) { const t = svgEl('text', { x, y, ...attrs }); t.textContent = text; return t; }
  function placeTip(tip, plot, x, y) {
    const pw = plot.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
    let left = x + 14; if (left + tw > pw) left = x - tw - 14; left = Math.max(0, left);
    const top = Math.max(0, Math.min(y - th / 2, plot.clientHeight - th));
    tip.style.transform = `translate(${left}px, ${top}px)`;
  }
  function tipRows(tip, title, rows) {
    tip.innerHTML = '';
    tip.append(h('div.vl-chart__tip-title', { text: title }));
    rows.forEach(r => tip.append(h('div.vl-chart__tip-row', null, h('i', { class: 'vl-chart__tip-key vl-chart__tip-key--' + (r.kind || 'line'), style: { background: r.color } }), h('b.vl-num', { text: r.value }), h('span', { text: r.label }))));
  }
  function observe(el, fn) { let w = el.clientWidth; const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 2) { w = el.clientWidth; fn(); } }); ro.observe(el); return ro; }
  const resample = (arr, n) => arr.length === n ? arr.slice() : Array.from({ length: n }, (_, i) => { const t = i * (arr.length - 1) / Math.max(1, n - 1), a = Math.floor(t), b = Math.min(arr.length - 1, a + 1); return arr[a] + (arr[b] - arr[a]) * (t - a); });
  function curve(pts) {
    if (!pts.length) return '';
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  /* ---------- Line / area with crosshair ---------- */
  function line(el, o) {
    const f = frame(el, o);
    const format = o.format || fmt.int;
    let data = { labels: o.labels, series: o.series }, shown = null, stopTween = null, drawn = false;
    const padL = 44, padR = 12, padT = 12, padB = 26;
    let svg = null, geo = null, active = -1;
    function draw(values, animateIn) {
      const W = f.plot.clientWidth || 320, H = (o.height || 200);
      const all = values.flat().concat(o.target ? [o.target.value] : []);
      const yMin = o.yMin != null ? o.yMin : Math.min(...all), yMax = Math.max(...all);
      const ticks = niceTicks(yMin, yMax, 4);
      const lo = ticks[0], hi = ticks[ticks.length - 1];
      const n = data.labels.length;
      const x = i => padL + (W - padL - padR) * (n === 1 ? .5 : i / (n - 1));
      const y = v => padT + (H - padT - padB) * (1 - (v - lo) / (hi - lo || 1));
      geo = { x, y, n, W, H };
      if (svg) svg.remove();
      svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': o.label || 'Graphique linéaire' });
      const grid = svgEl('g', { class: 'vl-chart__grid' });
      ticks.forEach(t => { grid.append(svgEl('line', { x1: padL, x2: W - padR, y1: y(t), y2: y(t) })); grid.append(svgText(padL - 8, y(t) + 4, tickFmt(t, hi), { class: 'vl-chart__axis', 'text-anchor': 'end' })); });
      const every = Math.ceil(n / Math.max(2, Math.floor((W - padL) / 64)));
      data.labels.forEach((l, i) => { if ((n - 1 - i) % every === 0) grid.append(svgText(x(i), H - 6, l, { class: 'vl-chart__axis', 'text-anchor': i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle' })); });
      svg.append(grid);
      if (o.target) {
        svg.append(svgEl('line', { class: 'vl-chart__target', x1: padL, x2: W - padR, y1: y(o.target.value), y2: y(o.target.value) }));
        svg.append(svgText(W - padR, y(o.target.value) - 6, o.target.label, { class: 'vl-chart__axis', 'text-anchor': 'end' }));
      }
      const marks = svgEl('g', { class: 'vl-chart__marks' + (animateIn && !drawn ? ' is-drawing' : '') });
      values.forEach((vals, si) => {
        const s = data.series[si], color = slot(s.slot != null ? s.slot : si);
        const pts = vals.map((v, i) => [x(i), y(v)]);
        if (o.area !== false && (values.length === 1 || s.area)) marks.append(svgEl('path', { d: curve(pts) + ` L${x(n - 1)},${y(lo)} L${x(0)},${y(lo)} Z`, style: `fill:${color};opacity:.1` }));
        marks.append(svgEl('path', { d: curve(pts), class: 'vl-chart__line', style: `stroke:${color}` }));
        marks.append(svgEl('circle', { cx: pts[n - 1][0], cy: pts[n - 1][1], r: 4.5, class: 'vl-chart__dot', style: `fill:${color}` }));
      });
      svg.append(marks);
      if (animateIn && !drawn && !M.reduced()) {
        M.play(marks, [{ clipPath: `inset(0 100% 0 0)` }, { clipPath: 'inset(0 0 0 0)' }], { duration: 'draw', easing: M.ease('out') }, 'draw');
      }
      drawn = true;
      const cross = svgEl('line', { class: 'vl-chart__cross', y1: padT, y2: H - padB, x1: -10, x2: -10 });
      const hot = svgEl('g');
      values.forEach((_, si) => hot.append(svgEl('circle', { r: 5, cx: -10, cy: -10, class: 'vl-chart__hot', style: `fill:${slot(data.series[si].slot != null ? data.series[si].slot : si)}` })));
      svg.append(cross, hot);
      svg._cross = cross; svg._hot = hot;
      f.plot.prepend(svg);
      if (active >= 0) focusAt(active);
    }
    function focusAt(i) {
      if (!geo || !svg || !shown) return;
      active = Math.max(0, Math.min(geo.n - 1, i));
      const X = geo.x(active);
      svg._cross.setAttribute('x1', X); svg._cross.setAttribute('x2', X); svg._cross.style.opacity = 1;
      Array.from(svg._hot.children).forEach((c, si) => { c.setAttribute('cx', X); c.setAttribute('cy', geo.y(shown[si][active])); c.style.opacity = 1; });
      tipRows(f.tip, data.labels[active], data.series.map((s, si) => ({ label: s.name, value: format(shown[si][active]), color: slot(s.slot != null ? s.slot : si) })));
      f.tip.classList.add('is-on');
      placeTip(f.tip, f.plot, X, geo.y(Math.max(...shown.map(v => v[active]))));
    }
    function blur() { active = -1; f.tip.classList.remove('is-on'); if (svg) { svg._cross.style.opacity = 0; Array.from(svg._hot.children).forEach(c => { c.style.opacity = 0; }); } }
    f.plot.tabIndex = 0;
    f.plot.setAttribute('role', 'group');
    f.plot.setAttribute('aria-label', (o.label || 'Graphique') + '. Flèches gauche et droite pour parcourir les valeurs.');
    f.plot.addEventListener('pointermove', e => { if (!geo) return; const r = f.plot.getBoundingClientRect(); const t = (e.clientX - r.left - 44) / (geo.W - 56); focusAt(Math.round(t * (geo.n - 1))); });
    f.plot.addEventListener('pointerleave', blur);
    f.plot.addEventListener('focus', () => focusAt(active >= 0 ? active : geo.n - 1));
    f.plot.addEventListener('blur', blur);
    f.plot.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); focusAt(active + (e.key === 'ArrowRight' ? 1 : -1)); V.announce(data.labels[active] + ' : ' + data.series.map((s, si) => s.name + ' ' + format(shown[si][active])).join(', ')); }
      if (e.key === 'Home') { e.preventDefault(); focusAt(0); } if (e.key === 'End') { e.preventDefault(); focusAt(geo.n - 1); }
    });
    function paintSide() {
      legendHTML(f.legend, data.series.map((s, si) => ({ label: s.name, color: slot(s.slot != null ? s.slot : si) })), 'line');
      dataTable(f.tableHost, o.label || 'Données', [o.xLabel || 'Période', ...data.series.map(s => s.name)], data.labels.map((l, i) => [l, ...data.series.map(s => format(s.values[i]))]));
    }
    function update(next, animate) {
      const from = shown;
      data = { labels: next.labels || data.labels, series: next.series || data.series };
      const target = data.series.map(s => s.values.slice());
      paintSide();
      if (stopTween) stopTween();
      if (!from || animate === false || M.reduced()) { shown = target; draw(shown, !from); return; }
      const fromR = target.map((t, si) => resample(from[si] || from[0], t.length));
      stopTween = M.tween(M.duration('chart'), M.easeOutQuart, k => { shown = target.map((t, si) => t.map((v, i) => fromR[si][i] + (v - fromR[si][i]) * k)); draw(shown, false); });
    }
    const ro = observe(f.plot, () => shown && draw(shown, false));
    update(data, true);
    return { el, update, setBusy: b => el.classList.toggle('is-busy', !!b), destroy: () => ro.disconnect() };
  }

  /* ---------- Columns (single or stacked) ---------- */
  function columns(el, o) {
    const f = frame(el, o);
    const format = o.format || fmt.int;
    let data = { labels: o.labels, series: o.series }, drawnOnce = false;
    function draw(animateIn) {
      const W = f.plot.clientWidth || 320, H = o.height || 200, padL = 44, padR = 8, padT = 14, padB = 26;
      const n = data.labels.length;
      const totals = data.labels.map((_, i) => data.series.reduce((a, s) => a + (s.values[i] || 0), 0));
      const ticks = niceTicks(0, Math.max(...totals, 1), 4), hi = ticks[ticks.length - 1];
      const band = (W - padL - padR) / n, bw = Math.min(24, band * .62);
      const y = v => padT + (H - padT - padB) * (1 - v / hi);
      const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': o.label || 'Histogramme' });
      const grid = svgEl('g', { class: 'vl-chart__grid' });
      ticks.forEach(t => { grid.append(svgEl('line', { x1: padL, x2: W - padR, y1: y(t), y2: y(t) })); grid.append(svgText(padL - 8, y(t) + 4, tickFmt(t, hi), { class: 'vl-chart__axis', 'text-anchor': 'end' })); });
      const every = Math.ceil(n / Math.max(2, Math.floor((W - padL) / 40)));
      data.labels.forEach((l, i) => { if ((n - 1 - i) % every === 0) grid.append(svgText(padL + band * (i + .5), H - 6, l, { class: 'vl-chart__axis', 'text-anchor': 'middle' })); });
      svg.append(grid);
      const marks = svgEl('g');
      data.labels.forEach((l, i) => {
        let acc = 0;
        const cx = padL + band * (i + .5) - bw / 2;
        const g2 = svgEl('g', { class: 'vl-chart__col', tabindex: '0', role: 'img', 'aria-label': `${l} : ` + data.series.map(s => `${s.name} ${format(s.values[i] || 0)}`).join(', ') });
        data.series.forEach((s, si) => {
          const v = s.values[i] || 0; if (!v) return;
          const top = y(acc + v), bottom = y(acc);
          const isTop = si === data.series.length - 1 || data.series.slice(si + 1).every(x => !(x.values[i] || 0));
          const hgt = Math.max(0, bottom - top - (acc > 0 ? 2 : 0));
          const r = isTop ? Math.min(4, hgt / 2) : 0;
          const path = `M${cx},${top + hgt} V${top + r} q0,-${r} ${r},-${r} H${cx + bw - r} q${r},0 ${r},${r} V${top + hgt} Z`;
          const p = svgEl('path', { d: path, style: `fill:${slot(s.slot != null ? s.slot : si)}`, class: 'vl-chart__bar' });
          if (animateIn && !M.reduced()) M.play(p, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 'chart', delay: (n - i) * 45 + si * 60, easing: M.ease('out'), fill: 'backwards' });
          p.style.transformOrigin = `0 ${y(0)}px`;
          g2.append(p);
          acc += v;
        });
        g2.append(svgEl('rect', { x: padL + band * i, y: padT, width: band, height: H - padT - padB, fill: 'transparent' }));
        const show = e => {
          tipRows(f.tip, l, data.series.map((s, si) => ({ label: s.name, value: format(s.values[i] || 0), color: slot(s.slot != null ? s.slot : si), kind: 'rect' })).concat(data.series.length > 1 ? [{ label: 'Total', value: format(totals[i]), color: 'transparent' }] : []));
          f.tip.classList.add('is-on'); g2.classList.add('is-hot');
          placeTip(f.tip, f.plot, padL + band * (i + .5), y(totals[i]));
        };
        const hide = () => { f.tip.classList.remove('is-on'); g2.classList.remove('is-hot'); };
        g2.addEventListener('pointerenter', show); g2.addEventListener('pointerleave', hide); g2.addEventListener('focus', show); g2.addEventListener('blur', hide);
        marks.append(g2);
      });
      svg.append(marks);
      f.plot.querySelector('svg') && f.plot.querySelector('svg').remove();
      f.plot.prepend(svg);
    }
    function update(next) {
      data = { labels: next.labels || data.labels, series: next.series || data.series };
      legendHTML(f.legend, data.series.map((s, si) => ({ label: s.name, color: slot(s.slot != null ? s.slot : si) })), 'rect');
      dataTable(f.tableHost, o.label || 'Données', [o.xLabel || 'Période', ...data.series.map(s => s.name)], data.labels.map((l, i) => [l, ...data.series.map(s => format(s.values[i] || 0))]));
      draw(true); drawnOnce = true;
    }
    const ro = observe(f.plot, () => drawnOnce && draw(false));
    update(data);
    return { el, update, setBusy: b => el.classList.toggle('is-busy', !!b), destroy: () => ro.disconnect() };
  }

  /* ---------- Horizontal ranking bars (one series: same hue, no legend) ---------- */
  function bars(el, o) {
    const format = o.format || fmt.int;
    el.classList.add('vl-chart');
    function update(next) {
      const items = (next.items || o.items).slice().sort((a, b) => b.value - a.value);
      const max = Math.max(...items.map(i => i.value), 1);
      el.innerHTML = '';
      const list = h('ol.vl-hbars', { 'aria-label': o.label || 'Classement' });
      items.forEach((it, i) => {
        const w = Math.max(1.5, it.value / max * 100);
        const bar = h('i.vl-hbars__bar', { style: { width: '0%', background: slot(o.slot || 0) } });
        list.append(h('li.vl-hbars__row', null, h('span.vl-hbars__label', { text: it.label }), h('span.vl-hbars__track', null, bar), h('b.vl-hbars__value.vl-num', { text: format(it.value) })));
        requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transitionDelay = (i * 45) + 'ms'; bar.style.width = w + '%'; }));
      });
      el.append(list);
    }
    update(o);
    return { el, update, setBusy: b => el.classList.toggle('is-busy', !!b) };
  }

  /* ---------- Donut (part to whole, max 4 parts + Autres) ---------- */
  function donut(el, o) {
    const f = frame(el, { ...o, height: o.size || 180 });
    const format = o.format || fmt.int;
    function update(next) {
      let items = (next.items || o.items).slice();
      if (items.length > 4) { const rest = items.slice(3).reduce((a, x) => a + x.value, 0); items = items.slice(0, 3).concat([{ label: 'Autres', value: rest, slot: null }]); }
      const total = items.reduce((a, x) => a + x.value, 0) || 1;
      const S = o.size || 180, R = S / 2, r = R * .64, gap = 2 / R;
      const svg = svgEl('svg', { viewBox: `0 0 ${S} ${S}`, width: S, height: S, role: 'img', 'aria-label': (o.label || 'Répartition') + ' : ' + items.map(i => `${i.label} ${Math.round(i.value / total * 100)} %`).join(', ') });
      let a0 = -Math.PI / 2;
      const segs = [];
      items.forEach((it, i) => {
        const frac = it.value / total, a1 = a0 + frac * Math.PI * 2;
        const s = a0 + (frac > .02 ? gap : 0), e = a1 - (frac > .02 ? gap : 0);
        const big = e - s > Math.PI ? 1 : 0;
        const pt = (ang, rad) => [R + rad * Math.cos(ang), R + rad * Math.sin(ang)];
        const [x1, y1] = pt(s, R), [x2, y2] = pt(e, R), [x3, y3] = pt(e, r), [x4, y4] = pt(s, r);
        const p = svgEl('path', { d: `M${x1},${y1} A${R},${R} 0 ${big} 1 ${x2},${y2} L${x3},${y3} A${r},${r} 0 ${big} 0 ${x4},${y4} Z`, class: 'vl-chart__seg', style: `fill:${it.color || slot(it.slot !== undefined ? it.slot : i)}`, tabindex: '0', role: 'img', 'aria-label': `${it.label} : ${format(it.value)}, ${Math.round(frac * 100)} %` });
        if (!M.reduced()) M.play(p, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 'control', delay: i * 110, easing: M.ease('out'), fill: 'backwards' });
        p.style.transformOrigin = `${R}px ${R}px`;
        segs.push(p); svg.append(p);
        const show = () => { segs.forEach(x => x.classList.toggle('is-dim', x !== p)); center.querySelector('b').textContent = Math.round(frac * 100) + ' %'; center.querySelector('span').textContent = it.label; };
        const hide = () => { segs.forEach(x => x.classList.remove('is-dim')); center.querySelector('b').textContent = o.centerValue ? o.centerValue(total) : format(total); center.querySelector('span').textContent = o.centerLabel || 'Total'; };
        p.addEventListener('pointerenter', show); p.addEventListener('pointerleave', hide); p.addEventListener('focus', show); p.addEventListener('blur', hide);
        a0 = a1;
      });
      const center = h('div.vl-donut__center', { 'aria-hidden': 'true' }, h('b.vl-num', { text: o.centerValue ? o.centerValue(total) : format(total) }), h('span', { text: o.centerLabel || 'Total' }));
      f.plot.innerHTML = ''; f.plot.classList.add('vl-donut'); f.plot.style.height = S + 'px'; f.plot.style.width = S + 'px';
      f.plot.append(svg, center);
      legendHTML(f.legend, items.map((it, i) => ({ label: it.label, color: it.color || slot(it.slot !== undefined ? it.slot : i), value: Math.round(it.value / total * 100) + ' %' })), 'rect');
      dataTable(f.tableHost, o.label || 'Répartition', ['Part', 'Valeur', 'Part du total'], items.map(it => [it.label, format(it.value), Math.round(it.value / total * 100) + ' %']));
    }
    update(o);
    return { el, update, setBusy: b => el.classList.toggle('is-busy', !!b) };
  }

  /* ---------- Sparkline (de-emphasis hue, last point in accent) ---------- */
  function spark(values, o) {
    o = o || {};
    const W = o.width || 96, H = o.height || 28, n = values.length;
    const mn = Math.min(...values), mx = Math.max(...values);
    const pts = values.map((v, i) => [2 + (W - 6) * i / (n - 1), 3 + (H - 6) * (1 - (v - mn) / (mx - mn || 1))]);
    return `<svg class="vl-spark" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><path d="${curve(pts)}" style="stroke:var(--vl-muted)" /><circle cx="${pts[n - 1][0]}" cy="${pts[n - 1][1]}" r="3" style="fill:${o.color || 'var(--vl-chart-1)'}" /></svg>`;
  }

  /* ---------- Thin segmented bar (8px, no text; legend carries names) ---------- */
  function segbar(items, o) {
    const total = items.reduce((a, x) => a + x.value, 0) || 1;
    return `<div class="vl-segbar" role="img" aria-label="${esc((o && o.label) || 'Répartition')} : ${esc(items.map(i => i.label + ' ' + Math.round(i.value / total * 100) + ' %').join(', '))}">${items.filter(i => i.value > 0).map((it, i) => `<i style="flex:${it.value};background:${slot(it.slot !== undefined ? it.slot : i)}"></i>`).join('')}</div>`;
  }

  V.charts = { line, columns, bars, donut, spark, segbar, niceTicks, slot, resample };
})(window);
