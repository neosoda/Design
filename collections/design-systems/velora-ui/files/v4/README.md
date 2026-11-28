# Velora UI V4

*Soft by nature, fluid by design.*

Velora devient un design system réutilisable pour applications métier. L'ADN de V3 est conservé : la toile pêche-sauge, les surfaces givrées, les objets colorés par étape et le mouvement qui explique ce qui se passe. V2 et V3 restent intactes.

Pour démarrer, ouvrir `index.html` dans un navigateur. Il n'y a ni framework, ni étape de build, ni serveur : les pages fonctionnent en `file://`. La police Urbanist vient de Google Fonts, avec repli système hors ligne. **Toutes les données affichées sont fictives.**

## Modules

| Module | Contenu | Fichiers |
|---|---|---|
| **Core** | Tokens (une seule source JSON), 4 palettes (Light, Dark, Ivory, Mist), 3 densités, contraste renforcé, primitives CSS, préférences persistantes et synchronisées entre onglets, icônes | `core/tokens.json`, `core/velora-tokens.css/js` (générés), `core/velora-core.css/js` |
| **Motion** | Animations interruptibles (Web Animations API) : morph carte → fenêtre, FLIP, révélation progressive, comptage, titre lettre à lettre, moteur de glisser-déposer (inclinaison selon la vitesse, appui long tactile), 3 niveaux (Signature, Subtile, Réduite) | `motion/` |
| **Components** | Shell (onglets à capsule étirée, rail en 3 modes devenu lanceur de l'écosystème, barre basse mobile, routeur), Command Center (actions, favoris, historique), centre d'activité (notifications, historique de mes actions avec annulation), inspecteur contextuel ancré, tableau avancé, dashboard personnalisable, graphiques, kanban, fiche d'étape | `components/` |
| **Studio** | Panneau intégré (palette, densité, arrondis, opacité, flou, animations, menu, taille du texte, contraste) + page complète avec couleurs d'étape vérifiées en contraste, aperçu, export CSS/JSON et import | `studio/` |
| **Templates** | Service desk (ITSM), CRM, Administration, Supervision, Analytique : chacun avec ses propres écrans | `templates/` |
| **Playground** | Composants et leurs états (données, chargement, vide, erreur) avec le code, fondations avec contrastes calculés en direct, labo de mouvement, accessibilité | `playground/` |

## Fonctionnalités clés

- **Tableau avancé** (`Velora.table`) : recherche `champ:valeur` et `-mot`, sans accents ; filtres à facettes ; colonnes affichables et réordonnables ; tri multiple (Maj + clic) ; édition directe avec annulation ; vues enregistrées ; sélection et actions groupées ; export CSV ; cartes lisibles sur mobile.
- **Dashboard** (`Velora.dashboard`) :
  - widgets déplaçables à la poignée ou aux flèches ;
  - redimensionnables par la poignée ou par boutons (3/4/6/8/12 colonnes, 1 à 4 rangées) ;
  - masquables et réajoutables, disposition mémorisée ;
  - agrandissement en fenêtre par morph.
- **Inspecteur** (`Velora.inspector`) : consulter et modifier sans quitter la page. Le panneau est ancré sans voile à partir de 1 180 px. Les touches j/k passent à l'élément suivant ou précédent, et la validation est accessible.
- **Kanban et fiche d'étape** (`Velora.kanban`, `Velora.stageDialog`) : c'est la signature V3 généralisée. La carte grandit en fenêtre et change d'étape sans se fermer. Au clavier : Espace, flèches, Espace.
- **Raccourcis** :

  | Touche | Action |
  |---|---|
  | `Ctrl/⌘ K` | Command Center |
  | `/` | Recherche |
  | `?` | Aide |
  | `g` puis `1-9` | Aller à une section |
  | `n` | Créer |
  | `.` | Centre d'activité |
  | `,` | Studio |
  | `[` | Rail |

## Intégrer dans un projet

```html
<link rel="stylesheet" href="velora/core/velora-tokens.css">
<link rel="stylesheet" href="velora/core/velora-core.css">
<link rel="stylesheet" href="velora/motion/velora-motion.css">
<link rel="stylesheet" href="velora/components/velora-components.css">
<script src="velora/core/velora-tokens.js"></script>
<script src="velora/core/velora-core.js"></script>
<!-- fin de body : seulement les modules utilisés -->
<script src="velora/motion/velora-motion.js"></script>
<script src="velora/components/velora-ui.js"></script>
<script src="velora/components/velora-table.js"></script>
```

Exemples d'API dans `index.html#/integrate` et dans le Playground. Pour modifier les tokens, éditer `core/tokens.json`, puis lancer `node scripts/build-tokens.mjs`.

## Vérification

```sh
node --test tests/unit.test.mjs        # 13 tests : préférences, stockage, moteur de tableau, recherche, dashboard, contraste, export
node tests/contrast.mjs                # audit WCAG : 224 paires, 4 palettes × 2 modes de contraste -> tests/contrast-report.md
node tests/e2e.mjs                     # Chromium + axe-core : 92 vues (23 × 4 palettes), débordement 390/768/1440, parcours -> tests/e2e-report.md
node scripts/capture-previews.mjs      # captures réelles des templates (assets/)
```

`e2e.mjs` et `capture-previews.mjs` demandent Playwright et `axe-core` (dépendances de développement uniquement).

**Ce que la recette a corrigé** :
- texte secondaire à 85 % sur rouille : 3,9:1, sous le seuil AA ;
- placeholder Light : 4,39:1 ;
- intitulés accessibles qui ne contenaient pas le texte visible (WCAG 2.5.3) ;
- rôles ARIA du kanban ;
- débordement mobile de la matrice de permissions.

**Limites** :
- Pas de test avec un lecteur d'écran réel (NVDA, VoiceOver).
- Pas de backend : les modèles sont des points de départ avec données locales (`localStorage`), pas des produits finis.
- La licence des références d'origine reste inconnue (voir la fiche de la collection).

## Charte : décisions et raisons

Ce tableau trace chaque choix (antislop R-31).

| Décision | Raison |
|---|---|
| Toile pêche-sauge fixe, Urbanist, couleurs d'étape jaune/sapin/rouille/charbon | ADN V3, mesuré sur la vidéo source (voir `../v3/CHARTE.md`) |
| Givré sur toutes les surfaces, contrôles en capsule, dashboard en grille de widgets | **Choix explicite du propriétaire**, qui l'emporte sur antislop R-10, R-11 et R-05. Garde-fous : opacité minimale 50 %, contraste vérifié dans le pire cas, option « contraste renforcé ». |
| Couleur d'une tuile = étape de l'objet, jamais la priorité | Règle V3. La priorité P1 à P4 est un texte dans une capsule, lisible sur toutes les couleurs. |
| Statut = forme + libellé + couleur | Reste lisible sans la couleur (daltonisme, impression). |
| Palette de graphiques distincte : `#1a7f5a #b07d0a #5470b8 #c94f2a` (sombre : `#35a077 #bd912a #7a98dc #e36f4a`) | Validée par le script dataviz (bande de luminance, chroma, séparation en vision daltonienne). Quatre séries au maximum ; au-delà, elles sont regroupées en « Autres ». |
| Les données par étape reprennent les couleurs d'étape | La couleur suit l'entité (CRM) ; légende, pourcentages et vue tableau assurent la lisibilité. |
| Ressort uniquement sur les contrôles ; morph sans rebond | La géométrie partagée doit rester lisible (règle V3). |
| Les animations ne bloquent jamais une saisie ; une navigation en interrompt une autre | « Interruptibles, sans ralentir l'utilisateur ». |
| La préférence système « réduire les animations » l'emporte toujours | WCAG 2.3.3. Le direct de la supervision dispose d'un bouton pause (WCAG 2.2.2). |
| Identité sobre : pile de cartes d'étape comme motif des états vides | Rappelle les objets du produit, pas une illustration générique. |
| Interface en français, données marquées « démonstration » | Projets cibles francophones ; aucune donnée présentée comme réelle (R-38). |
| Code multi-fichiers sans script de synchronisation | Remplace le `sync.py` de la PR #4, qui réécrivait le HTML par remplacement de chaînes (antislop R-33). |
