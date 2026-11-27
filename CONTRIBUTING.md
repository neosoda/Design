# Ajouter une ressource

Chaque élément a une catégorie principale, un identifiant unique dans cette catégorie et une fiche autonome. Les tags permettent de couvrir les usages secondaires sans dupliquer les fichiers.

## Structure

```text
collections/
  themes/
    nom-de-la-ressource/
      README.md
      metadata.json
      preview.webp
      files/             # facultatif : sources dont le stockage est autorisé
      previews/          # facultatif : variantes et captures supplémentaires
```

Copier le modèle dans [templates/item](templates/item), renseigner les champs et créer un aperçu représentatif. Format conseillé : WebP ou PNG, 16:9, 1280 × 720, lisible en miniature et inférieur à 1 Mo si possible. SVG et GIF acceptés. Une vidéo peut être documentée avec une image fixe et un lien. Ne pas inventer une capture ou présenter une reconstruction comme l'original.

## Métadonnées

- `title` : nom lisible de la ressource.
- `description` : description courte, utile dans la galerie.
- `tags` : mots-clés.
- `source` : URL d'origine ou mention explicite de création personnelle.
- `license` : licence exacte ou « Inconnue ».
- `usage` : `reusable` si la réutilisation est autorisée, `reference` sinon.
- `preview` : nom de fichier de l'aperçu dans le dossier.

Le dépôt est public. Ne publier que les fichiers et aperçus dont la redistribution est autorisée, en respectant les attributions et licences. Pour une ressource propriétaire sans autorisation, utiliser une fiche avec lien vers l'origine et un aperçu original autorisé (par exemple une synthèse graphique non reproduite de la source, clairement identifiée comme telle). Une licence inconnue n'est pas une autorisation de réutiliser.

## Mettre à jour la galerie

À la racine du dépôt, avec Python 3 :

```sh
python scripts/catalog.py
python scripts/catalog.py --check
```

La commande vérifie la présence des fiches et aperçus et actualise les galeries du README principal et des collections. Elle ne modifie pas les textes en dehors des marqueurs de galerie. Inclure les README générés dans le même commit que la ressource. Aucun service externe ni CI nécessaire.
