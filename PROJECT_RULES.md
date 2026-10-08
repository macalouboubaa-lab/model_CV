# PROJECT_RULES.md — Règles du projet SAMA CV

## Règles de travail

1. Lire ce fichier avant toute modification.
2. Lire `ARCHITECTURE.md` avant d’ajouter une fonctionnalité.
3. Lire `CHANGELOG.md` pour connaître l’historique récent.
4. Lire `TASKS.md` pour connaître l’état du travail.
5. Ne supprimer aucun fichier sans confirmation explicite.
6. Ne pas modifier la structure des dossiers sans l’accord du propriétaire du projet.
7. Ne jamais exécuter de `git push` sans demande explicite.
8. Tester localement et communiquer les limites de validation avant de proposer un commit.
9. Documenter les changements dans `CHANGELOG.md`.
10. Mettre à jour `TASKS.md` à la fin de chaque tâche.
11. Ne jamais inscrire de mot de passe, clé privée, jeton ou secret de paiement dans le dépôt.
12. Ne jamais faire confiance à un rôle, un prix, une confirmation de paiement ou une autorisation fournis uniquement par le navigateur.

## Structure cible

```text
model_CV/
├── PROJECT_RULES.md
├── ARCHITECTURE.md
├── CHANGELOG.md
├── TASKS.md
├── README.md
├── index.html
├── login.html
├── signup.html
├── payment.html
├── admin.html
├── model1.html à model14.html
├── assets/
│   ├── logo-sama-cv.svg
│   ├── shared.css
│   ├── shared.js
│   ├── auth.js
│   └── protection.js
├── lib/
│   └── supabase-api.js
├── api/
│   ├── config.js
│   ├── payments.js
│   ├── entitlements.js
│   └── admin/
│       └── payments.js
├── supabase/
│   └── migrations/
│       └── 001_manual_wave_payments.sql
├── vercel.json
└── package.json
```

Cette structure est une cible de travail. Les dossiers et fichiers backend ne sont pas encore tous présents. Toute création doit rester limitée à la fonctionnalité autorisée et ne pas déplacer les modèles existants.

## Stack cible

- Frontend : HTML, CSS et JavaScript natifs, sans framework d’interface.
- Backend : fonctions serverless Vercel avec Node.js.
- Authentification et base de données : Supabase Auth et PostgreSQL, avec RLS activée.
- Paiement : Wave Business API, après validation de la documentation marchand et du mécanisme de webhook.
- Hébergement : Vercel.

## Comptes et autorisations

- Les comptes utilisateurs s’authentifient avec email et mot de passe. La politique de confirmation d’email doit être configurée explicitement dans Supabase.
- L’administrateur est un compte Supabase provisionné hors du code. Son rôle `admin` est attribué par un mécanisme de confiance et ne peut pas être choisi lors de l’inscription.
- Ne jamais coder un mot de passe administrateur dans le HTML, le JavaScript, la base de code ou la documentation. Créer ou réinitialiser ce compte via les outils d’administration et un canal de secrets approprié.
- Les utilisateurs non administrateurs n’obtiennent un droit de téléchargement qu’après confirmation serveur d’un paiement valide pour le modèle demandé.
- Les tarifs sont définis et vérifiés côté serveur. Le tarif demandé est de 2 000 FCFA par modèle, sous réserve de validation de la devise et des paramètres acceptés par Wave.

## Sécurité et limites du navigateur

- Les clés publiques Supabase peuvent être présentes côté client seulement avec des politiques RLS strictes. La clé `service_role`, les secrets Wave et les secrets Vercel restent exclusivement côté serveur.
- Une redirection de retour Wave ou un état JavaScript ne prouvent jamais un paiement. Seule une vérification serveur du webhook/transaction Wave, de son montant, de sa devise et de sa référence peut accorder un accès.
- Les pages HTML statiques et leur contenu sont publics s’ils sont servis directement par Vercel. Un écran de connexion ou `protection.js` ne peut pas rendre un fichier public privé.
- Un navigateur ne peut pas empêcher de façon fiable les captures d’écran, les photos d’écran ou l’inspection du contenu déjà livré. Les mesures anti-copie ne sont que dissuasives et ne doivent pas être présentées comme une protection garantie.
- Tout endpoint de webhook doit vérifier l’authenticité de l’événement, être idempotent et refuser les montants, devises, références ou états inattendus.
- Les données personnelles et informations de paiement doivent être minimisées. Ne jamais conserver les données de carte ou d’identifiants Wave qui ne sont pas nécessaires.

## Validation et publication

- Vérifier les flux d’inscription, connexion, autorisation, paiement refusé, paiement confirmé, paiement dupliqué et droits admin en local/staging.
- Ne pas prétendre qu’un paiement Wave ou un déploiement est opérationnel tant que les identifiants marchand, l’URL de webhook et les environnements Vercel/Supabase ne sont pas configurés et testés.
- Ne pas pousser, déployer en production ni utiliser des identifiants réels sans demande explicite.