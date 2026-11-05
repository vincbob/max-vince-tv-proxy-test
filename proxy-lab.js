/* MAX & VINCE TV / Proxy LAB 01 - Echanges Stalker autorises
   Ce laboratoire n'est PAS la version 08.8. Aucun secret n'est publie dans les sources.
   Les URL proxy construites contiennent des secrets: ne jamais les journaliser.
*/
(function(){
'use strict';
var $=function(id){return document.getElementById(id);};
var state={token:'',mac:'',endpoint:'',channel:null,command:'',working:false};
function stage(i,msg,type){var x=$('s'+i);x.textContent=msg;x.className=type||'';}
function log(msg){var e=$('log');if(e.textContent==='Aucune connexion lancée.')e.textContent='';e.textContent+=(e.textContent?'\n':'')+msg;e.scrollTop=e.scrollHeight;}
function statusReset(){for(var i=0;i<6;i++)stage(i,'Non testé','');state.token='';state.channel=null;state.command='';$('watch').disabled=true;$('video').style.display='none';}
function portalEndpoint(raw){var u=new URL((raw||'').trim());if(!/^https?:$/.test(u.protocol)||u.username||u.password||u.hash)throw Error('PORTAIL_URL_INVALIDE');u.search='';if(/\/c\/?$/i.test(u.pathname))u.pathname=u.pathname.replace(/\/c\/?$/i,'/portal.php');else if(/\/$/.test(u.pathname))u.pathname+='portal.php';if(!/(?:\/portal\.php|\/server\/load\.php)$/i.test(u.pathname))throw Error('PORTAIL_CHEMIN_INVALIDE');return u.href;}
function validatedMac(raw){var mac=String(raw||'').trim().toUpperCase();if(!/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(mac))throw Error('MAC_AUTORISEE_INVALIDE');return mac;}
function proxyUrl(target, headers){var u=new URL($('provider').value==='io'?'https://corsproxy.io/':'https://api.corsproxy.dev/proxy');var key=$('key').value.trim();if(!key)throw Error('CLE_PROXY_MANQUANTE');u.searchParams.set('key',key);u.searchParams.set('url',target);Object.keys(headers||{}).forEach(function(k){u.searchParams.append('reqHeaders',k+':'+headers[k]);});return u.href;}
function magHeaders(){var p=new URL(state.endpoint);var h={'Accept':'application/json, text/javascript, */*','Cookie':'mac='+encodeURIComponent(state.mac)+'; stb_lang=fr; timezone=Europe%2FParis','User-Agent':'Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) MAG200 stbapp','X-User-Agent':'Model: MAG250; Link: Ethernet','Referer':p.origin+'/c/'};if(state.token)h.Authorization='Bearer '+state.token;return h;}
async function requestRaw(url){var ctrl=new AbortController();var timer=setTimeout(function(){ctrl.abort();},18000);try{var r=await fetch(url,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',signal:ctrl.signal});var t=await r.text();return {ok:r.ok,status:r.status,text:t,type:r.headers.get('content-type')||'non indiqué'};}catch(e){throw Error(e&&e.name==='AbortError'?'TIMEOUT_PROXY_18S':'RESEAU_CORS_TLS_OU_PROXY');}finally{clearTimeout(timer);}}
async function api(type,action,params){var u=new URL(state.endpoint);u.searchParams.set('type',type);u.searchParams.set('action',action);u.searchParams.set('JsHttpRequest','1-xml');if(action==='handshake')u.searchParams.set('token','');Object.keys(params||{}).forEach(function(k){u.searchParams.set(k,String(params[k]));});var x=await requestRaw(proxyUrl(u.href,magHeaders()));if(!x.ok)throw Error('HTTP_'+x.status);if(!x.text.trim())throw Error('HTTP_'+x.status+'_CORPS_VIDE');var d;try{d=JSON.parse(x.text);}catch(e){throw Error('REPONSE_NON_JSON_HTTP_'+x.status);}if(d&&d.js){if(d.js.error)throw Error('REPONSE_STALKER_ERREUR');return d.js;}if(d&&d.error)throw Error('REPONSE_STALKER_ERREUR');return d;}
function extractList(x){if(Array.isArray(x))return x;if(x&&Array.isArray(x.data))return x.data;if(x&&Array.isArray(x.results))return x.results;return [];}
function firstCommand(ch){return String(ch&&(ch.cmd||ch.stream_cmd||ch.url||ch.stream_url)||'').trim();}
function linkUrl(x){var raw=String(x&&(x.cmd||x.url||x.link||'')||'').trim();raw=raw.replace(/^(?:ffmpeg|auto)\s+/i,'');var m=raw.match(/https?:\/\/[^\s"'<>]+/i);return m?m[0]:'';}
async function proxyOnly(){if(state.working)return;state.working=true;$('proxyTest').disabled=true;statusReset();$('log').textContent='';try{var u=proxyUrl('https://jsonplaceholder.typicode.com/todos/1',{'Accept':'application/json'});var r=await requestRaw(u);if(!r.ok)throw Error('HTTP_'+r.status);if(!/json/i.test(r.type)&&!r.text.trim().startsWith('{'))throw Error('REPONSE_PUBLIQUE_NON_JSON');stage(0,'OK HTTP '+r.status,'ok');log('Proxy public : HTTP '+r.status+' ; corps '+r.text.length+' caractères.');}catch(e){stage(0,'Échec','bad');log('Proxy public : '+safeError(e));}finally{state.working=false;$('proxyTest').disabled=false;}}
function safeError(e){var msg=String(e&&e.message||'ERREUR_INCONNUE');return /^[A-Z0-9_]{3,100}$/.test(msg)?msg:'ERREUR_RESEAU';}
async function realTest(){if(state.working)return;state.working=true;$('fullTest').disabled=true;statusReset();$('log').textContent='';try{
if(!$('consent').checked)throw Error('CONSENTEMENT_PROXY_REQUIS');
state.endpoint=portalEndpoint($('portal').value);state.mac=validatedMac($('mac').value);
if(!$('key').value.trim())throw Error('CLE_PROXY_MANQUANTE');
stage(0,'Requête via proxy','');log('Envoi du handshake via proxy tiers (aucun secret affiché).');
var hs=await api('stb','handshake');var token=String(hs.token||hs.access_token||'');if(!token)throw Error('HANDSHAKE_SANS_JETON');state.token=token;stage(0,'Réponse reçue','ok');stage(1,'OK','ok');log('Handshake : jeton obtenu (masqué).');
var p=await api('stb','get_profile');stage(2,p&&typeof p==='object'?'OK':'Réponse inattendue',p&&typeof p==='object'?'ok':'bad');log('Profil : réponse Stalker reçue.');
var genres=await api('itv','get_genres');log('Catégories : '+extractList(genres).length+' entrées.');
var channels=await api('itv','get_ordered_list',{genre:'0',p:'1'});var data=extractList(channels);if(!data.length)throw Error('CATALOGUE_VIDE_OU_INCOMPATIBLE');stage(3,'OK : '+data.length+' chaînes','ok');log('Catalogue LIVE : '+data.length+' chaînes reçues sur la première page.');
state.channel=data.find(function(x){return !!firstCommand(x);})||null;
if(!state.channel)throw Error('AUCUNE_CHAINE_AVEC_COMMANDE');
var link=await api('itv','create_link',{cmd:firstCommand(state.channel),series:'',forced_storage:'undefined',disable_ad:'0'});var video=linkUrl(link);if(!video)throw Error('CREATE_LINK_SANS_URL_VIDEO');state.command=video;stage(4,'Lien obtenu','ok');$('watch').disabled=false;log('create_link : adresse vidéo obtenue (non affichée). Tu peux essayer la lecture.');
}catch(e){log('Arrêt à cette étape : '+safeError(e));for(var i=1;i<=4;i++){if($('s'+i).textContent==='Non testé'){stage(i,'Non exécuté','');break;}}}finally{state.working=false;$('fullTest').disabled=false;}}
function watch(){if(!state.command)return;var video=$('video');video.style.display='block';video.pause();video.src=state.command;video.load();stage(5,'Chargement','');log('Lecture directe sur VIDAA : initialisation du lecteur HTML5.');var played=false;video.onplaying=function(){played=true;stage(5,'Lecture démarrée','ok');log('Lecture : événement playing reçu. Vérifie image ET son à l’écran.');};video.onerror=function(){stage(5,'Erreur lecteur '+(video.error?video.error.code:'inconnue'),'bad');log('Lecture directe impossible : format vidéo, CORS ou contenu mixte HTTPS/HTTP possible.');};video.onloadeddata=function(){if(!played)log('Lecteur : premiers médias reçus.');};video.play().catch(function(){stage(5,'Lecture refusée','bad');log('Lecture refusée par le navigateur ou format non compatible.');});}
$('proxyTest').addEventListener('click',proxyOnly);$('fullTest').addEventListener('click',realTest);$('watch').addEventListener('click',watch);
$('clear').addEventListener('click',function(){['key','portal','mac'].forEach(function(id){$(id).value='';});$('consent').checked=false;statusReset();$('log').textContent='Informations effacées du formulaire.';});
})();
