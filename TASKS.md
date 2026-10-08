# TASKS — SAMA CV

État mis à jour : 2026-10-08.

## Terminé

- [x] Créer les documents de règles, architecture, historique et tâches.
- [x] Définir la frontière de confiance : rôle, paiement et droits validés côté serveur.
- [x] Identifier la dépendance opérationnelle à la configuration Supabase, Wave Business et Vercel.
- [x] Ajouter le lien Wave externe fourni dans la galerie avec son marchand et son montant explicités.

## À faire

- [ ] Valider le flux commercial complet et la manière de livrer un PDF acheté sans exposer les modèles statiques.
- [ ] Obtenir et confirmer la documentation/API Wave Business, les méthodes de signature webhook, le pays, la devise et le sandbox.
- [ ] Configurer le projet Supabase, le mode de confirmation email et la procédure de provisionnement admin sans mot de passe codé en dur.
- [ ] Concevoir les tables et politiques RLS, puis écrire et tester les migrations SQL.
- [ ] Implémenter l’authentification Supabase (inscription, connexion, déconnexion, récupération de session).
- [ ] Implémenter le checkout Wave côté serveur, le webhook idempotent et les droits par modèle.
- [ ] Construire l’interface admin avec contrôles d’autorisation serveur/RLS.
- [ ] Déployer en Preview Vercel et tester paiements réussis, refusés, dupliqués et retardés.
- [ ] Faire valider explicitement le passage en production et configurer les secrets dans Vercel.

## Bloqueurs / décisions requises

- Accès au compte/projet Supabase et choix des environnements Preview/Production.
- Identifiants et documentation Wave Business ; aucune clé ou aucun secret ne doit être envoyé dans le dépôt.
- Choix du mécanisme de remise du PDF après achat ; le HTML statique actuel est accessible directement et les captures d’écran ne peuvent pas être bloquées dans un navigateur.
- Procédure sécurisée de création du premier compte administrateur.