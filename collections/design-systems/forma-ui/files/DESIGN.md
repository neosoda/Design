# Forma UI

Direction : signalétique suisse contemporaine. Un système public et documentaire qui met la typographie, les index et la géométrie au service de l'orientation. Pas un SaaS déguisé en site web.

## Brief

Public : visiteurs d'une institution, lecteurs d'un centre de ressources, usagers qui veulent trouver un service. Démo fictive : Maison des ressources, un centre local. Tâches : comprendre l'offre, filtrer les ressources, consulter une fiche. Trois surfaces dans un HTML autonome : accueil, index et fiches dépliables.

## Identité

Papier froid #F3F4EF, encre #171A1D, bleu outremer #1937A5, secondaire #4A555E, filet #B0B5B6. Le bleu n'est ni un halo ni un gradient : c'est un repère de navigation, de sélection et une surface éditoriale pleine. Le graphisme original représente des feuillets et une ligne de lecture en décalage. Le mot-symbole Forma se suffit à lui-même ; l'index reste reconnaissable sans marque.

Typographie : famille sans-serif néo-grotesque, Helvetica Neue / Arial en fallback autonome, corps 16px, titres clamp 36–88px, graisse 700, approche -0.035em. Aucune police distante ; une police licenciée auto-hébergée peut remplacer le fallback après recette. Texte courant 65–75 caractères max. Les codes de documents seuls peuvent utiliser des chiffres tabulaires.

## Composition

- Desktop : colonne texte d’environ 59%, titre monumental et motif signalétique à droite ; index sous le hero. Grille à alignements francs, pas de collection de tuiles.
- Index : une ligne par ressource, catégorie, titre, description, détail natif. Le titre a priorité sur les métadonnées ; aucun arrondi systématique.
- Mobile : lecture verticale, navigation wrap, barre de filtre empilée, zone d'action au moins 44 px. Ne jamais masquer de contenu pour gagner de la place.
- Filet fin pour séparer des lignes qui ont réellement une relation. Pas d'ombre, pas de blur, pas de glass.

## Composants et états

Navigation par ancres, action primaire pleine, champ de recherche avec label, sélection de catégorie native, bouton de réinitialisation, index filtrable, état vide avec solution, accordéon details/summary. Sans JS, toutes les ressources restent lisibles ; les filtres sont masqués. Les changements de filtre annoncent le nombre de résultats. L'interface est conçue avec des états focus visibles et réduit les mouvements non essentiels ; aucun chargement ou erreur réseau artificiel dans cette démo locale.

## Réutilisation

Importer tokens.css avant components.css (styles intégrés dans la démo autonome). Garder les sélecteurs sous une racine d'application en intégration réelle. Remplacer les contenus fictifs par des ressources réelles, conserver les libellés accessibles. Adapter la structure, non seulement la palette. Pas de certification WCAG avant audit complet.

## Recette

Contraste des couples principaux, clavier, recherche sans résultat, réinitialisation, détails natifs, absence de JS, zoom 200%, 360/768/1440 px, impression et mouvement réduit. Vérifier la lisibilité réelle de la typographie. Tests de navigateur non exécutés à ce stade ; les SVG de présentation sont illustratifs.
