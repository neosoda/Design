/* Velora Studio page: compose a theme, preview it on real components, export it. */
(function () {
  'use strict';
  const V = window.Velora, { h, icon, esc, ui, fmt } = V;
  const S = V.studio;
  const DEFAULT_STAGE = { yellow: '#f0c94e', green: '#2b5c4e', rust: '#c64720' };
  let stage = Object.assign({}, DEFAULT_STAGE, V.store.get('studio.stage', {}));
  const valid = c => /^#[0-9a-f]{6}$/i.test(c);
  Object.keys(stage).forEach(k => { if (!valid(stage[k])) stage[k] = DEFAULT_STAGE[k]; });

  function editor() {
    const root = h('div');
    root.append(V.shell.pageHead({ eyebrow: 'Velora Studio', title: 'Composer un thème' }));
    const layout = h('div.vl-studio-page');
    const left = h('div.vl-stack');
    const right = h('div.vl-stack');
    layout.append(left, right);
    root.append(layout);

    left.append(h('section.vl-card', { 'data-vl-reveal': '' }, h('h2.vl-card__title', { text: 'Réglages de l’interface', style: { marginBottom: '14px' } }), S.controls(() => { paintExport(); })));

    /* Stage colours: each one is checked against its text colour (WCAG AA, 4.5:1). */
    const stageCard = h('section.vl-card.vl-stack', { 'data-vl-reveal': '' }, h('h2.vl-card__title', { text: 'Couleurs d’étape' }), h('p.vl-caption', { text: 'Les objets métier portent la couleur de leur étape. Ajustez-les à votre marque : le texte posé dessus est choisi et vérifié automatiquement.' }));
    const stageRows = h('div.vl-stack', { style: { gap: '10px' } });
    stageCard.append(stageRows, h('button.vl-btn.vl-btn--sm.vl-btn--ghost', { type: 'button', html: icon('refresh') + 'Couleurs Velora d’origine', onclick: () => { stage = { ...DEFAULT_STAGE }; V.store.set('studio.stage', stage); paintStage(); paintPreview(); paintExport(); } }));
    left.append(stageCard);
    const LABELS = { yellow: 'Étape 1 · jaune', green: 'Étape 2 · sapin', rust: 'Étape 3 · rouille' };
    function paintStage() {
      stageRows.innerHTML = '';
      Object.keys(DEFAULT_STAGE).forEach(k => {
        const id = V.uid('sc');
        const input = h('input.vl-colorpick', { type: 'color', id, value: stage[k] });
        const on = S.bestOn(stage[k]);
        const ratio = S.contrast(stage[k], on);
        const ok = ratio >= 4.5;
        const report = h('span.vl-status.vl-status--text', { 'data-tone': ok ? 'ok' : 'crit', text: `${on === '#ffffff' ? 'Texte blanc' : 'Texte encre'} ${fmt.dec(ratio, 1)} : 1 ${ok ? 'conforme AA' : 'insuffisant'}` });
        input.addEventListener('input', () => { stage[k] = input.value; V.store.set('studio.stage', stage); paintPreview(); paintExport(); const on2 = S.bestOn(stage[k]), r2 = S.contrast(stage[k], on2); report.dataset.tone = r2 >= 4.5 ? 'ok' : 'crit'; report.textContent = `${on2 === '#ffffff' ? 'Texte blanc' : 'Texte encre'} ${fmt.dec(r2, 1)} : 1 ${r2 >= 4.5 ? 'conforme AA' : 'insuffisant'}`; });
        stageRows.append(h('div.vl-stagecolor', null, h('label', { for: id, text: LABELS[k] }), input, h('code.vl-code', { text: stage[k] }), report));
        input.addEventListener('input', () => { input.nextSibling.textContent = input.value; });
      });
    }
    paintStage();

    /* Preview on real components. */
    const preview = h('section.vl-card.vl-studio-preview', { 'data-vl-reveal': '', 'aria-label': 'Aperçu du thème' });
    right.append(preview);
    function paintPreview() {
      preview.innerHTML = '';
      Object.entries(stage).forEach(([k, c]) => preview.style.setProperty('--vl-stage-' + k, c));
      ['yellow', 'green', 'rust'].forEach(k => preview.style.setProperty('--vl-on-' + k, S.bestOn(stage[k])));
      preview.append(h('div.vl-split', null, h('h2.vl-card__title', { text: 'Aperçu' }), h('span.vl-caption', { text: V.tokens.palettes[V.prefs.palette()].label + ' · ' + ({ compact: 'compacte', comfortable: 'confortable', spacious: 'spacieuse' })[V.prefs.get().density] })));
      const tiles = h('div.vl-grid', { style: { gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' } });
      [['yellow', 'À qualifier', 'Imprimante hors ligne'], ['green', 'En cours', 'Accès VPN refusé'], ['rust', 'En attente', 'Écran qui scintille'], ['charcoal', 'Résolu', 'Compte verrouillé']].forEach(([k, st, t]) => {
        const tile = h('div', { class: 'vl-tile vl-tile--' + k, style: k === 'charcoal' ? null : { '--t-fg': S.bestOn(stage[k]) } });
        tile.innerHTML = `<div class="vl-tile__meta">${esc(st)}</div><div class="vl-tile__title">${esc(t)}</div><div class="vl-tile__foot"><span class="vl-tile__value">P2</span>${V.avatars(['Inès Moreau'])}</div>`;
        tiles.append(tile);
      });
      preview.append(tiles);
      preview.append(h('div.vl-row', null, h('button.vl-btn.vl-btn--strong', { type: 'button', text: 'Enregistrer' }), h('button.vl-btn', { type: 'button', text: 'Annuler' }), h('button.vl-btn.vl-btn--accent', { type: 'button', text: 'Valider la demande' }), h('button.vl-chip', { type: 'button', 'aria-pressed': 'true', text: 'Filtre actif' }), h('button.vl-chip', { type: 'button', 'aria-pressed': 'false', text: 'Filtre' })));
      preview.append(h('div.vl-row', null, ...[['ok', 'Opérationnel'], ['warn', 'Dégradé'], ['crit', 'Indisponible'], ['info', 'Planifié'], ['idle', 'Maintenance']].map(([t, l]) => h('span.vl-status', { 'data-tone': t, text: l }))));
      const fid = V.uid('pv');
      preview.append(h('div.vl-field', null, h('label', { for: fid, text: 'Champ de saisie' }), h('input.vl-input', { id: fid, placeholder: 'Rechercher un poste, une salle…' })));
      const chart = h('div'); preview.append(chart);
      V.charts.line(chart, { label: 'Exemple de série', labels: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'], series: [{ name: 'Créés', values: [12, 15, 11, 17, 14, 6, 4] }, { name: 'Résolus', values: [10, 13, 14, 15, 16, 7, 5] }], height: 150, yMin: 0, table: false });
      // Preview buttons are inert samples: they only show the style, so make that explicit to keyboard users.
      preview.querySelectorAll('.vl-row button').forEach(b => b.addEventListener('click', () => ui.toast('Aperçu : « ' + b.textContent + ' » est un exemple de style')));
    }
    V.on('prefs', () => { paintPreview(); paintExport(); });
    paintPreview();

    /* Export / import. */
    const exp = h('section.vl-card.vl-stack', { 'data-vl-reveal': '' });
    right.append(exp);
    let fmtSel = 'css';
    const code = h('code');
    const pre = h('pre.vl-codeblock', { tabindex: '0', 'aria-label': 'Thème exporté' }, code);
    const seg = h('div', { html: ui.segHTML('Format d’export', [['css', 'CSS'], ['json', 'JSON']], 'css') });
    const overrides = () => Object.fromEntries(Object.entries(stage).filter(([k, v]) => v.toLowerCase() !== DEFAULT_STAGE[k]));
    function paintExport() { code.textContent = fmtSel === 'css' ? S.themeCSS(V.prefs.get(), overrides()) : S.themeJSON(V.prefs.get(), overrides()); }
    const importId = V.uid('imp');
    const importArea = h('textarea.vl-textarea', { id: importId, rows: '3', placeholder: '{ "preferences": { "palette": "mist", "density": "compact" } }' });
    const importErr = h('span.vl-field__error', { hidden: true, id: importId + '-e' });
    importArea.setAttribute('aria-describedby', importId + '-e');
    exp.append(
      h('div.vl-split', null, h('h2.vl-card__title', { text: 'Exporter le thème' }), seg),
      h('p.vl-caption', { text: 'CSS : variables résolues à coller après velora-tokens.css. JSON : préférences à réimporter ici ou à charger avec Velora.prefs.set().' }),
      pre,
      h('div.vl-row', null,
        h('button.vl-btn.vl-btn--strong', { type: 'button', html: icon('copy') + 'Copier', onclick: () => ui.copy(code.textContent, 'Thème copié') }),
        h('button.vl-btn', { type: 'button', html: icon('down') + 'Télécharger', onclick: () => { ui.download(fmtSel === 'css' ? 'velora-theme.css' : 'velora-theme.json', code.textContent, fmtSel === 'css' ? 'text/css' : 'application/json'); ui.toast('Fichier téléchargé'); } })),
      h('hr.vl-divider'),
      h('div.vl-field', null, h('label', { for: importId, text: 'Importer un thème JSON' }), importArea, importErr),
      h('div.vl-row', null, h('button.vl-btn', { type: 'button', html: icon('upload') + 'Appliquer le JSON', onclick: () => {
        let data;
        try { data = JSON.parse(importArea.value); } catch (e) { importErr.hidden = false; importErr.textContent = 'Ce texte n’est pas un JSON valide.'; importArea.setAttribute('aria-invalid', 'true'); importArea.focus(); return; }
        const p = data && (data.preferences || data);
        V.prefs.set(p);
        if (data && data.stageOverrides) { Object.entries(data.stageOverrides).forEach(([k, v]) => { if (k in DEFAULT_STAGE && valid(v)) stage[k] = v; }); V.store.set('studio.stage', stage); paintStage(); }
        importErr.hidden = true; importArea.removeAttribute('aria-invalid');
        left.firstElementChild.replaceWith(h('section.vl-card', null, h('h2.vl-card__title', { text: 'Réglages de l’interface', style: { marginBottom: '14px' } }), S.controls(() => paintExport())));
        ui.toast('Thème importé : les valeurs invalides sont remplacées par les valeurs par défaut');
      } })));
    ui.seg(seg.querySelector('.vl-seg'), v => { fmtSel = v; paintExport(); });
    paintExport();
    return root;
  }

  V.app({
    id: 'studio', name: 'Velora Studio', short: 'Studio', base: '../',
    views: [{ id: 'editor', label: 'Éditeur de thème', icon: 'palette', render: editor }],
    footnote: 'Les réglages sont mémorisés sur cet appareil et s’appliquent à toutes les pages Velora.'
  });
})();
