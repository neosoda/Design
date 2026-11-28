#!/usr/bin/env node
/* WCAG contrast audit of every text/background pair Velora actually renders, for the four palettes,
   in normal and "contraste renforcé" modes. Frosted surfaces are composited at the lowest opacity the
   Studio allows (worst case) over each canvas tint. Writes tests/contrast-report.md, exits 1 on failure.
   Usage: node tests/contrast.mjs */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadVelora, ROOT } from './load.mjs';

const V = loadVelora();
const S = V.studio, T = V.tokens;
const css = readFileSync(join(ROOT, 'core/velora-core.css'), 'utf8');
const moreMuted = name => {
  const re = name === 'light' ? /:root\[data-vl-contrast="more"\] \{[^}]*--vl-muted: (#[0-9a-f]{6})/i : new RegExp(`:root\\[data-vl-contrast="more"\\]\\[data-vl-palette="${name}"\\] \\{[^}]*--vl-muted: (#[0-9a-f]{6})`, 'i');
  const m = css.match(re); return m ? m[1] : null;
};
const rgb = S.hexToRgb;
const toHex = a => '#' + a.map(c => c.toString(16).padStart(2, '0')).join('');
const over = (fgRgb, alpha, bgRgb) => fgRgb.map((c, i) => Math.round(c * alpha + bgRgb[i] * (1 - alpha)));

const results = [];
function check(palette, mode, label, fg, bg, min) {
  const ratio = S.contrast(Array.isArray(fg) ? fg : rgb(fg), Array.isArray(bg) ? bg : rgb(bg));
  results.push({ palette, mode, label, fg: Array.isArray(fg) ? toHex(fg) : fg, bg: Array.isArray(bg) ? toHex(bg) : bg, ratio, min, pass: ratio >= min });
}

for (const [name, p] of Object.entries(T.palettes)) {
  for (const mode of ['normal', 'renforcé']) {
    const muted = mode === 'normal' ? p.muted : (moreMuted(name) || p.muted);
    const alpha = mode === 'normal' ? T.preferences.alpha.min : .94;
    const canvases = [p.canvas.base, p.canvas.a, p.canvas.b];
    const surfaces = canvases.map(c => over(p.surfaceRgb.split(' ').map(Number), alpha, rgb(c)));
    const worst = (label, fg, min) => { const r = [...surfaces.map(s => [s, 'surface givrée']), [rgb(p.solid), 'surface pleine'], [rgb(p.chip), 'puce']].map(([bg]) => ({ bg, ratio: S.contrast(rgb(fg), bg) })).sort((a, b) => a.ratio - b.ratio)[0]; check(name, mode, label, fg, r.bg, min); };
    worst('Texte principal sur la surface la plus défavorable', p.ink, 4.5);
    worst('Texte secondaire sur la surface la plus défavorable', muted, 4.5);
    canvases.forEach((c, i) => check(name, mode, 'Texte principal sur la toile (' + ['neutre', 'teinte A', 'teinte B'][i] + ')', p.ink, c, 4.5));
    check(name, mode, 'Placeholder (couleur secondaire) sur champ', muted, p.chip, 4.5);
    for (const [k, c] of Object.entries(p.status)) worst(`Statut « ${k} » en texte`, c, 4.5);
    check(name, mode, 'Texte encre sur tuile jaune', '#181815', p.stage.yellow, 4.5);
    check(name, mode, 'Texte blanc sur tuile sapin', '#ffffff', p.stage.green, 4.5);
    check(name, mode, 'Texte blanc sur tuile rouille', '#ffffff', p.stage.rust, 4.5);
    check(name, mode, 'Texte blanc sur tuile charbon', '#ffffff', p.stage.charcoal, 4.5);
    check(name, mode, 'Texte sur tuile « gagné »', p.ink, p.stage.won, 4.5);
    check(name, mode, 'Méta de tuile (blanc opaque, --t-sub: 1) sur rouille', '#ffffff', p.stage.rust, 4.5);
    check(name, mode, 'Méta de tuile (blanc à 85 %) sur sapin', over([255, 255, 255], .85, rgb(p.stage.green)), p.stage.green, 4.5);
    check(name, mode, 'Étape inactive du stepper (blanc à 80 %) sur sapin', over([255, 255, 255], .8, rgb(p.stage.green)), p.stage.green, 4.5);
    check(name, mode, 'Étape inactive du stepper (encre à 80 %) sur jaune', over(rgb('#181815'), .8, rgb(p.stage.yellow)), p.stage.yellow, 4.5);
    check(name, mode, 'Faits de la fiche (blanc sur rouille + voile sombre 10 %)', '#ffffff', over([0, 0, 0], .1, rgb(p.stage.rust)), 4.5);
    check(name, mode, 'Faits de la fiche (encre sur jaune + voile sombre 10 %)', '#181815', over([0, 0, 0], .1, rgb(p.stage.yellow)), 4.5);
    check(name, mode, 'Méta de tuile (encre à 85 %) sur jaune', over(rgb('#181815'), .85, rgb(p.stage.yellow)), p.stage.yellow, 4.5);
    check(name, mode, 'Texte blanc sur charbon (rail, toast, bouton fort)', p.onStrong, p.strong, 4.5);
    check(name, mode, 'Accent jaune sur charbon (navigation active)', p.stage.yellow, p.strong, 4.5);
    check(name, mode, 'Bouton accent (encre sur jaune)', '#181815', p.stage.yellow, 4.5);
    check(name, mode, 'Statut critique sur pastille rouille 18 %', p.status.crit, over(rgb(p.stage.rust), .18, rgb(p.solid)), 4.5);
    check(name, mode, 'Contour de focus sur la toile (non textuel)', p.focus, p.canvas.base, 3);
    check(name, mode, 'Contour de focus sur surface pleine (non textuel)', p.focus, p.solid, 3);
  }
}

const fails = results.filter(r => !r.pass);
const fmt = n => n.toFixed(2).replace('.', ',');
let md = '# Velora UI V4 : audit de contraste WCAG\n\n';
md += `Généré par \`node tests/contrast.mjs\` à partir de \`core/tokens.json\`. ${results.length} paires vérifiées, ${fails.length} sous le seuil.\n\n`;
md += 'Les surfaces givrées sont composées à l’opacité minimale autorisée par le Studio (' + Math.round(T.preferences.alpha.min * 100) + ' %), au-dessus de chaque teinte de la toile : c’est le cas le plus défavorable, pas le cas moyen. Le seuil est 4,5:1 pour le texte et 3:1 pour les éléments non textuels.\n\n';
for (const name of Object.keys(T.palettes)) {
  for (const mode of ['normal', 'renforcé']) {
    md += `## ${T.palettes[name].label}, contraste ${mode}\n\n| Paire | Texte | Fond | Ratio | Seuil | Résultat |\n|---|---|---|---:|---:|---|\n`;
    results.filter(r => r.palette === name && r.mode === mode).forEach(r => { md += `| ${r.label} | \`${r.fg}\` | \`${r.bg}\` | ${fmt(r.ratio)} | ${r.min} | ${r.pass ? 'Conforme' : '**Échec**'} |\n`; });
    md += '\n';
  }
}
writeFileSync(join(ROOT, 'tests/contrast-report.md'), md);
const min = results.reduce((a, r) => r.ratio / r.min < a.ratio / a.min ? r : a);
console.log(`Velora contrast: ${results.length - fails.length}/${results.length} pairs pass. Tightest: ${min.palette} ${min.mode}, ${min.label} ${fmt(min.ratio)}:1 (min ${min.min}).`);
if (fails.length) { fails.forEach(f => console.error(`FAIL ${f.palette} ${f.mode}: ${f.label} ${f.fg} on ${f.bg} = ${fmt(f.ratio)}`)); process.exit(1); }
