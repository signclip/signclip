const C='signclip-v2',F=['./','index.html','storage.js','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
// Stale-while-revalidate: sofort aus dem Cache, im Hintergrund aktualisieren. Update = Dateien ersetzen.
// Nur eigene App-Dateien cachen. Cloud-Anfragen (WebDAV, Videos, index.json) gehen immer direkt ans Netz.
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.open(C).then(async c=>{const r=await c.match(e.request);const n=fetch(e.request).then(x=>{if(x.ok)c.put(e.request,x.clone());return x}).catch(()=>r);return r||n}))});