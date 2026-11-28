---
name: forma-ui
description: Appliquer la direction artistique suisse Forma UI à tout site institutionnel, portail public, centre d'archives, base documentaire ou service de démarches en ligne.
---

# Skill — Forma UI (Signalétique suisse et documentation publique)

## Quand activer ce skill

Utiliser **Forma UI** lorsque le produit cible privilégie l'orientation civique, la consultation documentaire, la lecture réglementaire ou l'accomplissement de démarches administratives claires (modes *Read* et *Operate* sobres). Ne jamais appliquer ce thème pour transformer un site documentaire en dashboard analytique chargé de jauges.

## Lecture préalable obligatoire

1. [`DESIGN.md`](DESIGN.md) — philosophie, grilles asymétriques, typographie et règles anti-slop.
2. [`tokens.css`](tokens.css) (ou [`tokens.json`](tokens.json)) — palette primitive/sémantique (clair et nuit), échelle typographique et géométrie à `0 px` de rayon.
3. [`components.css`](components.css) et [`motion.css`](motion.css) — implémentation modulaire sans ombre portée.
4. [`examples/shadcn-tailwind.css`](examples/shadcn-tailwind.css) — correspondance directe pour React / Next.js / Tailwind v4 / shadcn/ui.

## Invariants non négociables

1. **Zéro carte décorative, zéro ombre, zéro rayon (`0 px`)** : la hiérarchie repose sur les filets horizontaux (`1 px` fin, `2 px` structurel), le rapport d'échelle typographique et les colonnes asymétriques (`7fr/5fr`, `4fr/8fr`, `3.2fr/8.8fr`).
2. **Tokens exclusifs** : aucune couleur hexadécimale ni police en dur dans les composants ; tout passe par `--forma-*`.
3. **Typographie rigoureuse** : casse phrase partout (aucun *eyebrow* en capitales espacées), mesure de lecture plafonnée à `68ch`, chasse fixe (`--forma-font-mono`, `tabular-nums`) réservée aux cotes, horaires et numéros de dossier.
4. **États complets et honnêtes** : livrer systématiquement les états nominal, chargement sobre, vide avec action de réinitialisation, erreur explicite avec reprise (`role="alert"`), et validation de formulaire accessible (`<label for>`, `aria-invalid`, `aria-describedby`).
5. **Accessibilité et impression** : contraste WCAG AA vérifié (`≥ 4,5:1` texte courant, focus visible `3 px` décalé de `3 px`), cibles `≥ 44 px`, `prefers-reduced-motion: reduce` et feuille `@media print` propre.

## Procédure d'application sur un projet existant ou nouveau

1. Importer `tokens.css`, `components.css` et `motion.css` (ou l'adaptateur `examples/shadcn-tailwind.css`).
2. Remplacer les grilles de tuiles par des répertoires linéaires (`.forma-directory`, `.forma-index-row`) et organiser les pages longues autour d'un sommaire latéral collant (`.forma-doc-layout`).
3. Préserver 100 % des routes, gestionnaires d'événements et logiques métier existants ; n'altérer ni les contrats d'API ni les données réelles.
4. Vérifier le rendu dans un navigateur réel sur desktop (`1440 px`), tablette (`768 px`), mobile (`375 px`), zoom `200 %` et mode nuit (`data-theme="dark"`).
