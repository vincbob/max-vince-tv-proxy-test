# MAX & VINCE TV - Proxy MAG (expérimentation)

**État au 5 novembre 2026 : laboratoire publié sur GitHub, tests automatiques validés.**

Ce dépôt public est indépendant du dépôt historique privé `vincbob/max-tv-1-0`. Il contient **un laboratoire de connexion autonome** (pas encore l'intégralité de l'interface MAX TV 08.8).

### Ce qui est présent

- `index.html` : écran de diagnostic adapté au navigateur Hisense.
- `proxy-lab.js` : test CORS sans identifiants ; parcours Stalker complet avec consentement via proxy tiers compatible.
- `tests/proxy-lab.test.js` et workflow GitHub Actions : vérification de la syntaxe et du comportement sans secrets.
- [MODE_D_EMPLOI.md](MODE_D_EMPLOI.md) : procédure d'activation GitHub Pages et tests.

### Lancer le site

GitHub → Settings → Pages → Source **Deploy from a branch** → Branch **main**, dossier **/(root)** → **Save**.

L'URL de GitHub Pages à utiliser après activation est normalement : `https://vincbob.github.io/max-vince-tv-proxy-test/`.

### Ce qui n'est pas validé

- Connexion réelle au portail depuis la Hisense.
- Transmission du cookie MAC et des en-têtes MAG par un proxy public gratuit.
- Lecture LIVE avec image et son, PC éteint.

**Aucun secret ne doit être ajouté au dépôt public.** Un proxy public verra potentiellement MAC, jeton, et URL privée ; le service gratuit `cors.dev` est réservé au test public sans identifiants. Ne pas modifier la version 08.8 fonctionnelle.
