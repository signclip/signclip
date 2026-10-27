# WebDAV-Proxy (Worker) einrichten

Wozu: SignClip im Browser darf Sciebo/Nextcloud nur ansprechen, wenn der Server das erlaubt (CORS). Sciebo erlaubt es nicht. Der Worker reicht die Anfragen weiter und ergänzt die Erlaubnis. Mit der späteren App (Capacitor) wird er nicht mehr gebraucht.

Code: [`webdav-proxy.js`](webdav-proxy.js)

## Cloudflare (kostenlos, ca. 10 Minuten)

1. **Konto:** auf dash.cloudflare.com registrieren (E-Mail bestätigen).
2. **Worker anlegen:** links **Workers & Pages** › **Create** › **Create Worker** (Vorlage „Hello World“) › Name z. B. `signclip-dav` › **Deploy**.
3. **Code einsetzen:** **Edit code** › alles löschen › Inhalt von `webdav-proxy.js` einfügen › **Deploy**.
4. **Erlaubnisse setzen:** im Worker **Settings** › **Variables and Secrets** › **Add**, Typ „Text“:

   | Name | Wert | Bedeutung |
   | --- | --- | --- |
   | `ALLOW_HOSTS` | `uni-xy.sciebo.de` | Nur an diese Server wird weitergeleitet. Mehrere mit Komma. |
   | `ALLOW_ORIGIN` | `https://signclip.github.io` | Nur diese App darf den Worker benutzen (ohne Pfad, ohne `/` am Ende). |

   Danach **Deploy**. Ohne `ALLOW_HOSTS` lehnt der Worker alles ab.
5. **Adresse kopieren:** oben steht `https://signclip-dav.DEINNAME.workers.dev`.
6. **Testen:** die Adresse im Browser öffnen → Antwort „Parameter url fehlt“ = läuft.

## In SignClip eintragen

- **Für alle fest (empfohlen):** in `storage.js` ganz oben `const DEFAULT_PROXY = 'https://signclip-dav.DEINNAME.workers.dev/';` eintragen und committen. Lernende fügen dann nur Link und Passwort ein.
- **Nur für einen Speicherort:** Speicherort 2× tippen › „Proxy bei CORS-Fehler“ › Adresse einfügen › nach links ziehen.

## Mehrere Leute

- Ein Worker für alle. Er speichert nichts; jede Person schickt ihren eigenen Link und ihr Passwort mit.
- Kostenloser Tarif: 100.000 Anfragen pro Tag, bis 100 MB pro Datei. Pro Video 2 Anfragen plus ein Abgleich alle 5 Minuten – reicht für mehrere hundert Leute.
- **Offen sagen:** Passwörter und Videos laufen durch den Worker bei Cloudflare (USA). Wer das nicht möchte: eigener Server (unten).
- Sciebo bremst nach vielen falschen Passwörtern. Über den Worker teilen sich alle Cloudflare-Adressen; häufige Fehlversuche einer Person können kurz auch andere treffen.

## Andere Orte für den Proxy

**Eigener Server oder Hochschul-Webspace mit nginx** – kein Größenlimit, Daten bleiben in Deutschland. Statt des Workers ein fester Pfad pro Sciebo-Server. In SignClip dann keinen Proxy eintragen, sondern im Freigabe-Link nur den Server austauschen: aus `https://uni-xy.sciebo.de/s/CODE` wird `https://dein-server.de/sciebo/s/CODE`.

```nginx
location /sciebo/ {
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin  "https://signclip.github.io" always;
        add_header Access-Control-Allow-Methods "GET, PUT, PROPFIND, MKCOL, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Depth, Content-Type" always;
        add_header Access-Control-Max-Age 86400 always;
        return 204;
    }
    proxy_pass https://uni-xy.sciebo.de/;
    proxy_set_header Host uni-xy.sciebo.de;
    proxy_ssl_server_name on;
    proxy_hide_header Access-Control-Allow-Origin;
    proxy_hide_header Set-Cookie;
    add_header Access-Control-Allow-Origin   "https://signclip.github.io" always;
    add_header Access-Control-Expose-Headers "ETag" always;
    client_max_body_size 2G;
    proxy_request_buffering off;
}
```

**Nicht geeignet:** Vercel, Netlify Functions (Uploads nur wenige MB).

## Fehlersuche

| Meldung in SignClip | Ursache |
| --- | --- |
| Keine Verbindung: Netz oder CORS – Proxy prüfen | Worker-Adresse falsch oder `ALLOW_ORIGIN` passt nicht zur App-Adresse |
| Fehler HTTP 403 | Sciebo-Server nicht in `ALLOW_HOSTS` |
| Freigabe-Passwort fehlt oder falsch | Passwort des Links prüfen |
| Datei zu groß | über 100 MB (Cloudflare-Grenze) |
