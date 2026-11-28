# Prompt d'application — Forma UI

Copiez et adaptez le prompt ci-dessous pour appliquer l'identité **Forma UI** à un projet existant ou nouveau (HTML/CSS, React, Next.js, Vue, Svelte, Tailwind CSS ou shadcn/ui) sans casser aucune fonctionnalité.

---

```markdown
Applique intégralement le système de design **Forma UI** (signalétique suisse contemporaine pour sites institutionnels, documentation et démarches publiques) à ce projet.

### 1. Préservation fonctionnelle
- Conserve l'intégralité des routes, états applicatifs, appels API, validations métier et contenus réels existants.
- N'invente aucune statistique, citation, témoignage ou mention légale fictive.

### 2. Fondations visuelles et tokens (`--forma-*`)
- Mode clair (Papier froid) : fond `#F3F4EF`, surface `#FAFBF8`, encre `#171A1D`, secondaire `#4A555E`, filet `#B0B5B6`, bleu outremer `#1937A5` (texte `#FFFFFF`).
- Mode sombre (`[data-theme="dark"]`) : fond `#101316`, surface `#161B20`, encre `#EEF0EC`, secondaire `#A9B2BA`, filet `#313B45`, accent `#84A4FF` (texte `#101316`).
- États sémantiques : erreur `#A82419` / `#FF8F85`, confirmation `#185C37` / `#75D49E`.
- Rayon de bordure : `0px` partout. Aucune ombre portée (`box-shadow: none`), aucun `backdrop-filter`, aucun dégradé décoratif.

### 3. Typographie et composition
- Police principale néo-grotesque (`"Helvetica Neue", "Neue Haas Grotesk Text Pro", "Liberation Sans", Arial, sans-serif`), chasse fixe réservée aux cotes, horaires et références (`tabular-nums`).
- Casse phrase sur tous les titres, boutons, labels et en-têtes de tableaux. Supprime tout bandeau en capitales espacées (eyebrow) au-dessus des titres.
- Limite la largeur du texte courant à `68ch`.
- Utilise des grilles asymétriques franches : `7fr / 5fr` pour l'accueil, `4fr / 8fr` pour les sections d'orientation, `3.2fr / 8.8fr` pour un index filtrable ou une page documentaire avec sommaire collant.
- Remplace les grilles de cartes génériques par des répertoires horizontaux scandés par des filets `1px` et des en-têtes de section en filet fort `2px`.

### 4. Composants, états et accessibilité
- Hauteur minimale des champs et boutons : `44px` (`38px` en mode compact).
- Focus clavier immédiat et très lisible : `outline: 3px solid var(--forma-focus); outline-offset: 3px`.
- Formulaires : `<label for>` toujours visible au-dessus du champ, erreurs reliées via `aria-describedby` et `aria-invalid="true"`, sans astérisque muet.
- Prévois les états de chargement sobre, vide avec bouton de réinitialisation directe, erreur explicite (`role="alert"`), `prefers-reduced-motion: reduce` et `@media print`.

### 5. Vérification attendue
- Contrôle l'absence de valeurs de couleur en dur hors des tokens, l'absence de débordement horizontal à `375px` et `200%` de zoom, et un contraste minimal de `4.5:1` sur tous les textes courants en modes clair et sombre.
```
