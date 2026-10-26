# Overview

## Worum es geht

SignClip erfasst kurze und lange Aufnahmen (Video, Audio, Text) und macht sie über Kontext und später über visuelle Ähnlichkeit auffindbar. Der erste Anwendungsfall ist eine **Gebärdensprachbibliothek**: Lernende nehmen Gebärden auf, versehen sie mit Kontext, finden sie wieder und teilen sie. Dolmetscher sichten die Aufnahmen.

Die Bedienung ist auf **parallele Gesten** ausgelegt (Tippen, Halten, Wischen, Stichwörter, Videogesten) und soll später auch für digitale DGS-Eingabe taugen.

## Ziele nach Zeithorizont

| Horizont | Ziel |
| --- | --- |
| 2 Wochen | Grundlogik von Gesten und Speicherung, Capture und Suche in einer Overview; danach Nutzung durch mehrere mit direktem und nachträglichem Teilen |
| 1 Jahr | Persönlich nutzbare Gebärdensprachbibliothek; sicheres Backend für weitere Lernende; Projekt nach außen getragen; MediaPipe-gestützt Text zu Video und Video zu Text suchen und erzeugen; Oberfläche mit parallelen Gesten als Basis digitaler DGS-Eingabe |
| 10 Jahre | Capturing und Suche als weiter genutztes Design; Verbindung persönlicher multimodaler Wissensdatenbanken, die Ähnlichkeiten findet und Cluster bildet und beschreibt; als „wide Interface“ nutzbar |

## Nutzung wächst in Stufen

| Stufe | Personen | Prüft vor allem |
| --- | --- | --- |
| Heute | 1 | Aufnahmefluss, Gesten, Suche |
| ca. 1 Monat | 20 | Teilen, Einwilligung, Qualität, Sichtung durch Dolmetscher |
| wenige Monate | +200 | Speicherplatz, Duplikate, Last auf dem Speicher, Moderation |

## Rollen

- **Lernende** nehmen auf, vergeben Kontext, suchen, teilen.
- **Dolmetscher** sichten Einzelaufnahmen und ergänzen Korrekturen als eigene Spur, ohne das Original zu verändern.
- **Betreuende** richten Speicherorte und Freigaben ein.

## Geräte und Plattform

Smartphone und Tablet, iOS und Android. Später Brille, noch später räumliche Darstellung. Speicher über bestehende WebDAV-Server, Freigabe z. B. über Sciebo-Ordner.

## Umfang des Neustarts

Enthalten: Datenmodelle, Speicher mit Begleitdatei, Capture, Kontext, Suche, Gestensteuerung, Overview. Danach: mehrere Nutzer und Teilen, MediaPipe-Aufbereitung, Ähnlichkeit, Zusammenstellung, Prüfung durch Dolmetscher.

Nicht im Neustart: Übersetzung von Gebärdensprache in Text als Produktversprechen. Das bleibt ein Forschungsziel (siehe [RESEARCH.md](RESEARCH.md)).

## Was die erste Version schon gezeigt hat

- Der Ablauf Aufnehmen, Kontext, Suchen, Teilen trägt und ist per Gesten bedienbar.
- Eine Begleitdatei je Video (`<video>.json`) funktioniert mit mehreren Personen im selben Ordner, weil niemand eine gemeinsame Indexdatei überschreibt.
- Der größte Aufwand liegt in einer einzigen, stark verdichteten `index.html` mit globalen Variablen. Genau das soll der Neustart lösen.

Details stehen in [InitialVersion/ARCHITECTURE.md](../InitialVersion/ARCHITECTURE.md).
