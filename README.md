# SignClip

Multimodales Erfassen, Finden und Teilen, zuerst für eine persönliche Gebärdensprachbibliothek (DGS), später als gemeinsame Bibliothek für Lernende und Dolmetscher.

**Stand:** Neustart. Die erste Version liegt unverändert in [`InitialVersion/`](InitialVersion/) und läuft dort weiter. Die neue App wird hier in `main` Schritt für Schritt von Grund auf gebaut, mit Fokus auf langlebige Datenmodelle und austauschbare Module.

## Nextcloud-Test (vorübergehend)

`index.html` im Hauptordner ist zurzeit eine kleine Test-App: Verbindung zur eigenen Nextcloud, quadratische Aufnahme speichern, Sciebo-Freigabe einbinden, Konten anlegen und per Einladungslink anmelden. Anleitung: [docs/NEXTCLOUD-TEST.md](docs/NEXTCLOUD-TEST.md). Im Code stehen keine Zugangsdaten. Nach dem Test wird die Datei durch die echte App ersetzt.

## Dokumente

| Dokument | Inhalt |
| --- | --- |
| [docs/OVERVIEW.md](docs/OVERVIEW.md) | Worum es geht, Ziele nach Zeithorizont, Nutzergruppen, Umfang |
| [docs/DESIGN.md](docs/DESIGN.md) | Gestaltungsprinzipien, Gesten, Overview-Bildschirm, offene Designfragen |
| [docs/ETAPPEN.md](docs/ETAPPEN.md) | Vier Etappen von der ersten Person bis zur übergreifenden Anwendung, Regeln, offene Entscheidungen |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Datenmodelle, Module, Abhängigkeiten, Bauplan in kleinen Schritten |
| [docs/RESEARCH.md](docs/RESEARCH.md) | Forschungsfragen, Annahmen, was noch zu prüfen ist |
| [docs/NEXTCLOUD-TEST.md](docs/NEXTCLOUD-TEST.md) | Vorübergehend: Anleitung zur Nextcloud-Test-App im Hauptordner |

## Erste Version (`InitialVersion/`)

Eine PWA ohne Build-Schritt: `index.html`, `storage.js`, Service Worker, WebDAV-Proxy. Aufnehmen, Kontext vergeben, suchen, schneiden, zusammenfügen und per Ordner, Nextcloud/Sciebo oder Freigabelink speichern. Die Konzeptdokumente der ersten Version liegen im selben Ordner ([READme.md](InitialVersion/READme.md), [ARCHITECTURE.md](InitialVersion/ARCHITECTURE.md)).

Wichtig beim Hosting: Alle Pfade sind relativ, die App funktioniert also weiter, nur unter `…/InitialVersion/index.html`. Wer sie bisher über die Hauptadresse installiert hat, muss die neue Adresse öffnen und neu installieren.

## Arbeitsweise

- Kleine Schritte, jeweils mit Zweck, Schnittstelle und Test, damit jeder Baustein verständlich bleibt.
- Daten zuerst: Dateien und Begleitdatei sind die Wahrheit, alles andere ist neu berechenbar.
- Die erste Version bleibt Referenz. Was dort funktioniert, wird bewusst übernommen und nicht zufällig kopiert.
