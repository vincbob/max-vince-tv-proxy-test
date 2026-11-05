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

## Test 04 : lecture vidéo réelle avec image et son sur VIDAA

Ce test **ne dépend pas de ton portail**, n'envoie aucun identifiant et utilise uniquement des flux HLS de démonstration HTTPS.

1. Ouvrir le navigateur Internet de la Hisense, puis le laboratoire GitHub Pages. Actualiser la page.
2. Descendre à **4. Test image et son depuis la Hisense : flux publics**.
3. Cliquer **Essayer la vidéo témoin (image + son)**, et constater physiquement si une vidéo s'affiche et si du son est audible.
4. Cliquer ensuite **Essayer un LIVE public** : il s'agit d'un flux de démonstration non lié à Stalker. Vérifier image, son et stabilité.
5. Utiliser **Arrêter la lecture** pour libérer le lecteur. Prendre une photo du statut et du lecteur, sans aucune adresse ni identifiant privés.

Attention : le statut « Lecture démarrée » représente l'événement `playing` du lecteur HTML5. Il **ne certifie pas à lui seul l'image et le son** ; seule la vérification devant la télévision confirme ces deux points. Les sources HLS publiques peuvent changer ou tomber en panne.

Les tests automatiques du dépôt simulent le navigateur et valident l'instrumentation, mais **ne sont pas des tests de décodage réel sur la télévision**. La lecture d'un flux public ne lève ni le problème HTTP/HTTPS du portail ni les restrictions CORS. Le dépôt MAX TV 08.8 existant demeure intact.

## 5 novembre : comparaison HLS ciblée après le premier test TV

Observation réelle rapportée : sur la Hisense, la vidéo témoin Mux a produit **image + son**. Le LIVE public Akamai a déclenché une erreur de format ; un contrôle externe a obtenu un manifeste maître valide, mais sa variante vidéo indiquée renvoyait HTTP 404. Ce symptôme n'établit pas une incompatibilité générale des LIVE avec VIDAA.

Dans la rubrique 4 actualisée :

1. **TEST A : HLS MPEG-TS 360p** : échantillon officiel Apple, H.264/AAC-LC avec segments TS ; vérifier image et son.
2. **TEST B : HLS fMP4 360p** : échantillon officiel Apple, H.264/AAC-LC avec segments fMP4 ; vérifier image et son.
3. **Ancien LIVE (comparaison uniquement)** : conservé à titre diagnostic, potentiellement indisponible et non nécessaire pour la suite.

Les tests A et B sont des VOD de référence : leur réussite ne valide pas un LIVE. Ils peuvent en revanche discriminer une incompatibilité liée au conteneur TS vs fMP4. Ne saisir aucun portail ni MAC dans ces tests.

## Résultat confirmé sur téléviseur Hisense (5 novembre 2026)

L'utilisateur a testé sur VIDAA :

- **Témoin HLS VOD** : image et son confirmés.
- **TEST A MPEG-TS 360p** : fonctionne sur la télévision.
- **TEST B fMP4 360p** : fonctionne sur la télévision.
- **Ancien LIVE Akamai** : erreur de format sur la télévision ; la playlist enfant avait renvoyé HTTP 404 lors du diagnostic externe.

**Conclusion limitée :** le téléviseur accepte effectivement les deux conteneurs HLS testés avec vidéo et audio. Les tests A et B étant des VOD, ils ne démontrent pas encore la lecture d'une chaîne LIVE. Ils ne résolvent pas l'accès MAG au portail HTTP depuis un site HTTPS.

### Contrôle technique supplémentaire

Le script `scripts/verify-public-live.mjs` vérifie séparément des sources LIVE publiquement diffusées sur GitHub Actions (manifeste HLS, playlist média, segment reçu), **sans MAC, sans proxy ni données privées**. Une source vérifiée ainsi doit ensuite être validée devant la télévision, image et son. Les flux externes peuvent changer de disponibilité.

## Test C/D : vrai direct France 24 (sans compte, sans serveur local)

La CI GitHub du 5 novembre 2026 a tenté six sources publiques. Deux ont répondu avec une playlist de type LIVE (sans `#EXT-X-ENDLIST`) et avec les premiers octets d'un fragment MPEG-TS HTTP 206 : **France 24 français 500 kb/s, principal et secours**. Quatre autres sources n'ont pas passé les contrôles réseau au même instant.

1. Actualiser le laboratoire public depuis le **navigateur de la Hisense**.
2. Rubrique 4, bouton **TEST C : VRAI LIVE France 24 (500 kb/s)** ; constater l'image et le son sur TV.
3. Si le C échoue, essayer **TEST D : LIVE France 24 (secours)** et noter le code erreur affiché.
4. Arrêter le lecteur après le test.

La vérification réseau sur GitHub ne prouve pas une lecture sur VIDAA ; les flux peuvent aussi changer entre les essais. La validation image/son doit être faite devant la TV. Ces flux publics ne se substituent pas à l'authentification du portail Stalker/MAG qui demeure un problème d'architecture distinct.
