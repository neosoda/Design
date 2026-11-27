# Prompt prêt à donner à Codex / Claude Code / Gemini

Tu es développeur frontend senior, expert React/Next.js, TypeScript et UI/UX premium.

**Objectif** : intégrer le template « Admin Dashboard V15 » présent dans le dossier fourni à mon projet existant, en respectant strictement son architecture et sans casser les fonctions en production.

## Direction visuelle

Reprendre fidèlement le style du template : interface claire sur fond lilas/gris ivoire, élégante et lumineuse, fond subtilement dégradé, sidebar verticale indigo foncé à icônes, cartes glassmorphism légères, coins arrondis, ombres douces, typographie Manrope + DM Sans, tableaux épurés, petits badges d'état, animations discrètes Framer Motion. Le résultat doit être net, lisible, original, responsive et accessible. Pas de widgets factices ou décoratifs inutiles.

## Mission

1. Inspecte d'abord la stack, les composants existants, le routing, l'auth et la source des données. Ne remplace rien inutilement.
2. Réutilise `src/Dashboard.tsx`, `src/styles.css`, `src/types.ts`, `src/dashboard.config.json` comme référence de design et de comportement.
3. Intègre le design dans la stack existante (Next.js App Router, React, Tailwind ou CSS natif selon le projet). Préserve le routing, le système de design et l'accessibilité.
4. Connecte les indicateurs, tableaux, filtres, graphiques et actions aux véritables API du projet ; supprime les données fictives dans les vues de production.
5. Applique les autorisations serveur (auth, RBAC), validation des entrées et journalisation pour les actions sensibles. Aucun secret ni token côté client.
6. Respecte les préférences utilisateur : thème clair/sombre, mobile/tablette/desktop, état chargement, état vide, erreurs réseau, navigation au clavier et prefers-reduced-motion.
7. Fais des composants modulaires, réutilisables et typés. Évite les dépendances inutiles ; conserve `lucide-react` et `framer-motion` uniquement si adaptés à la stack.
8. Lance les tests/build/lint disponibles, corrige les erreurs, vérifie visuellement les quatre vues (Overview, Users, Products, Analytics) et documente l'intégration.

**Critères d'acceptation** : rendu visuel cohérent, aucune régression, composants réutilisables, zéro donnée de démo masquée derrière une vraie action, états interactifs fonctionnels, accessibilité raisonnable, build propre, interface exploitable immédiatement.

Travaille de manière autonome, sans me faire valider chaque étape non critique. En conclusion, indique seulement les fichiers modifiés, les tests passés et les éventuels points réellement bloquants.
