# Journal de conception — SAMA CV

Ce journal rassemble les décisions et informations de configuration communiquées pour le projet. Une mention issue des notes du propriétaire ne signifie pas qu’elle a été vérifiée dans l’instance distante ou dans le dépôt. Voir `ARCHITECTURE.md` pour l’architecture actuelle et `TASKS.md` pour les vérifications restantes.

## 7 octobre 2026 — Documentation de référence

Les documents de référence annoncés sont `PROJECT_RULES.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `TASKS.md`, `ATS_GUIDELINES.md`, `README.md` et le présent journal. Le dépôt examiné contient les six premiers documents cités à l’exception du journal, créé lors de cette mise à jour.

## Identité visuelle — date non précisée

- Fichiers annoncés : `favicon.svg` et `favicon.png`, ce dernier en 512 × 512.
- Le brief fourni décrit un document bleu nuit avec un éclair mauve.
- Dans le checkout examiné, le SVG représente un document sombre au contour mauve, avec un coin plié jaune et une étoile jaune. Vérifier si cette différence avec le brief est intentionnelle.

## 8 octobre 2026 — Configuration Vercel rapportée

Les notes indiquent la création de `package.json` (scripts dev/start/deploy) et `vercel.json`, et signalent les configurations héritées Next.js, Tailwind, PostCSS et TypeScript comme inutilisées pour le site statique. `package.json` et `vercel.json` ne sont pas présents dans le checkout examiné ; cette configuration doit être retrouvée et vérifiée avant un déploiement. Les autres fichiers de configuration hérités n’ont pas été confirmés dans ce journal.

## 8 octobre 2026 — Projet Supabase rapporté

- Nom indiqué : `rdsg-fitness`, à vérifier.
- Région indiquée : Europe de l’Ouest.
- Base de données indiquée : PostgreSQL.
- URL fournie : `https://[ton-projet].supabase.co`, qui est un placeholder et non l’URL réelle.
- Extension indiquée comme activée : `pgcrypto`, avec `CREATE EXTENSION IF NOT EXISTS pgcrypto;`.

Ces informations n’attestent ni la liaison du projet Supabase avec le dépôt ni l’application de ses migrations.

## 8 octobre 2026 — Table `users` rapportée

Le schéma communiqué comporte les colonnes suivantes :

| Colonne | Type | Contraintes communiquées |
| --- | --- | --- |
| `id` | `uuid` | clé primaire, défaut `gen_random_uuid()` |
| `email` | `text` | unique, non nul |
| `password_hash` | `text` | non nul |
| `created_at` | `timestamp` | défaut `NOW()` |
| `last_login` | `timestamp` | nullable |
| `is_admin` | `bool` | défaut `false` |
| `is_banned` | `bool` | défaut `false` |

Ce schéma est une information rapportée, pas une migration versionnée ou vérifiée dans ce dépôt. L’application utilise Supabase Auth et référence `auth.users` dans sa migration de paiements. Ne pas conserver les mots de passe ou leurs hachages dans une table applicative parallèle ; vérifier l’usage et les politiques de `public.users` avant de décider de son évolution. Le rôle administrateur doit rester attribué par un mécanisme de confiance côté serveur.

## État de vérification

- Présents dans le checkout : `favicon.svg`, `favicon.png`, les documents de référence listés dans le dépôt et `supabase/migrations/001_manual_wave_payments.sql`.
- À confirmer dans le dépôt ou les consoles de service : `package.json`, `vercel.json`, l’URL et le nom du projet Supabase, l’existence et les politiques de `public.users`, l’activation distante de `pgcrypto` et l’application de la migration de paiements.
- La migration suivie dans le dépôt crée `payments` et `entitlements` avec RLS ; elle ne crée pas `public.users`.
