// SignClip · WebDAV-Proxy für den Browser (Cloudflare Worker, kostenlos)
//
// Wozu: Eine Web-App darf WebDAV-Server (Sciebo, Nextcloud) nur ansprechen, wenn der
// Server die App-Adresse per CORS erlaubt. Sciebo/Nextcloud tun das meist nicht.
// Dieser Worker steht dazwischen und ergänzt die CORS-Antwort. Die App-Version mit
// Capacitor (native App) braucht ihn nicht.
//
// Einrichten:
//   1. dash.cloudflare.com › Workers › Create › diesen Code einfügen › Deploy
//   2. Settings › Variables:
//        ALLOW_HOSTS  = hochschule.sciebo.de,cloud.example.org   (nur diese Server)
//        ALLOW_ORIGIN = https://signclip.github.io                (Adresse der App)
//   3. In SignClip › Einstellungen › Speicherort › Erweitert: https://NAME.workers.dev/
//
// Sicherheit: Anmeldedaten laufen durch den Worker (nur im eigenen Cloudflare-Konto).
// Ohne ALLOW_HOSTS lehnt der Worker alles ab, er ist also kein offener Proxy.
// Grenze: Cloudflare nimmt pro Anfrage bis 100 MB (Free-Plan) an.
export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET,PUT,PROPFIND,MKCOL,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization,Depth,Content-Type,If-Match',
      'Access-Control-Expose-Headers': 'ETag,DAV',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (env.ALLOW_ORIGIN && req.headers.get('Origin') && req.headers.get('Origin') !== env.ALLOW_ORIGIN)
      return new Response('Origin nicht erlaubt', { status: 403, headers: cors });

    let target;
    try { target = new URL(new URL(req.url).searchParams.get('url')) } catch (e) { return new Response('Parameter url fehlt', { status: 400, headers: cors }) }
    const hosts = String(env.ALLOW_HOSTS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (target.protocol !== 'https:' || !hosts.some(h => target.hostname === h || target.hostname.endsWith('.' + h)))
      return new Response('Host nicht erlaubt', { status: 403, headers: cors });

    const h = new Headers();
    for (const k of ['authorization', 'depth', 'content-type', 'if-match']) if (req.headers.get(k)) h.set(k, req.headers.get(k));
    const r = await fetch(target, { method: req.method, headers: h, body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body, redirect: 'manual' });
    const out = new Headers(r.headers);
    for (const [k, v] of Object.entries(cors)) out.set(k, v);
    out.delete('set-cookie');
    return new Response(r.body, { status: r.status, headers: out });
  }
};
