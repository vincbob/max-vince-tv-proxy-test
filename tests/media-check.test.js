const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'media-check.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
for (const id of ['mediaTestVideo','mediaResult','mediaLog','testHlsVod','testHlsLive','stopHls']) {
  assert.match(html, new RegExp('id="' + id + '"'));
}
assert.match(html, /media-check\.js/);

function env(playResult) {
  const controls = new Map();
  for (const id of ['mediaTestVideo','mediaResult','mediaLog','testHlsVod','testHlsLive','stopHls']) {
    controls.set(id, {
      listeners:{}, textContent:'', className:'', style:{},
      addEventListener(name,fn){this.listeners[name]=fn;},
      trigger(name){if(this.listeners[name]) this.listeners[name]();},
      removeAttribute(name){if(name==='src')this.src='';},
      load(){this.loads=(this.loads||0)+1;},
      pause(){this.pauses=(this.pauses||0)+1;},
      play(){return playResult===false?Promise.reject(new Error('not allowed')):Promise.resolve();},
      canPlayType(){return 'maybe';}
    });
  }
  vm.runInNewContext(source,{document:{getElementById:id=>controls.get(id)},Number,console});
  return {video:controls.get('mediaTestVideo'),btn:id=>controls.get(id),result:controls.get('mediaResult'),log:controls.get('mediaLog')};
}
test('player only uses public HTTPS demo streams and not portal credentials',()=>{
  assert.match(source,/https:\/\/test-streams\.mux\.dev/);
  assert.match(source,/https:\/\/cph-p2p-msl\.akamaized\.net/);
  assert.doesNotMatch(source,/mac=|Bearer|token=|stalker_portal/i);
});
test('vod player starts on explicit button event; success needs human confirmation',()=>{
  const t=env();
  assert.equal(t.video.src,undefined);
  t.btn('testHlsVod').trigger('click');
  assert.match(t.video.src,/https:\/\/test-streams\.mux\.dev/);
  assert.equal(t.video.muted,false);
  t.video.trigger('playing');
  assert.match(t.result.textContent,/image et son à confirmer/);
});
test('live demo and stop correctly release media source',()=>{
  const t=env();
  t.btn('testHlsLive').trigger('click');
  assert.match(t.video.src,/\/hls\/live\//);
  t.video.error={code:4};
  t.video.trigger('error');
  assert.match(t.result.textContent,/code 4/);
  t.btn('stopHls').trigger('click');
  assert.equal(t.video.src,'');
  assert.equal(t.result.textContent,'Arrêté');
});
test('unhandled media play rejection is rendered without claiming success',async()=>{
  const t=env(false);
  t.btn('testHlsVod').trigger('click');
  await Promise.resolve();
  await Promise.resolve();
  assert.match(t.result.textContent,/Lecture non démarrée/);
});
