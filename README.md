# SignClip

Multimodales Erfassen, Finden und Teilen, zuerst für eine persönliche Gebärdensprachbibliothek (DGS), später als gemeinsame Bibliothek für Lernende und Dolmetscher.

**Stand:** Neustart. Die erste Version liegt in [`InitialVersion/`](InitialVersion/) und läuft dort weiter. Geändert wurden nur Dateipfade in Hinweisen, weil die Hilfsdateien dort jetzt auf einer Ebene liegen. Die neue App wird hier in `main` Schritt für Schritt von Grund auf gebaut, mit Fokus auf langlebige Datenmodelle und austauschbare Module.

## Nextcloud-Test (vorübergehend)

`index.html` im Hauptordner ist zurzeit eine kleine Test-App: Verbindung zur eigenen Nextcloud, quadratische Aufnahme speichern, in mehrere Ordner speichern (auch eingebundene Sciebo-Ordner). Konten und Sciebo werden vorerst in der Nextcloud-Weboberfläche eingerichtet. Anleitung: [NEXTCLOUD-TEST.md](NEXTCLOUD-TEST.md). Im Code stehen keine Zugangsdaten. Nach dem Test wird die Datei durch die echte App ersetzt.

## Dokumente

| Dokument | Inhalt |
| --- | --- |
| [OVERVIEW.md](OVERVIEW.md) | Worum es geht, Ziele nach Zeithorizont, Nutzergruppen, Umfang |
| [DESIGN.md](DESIGN.md) | Gestaltungsprinzipien, Gesten, Overview-Bildschirm, offene Designfragen |
| [ETAPPEN.md](ETAPPEN.md) | Vier Etappen von der ersten Person bis zur übergreifenden Anwendung, Regeln, offene Entscheidungen |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Startweg mit eigener Nextcloud, Speicherrollen, Datenmodelle, Module, Phasen, Bauplan |
| [INFRASTRUCTURE.md](INFRASTRUCTURE.md) | Speicherbedarf und Kosten, Speicherklassen, Modelle, Sichtung, Teilnahme, Entscheidungen |
| [RESEARCH.md](RESEARCH.md) | Recherche zu SL2T, DGS-Projekten, Datensätzen, Mustern aus anderen Bereichen; Lehren aus der ersten Version |
| [VERLAUF.md](VERLAUF.md) | Projektverlauf (gleich wie im Claude-Projekt) |
| [Einladung/](Einladung/README.md) | Instagram-Karussell zur Einladung: drei Folienbilder und Beschreibung |
| [NEXTCLOUD-TEST.md](NEXTCLOUD-TEST.md) | Vorübergehend: Anleitung zur Nextcloud-Test-App im Hauptordner |

## Bausteine (geprüft, für die endgültige Version)

| Baustein | Was | Status |
| --- | --- | --- |
| [FREIGABE-AN-SCIEBO.md](FREIGABE-AN-SCIEBO.md), Code [freigabe.js](freigabe.js), Tests [freigabe.test.mjs](freigabe.test.mjs) | Nextcloud-Ordner per föderiertem Teilen in Sciebo sichtbar machen | im Test erfolgreich (27.10.2026) |

## Erste Version (`InitialVersion/`)

Eine PWA ohne Build-Schritt: `index.html`, `storage.js`, Service Worker, WebDAV-Proxy (`webdav-proxy.js`, Anleitung `WORKER.md`). Aufnehmen, Kontext vergeben, suchen, schneiden, zusammenfügen und per Ordner, Nextcloud/Sciebo oder Freigabelink speichern. Die Konzeptdokumente der ersten Version liegen im selben Ordner ([READme.md](InitialVersion/READme.md), [ARCHITECTURE.md](InitialVersion/ARCHITECTURE.md)).

Wichtig beim Hosting: Alle Pfade sind relativ, die App funktioniert also weiter, nur unter `…/InitialVersion/index.html`. Wer sie bisher über die Hauptadresse installiert hat, muss die neue Adresse öffnen und neu installieren.

## Arbeitsweise

- Kleine Schritte, jeweils mit Zweck, Schnittstelle und Test, damit jeder Baustein verständlich bleibt.
- Daten zuerst: Dateien und Begleitdatei sind die Wahrheit, alles andere ist neu berechenbar.
- Die erste Version bleibt Referenz. Was dort funktioniert, wird bewusst übernommen und nicht zufällig kopiert.
