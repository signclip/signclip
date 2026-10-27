# Eigene Nextcloud für SignClip (Etappe 1)

Start mit einer verwalteten Nextcloud bei Hetzner (Storage Share, 1 TB), Erweiterung in Wellen. Die Browser-Version speichert direkt dorthin. Sciebo-Ordner werden in der Nextcloud eingebunden, Nextcloud-Ordner lassen sich in Sciebo sichtbar machen. Hinein kommt Inhalt nur über die App.

```
Einladungslink ─► App: ein Tippen ─► Speicherort „Sign · Name“ (immer speichern)
                                         │ WebDAV, CORS über WebAppPassword
                                   eigene Nextcloud
              ┌──────────────────────────┼───────────────────────────┐
     SignClip/ (Schreib-Konto)    Gruppenordner              Sciebo, eingebunden
     nur lesend → Lese-Konto      <g>-app schreibt,          (externer Speicher,
     nur lesend → Sciebo-ID       <g> liest                   Server zu Server)
```

## 1. Buchen

- Hetzner **Storage Share NX11** (1 TB, Rechenzentrum Falkenstein). Abrechnung stundengenau, für einen Testtag reichen Cent-Beträge.
- Adresse merken, z. B. `https://xyz.your-storageshare.de`. Später eigene Domain möglich (empfohlen, damit Einladungslinks bei einem Umzug gültig bleiben).
- **Wellen:** 5 TB (NX21), 10 TB (NX31). Ob der Wechsel der Stufe ohne Umzug geht, vor der ersten Welle bei Hetzner prüfen.

## 2. Apps in der Nextcloud aktivieren (als Admin)

| App | Wozu | Einstellung |
| --- | --- | --- |
| **WebAppPassword** | Browser-Version darf WebDAV und Freigaben nutzen (CORS) | Verwaltung › WebAppPassword: bei **WebDAV/CalDAV origins** und **Files sharing origins** `https://signclip.github.io` eintragen (nur Schema + Host, kein Pfad) |
| **External storage support** | Sciebo-Ordner in der Nextcloud einbinden | Verwaltung › Externe Speicher |
| **Team folders** (früher Group folders) | gemeinsame Gruppenordner mit Rechten pro Gruppe | Verwaltung › Team folders |
| Federation (Standard) | „In Sciebo anzeigen“ | Verwaltung › Teilen: Teilen mit anderen Servern erlauben |

## 3. Personen einladen

Skript: [`tools/nextcloud-einladen.py`](../tools/nextcloud-einladen.py) (nur Python, keine Zusatzpakete).

```bash
export NC_ADMIN_PASS='…'
python3 tools/nextcloud-einladen.py --server https://xyz.your-storageshare.de --admin admin \
    --user anna --name "Anna B." --email anna@example.org --group lernende --reader \
    --sciebo-id anna@uni-xy.sciebo.de --quota 20GB
```

Es legt an:
- **Schreib-Konto** `anna-app` – nur für die App, Passwort wird nie angezeigt
- **Lese-Konto** `anna` (mit `--reader`) – Web, Desktop-Client, Nextcloud-App, nur lesen; Passwort über Begrüßungs-Mail
- Ordner `SignClip/`, nur lesend geteilt an `anna` und (mit `--sciebo-id`) an Sciebo
- Gruppen: `lernende-app` (Schreib-Konto), `lernende` (Lese-Konto)
- **Einladungsseite** `einladungen/einladung-anna.html` mit Link und QR-Code

Viele auf einmal: `--csv personen.csv` mit Spalten `user,name,email,groups,quota,sciebo_id,reader` (Gruppen mit `;`). Erneut ausführen ist unschädlich; es entsteht ein neues App-Passwort.

**Der Einladungslink ist ein Zugang.** Nur persönlich weitergeben. Sperren: beim Konto `anna-app` das App-Passwort löschen oder das Konto deaktivieren.

## 4. Gruppenordner

Verwaltung › Team folders › Ordner `DGS-Gruppe` anlegen:
- Gruppe `lernende-app`: alle Rechte (die App schreibt)
- Gruppe `lernende`: nur lesen (Menschen sehen und laden herunter)

In der App erscheint der Ordner automatisch als Vorschlag unter dem Nextcloud-Speicherort.

## 5. Sciebo einbinden

### 5.1 Freigabelink aus Sciebo (z. B. eine Gruppenfreigabe)
Verwaltung › Externe Speicher › neuer Eintrag:
- Ordnername: `Sciebo-DGS`
- Typ: **WebDAV**
- Adresse: `https://uni-xy.sciebo.de/public.php/webdav` (bei neueren Nextcloud-Versionen evtl. `…/public.php/dav/files/CODE` – beim Testtag prüfen)
- Anmeldung: Benutzername und Passwort → Benutzer = **Code aus dem Link** (`…/s/CODE`), Passwort = **Freigabe-Passwort**
- Verfügbar für: die Gruppe `lernende-app` (oder einzelne Schreib-Konten)

### 5.2 Ganzes Sciebo-Konto einer Person
- Typ: **Nextcloud**, Adresse `uni-xy.sciebo.de`
- Anmeldung: Benutzername und Passwort = Sciebo-Benutzer + **Sciebo-App-Passwort** (in Sciebo unter Einstellungen › Sicherheit erzeugen)
- Verfügbar für: nur das Schreib-Konto dieser Person, z. B. `anna-app`

### 5.3 Ordner, den jemand in Sciebo mit dir geteilt hat
Links wie `https://uni-koeln.sciebo.de/apps/files_sharing/accept/ocinternal:…` sind **keine öffentlichen Freigabe-Links**, sondern die Annahme einer Freigabe **an dein Sciebo-Konto**. Ablauf:
1. Link öffnen, bei Sciebo anmelden, Freigabe annehmen → der Ordner liegt jetzt in deinem Sciebo.
2. Dein Sciebo-Konto wie in 5.2 einbinden (für dein Schreib-Konto, z. B. `name-app`).
3. In der App erscheint der geteilte Ordner als Vorschlag `Sciebo › Ordnername` („In Sciebo“). Nach links ziehen = **jede Aufnahme automatisch auch dorthin**.

Voraussetzung: Die Freigabe erlaubt Bearbeiten/Hochladen.

In der App erscheinen eingebundene Ordner als Vorschlag („Eingebunden“). Nach links ziehen = jede Aufnahme auch dorthin, nach oben = im Teilen-Menü.

Hinweise: Zugriffe laufen über die Nextcloud zu Sciebo (langsamer). Änderungen direkt in Sciebo sieht die Nextcloud beim nächsten Zugriff. Sciebo-Zugangsdaten liegen in der Nextcloud – das den Personen sagen. Nutzungsbedingungen der Hochschule prüfen.

## 6. In der App

- **Einladungslink öffnen** → Speicherort entsteht, umrandet (jede Aufnahme wird gespeichert).
- Einstellungen (grüner Punkt) › Speicherorte:
  - Karte **→** = Teilen / Einbinden: **In Sciebo anzeigen** (nur lesend, in Sciebo einmal annehmen), **Link zum Ansehen** (nur lesen), **WebDAV-Adresse kopieren**
  - **←** immer speichern · **↑** ins Teilen-Menü · **↓** entfernen · **2×** ändern
  - gestrichelte Karten = gefundene Ordner (Gruppenordner, eingebundenes Sciebo, mit dir geteilt)

### Mit einem Klick woanders verfügbar
- **In Sciebo:** Karte → *In Sciebo anzeigen* (nur lesend, in Sciebo einmal annehmen).
- **Auf Handy, Tablet, Computer:** Die Einladungsseite enthält mit `--reader` einen zweiten Code/Link (`nc://login/…`). Nextcloud-App: Code scannen; Computer mit Nextcloud-Desktop-Client: Link anklicken. Auf iPhone/iPad erscheint der Ordner danach auch in der **Dateien-App** neben iCloud. Nur lesend.
- **Als Laufwerk:** Karte → *WebDAV-Adresse kopieren* (Finder, Explorer, Datei-Apps, rclone).

### Nachträglich übertragen (nur über die App)
- **Von Gerät, iCloud, Sciebo-App, Dateien:** Speicherorte › *Videos importieren* → nach rechts ziehen → Videos auswählen. Die App legt Begleitdatei (Kontext aus dem Dateinamen) an und speichert in alle Orte mit „immer speichern“.
- **Aus einem anderen Speicherort** (Sciebo-Ordner, Gruppenordner, Freigabe-Link): Karte → *In meine Speicherorte übernehmen* → alle Videos mit Kontext werden kopiert. Erneutes Übernehmen lädt nichts doppelt hoch.

## 7. Testtag (vor dem Start abhaken)

- [ ] Storage Share gebucht, Apps aus Abschnitt 2 aktiv, Origins eingetragen
- [ ] Skript legt eine Testperson an (`--reader --sciebo-id`), Einladungsseite öffnet sich
- [ ] Einladungslink in der Browser-Version: Speicherort „Verbunden“
- [ ] Aufnahme landet in `SignClip/` (Video + `.json`)
- [ ] Lese-Konto sieht den Ordner, kann nicht hochladen
- [ ] Team folder mit `-app`-Gruppe schreibend, Lese-Gruppe lesend; erscheint in der App als Vorschlag
- [ ] Sciebo-Freigabelink als externer Speicher (5.1): erscheint in der App, Aufnahme landet in Sciebo
- [ ] Ganzes Sciebo-Konto (5.2) eingebunden
- [ ] „In Sciebo anzeigen“: Freigabe kommt in Sciebo an, „Annehmen“ funktioniert (Sciebo muss fremde Server zulassen)
- [ ] „Link zum Ansehen“: Link öffnet sich ohne Anmeldung, nur lesen
- [ ] Sciebo-Freigabe per Annahme-Link (`…/accept/ocinternal:…`) annehmen, Konto einbinden, Ordner in der App „immer speichern“
- [ ] Einladungsseite: `nc://login`-Code in der Nextcloud-App (iOS/Android) und Link im Desktop-Client
- [ ] Videos importieren (iPhone: Auswahl aus iCloud Drive und Sciebo-App), In meine Speicherorte übernehmen
- [ ] Wenn CORS (Zeile 3) oder Sciebo-Einbindung (Zeile 7/8) scheitert: kleine eigene Nextcloud statt Storage Share, gleiches Vorgehen

Getestet ist alles gegen eine Nextcloud-Attrappe (Konten, App-Passwort, Freigaben, Ordnerarten, CORS wie WebAppPassword). Am echten Storage Share und an Sciebo steht der Test noch aus.
