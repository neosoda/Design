/* Velora Studio V4: the in-app customisation panel and theme export.
   Every change applies live and persists (Velora.prefs); other open tabs follow through the storage event.
   Pure helpers (contrast, themeCSS) are unit-tested. */
(function (g) {
  'use strict';
  const V = g.Velora;
  const T = V.tokens;

  /* ---------- WCAG contrast (sRGB relative luminance) ---------- */
  function hexToRgb(hex) {
    const m = String(hex).trim().replace('#', '');
    const s = m.length === 3 ? m.split('').map(c => c + c).join('') : m.slice(0, 6);
    const n = parseInt(s, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const lum = ([r, g2, b]) => { const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g2) + .0722 * f(b); };
  function contrast(a, b) {
    const A = Array.isArray(a) ? a : hexToRgb(a), B = Array.isArray(b) ? b : hexToRgb(b);
    const la = lum(A), lb = lum(B);
    return (Math.max(la, lb) + .05) / (Math.min(la, lb) + .05);
  }
  /* Composite a translucent surface over the canvas: the colour text really sits on. */
  function over(fgRgb, alpha, bgHex) { const bg = hexToRgb(bgHex); return fgRgb.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha))); }
  function bestOn(hex) { return contrast(hex, '#ffffff') >= contrast(hex, '#181815') ? '#ffffff' : '#181815'; }

  /* ---------- Export: resolved CSS theme for another project ---------- */
  function themeCSS(prefs, overrides) {
    const p = V.prefs.sanitize(prefs);
    const name = p.palette === 'auto' ? 'light' : p.palette;
    const pal = T.palettes[name];
    const dens = T.density[p.density];
    const mot = T.motion[p.motion];
    const kebab = s => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    const lines = [
      `/* Velora UI ${T.version} theme exported by Velora Studio: palette ${pal.label}, density ${p.density}, motion ${p.motion}. */`,
      ':root {', `  color-scheme: ${pal.scheme};`,
      `  --vl-radius: ${p.radius}px;`, `  --vl-alpha: ${p.alpha};`, `  --vl-blur: ${p.blur}px;`, `  --vl-text-scale: ${p.textScale};`,
      `  --vl-canvas-a: ${pal.canvas.a};`, `  --vl-canvas-b: ${pal.canvas.b};`, `  --vl-canvas-base: ${pal.canvas.base};`,
      `  --vl-surface-rgb: ${pal.surfaceRgb};`, `  --vl-solid: ${pal.solid};`, `  --vl-chip: ${pal.chip};`,
      `  --vl-ink: ${pal.ink};`, `  --vl-muted: ${pal.muted};`, `  --vl-strong: ${pal.strong};`, `  --vl-focus: ${pal.focus};`,
      ...Object.entries({ ...pal.stage, ...(overrides || {}) }).map(([k, v]) => `  --vl-stage-${kebab(k)}: ${v};`),
      ...Object.entries(pal.status).map(([k, v]) => `  --vl-status-${k}: ${v};`),
      ...pal.chart.map((c, i) => `  --vl-chart-${i + 1}: ${c};`),
      ...Object.entries(dens).map(([k, v]) => `  --vl-${kebab(k)}: ${v};`),
      ...Object.entries(mot).map(([k, v]) => `  --vl-motion-${kebab(k)}: ${v};`),
      '}'
    ];
    return lines.join('\n') + '\n';
  }
  const themeJSON = (prefs, overrides) => JSON.stringify({ velora: T.version, preferences: V.prefs.sanitize(prefs), stageOverrides: overrides || {} }, null, 2);

  /* ---------- In-app panel ---------- */
  let panel = null;
  function controls(onChange) {
    const { h, icon, esc } = V;
    const p = V.prefs.get();
    const wrap = h('form.vl-studio', { novalidate: true });
    const radioGroup = (name, legend, options, value, cls) => {
      const fs = h('fieldset.vl-studio__group' + (cls ? '.' + cls : ''), null, h('legend', { text: legend }));
      const row = h('div.vl-studio__choices');
      options.forEach(([v, label, extra]) => {
        const id = V.uid('st');
        const input = h('input', { type: 'radio', name, id, value: v, checked: String(v) === String(value) });
        row.append(h('label.vl-studio__choice', { for: id }, input, extra || null, h('span', { text: label })));
      });
      fs.append(row);
      return fs;
    };
    const swatch = pal => h('span.vl-studio__swatch', { 'aria-hidden': 'true', style: { background: `linear-gradient(120deg, ${pal.canvas.a}, ${pal.canvas.base} 55%, ${pal.canvas.b})` } }, h('i', { style: { background: pal.stage.yellow } }), h('i', { style: { background: pal.stage.green } }), h('i', { style: { background: pal.stage.rust } }), h('i', { style: { background: pal.strong } }));
    const autoSwatch = h('span.vl-studio__swatch.vl-studio__swatch--auto', { 'aria-hidden': 'true', style: { background: `linear-gradient(120deg, ${T.palettes.light.canvas.a} 50%, ${T.palettes.dark.canvas.base} 50%)` } });
    wrap.append(radioGroup('palette', 'Palette', [['auto', 'Auto (système)', autoSwatch], ...Object.entries(T.palettes).map(([k, pal]) => [k, pal.label, swatch(pal)])], p.palette, 'vl-studio__group--palettes'));
    wrap.append(radioGroup('density', 'Densité d’affichage', [['compact', 'Compacte'], ['comfortable', 'Confortable'], ['spacious', 'Spacieuse']], p.density));
    const range = (name, label, min, max, step, value, unit, fmtv) => {
      const id = V.uid('rg');
      const out = h('output.vl-studio__value', { for: id, text: fmtv(value) + unit });
      const input = h('input.vl-range', { type: 'range', id, name, min, max, step, value, 'aria-valuetext': fmtv(value) + unit });
      input.addEventListener('input', () => { out.textContent = fmtv(input.value) + unit; input.setAttribute('aria-valuetext', fmtv(input.value) + unit); });
      return h('div.vl-field.vl-studio__range', null, h('div.vl-split', null, h('label', { for: id, text: label }), out), input);
    };
    const P = T.preferences;
    wrap.append(range('radius', 'Arrondis', P.radius.min, P.radius.max, 1, p.radius, ' px', v => v));
    wrap.append(range('alpha', 'Opacité des surfaces', P.alpha.min, P.alpha.max, .05, p.alpha, ' %', v => Math.round(v * 100)));
    wrap.append(range('blur', 'Flou givré', P.blur.min, P.blur.max, 1, p.blur, ' px', v => v));
    const reduceOS = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mg = radioGroup('motion', 'Intensité des animations', [['signature', 'Signature'], ['subtle', 'Subtile'], ['reduced', 'Réduite']], p.motion);
    if (reduceOS) mg.append(h('p.vl-field__hint', { text: 'Votre système demande de réduire les animations : Velora applique le niveau « Réduite » quel que soit ce choix.' }));
    wrap.append(mg);
    wrap.append(radioGroup('rail', 'Comportement du menu', [['collapsed', 'Compact'], ['expanded', 'Toujours déplié'], ['auto', 'Au survol']], p.rail));
    wrap.append(radioGroup('textScale', 'Taille du texte', T.preferences.textScale.options.map(v => [v, Math.round(v * 100) + ' %']), p.textScale));
    const cid = V.uid('ct');
    wrap.append(h('div.vl-studio__group', null, h('label.vl-switch', { for: cid }, h('input', { type: 'checkbox', id: cid, name: 'contrast', checked: p.contrast === 'more' }), h('span', { text: 'Contraste renforcé (texte secondaire plus sombre, surfaces plus opaques)' }))));
    const status = h('p.vl-field__hint', { role: 'status', text: 'Les réglages s’appliquent immédiatement et sont mémorisés sur cet appareil.' });
    wrap.append(status);
    const commit = V.debounce(() => {
      const fd = new FormData(wrap);
      const next = { palette: fd.get('palette'), density: fd.get('density'), radius: +fd.get('radius'), alpha: +fd.get('alpha'), blur: +fd.get('blur'), motion: fd.get('motion'), rail: fd.get('rail'), textScale: +fd.get('textScale'), contrast: fd.get('contrast') ? 'more' : 'normal' };
      const saved = V.prefs.set(next);
      status.textContent = saved ? 'Enregistré sur cet appareil.' : 'Stockage indisponible : les réglages valent pour cette session.';
      onChange && onChange(next);
    }, 60);
    wrap.addEventListener('input', commit);
    wrap.addEventListener('change', commit);
    wrap.addEventListener('submit', e => e.preventDefault());
    return wrap;
  }
  function open() {
    const { h, icon, ui } = V;
    if (panel) { panel.close(); return; }
    const body = h('div');
    const paint = () => { body.innerHTML = ''; body.append(controls()); };
    paint();
    const base = (V.current && V.current.base) || '';
    panel = ui.sheetOnce('side', {
      title: 'Personnaliser', eyebrow: 'Velora Studio', modal: true, body, className: 'vl-sheet--studio',
      footer: h('div.vl-inspector__foot', null,
        h('button.vl-btn.vl-btn--ghost', { type: 'button', html: icon('refresh') + 'Réinitialiser', onclick: () => { V.prefs.reset(); paint(); ui.toast('Apparence d’origine restaurée'); } }),
        h('a.vl-btn.vl-btn--strong', { href: base + 'studio/index.html', html: icon('palette') + 'Studio complet' })),
      onClose: () => { panel = null; }
    });
  }

  V.studio = { open, controls, contrast, hexToRgb, over, bestOn, themeCSS, themeJSON };
})(typeof window !== 'undefined' ? window : globalThis);
