# Décision technique – Proxy Stalker/MAG HTTP sur VIDAA
Date : 5 novembre 2026
Dépôt expérimental : vincbob/max-vince-tv-proxy-test
Dépôt historique : vincbob/max-tv-1-0 (ne pas modifier)

## Preuves réellement établies sur télévision
- GitHub Pages et JavaScript fonctionnent dans le navigateur VIDAA.
- Proxy cors.dev sans identifiants : HTTP 200 sur API publique (PC et TV).
- Test direct portail HTTP depuis GitHub Pages HTTPS : bloqué avant l'appel (mixed content).
- Vidéo témoin : image et son sur TV.
- HLS TEST A MPEG-TS 360p : fonctionne sur TV.
- HLS TEST B fMP4 360p : fonctionne sur TV.
- LIVE public initial Akamai : erreur de format.
- LIVE France 24 C et D : aucune lecture sur TV, malgré réception de quelques octets vidéo dans GitHub Actions.
- Conclusion : HLS VOD sur TV validé ; aucun LIVE réel validé, aucun handshake Stalker réel sur VIDAA validé.

## État réel du code proxy-lab.js
- `proxyUrl()` encode des `reqHeaders` dans l'URL du proxy pour les modes `corsproxy.io` et `corsproxy.dev`.
- `magHeaders()` prépare `Cookie: mac=...`, `X-User-Agent`, `User-Agent`, `Referer` et `Authorization` si un jeton a été reçu.
- `api('stb','handshake')` interroge un `portal.php` ou `server/load.php`, lit une réponse JSON et récupère `js.token` si reçu.
- Le cookie `sn=` n'est pas géré actuellement.
- Aucun test complet n'a validé que le fournisseur transfère réellement `Cookie`, `User-Agent`, `X-User-Agent` ou `Set-Cookie`.
- Aucun moyen JavaScript côté navigateur de lire directement `Set-Cookie` : nom d'en-tête interdit par Fetch.
- Le mode `cors.dev` gratuit ne transmet pas les credentials/headers MAG et doit rester anonyme.
- **Important** : la MAC et les en-têtes transmis via `reqHeaders` dans une URL tierce risquent d'apparaître dans des journaux. Ne pas publier ou tester les accès privés auprès d'un proxy ouvert.

## Vérification des candidats (documentation du 5 novembre 2026)
| Option | Gratuit | Headers MAG | Cookies de réponse dans JS | Verdict |
|---|---|---|---|---|
| cors.dev anonyme | Oui, test GET | Non, headers sensibles réservés au managé | Non | Tests publics seulement |
| corsproxy.io Free | Oui (10 000 req/mo, 1 GiB/mo) | `reqHeaders` décrit, mais réécriture d'en-têtes annoncée dans Production | Non démontré | Ne satisfait pas toutes les contraintes gratuitement |
| corsproxy.dev Free | Oui (500 req/jour), avec clé | `reqHeaders` et règles managées documentées ; vérifier les contraintes Cookie | `Set-Cookie` retiré côté service managé | Pas de session Stalker complète telle quelle |
| kurrx/cors-proxy auto-hébergé | Code libre, hébergement distinct | `X-Proxy-Cookie`, `X-Proxy-User-Agent` prévus | Peut convertir cookies en en-têtes non interdits avec `rewriteCookies()` | Possible sous contrôle strict d'un serveur de confiance, à adapter |

Sources :
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
- https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_request_header
- https://cors.dev/docs
- https://corsproxy.io/docs/header-rewrites/
- https://corsproxy.io/pricing/
- https://corsproxy.dev/docs/
- https://corsproxy.dev/blog/cors-proxy-security
- https://github.com/kurrx/cors-proxy

## Alternative gratuite sans PC
- Deno Deploy possède une offre gratuite soumise à des quotas (https://deno.com/deploy/pricing). Un service de petite API, contrôlé par l'utilisateur, pourrait servir de passerelle de **handshake et catalogue uniquement** avec authentification et contrôle strict des destinations.
- Vercel Hobby est gratuit sous limites et avec fonctions à durée limitée (https://vercel.com/docs/plans/hobby). Pas une garantie pour du streaming TV continu.
- `kurrx/cors-proxy` est un programme Node ; il ne se déploie pas tel quel sur Deno Deploy sans adaptation.
- Tout proxy public doit contrôler les destinations autorisées, les origines, les méthodes et les limites de requêtes, interdire IP privées/redirects vers réseau interne, et éviter de rendre publiquement accessibles jetons ou cookies.
- **Aucun service externe ne doit être déployé sans une décision explicite de l'utilisateur.** Pas de retour Render / Cloudflare, aucun abonnement payant, préserver l'ancienne application et sa VOD/séries.
- Une passerelle distante gratuite reste un serveur distant, avec quotas et dépendance réseau. GitHub Pages seul n'implémente pas de proxy serveur.

## Suite technique recommandée
1. Ne plus utiliser les sources LIVE C/D comme preuve de compatibilité VIDAA ; les conserver comme échecs reproductibles.
2. Étudier une **passerelle dédiée et de confiance**, non ouverte, traitant les cookies côté serveur ; valider les en-têtes sur un serveur de test sous contrôle avant le portail réel.
3. Séparer le chemin de **contrôle Stalker** (handshake/profil/catalogue/create_link) de la lecture LIVE. Ne pas transmettre des secrets à un proxy inconnu.
4. N'envisager l'hébergement gratuit qu'après preuve technique et examen des quotas ; préserver Windows et les anciennes versions en parallèle.
