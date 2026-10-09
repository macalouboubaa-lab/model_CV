# TASKS — SAMA CV

État mis à jour : 2026-10-09.

## Terminé

- [x] Créer les documents de règles, architecture, historique et tâches.
- [x] Définir la frontière de confiance : rôle, paiement et droits validés côté serveur.
- [x] Identifier la dépendance opérationnelle à la configuration Supabase, Wave Business et Vercel.
- [x] Ajouter le lien Wave externe fourni dans la galerie avec son marchand et son montant explicités.
- [x] Ajouter la signature du site à l’index et aux quatorze modèles existants.
- [x] Créer les favicons SVG et PNG et les référencer dans les pages existantes.
- [x] Créer les écrans client login, signup, paiement, admin et retour de paiement (sans simulation de paiement réussi).
- [x] Ajouter les contrôles de session et le filigrane d’aperçu côté navigateur aux quatorze modèles.
- [x] Refuser le stockage local des utilisateurs, mots de passe admin et paiements.
- [x] Choisir la livraison après achat : PDF généré côté serveur, stocké en privé et remis par lien signé temporaire.
- [x] Créer les pages login, signup, payment et admin et leur appliquer la signature du site.
- [x] Créer `payment-success.html` comme écran informatif qui vérifie le droit côté serveur et ne valide pas un paiement depuis cette page.
- [x] Implémenter le squelette du flux Wave manuel : demandes en attente, API d’administration et migration SQL avec RLS (configuration et tests réels encore requis).
- [x] Lire les variables publiques Supabase via `/api/config` et prendre en charge les noms d’environnement Vercel `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [x] Ne pas afficher de lien de téléchargement après soumission ou approbation tant que la génération privée du PDF n’est pas implémentée.
- [x] Documenter les informations de configuration Supabase communiquées et les distinguer des éléments vérifiés dans le dépôt.

## À faire

- [ ] Valider le flux commercial complet avec les paramètres réels Supabase, Wave et Vercel avant tout lancement.
- [ ] Confirmer le nom réel et l’URL du projet Supabase (les notes donnent `rdsg-fitness` « à vérifier » et une URL générique).
- [ ] Vérifier dans Supabase si `public.users` existe, son usage et ses politiques ; conserver Supabase Auth (`auth.users`) comme source de vérité et ne pas stocker de `password_hash` applicatif.
- [ ] Récupérer et vérifier `package.json` et `vercel.json` : ils sont mentionnés dans les notes du 8 octobre mais absents du checkout examiné. Confirmer aussi si les configurations héritées Next.js/Tailwind/PostCSS/TypeScript sont présentes et réellement inutilisées.
- [ ] Obtenir et confirmer la documentation/API Wave Business, les méthodes de signature webhook, le pays, la devise et le sandbox.
- [ ] Configurer le projet Supabase, le mode de confirmation email et la procédure de provisionnement admin sans mot de passe codé en dur.
- [ ] Appliquer et tester `supabase/migrations/001_manual_wave_payments.sql` sur le projet Supabase.
- [ ] Configurer `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou la clé publishable) dans Vercel Preview/Production ; le lien Wave SAMA CV confirmé est intégré par défaut et peut être remplacé via `NEXT_PUBLIC_WAVE_PAYMENT_LINK`.
- [ ] Ajouter `SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_KEY`) aux variables serveur Vercel ; la clé n’a pas été fournie et ne doit pas être publiée.
- [ ] Implémenter les endpoints d’overview admin et de bannissement, avec vérifications serveur/RLS.
- [ ] Implémenter le checkout Wave côté serveur, la signature du webhook, son idempotence et les droits par modèle.
- [ ] Implémenter la génération serveur du PDF, son stockage privé et sa remise par lien signé temporaire après vérification du droit.
- [ ] Provisionner le rôle admin Supabase côté serveur ; aucun mot de passe maître n’est codé dans l’application.
- [x] Afficher le statut du paiement dans le filigrane et bloquer l’export navigateur des utilisateurs jusqu’à la disponibilité du PDF privé.
- [ ] Déployer en Preview Vercel et tester paiements réussis, refusés, dupliqués et retardés.
- [ ] Faire valider explicitement le passage en production et configurer les secrets dans Vercel.

## Bloqueurs / décisions requises

- Accès au compte/projet Supabase et choix des environnements Preview/Production.
- L’intégration Wave automatisée reste en attente de la documentation officielle Wave ; le lien manuel utilisé affiche le marchand « Scent & Style Store ».
- Aucune clé ou aucun secret Wave ne doit être envoyé dans le dépôt.
- La clé serveur Supabase n’a pas été ajoutée par choix de l’utilisateur ; les endpoints d’administration et de paiement resteront indisponibles jusqu’à sa configuration.
- Choix du fournisseur de stockage privé, de la durée du lien signé et du format des données de génération du PDF pendant l’implémentation.
- Procédure sécurisée de création du premier compte administrateur.
- La migration `001_manual_wave_payments.sql` et le schéma signalé de `public.users` n’ont pas été vérifiés dans le projet Supabase distant.
- Le brief du favicon mentionne un éclair mauve ; le SVG présent dans ce checkout montre un document bordé de mauve avec un coin plié et une étoile jaune. Confirmer si l’icône doit être ajustée.