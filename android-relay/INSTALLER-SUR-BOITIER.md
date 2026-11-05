# MAX TV RELAIS ANDROID 01 — essai sur boîtier Bouygues HMB4213H

## Statut
Prototype Android TV de **diagnostic réseau local**, pas encore un relais IPTV. N'envoie aucune MAC, aucun jeton et aucune URL de portail. La version RG4 Windows n'est pas modifiée.

## Matériel
Boîtier Bouygues HMB4213H, PC Windows, clé USB, télévision Hisense. Boîtier et Hisense doivent être sur **le même réseau Wi-Fi/Ethernet** (réseau invité à éviter). L'application du boîtier restera démarrée pendant l'essai.

## Récupérer l'APK
1. Ouvrir le dépôt **vincbob/max-vince-tv-proxy-test** sur GitHub.
2. Ouvrir **Actions → Build MAX TV RELAIS ANDROID 01 APK**.
3. Sélectionner la dernière exécution **réussie**, télécharger l'artefact **MAX-TV-RELAIS-ANDROID-01-APK**.
4. Sur ton PC, extraire le ZIP : il contient **app-debug.apk**.
5. Copier **app-debug.apk** sur la clé USB.

## Installer sur le boîtier
1. Brancher la clé USB au boîtier Bouygues.
2. Utiliser un gestionnaire de fichiers Android du boîtier pour ouvrir **app-debug.apk**. Certaines versions Bouygues bloquent les applications externes : si l'installation est refusée, noter le message précis, sans forcer le système.
3. Ouvrir l'application **MAX TV RELAIS 01** avec la télécommande du boîtier.
4. Cliquer **1. DÉMARRER LE RELAIS LOCAL**.
5. Lire l'état **SERVEUR ACTIF : port 8784** et l'URL affichée, par exemple `http://192.168.1.25:8784/`. C'est un **exemple** ; utiliser l'adresse réellement affichée.

## Tester avec la Hisense
1. Sur **le navigateur Internet de la Hisense**, saisir l'adresse complète du boîtier, en **HTTP** (pas HTTPS).
2. Si tout fonctionne, la page indique **MAX TV RELAIS ANDROID 01 — CONNEXION LOCALE RÉUSSIE**.
3. Vérification complémentaire : ouvrir la même adresse suivie de `health`, par exemple `http://192.168.1.25:8784/health`. Le JSON doit contenir `"status":"ok"` et `"iptv_enabled":false`.
4. Tu peux quitter l'écran de l'application sur le boîtier : le relais doit rester actif tant que le système ne met pas le boîtier en veille profonde. Vérifier.
5. Pour arrêter, revenir à l'application du boîtier et choisir **ARRÊTER LE RELAIS**.

## Si le test échoue
- **APK refusé** : relever le message exact. Il peut y avoir des restrictions du firmware Bouygues.
- **Serveur non actif** : appuyer sur DÉMARRER, vérifier un éventuel conflit sur le port 8784.
- **Pas d'adresse IP** : contrôler le Wi-Fi ou Ethernet du boîtier.
- **Hisense ne charge pas la page** : vérifier le réseau commun et désactiver l'isolation client si elle existe sur la box Internet.
- **Le relais disparaît après quelques minutes** : vérifier la gestion de veille Android du HMB4213H.

## Sécurité et limites
Service de diagnostic limité au réseau local et aux méthodes GET/HEAD, aucune donnée IPTV. Ne jamais rediriger le port 8784 sur Internet, et ne pas installer l'APK sur une box inconnue. Pour le futur relais Stalker/MAG, ajout indispensable d'un mécanisme d'appairage, de gestion sécurisée des identifiants et d'une validation vidéo.

**Une page de diagnostic réussie ne valide pas encore la lecture LIVE image + son.** C'est seulement la première étape pour vérifier la faisabilité matérielle.
