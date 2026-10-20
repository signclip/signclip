SignClip PWA - Installation und Wartung
EINMALIG: Alle Dateien in einen Ordner auf ein statisches HTTPS-Hosting legen (GitHub Pages, Netlify oder Cloudflare Pages, kostenlos).
INSTALLIEREN: Adresse am Handy öffnen. iPhone: Safari > Teilen > Zum Home-Bildschirm. Android: Chrome > App installieren.
DANACH: läuft offline, alle Daten bleiben auf dem Gerät. Kein Server, kein Konto, keine laufenden Kosten.
UPDATE: index.html (und ggf. sw.js) ersetzen. Die App aktualisiert sich beim nächsten Start von selbst.
ERWEITERN: In index.html die Tabelle ACT (Aktionen) und MAP (Gesten) ändern. Hilfe und Steuerungshinweise entstehen automatisch.
SICHERUNG: Videos in der App über Teilen > Ordner / Cloud / Speichern unter exportieren.

WEBDAV (Nextcloud / Sciebo)
- Adresse: https://HOST/remote.php/dav/files/BENUTZER/ORDNER/  (Sciebo: https://HOCHSCHULE.sciebo.de/remote.php/webdav/ORDNER/)
- App-Passwort in Nextcloud erzeugen (Einstellungen > Sicherheit), nicht das Hauptpasswort verwenden.
- Der Browser sendet Anfragen von der App-Adresse an den Server (CORS). Der Server muss diese App-Adresse erlauben
  und die Header Authorization, Depth, Content-Type sowie die Methoden PROPFIND, PUT, GET, OPTIONS zulassen.
  Ohne diese Freigabe meldet die App: "Keine Verbindung: Netz oder CORS".
- Das Passwort wird mit AES-GCM verschlüsselt auf dem Gerät gespeichert (nicht auslesbarer Schlüssel in IndexedDB).
  Das schützt vor dem Lesen im Klartext, nicht vor Schadcode in der App-Seite. Sicherer: Capacitor mit Keychain/Keystore.
