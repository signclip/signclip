SignClip PWA - Installation und Wartung
EINMALIG: Alle Dateien in einen Ordner auf ein statisches HTTPS-Hosting legen (GitHub Pages, Netlify oder Cloudflare Pages, kostenlos).
INSTALLIEREN: Adresse am Handy öffnen. iPhone: Safari > Teilen > Zum Home-Bildschirm. Android: Chrome > App installieren.
DANACH: läuft offline, alle Daten bleiben auf dem Gerät. Kein Server, kein Konto, keine laufenden Kosten.
UPDATE: index.html (und ggf. sw.js) ersetzen. Die App aktualisiert sich beim nächsten Start von selbst.
ERWEITERN: In index.html die Tabelle ACT (Aktionen) und MAP (Gesten) ändern. Hilfe und Steuerungshinweise entstehen automatisch.
SPEICHERORTE: Grüner Punkt > Speicherorte. Beliebig viele: Ordner auf dem Gerät, Nextcloud/Sciebo-Konto, freigegebener Ordner (Link).
  Bedienung nur mit Gesten: Karte nach unten = entfernen, nach oben = ins Teilen-Menü, nach links = prüfen + immer speichern,
  2x tippen = ändern. Umrandet = jede Aufnahme wird dort gespeichert, sonst erscheint der Ort im Teilen-Menü.
  "Neuer Speicherort" nach rechts ziehen = Cloud oder Freigabe-Link, weit nach rechts = Ordner auf dem Gerät.
  Neben jedem Video liegt VIDEONAME.json mit Kontext, Marker und Schnitten.
FORMAT: Grüner Punkt > Aufnahme: 9:16, 3:4, 4:5, 1:1, 4:3, 16:9 oder Kamera. Sprache: "Format quadrat", "Format 3 zu 4".

WEBDAV (Nextcloud / Sciebo)
- Freigabe-Link: in Sciebo Ordner > Teilen > Link kopieren (https://HOCHSCHULE.sciebo.de/s/CODE). Zum Hochladen muss der Link Bearbeiten oder Hochladen erlauben.
- Konto-Adresse: https://HOST/remote.php/dav/files/BENUTZER/ORDNER/  (Sciebo: https://HOCHSCHULE.sciebo.de/remote.php/webdav/ORDNER/)
- App-Passwort in Nextcloud erzeugen (Einstellungen > Sicherheit), nicht das Hauptpasswort verwenden.
- Der Browser sendet Anfragen von der App-Adresse an den Server (CORS). Der Server muss diese App-Adresse erlauben
  und die Header Authorization, Depth, Content-Type sowie die Methoden PROPFIND, PUT, GET, OPTIONS zulassen.
  Ohne diese Freigabe meldet die App: "Keine Verbindung: Netz oder CORS".
  Ausweg ohne Server-Zugriff: tools/webdav-proxy.js als Cloudflare Worker (Anleitung in der Datei), Adresse unter Speicherort > Erweitert.
- Das Passwort wird mit AES-GCM verschlüsselt auf dem Gerät gespeichert (nicht auslesbarer Schlüssel in IndexedDB).
  Das schützt vor dem Lesen im Klartext, nicht vor Schadcode in der App-Seite. Sicherer: Capacitor mit Keychain/Keystore.
