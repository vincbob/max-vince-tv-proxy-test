const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const script = fs.readFileSync(path.join(__dirname, '..', 'direct-check.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.match(html, /direct-check\.js/);
for (const id of ['directPortal', 'directTest', 'directClear', 'directResult', 'directLog']) {
  assert.match(html, new RegExp('id="' + id + '"'));
}

function setup(fetch) {
  const elements = new Map();
  for (const id of ['directPortal', 'directTest', 'directClear', 'directResult', 'directLog']) {
    elements.set(id, {
      value: '', textContent: '', className: '', disabled: false,
      listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; }
    });
  }
  vm.runInNewContext(script, {
    document: { getElementById: id => elements.get(id) },
    URL, AbortController, setTimeout, clearTimeout, fetch
  }, {filename: 'direct-check.js'});
  return {
    elements,
    portal: elements.get('directPortal'),
    result: elements.get('directResult'),
    log: elements.get('directLog'),
    run: elements.get('directTest').listeners.click
  };
}

test('Refuse HTTP non sécurisé et ne contacte aucun proxy', async () => {
  let count = 0;
  const t = setup(async () => { count++; });
  t.portal.value = 'http://example.invalid/stalker_portal/c/';
  await t.run();
  assert.equal(count, 0);
  assert.match(t.log.textContent, /PORTAIL_HTTP_BLOQUE_DEPUIS_PAGES_HTTPS/);
});

test('Rejette URL portant paramètres sensibles avant le réseau', async () => {
  let count = 0;
  const t = setup(async () => { count++; });
  t.portal.value = 'https://example.invalid/c/?token=secret';
  await t.run();
  assert.equal(count, 0);
  assert.doesNotMatch(t.log.textContent, /secret/);
});

test('Teste directement le portail sans credentials ni MAC', async () => {
  const calls = [];
  const t = setup(async (url, options) => {
    calls.push({url, options});
    return {status: 403, ok: false, text: async () => '{"js":{"error":"non autorisé"}}'};
  });
  t.portal.value = 'https://example.invalid/stalker_portal/c/';
  await t.run();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url,
    'https://example.invalid/stalker_portal/portal.php?type=stb&action=handshake&JsHttpRequest=1-xml&token=');
  assert.equal(calls[0].options.credentials, 'omit');
  assert.equal(calls[0].options.mode, 'cors');
  assert.ok(!('headers' in calls[0].options));
  assert.match(t.result.textContent, /HTTP 403/);
  assert.match(t.log.textContent, /réponse lisible/);
  assert.doesNotMatch(t.log.textContent, /non autorisé/);
});

test('Rapporte une panne CORS ou réseau sans accuser CORS seul', async () => {
  const t = setup(async () => { throw TypeError('Failed to fetch'); });
  t.portal.value = 'https://example.invalid/portal.php';
  await t.run();
  assert.match(t.log.textContent, /RESEAU_TLS_OU_CORS_NON_DISTINGUABLE/);
  assert.equal(t.elements.get('directTest').disabled, false);
});

test('Vide le champ du portail', () => {
  const t = setup(async () => { throw Error('ne doit pas être appelé'); });
  t.portal.value = 'https://example.invalid/portal.php';
  t.elements.get('directClear').listeners.click();
  assert.equal(t.portal.value, '');
  assert.equal(t.result.textContent, 'Non testé');
});