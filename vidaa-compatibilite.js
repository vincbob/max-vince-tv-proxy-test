/* MAX & VINCE TV - comparaison documentaire locale.
   Aucune requête réseau ni accès à des API système ; aucune installation. */
(function(){
'use strict';
var $=function(id){return document.getElementById(id);};
var published=[
 {matches:['50A51HUV'],fw:'09.01O.P0813',note:'Un accès système est signalé sur ce modèle, avec ce firmware, dans les recherches publiques. Aucune compatibilité avec une autre version n’est démontrée.'},
 {matches:['100U7Q','100U70QEVS'],fw:'09.60I.Q0813',note:'Un accès système est signalé sur une variante de ce modèle. Les résultats et les modalités sont propres à ce firmware.'},
 {matches:['55A60LEVS'],fw:'09.60V.Q0612',note:'Une tentative rapportée sur ce modèle et ce firmware a rencontré un blocage. Il ne faut pas en déduire une compatibilité.'},
 {matches:['43E7DS','43Q60SEVS_02'],fw:'09.60W.Q0612',note:'Une installation de lanceur web a été rapportée. L’exécution de code natif n’a pas été démontrée.'}
];
function normal(s){return String(s||'').trim().toUpperCase().replace(/[\s\-]/g,'');}
function compare(model,firmware){
 var m=normal(model),f=normal(firmware);
 if(!m)return 'Renseigne le modèle exact indiqué dans les informations de ta TV.';
 var e=published.find(function(v){return v.matches.some(function(x){return normal(x)===m;});});
 if(!e)return 'Modèle '+m+' : aucune correspondance dans les quelques observations intégrées. Cela ne signifie ni compatible ni incompatible. Il faut vérifier le firmware exact.';
 var fw=normal(e.fw);
 var relation=f?'Version relevée : '+f+'. '+(fw===f?'Elle correspond à la version documentée.':'Elle diffère de la version documentée ('+e.fw+').'):'Version logicielle non renseignée. La comparaison reste partielle.';
 return 'Modèle '+m+' : '+e.note+' '+relation+' Aucun droit système ni exécution native ne sont confirmés sur ton téléviseur.';
}
$('compare').addEventListener('click',function(){
 $('result').textContent=compare($('model').value,$('firmware').value);
});
})();