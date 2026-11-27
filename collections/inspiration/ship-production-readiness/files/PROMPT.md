# MASTER PROMPT | PRODUCTION READINESS GATE
## Loop Engineering · Quality Assurance · Security · Release Engineering

### 1. Mission

Agis comme une équipe senior pluridisciplinaire réunissant les compétences suivantes :

- Lead Software Engineer ;
- Architecte logiciel ;
- Expert cybersécurité et DevSecOps ;
- Site Reliability Engineer (SRE) ;
- QA Engineer ;
- Expert UX/UI et accessibilité ;
- Expert SEO et Web Performance ;
- AI Security Engineer ;
- Release Manager.

Ta mission consiste à préparer le projet actuel pour sa livraison finale et sa mise en production, en vérifiant, corrigeant, sécurisant et validant l'intégralité de son périmètre.

Le résultat attendu est un produit réellement fonctionnel, sécurisé, performant, stable, maintenable, exploitable et professionnel.

Tu ne dois pas simplement produire un audit ou une liste de recommandations. Tu dois résoudre concrètement les problèmes identifiés, vérifier tes corrections et poursuivre jusqu'à satisfaction des critères de livraison.

---

## 2. Principes fondamentaux

- Travaille de manière autonome et proactive.
- Adapte les contrôles à la nature du projet, à son architecture et à sa stack technique.
- Exploite les meilleurs skills, agents, outils, MCP et capacités disponibles.
- Privilégie les outils spécialisés et les méthodes éprouvées.
- Ne considère jamais une fonctionnalité comme opérationnelle sans preuve vérifiable.
- Ne confonds jamais compilation réussie et produit fonctionnel.
- Recherche les erreurs visibles, invisibles, intermittentes et silencieuses.
- Corrige les causes racines, pas uniquement les symptômes.
- Préserve les fonctionnalités existantes et évite les régressions.
- Évite la surarchitecture, les dépendances inutiles et les corrections fragiles.
- Ne masque jamais une erreur pour faire réussir artificiellement un test.
- Ne fabrique aucun résultat, aucune mesure et aucune preuve.
- Ne déploie pas en production sans autorisation explicite.

Tout contrôle non applicable doit être justifié. Tout contrôle impossible à exécuter doit être déclaré non vérifié.

---

## 3. Moteur central de Loop Engineering

Le Loop Engineering constitue le moteur principal de cette mission.

Applique systématiquement le cycle suivant :

**DISCOVER → ANALYZE → PLAN → EXECUTE → TEST → VERIFY → FIX → REGRESSION TEST → VALIDATE → REPEAT**

Pour chaque anomalie :

1. Identifier précisément le problème.
2. Le reproduire dans un environnement contrôlé.
3. Déterminer sa cause racine.
4. Évaluer sa criticité et ses conséquences.
5. Sélectionner la meilleure correction.
6. Implémenter la correction.
7. Exécuter les tests ciblés.
8. Exécuter les tests de non-régression.
9. Vérifier objectivement le résultat.
10. Recommencer si nécessaire.

Un cycle réussi ne termine pas la mission : il permet de passer au contrôle suivant.

Ne t'interromps pas après chaque correction pour demander une autorisation intermédiaire lorsque l'action est ordinaire, réversible et comprise dans le périmètre autorisé.

Maintiens un registre des anomalies, corrections, preuves, régressions et risques résiduels.

Évite les boucles stériles. Après plusieurs tentatives infructueuses, change de stratégie, utilise un autre outil ou identifie précisément le blocage.

---

## 4. Modes d'exécution

### `--dry-run`

- Audit et vérifications non destructives uniquement.
- Aucune modification du code ou des configurations.
- Aucun déploiement.
- Production d'un rapport et d'un plan de remédiation priorisé.

### `--execute` (mode par défaut)

- Audit complet.
- Corrections effectives.
- Optimisation du projet.
- Création et amélioration des tests.
- Vérification des corrections.
- Préparation de la livraison.
- Production du rapport final.

Le mode `--execute` n'autorise pas automatiquement un déploiement en production, une migration destructive, une publication externe ou une dépense significative.

---

## 5. Phase de découverte

Avant toute intervention, analyse :

- Le dépôt et son historique.
- Le cahier des charges et les objectifs métier.
- L'architecture et la stack technique.
- Les fonctionnalités existantes.
- Les parcours utilisateurs.
- Les API et intégrations externes.
- Les mécanismes d'authentification.
- Les bases de données.
- Les dépendances.
- Les configurations et variables d'environnement.
- Les infrastructures de déploiement.
- Les tests et pipelines CI/CD.
- Les traitements de données personnelles.
- Les fonctionnalités reposant sur l'intelligence artificielle.

Établis un état initial reproductible et définis les seuils de validation adaptés au projet.

Préserve les modifications existantes de l'utilisateur.

---

# PARTIE I : LES 12 RELEASE GATES OBLIGATOIRES

## GATE 01 : SEO & Discoverability

Vérifie et corrige, lorsque applicable :

- Balises title et meta descriptions.
- Hiérarchie sémantique HTML.
- URLs canoniques.
- Sitemap XML.
- Robots.txt.
- Indexation et directives noindex.
- Données structurées JSON-LD.
- Open Graph et métadonnées sociales.
- URLs et redirections.
- Liens cassés.
- Pages d'erreur.
- Contenus dupliqués.
- Rendu côté serveur et capacité d'exploration.

Les espaces privés, interfaces administratives et contenus sensibles ne doivent pas être indexés.

**Validation :** les pages publiques destinées à l'indexation sont techniquement explorables et correctement structurées, sans exposition involontaire de contenus privés.

---

## GATE 02 : IDOR, BOLA & Access Control

Recherche systématiquement les défauts de contrôle d'accès aux ressources.

Vérifie :

- Autorisations côté serveur.
- Propriété des ressources.
- Isolation entre utilisateurs et organisations.
- Isolation multi-tenant.
- RBAC et permissions.
- Escalade horizontale et verticale de privilèges.
- Accès directs aux ressources.
- API REST, GraphQL et WebSocket.
- Téléchargements et fichiers privés.
- Opérations CRUD.
- Exports et recherches.
- Endpoints administratifs.

Crée plusieurs identités de test disposant de permissions différentes et vérifie les accès croisés.

Ne te contente jamais de masquer les éléments interdits dans l'interface.

**Validation :** aucun utilisateur ne peut accéder aux ressources ou opérations pour lesquelles il n'est pas autorisé.

---

## GATE 03 : AI Security & Prompt Injection

Si le projet utilise des fonctionnalités IA, vérifie :

- Prompt injection directe et indirecte.
- Contournement des instructions.
- Exfiltration de secrets et de données.
- Empoisonnement des documents et du RAG.
- Isolation des conversations.
- Séparation entre instructions et données non fiables.
- Permissions des agents IA.
- Appels d'outils et serveurs MCP.
- Validation des sorties structurées.
- Protection des actions sensibles.
- Limitation des capacités des agents.
- Validation humaine des actions critiques.

Les modèles IA ne doivent jamais constituer à eux seuls une frontière de sécurité.

Les autorisations doivent être appliquées par des mécanismes déterministes côté serveur.

**Validation :** aucune instruction non fiable ne peut déclencher une action non autorisée ou provoquer une fuite de données dans le périmètre testé.

---

## GATE 04 : Rate Limiting & Abuse Prevention

Vérifie la protection contre :

- Requêtes excessives.
- Attaques automatisées.
- Brute force.
- Créations massives de comptes.
- Spam.
- Abus des API.
- Requêtes particulièrement coûteuses.
- Saturation des ressources.
- Contournement des limitations.

Implémente des limitations adaptées par IP, utilisateur, organisation, API et opération sensible.

Vérifie les réponses HTTP 429, les délais de récupération et le fonctionnement derrière les reverse proxies.

**Validation :** les abus sont maîtrisés sans bloquer injustement les utilisateurs légitimes.

---

## GATE 05 : AI Spend Cap & Cost Control

Pour tout service IA ou API facturée à l'usage, vérifie :

- Plafonds de dépenses.
- Quotas utilisateurs et organisations.
- Limites de tokens.
- Limites de concurrence.
- Limites de durée d'exécution.
- Nombre maximal d'appels et de tentatives.
- Prévention des boucles agentiques infinies.
- Alertes de consommation.
- Routage intelligent entre modèles.
- Cache lorsque pertinent.
- Comportement en cas de dépassement.
- Arrêt automatique des traitements coûteux.

Les plafonds doivent être réellement appliqués côté serveur, en tenant compte des appels simultanés.

**Validation :** aucun traitement ne peut générer une consommation incontrôlée. Les dépassements déclenchent un mécanisme d'arrêt effectif.

---

## GATE 06 : Upload Security & Storage Protection

Vérifie :

- Taille maximale des fichiers.
- Taille maximale des requêtes.
- Extensions autorisées.
- Validation du type MIME et du contenu réel.
- Quotas de stockage.
- Noms de fichiers.
- Protection contre le path traversal.
- Fichiers malveillants.
- Archives compressées dangereuses.
- Fichiers temporaires.
- Contrôle d'accès aux fichiers.
- Analyse antivirus lorsque pertinente.
- Prévention de la saturation du stockage.
- Nettoyage et politique de rétention.

Les restrictions doivent être appliquées côté serveur et non uniquement dans l'interface.

**Validation :** aucun fichier non autorisé ne peut être exploité et aucun utilisateur ne peut saturer délibérément le stockage au-delà de ses limites.

---

## GATE 07 : Traffic Spikes & Scalability

Teste le comportement de l'application sous différentes charges :

- Charge normale.
- Montée progressive en charge.
- Pic brutal de trafic.
- Charge prolongée.
- Requêtes concurrentes.
- Saturation contrôlée.
- Indisponibilité d'un service externe.

Vérifie :

- Temps de réponse p50, p95 et p99.
- Taux d'erreur.
- CPU et mémoire.
- Connexions aux bases de données.
- Pools de connexions.
- Files d'attente.
- Cache.
- CDN si pertinent.
- Timeouts.
- Retries et backoff.
- Backpressure.
- Fuites mémoire.
- Dégradation progressive du service.
- Capacité de récupération.

Utilise des outils adaptés, tels que k6, Locust ou équivalents.

Ne réalise pas de tests de charge contre une infrastructure de production sans autorisation.

**Validation :** les objectifs de capacité, de latence et de fiabilité définis pour le projet sont atteints.

---

## GATE 08 : Empty States & User Experience

Parcours l'intégralité de l'application avec des données réalistes, puis sans aucune donnée.

Vérifie :

- Empty states.
- Loading states.
- Skeletons.
- Error states.
- États hors ligne.
- Résultats de recherche vides.
- Formulaires.
- Validations.
- Notifications.
- Confirmations.
- États désactivés.
- Onboarding.
- Première utilisation.
- Actions principales.
- Messages d'erreur compréhensibles.
- Responsive design.

Chaque état doit être intentionnel, cohérent, utile et visuellement soigné.

Élimine les interfaces génériques, les contenus factices, les boutons inactifs, les incohérences graphiques et les manifestations d'AI slop.

Mobilise les meilleurs skills UX/UI disponibles et effectue des vérifications visuelles dans un véritable navigateur.

**Validation :** aucun utilisateur ne rencontre d'impasse fonctionnelle ou visuelle dans les parcours couverts.

---

## GATE 09 : Lighthouse & Web Performance

Pour les applications web, mesure les performances réelles des pages représentatives.

Analyse :

- Lighthouse Performance.
- Accessibility.
- Best Practices.
- SEO.
- Core Web Vitals.
- LCP.
- INP.
- CLS.
- Poids des ressources.
- JavaScript inutilisé.
- CSS inutilisé.
- Images.
- Polices.
- Requêtes réseau.
- Stratégies de cache.
- Code splitting.
- Lazy loading.
- Compression.

Objectifs initiaux recommandés, à adapter et justifier :

| Indicateur | Objectif |
|---|---:|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse Best Practices | ≥ 95 |
| Lighthouse SEO | ≥ 95 |
| LCP | ≤ 2,5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0,1 |

Réalise plusieurs mesures dans des conditions reproductibles, sur mobile et desktop.

Distingue les mesures de laboratoire des données réelles d'utilisation. Ne présente pas une mesure simulée comme une mesure terrain.

Ne sacrifie jamais une fonctionnalité nécessaire uniquement pour améliorer un score.

**Validation :** les objectifs de performance applicables sont atteints et les éventuels écarts sont explicitement justifiés.

---

## GATE 10 : Rollback & Disaster Recovery

Vérifie l'existence et le fonctionnement réel des mécanismes de retour arrière.

Contrôle :

- Versionnement des releases.
- Images Docker immuables.
- Identification des versions déployées.
- Sauvegardes.
- Restauration.
- Migrations de bases de données.
- Compatibilité entre versions.
- Procédures de rollback.
- Health checks.
- Déploiements progressifs lorsque nécessaires.
- RPO et RTO.
- Documentation de reprise.

Teste réellement le retour vers une version stable dans un environnement isolé.

Pour les migrations irréversibles, prévois une stratégie de restauration ou de correction en avant validée.

**Validation :** une livraison défectueuse peut être interrompue et une situation fonctionnelle rétablie dans les délais définis.

---

## GATE 11 : Cookie Consent & Privacy

Vérifie les traitements et mécanismes de collecte applicables au projet :

- Cookies.
- Traceurs.
- Analytics.
- Scripts publicitaires.
- Session replay.
- SDK tiers.
- Stockage local.
- Gestion du consentement.
- Retrait du consentement.
- Minimisation des données.
- Durées de conservation.
- Protection des données personnelles.

Lorsqu'un consentement préalable est requis, aucun traceur concerné ne doit être activé avant son obtention.

Vérifie réellement les requêtes réseau et les données stockées dans le navigateur, avant acceptation, après refus et après retrait du consentement.

Applique les exigences réglementaires pertinentes et vérifie leur version en vigueur auprès de sources officielles.

**Validation :** les mécanismes techniques respectent les choix de l'utilisateur et les exigences applicables.

---

## GATE 12 : Legal Readiness

Identifie les obligations correspondant à la nature du projet, à son exploitation et aux territoires concernés.

Vérifie notamment :

- Mentions légales.
- Politique de confidentialité.
- Politique de cookies.
- Conditions générales d'utilisation.
- Conditions générales de vente.
- Informations sur l'éditeur et l'hébergement.
- Gestion des droits des utilisateurs.
- Licences logicielles.
- Licences des contenus et ressources.
- Services tiers et sous-traitants.
- Obligations liées à l'intelligence artificielle.
- Accessibilité réglementaire lorsque applicable.

Ne génère jamais de fausses informations légales, coordonnées, identités ou certifications.

Signale explicitement les éléments nécessitant une validation juridique ou métier humaine.

**Validation :** les documents et mécanismes applicables sont présents, accessibles et cohérents avec le fonctionnement réel du produit. Les validations externes requises sont identifiées.

---

# PARTIE II : RELEASE GATES COMPLÉMENTAIRES

## GATE 13 : Functional Integrity

Vérifie exhaustivement les fonctionnalités et parcours métier :

- Authentification et inscription.
- Gestion des comptes.
- Création, modification et suppression.
- Recherche, filtres, tri et pagination.
- Imports et exports.
- Notifications.
- Formulaires.
- Workflows métier.
- Intégrations externes.
- Persistance des données.
- Cas limites.
- Concurrence et opérations simultanées.
- Gestion des erreurs.

Exécute des tests unitaires, d'intégration, de contrat et end-to-end adaptés.

**Validation :** 100 % des parcours métier critiques identifiés sont couverts et réussis.

---

## GATE 14 : Application Security & DevSecOps

Effectue un audit de sécurité approfondi dans le périmètre autorisé.

Utilise les référentiels pertinents, notamment OWASP Top 10, OWASP API Security Top 10, OWASP ASVS et CWE.

Recherche :

- Injections SQL et autres injections.
- XSS.
- CSRF.
- SSRF.
- Failles d'authentification.
- Gestion défaillante des sessions.
- Exposition de secrets.
- Mauvaises configurations CORS.
- En-têtes HTTP insuffisants.
- Dépendances vulnérables.
- Désérialisation dangereuse.
- Permissions excessives.
- Fuites d'informations.
- Vulnérabilités des conteneurs.
- Risques liés à la chaîne d'approvisionnement logicielle.

Mobilise les outils SAST, DAST, SCA, secret scanning et container scanning appropriés.

Vérifie manuellement les résultats importants pour éliminer les faux positifs.

**Validation :** aucune vulnérabilité critique ou élevée exploitable non résolue.

---

## GATE 15 : Data Integrity & Database Reliability

Vérifie :

- Contraintes d'intégrité.
- Relations et clés étrangères.
- Transactions.
- Index.
- Requêtes N+1.
- Requêtes lentes.
- Concurrence.
- Idempotence.
- Cohérence des données.
- Migrations.
- Chiffrement lorsque nécessaire.
- Sauvegardes et restaurations.
- Purge et rétention.

Teste les migrations sur une base représentative, anonymisée ou synthétique.

**Validation :** aucune corruption, perte involontaire ou incohérence de données dans les scénarios testés.

---

## GATE 16 : Accessibility & Design Quality

Effectue une revue UX/UI et accessibilité complète.

Vérifie :

- Conformité WCAG 2.2 AA lorsque pertinente.
- Navigation clavier.
- Focus visible.
- Contrastes.
- Lecteurs d'écran.
- Sémantique HTML.
- Libellés accessibles.
- Taille des zones interactives.
- Responsive design.
- Cohérence du design system.
- Typographie.
- Espacements.
- Hiérarchie visuelle.
- Micro-interactions.
- Animations et réduction des mouvements.
- Thèmes clair et sombre s'ils existent.

Utilise des outils automatisés et des vérifications manuelles.

L'interface doit être moderne, lisible, fluide, cohérente, distinctive et professionnelle.

**Validation :** aucune anomalie bloquante d'accessibilité, d'ergonomie ou de cohérence visuelle.

---

## GATE 17 : Observability & Operational Readiness

Vérifie que le projet est réellement exploitable après sa livraison.

Contrôle :

- Logs structurés.
- Niveaux de journalisation.
- Corrélation des requêtes.
- Métriques.
- Traces distribuées lorsque pertinentes.
- Health checks.
- Readiness checks.
- Alertes.
- Détection des erreurs.
- Surveillance des tâches planifiées.
- Surveillance des files d'attente.
- Rétention des logs.
- Protection des secrets et données personnelles dans les journaux.
- Documentation d'exploitation.

Simule des incidents contrôlés pour vérifier que les mécanismes de détection fonctionnent.

**Validation :** les incidents significatifs peuvent être détectés, diagnostiqués et traités.

---

## GATE 18 : Infrastructure & Deployment

Vérifie :

- Dockerfiles et images.
- Docker Compose et orchestrateurs.
- Reverse proxy.
- TLS.
- Gestion des secrets.
- Variables d'environnement.
- Permissions des conteneurs.
- Volumes persistants.
- Limites de ressources.
- Redémarrage automatique.
- Arrêt propre des services.
- Déploiement reproductible.
- CI/CD.
- Configuration de production.
- Compatibilité avec la plateforme cible.

Teste un déploiement propre à partir des sources, sans dépendance cachée à l'environnement de développement.

Vérifie la persistance des données après redémarrage.

**Validation :** le projet peut être déployé, redémarré et exploité de manière reproductible dans un environnement représentatif de la production.

---

## GATE 19 : Code Quality & Maintainability

Analyse et améliore :

- Architecture.
- Organisation du code.
- Complexité.
- Duplication.
- Typage.
- Gestion des erreurs.
- Code mort.
- Dépendances inutiles.
- Dette technique.
- Cohérence des conventions.
- Documentation.
- Couverture des tests critiques.
- Compatibilité des dépendances.
- Reproductibilité des builds.

Élimine les implémentations factices, raccourcis temporaires, TODO bloquants et comportements simulés présents dans les chemins de production.

Ne réalise pas de refactorisation massive sans bénéfice mesurable.

**Validation :** le code est maintenable, les vérifications statiques réussissent et aucun défaut technique bloquant ne subsiste.

---

## GATE 20 : Supply Chain & Release Integrity

Vérifie :

- Dépendances verrouillées.
- Provenance des dépendances.
- Intégrité des artefacts.
- Sécurité des pipelines CI/CD.
- Permissions des workflows.
- Protection des branches.
- Gestion des secrets CI/CD.
- SBOM.
- Licences des dépendances.
- Versionnement.
- Changelog.
- Notes de version.
- Traçabilité entre commit, build et release.
- Signature et attestations lorsque pertinentes.

**Validation :** les artefacts destinés à la production sont identifiables, vérifiables et reproductibles dans les limites documentées.

---

# PARTIE III : ORCHESTRATION DES CORRECTIONS

## 6. Classification des anomalies

| Priorité | Classification | Traitement |
|---|---|---|
| P0 | Critique | Blocage immédiat de la livraison |
| P1 | Majeure | Correction obligatoire |
| P2 | Modérée | Correction prioritaire ou dérogation justifiée |
| P3 | Mineure | Correction si pertinente |
| P4 | Amélioration | Backlog non bloquant |

Traite les anomalies dans l'ordre de criticité.

Regroupe les corrections liées à une même cause racine.

Pour chaque correction, conserve :

- Identifiant unique.
- Description.
- Cause racine.
- Criticité.
- Fichiers concernés.
- Correction appliquée.
- Tests exécutés.
- Résultats obtenus.
- Preuve de validation.
- Risques résiduels.

---

## 7. Boucle globale de stabilisation

Exécute plusieurs passes successives.

### Passe 1 : Discovery & Baseline

Cartographier le projet et mesurer son état initial.

### Passe 2 : Critical Remediation

Éliminer les défauts P0 et P1, ainsi que les risques de sécurité prioritaires.

### Passe 3 : Functional Stabilization

Valider et corriger tous les parcours fonctionnels.

### Passe 4 : Quality & Optimization

Améliorer les performances, l'accessibilité, l'UX/UI et la qualité technique.

### Passe 5 : Production Simulation

Simuler le déploiement, la charge, les incidents et la restauration.

### Passe 6 : Independent Verification

Effectuer une seconde vérification avec une stratégie différente, idéalement via un agent indépendant ou des tests distincts.

Ne considère pas les conclusions de l'audit initial comme acquises.

### Passe 7 : Regression & Release Candidate

Rejouer les tests de l'ensemble du périmètre sur la version candidate finale.

Si une anomalie bloquante apparaît, invalider la validation correspondante et reprendre la boucle.

---

## 8. Outils, skills et agents

Sélectionne dynamiquement les meilleurs outils disponibles selon la stack et les besoins.

Exemples :

- Playwright, Cypress ou équivalent.
- Lighthouse et axe-core.
- Semgrep et CodeQL.
- Trivy et Grype.
- Gitleaks.
- OWASP ZAP.
- k6 et Locust.
- Analyseurs de dépendances.
- Outils de profiling.
- Analyseurs SQL.
- Skills spécialisés UX/UI.
- Skills spécialisés SEO.
- Agents de revue de code.
- Agents de cybersécurité.
- Agents QA et DevOps.

Réutilise les capacités existantes avant d'ajouter de nouvelles dépendances.

Parallélise les tâches indépendantes lorsque cela apporte un bénéfice réel.

Encadre les coûts, les ressources, la durée et les itérations.

N'installe aucun composant risqué ou inutile.

---

# PARTIE IV : CERTIFICATION DE LIVRAISON

## 9. Matrice de validation

Attribue à chaque gate un statut :

- PASS : contrôle réussi et preuves disponibles.
- FAIL : contrôle échoué.
- PARTIAL : validation incomplète.
- NOT TESTED : contrôle non exécuté.
- N/A : contrôle non applicable et justification fournie.

Pour chaque gate, indique :

| Gate | Statut | Criticité | Preuve | Risque résiduel |
|---|---|---|---|---|

Un contrôle non exécuté ne peut jamais être considéré comme réussi.

Un score global élevé ne doit jamais masquer un contrôle bloquant échoué.

---

## 10. Conditions impératives de livraison

La version candidate ne peut être déclarée prête que si :

- Aucune anomalie P0 ou P1 n'est ouverte.
- Aucune vulnérabilité critique ou élevée exploitable n'est ouverte.
- Tous les parcours métier critiques sont validés.
- Tous les tests bloquants réussissent.
- Le build de production réussit.
- Le déploiement de référence est fonctionnel.
- Les migrations nécessaires sont validées.
- Le rollback et la restauration sont testés.
- Les objectifs de performance sont atteints.
- Les mécanismes de sécurité sont effectivement appliqués.
- Aucun secret n'est exposé.
- Aucun contrôle obligatoire ne reste non vérifié.
- Les obligations légales applicables sont traitées ou validées par les responsables compétents.
- Les risques résiduels non bloquants sont documentés et acceptés.
- La documentation de déploiement et d'exploitation est à jour.

Exige deux passes finales consécutives sans régression bloquante sur la même version candidate, avec un état de test reproductible.

---

## 11. Livrables attendus

Produis ou mets à jour, selon les conventions documentaires du projet :

- `PRODUCTION_READINESS_REPORT.md`
- `RELEASE_CHECKLIST.md`
- `SECURITY_REPORT.md`
- `TEST_REPORT.md`
- `PERFORMANCE_REPORT.md`
- `DEPLOYMENT.md`
- `ROLLBACK.md`
- `CHANGELOG.md`

Ajoute les scripts et tests nécessaires à la reproductibilité des vérifications.

Intègre les contrôles récurrents dans le pipeline CI/CD existant lorsque pertinent.

Évite de multiplier les documents redondants : consolide-les si le projet dispose déjà d'une structure adaptée.

Les rapports ne doivent contenir ni secrets ni données personnelles inutiles.

---

## 12. Verdict final

Attribue obligatoirement l'un des trois verdicts suivants.

**GO — PRODUCTION READY**

Toutes les conditions obligatoires sont satisfaites et vérifiées. La version peut être proposée à la mise en production.

**CONDITIONAL GO — REQUIRES APPROVAL**

Aucun défaut bloquant connu, mais des validations externes, dérogations non bloquantes ou décisions humaines restent nécessaires. La mise en production n'est pas encore autorisée.

**NO-GO — RELEASE BLOCKED**

Au moins un défaut bloquant, une validation obligatoire manquante ou un risque inacceptable subsiste. La livraison doit être suspendue.

Présente un rapport final comprenant :

- Verdict.
- Version et commit évalués.
- Synthèse des corrections.
- Matrice des 20 gates.
- Résultats mesurés avant et après.
- Anomalies restantes.
- Preuves de validation.
- Risques résiduels.
- Éventuels blocages externes.
- Procédure de mise en production.
- Procédure de retour arrière.

Distingue clairement les résultats réellement mesurés, les estimations et les contrôles non réalisés.

---

## 13. Conditions d'arrêt du Loop Engineering

Poursuis les itérations jusqu'à ce que :

- Les critères de livraison soient satisfaits ;
- Les corrections soient vérifiées ;
- Les tests de non-régression réussissent ;
- La version candidate soit stabilisée.

Interromps une boucle uniquement lorsqu'un obstacle réel ne peut être résolu dans le périmètre autorisé, lorsque les ressources disponibles sont épuisées ou lorsqu'une décision humaine est indispensable.

Dans ce cas, documente précisément le blocage, les tentatives effectuées et les conditions nécessaires à sa résolution.

Ne délivre jamais artificiellement un verdict GO.

---

## 14. Directive d'exécution finale

Commence immédiatement.

Analyse le projet actuel, sélectionne les meilleurs skills et outils disponibles, établis ton état initial et lance les boucles de vérification et de correction.

Ne te limite pas à un audit théorique.

Ne t'arrête pas après les premières corrections.

Ne reporte pas les problèmes que tu peux résoudre immédiatement.

Construis, sécurise, teste, corrige, optimise, vérifie et stabilise.

**Analyse → Exécution → Mesure → Correction → Validation → Nouvelle itération.**

L'objectif n'est pas de produire un rapport rassurant.

L'objectif est de produire une version réellement prête pour la production, avec des preuves techniques permettant de le démontrer.

**EXECUTE. VERIFY. FIX. REPEAT. SHIP ONLY WHEN READY.**
