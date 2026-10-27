# Nextcloud-Test (vorübergehend)

Eine sehr einfache Test-App mit einer einzigen Datei (`index.html` im Hauptordner). Sie prüft, was die Browser-Version von Sign braucht:

1. **Verbindung** aus dem Browser zur eigenen Nextcloud (CORS)
2. **Quadratische Aufnahme** mit Start und Stopp, Speichern in die Nextcloud
3. **Speicherorte** mit „immer speichern“, auch in eingebundene Sciebo-Ordner

Konten und Sciebo werden **vorerst in der Nextcloud-Weboberfläche** eingerichtet. Der Browser darf die Verwaltung der Nextcloud nicht ansprechen; direkt aus der App geht das erst mit der Handy-App (Capacitor).

**In dieser App und in diesem Repo stehen keine Zugangsdaten.** Du gibst sie erst ein, wenn die App im Browser läuft. Sie bleiben nur in diesem Browser.

---

## A. App-Adresse (GitHub Pages)

- App-Adresse: `https://signclip.github.io/signclip/`
- Ursprung für die Nextcloud: `https://signclip.github.io`
- Die erste Version bleibt unverändert unter `InitialVersion/`.

Erscheint noch eine alte Seite: privates Fenster öffnen oder zweimal neu laden.

---

## B. Nextcloud vorbereiten (als Admin in der Weboberfläche)

1. **WebAppPassword:** Profilbild → **Apps** → **WebAppPassword** aktivieren → **Verwaltungseinstellungen** → links ganz unten **WebAppPassword** (oder „Zusätzliche Einstellungen“) → `https://signclip.github.io` als erlaubten Ursprung eintragen (ohne Pfad, ohne Schrägstrich am Ende)
2. **Gruppe:** `Sign-Students` (ist angelegt)
3. **Externer Speicher:** App **External storage support** aktivieren (ist aktiviert)
4. **App-Passwort für den Test:** mit deinem Alltagskonto → **Persönliche Einstellungen** → **Sicherheit** → „Geräte & Sitzungen“ → Name `Sign Test Browser` → **Neues App-Passwort erstellen** → in den Passwortmanager

---

## C. Testen

| Schritt in der App | Was du tust | Ergebnis im Protokoll |
| --- | --- | --- |
| **1 · Verbindung** | Adresse, Benutzername, App-Passwort → **Verbinden + testen** | grün „T1 bestanden“ |
| **2 · Aufnahme** | **Kamera an** → **Start** → **Stopp** → **Speichern** | grün „gespeichert in SignTest“ (Ordner wird automatisch angelegt) |
| **3 · Speicherorte** | **Ordner laden** → weitere Ordner anhaken | jede Aufnahme geht in alle angehakten Ordner |
| **3 · mit Sciebo** | nach F den Ordner „Sciebo Uni Köln“ anhaken → aufnehmen → speichern | grün für beide; Datei liegt in Sciebo |

Bitte für jeden Schritt **grün oder rot** melden, bei Rot den Text aus dem Protokoll. **Keine Passwörter.**

---

## D. Konten anlegen (vorerst von Hand)

1. Profilbild → **Konten** → **Neues Konto**
2. Benutzername, Anzeigename, **E-Mail** eintragen, **Passwort leer lassen**, Gruppe **Sign-Students**, Kontingent setzen → speichern
3. Die Person bekommt eine Willkommens-E-Mail und setzt ihr Passwort selbst
4. Sie erzeugt unter Einstellungen → Sicherheit ein App-Passwort und meldet sich damit in der App an

Optional später: App **Registration** (Selbstregistrierung mit Freischaltung durch dich, automatische Gruppe).

---

## E. Freigaben automatisch annehmen

| Richtung | Automatisch? | Wie |
| --- | --- | --- |
| **Sciebo → deine Nextcloud** | ohne Annehmen: ja, über **externen Speicher** (F) – dabei entsteht gar keine Freigabe, die bestätigt werden muss | F |
| **Sciebo → deine Nextcloud** als föderierte Freigabe | nur, wenn `uni-koeln.sciebo.de` unter **Verwaltungseinstellungen → Teilen → Vertrauenswürdige Server** grün wird und dort „Freigaben von vertrauenswürdigen Servern automatisch annehmen“ eingeschaltet ist | ausprobieren; sonst einmal über die Glocke annehmen |
| **deine Nextcloud → Sciebo** | in Sciebo entscheiden das die Betreiber; als Nutzer **einmal** über die Glocke annehmen | einen **übergeordneten Ordner** teilen (z. B. „Sign“), dann erscheint alles darin ohne weiteres Annehmen |

---

## F. Sciebo-Freigabe als externen Speicher einbinden (ohne Annehmen)

1. Profilbild → **Verwaltungseinstellungen** → links **Externer Speicher**
2. Neue Zeile:
   - **Ordnername:** `Sciebo Uni Köln`
   - **Externer Speicher:** **WebDAV**
   - **Authentifizierung:** **Benutzername und Passwort**
   - **URL:** `uni-koeln.sciebo.de`
   - **Entfernter Unterordner:** `public.php/webdav`
   - **Sicher (https):** angehakt
   - **Benutzername:** Kennung aus dem Freigabelink (alles nach `/s/`; die Test-App zeigt sie unter 4 an)
   - **Passwort:** Passwort des Freigabelinks (falls gesetzt)
   - **Verfügbar für:** dein Konto oder Gruppe `Sign-Students`
3. Haken rechts → **grüner Punkt** = verbunden
4. Test-App → 3 → **Ordner laden** → „Sciebo Uni Köln“ anhaken

Roter Punkt: **Entfernter Unterordner** `public.php/dav/files/<Kennung>` und **Benutzername** `anonymous` versuchen.
Speichern nach Sciebo geht nur, wenn die Freigabe **Hochladen/Bearbeiten** erlaubt.

---

## G. Deinen Nextcloud-Ordner in Sciebo sichtbar machen

1. In der Nextcloud beim Ordner (am besten einem übergeordneten wie „Sign“) → **Teilen**
2. Deine **Sciebo-ID** eintragen. Bei Uni-Konten enthält sie zwei `@`, z. B. `name@uni-koeln.de@uni-koeln.sciebo.de` – das ist richtig so: alles vor dem **letzten** `@` ist dein Sciebo-Benutzername, dahinter der Server. Deine genaue ID steht in Sciebo unter **Einstellungen → Teilen** („Federated Cloud ID“) – am besten von dort kopieren.
3. **Warten, bis der Vorschlag erscheint**, und den Eintrag mit **Wolken-Symbol** (föderiert) auswählen – nicht einfach Enter drücken
4. Rechte: **nur Lesen**
5. In Sciebo über die **Glocke** annehmen

Kommt eine **Warnung**, bitte den genauen Text melden. Häufige Ursachen:
- Server-Teil falsch (z. B. `uni.sciebo.de` statt `uni-koeln.sciebo.de`)
- Sciebo nimmt föderierte Freigaben nur von bestimmten Servern an – dann geht dieser Weg nicht, und wir nutzen stattdessen einen **öffentlichen Link** deines Ordners (nur Lesen, mit Passwort), den du in Sciebo oder im Browser öffnest

---

## J. Direkt-Versuche in der App (Abschnitt 4)

Drei Wege, die in der App selbst ausprobiert werden. **A und B werden im Browser voraussichtlich rot** (Sciebo erlaubt Browser-Apps von fremden Adressen keinen Zugriff). Rot heißt dann: Weg geht erst mit der Handy-App – im Browser F bzw. G nutzen.

### Einmal vorher, von Hand
| Wo | Was | Wofür |
| --- | --- | --- |
| **Nextcloud** → Verwaltungseinstellungen → **WebAppPassword** | beim Feld für **Files sharing** ebenfalls `https://signclip.github.io` eintragen | Weg C |
| **Sciebo** → Einstellungen → **Sicherheit** | App-Passwort erstellen (Name z. B. `Sign Test`), kopieren | Weg A |
| **Sciebo** → Einstellungen → **Teilen** | deine **Federated Cloud ID** kopieren | Weg C |
| **Sciebo** → Ordner → Teilen → Link | Link mit **„Hochladen und Bearbeiten“** (und Passwort) | Weg B |

### In der App eintragen
| Weg | Feld | Eintrag |
| --- | --- | --- |
| **A** Sciebo-Konto/Ordner | Sciebo-Adresse | `https://uni-koeln.sciebo.de` (steht schon da) |
| | Sciebo-Benutzername | Teil **vor dem letzten @** deiner Sciebo-ID, z. B. `name@uni-koeln.de` |
| | Sciebo-App-Passwort | aus Sciebo → Sicherheit |
| | Ordner in Sciebo | leer = ganzes Konto; sonst Pfad aus der Sciebo-Adresszeile nach `dir=`, z. B. `/Sign-Gruppe` |
| | Knopf | **Testen + als Speicherort hinzufügen** |
| **B** Freigabelink | Freigabelink | `https://uni-koeln.sciebo.de/s/…` |
| | Link-Passwort | falls gesetzt |
| | Knopf | **Testen + als Speicherort hinzufügen** (probiert zwei Schnittstellen nacheinander) |
| **C** Nextcloud in Sciebo sichtbar | Deine Sciebo-ID | z. B. `name@uni-koeln.de@uni-koeln.sciebo.de` |
| | Ordner in deiner Nextcloud | z. B. `SignTest` |
| | Knopf | **In Sciebo sichtbar machen** |

Grün bei A oder B: Das Ziel erscheint unter **3 · Speicherorte → Direkte Ziele** und ist angehakt; die nächste Aufnahme geht auch dorthin.

### Danach von Hand
| Wo | Was | Wann |
| --- | --- | --- |
| **Sciebo** → Glocke oben | Freigabe **annehmen** | nach Weg C (oder nach G) |
| **Nextcloud** → Externer Speicher | Sciebo eintragen (F bzw. Abschnitt „Ordner, die dir freigegeben wurden“) | wenn A oder B rot waren |

Zugänge aus A und B liegen nur in diesem Browser (bis der Tab schließt, oder dauerhaft mit „Sciebo-Zugänge merken“). „entfernen“ unter 3 löscht sie; in Sciebo das App-Passwort widerrufen, wenn der Test vorbei ist.

---

## H. Was hier sicher ist

- **Im Repo:** nur Code. Keine Adresse, kein Benutzername, kein Passwort.
- **Im Browser:** dein App-Passwort, nur solange der Tab offen ist (oder dauerhaft mit „Auf diesem Gerät merken“). Nur auf eigenen Geräten.
- **Test vorbei oder Gerät verloren:** in der Nextcloud unter **Sicherheit** das App-Passwort `Sign Test Browser` **widerrufen**.
- **Sciebo-Link-Passwort** liegt nur in der Nextcloud (Externer Speicher), nicht in der App.

---

## I. Was im Hintergrund passiert (zum Verstehen)

| Funktion | Schnittstelle | Herkunft |
| --- | --- | --- |
| Ordner auflisten | WebDAV `PROPFIND` auf `/remote.php/dav/files/<benutzer>/` | WebDAV-Standard, Nextcloud-Doku |
| Ordner anlegen | WebDAV `MKCOL` | WebDAV-Standard |
| Datei speichern | WebDAV `PUT` | WebDAV-Standard |
| Browser-Zugriff erlauben | WebAppPassword setzt CORS-Kopfzeilen nur für WebDAV (und eigene Schnittstellen) | Nextcloud-App WebAppPassword |
| Sciebo als Ordner | Externer Speicher (WebDAV auf `https://<sciebo>/public.php/webdav`, Kennung als Benutzer) | Nextcloud External storage |
| Quadratisches Video | Kamerabild auf ein quadratisches `canvas` zeichnen, davon aufnehmen (`MediaRecorder`) | Web-Standards |

Alle Befehle stehen kommentiert in `../index.html`.
