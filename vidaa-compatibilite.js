/* MAX & VINCE TV - comparaison documentaire locale.
   Aucune requête réseau ni accès à des API système ; aucune installation. */
(function(){
'use strict';
var $=function(id){return document.getElementById(id);};
var published=[
 {matches:['58E77Q'],fw:'09.60V.Q0612',note:'VIDAA U9 confirmé. Processeur MT9603 très probable selon la fiche officielle Hisense E7Q de 58 pouces (variante E77Q non contrôlée directement sur la carte mère). Rapport communautaire 55A60LEVS : même famille MT9603 et même firmware 09.60V.Q0612, mais accès système bloqué. Rapport 43E7DS : MT9603 également, mais firmware différent 09.60W.Q0612 et résultat différent. Aucune méthode native validée pour ton 58E77Q.'},
 {matches:['50A51HUV'],fw:'09.01O.P0813',note:'Un accès système est signalé sur ce modèle, avec ce firmware, dans les recherches publiques. Aucune compatibilité avec une autre version n’est démontrée.'},
 {matches:['100U7Q','100U70QEVS'],fw:'09.60I.Q0813',note:'Un accès système est signalé sur une variante de ce modèle. Les résultats et les modalités sont propres à ce firmware.'},
 {matches:['55A60LEVS'],fw:'09.60V.Q0612',note:'Une tentative rapportée sur ce modèle et ce firmware a rencontré un blocage. Il ne faut pas en déduire une compatibilité.'},
 {matches:['43E7DS','43Q60SEVS_02'],fw:'09.60W.Q0612',note:'Des essais communautaires indiquent un accès système sur cette variante MT9603 en firmware 09.60W.Q0612. Ce succès n’est pas transposable au firmware 09.60V.Q0612 du 58E77Q.'}
];
function normal(s){return String(s||'').trim().toUpperCase().replace(/[\s\-]/g,'');}
function normalizeFirmware(s){return normal(s).replace(/^V[0-9]{4}\./,'');}
function compare(model,firmware){
 var m=normal(model),f=normalizeFirmware(firmware);
 if(!m)return 'Renseigne le modèle exact indiqué dans les informations de ta TV.';
 var e=published.find(function(v){return v.matches.some(function(x){return normal(x)===m;});});
 if(!e){
  if(f==='09.60V.Q0612')return 'Modèle '+m+' : aucun rapport précis pour ce modèle, mais le firmware 09.60V.Q0612 est documenté sur plusieurs autres Hisense VIDAA 9. Sur un 55A60LEVS, une tentative d’écriture a été bloquée. Même firmware ne signifie pas même processeur ni possibilité d’exécuter du code natif.';
  return 'Modèle '+m+' : aucune correspondance dans les quelques observations intégrées. Cela ne signifie ni compatible ni incompatible. Il faut vérifier le firmware exact.';
 }
 var fw=normalizeFirmware(e.fw);
 var relation=f?'Version relevée : '+f+'. '+(fw===f?'Elle correspond à la version documentée.':'Elle diffère de la version documentée ('+e.fw+').'):'Version logicielle non renseignée. La comparaison reste partielle.';
 return 'Modèle '+m+' : '+e.note+' '+relation+' Aucun droit système ni exécution native ne sont confirmés sur ton téléviseur.';
}
$('compare').addEventListener('click',function(){
 $('result').textContent=compare($('model').value,$('firmware').value);
});
})();