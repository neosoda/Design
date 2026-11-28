# Axiom UI — Charte UX/UI

*Precision, in motion.*

## Identité

Un workspace analytique : rail violet profond, canevas lavande très pâle, surfaces blanches lisibles et accents violets. Monogramme A et point lumineux. DM Sans pour le texte, Manrope pour les valeurs ; fallback system-ui.

| Token | Valeur | Usage |
|---|---|---|
| --ink | #232239 | Texte principal |
| --accent | #6255ca | Actions et sélection, personnalisable |
| --app-bg | #faf9fd | Canevas |
| --card | #ffffff | Panneaux |
| --border | #eeedf3 | Séparateurs |
| Rail | #3a306c → #17143f | Navigation |
| Rayon panneau | 24 px | Surfaces principales |

Les valeurs d'exécution dans `src/styles.css` font foi, notamment les variantes sombres et contrastes renforcés. Ne jamais utiliser un accent personnalisable comme seul indicateur d'état.

## Architecture et interactions

- Navigation latérale 70 px ou 190 px, préférence mémorisée ; menu mobile indépendant en dessous de 621 px.
- KPI, graphiques SVG, activité, annuaire, catalogue et filtres. Les tableaux défilent horizontalement dans leur conteneur.
- Densités compact / standard / confortable ; recherche, filtres, pagination et export CSV existants.
- Graphiques avec résumé accessible et valeurs consultables sous le tracé ; ne pas inventer d'étiquettes calendaires si les données ne contiennent pas de dates.
- Thème sombre et mouvement réduit ; focus visible et commandes nommées.
- Les données métier restent fictives et en mémoire. Seules les préférences d'interface sont stockées localement.

## Recette avant réutilisation

Compiler TypeScript et Vite ; vérifier les quatre écrans, les trois densités, le rail, la restauration des préférences et la navigation mobile. Contrôler contrastes, focus, clavier, largeur 360/768/1440 px, zoom 200 %, thème sombre et mouvement réduit. Le fichier HTML statique est une référence visuelle ; la démo React est la référence interactive. Aucun résultat de test navigateur n'est revendiqué pour cette évolution.
