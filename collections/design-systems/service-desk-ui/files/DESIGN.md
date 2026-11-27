# Service Desk UI

Référentiel générique de conception d'interfaces de gestion des services : navigation, tableaux, états, accessibilité, thèmes, composants et interactions. Les tokens constituent la source des valeurs visuelles. Les exemples sont fictifs et les marques d'origine ne font pas partie de ce kit.

## UX

## Profils

Technicien de proximité, technicien du centre de services, demandeur, responsable opérationnel et administrateur fonctionnel. Les exemples sont fictifs et indépendants de toute organisation.

## Principes d'expérience

1. **Ce qui demande une action maintenant est en haut.** Toute liste est triée par échéance SLA puis priorité, groupée par état de l'échéance.
2. **Une phrase suffit pour commencer.** Catégorie, priorité et échéance sont proposées, modifiables, et expliquées.
3. **Le prochain geste est visible.** Un état vide, une erreur, une confirmation proposent l'action suivante.
4. **On annule plutôt qu'on confirme.** Prendre en charge, résoudre, suspendre, réassigner : effet immédiat et toast « Annuler ». Confirmation seulement pour l'irréversible (suppression, fusion définitive).
5. **L'automatisation propose, la personne décide.** Doublon, catégorie, priorité : suggérés avec leur raison, jamais appliqués en silence.
6. **Le sens ne tient jamais à la couleur seule.** Forme, libellé, position.
7. **Tout se fait au clavier, et le clavier peut se taire.** Raccourcis à une touche désactivables.
8. **Un délai est toujours accompagné de son calendrier.** « 4 h ouvrées, site Site A 07:30–18:00, hors jours de fermeture. »

## Architecture de l'information

```
Travail
  Aujourd'hui            ce qui m'attend, ma tournée, ce qui est chez les prestataires
  Tickets                vues enregistrées : À moi, Non assignés, SLA menacés, Suspendus, Tous ouverts, Résolus
    Fiche ticket         demande d'origine, chronologie, liés, équipement, SLA, informations
  Ma tournée             étapes du jour, tickets par étape, arrivée sur place
Connaissances            articles, catalogue de services (hors prototype)
Parc                     équipements, sites, cartographie (hors prototype)
Pilotage                 SLA par site, charge, prestataires, flux
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

Parcours illustratifs pour guider l'intégration et les tests.

**1. Le technicien traite un incident majeur.**
Aujourd'hui → bandeau « Incident majeur en cours » → Ouvrir l'incident → note interne (Ctrl Entrée) → Résoudre (R) → message au demandeur prérempli, cause, article lié → « Résoudre et envoyer » → toast « Annuler ». Les demandeurs des tickets rattachés sont prévenus.

**2. Le technicien trie la file au clavier.**
Tickets → J et K pour se déplacer → Entrée ouvre l'aperçu → K suit dans l'aperçu → X sélectionne → « M'assigner » en lot → Annuler possible → Échap ferme.

**3. Un doublon est évité à la création.**
N → « Plus de wifi en C206 » → la catégorie Réseau › Wi-Fi est proposée, l'incident INC-24817 au même endroit aussi → Rattacher, ou continuer → « Qui est gêné ? Un bâtiment » → priorité Haute, échéance mardi 13 janv., 08:12 → Créer.

**4. La demandeuse signale une panne.**
Portail → bandeau Wi-Fi : « Je suis aussi concernée » si c'est son cas → sinon une phrase → suggestions d'articles pendant la saisie → Continuer → lieu prérempli, « Depuis quand ? », capture facultative → délai affiché avant l'envoi → confirmation avec numéro et date de réponse → Suivre.

**5. Le technicien arrive sur site.**
Ma tournée (mobile) → « Je suis sur place » → arrivée horodatée, demandeurs prévenus → tickets de l'étape.

**6. La responsable trouve un décrochage.**
Pilotage → « Dépassés en cours : 2 » mène à la vue SLA menacés → SLA par site : Site A sous l'objectif → Charge par technicien → Prestataires : opérateur télécom à 5 jours pour un engagement de 3.

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
- **Vues enregistrées plutôt que filtres complexes** : six vues avec compteur, puis deux filtres (site, priorité) et une recherche.
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
| Succès | Toast d'un fait et d'un délai, action utile | « INC-24830 créé. Échéance de résolution : mardi 13 janv., 08:12. » + « Ouvrir » |
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
| Jours de fermeture | Le décompte s'arrête ; le calendrier est écrit sous la piste |
| Session expirée (à implémenter) | Brouillon conservé localement, reconnexion en modale, retour à l'écran |
| Conflit d'édition (à implémenter) | « Technicien B a modifié ce ticket à 10:41 » avec choix explicite |
| Panne de recherche (à implémenter) | La palette garde la navigation et les actions locales |

## Accessibilité

Cible : WCAG 2.2 niveau AA, et RGAA 4.1 pour le secteur public.

- Contrastes calculés pour les deux thèmes ; texte courant ≥ 5,2:1, éléments d'interface ≥ 3,5:1.
- Navigation complète au clavier, focus visible (2 px `ds-focus`, décalage 2 px), ordre de tabulation logique, lien d'évitement.
- Modales : piège de focus, Échap, retour du focus, contenu derrière rendu inerte.
- Tableau : lignes focalisables, Entrée, J et K ; sélection par case avec nom accessible.
- Palette : `combobox` avec `aria-activedescendant`, résultats en `listbox`.
- Statuts, priorités, SLA : glyphe et texte ; pour les lecteurs d'écran, la raison d'attente est énoncée.
- Toasts dans une région `status` polie ; changement de vue annoncé.
- Raccourcis à une touche désactivables (critère 2.1.4).
- Cibles d'au moins 24 px partout, 44 px sur mobile et au portail.
- Reflow sans défilement horizontal à 320 px.
- Animations réduites respectées ; contraste forcé (Windows) pris en compte pour les marqueurs.

À vérifier sur la version neutralisée : axe-core, navigation au clavier, lecteurs d'écran, contrastes et tailles de cible.

## Responsive

| Largeur | Mise en page |
|---|---|
| ≥ 1600 px | Colonne Demandeur ajoutée au tableau |
| 1280 à 1599 px | Barre latérale complète, aperçu de 440 px |
| 1024 à 1279 px | Barre latérale en rail de 56 px, aperçu de 380 px |
| 640 à 1023 px | Aperçu en tiroir plein écran latéral, fiche sur une colonne, indicateurs sur deux colonnes |
| < 640 px | Mise en page dédiée : cartes de tickets, barre d'onglets, actions fixées en bas, modales en feuille depuis le bas |

Dans le prototype, la mise en page mobile s'active sous 640 px et dans le cadre de 390 px : le cadre simule un écran de téléphone. En production, utilisez les requêtes de conteneur sur la zone principale plutôt que sur la fenêtre.


## UI

## Structure générale

```
┌──────────┬──────────────────────────────────────────────────────────┐
│ Logo     │ Fil d'Ariane                Rechercher ou agir  Nouveau │  barre 52 px
│ Périmètre├──────────────────────────────────────────────────────────┤
│          │ Titre (title-1)                           commande de vue│
│ Travail  │ Bandeau de perturbation, si actif                        │
│ Pilotage │ Onglets de vues enregistrées                             │
│ Portail  │ Filtre · Site · Priorité              aide clavier      │
│          │ ┌ tableau ─────────────────────────────┐┌ aperçu 440 ──┐│
│          │ │ GROUPE                               ││              ││
│ Personne │ │ ligne 40 px                          ││              ││
└──────────┴─┴──────────────────────────────────────┘└──────────────┘┘
  232 px      marges de page 24 px, gouttières 16 px
```

Fond `ds-canvas`, panneaux `ds-surface` cernés d'un filet `ds-border`, rayon 8 px. Aucune ombre sur ce qui est posé. Une seule action pleine par vue.

## Layouts de référence

| Écran | Grille | Contenu |
|---|---|---|
| Aujourd'hui | 1,6 fr / 1 fr | À traiter maintenant (six lignes triées) ; Ma tournée ; Chez les prestataires |
| Tickets | 1 fr, ou 1 fr / 440 px avec aperçu | Vues, outils, tableau groupé, barre d'actions groupées |
| Fiche | 1 fr / 320 px | Demande d'origine et équipement ; onglets Activité, Liés, Équipement ; SLA et Informations à droite |
| Pilotage | 4 indicateurs, puis 1,6 fr / 1 fr | SLA par site, flux ; charge, prestataires |
| Portail | colonne de 960 px centrée | Perturbation ; question d'accueil ; Mes demandes et Demandes courantes |

## Navigation principale et secondaire

- Élément de navigation : 32 px, `label` 13 px graisse 400, icône 16 px ; actif : fond `ds-primary-subtle`, texte `ds-primary-subtle-fg`, graisse 500. Pas de barre colorée à gauche.
- Groupes : `overline`, `ds-text-3`.
- Onglets de vues : texte 13 px, compteur en `data-sm` ; actif souligné de 2 px `ds-primary`. Le compteur de SLA menacés passe en `ds-danger` s'il n'est pas nul.
- Fil d'Ariane : `ds-text-3`, élément courant `ds-text` graisse 500, identifiant en chasse fixe.

## Tableau de tickets

| Colonne | Contenu | Largeur |
|---|---|---|
| Sélection | Case 16 px | 36 px |
| Priorité | Barres + libellé (Critique, Haute, Moyenne, Basse) | contenu |
| Ticket | `INC-24817` en `data`, `ds-text-2` | contenu |
| Objet | Objet en `body-strong` sur une ligne ; dessous en `caption` : site · lieu · code d'équipement en chasse fixe | reste |
| Assigné | Avatar 22 px + nom court ; « Non assigné » avec avatar pointillé | contenu |
| État | Glyphe 12 px + libellé | contenu |
| Échéance SLA | Piste 56 × 10 + texte | contenu |
| Demandeur | Nom | ≥ 1500 px seulement |

Lignes de 32, 40 ou 48 px selon la densité ; en compacte, la ligne secondaire disparaît. En-têtes `caption` 500 sur `ds-surface-2`, collants. Survol `ds-surface-2` ; sélection `ds-primary-subtle` ; ligne courante marquée d'un filet intérieur de 2 px `ds-primary`. Groupes en `overline` avec leur effectif. Quand l'aperçu est ouvert, les colonnes Assigné et État se replient dans l'aperçu.

**Piste SLA.** Longueur 56 px : butée verticale à 48 px (l'échéance). Trait écoulé 1,5 px `ds-text-2`, trait restant `ds-border-strong`, point de 6 px `ds-text` à la position « maintenant ».
- À risque (≤ 30 % du délai ou ≤ 2 h) : trait et point `ds-warning`, texte 500.
- Dépassé : trait `ds-danger` jusqu'à la butée et au-delà, point au bout, « Dépassé de 35 min ».
- Suspendu : trait pointillé `ds-paused`, point creux, « Suspendu · prestataire ».
- Respecté : `ds-success`.
Dans la fiche, la même piste s'étire sur toute la largeur du panneau.

## Boutons et actions

| Variante | Usage | Spécification |
|---|---|---|
| Plein (`primary`) | L'action principale de la vue, une seule | Fond `ds-primary`, texte `ds-primary-fg`, 34 px, rayon 5 |
| Contour (défaut) | Actions secondaires | Fond `ds-surface`, filet `ds-border-strong` |
| Discret (`ghost`) | Fermer, actions tertiaires | Sans fond ni filet |
| Danger | Actions destructrices | Texte `ds-danger` ; confirmation obligatoire |
| Tailles | `sm` 28 px, `md` 34 px, `lg` 44 px (portail, mobile) | |

Un raccourci se montre dans le bouton par une touche (`kbd`), masquée sur mobile. Libellé = verbe + objet.

## Formulaires

- Libellé au-dessus, toujours visible ; « (facultatif) » en `ds-text-3` plutôt qu'un astérisque sur les champs obligatoires.
- Champ 34 px, filet `ds-border-control`, rayon 5 ; 44 px au portail.
- Aide sous le champ en `caption` ; erreur sous le champ en `ds-danger` avec icône, qui nomme le problème et dit quoi faire.
- Validation à l'envoi, puis en direct sur le champ corrigé ; focus sur le premier champ en erreur.
- Choix exclusif court : contrôle segmenté (« Qui est gêné ? »). Liste longue : sélecteur.
- Calcul en direct sous les champs qui le déterminent : « Priorité proposée Haute · résolution sous 8 h ouvrées, échéance mardi 13 janv., 08:12 ».
- Suggestion de doublon : encadré ocre avec action « Rattacher ».
- Ctrl Entrée envoie.

## Recherche et filtres

- Filtre de liste : champ de 300 px avec loupe et touche `/`, recherche sur numéro, objet, lieu, équipement, site, demandeur ; insensible aux accents.
- Filtres facettes : boutons en pointillé « + Site », « + Priorité » ; actifs, ils deviennent pleins et affichent la valeur. « Effacer les filtres » apparaît dès qu'un filtre est actif.
- Recherche globale et actions : palette de commandes (620 px, rayon 8, ombre `shadow-2`), groupes Actions, Aller à, Tickets, Équipements.

## Notifications

| Type | Quand | Forme |
|---|---|---|
| Toast | Conséquence d'une action de la personne | Fond `ds-text`, texte `ds-canvas`, bas centré, 4,5 s ou 8 s s'il propose une action ; un seul à la fois |
| Bandeau de perturbation | Incident majeur ou panne connue | Fond `ds-warning-subtle`, titre en `ds-warning`, action à droite |
| Bandeau hors connexion | Réseau perdu | Pleine largeur sous la barre, `ds-surface-3` |
| Erreur bloquante | Chargement impossible | État d'erreur dans la zone, rôle `alert` |

Pas de cloche à pastille rouge : ce qui demande une action est dans Aujourd'hui.

## Modales

Réservées aux tâches courtes qui demandent une saisie (créer, résoudre, raccourcis). 640 px au plus, rayon 8, `shadow-2`, voile `ds-overlay`. En-tête : titre `title-2` et fermer ; pied : rappel utile à gauche (« Réversible : le ticket se rouvre si le demandeur répond »), Annuler et action pleine à droite. Sur mobile, feuille depuis le bas. Jamais de modale de confirmation pour une action réversible.

## Interfaces métier

- **Demande d'origine** en tête de fiche, avec l'auteur, sa fonction, le canal et l'heure.
- **Équipement concerné** : icône du type, code en chasse fixe, modèle, adresse, état (« Hors ligne »).
- **Chronologie** : rail vertical de 1 px, points de 7 px ; système en creux, personnes en plein, note interne en ocre, résolution en vert. Réponses et notes dans des bulles ; la note interne a un fond ocre et l'étiquette « Note interne ».
- **Compositeur** : deux modes, « Note interne » (par défaut, fond ocre, « Visible des techniciens uniquement ») et « Réponse au demandeur » (fond blanc, « Visible par Utilisateur B », bouton plein « Envoyer »).
- **Bloc SLA** : prise en charge (objectif et résultat), résolution (délai, échéance, piste pleine largeur), calendrier appliqué.
- **Tournée** : heure en chasse fixe, site, lieu, tickets de l'étape ; « Je suis sur place » sur l'étape suivante.
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

`tokens.json` est la seule source des valeurs. `tokens.css` (variables `--ds-*`, thèmes clair et sombre) en est généré ; il ne s'édite pas à la main. Un composant n'écrit jamais une couleur, un rayon, une ombre ou une durée en dur : il lit une variable. Une nouvelle valeur demande une justification fonctionnelle écrite en revue de design.

```html
<html lang="fr" data-theme="light">   <!-- ou "dark" ; défaut : préférence système -->
<div id="app" data-density="standard"> <!-- compact | standard | comfortable -->
```

```css
@import "tokens.css";                  /* en premier */
.ticket-title { font: var(--ds-body-strong); color: var(--ds-text); }
.panel { background: var(--ds-surface); border: 1px solid var(--ds-border); border-radius: var(--ds-radius-lg); }
:focus-visible { outline: 2px solid var(--ds-focus); outline-offset: 2px; }
```

## Jetons

**Couleur** (une valeur par thème) : `ds-canvas`, `ds-surface`, `ds-surface-2`, `ds-surface-3`, `ds-border`, `ds-border-strong`, `ds-border-control`, `ds-text`, `ds-text-2`, `ds-text-3`, `ds-text-inverse`, `ds-overlay`, `ds-primary`, `ds-primary-hover`, `ds-primary-fg`, `ds-primary-subtle`, `ds-primary-subtle-fg`, `ds-focus`, `ds-danger`, `ds-danger-subtle`, `ds-warning`, `ds-warning-subtle`, `ds-success`, `ds-success-subtle`, `ds-paused`, `ds-p1` à `ds-p4`, `ds-dv-1` à `ds-dv-6`.

**Typographie** : variables composites utilisables avec `font:` : `--ds-display`, `--ds-title-1`, `--ds-title-2`, `--ds-title-3`, `--ds-body-lg`, `--ds-body`, `--ds-body-strong`, `--ds-label`, `--ds-small`, `--ds-caption`, `--ds-overline`, `--ds-kpi`, `--ds-data`, `--ds-data-sm` ; interlettrage dans `--ds-<style>-tracking` quand il n'est pas nul.

**Espacement** (base 4) : `ds-space-0-5` 2, `ds-space-1` 4, `ds-space-1-5` 6, `ds-space-2` 8, `ds-space-3` 12, `ds-space-4` 16, `ds-space-5` 20, `ds-space-6` 24, `ds-space-8` 32, `ds-space-10` 40, `ds-space-12` 48, `ds-space-16` 64.

**Rayons** : `ds-radius-0` 0, `ds-radius-sm` 3 (puces, cases, touches), `ds-radius-md` 5 (boutons, champs), `ds-radius-lg` 8 (panneaux, modales), `ds-radius-full` (avatars, point de veille).

**Élévation** : `ds-shadow-0` (tout ce qui est posé), `ds-shadow-1` (menus, toasts), `ds-shadow-2` (modales, palette). En sombre, l'ombre devient un filet.

**Dimensions** : lignes 32, 40, 48 ; contrôles 28, 34, 44 ; barre latérale 232, rail 56 ; barre supérieure 52 ; aperçu 440 ; mesure de texte 72 caractères.

**Grille** : marges de page 24 px (12 px sur mobile), gouttières 16 px, panneaux en grilles de 2 colonnes (1,6 fr / 1 fr ou 1 fr / 320 px). Pas de grille à 12 colonnes : les écrans sont des outils, pas des pages éditoriales.

**Points de rupture** : `ds-bp-sm` 640, `ds-bp-md` 1024, `ds-bp-lg` 1280, `ds-bp-xl` 1600.

**Animation** : `--ds-duration-1` 120 ms, `--ds-duration-2` 180 ms, `--ds-duration-3` 240 ms, `--ds-ease-veille` `cubic-bezier(0.2, 0, 0, 1)` pour les entrées, `--ds-ease-exit` `cubic-bezier(0.4, 0, 1, 1)` pour les sorties. Sous `prefers-reduced-motion: reduce`, durées ramenées à 0 et 80 ms, translations supprimées.

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

Le prototype de référence illustre les états des composants. Les styles sont dans `components.css`, les fonctions d'affichage (piste SLA, marques) dans `service-desk-ui-marks.js` (`window.ServiceDeskUI`).

## Conventions

- **Nommage** : variables `--ds-<rôle>` ; classes de composant courtes (`.btn`, `.sla`, `.st`, `.prio`) ; modificateurs en classe (`.btn.primary`, `.sla.over`) ; états en attributs ARIA (`aria-selected`, `aria-pressed`, `aria-checked`, `aria-invalid`).
- **Données** : numéros, codes, IP, heures en `--ds-data` ; colonnes numériques alignées à droite, chiffres tabulaires.
- **Dates et durées** : `lun. 12 janv., 10:42` ; durées « 35 min », « 1 h 02 », « 2 j ouvrés » ; jamais « il y a 3 heures » pour une échéance.
- **Texte** : français, apostrophe typographique, espaces insécables avant `:` `;` `?` `!` et dans les nombres.
- **Accessibilité** : chaque contrôle a un nom accessible qui contient son texte visible ; les glyphes décoratifs sont `aria-hidden` ; aucune information portée par la couleur seule.
- **Icônes** : SVG en ligne, `viewBox="0 0 16 16"`, `stroke="currentColor"`, `stroke-width="1.5"`, `aria-hidden="true"`.

## Intégration React et Tailwind

Pile recommandée : React 18+, TypeScript strict, Tailwind CSS 4 avec les variables `--ds-*`, primitives shadcn/ui ou Radix pour la logique d'accessibilité (menus, dialogues), styles remplacés par les jetons.

```css
/* app.css, Tailwind 4 */
@import "tailwindcss";
@import "./tokens.css";
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
@theme inline {
  --color-canvas: var(--ds-canvas);   --color-surface: var(--ds-surface);
  --color-surface-2: var(--ds-surface-2); --color-border: var(--ds-border);
  --color-ink: var(--ds-text);         --color-ink-2: var(--ds-text-2); --color-ink-3: var(--ds-text-3);
  --color-primary: var(--ds-primary);  --color-primary-fg: var(--ds-primary-fg);
  --color-danger: var(--ds-danger);    --color-warning: var(--ds-warning); --color-success: var(--ds-success);
  --font-sans: var(--ds-font-sans);    --font-mono: var(--ds-font-mono);
  --radius-sm: var(--ds-radius-sm);    --radius-md: var(--ds-radius-md); --radius-lg: var(--ds-radius-lg);
  --ease-veille: var(--ds-ease-veille);
}
```

Correspondance shadcn/ui : `--background` → `--ds-canvas`, `--card` et `--popover` → `--ds-surface`, `--foreground` → `--ds-text`, `--muted` → `--ds-surface-2`, `--muted-foreground` → `--ds-text-3`, `--primary` → `--ds-primary`, `--primary-foreground` → `--ds-primary-fg`, `--accent` → `--ds-primary-subtle`, `--accent-foreground` → `--ds-primary-subtle-fg`, `--destructive` → `--ds-danger`, `--border` → `--ds-border`, `--input` → `--ds-border-control`, `--ring` → `--ds-focus`, `--radius` → `--ds-radius-md`. Le kit livré contient `tailwind.css` et `shadcn-theme.css` prêts à importer.

Polices : IBM Plex si disponible localement, sinon fallback système.

Fonctions métier à porter côté serveur, pas dans l'interface : calcul des échéances en heures ouvrées par site et calendrier de service, détection de doublon par équipement et lieu, priorité proposée par impact et catégorie. L'interface affiche leur résultat et leur raison.

## Liste de contrôle avant fusion

1. Aucune valeur en dur : couleurs, rayons, ombres, durées viennent de `--ds-*`.
2. Les deux thèmes et les trois densités sont vérifiés à l'œil.
3. Chaque état est prévu : chargement, vide, vide filtré, erreur, hors connexion si pertinent.
4. Clavier : tout est atteignable, le focus est visible, Échap ferme, le focus revient à l'origine.
5. axe-core sans violation ; contraste recalculé si une couleur change (`tokens.py`).
6. Reflow à 320 px sans défilement horizontal ; cibles ≥ 24 px (44 px sur mobile).
7. Une seule action pleine par vue ; libellés verbe + objet ; textes relus avec les règles de ton.
8. Les principes de lisibilité, cohérence et sobriété sont respectés.


