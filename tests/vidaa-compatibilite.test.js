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
test('Hisense 58E77Q : reconnait V0000.09.60V.Q0612 sans promettre de compatibilité native',()=>{
 const nodes=new Map();
 for(const id of ['model','firmware','compare','result']){
  nodes.set(id,{value:'',textContent:'',listeners:{},addEventListener(type,fn){this.listeners[type]=fn;}});
 }
 vm.runInNewContext(js,{document:{getElementById:id=>nodes.get(id)}});
 nodes.get('model').value='58E77Q';
 nodes.get('firmware').value='V0000.09.60V.Q0612';
 nodes.get('compare').listeners.click();
 const output=nodes.get('result').textContent;
 assert.match(output,/VIDAA U9/);
 assert.match(output,/accès système bloqué/);
 assert.match(output,/version documentée/);
 assert.match(output,/Aucune installation native indépendante validée/);
 nodes.get('model').value='MODELE-INCONNU';
 nodes.get('compare').listeners.click();
 assert.match(nodes.get('result').textContent,/firmware 09\.60V\.Q0612 est documenté/);
 assert.match(nodes.get('result').textContent,/Même firmware ne signifie pas/);
});

test('Le 58E77Q est reconnu avec MT9603 probable, sans validation d’installation native',()=>{
 const nodes=new Map();
 for(const id of ['model','firmware','compare','result']){
  nodes.set(id,{value:'',textContent:'',listeners:{},addEventListener(type,fn){this.listeners[type]=fn;}});
 }
 vm.runInNewContext(js,{document:{getElementById:id=>nodes.get(id)}});
 nodes.get('model').value='58E77Q';
 nodes.get('firmware').value='V0000.09.60V.Q0612';
 nodes.get('compare').listeners.click();
 const value=nodes.get('result').textContent;
 assert.match(value,/MT9603 très probable/);
 assert.match(value,/55A60LEVS/);
 assert.match(value,/09\.60W\.Q0612/);
 assert.match(value,/Aucune méthode native validée/);
});
test('Le comparatif souligne explicitement la différence entre variantes V et W',()=>{
 assert.match(js,/n.est pas transposable au firmware 09\.60V\.Q0612/);
 assert.match(html,/n'a pas été lu directement/);
 assert.doesNotMatch(js,/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b/);
});
