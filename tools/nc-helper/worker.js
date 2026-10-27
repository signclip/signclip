// Sign – Verwaltungshelfer (Cloudflare Worker)
//
// Wozu: Der Browser darf die Verwaltungs-Schnittstelle der Nextcloud (Konten anlegen, App-Passwörter,
// Freigaben, externer Speicher) nicht direkt ansprechen (CORS). Dieser Helfer läuft im Netz, nimmt nur
// Anfragen der Sign-App an und reicht sie unverändert an DEINE Nextcloud weiter. Server zu Server gibt es
// keine CORS-Sperre.
//
// Was er NICHT tut:
//   - speichert nichts (keine Passwörter, keine Daten, kein Protokoll)
//   - leitet keine Videos/Dateien weiter (WebDAV geht weiterhin direkt von der App zur Nextcloud)
//   - spricht nur die eine Nextcloud an, die du in NC_URL einträgst
//   - erlaubt nur die unten aufgezählten Schnittstellen
//
// Einstellungen (im Cloudflare-Dashboard unter Settings → Variables, NICHT hier im Code):
//   NC_URL           z. B. https://nx12345.your-storageshare.de
//   ALLOWED_ORIGINS  z. B. https://signclip.github.io   (mehrere mit Komma getrennt)

// Nur diese Pfade werden weitergereicht.
const ALLOWED_PATHS = [
  /^\/ocs\/v[12]\.php\/cloud\/users(\/[^/]+(\/(groups|welcome|enable|disable))?)?$/, // Konten anlegen/verwalten
  /^\/ocs\/v[12]\.php\/cloud\/groups(\/[^/]+)?$/,                                    // Gruppen lesen
  /^\/ocs\/v2\.php\/core\/(getapppassword|apppassword(\/rotate)?)$/,                  // App-Passwörter
  /^\/ocs\/v2\.php\/apps\/files_sharing\/api\/v1\/shares(\/\d+)?$/,                  // Freigaben (z. B. an Sciebo)
  /^\/ocs\/v2\.php\/apps\/files_sharing\/api\/v1\/remote_shares(\/pending)?(\/\d+)?$/, // Sciebo-Freigaben annehmen
  /^\/index\.php\/apps\/files_external\/userstorages(\/\d+)?$/,                       // Sciebo-Link als Ordner einbinden
];

// Nur diese Kopfzeilen werden weitergereicht (keine Cookies).
const PASS_HEADERS = ["Authorization", "Content-Type", "OCS-APIRequest", "Accept"];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const originOk = allowedOrigins.includes(origin);

    const cors = originOk ? {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": PASS_HEADERS.join(", "),
      "Access-Control-Max-Age": "600",
      "Vary": "Origin",
    } : {};

    // Vorabanfrage des Browsers („Darf ich?“)
    if (request.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers: cors });
    if (!originOk) return new Response("Herkunft nicht erlaubt", { status: 403 });
    if (!env.NC_URL) return new Response("NC_URL fehlt in den Einstellungen des Helfers", { status: 500, headers: cors });

    const url = new URL(request.url);
    if (!ALLOWED_PATHS.some(r => r.test(url.pathname))) {
      return new Response("Pfad nicht erlaubt", { status: 403, headers: cors });
    }

    const target = env.NC_URL.replace(/\/+$/, "") + url.pathname + url.search;
    const headers = new Headers();
    for (const k of PASS_HEADERS) { const v = request.headers.get(k); if (v) headers.set(k, v); }

    const hasBody = !["GET", "HEAD"].includes(request.method);
    const resp = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
    });

    const out = new Headers(cors);
    const ct = resp.headers.get("Content-Type");
    if (ct) out.set("Content-Type", ct);
    return new Response(resp.body, { status: resp.status, headers: out });
  },
};
