const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const script = fs.readFileSync(path.join(__dirname, '..', 'proxy-lab.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.match(html, /proxy-lab\.js/);
assert.match(html, /MAX &amp; VINCE/);
assert.doesNotMatch(script, /(?:[0-9a-f]{2}:){5}[0-9a-f]{2}/i, 'no literal MAC address in published JS');
const elements = new Map();
for (const id of ['s0','s1','s2','s3','s4','s5','proxyTest','fullTest','watch','clear','provider','key','portal','mac','consent','log','video']) {
  elements.set(id, { textContent:'', className:'', disabled:false, value:'', checked:false, style:{}, listeners:{}, addEventListener(name,fn){this.listeners[name]=fn;}, pause(){}, load(){}, play(){return Promise.resolve();} });
}
elements.get('provider').value='public';
elements.get('log').textContent='Aucune connexion lancée.';
let calls=[];
const doc={getElementById(id){assert.ok(elements.has(id), id);return elements.get(id);}};
const ctx={document:doc,URL,AbortController,setTimeout,clearTimeout,console,
 fetch: async (url)=> {calls.push(url);return {ok:true,status:200,text:async()=>'{"userId":1}',headers:{get:()=> 'application/json'}};}};
vm.runInNewContext(script, ctx, {filename:'proxy-lab.js'});
assert.ok(elements.get('proxyTest').listeners.click);
(async()=>{
 await elements.get('proxyTest').listeners.click();
 assert.equal(calls.length,1);
 assert.equal(calls[0],'https://proxy.cors.dev/https://jsonplaceholder.typicode.com/todos/1');
 assert.match(elements.get('s0').textContent,/OK HTTP 200/);
 elements.get('consent').checked=true;
 await elements.get('fullTest').listeners.click();
 assert.equal(calls.length,1,'anonymous public proxy must never send a MAG request');
 assert.match(elements.get('log').textContent,/PROXY_PUBLIC_NE_PERMET_PAS_MAG/);
 console.log('OK: test public anonyme et protection du mode MAG');
})().catch(e=>{console.error(e);process.exitCode=1;});
