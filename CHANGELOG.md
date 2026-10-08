# CHANGELOG — SAMA CV

Les changements notables du projet sont consignés ici, du plus récent au plus ancien.

## 2026-10-08 — Paiement Wave avec validation manuelle (préparation)

- Ajout du chargement runtime des variables publiques Supabase configurées dans Vercel.
- Ajout des endpoints de soumission de demandes Wave, de vérification des droits et de validation/refus par un admin authentifié.
- Ajout d’une migration SQL avec RLS, identifiant de transaction unique et attribution transactionnelle du droit après approbation.
- Le lien Wave confirmé est intégré par défaut ; `NEXT_PUBLIC_WAVE_PAYMENT_LINK` permet de le remplacer et seules les URL HTTPS de `pay.wave.com` sont acceptées.
- Les fonctions serveur nécessitent une clé privilégiée Supabase non fournie ; la migration n’a pas été appliquée et aucun paiement réel n’a été vérifié.
- Le succès n’affiche plus de faux lien de téléchargement : la livraison PDF privée reste à implémenter.
- Le propriétaire a confirmé que le lien existant du marchand « Scent & Style Store » est celui à utiliser pour le parcours SAMA CV.
- Les comptes payés voient leur état confirmé, mais l’export navigateur reste bloqué tant que la remise du PDF privé n’est pas disponible.

## 2026-10-08 — Décision de livraison des PDF

- Décision retenue : PDF généré côté serveur, conservé dans un stockage privé et remis avec un lien signé temporaire après vérification du droit d’accès.
- Le fournisseur de stockage, la durée du lien et le format des données restent à définir ; aucune livraison privée n’est encore implémentée.
- Mise à jour de `TASKS.md` pour distinguer les pages déjà créées des intégrations serveur restantes.

## 2026-10-08 — Paiement Wave en attente de documentation

- Le propriétaire dispose d’un compte Wave Business et d’un lien de paiement fonctionnel, mais pas de documentation API/webhook.
- L’intégration automatisée reste en attente de la documentation officielle ; le lien seul ne permet pas de vérifier un achat côté serveur.
- Aucune méthode de paiement ou de signature webhook n’est inventée.

## 2026-10-08 — Écrans Auth et paiement (préparation)

- Création de `assets/auth.js` pour les sessions Supabase Auth et les appels d’entitlements/vérification serveur ; aucun mot de passe admin ou paiement n’est stocké dans le navigateur.
- Création de `assets/protection.js` pour les avertissements, le filigrane d’aperçu et le remplacement de l’export quand l’accès n’est pas confirmé.
- Création des pages `login.html`, `signup.html`, `payment.html`, `admin.html` et `payment-success.html`.
- Ajout des vérifications de session aux quatorze modèles.
- Les fonctions de paiement, d’entitlement et d’administration restent inopérantes tant que leurs endpoints serveur, Supabase, RLS et Wave ne sont pas configurés. Les fichiers HTML statiques restent accessibles par URL directe.

## 2026-10-08 — Signature du site et favicon

- Ajout de la signature « Créé par Boubacar Cissé » avec lien téléphonique sur l’index et les quatorze modèles existants.
- Exclusion de la signature des impressions de CV.
- Création des favicons SVG et PNG 512×512, référencés dans les quinze pages existantes.
- Les pages login, signup, payment et admin n’existent pas encore. Aucun filigrane conditionnel ou écran de succès n’est activé avant la mise en place d’une vérification de droits côté serveur.

## 2026-10-08 — Lien Wave externe

- Ajout dans la galerie du lien de paiement Wave fourni pour Scent & Style Store, montant fixe de 2 000 FCFA.
- Précisé dans l’interface et le README que ce lien externe ne valide pas un achat SAMA CV ni ne débloque de téléchargement.

## 2026-10-08 — Référentiel application commerciale

- Ajout des règles de travail, de l’architecture cible, du journal et du suivi des tâches.
- Documenté le flux Supabase Auth → paiement Wave vérifié côté serveur → droit par modèle.
- Documentées les limites des protections côté navigateur et les décisions Wave encore à confirmer.
- Aucun backend, compte marchand ou déploiement n’est déclaré opérationnel par cette documentation.

## État antérieur

- Galerie SAMA CV avec quatorze modèles HTML/CSS/JavaScript, logo et modèles 11–14 incluant une lettre de motivation.
- Coordonnées de démonstration sénégalaises dans les modèles.