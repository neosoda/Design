# Design Studio

Bibliothèque de directions artistiques originales, transférables entre produits et frameworks. L'identité ne doit jamais dépendre d'un logo ou d'un simple changement de couleur.

## Catalogue de production

| Identité | Terrain | Composition distinctive | État |
|---|---|---|---|
| Velora | CRM, SaaS | Rail flottant, rythme organique, V4 Studio | Validé (V4 fusionnée, WCAG AA ≥ 4,86:1, smoke Chromium) |
| Nexora | ITSM | File de travail et tableau dense | Existant |
| Lumera | Portails | Bento éditorial, verre chaud | Existant |
| Axiom | Analytics | Rail violet, panneaux analytiques | Existant |
| Forma | Institutionnel, documentation | Grille suisse, index éditorial, signalétique | Validé (94/100, Rams 29/30, recette Chromium & WebP) |
| Vector | Supervision, cyber | Panneaux de télémétrie, carte topologique, chronologie | En cours (Vague 1) |
| Opaline | Commerce premium | Photographie de produit, asymétrie, matière | À construire |
| Tempo | Collaboration | Liste, planning, document de travail | À construire |
| Meridian | Finance | Chiffres alignés, journal et allocation | À construire |
| Bloom | Formation | Leçons, progression et exercices | À construire |
| Monolith | Outils développeurs | Console, inspecteur, diff | À construire |
| Gazette | Presse et blogs | Une éditoriale, rubriques, lecture longue | À construire |
| Orbit | Agents IA | Graphe de tâches, traces et interventions | À construire |
| Habitat | Domotique | Pièces, commandes et états immédiats | À construire |
| Canvas | Création | Surface de travail, bibliothèque et inspecteur | À construire |
| Atlas | Exploration | Carte, liste synchronisée et fiches | À construire |

Les noms sont des noms de travail, pas des marques vérifiées juridiquement. Les ressources existantes restent intactes.

## Méthode de création

1. Cadrer trois cas réels et leur tâche prioritaire. Choisir le mode persuasion, lecture, opération ou expérience ; préciser appareils, données, densité, contexte.
2. Étudier trois structures réellement différentes, choisir celle qui sert la tâche. Décrire ce qui la distingue des autres thèmes sans couleur ni logo.
3. Définir matière, composition, typographie, règles de marque, tokens primitifs/sémantiques/composants, états et motion. Écarter les effets qui n'ont pas de rôle.
4. Construire un prototype autonome et au moins trois surfaces ou parcours représentatifs ; utiliser des données fictives explicitement signalées. Aucun bouton factice.
5. Tester, critiquer, corriger. Une revue distincte de l'implémentation est obligatoire ; si un second agent est disponible, lui confier la critique sans lui montrer les justifications.
6. Photographier le vrai rendu (desktop, tablette, mobile), vérifier liens, accessibilité, clavier, focus, contraste, zoom, mouvement réduit, erreurs, performances. Une illustration SVG n'est pas une capture.
7. Documenter les tests réellement exécutés. Ne déclarer « validé » qu'après recette navigateur. Conserver source, licences et limites ; mettre à jour le catalogue et le tableau ci-dessus à chaque cycle.

## Skills Agent Commons

Source : [catalogue](https://github.com/neosoda/agent-commons/blob/main/catalog/skills.json). Un skill catalogué n'est pas nécessairement installé. Découvrir avec `agent-commons skills route "<mission précise>" --json`, charger les skills installés via `agent-commons skills load <id>`. Ne pas installer sans autorisation. Lire uniquement les références utiles.

| Rôle | Skills candidats |
|---|---|
| Orchestration | universal-product-engineering |
| Direction artistique | frontend-design, frontend-design-direction, hallmark (nouvelle création), brand |
| Architecture et utilisabilité | ux-psychology, ui-ux-pro-max, design-system |
| Critique | impeccable, design-is |
| Accessibilité | frontend-a11y |
| Diagrammes et mouvement | diagram-design, motion-educator (seulement si le besoin le justifie) |
| Vérification | browser-qa, webapp-testing, verification-loop, 100x et 100x-judge si disponibles |

Ne pas cumuler mécaniquement des skills contradictoires. Le brief et le système verrouillé priment ; documenter les arbitrages, versions, skills effectivement lus et outils effectivement exécutés. Le routeur UPE reste unique ; 100x est un spécialiste optionnel.

## Contrat anti-slop

Pas de grille de cartes par défaut, d'eyebrows systématiques, de faux KPI, de gradient décoratif récurrent, de glassmorphism sans fonction, de textes marketing interchangeables, ni de motion qui retarde une tâche. Une exception doit répondre à un besoin réel et être justifiée. Préserver conventions de navigation et contrôles natifs. Pas de capture fictive, pas de conformité WCAG revendiquée sans mesure. Les graphismes doivent être originaux ou correctement licenciés.

## Loop Engineering

Un thème à la fois. Analyser → concevoir → implémenter → tester → critiquer → corriger → valider. Maximum 8 cycles par thème dont un final ; 3 tentatives par défaut bloquant ; interrompre après 2 cycles sans progrès vérifié. Réserver un budget pour les captures et la recette. Si la recette est impossible, marquer le thème « prototype initial » ou « à vérifier », ouvrir une PR et laisser une liste précise de suites. Ne pas modifier les thèmes validés par effet de bord.

## Livrables

`README.md`, `metadata.json`, `preview.svg/webp`, `files/DESIGN.md`, `files/tokens.css`, `files/components.css` (ou section dédiée), `files/prototype.html`, `files/SKILL.md`, journal de recette. Pour les thèmes plus avancés, exemples complémentaires, tests et adaptateurs framework. Lancer `python scripts/catalog.py --check` avant livraison.
