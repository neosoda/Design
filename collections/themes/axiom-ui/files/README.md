# Axiom UI — Template React réutilisable

Recréation **inspirée** de la vidéo/capture transmise. Ce n'est pas le code source original de l'auteur ni une reproduction pixel perfect (vidéo compressée).

## Démarrage

Prérequis : Node.js 20.19+ (ou 22.12+).

```bash
npm install
npm run dev
```

Puis ouvrir l'URL locale affichée par Vite. Pour produire les fichiers statiques : `npm run build` (dans `dist/`).

## Direction visuelle

Voir [DESIGN.md](DESIGN.md) pour les tokens, les composants et les règles responsive.

## Personnalisation rapide

Tout le contenu de démonstration se modifie dans **`src/dashboard.config.json`** :

- `brand.name`, `brand.initial`, `brand.accent` : nom et couleur de marque.
- `profile` : identité affichée.
- `locale`, `currency` : formats et devise.
- `metrics.overview/users/analytics` : cartes KPI.
- `users` : contenu du tableau et filtres.
- `products` : produits du catalogue.
- `revenue`, `traffic`, `activities` : données des graphiques et flux d'activité.

Départ par défaut sur **Users** pour correspondre à la capture. Changer `useState<PageId>('users')` en `'overview'` dans `src/Dashboard.tsx` pour démarrer sur la page d'accueil.

## Ce qui fonctionne

- Navigation Overview / Users / Products / Analytics.
- Recherche des utilisateurs et des produits, filtre par statut/role/catégorie, tri produits.
- Ajout/modification des utilisateurs **en mémoire**, pagination, export CSV.
- Sélection de période, valeurs textuelles des graphiques et animations respectant le mouvement réduit (Framer Motion).
- Mode sombre, rail dépliable et densité du tableau mémorisés localement ; navigation mobile fermable par Échap.
- Graphiques SVG et produit 3D **CSS** : aucune API / image externe requise.

**Important :** le backend, l'authentification, les vraies statistiques et la persistance des données métier **ne sont pas inclus**. Brancher les données réelles via votre API/DB et sécuriser les mutations côté serveur (auth + RBAC + validation) avant une utilisation en production.

## Réutilisation avec Next.js / React

Copier `src/Dashboard.tsx`, `src/types.ts`, `src/styles.css` et `src/dashboard.config.json` dans votre application React ou Next.js.

Installer les dépendances visuelles :

```bash
npm install framer-motion lucide-react
```

Dans Next.js App Router, ajouter **`'use client';`** tout en haut de `Dashboard.tsx`, et importer `styles.css` dans `app/layout.tsx` ou adapter les sélecteurs à votre système CSS. L'API du composant est :

```tsx
import Dashboard from '@/components/Dashboard';
import config from '@/components/dashboard.config.json';
import type { DashboardConfig } from '@/components/types';

export default function Page() {
  return <Dashboard config={config as DashboardConfig} />;
}
```

Pour les projets SaaS, remplacer le tableau `config.users` par vos données serveur. Le composant est volontairement indépendant du choix de backend, d'ORM ou d'authentification.

## Aperçu sans installation

`preview-users.html` est un **aperçu statique autonome** de la vue Users (CSS intégré, sans dépendance réseau, sans installation). Téléchargez le fichier et ouvrez-le directement dans votre navigateur. Il peut être régénéré via `python generate_preview.py`. Ses boutons sont intentionnellement inactifs : pour les interactions, lancer la démo React avec `npm run dev`.

## Fichiers

```
src/
  Dashboard.tsx           Interface + interactions
  dashboard.config.json   Configuration et données d'exemple
  types.ts                Contrat TypeScript
  styles.css              Thème + responsive
  main.tsx                Entrée de la démo Vite
PROMPT_CODEX.md           Prompt prêt à réutiliser dans vos projets
```

Licence du code **créé pour cette livraison** : MIT (`LICENSE`). Les captures et éléments de l'auteur du TikTok ne sont pas redistribués et ne sont pas couverts par cette licence.
