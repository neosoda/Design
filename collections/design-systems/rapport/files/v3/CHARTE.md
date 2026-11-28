# Charte UX/UI — Rapport · v3 (fusion Claude × ChatGPT)
Analyse de 14485.mp4 (576 × 984, 30 i/s, 17,17 s). Cette version fusionne la charte v2 de ChatGPT (structure, mesures de composition, contrat de conception, transposition SentinelFlow) avec le prototype de Claude, qui devient la **référence exécutable** (`prototype/index.html`).

Statuts : **V** constat vidéo · **E** estimation · **P** prescription · **I** implémenté dans le prototype et vérifié (navigateur headless, 1280 × 900 et 390 × 844, thèmes clair et sombre, zéro erreur console). Quand un point I contredit un point P de la v2, l'arbitrage et sa preuve sont au §10. Le code source, les règles métier et le responsive d'origine restent inconnus.

## 01 — Signature
**Chaleur éditoriale, contraste maîtrisé, continuité spatiale.** Ce n'est pas un dashboard SaaS repeint. Un fond unique et calme unifie la page ; les surfaces claires structurent ; les couleurs saturées identifient les objets métier ; un objet reste reconnaissable quand il change de forme, de place ou d'état. Priorité aux intitulés et aux chiffres, puis aux actions contextuelles. Le mouvement explique ce qui se passe, il ne décore pas.

## 02 — Fondations visuelles
| Rôle | Valeur retenue | Statut |
|---|---|---|
| Toile | dégradé radial pêche #F1DAC0 (haut gauche) → neutre #ECE6DC → sauge #DFEBDD (bas droite), fixe | V + I |
| Charbon / jaune / vert / rouille | #181815 / #F0C94E / #2B5C4E / #C64720 | V (relevés v2 sur la grande surface de la modale, plus fiables que les petites cartes) |
| Surfaces | panneau givré rgba(248,245,239,.70) + blur 18px, liseré blanc .65 ; solide #F7F4EE (drawer, palette) | I |
| Texte secondaire | **#65655B** (5,1:1) — l'ancien #7A7D78 du prototype v1 échouait (3,6:1) | P v2 → I |
| Typographie | **Urbanist** 400/500/600, chiffres tabulaires ; repli Outfit | V mesuré (§10) |
| Tailles | légende 12 ; corps 15 ; titre de carte 16 ; KPI 20 ; chiffre de panneau 26–31 ; titre de page 28–35 ; montant de modale 36–44 | I |
| Espacement | 4 / 8 / 12 / 16 / 20 / 24 / 32 px | P + I |
| Rayons | carte 18, colonne 22, panneau 24, drawer 28, dialogue 30, contrôles capsules | V + I |

Le texte des cartes jaunes est sombre ; sur vert, charbon et rouille, il est blanc, et les libellés secondaires restent à 85 % d'opacité (72 % donnait 3,2:1 sur rouille). Pas de gradient par carte, pas de contour systématique, pas de blanc pur dominant. Ombres larges et peu opaques. Tous les tokens sont dans `tokens.css` (noms v2 conservés, valeurs du prototype).

## 03 — Composition et densité
**Repères vidéo (V, v2)** : shell x=64→565 (501 px utiles) ; rail x=10–52, y=333–693 ; en-tête logo y18, nav y64–93, titre y116. Overview : KPI y168–201 ; Revenue y217/h283 ; Hot deals y510/h326 ; cartes ≈153 px, intervalle ≈8 ; Team quota / Stage mix ≈ 1:2. Board : colonnes ≈192 px, troisième volontairement tronquée. Le rail garde sa hauteur au scroll.

**Responsive implémenté (I)** — la vidéo ne montre qu'une largeur, le reste est une extrapolation assumée :
| Largeur | Comportement |
|---|---|
| ≥ 1040 px | Overview en 8/4 : Revenue à gauche, Team quota + Stage mix empilés à droite, Hot deals pleine largeur |
| 600–1040 px | Ordre de la vidéo : Revenue, Hot deals, puis Quota 5/12 + Stage mix 7/12 |
| < 600 px | Une colonne ; hot deals en 2 colonnes ; tables en défilement horizontal (min 640 px) |
| < 560 px | Rail masqué (la palette ⌘K et le dock restent) ; nav défilante |
Contenu max 1200 px, marge gauche réservée au rail compact (78–100 px). En mode déplié permanent, le contenu réserve la largeur du rail et une marge de 16 px ; en mode automatique, le rail s’ouvre temporairement au-dessus du contenu sans le déplacer. Kanban : colonnes `clamp(210px, 24%, 290px)`, hauteur `clamp(380px, 100vh − 440px, 760px)`, défilement horizontal avec aimantation. Cibles ≥ 44 px au doigt (boutons ronds 38/32 px sur desktop).

## 04 — Bibliothèque de composants
| Composant | Anatomie et règles |
|---|---|
| Shell / nav | Logo carré charbon + « rapport » ; nav horizontale sans fond ; capsule noire active ; boutons ronds à droite (point rouille = notification) ; rail noir flottant à icônes fines, info-bulle qui glisse au survol, séparateur avant réglages/lune. |
| Dock | Capsule noire centrée en bas : point jaune pulsé, compteur « deals closing this month », bouton jaune « Review ». (V partiel : seule la capsule est visible dans la vidéo ; le contenu est I.) |
| En-tête de page / KPI | Titre 2 lignes ; KPI = disque d'icône 40 px, valeur, libellé gris dessous, mini-capsule de variation (vert, jaune, rouille, neutre). |
| Panneau graphique | Titre + segmenté (6M/12M) + boutons ronds ; chiffre principal avec phrase de contexte ; légende ; courbe Catmull-Rom 2,2 px, aire translucide en dégradé, cible pointillée ; info-bulle accrochée au point actif avec ligne guide. |
| Carte métier | Haut : date (« Closes Oct 22 ») + menu rond 28 px. Milieu : intitulé 16 px sur 1–2 lignes, contexte. Bas : montant 19 px + (option) « Étape · probabilité », avatars superposés à droite. **Couleur de fond = étape**, jamais la priorité. |
| Kanban | En-tête : point, libellé, compteur, plus ; total sous l'en-tête ; liste masquée en fondu bas ; zones Won / Lost collantes sous le board. |
| Annuaire / fiche | Carte : avatar, étoile, nom, rôle · société, bloc 2 métriques, jauge santé (rouille < 60, vert sinon), segment, mail/appel. Fiche : profil (anneau de santé + badge score) à gauche, informations éditables à droite, historique horizontal de cartes colorées, tâches cochables. |
| Dialogue partagé | Né de la carte (§05) : date + fermeture, titre, contexte, montant, stepper 5 segments, sous-bloc 3 données (clôture, probabilité, pondéré), avatars nommés, note, 2 CTA (« Open in pipeline », « Move to … »). Reste ouvert quand l'étape change. |
| Table / drawer | Rangées aérées, avatar + société/contact, échéance + délai relatif, statut point + libellé, menu. Drawer droit sur fond flouté ; facture sur papier distinct ; « Mark paid » → tampon PAID, statut, « Total paid », pied de page. |
| Palette ⌘K (I) | Recherche pages / clients / deals / factures, groupée, flèches + Entrée, Échap. |
| Création rapide (I) | Dialogue centré (deal, client, tâche, facture) ; le nouvel objet apparaît à sa place avec animation. |
| Graphiques | Courbe + aire ; jauge annulaire ; barre segmentée ; histogrammes empilés sur pistes claires (barre courante en gras/rouille) ; donut avec survol qui isole un segment. |

### Rail latéral rétractable (évolution du thème)
- **Compact (44 px, par défaut)** : icônes seules, infobulles au survol et au focus clavier.
- **Déplié (208 px)** : icônes et intitulés visibles en permanence ; la zone de contenu s’adapte sans recouvrement.
- **Automatique** : le rail s’étend au survol souris/stylet ou au focus clavier, puis se replie à la sortie ; Échap ferme l’expansion temporaire.
- Deux commandes intégrées au rail : déplier/replier (choix fixe) et activer/désactiver le mode automatique. Les choix sont conservés dans `localStorage` (`rapport.sidebar.mode`), avec repli sûr si le stockage est indisponible.
- Transition de 260 ms, courbe ease-out du thème, sans rebond ; respect de reduced motion, commandes nommées et états ARIA. En dessous de 560 px, le comportement mobile existant est conservé ; le mode de prévisualisation téléphone force temporairement le rail compact sans modifier la préférence.
- Vérifier les trois modes, persistance, navigation, focus, clair/sombre et responsive. Cette évolution n’est pas incluse dans les validations historiques du prototype.

## 05 — Motion design : la grammaire principale
Les repères temporels de la vidéo ne sont pas des durées CSS certifiées (le montage peut accélérer). La colonne **I** donne ce qui est codé, piloté par les tokens `--motion-*`.

| Séquence | Observation (V) | Implémenté (I) |
|---|---|---|
| 0–2,4 s · courbe | Info-bulle qui suit le pointeur | Info-bulle `translate` 220 ms ease-out ; point + ligne guide ; dessin initial par révélation gauche→droite 1300 ms ; 6M/12M = morph des points (rééchantillonnage) 700 ms, sans rejouer le dessin |
| 2,4–3 s · navigation | Capsule active qui s'étire vers la cible ; ancienne vue s'efface ; titres et chiffres se dévoilent | Capsule : keyframes avec étirement à 45 % (560 ms, `.3,.75,.2,1`). Sortie : opacité + flou 10 px + scale .988, 240 ms. Entrée : blocs décalés de 45 ms, translate 16 px + blur 5 px + désaturation → net, 800 ms. Titre lettre par lettre (22 ms/lettre, flou 7 px). Chiffres : comptage exponentiel de 38 % → 100 % en 1 s, léger flou pendant le défilement |
| 3,5–4,5 s · drag | Carte soulevée **inclinée ≈ 2°**, colonne cible soulignée d'un **fin contour sombre**, voisins qui s'écartent | Clone flottant suivi par lerp 0,32/frame, inclinaison ∝ vitesse plafonnée à 3°, scale 1,04, ombre portée ; placeholder pointillé à la hauteur exacte ; voisins en FLIP 260 ms ; contour 1,5 px encre 55 % ; atterrissage 380 ms `(.2,1.25,.4,1)` + changement de couleur d'étape en fondu ; zones Won/Lost : scale 1,05 au survol, aspiration de la carte (scale .15, 430 ms) ; auto-défilement aux bords ; au doigt : appui long 280 ms |
| 6,4–7,1 s · annuaire → fiche | Reconstruction progressive | Transition de page standard ; anneau de santé qui se trace (1,4 s) ; **retour : filtres, recherche et scroll conservés** |
| 7,45–8,05 s · carte → dialogue | La carte grandit vers le centre en gardant sa couleur ; fond flouté ; détails révélés ensuite | Interpolation left/top/width/height/rayon/couleur 560 ms `(.32,.72,0,1)` ; contenu à largeur finale, révélé en cascade à partir de 140 ms ; scrim flou 10 px |
| 8,2–8,5 s · changement d'étape | Jaune → vert, stepper, probabilité, pondéré, CTA évoluent sans fermeture | Couleur 550 ms, segments 600 ms, chiffres comptés depuis l'ancienne valeur, libellé du CTA en fondu croisé ; toutes les cartes du même deal recolorées ; pas de remount |
| 9–9,8 s · retour | Le dialogue revient vers sa carte, désormais verte | Morph inverse 440 ms vers la position **actuelle** de la carte, ou fondu si elle n'est plus visible ; focus rendu à la carte |
| 11,85–14,4 s · drawer | Glissement à droite, fond flouté, tampon | Drawer 550 ms `(.32,.72,0,1)` ; tampon : scale 2,6 → 0,92 → 1 avec rotation −10°, 550 ms, + secousse du papier ; statut, total, pied, table et vieillissement mis à jour |
| 15,5–17 s · graphiques | Séries et chiffres qui se construisent | Barres empilées : croissance de droite à gauche (45 ms/colonne, 60 ms/segment) ; donut segment par segment (110 ms) ; changement de période = transition des valeurs, axes stables |

**Courbes** : `ease-out (.22,1,.36,1)` entrées et réorganisations ; `ease-in-out (.65,0,.35,1)` changements réversibles ; `sheet (.32,.72,0,1)` géométrie partagée ; `spring (.34,1.45,.64,1)` **réservé aux contrôles** (boutons, knob, étoile, zones). Interruptions : une navigation pendant une transition est mise en file ; un overlay fermé deux fois est ignoré. `prefers-reduced-motion` : toutes les durées tombent à 1 ms via les tokens, inclinaison 0, états finaux immédiats. Animer d'abord transform/opacity ; le flou reste local et bref.

## 06 — Accessibilité (I, vérifiée)
| Contrôle | Résultat |
|---|---|
| Texte secondaire #65655B sur surface | 5,1:1 ✓ (ancien 3,6:1 ✗) |
| Blanc sur rouille #C64720 / vert #2B5C4E | 4,9:1 ✓ / 7,7:1 ✓ |
| Encre sur jaune | 10,9:1 ✓ |
| Statuts « Due » #7A5A06 / « Overdue » #A23818 sur piste | 5,0:1 ✓ / ≥ 4,5:1 ✓ (la rouille pure n'atteint que 3,8:1 en petit texte, d'où l'assombrissement local prescrit en v2) ; toujours doublés d'un point et d'un libellé |
| Overlays | fond `inert` (clavier et lecteurs d'écran bloqués derrière), Échap ferme le plus haut, **focus rendu à l'élément d'origine** |
| Clavier | cartes focusables, Entrée ouvre ; ⌘/Ctrl+K palette ; segmentés en `role=tab` + `aria-selected` ; étoiles et filtres `aria-pressed` |
| Tactile | appui long 280 ms pour saisir une carte, défilement préservé sinon |

## 07 — Transposition à SentinelFlow (P)
Conserver le langage visuel, pas les workflows CRM. Overview → activité support ; Pipeline → flux de tickets ; Customers → demandeurs / organisations ; Customer Information → dossier demandeur avec historique ; Finance → SLA / indicateurs de service si pertinent ; Growth → reporting. Pas de module Finance/Sales inutile.

Couleurs = **étapes de traitement** : jaune À qualifier, vert En cours, rouille En attente, charbon Résolu ; la carte claire « Won » devient Clos. Priorité P1–P4 indépendante, avec texte et marqueur, jamais une couleur de fond. Une carte ticket porte ID + date, sujet, contexte (site / équipe), délai SLA restant ou temps de résolution, assignés. Ne jamais présenter des durées fictives comme réelles.

Dans le prototype, la transposition est un changement de données, pas de code : `STAGES` (clés, libellés, couleurs), `PROB` → cible SLA, `DEALS` → tickets, zones Won/Lost → Résolu/Rejeté.

## 08 — Critères d'acceptation
1. Cartographier chaque écran cible sur les captures (`frames/`) ; lister les écarts assumés (domaine, accessibilité, largeur).
2. Tokens → primitives → shell → écrans. Comparer à 576 × 984, puis 1440, 1024, 768, 390.
3. Enregistrer les transitions à 30/60 i/s : morph aller/retour, drag + reflow, statut sans remount, navigation, graphiques. Un clic rapide ne doit rien bloquer.
4. Clavier, focus, fermeture, annulation, AA, reduced motion, overflow, cohérence des agrégats, états vide / chargement / erreur.
5. Corriger, rejouer, recapturer ; 3 cycles max par bloc avant réévaluation.

**État du prototype** : points 2 à 4 vérifiés automatiquement (navigation des 8 vues, drag inter-colonnes et vers Won, morph + avancement d'étape, drawer + paiement, palette, création, mobile, sombre, inert, retour du focus, restauration du scroll). Non couverts : états de chargement / erreur réseau (pas de backend), profil de performance sur matériel cible.

## 09 — Anti-patterns
Sidebar d'admin classique, gris/bleu SaaS par défaut, grille uniforme sans hiérarchie, fonds criards, glassmorphism appuyé, bordures contrastées, badges partout, petites cartes identiques sans respiration, texte pâle illisible, CTA multipliés, modale blanche générique à la place du morph, re-render brutal des colonnes, métriques décoratives ou incohérentes, animation sans rapport avec l'action, rebond sur la géométrie (le rebond est réservé aux contrôles).

## 10 — Arbitrages v1 (Claude) × v2 (ChatGPT)
| Sujet | Claude v1 | ChatGPT v2 | Retenu | Preuve |
|---|---|---|---|---|
| Police | Urbanist | Manrope (hypothèse) | **Urbanist** | Ratio largeur / hauteur de capitale de « $53,010 » : vidéo 4,78 · Urbanist 4,77 · Outfit 4,97 · Manrope 5,00 · Plus Jakarta 5,21 |
| Couleurs d'étape | relevées sur petites cartes | relevées sur la modale | **v2** | grande surface unie = moins d'artefacts de compression ; écart < 3 % |
| Texte secondaire | #7A7D78 | #65655B | **v2** | 3,6:1 → 5,1:1 |
| Inclinaison au drag | jusqu'à 9° | aucune rotation décorative | **≈ 2–3°** | image 3,75 s : carte visiblement penchée, faiblement |
| Colonne cible | fond teinté de la couleur d'étape | non spécifié | **contour sombre 1,5 px** | même image : liseré foncé autour de « Proposal » |
| Durée du morph | 560 ms | ~420 ms | **560 ms** | 7,45 → 8,05 s ≈ 600 ms entre carte et détail net |
| Rebonds | ressorts partout | aucun rebond visible | **ressort sur les contrôles seulement** ; géométrie partagée sans rebond | lisibilité du morph préservée, réactivité des contrôles conservée |
| Overlays | focus initial seulement | inert + restitution du focus | **v2** | testé |
| Retour annuaire | scroll en haut | conservation recherche / scroll | **v2** | testé |
| Tokens | variables locales | `tokens.css` nommé | **noms v2, valeurs v1** | un seul fichier pilote CSS et JS (`--motion-*` lus au démarrage) |
| Livrable | app complète, 8 vues | charte + spécimen | **les deux** | la charte prescrit, le prototype prouve |

## Contenu du dossier
- `CHARTE.md` — ce document.
- `tokens.css` — tokens v3 (clair, sombre, reduced motion).
- `prototype/index.html` — référence exécutable, autonome (police Urbanist via Google Fonts).
- `charte.html` — charte visuelle v2 (ChatGPT), tokens et police mis à jour en v3.
- `frames/` — 38 captures datées extraites de 14485.mp4.

Toutes les données affichées sont fictives.
