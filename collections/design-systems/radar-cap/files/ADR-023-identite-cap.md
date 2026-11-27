# ADR-023 — Identité « Cap » : symbole redessiné, Schibsted Grotesk, vouvoiement

- **Statut :** Proposée (08/11/2026). Remplace les choix de symbole et de police d'ADR-017 ; tokens de couleur inchangés.

## Contexte

Le propriétaire juge que l'identité V2 en ligne « fait très IA ». Constats : capsule en capitales espacées au-dessus du titre, puces flottantes en verre dépoli, illustration en dégradés avec halo, lettres fantômes et pastilles numérotées sur cinq cartes identiques, flèches sur chaque bouton, filet coloré à gauche du panneau principal, Space Grotesk très resserrée. Le public est élargi au stage, à l'emploi et à la reconversion ; la page mélangeait vouvoiement et tutoiement.

## Décision

1. **Symbole « Cap »** : la cible ouverte est reconstruite sur une grille de 48 (deux arcs miroirs autour d'un axe à 45°, coupes droites, point corail avancé sur l'axe). Logotypes, favicon renforcé et icônes PWA exportés en SVG et PNG ; mot RADAR vectorisé.
2. **Typographie** : Schibsted Grotesk remplace Space Grotesk pour la marque et les titres (OFL, servie localement par `next/font`, CSP inchangée). Inter reste pour l'interface.
3. **Composition** : landing éditoriale sur ivoire, palindrome R-A-D-A-R comme méthode, statut réel de chaque objectif, liste « disponible / pas encore disponible ». Un seul moment de marque animé.
4. **Voix** : vouvoiement dans toute l'application, les emails et les messages d'erreur. Les assertions E2E sont mises à jour en conséquence.
5. **Icônes PWA** servies comme fichiers de métadonnées Next (`app/icon1.png`…), sans dossier `public` : le Dockerfile standalone n'est pas modifié.

## Alternatives examinées

- **Écho** (deux arcs miroirs verticaux, point centré) : continuité maximale, mais lecture « œil » et « direct radio ».
- **Horizon** (arc sur une ligne d'horizon, point repéré) : récit de transition fort, illisible en 16 px et proche des logos « soleil levant » du recrutement.
- **Monogramme R** (R construit, point dans la contreforme) : très appropriable, mais perd le principe validé de la cible ouverte.
- Garder Space Grotesk : écarté pour son ton « tech » et son usage par défaut dans les interfaces générées.

## Conséquences

- Aucun changement d'API, de schéma, de migration, de source ou de secret.
- Le choix d'objectif à l'inscription (alternance, stage, emploi, reconversion) n'est **pas** livré : il demande un champ persistant et des règles métier (ticket métier distinct, voir handoff §73). L'onboarding l'annonce honnêtement.
- Thème sombre non livré : les tokens sombres sont décrits dans le brandbook, l'activation demandera une vérification composant par composant.
