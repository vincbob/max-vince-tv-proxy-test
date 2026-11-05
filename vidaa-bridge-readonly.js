/* MAX & VINCE TV — prédiagnostic NON intrusif des signatures VIDAA.
  Aucune API native n'est appelée, aucun accès réseau, aucune donnée stockée.
  La présence d'une fonction ne démontre jamais le droit de s'en servir. */
(function () {
  'use strict';
  function el(id){return document.getElementById(id);}
  function statusOf(name){
    try {
      var desc=Object.getOwnPropertyDescriptor(window,name);
      if(desc) return Object.prototype.hasOwnProperty.call(desc,'value')?
        (typeof desc.value==='function'?'présent (fonction)':'présent (objet/valeur)') :
        'présent (accesseur, non appelé)';
      return name in window?'hérité (non appelé)':'absent';
    } catch(err){return 'non déterminable';}
  }
  function numberOfReadOnlyGetters(){
    try {
      var names=Object.getOwnPropertyNames(window);
      return names.filter(function(k){return /^Hisense_Get[A-Za-z0-9_]*$/.test(k);}).length;
    } catch(err){return 'non déterminable';}
  }
  function browserVersion(){
    try{
      var ua=String(navigator.userAgent||'');
      var m=ua.match(/(?:Chromium|Chrome)\/(\d+)/);
      return m?'Chromium famille '+m[1]:'version non identifiée';
    }catch(err){return 'version non déterminable';}
  }
  function run(){
    var labels=[
      ['Pont de lecture HiUtils_createRequest','HiUtils_createRequest'],
      ['Bibliothèque système vowOS','vowOS'],
      ['Contexte natif vowOSContext','vowOSContext'],
      ['Pont de messages omi_platform','omi_platform'],
      ['Ancienne installation Hisense_installApp','Hisense_installApp'],
      ['Ancienne API fichiers Hisense_FileRead','Hisense_FileRead'],
      ['Ancienne API fichiers Hisense_FileWrite','Hisense_FileWrite']
    ];
    var lines=['Empreinte de capacités locales (aucune fonction appelée)',
      'Navigateur : '+browserVersion(),
      'Fonctions Hisense_Get* visibles : '+numberOfReadOnlyGetters()];
    labels.forEach(function(item){lines.push(item[0]+' : '+statusOf(item[1]));});
    lines.push('INTERPRÉTATION : visible ne signifie pas autorisé. Ce test ne vérifie pas les permissions et ne peut pas installer de programme.');
    el('bridgeResult').textContent=lines.join('\n');
  }
  el('bridgeInspect').addEventListener('click',run);
})();