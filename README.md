# SAMA CV · 14 modèles de CV HTML

Une galerie de quatorze modèles de CV en HTML, CSS et JavaScript natifs. Les modèles 11 à 14 ajoutent une lettre de motivation sur une deuxième page A4. Aucun framework ni étape de compilation : ouvrez `index.html` dans un navigateur, puis choisissez un modèle.

## Utilisation

- Ouvrez `index.html` ou directement un fichier `modelN.html` déployé.
- Cliquez sur les textes pour les remplacer. Cliquez sur le portrait pour choisir une image.
- Ajoutez ou supprimez des expériences, formations et compétences avec les boutons dans les sections ; les boutons de suppression apparaissent au survol des blocs.
- « Sauvegarder » écrit dans le stockage local du navigateur ; la sauvegarde automatique s'active aussi après une modification. « Charger » restaure la dernière version enregistrée.
- `Ctrl+S` (ou `Cmd+S` sur Mac) sauvegarde également. « Aperçu » masque la barre d'outils ; la touche Échap la réaffiche.
- L’aperçu des modèles est libre. Connectez-vous ou créez un compte pour modifier un CV ; le paiement Wave n’est demandé qu’au clic sur « Télécharger mon CV en PDF ». Le PDF est généré côté serveur après validation manuelle du paiement et vérification du droit.
- « Réinitialiser » demande confirmation, efface la sauvegarde du modèle et recharge son contenu d'origine.
- Le paiement Wave de 2 000 FCFA est proposé depuis le parcours de téléchargement et doit être validé manuellement par l’administration avant de débloquer le PDF.

Chaque modèle intègre son CSS et son JavaScript. Les photos portant la classe `.profile-photo` sont affichées au format carré 96 × 96 px et restent floutées avant validation du paiement (4 px, renforcé sur mobile et à l’impression). En déploiement Vercel, toutes les URLs correspondant à `modelN.html` (N de 1 à 9999) servent l’aperçu public ; l’édition est réservée aux sessions connectées et le téléchargement PDF est protégé par le contrôle de droit côté serveur. Ajouter un fichier `model15.html`, `model16.html`, etc. à la racine et le déployer l’ajoute au catalogue, aux liens d’administration, à l’aperçu et à la génération PDF sans ajouter de route par modèle. Les nouveaux modèles doivent fournir un élément `#cvContainer` et un balisage d’édition compatible ; le serveur ajoute les scripts partagés et les styles de portrait s’ils manquent, tandis que le script de protection ajoute les commandes d’édition et de téléchargement. Les droits des nouveaux modèles requièrent également l’application de la migration `002_dynamic_model_ids.sql` sur les bases ayant déjà reçu la migration 001. Les fichiers peuvent être ouverts directement dans un navigateur en développement local. Le portrait initial est chargé depuis `assets/placeholder-photo.jpg` ; conservez ce fichier à côté des modèles ou remplacez la photo dans l’éditeur. La galerie utilise aussi ses propres ressources dans `assets/`.

Les données et les photos restent dans le navigateur courant, sur l'appareil courant. La sauvegarde signale les erreurs de quota ; réduisez la taille de la photo si le stockage local est plein. Pensez à télécharger le PDF ou à conserver une copie du HTML modifié avant de changer de navigateur ou d'effacer ses données.

## Comptes et paiement (préparation)

Les pages d’inscription, de connexion et de paiement nécessitent des variables d’environnement Vercel :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_WAVE_PAYMENT_LINK` (optionnel) pour remplacer le lien par défaut de `pay.wave.com`
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_KEY` dans les fonctions serveur uniquement

La génération PDF côté serveur nécessite les dépendances de `package.json` et les fonctions Vercel configurées dans `vercel.json`. Le contenu édité du CV (4 Mio maximum) est transmis par le navigateur ; le serveur le nettoie et l’intègre au modèle de confiance avant de générer le PDF. Si le CV dépasse cette taille, réduisez notamment la taille de la photo. La session navigateur est synchronisée vers un cookie `HttpOnly`, `Secure`, `SameSite=Lax` pour permettre les navigations protégées.

Le lien Wave utilisé par le parcours SAMA CV affiche le marchand « Scent & Style Store » ; le propriétaire du projet a confirmé son utilisation. Le paiement reste soumis à une validation manuelle par un administrateur. Ces fonctions ne sont actives que si la migration SQL est appliquée et les variables configurées.

L’application utilise Supabase Auth pour les identités. Les informations de configuration ou de schéma mentionnées dans les notes du projet ne sont pas nécessairement appliquées à l’instance utilisée par ce dépôt ; vérifier notamment le projet, son URL et l’application des migrations avant tout déploiement.

## Documentation du projet

- [Règles du projet](./PROJECT_RULES.md)
- [Architecture et configuration](./ARCHITECTURE.md)
- [Suivi des tâches](./TASKS.md)
- [Historique des changements](./CHANGELOG.md)
- [Guide ATS](./ATS_GUIDELINES.md)
- [Journal de conception](./JOURNAL_CONCEPTION.md)

## Modèles

| Fichier | Style |
| --- | --- |
| `model1.html` | Classique sobre, noir et blanc |
| `model2.html` | Moderne, sidebar colorée |
| `model3.html` | Créatif, expériences en timeline |
| `model4.html` | Minimaliste typographique |
| `model5.html` | Deux colonnes, portrait à gauche |
| `model6.html` | Élégant, bandeau coloré |
| `model7.html` | Tech, typographie monospace |
| `model8.html` | Corporate, en-tête professionnel |
| `model9.html` | Infographique, repères visuels |
| `model10.html` | Artistique et créatif |
| `model11.html` | Classique avec lettre sobre |
| `model12.html` | Moderne mauve avec lettre assortie |
| `model13.html` | Élégant avec monogramme en filigrane |
| `model14.html` | Minimaliste typographique |