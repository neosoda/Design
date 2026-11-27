# SentinelFlow, kit d'identité et de système d'interface

Version 1.0, 27 novembre 2026. `DESIGN.md` est la source de vérité (marque, UX, UI, implémentation, arbitrages, bilan). À placer à la racine du dépôt pour les développeurs et les agents IA.

| Fichier | Rôle |
|---|---|
| `DESIGN.md` | Référentiel complet |
| `sentinelflow-prototype.html` | Prototype interactif, polices locales ou fallback système |
| `tokens.json` | Jetons source (couleurs par thème, typographie, espacements, rayons, ombres, dimensions, points de rupture, animation) |
| `tokens.css` | Variables `--sf-*` générées, thèmes clair et sombre |
| `components.css` | Styles de référence des composants (balisage dans `DESIGN.md` et le prototype) |
| `sentinelflow-marks.js`, `.d.ts` | Fonctions d'affichage : piste SLA, marques de priorité et d'état, pictogrammes |
| `tailwind.css`, `shadcn-theme.css` | Intégration Tailwind 4 et shadcn/ui |
| `logos/` | 15 SVG (logotype vectorisé), PNG d'icône et de favicon, planche |
| `ecrans/` | Captures de référence (clair, sombre, mobile) |
| `contrast-report.md` | 39 paires par thème, calculées |

Démarrage : importer `tokens.css`, puis `components.css` ; poser `data-theme` sur `<html>` et `data-density` sur le conteneur de l'application.
