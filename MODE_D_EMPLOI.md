# MAX & VINCE TV : essai sur la Hisense (sans PC)

Le dépôt contient pour l'instant **un laboratoire fonctionnel de connexion**, et non la version complète MAX TV 08.8. Il a été publié pour vérifier le transport réseau réel directement sur VIDAA.

## Mettre le site en ligne

Dans le dépôt GitHub public : **Settings → Pages → Build and deployment → Source = Deploy from a branch → Branch = main / (root) → Save**.

Lorsque GitHub indique que le site est publié, l'adresse devrait être :
`https://vincbob.github.io/max-vince-tv-proxy-test/`

## Premier essai sans secrets

1. Ouvrir l'adresse sur le PC puis sur le navigateur Hisense.
2. Laisser **cors.dev gratuit (test public sans clé)**.
3. Cliquer sur **Tester le proxy sans clé ni identifiants**.
4. Noter si le statut « Proxy / CORS » devient `OK HTTP 200`.

Ce premier essai n'accède **pas** au portail IPTV.

## Essai d'authentification MAG (facultatif)

Les modes `corsproxy.io` et `corsproxy.dev` nécessitent une **clé API** du fournisseur. Renseigner ensuite le portail et une MAC virtuelle **autorisée**, puis cocher la case de consentement et lancer le parcours réel.

⚠️ **Le proxy est exploité par un tiers**. Les données présentes dans l'URL du proxy peuvent être enregistrées ou exposées dans les journaux de trafic. N'utiliser que des identifiants dont la transmission à ce fournisseur est acceptable. Ne jamais publier de MAC, URL privée de portail, mot de passe, jeton ou clé dans GitHub.

Le service gratuit peut bloquer ou supprimer l'en-tête Cookie et la vidéo. Un HTTP 200 ne garantit pas l'authentification ni l'image et le son.

## Limites connues

- GitHub Pages ne fournit pas de passerelle Stalker ; il héberge uniquement des fichiers statiques.
- Le LAB vérifie handshake, profil, première page du catalogue, `create_link` et lecture HTML5 si les étapes précédentes réussissent.
- La version historique **08.8 Windows** n'est pas modifiée.
- Les tests automatisés ne sont pas une validation sur le téléviseur.

## Nouveau test direct VIDAA (sans proxy et sans MAC)

Le PC et la Hisense ont déjà obtenu HTTP 200 avec le proxy public sur une API de démonstration. Ce test est différent : il tente une requête **directe au portail HTTPS autorisé**, sans cookie, sans MAC, sans jeton et sans clé.

1. Ouvrir le laboratoire GitHub Pages et descendre à la rubrique **3. Test direct depuis VIDAA, sans proxy**.
2. Saisir personnellement l'adresse HTTPS du portail autorisé (elle n'est ni enregistrée dans le dépôt, ni affichée dans le journal).
3. Cliquer **Tester l'accès direct, sans MAC**.
4. Lire le statut et le code diagnostic. Une réponse HTTP 200/403/404 indique une réponse lisible dans le navigateur, mais **pas une authentification MAG réussie**. Un échec réseau/CORS/TLS est impossible à attribuer à une seule cause avec les seules API du navigateur.
5. Ne pas photographier les champs renseignés. Utiliser le bouton **Effacer l'adresse**.

Depuis une page GitHub Pages HTTPS, un portail HTTP est bloqué par les règles de contenu mixte du navigateur : le test le signale sans envoyer la requête. Aucun serveur payant n'est créé et l'application historique n'est pas modifiée.
