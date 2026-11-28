# Forma UI — Charte graphique et système éditorial

## 1. Philosophie et signature visuelle

**Forma UI** est une direction artistique de **signalétique suisse contemporaine**, conçue pour les institutions publiques, centres d'archives, bibliothèques scientifiques, portails réglementaires et bases de documentation de référence.

Elle tire son vocabulaire de la grille typographique helvétique (Josef Müller-Brockmann, Wim Crouwel) et de la signalétique d'orientation civique :
- **La structure est l'information** : filets francs de `1 px` et `2 px`, angles stricts à `0 px`, aucune ombre portée, aucun flou décoratif.
- **Priorité à la tâche civique et documentaire** : orienter l'usager en quelques secondes vers un texte consolidé, un horaire ou une démarche pas à pas.
- **Reconnaissance sans couleur ni logo** : même passée en niveaux de gris et privée de son monogramme, une page Forma UI s'identifie immédiatement par son épine dorsale asymétrique (`4fr / 8fr`), ses répertoires en lignes tabulaires à cotes archivistiques (`GU-01.2`, `DOC-03.1`), ses sommaires latéraux fixes et ses formulaires linéaires à pleine lisibilité.

### Explorations écartées lors de la direction artistique

1. *Portail en tuiles arrondies (type SaaS public)* — Écarté : fragmente la lecture comparative des démarches et ressemble à un modèle générique interchangeable.
2. *Journal néo-classique à empattements littéraires* — Écarté : pertinent pour la presse d'opinion (réservé à Gazette UI), mais pénalise la lecture rapide des formulaires administratifs et des cotes techniques.
3. **Signalétique modulaire néo-grotesque (retenue)** — Conjugue autorité institutionnelle, neutralité civique, vitesse de balayage visuel et sobriété d'impression.

---

## 2. Cas d'utilisation

| Recommandé | Déconseillé |
|---|---|
| Portails publics, mairies, administrations, services aux usagers | Tableaux de bord temps réel à haute fréquence (préférer Vector UI ou Axiom UI) |
| Centres de ressources, archives, bibliothèques, musées | Boutiques émotionnelles de luxe (préférer Opaline UI) |
| Documentation technique ou juridique, recueils réglementaires | Applications ludiques grand public ou réseaux sociaux |
| Intranets documentaires et guides de procédures | Interfaces immersives plein écran de création graphique (préférer Canvas UI) |

---

## 3. Identité graphique, logotype et iconographie

- **Logotype** : deux feuillets architecturaux décalés sur une ligne d'assise continue ([`forma-mark.svg`](assets/forma-mark.svg)), accompagnés du mot-symbole **Forma.** composé en néo-grotesque gras (`-0.035em`).
- **Planche signalétique** : aplat plein bleu outremer (`--forma-accent`) réservé au repère éditorial d'accueil et aux actions primaires — jamais de dégradé ni de halo lumineux.
- **Iconographie** : usage minimaliste. Les symboles typographiques (`+` / `−`, numérotation séquentielle `01` / `02` / `03`) remplacent les icônes décoratives partout où un mot suffit. Lorsqu'une icône fonctionnelle est requise, trait orthogonal constant `2 px`, terminaisons carrées (`stroke-linecap="butt"`).

---

## 4. Colorimétrie (Primitives et Sémantique)

Source unique : [`tokens.json`](tokens.json) et [`tokens.css`](tokens.css).

| Rôle sémantique | Mode Papier (`light`) | Mode Nuit (`dark`) | Contraste mesuré sur fond |
|---|---|---|---|
| `--forma-bg` (fond de page) | `#F3F4EF` (Papier froid) | `#101316` (Ardoise profonde) | — |
| `--forma-surface` (surface active) | `#FAFBF8` | `#161B20` | — |
| `--forma-fg` (encre principale) | `#171A1D` | `#EEF0EC` | **15,81:1** (clair) / **16,28:1** (sombre) |
| `--forma-muted` (texte secondaire) | `#4A555E` | `#A9B2BA` | **6,90:1** (clair) / **8,31:1** (sombre) |
| `--forma-accent` (bleu outremer) | `#1937A5` | `#84A4FF` | **8,91:1** sur papier / **7,88:1** sur ardoise |
| `--forma-danger` (alerte / erreur) | `#A82419` | `#FF8F85` | **6,52:1** / **7,45:1** |
| `--forma-success` (confirmation) | `#185C37` | `#75D49E` | **7,35:1** / **9,62:1** |

Règle chromatique stricte : **aucune information ne repose sur la couleur seule**. Toute erreur ou confirmation s'accompagne d'un filet supérieur fort (`2 px`), d'un encadré explicite, d'un titre et d'une consigne d'action.

---

## 5. Typographie et échelle modulaire

- **Famille principale (`--forma-font`)** : néo-grotesque rationnelle (`"Helvetica Neue"`, `"Neue Haas Grotesk Text Pro"`, `"Liberation Sans"`, `Arial`, `sans-serif`). Aucune dépendance réseau externe obligatoire.
- **Famille tabulaire (`--forma-font-mono`)** : chasse fixe réservée exclusivement aux cotes (`DOC-03.1`), numéros de récépissé (`DEM-LEC-4190`) et repères d'étapes.
- **Longueur de ligne** : plafonnée à `68ch` (`--forma-measure`) pour tout texte réglementaire ou explicatif.
- **Casse** : phrase normale (*sentence case*) sur l'ensemble des titres, libellés, onglets et en-têtes de tableaux. **Interdiction absolue des bandeaux tout-majuscules interlettrés (*eyebrows*).**

| Jeton | Taille | Interlignage | Approche | Usage |
|---|---|---|---|---|
| `--forma-text-display` | `clamp(2.5rem, 5.6vw, 4.75rem)` | `1.02` | `-0.038em` | Titre principal de portail (`h1`) |
| `--forma-text-3xl` | `clamp(1.85rem, 3.4vw, 2.75rem)` | `1.10` | `-0.03em` | Titres de sections majeures (`h2`) |
| `--forma-text-2xl` | `1.75rem` (28 px) | `1.18` | `-0.025em` | En-tête de répertoire, mot-symbole |
| `--forma-text-xl` | `1.375rem` (22 px) | `1.25` | `-0.02em` | Intitulé de fiche dans l'index |
| `--forma-text-lg` | `1.1875rem` (19 px) | `1.50` | `0` | Chapeau d'orientation |
| `--forma-text-base` | `1rem` (16 px) | `1.55–1.68` | `0` | Corps de texte, contrôles de saisie |
| `--forma-text-sm` | `0.875rem` (14 px) | `1.45` | `0` | Métadonnées, tableaux, aides à la saisie |
| `--forma-text-xs` | `0.8125rem` (13 px) | `1.40` | `0` | Cotes archivistiques, étiquettes de nature |

---

## 6. Grille, espacements et géométrie

- **Conteneur maximal** : `1320 px` centré, gouttières extérieures fluides `clamp(20px, 4vw, 56px)`. Au-delà de `1440 px`, seules les marges extérieures respirent ; la mesure de lecture ne s'étire jamais.
- **Trois gabarits structurels** :
  1. *Portail (`7fr / 5fr` puis `4fr / 8fr`)* : colonne éditoriale dominante à gauche, planche signalétique à droite, puis index d'orientation horizontal.
  2. *Catalogue (`3.2fr / 8.8fr`)* : rail latéral de filtrage aligné en tête à gauche, répertoire tabulaire dépliable à droite.
  3. *Documentation et démarche (`3.2fr / 8.8fr`)* : sommaire collant à gauche, colonne de lecture (`68ch`), barème tabulaire et formulaire linéaire à droite.
- **Rayon de courbure** : `--forma-radius: 0px` sur tous les composants. L'orthogonalité exprime la rigueur documentaire.
- **Séparateurs** : filet fin `1 px` (`--forma-border`) entre éléments d'une même collection ; filet fort `2 px` (`--forma-border-strong`) en tête de section, d'en-tête et de tableau.

---

## 7. Composants et états

Chaque composant interactif couvre les états : **repos, survol, focus clavier (`3 px` décalé de `3 px`), actif/sélectionné (`aria-selected`, `aria-pressed`), désactivé (`:disabled`, `aria-disabled`), chargement, vide, erreur et confirmation**.

1. **Bandeau d'avis public (`.forma-notice`)** : information horodatée non bloquante en tête de page, repliable par l'usager.
2. **Barre d'onglets de surface (`.forma-tab`)** : `role="tablist"` dans `<nav>`, navigation fléchée `ArrowLeft`/`ArrowRight`/`Home`/`End`, hauteur minimale `44 px`, surface active pleine en bleu outremer.
3. **Répertoire d'orientation (`.forma-directory`)** : lignes horizontales à 4 colonnes (cote, intitulé, précision horaire, action directe).
4. **Ligne d'index dépliable (`.forma-index-row`)** : élément natif `<details>/<summary>` fonctionnel même sans JavaScript, complété d'une fiche descriptive encadrée (`1 px` + filet supérieur `2 px`) et liste de définition `<dl>`.
5. **Contrôles de formulaire (`.forma-input`, `.forma-select`, `.forma-fieldset`)** : labels explicites toujours visibles au-dessus du champ, hauteur minimale `44 px` (`38 px` en densité compacte), validation accessible (`aria-invalid="true"`, message relié par `aria-describedby`, reprise automatique du focus sur le premier champ en erreur).
6. **Lecteur normatif modal (`<dialog class="forma-dialog">`)** : ouverture native `.showModal()`, fermeture par `Échap` ou bouton explicite, restitution systématique du focus au déclencheur.

---

## 8. Motion design, responsive et accessibilité

- **Mouvement (`motion.css`)** : transitions de couleur et filet limitées à `110 ms`, apparition de panneau à `160 ms` (`transform` et `opacity` uniquement). Sous `prefers-reduced-motion: reduce`, toutes les durées sont ramenées à `0 ms` et les pulsations de squelette sont désactivées.
- **Responsive** :
  - `> 960 px` : grilles asymétriques complètes (`7fr/5fr`, `4fr/8fr`, `3.2fr/8.8fr`).
  - `521–960 px` (tablette) : passage sur une colonne fluide, sommaire replacé en tête de texte, lignes d'index condensées sans perte de métadonnées.
  - `≤ 520 px` (mobile) : contrôles tactiles `≥ 44 px`, zéro débordement horizontal jusqu'à `320 px` et au zoom `200 %`.
- **Impression (`@media print`)** : suppression automatique de la navigation, des filtres et des boutons ; conservation intégrale du texte et des tableaux en noir sur fond blanc.

---

## 9. Règles anti-slop spécifiques à Forma UI

| À faire (Conforme Forma UI) | À proscrire (Contre-exemple) |
|---|---|
| Structurer un catalogue avec des lignes bordées de filets `1 px` et une cote alignée | Découper les ressources en grille de 3 cartes blanches ombrées à coins `16 px` |
| Écrire des titres directs en casse phrase : `Index documentaire` | Empiler un badge majuscule `RESSOURCES · 2026` au-dessus de chaque `h2` |
| Formuler une erreur précise : `Saisissez une adresse contenant @` | Afficher `Oups ! Quelque chose s'est mal passé` ou des compteurs marketing fictifs |
| Utiliser `<details>` et `<dialog>` natifs accessibles au clavier | Fabriquer des accordéons en `<div>` non focalisables avec animations de `height` |
