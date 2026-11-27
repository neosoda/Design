# PROMPT — Intégrer Glassy OTP dans un projet existant

Tu es un développeur frontend senior React / Next.js, spécialiste motion design et interfaces d'authentification accessibles.

**Mission :** intégrer dans ce projet le composant de vérification OTP « Glassy OTP » à partir de `components/GlassyOtp.tsx`, `components/GlassyOtp.module.css` et `config/glassy-otp.json` fournis. Respecte l'identité de l'application sans dégrader le design de référence.

## Design non négociable

- Carte *glassmorphism* fumée anthracite/brun, reflets fins, flou d'arrière-plan réaliste, bordure translucide, arrondis généreux.
- Icône e-mail circulaire avec petite notification, titre, instruction, adresse e-mail partiellement masquée.
- Quatre cases de code bien espacées, saisie fluide, collage, gestion du clavier et de l'autoremplissage SMS/e-mail si disponible.
- Lors de la validation, les 4 cases glissent en grille 2×2 ; les diagonales forment un X lumineux vert menthe ; les cases se fondent dans une coche verte pulsante.
- Bouton de validation qui passe de discret à vert, puis écran de confirmation avec deux lignes de statut et bouton Continuer.
- Compte à rebours avant renvoi, états chargement/erreur, animation d'erreur sobre, adaptation mobile et `prefers-reduced-motion`.
- CSS Modules, TypeScript strict, zéro dépendance d'animation supplémentaire, pas d'images externes nécessaires.

## Exigences fonctionnelles et sécurité

1. Trouve le parcours réel OTP existant et réutilise son API et sa gestion de session. Ne crée pas une nouvelle authentification en parallèle.
2. La vérification est exclusivement côté serveur. Ne code pas de validation avec une valeur OTP dans le navigateur.
3. Gère expiration, tentatives excessives, erreur réseau et renvoi ; ne confonds jamais animation de succès et confirmation serveur.
4. Préserve la protection contre abus du backend (TTL, usage unique, rate limiting, challenge lié à l'utilisateur et à la session, cookie sécurisé/CSRF selon l'architecture).
5. Préserve l'accessibilité : input sémantique avec `autocomplete="one-time-code"`, annonces d'erreur, navigation au clavier, contrastes et réduction des animations.
6. Paramétrage de couleurs, textes, nombre de chiffres (4/6), timer et callbacks. Évite de dupliquer le composant par projet.
7. Contrôle `npm run lint`, `tsc --noEmit`, build, et teste au moins les flux réussite, échec, collage, renvoi et saisie partielle.

**Livrable :** composant réellement branché sur les endpoints existants, CSS propre, documentation courte, aucun mock ni OTP codé en dur dans le code de production. Expliquer précisément si une route API manque plutôt que prétendre que l'authentification est opérationnelle.
