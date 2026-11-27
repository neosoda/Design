# Glassy OTP — kit de composant réutilisable

Recréation libre de l'interface vue dans la vidéo **Glassy OTP V15** : verre fumé, code à 4 chiffres, déplacement des cases en carré, connexion en X néon, validation verte puis vue de confirmation. Interface francisée et personnalisable. **Aucune dépendance d'animation.**

## Contenu

- `components/GlassyOtp.tsx` — composant React/Next.js (TypeScript).
- `components/GlassyOtp.module.css` — styles et animations CSS.
- `config/glassy-otp.json` — manifeste du style, des paramètres et libellés.
- `example/page.tsx` — exemple Next.js avec points d'API à connecter.
- `preview.html` — démonstration autonome fonctionnant dans un navigateur, sans build.
- `PROMPT.md` — prompt prêt à donner à Codex / Claude Code / Gemini.

## Intégration Next.js (App Router)

Copier `GlassyOtp.tsx` et `GlassyOtp.module.css` dans le répertoire de composants de l'application ; importer `GlassyOtp` dans une page client et fournir :

```tsx
<GlassyOtp
  email={user.email}
  digits={4}
  cooldownSeconds={25}
  onVerify={async (code) => {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'same-origin',
      body: JSON.stringify({code}),
    });
    return response.ok;
  }}
  onResend={async () => {
    const response = await fetch('/api/auth/resend-otp', {method: 'POST', credentials: 'same-origin'});
    if (!response.ok) throw new Error('Resend failed');
  }}
  onContinue={() => window.location.assign('/dashboard')}
/>
```

Propriétés : `email` et `onVerify` requis ; `digits` 4 ou 6, `cooldownSeconds`, `onResend`, `onContinue`, `labels`, `className`, `autoComplete` optionnels.

## Personnalisation

Les couleurs sont des variables CSS : `--otp-accent`, `--otp-success`, `--otp-edge`, `--otp-text`, `--otp-muted`. On peut les surcharger depuis une classe personnalisée. Les libellés sont personnalisables via `labels`.

## Important : sécurité réelle

**L'animation n'est pas un moteur de vérification OTP.** Le composant appelle `onVerify(code)` : le serveur doit décider. Ne jamais écrire `if (code === "2468")` dans une app de production. Les routes dans `example/page.tsx` sont des contrats d'intégration, pas des routes fonctionnelles livrées.

Côté serveur, prévoir des codes aléatoires générés avec CSPRNG, TTL court, stockage sous forme de hash/HMAC, invalidation après usage, limitation des tentatives et de l'envoi, rattachement à la session/challenge utilisateur, contrôle de session/CSRF et journalisation sans OTP en clair. Éviter de mettre le code en query string, dans `localStorage` ou dans les logs. Le cooldown visuel **ne remplace pas** un rate limit serveur.

Pour un vrai parcours avec Authentik, Supabase Auth ou un fournisseur d'identité, utiliser son mécanisme d'émission et de vérification plutôt que réinventer l'authentification.

## Voir immédiatement

Ouvrir `preview.html` dans un navigateur : saisir **2468** pour déclencher l'animation. Ce code n'existe **que dans cette démo locale**, sans sécurité ni backend.
