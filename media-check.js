/* MAX & VINCE TV - diagnostic indépendant du lecteur HLS sur VIDAA.
   Sources: échantillons de démonstration publics ; aucune donnée IPTV privée. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var sources = {
    vod: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    live: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8'
  };
  var v = $('mediaTestVideo'), active = '', started = false, hasFrames = false;
  function status(message, css) {
    $('mediaResult').textContent = message;
    $('mediaResult').className = css || '';
  }
  function note(message) { $('mediaLog').textContent = message; }
  function capabilities() {
    if (typeof v.canPlayType !== 'function') return 'API de compatibilité indisponible';
    var p = v.canPlayType('application/vnd.apple.mpegurl') ||
      v.canPlayType('application/x-mpegURL');
    return p ? 'HLS natif annoncé : ' + p : 'HLS natif non annoncé (essai quand même)';
  }
  function stop(resetMessage) {
    active = '';
    started = false;
    hasFrames = false;
    try { v.pause(); } catch (e) {}
    v.removeAttribute('src');
    try { v.load(); } catch (e) {}
    if (resetMessage) {
      status('Arrêté', '');
      note('Lecture arrêtée. Le lecteur a été libéré.');
    }
  }
  function start(kind) {
    stop(false);
    active = kind;
    v.style.display = 'block';
    v.controls = true;
    v.muted = false;
    try { v.volume = 1; } catch (e) {}
    status('Chargement du flux public...', '');
    note((kind === 'live' ? 'Flux LIVE de démonstration' : 'Vidéo de démonstration') +
      '. ' + capabilities() + '. Vérifie toi-même image et son : les événements HTML5 ne peuvent pas les confirmer seuls.');
    v.src = sources[kind];
    try {
      v.load();
      var result = v.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (active !== kind) return;
          status('Lecture non démarrée', 'bad');
          note('Lecture refusée ou format incompatible. Appuie sur ▶ dans le lecteur puis observe le résultat.');
        });
      }
    } catch (e) {
      status('Erreur au démarrage', 'bad');
      note('Le navigateur ne peut pas démarrer ce lecteur.');
    }
  }
  v.addEventListener('loadedmetadata', function () {
    if (!active) return;
    status('Métadonnées vidéo reçues', '');
    note('Dimensions annoncées : ' + (v.videoWidth || 'inconnues') + ' × ' +
      (v.videoHeight || 'inconnues') + '. Attente de la lecture.');
  });
  v.addEventListener('loadeddata', function () {
    if (!active) return;
    hasFrames = true;
    status('Premières données média reçues', '');
    note('Une première image peut être disponible. Vérifie son affichage réel.');
  });
  v.addEventListener('playing', function () {
    if (!active) return;
    started = true;
    status('Lecture démarrée : image et son à confirmer', 'ok');
    note('Signal HTML5 playing reçu. Test ' + (active === 'live' ? 'LIVE public' : 'vidéo publique') +
      '. Vérifie visuellement la vidéo et écoute le son. ' +
      (hasFrames ? 'Premières données vidéo aussi reçues.' : 'Première image non encore signalée.'));
  });
  v.addEventListener('error', function () {
    if (!active) return;
    var code = v.error && Number.isInteger(v.error.code) ? v.error.code : 'inconnu';
    status('Échec du lecteur (code ' + code + ')', 'bad');
    note('Lecture impossible : format, réseau, compatibilité HLS ou source publique indisponible. Cela ne teste pas ton portail.');
  });
  v.addEventListener('waiting', function () {
    if (active && started) status('Mise en mémoire tampon', '');
  });
  v.addEventListener('ended', function () {
    if (active) {
      status('Vidéo terminée', '');
      note('La source de démonstration s’est terminée normalement.');
    }
  });
  $('testHlsVod').addEventListener('click', function () { start('vod'); });
  $('testHlsLive').addEventListener('click', function () { start('live'); });
  $('stopHls').addEventListener('click', function () { stop(true); });
})();