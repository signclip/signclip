# Research

Stand: **Forschungsagenda, noch nichts davon recherchiert.** Aussagen unten sind Annahmen oder Fragen. Vor jeder Festlegung wird der aktuelle Stand geprüft (Versionen, Lizenzen, Genauigkeit) und hier mit Quelle und Datum eingetragen.

## Format für Ergebnisse

Jede geklärte Frage bekommt: Frage, Ergebnis, Quelle (Link), Datum, Konsequenz für Design oder Architektur.

## 1. Gebärdensprache und Daten

| Frage | Warum wichtig |
| --- | --- |
| Welche öffentlichen DGS-Korpora und Wörterbücher gibt es, unter welchen Lizenzen? | Referenz, Vergleich, mögliche Zusammenarbeit |
| Welche Annotationsstandards sind üblich (Glossen, HamNoSys, ELAN)? | Daten sollen mit Forschung zusammenpassen |
| Wie wird Variation (regional, individuell) in der Forschung beschrieben? | Struktur Begriff, Variante, Aufnahme |
| Welche Aufnahmebedingungen (Licht, Winkel, Abstand) brauchen Erkennungsmodelle? | Hinweise für Lernende beim Aufnehmen |

## 2. Erkennung und Ähnlichkeit

| Frage | Warum wichtig |
| --- | --- |
| Was leisten MediaPipe-Hand-, Pose- und Gesichts-Landmarks auf Telefon und Tablet (Geschwindigkeit, Genauigkeit)? | Machbarkeit auf dem Gerät |
| Wie gut taugen Landmark-Spuren für Ähnlichkeitssuche von Gebärden? | Kern der visuellen Suche |
| Welche Embedding-Modelle für Video und Bewegung gibt es, und wie lizenziert? | Auswahl hinter der Schnittstelle `analysis` |
| Wie weit trägt Erkennung bei Lernenden-Videos mit großer Variation? | Wert der ersten Lernendenvideos |
| Lässt sich eine fehlende Dimension (Text zu Video, Video zu Text) belastbar ergänzen? | Als Vorschlag kennzeichnen, nie still speichern |

Annahme: Video zu Text als zuverlässige Gebärdenübersetzung ist ungelöst. Das Ziel „Lexikon mit Suche nach Handform, Ort, Bewegung und Ähnlichkeit“ ist realistischer als Übersetzung. Zu prüfen.

## 3. Plattform

| Frage | Warum wichtig |
| --- | --- |
| Welche Grenzen hat Kamera und Mikrofon in der PWA auf iOS (Aufnahme mit gleichzeitiger Spracherkennung)? | Die erste Version umgeht den Mikrofon-Konflikt per Tastatur |
| Welche Systemgesten blockieren Wischen am Rand auf iOS und Android? | Gestenlayout |
| Wann lohnt eine native Hülle? | Stabilität gegen Aufwand |
| Wie verhalten sich WebDAV, CORS und Sciebo bei vielen gleichzeitigen Nutzenden? | Skalierung auf 20, dann 220 Personen |

Rechenbeispiel zur Größenordnung (Annahme, nicht gemessen): 220 Personen, täglich zehn Videos von je 5 Sekunden und etwa 5 MB ergeben rund 11 GB pro Tag. Echte Werte hängen von Auflösung und Kompression ab und sind zu messen.

## 4. Recht, Datenschutz, Ethik

| Frage | Warum wichtig |
| --- | --- |
| Welche Einwilligung braucht die Aufnahme von Personen (DSGVO), auch bei Übungsvideos? | Videos zeigen Gesicht und Körper |
| Was erlaubt Sciebo für geteilte Daten, und wer darf teilnehmen? | Teilen mit Lernenden außerhalb der Hochschule |
| Wie wird die Gebärdensprachgemeinschaft von Beginn an beteiligt? | Vertrauen, Qualität, Nutzen |
| Wer organisiert und bezahlt die Dolmetscher-Sichtung? | Bestimmt die Geschwindigkeit der Prüfung |
| Herkunftsnachweis für Aufnahmen (z. B. Content Credentials)? | Echtheit in einer Welt synthetischer Medien |

## 5. Lehren aus der ersten Version

Aus [InitialVersion/ARCHITECTURE.md](../InitialVersion/ARCHITECTURE.md) (bereits dort behoben oder festgehalten):

1. Bei MP4 liefert Chrome Daten erst beim Stoppen. Wer den Zustand vorher löscht, verliert den letzten Videoteil.
2. Ein Service Worker darf Cloud-Anfragen nicht cachen, sonst kommen veraltete Videos und Indexe.
3. Eine gemeinsame `index.json` wird von mehreren Personen überschrieben. Eine Begleitdatei pro Video vermeidet das.
4. Passwörter mit Sonderzeichen brauchen UTF-8-sichere Kodierung für die Anmeldung.
5. Zusammenfügen muss das Seitenverhältnis der Videos übernehmen.
6. Querformat-Verhältnisse schneiden bei gesperrtem Hochformat zwangsläufig viel aus.

Diese Punkte werden im Neustart zu Testfällen.

## Offene Vorarbeit

- [ ] Aktuelle Recherche zu DGS-Korpora, Annotationsstandards und MediaPipe durchführen und hier eintragen.
- [ ] Mit Dolmetschern und Gehörlosen über Aufnahmeregeln, Einwilligung und Prüfablauf sprechen.
- [ ] Testgeräte für iOS und Android festlegen und freie Gesten prüfen.
