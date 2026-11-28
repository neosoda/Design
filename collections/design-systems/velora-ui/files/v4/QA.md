# Recette navigateur — Velora UI V4

## Périmètre vérifié

- **Sources et synchronisation** : `python3 sync.py --check` OK (`base.css`, `core.css`, `motion.css`, `components.css`, `extension.js` alignés avec `prototype.html`).
- **Tests unitaires** : `node tests/unit.mjs` — **43/43 assertions** passées (préférences, persistance `localStorage`, repli sans stockage, grille configurable, 5 profils métier).
- **Smoke E2E Chromium** : `python3 tests/smoke.py` (Playwright + Google Chrome headless) — **PASS**, 0 erreur console, 0 `pageerror` :
  - Personnalisation du dashboard (`Customize dashboard`, paliers de largeur, `Finish editing`).
  - Panneau `Velora Studio`, bascule de palette (`Mist`), densité `compact`, rail `expanded`, persistance au rechargement.
  - Navigation vers `Templates` et chargement des 5 profils (`crm`, `itsm`, `admin`, `monitoring`, `analytics`).
  - Création d'enregistrement, recherche temps réel, sauvegarde de vue nommée, édition en modale (`Escape`), centre d'activité (`Mark all read`), `Playground` (états erreur → `Retry` → succès), palette de commandes (`Ctrl+K`).
  - Navigation mobile (`390×844` et `375×812`) : ouverture/fermeture du rail en tiroir non destructif, `0 px` de débordement horizontal.
- **Audit de contraste WCAG AA (rendu réel Chromium)** :
  - Correction appliquée dans `core.css` sur `--mute` et `--faint` pour éliminer le sous-contraste hérité sur `.demo` et les légendes secondaires (`2,70:1` → `≥ 4,86:1`).
  - Mesures après correction sur les 4 palettes (`light`, `dark`, `ivory`, `mist`) :
    - Vue `Overview` (1440×900, 768×1024, 375×812, zoom 200 %) : **0 échec**, ratio minimal mesuré **4,86:1** (seuil AA 4,5:1).
    - Vue `Templates` (4 palettes) : **0 échec**, ratio minimal mesuré **5,29:1**.
  - Focus clavier `:focus-visible` vérifié par tabulation réelle (`outline: 2px solid`, `0` contrôle anonyme).
  - `prefers-reduced-motion: reduce` et mode `data-velora-motion="off"` vérifiés.

## Limites connues

- Les cinq profils `Templates` partagent un moteur de démonstration front-end sans backend.
- Les références historiques de Velora UI conservent leur mention de licence d'origine (`Inconnue`, usage `reference`).
