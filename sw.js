const C='signclip-v1',F=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
// Stale-while-revalidate: sofort aus dem Cache, im Hintergrund aktualisieren. Update = Dateien ersetzen.
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.open(C).then(async c=>{const r=await c.match(e.request);const n=fetch(e.request).then(x=>{if(x.ok)c.put(e.request,x.clone());return x}).catch(()=>r);return r||n}))});