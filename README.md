# SAMA CV · 14 modèles de CV HTML

Une galerie de quatorze modèles de CV en HTML, CSS et JavaScript natifs. Les modèles 11 à 14 ajoutent une lettre de motivation sur une deuxième page A4. Aucun framework ni étape de compilation : ouvrez `index.html` dans un navigateur, puis choisissez un modèle.

## Utilisation

- Ouvrez `index.html` ou directement l'un des fichiers `model1.html` à `model14.html`.
- Cliquez sur les textes pour les remplacer. Cliquez sur le portrait pour choisir une image.
- Ajoutez ou supprimez des expériences, formations et compétences avec les boutons dans les sections ; les boutons de suppression apparaissent au survol des blocs.
- « Sauvegarder » écrit dans le stockage local du navigateur ; la sauvegarde automatique s'active aussi après une modification. « Charger » restaure la dernière version enregistrée.
- `Ctrl+S` (ou `Cmd+S` sur Mac) sauvegarde également. « Aperçu » masque la barre d'outils ; la touche Échap la réaffiche.
- « Exporter en PDF » ouvre la fenêtre d'impression du navigateur pour l’aperçu. Cela ne constitue pas une livraison privée après achat.
- « Réinitialiser » demande confirmation, efface la sauvegarde du modèle et recharge son contenu d'origine.
- Le lien Wave de la galerie ouvre un paiement externe fixe de 2 000 FCFA au marchand « Scent & Style Store ». Ce paiement n’est pas relié à un compte ni à un droit de téléchargement dans cette version.

Chaque modèle intègre son CSS et son JavaScript et peut être ouvert directement dans un navigateur. Le portrait initial est chargé depuis `assets/placeholder-photo.jpg` ; conservez ce fichier à côté des modèles ou remplacez la photo dans l'éditeur. La galerie utilise aussi ses propres ressources dans `assets/`.

Les données et les photos restent dans le navigateur courant, sur l'appareil courant. Pensez à exporter en PDF ou à conserver une copie du HTML modifié avant de changer de navigateur ou d'effacer ses données.

## Comptes et paiement (préparation)

Les pages d’inscription, de connexion et de paiement nécessitent des variables d’environnement Vercel :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_WAVE_PAYMENT_LINK` (optionnel) pour remplacer le lien par défaut de `pay.wave.com`
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_KEY` dans les fonctions serveur uniquement

Le lien Wave utilisé par le parcours SAMA CV affiche le marchand « Scent & Style Store » ; le propriétaire du projet a confirmé son utilisation. Le paiement est soumis à une validation manuelle par un administrateur. Ces fonctions ne sont pas actives tant que la migration SQL n’est pas appliquée et que les clés ne sont pas configurées. Une validation ne rend pas encore disponible le téléchargement privé du PDF ; les fichiers HTML des modèles restent publics.

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