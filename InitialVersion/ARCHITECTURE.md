# SignClip · Komponenten-Karte

Stand 26.10.2026, Branch `aufnahme-speicherorte`. Grundlage für das schrittweise Herauslösen aus `index.html`.

Die App ist eine PWA ohne Build-Schritt. Bis auf `storage.js` steckt alles in **einer** `index.html` (CSS ~190 Zeilen, Skript ~570 Zeilen, stark verdichtet). Alle Teile teilen sich globale Variablen; es gibt keine Module. Zeilennummern unten beziehen sich auf diesen Branch.

## Übersicht

| # | Baustein | Wo (index.html) | Kern-Zustand | Hängt ab von |
|---|---|---|---|---|
| 1 | **Layout + Stil** | `<style>` Z. 6–190 | – | – |
| 2 | **Aktionen + Gesten-Tabelle** | `ACT` Z. 232, `MAP` Z. 274, `runAct`, `swAct`, `bindSw` | `mode`, `CTX()` | fast alles (ruft Aktionen auf) |
| 3 | **Sprache** | `voice` Z. 295, `listen` Z. 467, Talk-Timer Z. 653 | `sr`, `talk`, `talkTo`, `daField` | 2, 5, 7 |
| 4 | **Hilfe-Generator** | `helpHtml`, `pagesHtml`, `miniPhone`, `navHtml`, `hints`, `edgeHints` | – | 2 |
| 5 | **Aufnahme** | Z. 317–344: `start`, `stop`, `fin`, `marker`, `schnitt`, `restart`, `weiter`, `togglePause`; `recSource`, `arDims`, `setAR` Z. 679–692 | `rec`, `pending`, `carryX`, `AR` | Kamera (6), Speicher (9) |
| 6 | **Kamera + Bewegung** | `initCam` Z. 436, `switchCam`, Bewegungs-Intervall (Freeze, Hand im Bild), `fitVideo` Z. 746 | `camOK`, `FACING`, `mot`, `still` | – |
| 7 | **Kontextfelder (Chips)** | `renderCf`, `cchip`, `grouped`, `tapChip`, `cfTap`, `cfDel`, `cfMove`, `routeWin`, `delLast`, Klammer `parseBr`/`ungroup` | `pending`, `rec.ctx`, `FREQ`, `PREF`, `marks` | 5, 8 |
| 8 | **Suche + Playlist** | Z. 345–370: `addTerm`, `rmTerm`, `play`, `match`, `nbs`; Alle-Clips `renderAll`, `sliders`, `renderRail`; Favoriten `addFav`, `favApply` | `terms`, `pl`, `idx`, `favs`, `letters` | 7 |
| 9 | **Speicher + Teilen** | **`storage.js`** (neu) + `saveAll`, `openShare`, `pickShare`, `shareFile`, `saveAs` Z. 387–413 | `Store` | 5, 8 |
| 10 | **Lokale Datenbank** | IndexedDB Z. 481–485 (`persist`), Passwort-Schlüssel `getKey/encPw/decPw` Z. 752 | `db`, `clips` | – |
| 11 | **Zusammenfügen** | `merge` Z. 372 | `busyT`, `lastMerge` | 8, 9 |
| 12 | **Zeitleiste + Schnitt** | `seekTo`, `seekY`, `zoom`, `splitAt`, Track-Pointer Z. 523 | `pos` | 8 |
| 13 | **Navigation** | Ränder `navNext/navPrev`, obere/untere Leiste, `setLw` (Spaltenbreite) | `lwi` | 5, 8 |

## Datenmodell (ein Clip)

```js
{ id, title, date, dur,
  s,            // Startzeit in der Videodatei (Schnitte teilen sich eine Datei)
  w, h,         // Bildgröße der Aufnahme (neu)
  ctx: [{ t, x, m, g }],   // t Zeitpunkt, x Text, m=1 Hauptkontext, g Klammer-Begriff
  mk: [sekunden],          // Marker
  blob, url, th,           // Video, Objekt-URL, Vorschaubild (dataURL)
  file,                    // Dateiname im Speicherort (neu, bleibt nach Neustart erhalten)
  lib, remote, tid, src, href   // nur Bibliotheks-Clips: Herkunft
}
```

## Speicher (storage.js) – was jetzt gilt

- Beliebig viele **Speicherorte**: Ordner auf dem Gerät, Nextcloud/Sciebo-Konto, freigegebener Ordner per Link (`…/s/CODE`).
- Bedienung nur mit Gesten auf der Karte: ↓ entfernen · ↑ ins Teilen-Menü · ← prüfen + immer speichern · 2× tippen ändern. **Umrandet** = jede Aufnahme wird dort gespeichert; ohne Rand erscheint der Ort im Teilen-Menü. Einziger Knopf „Neuer Speicherort“: → Cloud/Link, weit → Ordner. Art (Konto oder Freigabe) wird an der Adresse erkannt.
- Im **Teilen-Menü** erscheinen die Orte ohne Rand als Kachel; Sprache: Namen des Orts sagen.
- Pro Video wird `<video>.json` daneben geschrieben (Kontext, Marker, Schnitte, Größe). Kein Überschreiben einer gemeinsamen `index.json` mehr – mehrere Personen können in denselben Ordner schreiben. Alte `index.json` wird weiter gelesen.
- Kontext-Änderungen nach dem Speichern werden erkannt (Signatur) und nur die `.json` neu geschrieben, das Video nicht.
- Fehlgeschlagenes Speichern bleibt offen und wird wiederholt (alle 5 Minuten, bei `online`, nach Änderungen).
- Alte Einstellungen (eine WebDAV-Adresse, ein Ordner, Bibliotheksordner) werden beim ersten Start übernommen.

## Gefundene Fehler (in diesem Branch behoben)

1. **Letzter Videoteil ging verloren** (`start`): Bei MP4 liefert Chrome die Daten erst beim Stoppen, da war `rec` schon `null` → leere oder abgeschnittene Videos.
2. **Service Worker cachte Cloud-Anfragen**: WebDAV-GETs (Videos, `index.json`) wurden zwischengespeichert und veraltet ausgeliefert. Jetzt nur noch eigene App-Dateien; alte Caches werden gelöscht.
3. **`index.json` wurde komplett überschrieben** → in geteilten Ordnern verschwanden die Einträge anderer.
4. **Doppeltes Hochladen nach Neustart**: Der Merker hing am Blob (`blob.fid`), den IndexedDB nicht speichert.
5. **Sonderzeichen im Passwort**: Beim Hochladen wurde `btoa` ohne UTF-8 benutzt – Zeichen wie € brachen ab, Umlaute kamen falsch kodiert an.
6. **Zusammenfügen verzerrte**: feste Leinwand 640×480 (4:3) für Hochkant-Videos.
7. **Raster-Vorschaubilder** waren fest 9:16 statt im Originalverhältnis (R5).

## Noch offen / aufgefallen (nicht angefasst)

- **Doppelte Funktionen**, die spätere gewinnt: `openPl` (Z. 367 und 477), `th` (561 und 580), `playOne` (353 und 671). Die ersten sind toter Code.
- **CSS-Schichten**: Viele Regeln werden später überschrieben (`#mic` fünfmal, `#hn` mehrfach). Beim Herauslösen bereinigen.
- `#gear` ist versteckt, wird aber als Klick-Ziel für die Einstellungen benutzt.
- Löschen eines Clips entfernt ihn nicht aus Cloud/Ordner (bewusst noch nicht – braucht eine Entscheidung).
- Kontext-Änderungen an **fremden** Bibliotheks-Clips werden nicht zurückgeschrieben.
- **Querformat-Verhältnisse** (4:3, 16:9) schneiden aus dem Hochkant-Kamerabild aus, solange die App hochkant gesperrt ist (`manifest.json`). Für echtes Querformat muss das Gerät gedreht und die Sperre gelöst werden.

## Vorschlag: Reihenfolge fürs weitere Herauslösen

1. ~~Speicher~~ → `storage.js` (erledigt)
2. **Aufnahme + Kamera** (5, 6) → `capture.js` – klare Schnittstelle: `start/stop → Blob + Kontext`.
3. **Kontextmodell** (7, inkl. Klammer) → `context.js` – reine Datenlogik, gut testbar.
4. **Suche** (8, `match`, Synonyme) → `search.js` – Vorbereitung für MediaPipe-Ähnlichkeitssuche.
5. **Aktionen/Gesten** (2, 3, 4) bleiben als „Schaltzentrale“ in `index.html`.
6. CSS zuletzt, wenn die Struktur steht.
