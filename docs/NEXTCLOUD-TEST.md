# Nextcloud-Test (vorübergehend)

Eine sehr einfache Test-App mit einer einzigen Datei (`index.html` im Hauptordner). Sie prüft, ob die Grundlagen von Sign mit deiner Nextcloud funktionieren:

1. **Verbindung** aus dem Browser (CORS)
2. **Quadratische Aufnahme** mit Start und Stopp, speichern in die Nextcloud
3. **Speicherorte** mit „immer speichern“ (mehrere Ordner ankreuzbar)
4. **Sciebo-Freigabe einbinden** und dorthin speichern
5. **Konto anlegen** und **Einladungslink** erzeugen, der beim ersten Öffnen ungültig wird

**In dieser App und in diesem Repo stehen keine Zugangsdaten.** Du gibst sie erst ein, wenn die App im Browser läuft. Sie bleiben nur in diesem Browser.

---

## A. App-Adresse (GitHub Pages)

Die Test-App liegt als `index.html` im Hauptordner von `signclip/signclip`. Die erste Version bleibt unverändert unter `InitialVersion/`.

1. Im Repo **Settings** → links **Pages**
2. Falls noch nicht eingeschaltet: bei „Branch“ **main** und **/(root)** wählen → **Save**
3. Nach 1–2 Minuten steht oben die Adresse, voraussichtlich `https://signclip.github.io/signclip/`

Das ist die **App-Adresse**. Der Teil vor dem ersten einzelnen Schrägstrich (voraussichtlich `https://signclip.github.io`) ist der **Ursprung**, den die Nextcloud gleich erlauben muss. Steht unter Pages eine eigene Domain, gilt diese.

> Warum öffentlich unbedenklich ist: Im Code stehen weder Server-Adresse noch Benutzername noch Passwort. Wer die Seite öffnet, sieht nur leere Felder.

**Später:** Ist der Test abgeschlossen, wird `index.html` im Hauptordner durch die echte App ersetzt und diese Anleitung gelöscht.

---

## B. Nextcloud vorbereiten (als Admin in der Weboberfläche)

1. **App installieren:** oben rechts Profilbild → **Apps** → suchen nach **WebAppPassword** → **Herunterladen und aktivieren**
2. **Ursprung erlauben:** Profilbild → **Verwaltungseinstellungen** → links **WebAppPassword** → bei den erlaubten Ursprüngen den Ursprung aus A eintragen (voraussichtlich `https://signclip.github.io`) → speichern
   (genau so, ohne `/signclip`, ohne Schrägstrich am Ende)
3. **Gruppen:** Profilbild → **Konten** (bzw. Benutzer) → links **Gruppe hinzufügen**: `sign-teilnehmende`, `sign-verwaltung`
4. **Dein Alltagskonto** (nicht der Admin):
   - in die Gruppe `sign-verwaltung`
   - in der Spalte **Gruppenadministrator für** die Gruppe `sign-teilnehmende` eintragen
5. **App-Passwort für den Test:** mit deinem Alltagskonto anmelden → Profilbild → **Persönliche Einstellungen** → **Sicherheit** → unten bei „Geräte & Sitzungen“ Namen eingeben (z. B. `Sign Test Browser`) → **Neues App-Passwort erstellen** → Benutzername und Passwort werden **einmal** angezeigt → in den Passwortmanager kopieren

---

## C. Testen

App-Adresse am Handy oder Rechner öffnen.

| Schritt in der App | Was du tust | Ergebnis im Protokoll |
| --- | --- | --- |
| **1 · Verbindung** | Nextcloud-Adresse, Benutzername und App-Passwort aus B5 eintragen → **Verbinden + testen** | grün „T1 bestanden“ – rot „Keine Antwort“ heißt meist: Ursprung in B2 stimmt nicht |
| **3 · Speicherorte** | **Ordner „SignTest“ anlegen** → **Ordner laden** → „SignTest“ ist angehakt | grün |
| **2 · Aufnahme** | **Kamera an** → **Start** → kurz gebärden → **Stopp** → **Speichern** | grün „gespeichert in SignTest“; in der Nextcloud liegen Video + `.json` |
| **4 · Sciebo** | Freigabelink einfügen → **Adresse kopieren** → **Sciebo-Seite öffnen** → dort „Zu deiner Nextcloud hinzufügen“ und die kopierte Adresse einfügen → zurück → **Ausstehende Freigaben laden** → **Annehmen** | grün „T7 bestanden“ |
| **3 · Speicherorte** | **Ordner laden** → den Sciebo-Ordner zusätzlich anhaken → neue Aufnahme speichern | grün für beide Ordner; die Datei erscheint in Sciebo (nur, wenn der Link Hochladen erlaubt) |
| **5 · Verwaltung** | Anzeigename eintragen → **Konto anlegen + Einladung erzeugen** | grün T4 und T5, darunter der Einladungslink |
| **Einladung** | Link in einem **anderen** Browser oder privaten Fenster öffnen | grün „T6 bestanden: Willkommen …“ |
| **Einladung nochmal** | denselben Link ein zweites Mal öffnen | rot „Einladung ungültig oder schon benutzt“ – **das ist richtig** |
| **Aufräumen** | in der Nextcloud unter **Konten** das Testkonto deaktivieren und löschen | – |

Bitte schreib mir für jeden Schritt **grün oder rot** und bei Rot den Text aus dem Protokoll. **Keine Passwörter, keine Links aus Schritt 5.**

---

## D. Was hier sicher ist – und was nicht

- **Im Repo:** nur Code. Keine Adresse, kein Benutzername, kein Passwort.
- **Im Browser:** dein App-Passwort, nur solange der Tab offen ist (oder dauerhaft, wenn du „Auf diesem Gerät merken“ anhakst). **Nur auf eigenen Geräten verwenden.**
- **Zufallspasswort neuer Konten:** existiert nur für Sekunden im Speicher und wird danach verworfen.
- **Einladungslink:** enthält einen Zugang hinter `#` (geht an keinen Server). Beim ersten Öffnen wird er ausgetauscht und ist danach wertlos.
- **Gerät verloren oder Test vorbei:** in der Nextcloud unter **Sicherheit** das App-Passwort `Sign Test Browser` **widerrufen**. „Auf diesem Gerät vergessen“ in der App löscht nur die Kopie im Browser.
- **Grenze:** höchstens 3 neue Konten pro Sitzung (in Schritt 5 einstellbar). Dein Konto kann ohnehin nur Konten in `sign-teilnehmende` anlegen.

---

## E. Wenn etwas rot wird

| Meldung | Wahrscheinliche Ursache | Was tun |
| --- | --- | --- |
| „Keine Antwort – meist CORS …“ bei Schritt 1 | Ursprung in WebAppPassword fehlt oder ist falsch geschrieben | B2 prüfen: Ursprung aus A, ohne Pfad und ohne Schrägstrich am Ende |
| Schritt 1 grün, aber Schritt 4 oder 5 „Keine Antwort“ | WebAppPassword erlaubt nur Dateien, nicht die Verwaltungs-Schnittstelle | Ergebnis melden → dann Notweg: Konten in der Weboberfläche anlegen |
| `401` | App-Passwort oder Benutzername falsch | neues App-Passwort erzeugen |
| `OCS 997` / `403` bei Schritt 5 | Konto ist kein Gruppenadministrator von `sign-teilnehmende` | B4 prüfen |
| `OCS 102` bei Schritt 5 | Benutzer-ID gibt es schon | andere ID eintragen |
| `OCS 107` bei Schritt 5 | Passwortregeln der Nextcloud | melden |
| Speichern in Sciebo-Ordner `403` | Sciebo-Link erlaubt kein Hochladen | in Sciebo Freigabe auf „Hochladen und Bearbeiten“ stellen |
| „captureStream fehlt“ | Browser zu alt | anderen Browser versuchen |

---

## F. Was im Hintergrund passiert (zum Verstehen)

| Funktion | Schnittstelle | Herkunft |
| --- | --- | --- |
| Ordner auflisten | WebDAV `PROPFIND` auf `/remote.php/dav/files/<benutzer>/` | WebDAV-Standard, Nextcloud-Doku |
| Ordner anlegen | WebDAV `MKCOL` | WebDAV-Standard |
| Datei speichern | WebDAV `PUT` | WebDAV-Standard |
| Konto anlegen | `POST /ocs/v1.php/cloud/users` | Nextcloud Provisioning-Schnittstelle |
| App-Passwort erzeugen | `GET /ocs/v2.php/core/getapppassword` (mit dem echten Passwort des neuen Kontos) | Nextcloud Login Flow |
| Einladung annehmen | `POST /ocs/v2.php/core/apppassword/rotate` (altes App-Passwort wird ungültig) | Nextcloud App-Passwort-Schnittstelle |
| Sciebo-Freigaben | `GET/POST /ocs/v2.php/apps/files_sharing/api/v1/remote_shares/pending` | Nextcloud föderiertes Teilen |
| Quadratisches Video | Kamerabild auf ein quadratisches `canvas` zeichnen, davon aufnehmen (`MediaRecorder`) | Web-Standards |

Alle Befehle stehen ausführlich kommentiert in `../index.html`.
