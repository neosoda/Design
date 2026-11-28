# Velora UI V4

*Soft by nature, fluid by design.*

Une évolution additive de la V3 : même grammaire pêche-sauge, mêmes cartes métier et interactions CRM, avec une couche de personnalisation et des composants génériques. La V2 et la V3 restent intactes.

## Démarrage

Ouvrir `prototype.html` dans Chromium, Firefox ou un navigateur moderne. Le prototype est autonome (HTML/CSS/JS embarqués ; Urbanist via Google Fonts, repli système hors ligne). Toutes les données sont fictives. Les préférences et les espaces de démonstration sont stockés localement, sans serveur.

| Module | Contenu |
|---|---|
| Core | Base CSS et tokens de surface, Light, Dark, Ivory et Mist ; densité, rayon, transparence, contraste. |
| Motion | Transitions, skeleton, réglage signature/subtil/instantané, respect des préférences système. |
| Components | Inspecteur, contrôles, tableaux, états vides/erreur, notifications, boutons et statuts. |
| Studio | Panneau de personnalisation depuis Settings ou Ctrl+K ; préférences persistantes et réinitialisation. |
| Templates | Cinq profils métier CRM, ITSM, Administration, Monitoring et Analytics dans un espace générique interactif. |
| Playground | Catalogue interactif de composants et états, depuis l'onglet Playground. |

## Utilisation

- **Overview** : Customize dashboard permet de réordonner les quatre widgets existants (drag ou boutons), et de modifier leur largeur par paliers 4/6/8/12 colonnes. Reset layout restaure la grille V3.
- **Templates** : cinq jeux de données fictives indépendants ; recherche, filtre, tri, colonnes, édition directe du statut et de l'équipe, panneau de détail/édition, création, vues nommées mémorisées. Un profil peut être ouvert avec `prototype.html?template=itsm#workspace` (remplacer par crm, admin, monitoring ou analytics).
- **Command Center** : Ctrl/Cmd+K ouvre la palette existante enrichie d'actions, de favoris et d'actions récentes.
- **Activity center** : icônes de notification et de boîte de réception ; historique des actions instrumentées, filtre non lu et marquage lu.
- **Mobile/tablette** : rail accessible via le bouton de menu sous 760 px ; la préférence desktop n'est pas modifiée.

## Sources et maintenance

- `base.css` : fondations, composants CRM et styles hérités de V3.
- `core.css` : tokens et préférences V4.
- `motion.css` : grammaire de mouvement additionnelle.
- `components.css` : composants et responsive V4.
- `extension.js` : logique V4 intégrée dans le scope du prototype CRM ; ce n'est pas un package JS autonome.
- `prototype.html` : démonstrateur complet autonome, incluant la base V3.
- `sync.py` : régénère les blocs embarqués depuis les sources, sans dépendance Python externe.

Importer les quatre CSS dans cet ordre pour réutiliser les classes. Adapter les composants et la logique au produit cible, ne pas copier les données CRM fictives. Après édition d'un module :

```sh
python sync.py
python sync.py --check
node tests/unit.mjs
```

Recette navigateur (facultative, dépendance de développement uniquement) :

```sh
pip install playwright
python -m playwright install chromium
python tests/smoke.py
```

## Limites et critères de livraison

- Les cinq profils partagent un même moteur et une même structure : ce sont des templates de démarrage, pas cinq produits métiers complets.
- Pas de backend, d'authentification, de persistance distante ou de données de production. Les mutations CRM héritées de V3 ne sont pas toutes persistées.
- Les widgets sont redimensionnables par paliers ; pas de redimensionnement libre pixel par pixel.
- Recette Chromium exécutée (375/390/768/1440 px, zoom 200 %, quatre palettes Light/Dark/Ivory/Mist, clavier/focus, smoke Playwright E2E et contraste WCAG AA mesuré ≥ 4,86:1 — voir [QA.md](QA.md)).
- Ne pas déclarer la conformité WCAG intégrale au-delà des surfaces et parcours vérifiés sans audit lecteur d'écran dédié.
- Licence des références d'origine inconnue : conserver les mentions de provenance et vérifier les droits avant réutilisation.
