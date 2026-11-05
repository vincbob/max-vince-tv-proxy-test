/* MAX & VINCE TV / Test direct sans proxy, sans MAC et sans jeton.
   Cette vérification ne démontre pas une authentification MAG.
   Ne journaliser ni URL, ni corps de réponse, ni identifiants. */
(function () {
  'use strict';
  var byId = function (id) { return document.getElementById(id); };
  var busy = false;

  function endpoint(raw) {
    var u;
    try { u = new URL(String(raw || '').trim()); }
    catch (e) { throw Error('URL_INVALIDE'); }
    if (!/^https?:$/.test(u.protocol) || u.username || u.password || u.hash || u.search) {
      throw Error('URL_INVALIDE_OU_PARAMETRES_PRESENTS');
    }
    if (u.protocol !== 'https:') throw Error('PORTAIL_HTTP_BLOQUE_DEPUIS_PAGES_HTTPS');
    if (/\/c\/?$/i.test(u.pathname)) u.pathname = u.pathname.replace(/\/c\/?$/i, '/portal.php');
    else if (/\/$/.test(u.pathname)) u.pathname += 'portal.php';
    if (!/(?:\/portal\.php|\/server\/load\.php)$/i.test(u.pathname)) {
      throw Error('CHEMIN_PORTAIL_NON_RECONNU');
    }
    u.searchParams.set('type', 'stb');
    u.searchParams.set('action', 'handshake');
    u.searchParams.set('JsHttpRequest', '1-xml');
    u.searchParams.set('token', '');
    return u.href;
  }
  function state(msg, cls) {
    var output = byId('directResult');
    output.textContent = msg;
    output.className = cls || '';
  }
  function note(msg) { byId('directLog').textContent = msg; }
  async function check() {
    if (busy) return;
    busy = true;
    byId('directTest').disabled = true;
    state('Test en cours…', '');
    note('Aucune MAC, aucun jeton ni clé transmis. Requête directe vers le portail uniquement.');
    var timer, ctrl;
    try {
      var url = endpoint(byId('directPortal').value);
      ctrl = new AbortController();
      timer = setTimeout(function () { ctrl.abort(); }, 15000);
      var response;
      try {
        response = await fetch(url, {
          method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store',
          redirect: 'follow', referrerPolicy: 'no-referrer', signal: ctrl.signal
        });
      } catch (e) {
        throw Error(e && e.name === 'AbortError' ? 'DELAI_15_S_DEPASSE' : 'RESEAU_TLS_OU_CORS_NON_DISTINGUABLE');
      }
      var body = await response.text();
      var json = false;
      try { JSON.parse(body); json = true; } catch (e) {}
      state('HTTP ' + response.status + ' : réponse accessible sans proxy', response.ok ? 'ok' : '');
      note('CORS : réponse lisible depuis le navigateur. Corps JSON : ' + (json ? 'oui' : 'non') +
        '. Cela ne valide ni les cookies MAG, ni le handshake authentifié, ni la vidéo.');
    } catch (e) {
      var code = String(e && e.message || 'ERREUR');
      if (!/^[A-Z0-9_]{3,80}$/.test(code)) code = 'ERREUR_INCONNUE';
      state('Test direct : non validé', 'bad');
      note('Diagnostic : ' + code + '. Aucun identifiant transmis. En cas d erreur réseau/CORS, le navigateur ne peut pas isoler précisément la cause.');
    } finally {
      if (timer) clearTimeout(timer);
      busy = false;
      byId('directTest').disabled = false;
    }
  }
  byId('directTest').addEventListener('click', check);
  byId('directClear').addEventListener('click', function () {
    byId('directPortal').value = '';
    state('Non testé', '');
    note('Adresse supprimée du formulaire.');
  });
})();