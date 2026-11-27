# SentinelFlow

**L'ITSM sans friction.** Référentiel unique de la marque, de l'expérience et du système d'interface de SentinelFlow, version 1.0 du 27 novembre 2026. Il s'adresse aux designers, aux développeurs et aux agents IA qui interviennent sur le produit. Toute décision visuelle ou d'interface se vérifie ici ; ce qui n'y figure pas n'est pas encore décidé.

> Agents IA : lisez ce fichier en entier, puis la section qui concerne votre tâche (UX, UI, implémentation). Les valeurs exactes sont dans `tokens.json`. N'inventez ni couleur, ni rayon, ni ombre : si un besoin n'est pas couvert, signalez-le au lieu de créer une valeur.

## Ce que fait le produit

SentinelFlow est une plateforme de gestion des services informatiques (service desk, parc, CMDB) pour des organisations publiques et multisites françaises : régions et leurs lycées, collectivités, établissements de santé, ETI. Le cas de référence de ce référentiel est une région qui maintient l'informatique de ses lycées avec des techniciens de proximité itinérants, un centre de services et des prestataires externes.

**Critère de décision unique.** La complexité est absorbée par le logiciel, jamais imposée à la personne. Un technicien qui passe huit heures dans la file trouve chaque donnée sans chercher ; une enseignante qui a un vidéoprojecteur en panne obtient de l'aide sans connaître le mot « incident ».

## Positionnement

L'outil de travail des équipes qui maintiennent l'informatique de terrain : il dit, à chaque instant, ce qui demande une action maintenant, où, et avant quand. Il ne se positionne ni comme un outil de supervision (SIEM, SOC), ni comme une plateforme d'entreprise à configurer pendant six mois.

| Ce que nous sommes | Ce que nous ne sommes pas |
|---|---|
| Un outil de travail quotidien, dense et calme | Une vitrine de tableaux de bord |
| Pensé pour le terrain : lycées, bâtiments, salles, tournées | Un outil de SRE pour une infrastructure cloud |
| Honnête sur les délais (SLA en heures ouvrées, calendrier scolaire) | Un compteur anxiogène |
| Souverain par ses choix (polices libres auto-hébergées, aucun appel tiers) | Souverain par un drapeau |

## Personnalité et valeurs

- **Calme.** Rien ne clignote. Le mouvement indique un changement d'état, puis s'arrête.
- **Précis.** Des chiffres alignés, des identifiants en chasse fixe, des délais exacts avec leur calendrier.
- **Attentif.** Le système veille : il prévient avant l'échéance, rattache les doublons, garde les notes hors connexion.
- **Franc.** Une erreur dit sa cause et l'action suivante. Une promesse de délai est tenue ou signalée.
- **Sobre.** Une seule couleur d'action, aucune décoration. La personnalité tient dans la forme, la typographie et la ligne de veille.

## Direction artistique : « Ligne de veille »

Une ligne qui oscille, s'amortit, devient droite, et se termine par un point qui veille. L'oscillation est la turbulence de l'informatique de terrain (pannes, demandes, imprévus) ; la droite est le travail résolu ; le point est la veille qui continue après la résolution.

Cette forme n'est pas un ornement : elle est **le composant SLA du produit**. Dans chaque ligne de tableau, l'échéance se lit comme un trait (temps écoulé), un trait fin (temps restant), une butée (l'échéance) et un point (maintenant). Le logo, la piste SLA, la chronologie, la barre de navigation et les états vides dérivent du même dessin.

Univers : papier légèrement chaud sans être crème, encre presque noire, un seul bleu d'action, filets de 1 px, chiffres tabulaires. On pense à un registre technique bien tenu ou à un tableau de service de dépôt, pas à une salle de supervision nocturne.

## Logo

**Symbole « Onde de veille ».** Une période d'onde amortie (premier lobe ample, second lobe réduit de moitié), qui se raccorde tangentiellement à une droite, suivie d'un point séparé. Trait continu, extrémités arrondies, épaisseur 2,8 sur une grille de 37 × 24. Le point est le seul élément de couleur.

**Logotype.** « Sentinel » en IBM Plex Sans SemiBold, « Flow » en IBM Plex Sans Regular, interlettrage −2 %, vectorisé dans les fichiers livrés. Le contraste de graisse rejoue le passage de la veille au flux.

| Déclinaison | Fichier | Usage |
|---|---|---|
| Horizontal | `sentinelflow-lockup.svg`, `-dark`, `-mono-ink`, `-mono-white` | Barre latérale, documents, e-mails |
| Vertical | `sentinelflow-vertical.svg`, `-dark` | Formats carrés, couverture |
| Symbole | `sentinelflow-symbol.svg`, `-dark`, `-mono-ink`, `-mono-white` | Barre latérale réduite, portail, filigrane |
| Petites tailles | `sentinelflow-symbol-small.svg` | Sous 24 px : amplitude et trait renforcés |
| Icône d'application | `sentinelflow-app-icon.svg`, `-dark` | Tuile 48, rayon 11 |
| Favicon | `sentinelflow-favicon.svg` | 16 à 48 px |
| Logotype seul | `sentinelflow-wordmark.svg` | Quand le symbole est déjà visible à proximité |

**Règles.** Zone de protection : la hauteur du point de chaque côté. Tailles minimales : horizontal 112 px de large, symbole 20 px (en dessous, version petites tailles), favicon 16 px. En monochrome, le point prend la couleur du trait. Sur fond bleu de veille, tout est blanc.

**Interdits.** Recolorer le point d'une autre teinte que `sf-primary` ; ajouter un dégradé, une ombre, un contour, un halo ; incliner ou étirer ; détacher le point pour l'utiliser seul comme logo ; recomposer le logotype dans une autre police ; poser le logo sur une photo sans fond uni.

## Couleur

Chaque teinte a une seule fonction. Le bleu signifie « agir ici » ; le rouge, « critique ou dépassé » ; l'ocre, « attention, attente, interne » ; le vert, « résolu ». La priorité haute est en encre pleine, pas en orange : la couleur reste réservée à ce qui exige une action immédiate. Le thème sombre est composé séparément, jamais inversé.

| Rôle | Jeton | Clair | Sombre |
|---|---|---|---|
| Fond d'application | `sf-canvas` | #F5F5F2 | #111317 |
| Panneau, tableau, champ | `sf-surface` | #FFFFFF | #171A1F |
| Zone secondaire, survol | `sf-surface-2` | #EEEEEA | #1E2228 |
| Filet de structure | `sf-border` | #DEDED8 | #2A2F37 |
| Contour de champ (3:1) | `sf-border-control` | #7F827C | #79818D |
| Texte | `sf-text` | #15181E | #E8EAED |
| Texte secondaire | `sf-text-2` | #454952 | #B3B8C1 |
| Métadonnées (≥ 12 px) | `sf-text-3` | #5E626B | #949BA6 |
| Action, lien, focus | `sf-primary` | #2447C2 | #8EA4F5 |
| Critique, dépassé | `sf-danger` | #B42328 | #F2897F |
| Attention, attente, note interne | `sf-warning` | #895800 | #E2B55C |
| Résolu | `sf-success` | #1B6E46 | #6FCB99 |
| SLA suspendu | `sf-paused` | #5A6372 | #9AA3B2 |

Contrastes calculés pour les deux thèmes (39 paires chacun, aucun échec) : texte courant au moins 5,2:1, contours de champ et anneau de focus au moins 3,5:1. Voir la section Implémentation.

**Dataviz.** Six teintes au maximum, dans un ordre fixe (`sf-dv-1` à `sf-dv-6`), étiquetage direct au bout des courbes plutôt qu'une légende, et toujours une vue en tableau accessible par un bouton. Pas d'anneau, pas de jauge, pas d'aire remplie.

## Typographie

Une seule superfamille, **IBM Plex** (licence SIL OFL), auto-hébergée en woff2 : aucun appel à un service de polices. Plex Sans pour l'interface : chiffres nets, `l` et `1` distincts, lecture longue sans fatigue. Plex Mono pour tout ce qui se recopie ou se compare : numéros de ticket, codes d'équipement, adresses IP, heures, raccourcis.

| Style | Taille / interligne | Graisse | Usage |
|---|---|---|---|
| `display` | 36 / 44 | 600 | Question d'accueil du portail |
| `title-1` | 24 / 32 | 600 | Titre d'écran |
| `title-2` | 18 / 24 | 600 | Panneau, modale |
| `title-3` | 15 / 20 | 600 | Groupe, carte |
| `body-lg` | 16 / 24 | 400 | Portail, textes rédigés |
| `body` | 14 / 20 | 400 | Interface par défaut |
| `body-strong` | 14 / 20 | 500 | Objet de ticket |
| `label` | 13 / 18 | 500 | Boutons, onglets, libellés |
| `caption` | 12 / 16 | 400 | Métadonnées |
| `overline` | 11 / 16 | 600, capitales, +6 % | Groupes du tableau, navigation |
| `kpi` | 28 / 32 | 500 | Chiffre clé, quatre au plus par écran |
| `data` | Mono 13 / 18 | 400 | Identifiants, heures |

Chiffres tabulaires dans toute colonne et tout indicateur. Pas d'italique dans l'interface. Pas de texte justifié. Longueur de ligne de 72 caractères au plus pour les textes rédigés.

## Iconographie

Grille de 16 px, trait de 1,5 px, extrémités franches, angles vifs : un dessin d'ingénieur, cohérent avec Plex. Le jeu de base (58 pictogrammes dans `assets/Icons`) couvre la navigation, les actions et les objets du métier (borne Wi-Fi, switch, serveur, imprimante, téléphone, salle). Une icône accompagne toujours un libellé, sauf dans un bouton d'icône muni d'un nom accessible. Jamais d'émoji, jamais deux styles dans un écran, jamais d'icône décorative dans un titre.

Les fichiers SVG utilisent `stroke="currentColor"` : dans le produit ils prennent la couleur du texte ; affichés comme images, ils sont noirs.

## Ton éditorial

1. **Un fait, puis un délai.** « INC-24830 créé. Échéance de résolution : lundi 30 nov., 08:12. »
2. **Le vocabulaire du demandeur.** « Qui est gêné ? Une personne, une salle, un bâtiment, tout le lycée », pas « Impact : P3 ».
3. **Une erreur dit la cause et la suite.** « La liste n'a pas pu être chargée : le serveur n'a pas répondu en 10 secondes. Vos filtres sont conservés. »
4. **Ni félicitations, ni excuses, ni humour.** Jamais « Bravo ! », « Oups ! » ou « Super, votre ticket a été créé avec succès ! ».
5. **Le verbe exact sur le bouton.** « Résoudre et envoyer », « Prendre en charge », « Rattacher », pas « Valider » ou « OK ».
6. **Le demandeur est nommé.** « Visible par Rémi Delorme », pas « visible par le client ».

## Règles anti-banalité (propres à SentinelFlow)

Chaque règle se vérifie en revue de design. Un écran qui en enfreint une ne part pas.

1. **Un seul bouton plein par vue.** Les autres actions sont en contour ou discrètes.
2. **Aucune carte d'indicateur.** Les chiffres clés sont posés sur une ligne entre deux filets, quatre au plus, et chacun mène à la liste filtrée correspondante.
3. **Aucun anneau, jauge ou aire de graphique.** Des barres dans un tableau ou des courbes étiquetées, avec une vue tableau.
4. **Aucun dégradé, verre dépoli, lueur ou ombre de décoration.** Les ombres n'existent que pour ce qui flotte (menu, modale, toast).
5. **Pas de pastilles de couleur pour les statuts.** Glyphe de forme distincte et libellé ; la couleur vient en plus, jamais seule.
6. **Pas de badge sans conséquence opérationnelle.** « Incident majeur », « Note interne », « Hors ligne » : oui. « Nouveau ! », « Pro » : non.
7. **Rayons de 3, 5 et 8 px seulement.** Le cercle est réservé aux avatars et au point de veille.
8. **Pas de majuscules monospace en en-tête de colonne.** Les capitales espacées sont réservées aux groupes (`overline`).
9. **Pas d'illustration dans les écrans de travail.** L'état vide montre la ligne au repos (une droite et un point), une phrase et une action.
10. **Pas d'écran d'accueil de connexion « marketing » coupé en deux.** La connexion est un formulaire centré.
11. **Pas de texte de remplissage.** Chaque phrase d'interface porte une information ou une consigne.
12. **Le mouvement finit au repos.** Aucune boucle, sauf le chargement des squelettes, désactivé si l'utilisateur réduit les animations.

## Contenu de ce référentiel

| Section | Contenu |
|---|---|
| Analyse et arbitrages | Notation des quatre propositions, registre des idées retenues et de leur provenance, contradictions tranchées |
| UX | Profils, architecture de l'information, parcours, interactions, états, cas limites, accessibilité, responsive |
| UI | Structure des écrans, navigation, tableaux, formulaires, filtres, notifications, modales, écrans métier, thèmes |
| Implémentation | Jetons, variables CSS, conventions, composants, animation, points de rupture, mapping Tailwind et shadcn/ui, liste de contrôle |
| Bilan des itérations | Les cinq boucles, les mesures, les limites restantes |

Le [prototype interactif](https://claude.ai/artifact/H2E7ZbSSngwkLd6zDJp7wC) (`sentinelflow-prototype.html` dans le kit, un seul fichier, aucun appel réseau) démontre les écrans de référence en clair et en sombre, en trois densités, sur ordinateur et en cadre mobile de 390 px, avec cinq états de données. Les captures sont dans `assets/Ecrans`.

**Nom.** Deux propositions sources signalent que « SentinelFlow » est déjà porté par des projets de cybersécurité et qu'un produit « Sentinel ITSM » existe. Une recherche d'antériorité INPI et EUIPO est nécessaire avant tout dépôt. L'identité ne dépend pas du mot : elle tient dans l'onde de veille et la piste SLA.


## Analyse et arbitrages

Quatre propositions ont été produites à partir du même brief. Elles ont été lues en entier (documents, jetons, logos, prototypes) et leurs prototypes ont été rendus et parcourus dans un navigateur. Les notes ci-dessous sont un jugement de concepteur appuyé sur ces observations ; aucune n'a été validée par des utilisateurs.

## Les quatre propositions

**A. « Aiguillage »** (archive `SentinelFlow-design-system`). Des brins qui convergent en une ligne terminée par un nœud. IBM Plex, cobalt et vert de résolution, neutres froids. Prototype sans framework de 20 écrans, quatre parcours, trois densités, audit axe-core et 68 paires de contraste calculées. C'est la proposition la plus mûre : elle connaît le terrain (lycées, tournée, impact par salle ou bâtiment, perturbation affichée au portail).

**B. Stitch** (archive `stitch_sentinelflow_itsm_dashboard`). Un seul écran en anglais pour une équipe SRE (Redis, Kubernetes, US-EAST), jetons générés par Material, Inter et JetBrains Mono. Quelques bonnes idées d'outil de travail (identifiants techniques en chasse fixe sous l'objet, compte à rebours SLA, palette de commandes avec raccourcis). Hors sujet sur le métier et sur la langue.

**C. « Laminaire »** (archive `sentinelflow-kit`). Une onde amortie qui devient droite, close par un point sentinelle. Le meilleur récit de marque et le meilleur guide de principes (personas, tri par défaut, règle des quatre indicateurs, courbe d'animation unique), un kit React et un mapping Tailwind. Mais le prototype contredit ses propres règles : graphique à aire, anneau de répartition, pilules partout, lignes de tableau sur trois lignes, page de connexion coupée en deux. Le symbole dessiné ressemble à un ver à petite taille.

**D. « Repère » V2** (archive `SentinelFlow-Repere-V2`). Sobre et propre : chiffres clés posés sur un filet et cliquables, aperçu latéral du ticket, notes internes séparées, jetons shadcn prêts à l'emploi. Peu de personnalité, logo qui évoque l'icône « plein écran », six vues seulement.

## Notation pondérée

Chaque critère est noté sur 10 puis pondéré selon la grille de la mission.

| Critère (poids) | A Aiguillage | B Stitch | C Laminaire | D Repère |
|---|---:|---:|---:|---:|
| Expérience et ergonomie (20) | 8,5 | 5 | 6,5 | 7 |
| Direction artistique (15) | 7 | 5 | 6 | 6 |
| Cohérence globale (15) | 8,5 | 4,5 | 5,5 | 8 |
| Lisibilité et simplicité (10) | 9 | 6 | 6,5 | 8,5 |
| Originalité (10) | 6 | 3 | 8 | 3 |
| Pertinence métier (10) | 9,5 | 2,5 | 5,5 | 6,5 |
| Accessibilité (10) | 8,5 | 4 | 7 | 7 |
| Faisabilité technique (5) | 7 | 8 | 8 | 8,5 |
| Évolutivité (5) | 8 | 5,5 | 8 | 7 |
| **Total sur 100** | **80,8** | **46,5** | **65,2** | **67,8** |

Observations qui fondent les notes : A, cohérence entre ses règles et son prototype, contrastes calculés, mais un logotype et une interface qu'on confondrait avec beaucoup d'outils ; B, interface générique de tableau de bord (cartes d'indicateurs avec courbes, anneau, badges en capitales monospace) et contexte étranger au brief ; C, écart entre le discours anti-banalité et l'écran livré ; D, ergonomie juste, identité absente.

## Registre des idées retenues

| Idée | Provenance | Ce qu'elle devient |
|---|---|---|
| L'onde amortie qui devient droite, close par un point | C | Symbole « Onde de veille », redessiné : une seule période, raccord tangent, point détaché |
| Le motif de marque devient un composant | A | La piste SLA (trait, butée, point) dans chaque ligne, la chronologie, l'état vide « ligne au repos » |
| IBM Plex Sans et Mono auto-hébergées, fichiers woff2 | A | Unique superfamille du système |
| Glyphe de forme plus libellé pour statut et priorité | A | Cercles (pointillé, demi, pause, horloge, plein coché) et barres de priorité |
| Création en une phrase, impact en mots du demandeur, priorité proposée | A | Champ « Que se passe-t-il ? » et « Qui est gêné ? », échéance calculée en direct |
| Perturbation connue affichée au portail | A | Bandeau avec « Je suis aussi concernée », compteur de signalements |
| Tournée du technicien itinérant, « Je suis sur place » | A | Écran Ma tournée, version mobile dédiée |
| Trois densités, raccourcis J, K, X, Entrée, désactivables | A | Conservé, avec réglage d'accessibilité |
| Thème sombre composé séparément | A, C | Conservé, contrastes recalculés |
| Tri par défaut : échéance SLA puis priorité, groupe « SLA menacés » | C | Tableau groupé : Dépassés, À risque, Dans les délais, Suspendus |
| Quatre indicateurs au plus, tous cliquables | C | Ligne d'indicateurs du pilotage |
| Une courbe d'animation unique, l'interface finit au repos | C | `ease-veille`, durées 120, 180, 240 ms |
| Exemples de ton (un fait et un délai) | C | Six règles de ton |
| Avertissement sur le nom | A, C | Repris tel quel |
| Chiffres clés posés sur un filet, sans carte | D | Ligne d'indicateurs |
| Aperçu latéral du ticket sans quitter la file | D | Panneau d'aperçu, Entrée pour ouvrir la fiche |
| Notes internes séparées des réponses | D, A | Compositeur à deux modes, « Note interne » par défaut, fond ocre |
| Neutres légèrement chauds | D, C | Papier #F5F5F2 : chaud sans être crème |
| Identifiants techniques en chasse fixe sous l'objet | B | Ligne secondaire : lycée, lieu, code d'équipement |
| Palette de commandes avec raccourcis affichés | B, A | Ctrl K, insensible aux accents et aux tirets, équipements cherchables |

## Écarté, et pourquoi

| Élément | Provenance | Raison |
|---|---|---|
| Brins convergents comme logo | A | Lu comme une fourche ou un pictogramme de fusion Git ; l'idée survit dans la piste SLA |
| Vert comme deuxième couleur de marque | A | Le vert signifie « résolu » ; en faire une couleur de marque brouille le signal |
| Deux angles opposés comme logo | D | Se lit comme l'icône « plein écran » |
| Instrument Sans pour les titres, Inter pour le texte | C | Deux familles là où une suffit ; Inter est le choix par défaut de toute génération automatique |
| Cartes d'indicateurs, anneau, aire remplie | B, C | Remplissage visuel sans décision ; remplacés par une ligne de chiffres cliquables et une courbe étiquetée |
| Badges en capitales monospace | B | Bruit visuel, lecture plus lente |
| Contexte SRE en anglais | B | Hors brief |
| Page de connexion coupée en deux avec slogan | C | Gabarit marketing générique |
| Statut « Escaladé » | C | L'escalade est un événement ou un niveau, pas un état ; elle apparaît dans la chronologie |
| Copilote avec étincelle | C | Aucune fonction décrite ; l'assistance réelle (doublon, catégorie, priorité proposés) est intégrée au flux |
| Orange pour la priorité haute | A, C | Trois teintes chaudes (P2, attention, note) se confondaient ; la priorité haute passe en encre pleine |

## Contradictions tranchées

| Contradiction | Décision | Raison |
|---|---|---|
| Neutres froids (A) ou chauds (C, D) | Légèrement chauds, sans crème | Moins d'éblouissement sur huit heures ; le crème franc est devenu un réflexe de génération |
| Inter (B, C, D) ou Plex (A) | Plex | Caractère technique, chiffres et l/1 distincts, une seule superfamille, fichiers déjà libres et locaux |
| Détail en page (A) ou en panneau (D) | Les deux : aperçu pour trier, fiche complète pour traiter | Le tri demande le contexte de la file, le traitement demande la place |
| Densité confortable par défaut (C) ou standard (A) | Standard pour le technicien, confortable au portail | Le technicien voit quinze lignes sans défiler ; le demandeur lit une fois |
| Couleur de priorité sur les quatre niveaux | Couleur pour Critique seulement | La couleur doit signaler l'urgence, pas décorer la hiérarchie |
| Mobile : un empilement ou une mise en page dédiée | Dédiée sous 640 px : cartes, barre d'onglets, actions en bas | Le technicien est debout, une main occupée |

## Angles morts comblés

Aucune des quatre propositions ne traitait complètement ces sujets ; ils sont intégrés au référentiel.

1. **Le calendrier scolaire dans le SLA.** Les délais se comptent en heures ouvrées du lycée, hors vacances de sa zone. Le calendrier appliqué est écrit sous la piste SLA.
2. **Les prestataires externes.** Attente prestataire avec sa référence, SLA suspendu et visible comme tel (trait pointillé, point creux), délai réel comparé à l'engagement dans le pilotage.
3. **Les raisons de suspension.** Demandeur, prestataire, pièce, accès au local : chacune est nommée, jamais une attente anonyme.
4. **Le lieu physique.** Lycée, bâtiment, salle, équipement sont des champs de premier rang et se cherchent dans la palette.
5. **Le doublon à la source.** Pendant la saisie d'un ticket comme au portail, un incident en cours au même endroit est proposé avant l'envoi.
6. **Le travail hors connexion.** Bandeau explicite, notes gardées sur l'appareil et marquées « en attente d'envoi ».
7. **Les fuites de notes internes.** Mode « Note interne » par défaut, fond distinct, mention « Visible par » nommant le demandeur.
8. **Les graphiques inaccessibles.** Toute courbe a sa vue en tableau.
9. **Les chiffres contradictoires.** Les indicateurs du pilotage sont calculés à partir des mêmes données que la file.


## UX

## Profils

Profils de travail construits à partir du brief et des propositions sources. Ce ne sont pas des personas issus d'entretiens : ils sont à confirmer par la recherche (voir le bilan).

| Profil | Situation | Ce qu'il attend | Ce qui le fait échouer |
|---|---|---|---|
| **Technicien de proximité** (Karim) | Itinérant sur six lycées, une tournée par jour, souvent debout, réseau instable | Savoir quoi faire maintenant et où ; noter vite ; prévenir le demandeur sans retaper | Écrans denses sur téléphone, saisie en double, perte d'une note hors connexion |
| **Technicien du centre de services** (Thomas) | Huit heures dans la file, clavier, deux écrans | Trier vite, ne rater aucune échéance, rattacher les doublons | Tri alphabétique, couleurs criardes, souris obligatoire |
| **Demandeur** (Hélène, enseignante) | Deux demandes par mois, entre deux cours, ne connaît pas le vocabulaire informatique | Décrire avec ses mots, savoir quand on lui répond, ne pas relancer | Formulaires à rubriques, statut opaque, devoir signaler une panne déjà connue |
| **Responsable de pôle** (Claire) | Pilote six lycées, quatre techniciens, trois prestataires | Voir où les délais décrochent et pourquoi, agir sur la répartition | Indicateurs décoratifs, chiffres qui ne mènent nulle part |
| **Administrateur fonctionnel** | Paramètre catégories, SLA, calendriers, rôles | Modifier sans casser, voir l'effet avant d'appliquer | Paramètres cachés, effet invisible |

## Principes d'expérience

1. **Ce qui demande une action maintenant est en haut.** Toute liste est triée par échéance SLA puis priorité, groupée par état de l'échéance.
2. **Une phrase suffit pour commencer.** Catégorie, priorité et échéance sont proposées, modifiables, et expliquées.
3. **Le prochain geste est visible.** Un état vide, une erreur, une confirmation proposent l'action suivante.
4. **On annule plutôt qu'on confirme.** Prendre en charge, résoudre, suspendre, réassigner : effet immédiat et toast « Annuler ». Confirmation seulement pour l'irréversible (suppression, fusion définitive).
5. **L'automatisation propose, la personne décide.** Doublon, catégorie, priorité : suggérés avec leur raison, jamais appliqués en silence.
6. **Le sens ne tient jamais à la couleur seule.** Forme, libellé, position.
7. **Tout se fait au clavier, et le clavier peut se taire.** Raccourcis à une touche désactivables.
8. **Un délai est toujours accompagné de son calendrier.** « 4 h ouvrées, lycée Gustave-Eiffel 07:30–18:00, hors vacances zone B. »

## Architecture de l'information

```
Travail
  Aujourd'hui            ce qui m'attend, ma tournée, ce qui est chez les prestataires
  Tickets                vues enregistrées : À moi, Non assignés, SLA menacés, Suspendus, Tous ouverts, Résolus
    Fiche ticket         demande d'origine, chronologie, liés, équipement, SLA, informations
  Ma tournée             étapes du jour, tickets par étape, arrivée sur place
Connaissances            articles, catalogue de services (hors prototype)
Parc                     équipements, lycées, cartographie (hors prototype)
Pilotage                 SLA par lycée, charge, prestataires, flux
Administration           catégories, SLA et calendriers, rôles, journal (hors prototype)

Portail demandeur (chrome distinct, sans barre latérale)
  Accueil                perturbations, « Décrivez le problème », mes demandes, demandes courantes
  Suivi d'une demande    étapes en mots simples, échanges publics uniquement
```

Le portail ne reprend jamais la navigation des techniciens : même système, autre chrome.

## Navigation

- **Barre latérale** (232 px) : groupes Travail, Pilotage, Côté demandeur ; compteur de tickets ouverts ; périmètre (pôle, région) en tête ; personne et présence (« En tournée », « Au pôle ») en pied. Réduite en rail de 56 px entre 1024 et 1279 px, en tiroir en dessous.
- **Barre supérieure** : fil d'Ariane, « Rechercher ou agir » (Ctrl K), « Nouveau ticket » (N). Une ligne de 2 px parcourt la barre au changement de vue, puis s'efface.
- **Palette de commandes** : actions (nouveau ticket, résoudre et m'assigner le ticket ouvert, thème, raccourcis), navigation, tickets, équipements. Recherche insensible aux accents et aux tirets (« eiffel », « ap c2 »).
- **Mobile** : barre d'onglets en bas (Aujourd'hui, Tickets, Tournée, Chercher), actions principales de la fiche fixées au-dessus.
- **Focus** : à chaque changement de vue, le titre de niveau 1 reçoit le focus et la vue est annoncée.

## Parcours de référence

Chaque parcours est jouable dans le prototype et couvert par un contrôle automatisé.

**1. Le technicien traite un incident majeur.**
Aujourd'hui → bandeau « Incident majeur en cours » → Ouvrir l'incident → note interne (Ctrl Entrée) → Résoudre (R) → message au demandeur prérempli, cause, article lié → « Résoudre et envoyer » → toast « Annuler ». Les demandeurs des tickets rattachés sont prévenus.

**2. Le technicien trie la file au clavier.**
Tickets → J et K pour se déplacer → Entrée ouvre l'aperçu → K suit dans l'aperçu → X sélectionne → « M'assigner » en lot → Annuler possible → Échap ferme.

**3. Un doublon est évité à la création.**
N → « Plus de wifi en C206 » → la catégorie Réseau › Wi-Fi est proposée, l'incident INC-24817 au même endroit aussi → Rattacher, ou continuer → « Qui est gêné ? Un bâtiment » → priorité Haute, échéance lundi 30 nov., 08:12 → Créer.

**4. La demandeuse signale une panne.**
Portail → bandeau Wi-Fi : « Je suis aussi concernée » si c'est son cas → sinon une phrase → suggestions d'articles pendant la saisie → Continuer → lieu prérempli, « Depuis quand ? », capture facultative → délai affiché avant l'envoi → confirmation avec numéro et date de réponse → Suivre.

**5. Le technicien arrive sur site.**
Ma tournée (mobile) → « Je suis sur place » → arrivée horodatée, demandeurs prévenus → tickets de l'étape.

**6. La responsable trouve un décrochage.**
Pilotage → « Dépassés en cours : 2 » mène à la vue SLA menacés → SLA par lycée : Gustave-Eiffel sous l'objectif → Charge par technicien → Prestataires : opérateur télécom à 5 jours pour un engagement de 3.

## Interactions

| Geste | Effet | Retour |
|---|---|---|
| Clic sur une ligne | Aperçu latéral | Ligne marquée d'un filet bleu à gauche |
| Entrée sur une ligne en aperçu | Fiche complète | Titre focalisé |
| Prendre en charge | Assigné à moi, état En cours | Toast avec Annuler, 8 s |
| Suspendre… | Menu des raisons, SLA arrêté | Piste pointillée, point creux |
| Résoudre | Modale : message, cause, article | État Résolu, toast avec Annuler |
| Rattacher un doublon | Le doublon suit l'incident principal | Le demandeur est prévenu au rétablissement |
| Changer de densité | 32, 40 ou 48 px par ligne | Préférence gardée |
| Ctrl Entrée | Envoie le formulaire actif | Identique au bouton |

## Gestion de la complexité

- **Divulgation progressive** : l'aperçu montre l'essentiel (lieu, équipement, demande, assigné) ; la fiche ajoute la chronologie, les liens, l'équipement, le calendrier SLA.
- **Vues enregistrées plutôt que filtres complexes** : six vues avec compteur, puis deux filtres (lycée, priorité) et une recherche.
- **Regroupement par échéance** plutôt que colonnes supplémentaires.
- **Colonnes secondaires** (demandeur) visibles seulement au-delà de 1500 px de zone utile.
- **Un écran, une décision** : Aujourd'hui pour agir, Tickets pour trier, Pilotage pour arbitrer.

## États

| État | Comportement | Texte de référence |
|---|---|---|
| Chargement | Squelettes alignés sur les colonnes, reflet désactivé si animations réduites | (aucun texte) |
| Vide, sans filtre | Ligne au repos, phrase, action | « Aucun ticket dans cette vue. Les tickets qui vous sont confiés apparaissent ici dès leur assignation. » + « Voir tous les tickets ouverts » |
| Vide, avec filtre | Rappel du filtre, action | « Le filtre « zzz » ne donne aucun résultat dans cette vue. » + « Effacer les filtres » |
| Erreur | Cause, conservation, action, rôle `alert` | « La liste n'a pas pu être chargée. Le serveur n'a pas répondu en 10 secondes. Vos filtres et votre sélection sont conservés. » + « Réessayer » |
| Hors connexion | Bandeau persistant, écriture locale | « Hors connexion depuis 10:38. Vos notes sont gardées sur l'appareil et partiront au retour du réseau. » |
| Succès | Toast d'un fait et d'un délai, action utile | « INC-24830 créé. Échéance de résolution : lundi 30 nov., 08:12. » + « Ouvrir » |
| Erreur de champ | Sous le champ, cause et consigne, focus sur le champ | « Décrivez le problème pour créer le ticket, même en quelques mots. » |

## Cas limites et situations dégradées

| Situation | Réponse |
|---|---|
| SLA dépassé | Ligne dans le groupe Dépassés, piste rouge prolongée au-delà de la butée, « Dépassé de 35 min » |
| Attente prestataire | SLA suspendu, référence du prestataire visible dans la liste, l'aperçu et le pilotage |
| Incident majeur | Bandeau dans Aujourd'hui et Pilotage, étiquette sur la fiche, doublons rattachés |
| Ticket créé par la supervision | Demandeur « Supervision », événement système en tête de chronologie |
| Demandeur sans technicien assigné | « Non assigné » avec avatar en pointillé, jamais un champ vide |
| Titre très long | Une ligne avec points de suspension dans la liste, deux lignes sur mobile, entier dans la fiche |
| Vacances scolaires | Le décompte s'arrête ; le calendrier est écrit sous la piste |
| Session expirée (à implémenter) | Brouillon conservé localement, reconnexion en modale, retour à l'écran |
| Conflit d'édition (à implémenter) | « Thomas R. a modifié ce ticket à 10:41 » avec choix explicite |
| Panne de recherche (à implémenter) | La palette garde la navigation et les actions locales |

## Accessibilité

Cible : WCAG 2.2 niveau AA, et RGAA 4.1 pour le secteur public.

- Contrastes calculés pour les deux thèmes ; texte courant ≥ 5,2:1, éléments d'interface ≥ 3,5:1.
- Navigation complète au clavier, focus visible (2 px `sf-focus`, décalage 2 px), ordre de tabulation logique, lien d'évitement.
- Modales : piège de focus, Échap, retour du focus, contenu derrière rendu inerte.
- Tableau : lignes focalisables, Entrée, J et K ; sélection par case avec nom accessible.
- Palette : `combobox` avec `aria-activedescendant`, résultats en `listbox`.
- Statuts, priorités, SLA : glyphe et texte ; pour les lecteurs d'écran, la raison d'attente est énoncée.
- Toasts dans une région `status` polie ; changement de vue annoncé.
- Raccourcis à une touche désactivables (critère 2.1.4).
- Cibles d'au moins 24 px partout, 44 px sur mobile et au portail.
- Reflow sans défilement horizontal à 320 px.
- Animations réduites respectées ; contraste forcé (Windows) pris en compte pour les marqueurs.

Vérifié dans le prototype : 0 violation axe-core (règles WCAG 2.0 à 2.2 A et AA et bonnes pratiques) sur 22 états d'écran et 4 dialogues, dans les deux thèmes, à 1440 et 390 px. Non vérifié : lecteurs d'écran (NVDA, VoiceOver), commande vocale, loupe.

## Responsive

| Largeur | Mise en page |
|---|---|
| ≥ 1600 px | Colonne Demandeur ajoutée au tableau |
| 1280 à 1599 px | Barre latérale complète, aperçu de 440 px |
| 1024 à 1279 px | Barre latérale en rail de 56 px, aperçu de 380 px |
| 640 à 1023 px | Aperçu en tiroir plein écran latéral, fiche sur une colonne, indicateurs sur deux colonnes |
| < 640 px | Mise en page dédiée : cartes de tickets, barre d'onglets, actions fixées en bas, modales en feuille depuis le bas |

Dans le prototype, la mise en page mobile s'active sous 640 px et dans le cadre de 390 px : le rendu vérifié sur ordinateur est celui d'un téléphone. En production, utilisez les requêtes de conteneur sur la zone principale plutôt que sur la fenêtre.


## UI

## Structure générale

```
┌──────────┬──────────────────────────────────────────────────────────┐
│ Logo     │ Fil d'Ariane                Rechercher ou agir  Nouveau │  barre 52 px
│ Périmètre├──────────────────────────────────────────────────────────┤
│          │ Titre (title-1)                           commande de vue│
│ Travail  │ Bandeau de perturbation, si actif                        │
│ Pilotage │ Onglets de vues enregistrées                             │
│ Portail  │ Filtre · Lycée · Priorité              aide clavier      │
│          │ ┌ tableau ─────────────────────────────┐┌ aperçu 440 ──┐│
│          │ │ GROUPE                               ││              ││
│ Personne │ │ ligne 40 px                          ││              ││
└──────────┴─┴──────────────────────────────────────┘└──────────────┘┘
  232 px      marges de page 24 px, gouttières 16 px
```

Fond `sf-canvas`, panneaux `sf-surface` cernés d'un filet `sf-border`, rayon 8 px. Aucune ombre sur ce qui est posé. Une seule action pleine par vue.

## Layouts de référence

| Écran | Grille | Contenu |
|---|---|---|
| Aujourd'hui | 1,6 fr / 1 fr | À traiter maintenant (six lignes triées) ; Ma tournée ; Chez les prestataires |
| Tickets | 1 fr, ou 1 fr / 440 px avec aperçu | Vues, outils, tableau groupé, barre d'actions groupées |
| Fiche | 1 fr / 320 px | Demande d'origine et équipement ; onglets Activité, Liés, Équipement ; SLA et Informations à droite |
| Pilotage | 4 indicateurs, puis 1,6 fr / 1 fr | SLA par lycée, flux ; charge, prestataires |
| Portail | colonne de 960 px centrée | Perturbation ; question d'accueil ; Mes demandes et Demandes courantes |

## Navigation principale et secondaire

- Élément de navigation : 32 px, `label` 13 px graisse 400, icône 16 px ; actif : fond `sf-primary-subtle`, texte `sf-primary-subtle-fg`, graisse 500. Pas de barre colorée à gauche.
- Groupes : `overline`, `sf-text-3`.
- Onglets de vues : texte 13 px, compteur en `data-sm` ; actif souligné de 2 px `sf-primary`. Le compteur de SLA menacés passe en `sf-danger` s'il n'est pas nul.
- Fil d'Ariane : `sf-text-3`, élément courant `sf-text` graisse 500, identifiant en chasse fixe.

## Tableau de tickets

| Colonne | Contenu | Largeur |
|---|---|---|
| Sélection | Case 16 px | 36 px |
| Priorité | Barres + libellé (Critique, Haute, Moyenne, Basse) | contenu |
| Ticket | `INC-24817` en `data`, `sf-text-2` | contenu |
| Objet | Objet en `body-strong` sur une ligne ; dessous en `caption` : lycée · lieu · code d'équipement en chasse fixe | reste |
| Assigné | Avatar 22 px + nom court ; « Non assigné » avec avatar pointillé | contenu |
| État | Glyphe 12 px + libellé | contenu |
| Échéance SLA | Piste 56 × 10 + texte | contenu |
| Demandeur | Nom | ≥ 1500 px seulement |

Lignes de 32, 40 ou 48 px selon la densité ; en compacte, la ligne secondaire disparaît. En-têtes `caption` 500 sur `sf-surface-2`, collants. Survol `sf-surface-2` ; sélection `sf-primary-subtle` ; ligne courante marquée d'un filet intérieur de 2 px `sf-primary`. Groupes en `overline` avec leur effectif. Quand l'aperçu est ouvert, les colonnes Assigné et État se replient dans l'aperçu.

**Piste SLA.** Longueur 56 px : butée verticale à 48 px (l'échéance). Trait écoulé 1,5 px `sf-text-2`, trait restant `sf-border-strong`, point de 6 px `sf-text` à la position « maintenant ».
- À risque (≤ 30 % du délai ou ≤ 2 h) : trait et point `sf-warning`, texte 500.
- Dépassé : trait `sf-danger` jusqu'à la butée et au-delà, point au bout, « Dépassé de 35 min ».
- Suspendu : trait pointillé `sf-paused`, point creux, « Suspendu · prestataire ».
- Respecté : `sf-success`.
Dans la fiche, la même piste s'étire sur toute la largeur du panneau.

## Boutons et actions

| Variante | Usage | Spécification |
|---|---|---|
| Plein (`primary`) | L'action principale de la vue, une seule | Fond `sf-primary`, texte `sf-primary-fg`, 34 px, rayon 5 |
| Contour (défaut) | Actions secondaires | Fond `sf-surface`, filet `sf-border-strong` |
| Discret (`ghost`) | Fermer, actions tertiaires | Sans fond ni filet |
| Danger | Actions destructrices | Texte `sf-danger` ; confirmation obligatoire |
| Tailles | `sm` 28 px, `md` 34 px, `lg` 44 px (portail, mobile) | |

Un raccourci se montre dans le bouton par une touche (`kbd`), masquée sur mobile. Libellé = verbe + objet.

## Formulaires

- Libellé au-dessus, toujours visible ; « (facultatif) » en `sf-text-3` plutôt qu'un astérisque sur les champs obligatoires.
- Champ 34 px, filet `sf-border-control`, rayon 5 ; 44 px au portail.
- Aide sous le champ en `caption` ; erreur sous le champ en `sf-danger` avec icône, qui nomme le problème et dit quoi faire.
- Validation à l'envoi, puis en direct sur le champ corrigé ; focus sur le premier champ en erreur.
- Choix exclusif court : contrôle segmenté (« Qui est gêné ? »). Liste longue : sélecteur.
- Calcul en direct sous les champs qui le déterminent : « Priorité proposée Haute · résolution sous 8 h ouvrées, échéance lundi 30 nov., 08:12 ».
- Suggestion de doublon : encadré ocre avec action « Rattacher ».
- Ctrl Entrée envoie.

## Recherche et filtres

- Filtre de liste : champ de 300 px avec loupe et touche `/`, recherche sur numéro, objet, lieu, équipement, lycée, demandeur ; insensible aux accents.
- Filtres facettes : boutons en pointillé « + Lycée », « + Priorité » ; actifs, ils deviennent pleins et affichent la valeur. « Effacer les filtres » apparaît dès qu'un filtre est actif.
- Recherche globale et actions : palette de commandes (620 px, rayon 8, ombre `shadow-2`), groupes Actions, Aller à, Tickets, Équipements.

## Notifications

| Type | Quand | Forme |
|---|---|---|
| Toast | Conséquence d'une action de la personne | Fond `sf-text`, texte `sf-canvas`, bas centré, 4,5 s ou 8 s s'il propose une action ; un seul à la fois |
| Bandeau de perturbation | Incident majeur ou panne connue | Fond `sf-warning-subtle`, titre en `sf-warning`, action à droite |
| Bandeau hors connexion | Réseau perdu | Pleine largeur sous la barre, `sf-surface-3` |
| Erreur bloquante | Chargement impossible | État d'erreur dans la zone, rôle `alert` |

Pas de cloche à pastille rouge : ce qui demande une action est dans Aujourd'hui.

## Modales

Réservées aux tâches courtes qui demandent une saisie (créer, résoudre, raccourcis). 640 px au plus, rayon 8, `shadow-2`, voile `sf-overlay`. En-tête : titre `title-2` et fermer ; pied : rappel utile à gauche (« Réversible : le ticket se rouvre si le demandeur répond »), Annuler et action pleine à droite. Sur mobile, feuille depuis le bas. Jamais de modale de confirmation pour une action réversible.

## Interfaces métier

- **Demande d'origine** en tête de fiche, avec l'auteur, sa fonction, le canal et l'heure.
- **Équipement concerné** : icône du type, code en chasse fixe, modèle, adresse, état (« Hors ligne »).
- **Chronologie** : rail vertical de 1 px, points de 7 px ; système en creux, personnes en plein, note interne en ocre, résolution en vert. Réponses et notes dans des bulles ; la note interne a un fond ocre et l'étiquette « Note interne ».
- **Compositeur** : deux modes, « Note interne » (par défaut, fond ocre, « Visible des techniciens uniquement ») et « Réponse au demandeur » (fond blanc, « Visible par Rémi Delorme », bouton plein « Envoyer »).
- **Bloc SLA** : prise en charge (objectif et résultat), résolution (délai, échéance, piste pleine largeur), calendrier appliqué.
- **Tournée** : heure en chasse fixe, lycée, lieu, tickets de l'étape ; « Je suis sur place » sur l'étape suivante.
- **Portail** : étapes de la demande en trois traits (reçue, prise en charge, résolue) avec une phrase ; échanges publics seulement.

## Micro-interactions

| Élément | Mouvement |
|---|---|
| Survol, état de contrôle | Couleur, 120 ms |
| Aperçu latéral | Opacité et 12 px de translation, 240 ms, `ease-veille` |
| Modale, toast, menu | Opacité et 6 px vers le haut, 180 ms |
| Changement de vue | Ligne de 2 px sous la barre supérieure, 240 ms, puis effacement |
| Squelettes | Reflet lent de 1,6 s ; supprimé si animations réduites |

Aucun rebond, aucune mise à l'échelle au-delà de 2 %, aucune animation en boucle hors chargement.

## Thèmes clair et sombre

Le thème sombre est un usage réel (salles techniques, fin de journée), pas une curiosité : fonds bleu-noir étagés (`#111317`, `#171A1F`, `#1E2228`), accents éclaircis et désaturés, ombres remplacées par un filet. Les deux thèmes partagent tous les noms de jetons ; un composant ne teste jamais le thème.


## Implémentation

## Source unique

`tokens.json` est la seule source des valeurs. `tokens.css` (variables `--sf-*`, thèmes clair et sombre) en est généré ; il ne s'édite pas à la main. Un composant n'écrit jamais une couleur, un rayon, une ombre ou une durée en dur : il lit une variable. Une nouvelle valeur demande une justification fonctionnelle écrite en revue de design.

```html
<html lang="fr" data-theme="light">   <!-- ou "dark" ; défaut : préférence système -->
<div id="app" data-density="standard"> <!-- compact | standard | comfortable -->
```

```css
@import "tokens.css";                  /* en premier */
.ticket-title { font: var(--sf-body-strong); color: var(--sf-text); }
.panel { background: var(--sf-surface); border: 1px solid var(--sf-border); border-radius: var(--sf-radius-lg); }
:focus-visible { outline: 2px solid var(--sf-focus); outline-offset: 2px; }
```

## Jetons

**Couleur** (une valeur par thème) : `sf-canvas`, `sf-surface`, `sf-surface-2`, `sf-surface-3`, `sf-border`, `sf-border-strong`, `sf-border-control`, `sf-text`, `sf-text-2`, `sf-text-3`, `sf-text-inverse`, `sf-overlay`, `sf-primary`, `sf-primary-hover`, `sf-primary-fg`, `sf-primary-subtle`, `sf-primary-subtle-fg`, `sf-focus`, `sf-danger`, `sf-danger-subtle`, `sf-warning`, `sf-warning-subtle`, `sf-success`, `sf-success-subtle`, `sf-paused`, `sf-p1` à `sf-p4`, `sf-dv-1` à `sf-dv-6`.

**Typographie** : variables composites utilisables avec `font:` : `--sf-display`, `--sf-title-1`, `--sf-title-2`, `--sf-title-3`, `--sf-body-lg`, `--sf-body`, `--sf-body-strong`, `--sf-label`, `--sf-small`, `--sf-caption`, `--sf-overline`, `--sf-kpi`, `--sf-data`, `--sf-data-sm` ; interlettrage dans `--sf-<style>-tracking` quand il n'est pas nul.

**Espacement** (base 4) : `sf-space-0-5` 2, `sf-space-1` 4, `sf-space-1-5` 6, `sf-space-2` 8, `sf-space-3` 12, `sf-space-4` 16, `sf-space-5` 20, `sf-space-6` 24, `sf-space-8` 32, `sf-space-10` 40, `sf-space-12` 48, `sf-space-16` 64.

**Rayons** : `sf-radius-0` 0, `sf-radius-sm` 3 (puces, cases, touches), `sf-radius-md` 5 (boutons, champs), `sf-radius-lg` 8 (panneaux, modales), `sf-radius-full` (avatars, point de veille).

**Élévation** : `sf-shadow-0` (tout ce qui est posé), `sf-shadow-1` (menus, toasts), `sf-shadow-2` (modales, palette). En sombre, l'ombre devient un filet.

**Dimensions** : lignes 32, 40, 48 ; contrôles 28, 34, 44 ; barre latérale 232, rail 56 ; barre supérieure 52 ; aperçu 440 ; mesure de texte 72 caractères.

**Grille** : marges de page 24 px (12 px sur mobile), gouttières 16 px, panneaux en grilles de 2 colonnes (1,6 fr / 1 fr ou 1 fr / 320 px). Pas de grille à 12 colonnes : les écrans sont des outils, pas des pages éditoriales.

**Points de rupture** : `sf-bp-sm` 640, `sf-bp-md` 1024, `sf-bp-lg` 1280, `sf-bp-xl` 1600.

**Animation** : `--sf-duration-1` 120 ms, `--sf-duration-2` 180 ms, `--sf-duration-3` 240 ms, `--sf-ease-veille` `cubic-bezier(0.2, 0, 0, 1)` pour les entrées, `--sf-ease-exit` `cubic-bezier(0.4, 0, 1, 1)` pour les sorties. Sous `prefers-reduced-motion: reduce`, durées ramenées à 0 et 80 ms, translations supprimées.

## Composants

| Composant | Variantes | États à livrer |
|---|---|---|
| Button | primary, secondary, ghost, danger ; sm, md, lg ; icône seule | repos, survol, focus, actif, désactivé, chargement |
| Field (Input, Textarea, Select) | standard, lg ; avec préfixe | vide, rempli, focus, invalide + message, désactivé |
| Segmented | 2 à 5 options ; rôle radiogroup ou groupe de boutons pressés | sélectionné, focus |
| Checkbox | simple, indéterminée | coché, focus, désactivé |
| PriorityMark | p1 à p4 | (statique) |
| StatusMark | new, prog, wait (+ raison), plan, res, closed | (statique) |
| SlaTrack | compacte (56 px), large (pleine largeur) | ok, risk, over, paused, met |
| Tag | neutre, danger, warn, ok | (statique) |
| Avatar | 22, 26, 32 ; « non assigné » en pointillé | |
| Tabs | vues avec compteur ; compteur d'alerte | sélectionné, focus |
| TicketTable | 3 densités ; groupes ; sélection | chargement, vide, vide filtré, erreur |
| Preview | panneau latéral ; tiroir sous 1024 px | |
| Timeline | système, personne, note interne, réponse, résolution, en attente d'envoi | |
| Composer | note interne, réponse au demandeur | vide, focus, envoi hors connexion |
| Notice | perturbation, critique, neutre | avec ou sans action |
| KpiLine | 2 à 4 indicateurs | alerte |
| Dialog | formulaire, feuille mobile | piège de focus |
| CommandPalette | groupes | résultats, aucun résultat |
| Toast | message, avec action | |
| EmptyState | ligne au repos + texte + action | |
| Skeleton | ligne, texte | animé, réduit |

Les prévisualisations de ce référentiel montrent chaque composant dans ses états ; leur balisage fait foi. Les styles sont dans `components/bundle.css`, les fonctions d'affichage (piste SLA, marques) dans `components/bundle.js` (`window.SentinelFlow`).

## Conventions

- **Nommage** : variables `--sf-<rôle>` ; classes de composant courtes (`.btn`, `.sla`, `.st`, `.prio`) ; modificateurs en classe (`.btn.primary`, `.sla.over`) ; états en attributs ARIA (`aria-selected`, `aria-pressed`, `aria-checked`, `aria-invalid`).
- **Données** : numéros, codes, IP, heures en `--sf-data` ; colonnes numériques alignées à droite, chiffres tabulaires.
- **Dates et durées** : `ven. 27 nov., 10:42` ; durées « 35 min », « 1 h 02 », « 2 j ouvrés » ; jamais « il y a 3 heures » pour une échéance.
- **Texte** : français, apostrophe typographique, espaces insécables avant `:` `;` `?` `!` et dans les nombres.
- **Accessibilité** : chaque contrôle a un nom accessible qui contient son texte visible ; les glyphes décoratifs sont `aria-hidden` ; aucune information portée par la couleur seule.
- **Icônes** : SVG en ligne, `viewBox="0 0 16 16"`, `stroke="currentColor"`, `stroke-width="1.5"`, `aria-hidden="true"`.

## Intégration React et Tailwind

Pile recommandée : React 18+, TypeScript strict, Tailwind CSS 4 avec les variables `--sf-*`, primitives shadcn/ui ou Radix pour la logique d'accessibilité (menus, dialogues), styles remplacés par les jetons.

```css
/* app.css, Tailwind 4 */
@import "tailwindcss";
@import "./tokens.css";
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
@theme inline {
  --color-canvas: var(--sf-canvas);   --color-surface: var(--sf-surface);
  --color-surface-2: var(--sf-surface-2); --color-border: var(--sf-border);
  --color-ink: var(--sf-text);         --color-ink-2: var(--sf-text-2); --color-ink-3: var(--sf-text-3);
  --color-primary: var(--sf-primary);  --color-primary-fg: var(--sf-primary-fg);
  --color-danger: var(--sf-danger);    --color-warning: var(--sf-warning); --color-success: var(--sf-success);
  --font-sans: var(--sf-font-sans);    --font-mono: var(--sf-font-mono);
  --radius-sm: var(--sf-radius-sm);    --radius-md: var(--sf-radius-md); --radius-lg: var(--sf-radius-lg);
  --ease-veille: var(--sf-ease-veille);
}
```

Correspondance shadcn/ui : `--background` → `--sf-canvas`, `--card` et `--popover` → `--sf-surface`, `--foreground` → `--sf-text`, `--muted` → `--sf-surface-2`, `--muted-foreground` → `--sf-text-3`, `--primary` → `--sf-primary`, `--primary-foreground` → `--sf-primary-fg`, `--accent` → `--sf-primary-subtle`, `--accent-foreground` → `--sf-primary-subtle-fg`, `--destructive` → `--sf-danger`, `--border` → `--sf-border`, `--input` → `--sf-border-control`, `--ring` → `--sf-focus`, `--radius` → `--sf-radius-md`. Le kit livré contient `tailwind.css` et `shadcn-theme.css` prêts à importer.

Polices : copier `fonts/` et déclarer les `@font-face` (fournis dans `fonts.css` du kit), `font-display: swap`, sous-ensemble latin. Aucune requête externe.

Fonctions métier à porter côté serveur, pas dans l'interface : calcul des échéances en heures ouvrées par lycée et calendrier scolaire, détection de doublon par équipement et lieu, priorité proposée par impact et catégorie. L'interface affiche leur résultat et leur raison.

## Liste de contrôle avant fusion

1. Aucune valeur en dur : couleurs, rayons, ombres, durées viennent de `--sf-*`.
2. Les deux thèmes et les trois densités sont vérifiés à l'œil.
3. Chaque état est prévu : chargement, vide, vide filtré, erreur, hors connexion si pertinent.
4. Clavier : tout est atteignable, le focus est visible, Échap ferme, le focus revient à l'origine.
5. axe-core sans violation ; contraste recalculé si une couleur change (`tokens.py`).
6. Reflow à 320 px sans défilement horizontal ; cibles ≥ 24 px (44 px sur mobile).
7. Une seule action pleine par vue ; libellés verbe + objet ; textes relus avec les règles de ton.
8. Les douze règles anti-banalité du README sont respectées.


## Bilan des itérations

Cinq boucles ont été menées : analyser, sélectionner, fusionner, concevoir, évaluer, critiquer, corriger, valider. À chaque boucle, le prototype a été reconstruit, rendu dans Chrome et relu capture par capture. Les notes sont celles de la grille pondérée de la mission ; ce sont des jugements de concepteur appuyés sur des mesures, pas des résultats de tests avec des personnes.

## Boucle 1 : convergence stratégique

- **Analyse** : lecture des quatre archives, rendu des prototypes (dont la compilation du prototype React du kit « Laminaire »), comparaison des logos aux tailles 240, 64, 32 et 16 px.
- **Décisions** : base d'expérience d'« Aiguillage » ; récit et principes de « Laminaire » ; ergonomie de liste de « Repère » ; idées d'outil de « Stitch ». Plex au lieu d'Inter, neutres légèrement chauds, un seul bleu.
- **Logo** : six pistes dessinées (onde à arcs, onde sinusoïdale, courbe qui se pose, convergence, onde rejoignant une droite). Retenue : onde sinusoïdale à une période amortie, raccord tangent, point détaché. Rejetées : les arcs (lus comme un crochet), la courbe qui se pose (lue comme une racine carrée), la convergence (une fourche).
- **Note** : 84,5 / 100 (fusion de départ).

## Boucle 2 : cohérence et expérience

- Défaut trouvé : la classe d'état vide entrait en conflit avec l'avatar « non assigné » et déformait les lignes. Renommée.
- Défaut trouvé : la demande d'origine apparaissait deux fois dans la fiche (en tête et dans la chronologie). La chronologie ne garde que les événements.
- Défaut trouvé : le graphique de flux plongeait à zéro chaque week-end, ce qui ressemblait à des pannes. Passage aux jours ouvrés.
- Défaut trouvé : les chiffres du pilotage (charge, dépassés par lycée) ne correspondaient pas à la file. Ils sont maintenant calculés à partir des mêmes données.
- Ajouts : regroupement de la file par état d'échéance, colonnes Assigné et État repliées quand l'aperçu est ouvert, angles morts métier (calendrier scolaire, prestataires, raisons de suspension, doublon à la source).
- **Note** : 86,5 / 100.

## Boucle 3 : excellence visuelle

- Priorité haute repassée de l'orange à l'encre : trois teintes chaudes (P2, attention, note interne) se disputaient le même sens.
- Graphique : étiquetage direct au bout des courbes, objectif dessiné comme un trait dans les barres de SLA, vue en tableau.
- Mobile : cartes de tickets, liste « À traiter » en deux niveaux, étapes de tournée sans débordement, champ du portail qui ne s'écrase plus.
- Suppression de toute ombre sur les panneaux posés ; rayons ramenés à trois valeurs.
- **Note** : 88 / 100.

## Boucle 4 : robustesse et faisabilité

- **Accessibilité** : axe-core (WCAG 2.0 à 2.2 A et AA, bonnes pratiques) sur 22 états d'écran et 4 dialogues, deux thèmes, 1440 et 390 px. Première passe : 127 nœuds en défaut (nom accessible ne contenant pas le texte visible, absence de repère `main`, cibles de 16 px dans la tournée, ordre des titres dans les états vides, palette sans nom). Après correction : 0.
- **Interactions** : 33 contrôles scriptés (clavier J, K, X, Entrée, Échap ; palette ; note interne ; résolution et annulation ; piège de focus ; création avec erreur, doublon, catégorie et priorité ; portail de bout en bout ; reflow à 320 px sur cinq écrans ; absence d'erreur JavaScript). Défaut majeur trouvé : un clic n'importe où relançait le rendu de l'application (un sélecteur d'attribut trop large), ce qui faisait perdre le focus des champs. Corrigé ; 33 sur 33.
- **Contrastes** : 39 paires par thème calculées par `tokens.py`, aucune sous le seuil.
- **Faisabilité** : jetons en liste, variables CSS générées, mapping Tailwind 4 et shadcn/ui, polices libres locales.
- **Note** : 89 / 100.

## Boucle 5 : validation finale

Regard d'un directeur artistique extérieur : l'identité se reconnaît sans le nom (onde de veille, piste SLA, Plex, papier et encre) ; le genre « barre latérale et tableau » reste celui de tous les outils de service desk, mais c'est le bon genre pour l'usage, et la piste SLA, les groupes par échéance et le compositeur à deux modes lui donnent une signature fonctionnelle. Regard d'une enseignante qui découvre le portail : une question, une phrase, un délai, la panne connue affichée avant de demander.

Corrections de cette boucle : un seul toast à la fois (les anciens masquaient l'action « Annuler » du dernier), retour du focus sur le titre quand l'élément d'origine disparaît après une action, cohérence des compteurs.

## Évolution de la note

| Critère (poids) | Fusion v1 | Final |
|---|---:|---:|
| Expérience et ergonomie (20) | 8,5 | 8,5 |
| Direction artistique (15) | 8 | 9 |
| Cohérence globale (15) | 8,5 | 9,5 |
| Lisibilité et simplicité (10) | 9 | 9 |
| Originalité (10) | 7,5 | 8,5 |
| Pertinence métier (10) | 9,5 | 9,5 |
| Accessibilité (10) | 8,5 | 8,5 |
| Faisabilité technique (5) | 8 | 9 |
| Évolutivité (5) | 8,5 | 9 |
| **Total** | **84,5** | **89,3** |

**L'objectif de 90 n'est pas atteint de façon démontrable.** Les deux critères restés à 8,5 (expérience, accessibilité) ne peuvent monter qu'avec des preuves qui n'existent pas encore : des tests avec des techniciens et des demandeurs, et un passage avec lecteur d'écran. Les noter plus haut serait gonfler le score.

## Limites restantes

1. **Aucun test avec de vraies personnes.** Priorités : file en densité standard avec trois techniciens (une demi-journée), portail avec cinq demandeurs novices (vingt minutes chacun), tournée sur téléphone en situation.
2. **Aucun test avec technologies d'assistance.** NVDA avec Firefox et VoiceOver avec Safari sur la file, la palette et la création.
3. **Écrans non maquettés** : base de connaissances, catalogue, inventaire, fiche d'équipement complète, cartographie, calendrier des interventions, administration (catégories, SLA et calendriers, rôles, journal), connexion.
4. **Moteur SLA simulé** : les échéances du prototype sont précalculées ; le calcul en heures ouvrées par lycée et calendrier scolaire reste à implémenter côté serveur.
5. **Composants non publiés en bibliothèque React** : le balisage et les styles de référence sont fournis, pas un paquet.
6. **Jeu d'icônes** : 58 pictogrammes repris de la proposition « Aiguillage » ; le vocabulaire du parc (vidéoprojecteur, écran interactif, badgeuse) est à dessiner dans le même style.
7. **Nom** : recherche d'antériorité à mener avant tout dépôt.
8. **Logotype** : composé en Plex, police du commerce libre ; un dessin de lettres propre renforcerait l'originalité.
