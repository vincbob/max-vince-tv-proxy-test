const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'vidaa-bridge-readonly.js'),'utf8');
const html=fs.readFileSync(path.join(root,'vidaa-compatibilite.html'),'utf8');

function fakeWindow(signatures){
 const names=Object.assign({Hisense_GetModelName:()=>'',Hisense_GetSoftwareVersion:()=>''},signatures||{});
 return names;
}
function run(window){
 const controls={bridgeInspect:{addEventListener(t,cb){this[t]=cb;}},bridgeResult:{textContent:''}};
 vm.runInNewContext(source,{window,document:{getElementById:id=>controls[id]},navigator:{userAgent:'TV Chrome/111.0.0'}});
 controls.bridgeInspect.click();
 return controls.bridgeResult.textContent;
}
test('Aucune requête, aucune API système appelée, aucun stockage',()=>{
 assert.doesNotMatch(source,/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\blocalStorage\b|\bsessionStorage\b|\beval\s*\(/);
 assert.doesNotMatch(source,/\bHiUtils_createRequest\s*\(|\bHisense_installApp\s*\(|\bHisense_FileRead\s*\(/);
 assert.match(html,/id="bridgeInspect"/);
 assert.match(html,/id="bridgeResult"/);
 assert.match(html,/vidaa-bridge-readonly\.js/);
});
test('Détecte les signatures natives sans les appeler',()=>{
 let invoked=0;
 const w=fakeWindow({HiUtils_createRequest:()=>{invoked++;},vowOS:{},omi_platform:{}});
 const text=run(w);
 assert.match(text,/HiUtils_createRequest : présent \(fonction\)/);
 assert.match(text,/vowOS : présent \(objet\/valeur\)/);
 assert.match(text,/Hisense_installApp : absent/);
 assert.match(text,/Chromium famille 111/);
 assert.match(text,/Fonctions Hisense_Get\* visibles : 2/);
 assert.match(text,/visible ne signifie pas autorisé/);
 assert.equal(invoked,0);
});
test('Ne déclenche jamais un getter piégé',()=>{
 let called=0;
 const w=fakeWindow({});
 Object.defineProperty(w,'Hisense_installApp',{get(){called++; throw Error('getter executed');}});
 const result=run(w);
 assert.match(result,/présent \(accesseur, non appelé\)/);
 assert.equal(called,0);
});
