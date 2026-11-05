/* MAX & VINCE TV - diagnostic indépendant du lecteur HLS sur VIDAA.
   Sources: échantillons de démonstration publics ; aucune donnée IPTV privée. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var sources = {
    vod: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    ts360: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/v3/prog_index.m3u8',
    mp4360: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/v3/prog_index.m3u8',
    live: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    france24: 'https://live.france24.com/hls/live/2037179/F24_FR_HI_HLS/master_500.m3u8',
    france24backup: 'https://live.france24.com/hls/live/2037179-b/F24_FR_HI_HLS/master_500.m3u8'
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
    var description = {vod: 'Témoin HLS déjà validé', ts360: 'HLS MPEG-TS 360p - AVC / AAC-LC', mp4360: 'HLS fMP4 360p - AVC / AAC-LC', live: 'Ancien LIVE public 1080p - source suspecte (playlist secondaire HTTP 404)',
      france24: 'France 24 français : vrai LIVE HLS, débit 500 kb/s, segment confirmé par GitHub Actions',
      france24backup: 'France 24 français secours : vrai LIVE HLS, débit 500 kb/s, segment confirmé par GitHub Actions'}[kind];
    note(description + '. ' + capabilities() + '. Les tests 360p sont des vidéos à la demande, PAS du LIVE. Vérifie image et son.');
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
    note('Signal HTML5 playing reçu. Test ' + (['france24','france24backup','live'].indexOf(active) >= 0 ? 'LIVE public' : 'vidéo publique') +
      '. Vérifie visuellement la vidéo et écoute le son. ' +
      (hasFrames ? 'Premières données vidéo aussi reçues.' : 'Première image non encore signalée.'));
  });
  v.addEventListener('error', function () {
    if (!active) return;
    var code = v.error && Number.isInteger(v.error.code) ? v.error.code : 'inconnu';
    status('Échec du lecteur (code ' + code + ')', 'bad');
    note(code === 4 ?
      'Code 4 : la source ou son format ne sont pas acceptés par le lecteur. Cela peut aussi signifier une variante HLS inaccessible (HTTP 404 vérifié sur le LIVE initial). Ce message ne prouve pas une panne du décodeur.' :
      'Lecture impossible : réseau, format, ou source indisponible. Cela ne teste pas ton portail.');
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
  $('testHlsTs').addEventListener('click', function () { start('ts360'); });
  $('testHlsFmp4').addEventListener('click', function () { start('mp4360'); });
  $('testLiveFrance24').addEventListener('click', function () { start('france24'); });
  $('testLiveFrance24Backup').addEventListener('click', function () { start('france24backup'); });
  $('testHlsLive').addEventListener('click', function () { start('live'); });
  $('stopHls').addEventListener('click', function () { stop(true); });
})();