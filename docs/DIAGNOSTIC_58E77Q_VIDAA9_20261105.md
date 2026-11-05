# MAX & VINCE TV — Diagnostic ciblé Hisense 58E77Q / VIDAA U9
Date de vérification : 5 novembre 2026
Statut : recherche documentaire et diagnostics NON intrusifs, aucune modification firmware

## Identification issue de l'écran TV
- Modèle exact : Hisense **58E77Q**
- Firmware affiché : **V0000.09.60V.Q0612** ; préfixe normalisé : **09.60V.Q0612**
- OS : **VIDAA U9**
- Browser : interface web VIDAA (version Chromium/Odin exacte non confirmée sur ce modèle)

## Matériel : élément nouveau et limites
- La fiche **officielle Hisense E7Q** indique un **MediaTek MT9603 Quad Core** pour la variante **58E7Q** de 58 pouces et pour le reste de la série documentée.
- Le modèle du propriétaire est **58E77Q**. Il s'agit d'une déclinaison commerciale de la famille E7Q, mais aucune lecture de carte mère ni fiche détaillée avec MT9603 propre au code modèle exact 58E77Q n'a été obtenue.
- Conclusion honnête : MT9603 **très probable** pour le 58E77Q ; identification exacte à confirmer sans modification système.

Référence constructeur :
https://www.hisense.es/wp-content/uploads/2024/03/Ficha-Tecnica_E7Q_ES.pdf
Fiche française 58E77Q (processeur « Quad Core », sans référence SoC) :
https://hisense.hgecdn.net/medias/productSheet-000000000020016729-bs-hisense-fr-fr.pdf

## Recherche communautaire : comparaison par firmware
Référence documentaire : https://github.com/carteakey/alvidaa
Inventaire du projet : https://github.com/carteakey/alvidaa/blob/main/docs/research/inventory.json

| Modèle documenté | SoC | VIDAA / firmware | État déclaré par les auteurs |
| --- | --- | --- | --- |
| **58E77Q (notre TV)** | MT9603 **probable, non lu directement** | 9 / **09.60V.Q0612** | **Aucun rapport de méthode native validée** |
| 55A60LEVS | MT9603 | 9 / 09.60V.Q0612 | Une tentative d'accès système a été bloquée |
| 43A60LEVS | MT9603 | 9 / 09.60V.Q0612 | Non testé jusqu'à l'exécution native |
| 43E7DS / 43Q60SEVS_02 | MT9603 | U09.60 / **09.60W.Q0612** | D'autres résultats d'accès système ont été rapportés pour cette **version différente** |
| 50A51HUV | MTK9602 | 09.01 / 09.01O.P0813 | Accès déclaré sur un autre processeur et autre firmware |

**Ne pas extrapoler** les résultats d'un autre firmware à ce modèle. Le caractère V/W dans la version est une différence importante, ainsi que l'identité réelle des composants et les politiques de permissions.

## Résultats de notre laboratoire utilisateur, réellement démontrés
- Installation de raccourcis web Sidee sur le téléviseur : réussie.
- Le site GitHub Pages fonctionne sur le navigateur VIDAA.
- Proxy CORS anonyme vers API de démonstration : réponse HTTP 200 sur PC et TV ; pas une connexion Stalker/MAG.
- Connexion directe au portail HTTP depuis GitHub Pages HTTPS : bloquée par la politique de contenu mixte.
- Vidéo témoin et échantillons HLS **MPEG-TS 360p (A)** et **fMP4 360p (B)** : fonctionnent sur TV.
- Vidéos LIVE publiques (C et D) : aucun démarrage sur TV.
- **Aucun programme natif n'a été installé ni exécuté sur la 58E77Q.**

## Conclusion opérationnelle et contrôle compatible
1. Ne pas modifier les protections ou le firmware en se fondant sur un succès rapporté avec un autre modèle.
2. La voie **web installée via Sidee** est validée et reste indépendante du magasin d'applications pour l'interface ; elle n'autorise pas par elle-même l'exécution native ni le contournement CORS.
3. Identifier si une méthode d'exécution native **documentée, autorisée et compatible exactement avec ce modèle et firmware** existe avant toute installation ; aucune n'a été confirmée à ce jour.
4. Conserver l'application MAX TV existante et le dépôt historique ; ce rapport est isolé dans le laboratoire public.

Ce rapport est un état des preuves, pas un guide de déverrouillage.

## Nouvel élément indépendant (5 novembre 2026) : un autre téléviseur avec EXACTEMENT le même firmware
Projet source : https://github.com/ipanalytics/Hisense-Vidaa-Reverse-Engineering

Un **65Q60SEVS_01** européen a été analysé avec **MTK9603**, version **V0000.09.60V.Q0612**, région EU_A et navigateur Chromium 111.
C'est un rapprochement bien plus solide que celui d'un autre modèle sous 09.60W.

Les auteurs ont documenté :
- Une surface JavaScript exposant environ 96 fonctions, principalement des getters d'informations et de contrôle d'interface.
- Dans le navigateur de cet appareil, les anciennes fonctions `Hisense_installApp` et `Hisense_FileRead` ne sont pas exposées.
- Un service natif local avec des fonctions de gestion ; certaines opérations de modification sont **refusées par le contrôle de permissions appconfig**.
- Un firmware de mise à jour **signé et chiffré** ; aucune installation native indépendante n'a été réalisée sur cet appareil dans cette étude.
- Leurs constats sont valables sur **65Q60SEVS_01**, et ne prouvent pas que le **58E77Q** expose le même ensemble exact de fonctions.

Documentation primaire :
https://github.com/ipanalytics/Hisense-Vidaa-Reverse-Engineering/blob/main/docs/05-bridge-surface.md
https://github.com/ipanalytics/Hisense-Vidaa-Reverse-Engineering/blob/main/docs/08-function-map.md
https://github.com/ipanalytics/Hisense-Vidaa-Reverse-Engineering/blob/main/docs/06-negative-results.md

### Mesure disponible dans notre laboratoire
La page `vidaa-compatibilite.html` dispose maintenant d'un bouton **« Analyser les fonctions visibles (lecture seule) »**.
Il ne fait qu'examiner la présence de noms JavaScript (`HiUtils_createRequest`, `vowOS`, `Hisense_installApp`, etc.) et le numéro majeur Chromium ; il n'appelle aucune fonction privilégiée et n'envoie aucune donnée.
Son résultat peut distinguer les surfaces JS visibles sur notre 58E77Q de celles rapportées pour le 65Q60SEVS_01.

**État : aucun accès natif, installation, permission ou déverrouillage encore validé sur notre TV.**
