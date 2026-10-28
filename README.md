# SignClip

> **Als Nächstes:** Kontext- und Verbindungsmodell anschauen und freigeben ([KONTEXT-UND-VERBINDUNG.md](KONTEXT-UND-VERBINDUNG.md), offene Punkte in Abschnitt 8). Danach das Design auf dem Modell aufbauen.

Multimodales Erfassen, Finden und Teilen, zuerst für eine persönliche Gebärdensprachbibliothek (DGS), später als gemeinsame Bibliothek für Lernende und Dolmetschende. Die erste Version liegt in [`InitialVersion/`](InitialVersion/) und läuft dort weiter (neue Adresse `…/InitialVersion/index.html`, wer sie installiert hat, installiert sie dort neu). Die neue App entsteht hier Schritt für Schritt von Grund auf.

## Etappen

| Etappe | Kreis | Kern |
| --- | --- | --- |
| **1 Lernen und Ablegen** ← jetzt | einzelne Personen | Aufnehmen, Speichern in der eigenen Nextcloud, Wiederfinden im Browser |
| **2 Hochschulraum und App** | Lernende und Lehrende | Lern-App, lokal speichern, Referenzen, Landmarks, Glätten, Echtzeit-Suche |
| **3 Weiterer Kreis und Gesprächswelle** | weiterer Kreis | DGS-Suite: Lernen, Glätten, Modellieren |
| **Welle SL2T** | nur mit eigener Einwilligung | separater Trainingsschritt |
| **4 Wohin weiter** | offen | andere Anwendungen für Oberfläche und Modelle |

Details, Regeln und offene Entscheidungen: [ETAPPEN.md](ETAPPEN.md)

## Bausteine

**geprüft** = im echten Test erfolgreich · **im Test** = gebaut, Tests laufen, wartet auf Prüfung oder Freigabe · **geplant** = noch nicht gebaut

| Baustein | Dateien | Stand |
| --- | --- | --- |
| Nextcloud-Ordner in Sciebo sichtbar machen | [FREIGABE-AN-SCIEBO.md](FREIGABE-AN-SCIEBO.md), [freigabe.js](freigabe.js), [Tests](freigabe.test.mjs) | geprüft (27.10.2026) |
| Nextcloud-Test-App: anmelden, aufnehmen, in mehrere Ordner speichern | [index.html](index.html), [NEXTCLOUD-TEST.md](NEXTCLOUD-TEST.md) | im Test, wird später ersetzt |
| Kontextmodell v1 (Chips, Klammern, Serie, Cluster) | [kontext.js](kontext.js), [Tests](kontext.test.mjs) | im Test |
| Verbindungsmodell (Spuren, Verweise, Kern und Umgebung, Line) | [modell.js](modell.js), [Tests](modell.test.mjs), [Erklärung](KONTEXT-UND-VERBINDUNG.md) | im Test |
| Leser für Aufnahmen der ersten Version | – | geplant |
| Designsystem (Kern und Umgebung, feste Positionen, parallele Gesten, Farben, Schrift) | – | geplant, nach Freigabe des Modells |
| Einladung: Konto, Willkommens-Mail, Anmelden, Sciebo verbinden | Entwurf (Einladungs-Karussell) im Claude-Projekt | geplant |
| Eigene Domain für App und Nextcloud | – | geplant, kann parallel laufen |
| Ressourcen-Bereich (Nachricht, Unterstützung über PayPal) | – | geplant (Etappe 1) |
| Glätten als Rechenschritt in `derived/` | – | geplant (Etappe 2) |

Alle Tests auf einmal: `node --test` im Hauptordner.

## Ressourcen

**Dokumente**

| Dokument | Inhalt |
| --- | --- |
| [OVERVIEW.md](OVERVIEW.md) | Worum es geht, Ziele nach Zeithorizont, Rollen |
| [ETAPPEN.md](ETAPPEN.md) | Etappen, Regeln, offene Entscheidungen |
| [KONTEXT-UND-VERBINDUNG.md](KONTEXT-UND-VERBINDUNG.md) | Kontextmodell und Verbindungsmodell |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Module, Abhängigkeiten, Bauplan |
| [DESIGN.md](DESIGN.md) | Gestaltungsregeln, Gesten, offene Designfragen |
| [RESEARCH.md](RESEARCH.md) | Forschungsfragen und Annahmen |
| [VERLAUF.md](VERLAUF.md) | Was wann entschieden und gebaut wurde |
| Im Claude-Projekt „Sign“, noch nicht im Repo | `architektur.md`, `infrastructure.md`, `research.md` |

**Quellen**

- MediaPipe Hand Landmarker: [ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)
- Anbieter-Stand (SL2T, Apple): Links in [ETAPPEN.md](ETAPPEN.md), Abschnitt „Partner und Anbieter“
- Erste Version mit Konzept: [InitialVersion/READme.md](InitialVersion/READme.md), [InitialVersion/ARCHITECTURE.md](InitialVersion/ARCHITECTURE.md)

**Werkzeuge**

| Werkzeug | Wofür |
| --- | --- |
| Eigene Nextcloud (Hetzner, 1 TB) | Speicher, Konten, Gruppe „Sign-Students“ |
| Sciebo (Uni Köln) | Hochschulordner, eingebunden per föderierter Freigabe |
| GitHub (dieses Repo, GitHub Pages) | Code, Dokumente, Hosting der Web-App |
| Node.js | nur zum Ausführen der Tests |
| Logseq | Notizen und Ideen |

## Arbeitsweise

- Kleine Schritte, jeweils mit Zweck, Schnittstelle und Test, damit jeder Baustein verständlich bleibt.
- Daten zuerst: Dateien und Begleitdatei sind die Wahrheit, alles andere ist neu berechenbar.
- Was ins Hauptprojekt geht, wird vorher angeschaut und freigegeben.
- Im Code stehen keine Zugangsdaten.
