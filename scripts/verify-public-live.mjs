// Validation ponctuelle des flux HLS LIVE publics ; aucune donnée privée.
const SOURCES = [
  { name: 'France 24 FR 500', url: 'https://live.france24.com/hls/live/2037179/F24_FR_HI_HLS/master_500.m3u8' },
  { name: 'France 24 FR 500 backup', url: 'https://live.france24.com/hls/live/2037179-b/F24_FR_HI_HLS/master_500.m3u8' },
  { name: 'NASA TV low', url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master_500.m3u8' },
  { name: 'TV78 FR', url: 'https://streamtv.cdn.dvmr.fr/TV78/ngrp:tv78.stream_all/master.m3u8' },
  { name: 'KTO FR', url: 'https://live-kto.akamaized.net/hls/live/2033284/KTO/master.m3u8' },
  { name: 'Akamai initial', url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8' }
];

function isUrl(u) {
  const parsed = new URL(u);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw Error('URL HTTPS requis');
  return parsed;
}
async function requestManifest(url) {
  isUrl(url);
  const r = await fetch(url, { redirect: 'follow', headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw Error('manifest HTTP ' + r.status);
  const t = await r.text();
  if (t.length > 150000 || !t.trimStart().startsWith('#EXTM3U')) throw Error('manifest non HLS');
  return t;
}
function child(master) {
  const lines = master.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if (!lines.some(x=>x.startsWith('#EXT-X-STREAM-INF'))) return null;
  const variants=[];
  for(let i=0;i<lines.length-1;i++) {
    if(!lines[i].startsWith('#EXT-X-STREAM-INF')) continue;
    const m = lines[i].match(/BANDWIDTH=(\d+)/);
    if(!lines[i+1].startsWith('#')) variants.push({url:lines[i+1], bw:m?Number(m[1]):Infinity});
  }
  variants.sort((a,b)=>a.bw-b.bw);
  return variants[0]?.url || null;
}
function lastSegment(list) {
  const lines=list.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const candidates=lines.filter(s=>!s.startsWith('#'));
  if (!candidates.length || !list.includes('#EXTINF')) throw Error('pas de segments LIVE');
  return candidates[candidates.length-1];
}
async function checkSegment(url) {
  isUrl(url);
  const resp=await fetch(url,{
    redirect:'follow', headers:{Range:'bytes=0-2047','Cache-Control':'no-cache'}, signal:AbortSignal.timeout(12000)
  });
  if (!resp.ok) {
    try { await resp.body?.cancel(); } catch {}
    throw Error('segment HTTP ' + resp.status);
  }
  const type=resp.headers.get('content-type') || '';
  if (/text\/html|application\/json/i.test(type)) {
    try { await resp.body?.cancel(); } catch {}
    throw Error('segment MIME anormal');
  }
  if (!resp.body) throw Error('segment vide');
  const reader=resp.body.getReader();
  let chunk;
  try { chunk=await reader.read(); } finally { try { await reader.cancel(); } catch {} }
  if (chunk.done || !chunk.value?.length) throw Error('segment 0 octet');
  return {http: resp.status, bytes: chunk.value.length, type};
}
async function check(s) {
  try {
    const master=await requestManifest(s.url);
    const sub=child(master);
    const media=sub?await requestManifest(new URL(sub,s.url).href):master;
    if (!/#EXT-X-MEDIA-SEQUENCE:\d+/.test(media) || /#EXT-X-ENDLIST/.test(media))
      throw Error('pas une playlist LIVE courante');
    const seg=lastSegment(media);
    const r=await checkSegment(new URL(seg,sub?new URL(sub,s.url):s.url).href);
    console.log('OK '+s.name+' : playlist LIVE, segment HTTP '+r.http+' / '+r.bytes+' premiers octets ('+r.type+')');
    return {name:s.name,success:true};
  } catch(e) {
    console.log('ÉCHEC '+s.name+' : '+String(e?.message||e).replace(/https?:\/\/\S+/g,'[URL masquée]').slice(0,120));
    return {name:s.name,success:false};
  }
}
const r=await Promise.all(SOURCES.map(check));
const ok=r.filter(s=>s.success);
console.log('RÉSUMÉ : '+ok.length+'/'+SOURCES.length+' sources LIVE avec manifeste, playlist média et fragment accessibles depuis GitHub Actions.');
console.log('Un succès ne prouve pas la compatibilité VIDAA ni le décodage image et son.');
// Ne pas faire échouer toute la CI si des CDN publics sont indisponibles.
