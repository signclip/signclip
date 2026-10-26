# Design

Dieses Dokument trennt, was aus der ersten Version **gesetzt** ist, was **neu vorgeschlagen** wird und was **offen** bleibt. Quelle der gesetzten Regeln: [InitialVersion/READme.md](../InitialVersion/READme.md).

## Gesetzt (aus der ersten Version übernommen)

| Nr. | Regel |
| --- | --- |
| R1 | Pro Aufgabe genau ein Touch-Pfad. Stichwort, Kamera-Geste und Wartezeit lösen dieselbe Aktion aus, sie sind kein zweiter Ablauf. |
| R2 | Richtung = Bedeutung, in beiden Modi gleich: oben Next, unten Before, links Another, rechts Share. |
| R3 | Häufiges liegt in der Mitte und im Wischen von der Mitte, Seltenes hinter Halten, Randleisten oder Einstellungen. |
| R4 | Möglichst keine zusätzlichen Buttons. |
| R5 | Videos und Vorschaubilder immer im Originalseitenverhältnis. |
| R6 | Aufnahme im eingestellten Seitenverhältnis, Standard 9:16 Hochformat. |
| R7 | Speichern und Verwerfen geben deutliche Rückmeldung. |
| R8 | Material 3, Pastell, SVG-Icons, keine Emojis als Symbole. |
| R9 | Hinweise und Hilfe werden aus einer Tabelle erzeugt: neue Aktion = eine Zeile. |

Zwei Modi, nur am Pastellrand erkennbar: **Aufnahme** (Korall) und **Suche** (Blau). Kontext hat zwei Ebenen: **Hauptkontext** (bleibt für eine Serie) und **Kontext** (gilt für den aktuellen Clip).

## Prinzipien für die Langzeitnutzung

1. **Gesten sind Absichten.** Next, Before, Another, Share, More Context sind abstrakt definiert und werden pro Gerät auf Touch, Stichwort, Videogeste oder später Brille abgebildet. So überlebt das Vokabular jede Hardware.
2. **Eine Tabelle als Quelle.** Aktionen und Gesten stehen in einer Tabelle (R9). Hilfe, Hinweise und Tests entstehen daraus.
3. **Alles erreichbar ohne Ton.** Audio ist ein Eingabekanal, nie die einzige Möglichkeit.
4. **Modus sichtbar, nicht beschriftet.** Der Rand zeigt den Modus. Zusätzlicher Text nur bei gehaltener Eigenschaft.
5. **Zugänglichkeit von Anfang an.** Kontrast nach WCAG AA, große Trefferflächen, Alternative für jede Geste. Gebärdende Nutzende prägen das Design mit.
6. **Rückmeldung bei jedem Zustandswechsel**, visuell und haptisch, nie nur akustisch.

## Der Overview-Bildschirm (Zielbild)

Ein Bildschirm, alles Weitere öffnet sich als Schicht darüber. Auf dem Tablet bleibt die Ergebnisfläche links und rechts öffnet sich ein Detailbereich, auf dem Telefon kommt derselbe Inhalt von unten.

| Zone | Inhalt |
| --- | --- |
| Kopf | Suchfeld und Kontext-Chips |
| Mitte | Ergebnisfläche mit Vorschaubildern im Originalverhältnis |
| Fuß | Aufnahme, Suchfeld über die volle Breite, Playlist-Kontext |
| Rand | Filter für Länge und Datum, Favoriten |

Die detaillierte Anordnung unten im Suchmodus steht in [InitialVersion/READme.md](../InitialVersion/READme.md), Abschnitt 7.3, und gilt als Ausgangspunkt.

## Neu vorgeschlagen (noch nicht entschieden)

Diese Punkte stammen aus Gesprächen zum Neustart und sind **nicht** mit den gesetzten Regeln abgeglichen.

1. **Parallele Gesten:** Eine Hand hält eine Eigenschaft (Text, Bild, Audio, Zeit und Ort), die andere führt die Aktion aus. Beispiel: Text halten und aufnehmen fügt Text hinzu, Text halten und in die Ergebnisse wischen sucht von diesem Text aus. Das erweitert „Hold • More Context“ der ersten Version von einer Eigenschaft (Sprache) auf mehrere.
2. **Statuszeile** mit dem aktiven, gehaltenen Modus. Die erste Version zeigt den Modus nur über den Rand und das grün umrandete gehaltene Element.
3. **Sichtungsansicht für Dolmetscher** als eigene schlanke Oberfläche: Warteschlange, Video, Vorschlag, Bestätigen oder Korrigieren.
4. **Eigenschaftsspuren** (Text, Bild, Audio, Zeit und Ort) als gleichberechtigte Zeilen im Eintrag. Eine darf fehlen.

## Offene Designfragen

Übernommen aus der ersten Version (Abschnitt 11) und ergänzt:

1. Höhe der Kontextfelder: zwei Zeilen mit Scrollen oder mehr?
2. Wischen nach oben in der Aufnahme: Hauptkontext ebenfalls leeren oder behalten?
3. Timeline: ganz in die Vorschaubilder verlegen oder eine kurze Zoom-Anzeige behalten?
4. Klammer-Konzept: Soll `Frucht[Banane Erdbeeren]` bei der Suche als ODER wirken? Welche Geste markiert ein Wort für eine neue Klammer?
5. Einfügen an beliebiger Stelle im Chip-Feld: durch Tippen auf die Stelle oder zwischen zwei Chips?
6. Favoriten-Ablage: oben als Zeile oder am linken Spaltenkopf?
7. Videogesten mit MediaPipe: zuerst als Web-Version oder erst mit nativer Hülle?
8. **Neu:** Bleibt „Richtung = Bedeutung“ die Grundlage, und kommen parallele Gesten als Erweiterung dazu, oder ersetzen sie sie?
9. **Neu:** Welche Gesten sind auf iOS und Android frei von Systemgesten? Das ist auf Testgeräten zu klären.
10. **Neu:** Wie sieht eine Oberfläche für gehörlose Nutzende aus, die ohne Audio-Stichwörter arbeiten? Das braucht Beteiligte aus der Gebärdensprachgemeinschaft.

## Aus der ersten Version für den Neustart zu entscheiden

Die erste Version hat eine ausgearbeitete Gestentabelle für Aufnahme und Suche (Abschnitte 6.2 und 7.4). Im Neustart wird sie zuerst als **Daten** (Tabelle Aktion × Geste × Modus) modelliert, damit Änderungen keine Codeänderung brauchen. Siehe [ARCHITECTURE.md](ARCHITECTURE.md), Modul `interaction`.
