# Architektur: Modelle und Module

Ziel: wenige, klare Datenmodelle, die Jahrzehnte überdauern, und austauschbare Module darum herum. Die Komponentenkarte der ersten Version steht in [InitialVersion/ARCHITECTURE.md](InitialVersion/ARCHITECTURE.md) und nennt 13 Bausteine, die in einer `index.html` über globale Variablen verbunden sind. Der Neustart trennt sie.

## Leitlinien

1. **Daten zuerst.** Dateien und Begleitdatei in offenen Formaten sind die Wahrheit. Index, Embeddings und Vorschaubilder sind neu berechenbar.
2. **Versioniertes Schema.** Jede Begleitdatei trägt `schema`-Version. Alte Versionen bleiben lesbar, auch die der ersten Version (`<video>.json`, ältere `index.json`).
3. **Abhängigkeiten zeigen nach innen.** Oberfläche kennt Logik, Logik kennt Modelle, Modelle kennen nichts.
4. **Reine Logik ist testbar.** Modelle, Kontext, Suche und Gestentabelle laufen ohne Browser.
5. **Technik hinter Schnittstellen.** Kamera, Speicher, Spracherkennung und MediaPipe sind Adapter. Ein Wechsel ändert nur den Adapter.
6. **Kein Build-Schritt am Anfang.** ES-Module direkt im Browser, wie die erste Version ohne Werkzeugkette. Ein Build kommt, wenn er einen Nutzen belegt.

## Kernmodelle

> Abgelöst durch [KONTEXT-UND-VERBINDUNG.md](KONTEXT-UND-VERBINDUNG.md) (28.10.2026). Die Tabelle bleibt als Ausgangspunkt stehen, bis das neue Modell freigegeben ist.

| Modell | Zweck | Wichtige Felder |
| --- | --- | --- |
| **Entry** (Eintrag) | Eine Aufnahme mit allem Zugehörigen | `id`, `author`, `created`, `tracks[]`, `context`, `markers[]`, `status`, `session?`, `segment?`, `term?`, `variant?`, `rights` |
| **Track** (Spur) | Eine Datenspur eines Eintrags | `kind` (`video`, `audio`, `text`, `landmarks`, `annotation`), `file`, `range?`, `derivedFrom?`, `model?` |
| **Context** | Kontext des Eintrags | `main[]` (bleibend), `local[]` (nur dieser Clip), je Tag: `text`, `time?`, `group?` |
| **Location** (Speicherort) | Wo gespeichert und geladen wird | `kind` (`folder`, `webdav`, `share`), `name`, `saveAlways` |
| **Playlist** | Geordnete Auswahl und Schnitte | `items[]` mit `entryId`, `from`, `to` |
| **Review** (Prüfung) | Korrektur durch Dolmetscher | `entryId`, `reviewer`, `date`, `changes`, als eigene Spur, überschreibt nie |
| **Rights** | Einwilligung und Lizenz | `consent`, `license`, `visibility` |

Regel für Spuren: Jede Spur darf fehlen. Ein Eintrag mit nur Text ist gültig, ebenso einer mit nur Video. Das trägt später die Ergänzung einer fehlenden Dimension.

Bezeichnungen **Begriff** (Bedeutung), **Variante** (regional, individuell) und **Aufnahme** bilden eine optionale Struktur für viele Variationen. Zuordnung kommt aus der Prüfung, nicht aus der Aufnahme.

## Dateilayout je Eintrag

```
<name>.mp4              Videospur
<name>.json             Begleitdatei: Metadaten, Kontext, Marker, Schnitte
<name>.landmarks.json   MediaPipe-Spur (später)
<name>.review.json      Prüfung (später)
```

Das entspricht dem bewährten Muster der ersten Version: eine Begleitdatei pro Video, kein gemeinsames Index-File, mehrere Personen können in denselben Ordner schreiben.

## Module

| Modul | Aufgabe | Hängt ab von | Reine Logik? |
| --- | --- | --- | --- |
| `model` | Typen, Schema, Validierung, Migration alter Formate | – | ja |
| `context` | Tags, Hauptkontext und Kontext, Klammern, Zerlegung von Sätzen | `model` | ja |
| `search` | Treffer, Synonyme, Reihenfolge; später Ähnlichkeit | `model`, `context` | ja |
| `interaction` | Tabelle Aktion × Geste × Modus, Absichten, Hilfe aus Tabelle | `model` | ja |
| `storage` | Schnittstelle `list / read / write` mit Adaptern Ordner, WebDAV, Freigabelink | `model` | nein (I/O) |
| `capture` | Kamera und Mikrofon, Aufnahme zu Blob und Meta | `model` | nein (I/O) |
| `speech` | Stichwörter und Sprache zu Text | `interaction` | nein (I/O) |
| `analysis` | MediaPipe-Landmarks, Embeddings, hinter einer Schnittstelle | `model` | teils |
| `compose` | Schnitte, Zusammenfügen, Übergänge glätten | `model`, `storage` | teils |
| `ui` | Ansichten Aufnahme, Suche, Sichtung, Einstellungen | alle oben | nein |
| `app` | Verdrahtung, Start, Einstellungen | alle | nein |

Abhängigkeitsrichtung: `app → ui → (interaction, search, context, capture, speech, storage, compose, analysis) → model`.

## Schnittstellen (Skizze)

```js
// storage: jeder Adapter bietet dasselbe
{ list(path) -> [{name, size, modified}],
  read(name) -> Blob | string,
  write(name, data) -> void }

// capture
{ start(opts) -> void, stop() -> { blob, width, height, duration } }

// analysis
{ landmarks(video) -> Track, embed(track) -> { vector, model } }
```

Jedes Embedding speichert die **Modellversion**, damit sich alles später neu berechnen lässt.

## Bauplan in kleinen Schritten

Jeder Schritt hat einen Zweck, ein Ergebnis, das man anfassen kann, und etwas, das man dabei versteht.

| Schritt | Ergebnis | Man versteht danach |
| --- | --- | --- |
| 0 | Ordner `app/` mit leerer Seite, Service Worker, Manifest | Wie die PWA startet und offline läuft |
| 1 | `model` mit Schema, Validierung, Test, Leser für alte `<video>.json` | Was ein Eintrag ist und wie Altes lesbar bleibt |
| 2 | `storage` mit Ordner-Adapter | Wie Dateien lokal geschrieben und gelesen werden |
| 3 | `storage` mit WebDAV-Adapter, gleiche Tests | Warum Adapter austauschbar sind (CORS, Proxy) |
| 4 | `capture`: ein Video aufnehmen und als Eintrag speichern | Kamera, Format (MP4/WebM), Seitenverhältnis |
| 5 | `context`: Tags, Haupt- und lokaler Kontext, Tests | Reine Logik ohne Oberfläche |
| 6 | `search`: Treffer über Kontext, Synonyme | Wie Suche aus den Modellen entsteht |
| 7 | `interaction`: Gestentabelle als Daten, Hilfe daraus | Wie Gesten zu Absichten werden |
| 8 | `ui`: Overview mit Suche, Ergebnisfläche, Aufnahme | Alles zusammen in einem Bildschirm |
| 9 | Mehrere Nutzende: Freigabe, Rechte, Einwilligung | Teilen ohne Konflikte |
| 10 | `analysis`: MediaPipe-Landmarks als Spur | Abgeleitete Daten neben dem Original |
| 11 | Ähnlichkeit, Zusammenstellung, Charaktervariation | Von der Spur zur Suche nach Ähnlichem |

Die Schritte 0 bis 8 entsprechen dem Ziel der ersten zwei Wochen. 9 bis 11 folgen danach.

## Offene Architekturfragen

1. Reichen ES-Module ohne Build, oder braucht die Zusammenstellung (`compose`) von Anfang an WebAssembly (z. B. zum Zusammenfügen)?
2. Native Hülle (Capacitor oder Eigenentwicklung) für stabile Kamera und Ton auf iOS: wann? Die erste Version nennt das als zweiten Weg.
3. Wo lebt der lokale Suchindex (IndexedDB oder SQLite im Browser), und wie wird er aus den Dateien neu aufgebaut?
4. Wie viel Kontext pro Eintrag ist Pflicht für den Export?
5. Rechte und Einwilligung: Wer darf ändern, wer nur lesen, und wo wird das erzwungen, wenn der Speicher ein einfacher WebDAV-Ordner ist?
