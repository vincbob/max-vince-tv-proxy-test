const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'vidaa-compatibilite.html'),'utf8');
const js=fs.readFileSync(path.join(root,'vidaa-compatibilite.js'),'utf8');
test('Diagnostic local uniquement : aucune connexion ni API système',()=>{
 assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|Hisense_|HiUtils_|eval\s*\(/);
 assert.match(html,/vidaa-compatibilite\.js/);
 assert.match(html,/Aucune donnée n'est envoyée ni enregistrée/);
});
test('Compare le modèle et avertit sur les versions de firmware divergentes',()=>{
 const nodes=new Map();
 for(const id of ['model','firmware','compare','result']){
  nodes.set(id,{value:'',textContent:'',listeners:{},addEventListener(type,fn){this.listeners[type]=fn;}});
 }
 const document={getElementById:(id)=>nodes.get(id)};
 vm.runInNewContext(js,{document});
 nodes.get('model').value='55A60LEVS';
 nodes.get('firmware').value='09.60V.Q0612';
 nodes.get('compare').listeners.click();
 assert.match(nodes.get('result').textContent,/blocage/);
 nodes.get('firmware').value='09.60V.Q9999';
 nodes.get('compare').listeners.click();
 assert.match(nodes.get('result').textContent,/diffère/);
 nodes.get('model').value='MODELE-INCONNU';
 nodes.get('compare').listeners.click();
 assert.match(nodes.get('result').textContent,/aucune correspondance/);
});