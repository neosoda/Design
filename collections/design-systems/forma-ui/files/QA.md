# Recette navigateur et contrôle qualité — Forma UI

## 1. Méthodologie et skills exploités

- **Skills Agent Commons chargés et appliqués** : `universal-product-engineering`, `ux-psychology`, `frontend-design`, `frontend-design-direction`, `hallmark`, `impeccable` (`craft-floor`, `operate`), `design-is` (Dieter Rams), `design-system`, `frontend-a11y`, `browser-qa`, `verification-loop`, `100x-judge`.
- **Environnement d'exécution réel** : Playwright Python + Google Chrome headless sous Ubuntu 24.04 (`1440×900`, `768×1024`, `375×812`, zoom `200 %` à `720×450 @2x`, `prefers-reduced-motion: reduce`, modes `light` et `dark`).

---

## 2. Résultats des tests automatisés et navigateur

- **Synchronisation des sources et hygiène du code** (`python3 files/tests/smoke.py`) :
  - Correspondance exacte entre `tokens.css` + `components.css` + `motion.css` et le bloc embarqué de `prototype.html`.
  - `0` attribut `style="..."` en ligne dans `prototype.html`.
  - `0` chaîne méta à point médian (`·`) ou *eyebrow* en capitales au-dessus des titres.
- **Parcours E2E vérifiés** :
  - Navigation WAI-ARIA `tablist` au clavier (`ArrowRight`, `ArrowLeft`, `Home`, `End`) à l'intérieur d'un `<nav>` préservé.
  - Saut direct depuis le répertoire d'accueil vers l'index filtré (`Guide` : `2 ressources affichées`), réinitialisation (`8 ressources affichées`).
  - Recherche insensible aux accents (`reglement` → `2 ressources affichées`), état vide avec bouton de reprise directe, état d'erreur réseau simulé (`role="alert"`) → bouton `Réessayer le chargement`.
  - Déploiement natif `<details>/<summary>`, vérification de l'état `:disabled` (`Archive PDF scellée`), ouverture de la modale `<dialog>` et restitution du focus à la touche `Échap`.
  - Validation accessible du formulaire de pré-demande (`aria-invalid="true"`, `aria-describedby`, reprise du focus sur le premier champ invalide) puis génération du récépissé `DEM-LEC-4190`.
- **Audit WCAG AA et ergonomique sur rendu réel Chromium** :
  - `0` erreur console, `0` erreur d'exécution JS, `0` contrôle interactif sans nom accessible.
  - Mode Papier (`light`) : **0 échec de contraste**, ratio minimal mesuré **6,90:1** (seuil WCAG AA `4,5:1`).
  - Mode Nuit (`dark`) : **0 échec de contraste**, ratio minimal mesuré **7,75:1**.
  - Cibles tactiles mobiles (`375×812`) : **100 % ≥ 44 px** sur tous les boutons, champs, options radio et liens de sommaire, `0 px` de débordement horizontal jusqu'au zoom `200 %`.
  - Alignement supérieur strict du rail de filtrage et du répertoire sur `Index documentaire` (`Δy < 32 px`).
  - Feuille `@media print` forcée en encre noire sur fond blanc quel que soit le thème actif.

---

## 3. Cycle de critique graphique indépendante (`art-critic-judge`)

- **Cycle 1 (audit initial aveugle)** : `77 / 100` (Rams `21 / 30`) — 3 bloquants et 5 majeurs identifiés sur captures réelles (`align-items: start` manquant sur `.forma-index-layout`, cibles `< 44 px` sur mobile, chaîne méta `·` en tête de démarche, `<nav role="tablist">` sans flèches clavier, états `[aria-pressed]` et `:disabled` absents, planche bleue trop haute sur tablette, styles inline, orphelin `17 / h 00` au zoom `200 %`).
- **Cycle 2 (après correction intégrale des 11 points)** : **Verdict `SHIP` — Score Design Studio `94 / 100` (Dieter Rams `29 / 30`), `0` bloquant, `0` majeur** (Originalité `19/20`, Qualité graphique `19/20`, Ergonomie `14/15`, Composants `14/15`, Accessibilité `10/10`, Responsive `9/10`, Documentation `9/10`).

## 4. Limites documentées

- Prototype front-end autonome à données fictives signalées ; pas de backend ni de téléchargement PDF réel.
- La licence historique de la fiche (`Inconnue`, usage `reference`) et l'illustration historique `preview.svg` sont conservées conformément à la politique du dépôt ; `preview.webp` est une capture Chromium réelle `1280×720`.
