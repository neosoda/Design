# Charte UX/UI — Velora UI / référence de transposition
V2 · analyse de 14485.mp4 (576 × 984, 30 i/s, 17,17 s). Cette charte sépare les constats vidéo (V), les estimations (E) et les prescriptions de reproduction (P). Le code source, la police exacte, les règles métier complètes et le responsive original sont inconnus.

## 01 — Signature
**Chaleur éditoriale, contraste maîtrisé, continuité spatiale.** Ce n'est pas un dashboard SaaS avec une palette personnalisée. Le fond unique et calme unifie la page ; les surfaces claires structurent ; les couleurs saturées identifient les objets métier ; les objets restent reconnaissables lorsqu'ils changent de forme, de place ou d'état. L'interface donne la priorité aux intitulés et chiffres, puis aux actions contextuelles. Les animations révèlent ce qui se passe, jamais l'inverse.

## 02 — Fondations visuelles
| Rôle | Valeur | Statut |
|---|---|---|
| Fond pêche / miel / neutre / sauge | #EEDCCC / #EEDEC0 / #E8E7DC / #E9EFE5 | V, pixels composites relevés à 0,30 s |
| Charbon / jaune / vert / rouille | #181815 / #F0C94E / #2B5C4E / #C64720 | V, pixels de cartes et modale (compression) |
| Surface claire | #F3EDE3 à #EFEFEA | V, dépend de la position |
| Texte secondaire | #65655B | P, lisibilité |
| Typographie | Manrope, puis Plus Jakarta Sans | P, candidates à comparer, non identifiées |
| Taille de lecture | 14–16 px ; secondaire 12–13 px ; titres 28–32 px ; KPI 22–26 px | P, desktop, à valider |
| Espacement | 4 / 8 / 12 / 16 / 20 / 24 / 32 px | P |
| Rayons | cartes 20, panels 26, dialogue 32, contrôles capsules | P |

Le fond est global, immobile, diffus et peu saturé. Pas de gradient sur chaque carte, de contour systématique, de texture bruyante ni de blanc pur dominant. Les panneaux clairs doivent se distinguer de la toile sans contraste excessif. Ombres larges, peu opaques. Le texte des cartes jaunes est sombre ; sur vert, charbon et rouille, clair. Vérifier les contrastes réels sur les surfaces composites : couleur + libellé obligatoire. Assombrir localement le rouille si le contraste AA n'est pas atteint, plutôt que diminuer la lisibilité. La police visible est ronde, à chasse compacte, avec titres resserrés et chiffres très présents ; ne pas substituer une police techno ou une graisse massive. Manrope/Plus Jakarta Sans sont des hypothèses à valider par comparaison des glyphes.

## 03 — Composition et densité
**Repère vidéo, pas CSS original (V/E)** : shell x=64 à 565, soit 501 px utiles ; rail x=10–52, y=333–693, largeur 42 px. En-tête logo x64/y18, taille 27 px ; nav y64–93 ; titre x64/y116. Overview : KPI y168–201 ; Revenue x64/y217/l501/h283 ; Hot deals x64/y510/l501/h326 ; cards x77/238/399, largeur ≈153, intervalle ≈8. Team quota et Stage mix : rapport ≈1:2. Board : colonnes x64/267/465, largeur ≈192, marge ≈10, cartes ≈176 ; troisième colonne volontairement tronquée. Le rail reste à hauteur fixe lors du scroll. Les vues ne sont pas toutes bâties sur la même grille : une section graphique pleine largeur, cartes 3 colonnes, fiches 2 colonnes, widgets 1:2 ; Kanban horizontal. Le cadre vertical de la vidéo peut être un recadrage de présentation.

**P** : à 1440 px, réserver ~96 px à gauche, ~24 px à droite ; largeur minimale de colonne 260 px, cartes non forcées à rétrécir. À 768–1024 px, conserver une réserve de rail et adapter la densité ; sous 768 px, proposer rail compact accessible, une colonne si nécessaire, nav défilante, Kanban horizontal. Ne pas inventer un mode desktop original. Cibles tactiles ≥44 px sur mobile, au moins 24 px sur desktop (exceptions WCAG applicables), focus visible. Les grands titres, le rail noir et les zones de respiration doivent garder leurs proportions relatives ; pas de sidebar persistante de 250 px.

## 04 — Bibliothèque de composants
| Composant | Anatomie et règles |
|---|---|
| Shell / nav | Logo compact noir ; marque discrète ; navigation horizontale sans barre de fond ; capsule noire active ; contrôles ronds à droite ; rail vertical noir flottant avec icônes fines, séparateur avant paramètres/lune. Ne pas déduire les actions non filmées. |
| Page header / KPI | Titre sur 1–2 lignes ; KPI : disque iconographique, valeur dominante, libellé gris en dessous, variation en mini-capsule si pertinente. Les chiffres évoluent lors des changements de période et d'état. |
| Surface / chart panel | Contour à peine visible, en-tête discret avec titre et actions rondes ; chiffre principal séparé du chart ; courbe fine, remplissage translucide, axes légers et cible pointillée ; tooltip attaché au point actif. |
| Carte métier | Haut : date/ID + menu rond. Milieu : intitulé (1–2 lignes), contexte secondaire. Bas : valeur métier importante, état/probabilité si applicable, avatars superposés à droite. Couleur de surface = étape. Coins généreux, pas de pictogramme géant. |
| Kanban / colonne | En-tête point, libellé, compteur, total, plus. Colonnes claires arrondies ; liste verticale dense, débordement horizontal. Pendant un drag, carte soulevée et cible matérialisée ; autres cartes ouvrent un espace ; zones Won/Lost séparées en bas. |
| Annuaire / fiche | Avatar photo ou initiales, étoile, nom, rôle, bloc de métriques, jauge fine, segment et actions contextuelles. Fiche détaillée : profil à gauche, données alignées à droite, historique horizontal de cartes colorées en dessous. |
| Dialogue partagé | Même objet, même couleur au départ ; date + fermeture ronde, titre, contexte, grande valeur, stepper segmenté, sous-surface 3 données, avatars avec noms, note, deux CTA. Après changement d'étape, dialogue reste ouvert et s'actualise. |
| Table / drawer | En-têtes discrets, rangées aérées, avatar + texte, statut point/libellé, menu. Drawer droit clair avec arrière-plan flouté, document en surface distincte, actions regroupées. Le paiement change statut, tampon, total et CTA. |
| Contrôles | Bouton principal noir ou crème sur fond sombre ; secondaire contour, icône de 16–20 px ; sélecteur segmenté discret ; champ recherche en capsule ; pas d'icône sans label accessible. |
| Graphiques | Courbes lisses avec area légère, barre segmentée, jauge annulaire, histogrammes empilés, donut ; une hiérarchie colorée constante. Afficher données réelles et libellés, tooltips accessibles. |

## 05 — Motion design : la grammaire principale
Les temps ci-dessous sont des repères de la vidéo, pas des durées CSS certifiées. Le montage et les zooms peuvent amplifier ou accélérer les transitions. Les cibles d'implémentation sont distinctes.

| Séquence | Observation (V) | Prescription (P) |
|---|---|---|
| 0–2,4 s | Courbe, tooltip qui suit la position | 120–160 ms pour le tooltip ; ancrage au point ; aucun déplacement de la page |
| 2,4–3 s | Nav active change ; ancienne vue cède la place ; titres et chiffres se dévoilent ; colonnes arrivent | Shell stable, indicateur actif animé ; sortie 100–140 ms, entrée 250–340 ms ; groupes légèrement décalés (25–45 ms), translation 6–10 px max |
| 3,5–4,5 s | Carte portée, espace libéré dans la colonne, réorganisation et mouvement vers zone de dépôt | DnD avec overlay, animation FLIP 180–280 ms, placeholder exact ; pas de reflow abrupt ; pointeur fluide, animation réservée aux voisins ; annulation |
| 6,4–7,1 s | Annuaire vers fiche ; reconstruction progressive du contenu | Shell stable, transition de 250–340 ms ; retour avec conservation recherche/scroll |
| 7,45–8,05 s | Carte jaune se détache, grandit vers le centre ; fond se floute ; contenu du détail se précise | Transition shared layout (FLIP ou Motion layoutId), ~420 ms. Interpoler x/y/largeur/hauteur/rayon, garder le fond de carte, révéler les détails après le début du morph |
| 8,2–8,5 s | Jaune devient vert ; stepper, probabilité, valeur pondérée, CTA évoluent sans fermeture | 260–360 ms couleur et stepper, 350–500 ms chiffres ; pas de remount du dialogue ; préserver focus |
| 9–9,8 s | Dialogue revient vers sa carte d'origine, maintenant verte | Morph inverse ~380–420 ms, restaurer focus/scroll, mise à jour unique de l'état |
| 11,85–14,4 s | Drawer apparaît à droite ; gros plan possible du montage ; paiement visible par tampon et CTA | Slide 280–340 ms + blur léger ; tampon 220–300 ms avec rotation stable, mises à jour dérivées, pas de confettis |
| 15,5–17 s | Graphiques et chiffres se construisent lors de la navigation/changement de période | Animation initiale des séries 450–650 ms ; transition entre données plutôt que replay complet ; axe stable si pertinent |

**Courbes proposées** : cubic-bezier(.22,1,.36,1) pour entrées et réorganisation ; (.65,0,.35,1) pour changements réversibles ; spring amorti (sans rebond visible) pour géométrie partagée. Ne pas simuler un zoom caméra permanent. Éviter les entrées de 40 px, les rebonds, les rotations décoratives, les animations infinies, les transitions bloquant les clics. Interrompre proprement un mouvement si l'utilisateur change d'action. Respecter prefers-reduced-motion : états finaux immédiats, sans déplacement/blur animé. Éviter les animations simultanées inutiles hors viewport. Viser 60 Hz (~16,7 ms/frame sur matériel cible), vérifier au profiler ; transforms/opacity privilégiés, blur local et mesuré. Les captures statiques et le prototype ne prouvent pas cette performance.

## 06 — Transposition à SentinelFlow (P, non visible dans la vidéo)
Conserver le langage visuel, pas les workflows CRM. Overview → activité support ; Pipeline → flux de tickets ; Customers → demandeurs/organisations ; Customer Information → dossier demandeur avec historique ; Finance → suivi SLA/indicateurs de service si pertinent ; Growth → reporting. Ne pas créer de modules Finance/Sales inutiles. Les couleurs doivent représenter les étapes de traitement, pas mélanger étape et priorité. Proposition : jaune À qualifier, vert En cours, rouille En attente, charbon Résolu. Priorité P1–P4 indépendante, avec texte et marqueur. Les tickets portent ID/date, sujet, contexte, délai SLA ou temps de résolution et équipe. Ne jamais présenter des durées fictives comme données réelles.

## 07 — Critères d'acceptation et boucle de réalisation
1. Cartographier chaque écran cible sur les captures (structure, dimensions relatives, états, règles de couleur). Définir les écarts assumés (domaine, accessibilité, largeur cible).
2. Implémenter les tokens, primitives et shell, puis les écrans. Capturer à 576 × 984 pour comparaison de géométrie si le rendu est comparable ; vérifier aussi 1440, 1024, 768, 390 px. Ne pas juger uniquement une miniature.
3. Vérifier les transitions dans des enregistrements à 30/60 i/s : morph aller/retour, drag et reflow, statut sans remount, navigation, graphiques. Mesurer les temps, vérifier qu'un clic rapide n'entraîne pas de blocage. Comparer les frames-clés aux sources.
4. Tester clavier, focus, fermeture, annulation, contraste AA, mode reduced motion, overflow volontaire/non volontaire, données réelles et cohérence des agrégats. Vérifier état vide, chargement, erreur, permissions, échec réseau. Ne pas masquer l'erreur par l'animation.
5. Corriger chaque écart mesurable, rejouer les tests et capturer à nouveau. Arrêter lorsque la checklist est verte et que la comparaison visuelle et animée ne présente plus d'écart majeur non justifié, ou déclarer les limites. Aucun critère ne peut être considéré validé sans preuve. Limiter les cycles à 3 par bloc puis réévaluer les blocages ; pas de refonte hors périmètre ni de dépendance ajoutée sans justification.

## 08 — Anti-patterns
Sidebar admin classique, gris/bleu SaaS par défaut, grille uniforme sans hiérarchie, fonds criards, glassmorphism appuyé, bordures contrastées, badges partout, petites cartes identiques sans respiration, texte pâle illisible, CTA multipliés, modal générique blanche à la place du morph, re-render brutal des colonnes, métriques décoratives ou incohérentes, animations sans rapport avec l'action.

Sources : 38 frames datées dans frames/, directement extraites de 14485.mp4 ; visualisation interactive dans charte.html. Les spécimens interactifs sont des reconstructions locales avec données fictives, pas un CRM/ITSM complet.
