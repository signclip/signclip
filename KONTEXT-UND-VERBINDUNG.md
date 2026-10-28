# Kontextmodell v1 und Verbindungsmodell

**Stand:** Entwurf vom 28.10.2026, zur Freigabe. Code: [kontext.js](kontext.js), [modell.js](modell.js). Tests als Erklärung: [kontext.test.mjs](kontext.test.mjs), [modell.test.mjs](modell.test.mjs). Ausführen: `node --test` im Hauptordner.

Beide Modelle kommen vor dem Design, weil sich die Oberfläche aus ihnen ergibt: Was die Umgebung um den Kern zeigt, ist genau das, was über Verbindungen am Kern hängt.

Mit **(Annahme)** markierte Stellen sind Vorschläge, die noch nicht entschieden sind. Jede steht auch in einem Test, damit sich eine Änderung sofort zeigt.

## 1. Die Idee in einem Satz

Jede Spur wird eigenständig gespeichert, mit **Wer** und **Wann**. Wie Spuren zusammengehören, steht in **Verbindungen**: *Was* bezieht sich *worauf*.

```
Was     { Spur (Name, berechnet aus, mit Modell) … }
Worauf  { Spur (Inhalt, wer, Herkunft) … }
```

Im Code heißen die Felder `what` und `about`. Die Feldnamen sind englisch, damit sie in jeder Sprache gleich bleiben; angezeigt wird die Bezeichnung aus der Tabelle `BEZEICHNUNG` (Abschnitt 7).

## 2. Spur

Eine Spur ist eine Datenreihe einer Aufnahme. Jede Spur darf fehlen.

| Feld | Bedeutung |
| --- | --- |
| `id` | Name der Spur in der Aufnahme, z. B. `visual`, `ctx`, `lm-hand` |
| `kind` | `visual`, `audio`, `text`, `landmarks`, `mask` |
| `by`, `at` | wer, wann (Nextcloud-Konto `benutzer@server`, Zeit in UTC) |
| genau eins von: `file`, `content`, `chips`, `derived` | woher die Daten kommen |

**Bild und Ton aus einer MP4.** Eine MP4 enthält Bild und Ton bereits als zwei getrennte Ströme. Deshalb muss nichts doppelt gespeichert werden: Die Aufnahme bleibt eine Datei, und es gibt zwei Spuren, die mit `stream: "video"` bzw. `stream: "audio"` auf denselben Container zeigen. Wird der Ton später einzeln gebraucht, lässt er sich ohne Qualitätsverlust herauslösen (Umverpacken statt Neukodieren) und als eigene Datei ablegen. Das ändert nur das Feld `file` der Spur, nicht die Verbindungen.

**Text** trägt immer `lang` (Sprache) und `origin` (Herkunft): `typed` getippt, `spoken` gesprochen, `history` aus der Historie, `storage` aus dem Speicher, `preset` Vorauswahl, `category` Kategorie, `predicted` vorhergesagt. Kontext steht als `chips` in einer Textspur (Abschnitt 5).

**Berechnete Spuren** (Landmarks, Masken für das Glätten) tragen `derived`:

```json
{ "id": "lm-hand", "kind": "landmarks", "by": "lena@…", "at": "2026-10-28T09:11:00Z",
  "derived": { "from": [{ "rec": "20261028T0910-b7c2", "track": "visual" }],
               "model": { "name": "mediapipe-hand-landmarker", "version": "0.10.14" },
               "params": { "fps": 30 } } }
```

Ohne Modell und Version ist eine berechnete Spur ungültig, sonst lässt sie sich nie neu berechnen. Die Daten liegen in `derived/<aufnahme>.<spur>.json`, getrennt vom Original.

## 3. Verweis: zeitlich und räumlich

Ein Verweis zeigt auf eine Spur und darin optional auf einen Ausschnitt.

```json
{ "rec": "20261028T1002-c9d4", "track": "visual", "from": 400, "to": 1800,
  "region": { "landmarks": ["hand_right"] } }
```

- **zeitlich:** `from`, `to` in Millisekunden ab Beginn der Aufnahme
- **räumlich:** `region` mit Landmark-Gruppen oder einem Rahmen `box: [x, y, b, h]` von 0 bis 1

## 4. Verbindung

| Art (`kind`) | Was → Worauf | Pflicht |
| --- | --- | --- |
| `describes` | Text oder Audio → Bild (z. B. Kontext) | – |
| `version` | eigene Aufnahme → Aufnahme eines anderen | `binding`: `dependent` (nach Vorlage) oder `independent` (frei, Bedeutung später) |
| `similar` | gefundene Spur → Spur, von der aus gesucht wurde (Woher) | `model`, `score` |
| `translation` | Text → Text in anderer Sprache | – |
| `review` | Prüfung → geprüfte Spur, überschreibt nie | – |
| `edit` | eigene Änderung → gefundene Spur nach einer Suche | – |

### Die Fälle aus der Nutzung

| Fall | So wird es gespeichert | Test |
| --- | --- | --- |
| Aufnehmen mit Kontext | Textspur `ctx` + `describes` auf `visual` | „Kontext: Was = Textspur …“ |
| Landmarks berechnen | Spur mit `derived` in `derived/` | „Landmarks sind berechnet …“ |
| Visuell zu visuell suchen | `similar`: Was = Treffer (Landmarks), Worauf = eigene Landmarks mit Ausschnitt, Modell und Wert | „Suche Bild zu Bild …“ |
| Lernen | Line mit Verweisen; vorausgewählte Texte über `origin: "preset"` | „Lernen: vorausgewählte Texte …“ |
| Eigene Änderung nach Suche | neue Textspur + `edit` auf den gefundenen Text | „Eigene Änderung …“ |
| Version von anderen | `version` mit `binding` | „Eigene Version …“ |
| Dozent sucht, von wem | Filter `vonWem(aufnahmen, personen)` | „Dozent sucht …“ |

Suchergebnisse werden **nur gespeichert, wenn etwas mit ihnen passiert** (in eine Line legen, bestätigen, ändern). Sonst sind sie neu berechenbar.

## 5. Kontextmodell v1

Ganz oben stehen die Chips. Alle Chips einer Aufnahme liegen auf einer Ebene. Es gibt nur den Begriff **Context**; alles Weitere beschreibt die Art der Klammer.

| Eingabe | Ergebnis |
| --- | --- |
| `Frucht (Banane Erdbeere)` | „Frucht Banane“, „Frucht Erdbeere“ |
| `Frucht (Banane Erdbeere) essen` | „Frucht Banane essen“, „Frucht Erdbeere essen“ **(Annahme)** |
| `Frucht (rote Beere, Banane)` | Komma trennt Einträge aus mehreren Wörtern **(Annahme)** |
| `[Anna Lena]` | A-N-N-A L-E-N-A, Leerzeichen bleibt Leerzeichen |
| `[Anna] Köln [Weg]` | ganzes Wort durch Schließen und Wiederöffnen |
| `[Anna (Köln) Weg]` | ganzes Wort durch runde Klammer in der eckigen |

Die beiden Wege, ein ganzes Wort herauszuziehen, ergeben im Modell **dasselbe**. Die offene Frage ist also nur eine der Eingabe: was sich mit Gesten leichter tippen lässt. Beide werden angenommen, bis entschieden ist.

**Serie:** Bei einer Serie wird der Inhalt der runden Klammer herausgenommen, jede Aufnahme bekommt der Reihe nach einen Eintrag **(Annahme, wie „herausgenommen“ gemeint ist)**. Ein Chip ohne runde Klammer gilt für alle.

**Cluster** ergeben sich aus den Klammern: Das Wort vor der runden Klammer fasst ihren Inhalt zusammen (`Frucht: Banane, Erdbeere, Apfel`). **Kategorien** werden nachträglich vergeben oder vorhergesagt und sind Textspuren mit `origin: "category"` bzw. `"predicted"` (dann mit Modell).

**Mehrsprachigkeit im Kontext:** Ein Chip steht in der Sprache seiner Textspur (`lang`). Eine Übersetzung ist eine weitere Textspur mit `translation`-Verbindung. Gebärdensprache als Feld (DGS, ÖGS, DSGS) folgt in der Aufnahme, sobald die Regel 3 aus [ETAPPEN.md](ETAPPEN.md) umgesetzt wird.

## 6. Kern und Umgebung

**Kern** ist die Aufnahme, die gerade gesucht oder gespeichert wird. **Umgebung** ist alles, was über Verbindungen am Kern hängt, aus allen bekannten Dateien, gruppiert nach Art der Verbindung (`umgebung(kernId, aufnahmen)`).

Für das Design heißt das: Jede Art bekommt eine **feste Position** um den Kern (z. B. Kontext oben, Versionen anderer links, Ähnliches rechts, Prüfung unten) und lässt sich je Nutzungsweg ein- und ausblenden. Die Umgebung funktioniert in beide Richtungen: Die Vorlage sieht die Versionen der Lernenden, die Lernenden sehen die Vorlage.

## 7. Dateien und Regeln

```
<id>.mp4                       Original, Bild und Ton als zwei Ströme
<id>.json                      Aufnahme: Spuren und Verbindungen dieser Person (schema sign-recording/1)
derived/<id>.<spur>.json       berechnete Spuren, jederzeit neu berechenbar
lines/<id>.line.json           Line: Zusammenstellung aus Verweisen (schema sign-line/1)
```

1. **Eine Datei, eine Person.** Alles in `<id>.json` hat denselben Urheber. Wer sich auf fremde Aufnahmen bezieht, legt die Verbindung in der eigenen Datei an. So können viele Personen in denselben Ordner schreiben, ohne sich zu überschreiben (bewährt aus der ersten Version).
2. **Original bleibt.** Berechnetes, Prüfungen und Änderungen kommen dazu, nichts wird ersetzt.
3. **IDs sind unabhängig vom Speicherort**: Zeitstempel plus Zufall, z. B. `20261028T0910-b7c2`. Wo die Datei liegt (lokal, Nextcloud, Sciebo), weiß der Index, nicht die Verbindung.
4. **Sprachneutrale Schlüssel.** Gespeichert wird `dependent`, angezeigt „abhängig“. Neue Sprache = neue Spalte in `BEZEICHNUNG`.

## 8. Offen

1. Runde Klammer: Gilt das, was **nach** der Klammer steht, auch für jede Lesart? (Annahme: ja)
2. Runde Klammer mit Einträgen aus mehreren Wörtern: Komma als Trenner? (Annahme: ja)
3. Serie: Ist „herausgenommen“ so gemeint, dass jede Aufnahme der Reihe nach einen Eintrag bekommt?
4. Ganzes Wort in eckiger Klammer: Weg A oder B als Eingabe zeigen? Im Modell sind beide gleich.
5. Fingeralphabet: Werden Buchstabenfolgen wie SCH als eigenes Zeichen geführt? Mit Gebärdenden prüfen.
6. Wo liegt der Index, der Umgebung und Suche schnell macht (siehe [ARCHITECTURE.md](ARCHITECTURE.md), offene Frage 3)? Er ist aus den Dateien neu aufbaubar.
7. Aufnahmen alter Form (`<video>.json` der ersten Version) werden beim Lesen in dieses Schema übersetzt. Der Leser dafür ist der nächste Baustein.
