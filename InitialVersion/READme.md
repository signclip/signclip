# SignClip: Anforderungen und Designkonzept

Stand 19. Oktober 2026. Zusammenstellung Konzeptidee und Design - Specialized Implementation a wide Interacting Design Idea.

KontextParallelität von Gesten

Implemented with Claude
and Love
mainly Claude :)



**Now**
EINMALIG: Alle Dateien in einen Ordner auf ein statisches HTTPS-Hosting legen (GitHub Pages, Netlify oder Cloudflare Pages, kostenlos).
INSTALLIEREN: Adresse am Handy öffnen. 
iPhone: Safari > Teilen > Zum Home-Bildschirm. 
Android: Chrome > App installieren.
DANACH: läuft offline, alle Daten bleiben auf dem Gerät. 
UPDATE: index.html (und ggf. sw.js) ersetzen. Die App aktualisiert sich beim nächsten Start von selbst.
ERWEITERN: In index.html die Tabelle ACT (Aktionen) und MAP (Gesten) ändern. Hilfe und Steuerungshinweise entstehen automatisch.
SICHERUNG: Videos in der App Share > Teilen / Cloud / Ordner exportieren.


## 1. Ziel

- Kurze (Gebärdensprach-)Videos im Selfie-Hochformat schnell aufnehmen, mit Kontext versehen, später über Kontext finden, schneiden, zusammenfügen und teilen.
- Bedienung ohne Buttons: Tippen, Halten, Wischen, Audio-Stichwörter, Videogesten und Wartezeiten.
- Zwei Modi: **Aufnahme** (Korall) und **Suche** (Blau). Der Modus zeigt sich nur über den Pastellrand.

## 2. Verbindliche Grundregeln

| Nr. | Regel |
| --- | --- |
| R1 | Pro Aufgabe genau ein Touch-Pfad. Stichwort, Kamera-Geste und Wartezeit lösen dieselbe Aktion aus, sie sind kein zweiter Ablauf. |
| R2 | Richtung = Bedeutung, in beiden Modi gleich: oben = Next, unten = Before, links = Another, rechts = Share. |
| R3 | Häufiges liegt in der Mitte und im Wischen von der Mitte. Seltenes liegt hinter Halten, Randleisten oder Einstellungen. |
| R4 | Keine zusätzlichen Buttons. Es gibt nur: Play-Button in der Videomitte, Gesten, Such- und Kontextfelder, Video. Ausnahmen: Such-Button (Logo, nur Suche) und grüner Punkt oben rechts. |
| R5 | Videos und Vorschaubilder immer im Originalseitenverhältnis. Einzige Ausnahme: Timeline-Zoom. |
| R6 | Aufnahme im eingestellten Seitenverhältnis (Standard 9:16 Hochformat; 3:4, 4:5, 1:1, 4:3, 16:9 oder Kamera-Original in den Einstellungen oder per Sprache „Format …“). |
| R7 | Speichern und Verwerfen geben deutliche Rückmeldung (grün/rot, Animation). |
| R8 | Material 3, Pastell, SVG-Icons, keine Emojis oder Sonderzeichen als Symbole. |
| R9 | Hinweise und Hilfe werden aus einer Tabelle erzeugt. Neue Aktion = eine Zeile Aktion plus ein Eintrag in der Gestentabelle. |

## 3. Plattform und Betrieb

1. **PWA** als erster Weg: statisches Hosting einmalig (GitHub Pages, Netlify, Cloudflare Pages), danach offline. Installation: iPhone Safari → Zum Home-Bildschirm, Android Chrome → App installieren. Stand: umgesetzt.
2. **Update** durch Ersetzen von `index.html`; die App aktualisiert sich beim nächsten Start (Stale-while-revalidate). Stand: umgesetzt.
3. **Capacitor** als zweiter Weg für stabile Kamera, Ton, Spracherkennung und Dateizugriff auf iOS und Android; Verteilung über TestFlight oder App Store. Stand: offen, Anleitung auf Wunsch.
4. **Kamera und Ton** müssen zuverlässig starten: Zugriff beim ersten Antippen und bei jeder Rückkehr zur App, Rückfall auf Aufnahme ohne Ton mit Meldung. Stand: teilweise (auf iOS im Browser begrenzt).
5. **Spracherkennung auf iOS** pausiert während der Videoaufnahme (Mikrofon-Konflikt). Kontext wird dort während der Aufnahme per Tastatur eingegeben. Stand: umgesetzt als Umgehung.
6. **Videoformat:** MP4, wenn der Browser es kann, sonst WebM. Stand: umgesetzt.
7. **Seitenverhältnis:** Die Kamera liefert ihr volles Bildfeld (kein Zuschnitt durch den Browser). Daraus wird der größtmögliche Ausschnitt im gewählten Verhältnis genommen und höchstens verkleinert, nie vergrößert (kurze Seite bis 480/720/1080). Die Vorschau zeigt denselben Ausschnitt. Breite Formate bei hochkant gehaltenem Gerät (und umgekehrt) schneiden zwangsläufig viel ab; die App weist darauf hin. Stand: umgesetzt, auf dem Gerät zu prüfen.
8. **Daten bleiben lokal** (IndexedDB, gewählter Ordner). Stand: umgesetzt.

## 4. Eingabekanäle

### 4.1 Touch und Wischen

- **Mitte** (Play-Button): Tippen, Halten, Wischen in vier Richtungen.
- **Randleisten** oben und unten im Layout (nicht am physischen Rand, damit iOS-Gesten nicht stören): Wischen nach unten (oben) bzw. nach oben (unten).
- **Felder:** Tippen schreibt, Halten spricht, Chip antippen schaltet an/aus, Chip halten und links ziehen entfernt.

### 4.2 Audio-Stichwörter (Auslöser derselben Aktionen)

Start, Stopp/Speichern, Pause, Weiter, Retry, Neu, Marker, Schnitt, Senden, Suche, Suche alle, Aufnahme, Playlist, Ergänzen, Zusammenfügen, Notiz, Vollbild, Zurück, Einstellungen, Alle löschen, Schließen/Fertig.

### 4.3 Videogesten

- Umgesetzt: Hand im Bild startet (nur bei Direct AudioContext mit vorhandenem Kontext), Stillstand (Freeze) stoppt, optional.
- Offen: Handformen mit MediaPipe (flache Hand = Marker, gekreuzte Hände = Schnitt, Handwisch = Weiter).

### 4.4 Wartezeiten

- Sprechpause nach Kontext startet die Aufnahme (3 oder 5 s, aus möglich), nur bei Direct AudioContext.
- Stillstand 1,5 / 2 / 3 s stoppt die Aufnahme (Freeze).
- Satzende ca. 1,2 s trennt Kontext von Befehl.

### 4.5 Direct AudioContext (früher Autostart)

- **An:** Sprache wird direkt Kontext. Kontextphase → Hauptkontext. Aufnahme läuft → Kontext. Suche, nichts spielt → Suchbegriff. Suche, Video spielt → Kontext zum Video. Nach dem ersten gesprochenen Kontext wartet die App; kommt über die Wartezeit nichts mehr, startet die Aufnahme automatisch.
- **Aus:** Gesprochenes wird nur übernommen, solange irgendwo gehalten wird. Das gehaltene Element wird grün umrandet.
- **Bedienung:** grüner Punkt oben rechts. Tippen = Settings, Halten = Direct AudioContext an/aus. Grün = aktiv (oder gerade gehalten), grau = aus. Beschriftung neben dem Punkt: „Tap • Settings“, „Hold • Direct AudioContext“. Das Doppeltippen entfällt. Stand: umgesetzt.
- **Zu Beginn die Mitte halten und sprechen:** beim Loslassen startet die Aufnahme automatisch. Ganz nach unten ziehen löscht den Kontext wie gewohnt. Stand: umgesetzt.

## 5. Kontextmodell

### 5.1 Begriffe

- **Hauptkontext** (bleibend, unten): gilt für alle Teile einer Serie. Bleibt bei Videoschnitt und neuen Teilen erhalten.
- **Kontext** (temporär, oben): gilt für den aktuellen Clip, wird bei neuer Sequenz leer, beim Schnitt nach Zeitpunkt aufgeteilt.
- Beide Felder ohne Beschriftung, nur durch eine feine Linie getrennt. Stand: umgesetzt.

### 5.2 Regeln für Tags

| Nr. | Anforderung | Stand |
| --- | --- | --- |
| K1 | Alle Einträge sind umrandete Tags, auch der temporäre Kontext. | umgesetzt |
| K2 | Vorauswahl: häufigste Hauptkontexte erscheinen ausgegraut, Antippen aktiviert/deaktiviert. | umgesetzt (nur Hauptkontext) |
| K3 | Entfernen: Halten, dann nach links ziehen, auch beim ersten Element. | umgesetzt |
| K4 | Verschieben zwischen Hauptkontext und Kontext durch Halten und vertikales Ziehen. | umgesetzt |
| K5 | Das System merkt sich pro Wort, ob es zuletzt bleibend oder temporär war, und zeigt es beim nächsten Mal direkt dort. | teilweise (Merken ja, Vorbelegung bei fehlendem Suchbegriff ja, sonst offen) |
| K6 | Rücktaste im leeren Eingabefeld löscht das letzte Tag in Such- und Kontextfeldern. | umgesetzt |
| K7 | Felder maximal zwei Zeilen hoch, nach links/rechts scrollbar. Antippen ergänzt hinten. Einfügen an beliebiger Stelle durch Antippen der Stelle. | teilweise (Einfügen an Stelle offen) |
| K8 | Halten auf ein Feld spricht neues Kontext hinein, Tippen öffnet die Tastatur. | umgesetzt |
| K9 | Ein gesprochener Satz wird in einzelne Tags zerlegt (Komma, „und“). | offen |
| K10 | Das ganze Kontext- oder Suchfeld lässt sich nach rechts ziehen, um es zu teilen oder zu speichern. | umgesetzt (Text, optional als Datei im Ordner) |

### 5.3 Klammer-Konzept (neu, offen)

Ziel: gemeinsamer Kontext wird nur einmal geschrieben. Statt einer Trennlinie gilt eine Klammer. Es ist **ein** Feld, aus dem Begriffe nach oben oder unten gezogen werden; der untere Teil ist der stabile Kontext und gilt für jeden oberen Eintrag.

- Beispiel Eingabe: „Banane vor dir Erdbeeren \*“. Das Sternchen steht für den Ergänzungsteil.
- Variante A (ohne Zusammenziehen): `(Frucht Banane) vor dir (Frucht Erdbeeren) *`
- Variante B (zusammengezogen): `vor dir Frucht[Banane Erdbeeren] *`
- Variante C: `Banane vor dir Erdbeeren Frucht[Banane Erdbeeren] *`
- Ergänzungsteil `*`: Tippen öffnet die Tastatur, Halten spricht, ein weiterer Finger darauf öffnet eine neue Klammer.
- Markieren mehrerer Wörter durch Doppeltippen (auch mit Ziehen oder mehrfach), Aufheben durch erneutes Doppeltippen am Feldende oder Tippen auf das Ergänzungsfeld.
- Pro Wort lässt sich der beständige Kontext austauschen oder entfernen.
- Suche in der Klammer: `Frucht[Banane Erdbeeren]` findet Videos mit Frucht und einem der Wörter.
- Stand: offen, braucht Entscheidung zu den Fragen in Abschnitt 11.

## 6. Aufnahmemodus

### 6.1 Layout

- Obere Randleiste, Video (Hochformat, Original), unten das Hauptkontext-Fenster, darüber das Kontext-Fenster (erscheint beim Start der Aufnahme), untere Randleiste.
- Kein Button unten, kein Logo. Grüner Punkt oben rechts. Recording-Sekunden nur um den Play-Button (kleine Pille darunter), keine Aufnahmeanzeige oben links.
- Kamera zeigt das ganze Bild (unten bündig). Das **Aufnahmefenster** (gewähltes Format) ist fein gestrichelt markiert.
- Darin liegt der **Fokus**: zuerst ein Kreis, innen klar, außen abgedunkelt. Fokusrand antippen wechselt Kreis → Ellipse → stark gerundetes Rechteck; Rand ziehen ändert die Größe (25–100 %). Sprache: „Fokus Kreis/Ellipse/Rechteck“. Wird gemerkt. Nur Anzeige, wird nicht ins Video gebrannt.
- Der **Play-Button** sitzt zwischen Aufnahmefeld und Kontextfeld: ragt leicht ins Aufnahmefeld und berührt leicht das Kontextfeld. Gesten (Tippen, Halten, Wischen) gehen vom Button aus.
- Im Streifen dazwischen, links vom Button: die **Serie** (Clips mit demselben Hauptkontext, neuester am Button, Entwürfe gestrichelt). Antippen spielt den Clip im Vollbild.
- Rund um die Mitte stehen die Richtungen mit Pfeil und Beschriftung. „Hold • More Context“ steht unter der Mitte.

### 6.2 Gesten

| Geste | Aktion | Beschriftung |
| --- | --- | --- |
| Mitte tippen | Start, Pause, Weiter | – |
| Mitte halten | sprechen, in der Kontextphase beim Loslassen starten | Hold • More Context |
| nach oben | speichern, neue Kontextphase | Next (Save) |
| nach links | speichern, nächster Teil, Hauptkontext bleibt | Another (Save) |
| nach rechts | speichern und teilen | Share |
| nach unten | Retry; kurz: alles bleibt, ganz: Kontext fliegt links raus | Before (Empty Capture) |
| obere Leiste nach unten | verwerfen, alles leer | Capture |
| untere Leiste nach oben | speichern, Suche mit diesem Video (bei offener Suche: zurück zu dieser Suche) | Search |

Das Wischen nach oben in der Kontextphase und das Doppeltippen entfallen (doppelt zu Tippen).

### 6.3 Zustände und Kontextlogik

| Zustand | Ereignis | Hauptkontext | Kontext |
| --- | --- | --- | --- |
| Kontextphase | sprechen, schreiben, Chip antippen | wächst | – |
| Kontextphase | Start (Tippen, Stichwort, Sprechpause, Hand im Bild) | wird fixiert | Fenster erscheint leer |
| Läuft | sprechen, schreiben | – | wächst (mit Zeitpunkt) |
| Läuft | tippen | – | Pause, Tippen setzt fort |
| Läuft | nach oben | leer | leer |
| Läuft | nach links | bleibt | leer, nächste Aufnahme startet sofort |
| Läuft | nach unten kurz | bleibt | bleibt, zurück in die Kontextphase |
| Läuft | nach unten ganz | bleibt | wird geleert (Animation nach links) |
| Läuft | obere Leiste | leer | leer |
| Suche → Aufnahme (fehlender Begriff) | nach unten gezogener Chip | Begriff (oder Kontext, wenn zuletzt temporär) | – |

### 6.4 Befund der Kontextlogik

1. Hauptkontext fixieren beim Start ist klar und stabil.
2. Beim Wischen nach oben ist offen, ob der Hauptkontext ebenfalls leer werden soll. Der Prototyp leert beide.
3. Vorauswahl gibt es nur für Hauptkontext, nicht für häufige temporäre Kontexte.
4. Kontext, der in den Hauptkontext verschoben wird, bleibt für spätere Teile erhalten. Das ist gewollt, sollte aber sichtbar sein.
5. Mit Direct AudioContext aus wird Sprache während der Aufnahme ignoriert, außer beim Halten. Das braucht die grüne Umrandung als Rückmeldung (umgesetzt).

### 6.5 Rückmeldung

- Speichern: grüne Pille „Gespeichert“ mit Haken. Verwerfen: rote Pille „Verworfen“. Retry: Video senkt sich kurz ab. Zurücksetzen: Bild dunkelt ab, beide Kontextfenster fliegen links hinaus. Stand: umgesetzt.

## 7. Suchmodus

### 7.1 Ansicht „Alle Clips“ (nichts eingegeben)

- Liste aller gespeicherten und eingebundenen Videos (siehe Abschnitt 9). Vorschaubilder im Originalverhältnis mit durchsichtigem Kontext-Overlay.
- Oben links Sortier-Symbol Buchstabe, oben rechts Sortier-Symbol Datum. Antippen wechselt vorwärts/rückwärts.
- Anfangsbuchstaben A–Z als Chips in der Suchleiste (aktivierbar). Tippen ins Suchfeld ersetzt sie durch die häufigsten Kontexte.
- Filter am Rand: links Videolänge, rechts Datumsbereich von/bis, je mit zwei ziehbaren Griffen. Beim Bewegen wird der Wert angezeigt. Die Regler bleiben beim Scrollen stehen. Bei breiter Playlist erscheinen die Vorschaubilder als Raster. Stand: umgesetzt.
- Links/rechts wischen hat hier Bedeutung (nicht Moduswechsel). Der Wechsel in die Aufnahme nur über die obere Leiste.

### 7.2 Ergebnisansicht

- Links eine vertikale Reihe mit Vorschaubildern, jedes mit kleinem Play-Button. Es gibt **keine** separate Timeline. Die Timeline liegt im aktiven Vorschaubild. Stand: **offen** (Prototyp hat noch die schmale Leiste im vergrößerten Zustand).
- Rechts das aktive Video groß, im Originalverhältnis, Autoplay, danach direkt das nächste.
- Die Trennlinie lässt sich nach links (Video Vollbild) oder nach rechts (volle Suchansicht) ziehen.
- Keywords liegen als leichtes Overlay auf den Vorschaubildern (bis zu zwei passende).

### 7.3 Anordnung unten (Zielbild)

1. Ganz unten das **Suchfeld über die gesamte Breite**.
2. Links darüber der **Search-Button** (Logo).
3. Wird der Button nach unten bewegt, rutscht der linke Rand des Suchfelds nach rechts. Darunter erscheint das **Löschfeld**, das rot wird.
4. Rechts neben dem Search-Button erscheint das **More-Context-Feld für die Playlist**.
5. Direkt über dem Suchkontext liegt das **kombinierte Kontextfeld des Videos** in der Breite des Videos (Hauptkontext unten, Kontext oben, Klammer statt Linie, sobald das Klammer-Konzept steht).
6. **Favoriten** (siehe 7.5).

Stand der Anordnung: teilweise (Felder vorhanden, Breite und Position noch nicht wie beschrieben).

### 7.4 Gesten

| Geste | Aktion | Beschriftung |
| --- | --- | --- |
| Mitte tippen | Play/Pause | – |
| Mitte halten | More Context (sprechen) | Hold • More Context |
| Mitte halten, langsam hoch/runter | Timeline zoomen, genauen Zeitpunkt wählen, langsam ins vorige/nächste Video wechseln | – |
| nach oben / unten | nächster / vorheriger Clip | Next / Before |
| nach links | Schnitt an der Stelle, Vergrößern, beide Teile behalten den Hauptkontext, Kontext folgt dem Zeitpunkt | Another (Cut) |
| nach rechts | Share (mit Halten und Ziehen für die genaue Stelle) | Share |
| obere Leiste nach unten | Aufnahme | Capture (New) |
| untere Leiste nach oben | neue Suche | Search (New) |
| Search-Button halten | More Context sprechen (landet im Playlist-Kontextfeld) | Hold • More Context |
| Search-Button nach oben | Dialog „Add Context (Playlist)“ | – |
| Search-Button nach unten ins Löschfeld | Dialog „Take out Context (Playlist)“; ist das Feld leer: Videos der Playlist aus dem Speicher löschen | – |
| Search-Button nach rechts | Save & Share (Playlist als ein Video) | Share |
| Search-Button nach links | Einstellungen | – |
| Playlist-Kontextfeld halten, links ziehen | Feld leeren | – |
| Vorschau-Play antippen | Wiedergabe beginnt | – |
| Vorschau-Play halten, vertikal ziehen | Reihenfolge ändern | – |
| Vorschau-Play halten, nach rechts | Share | – |
| Vorschau-Play halten, nach links | aus Playlist entfernen | – |
| Vorschau halten (außerhalb Play-Griff) | Kontext zu diesem Video sprechen | – |
| Vorschau halten, ins rote Löschfeld ziehen | endgültig löschen | – |

### 7.5 Favoriten

- Oben, direkt unter der Randleiste, als einzeilige scrollbare Chipzeile. Sichtbar nur, wenn Favoriten existieren. Beim Ziehen eines Tags nach oben dient sie als Ablagezone.
- Ablegen per Drag und Drop aus jedem Kontextfeld oder aus der Suche. Antippen aktiviert. Ein aktiver Favorit überlagert den Suchkontext. Sind alle aus, erscheint die zuvor erstellte Suche/Playlist wieder. Entfernen: lange drücken. Stand: umgesetzt.

### 7.6 Fehlender Kontext

- Orange Chip = kein Video enthält den Begriff. Nach unten ziehen startet die Aufnahme, als wäre der Begriff gerade als Kontext hinzugefügt (bleibend oder temporär je nach Merkung).
- Untere Leiste nach oben nach der Aufnahme führt zurück zur bestehenden Suche. Erst das erneute Ziehen von unten setzt die Suche zurück. Stand: umgesetzt.

### 7.7 Suchlogik

- Suche über den gesamten Kontext des Videos (Titel, Hauptkontext, Kontext) mit einfachen Synonymgruppen.
- Gefundene Begriffe grün, nicht gefundene orange. Neue Begriffe hängen Treffer hinter den laufenden Clip, „ans Ende …“ hängt hinten an. Stand: umgesetzt.

## 8. Timeline und Schnitt

- Position und Schnitt liegen im vertikal vergrößerten Vorschaubild, nicht in einer eigenen Leiste.
- Halten auf dem Play-Button und langsames Bewegen nach oben/unten zoomt: je langsamer, desto mehr vertikaler Platz für das aktive Stück, um den Zeitpunkt genau zu wählen. Bei schneller Bewegung wird zwischen vorigem und nächstem Video gewechselt. Der aktuelle Zeitpunkt liegt auf der Höhe des Play-Buttons.
- Ist der Zeitpunkt fixiert: Wisch nach links schneidet. Beide Teile behalten den Hauptkontext, der Kontext teilt sich nach dem Zeitpunkt. Der Kontextblock bricht in der Liste an der Schnittstelle auf und teilt sich auf zwei Einträge.
- Wisch nach rechts speichert und teilt den Abschnitt. Tippen pausiert und spielt.
- Stand: teilweise (Zoom und Ausrichtung als Näherung, Vorschaubild-Timeline offen).

## 9. Speichern, Bibliothek, Teilen

| Nr. | Anforderung | Stand |
| --- | --- | --- |
| S1 | Nach jeder Aufnahme sofort in alle Speicherorte mit „Jede Aufnahme hier speichern“. Mehrere Speicherorte in den Einstellungen: Ordner, Nextcloud/Sciebo-Konto, freigegebener Ordner per Link. Fehlgeschlagenes wird wiederholt. | umgesetzt |
| S2 | Alle Videos aus Speicherorten mit „In der Bibliothek zeigen“ anzeigen (Ordner und Cloud). Pro Video liefert `<video>.json` Kontext, Marker, Schnitte; ältere `index.json` wird weiter gelesen. | umgesetzt |
| S3 | Dateiname aus Kontext: Hauptkontext, Kontext, Datum, Nummer. | umgesetzt |
| S4 | Playlist als ein Video, Dateiname mit Suchkontext. | umgesetzt |
| S5 | Teilen-Menü in fester Reihenfolge: **Teilen, Cloud-Speicherorte und Freigaben, Ordner**. Jeder Speicherort ist eine eigene Kachel und kann per Namen gesprochen werden. | umgesetzt |
| S6 | Teilen-Menü einfach schließen (Tippen daneben oder nach unten wischen). | umgesetzt |
| S7 | Cloud: Nextcloud/Sciebo per WebDAV und freigegebene Ordner per Link (Hochladen, Auflisten, Nachladen beim Abspielen). iCloud über das Teilen-Menü. CORS: Server muss die App erlauben, sonst Proxy (`tools/webdav-proxy.js`). | umgesetzt |
| S8 | Löschen: Wisch links = aus Playlist entfernen. Rotes Löschfeld = endgültig löschen. | umgesetzt |
| S9 | Zusammenfügen läuft in Echtzeit auf dem Gerät und zeigt Fortschritt. | umgesetzt |

## 10. Visuelles Design

- Material 3, Pastell: Korall für Aufnahme, Blau für Suche. Tonale Flächen, runde Formen, Schatten sparsam.
- Alle Symbole als SVG (Material Icons). Keine Emojis, keine Schriftzeichen als Pfeile.
- Beschriftungen kurz und englisch wie festgelegt: Another, Next, Share, Before, Capture, Search, More Context, Settings, Direct AudioContext. Darstellung „Hold • Aktion“.
- Hinweise rund um die Mitte, Randleisten tragen ihre Beschriftung selbst.
- Rückmeldungen: Speichern grün, Verwerfen rot, Animationen für Retry, Zurücksetzen, Schnitt.
- Der Hilfe-Inhalt (Gestenübersicht) steht unter den Speicher-Einstellungen im Einstellungsfenster, erreichbar über den grünen Punkt.

## 11. Offene Entscheidungen und Widersprüche

1. **Höhe der Kontextfelder:** einmal fünf Zeilen (Suche), später zwei Zeilen mit horizontalem Scrollen. Prototyp: zwei Zeilen. Bitte bestätigen.
2. **Wischen nach oben in der Aufnahme:** soll der Hauptkontext ebenfalls geleert werden oder bleiben?
3. **Timeline:** Timeline-Leiste links entfernen und ganz in die Vorschaubilder verlegen (Anforderung) oder als kurze Zoom-Anzeige behalten?
4. **Klammer-Konzept:** Wird eine Klammer immer um mehrere Wörter gesetzt, die denselben stabilen Begriff teilen? Soll `Frucht[Banane Erdbeeren]` bei der Suche als ODER wirken? Welche Geste markiert ein Wort für „vor eine neue Klammer“?
5. **Einfügen an beliebiger Stelle:** durch Tippen auf die Position im Chip-Feld oder durch Tippen zwischen zwei Chips?
6. **Favoriten-Ablage:** oben als Zeile (Vorschlag) oder als Rand am linken Spaltenkopf?
7. **Teilen nach rechts in der Suche:** Halten und Ziehen mit Feineinstellung für die Stelle, in der Aufnahme dagegen einfaches Wischen. So belassen?
8. **Videogesten:** Handformen brauchen MediaPipe. Zuerst als Web-Version oder erst mit Capacitor?

## 12. Stand und Reihenfolge

| Bereich | Stand |
| --- | --- |
| Plattform PWA, Offline, Update | umgesetzt |
| Hochformat, MP4, Sekunden am Play-Button | umgesetzt (auf Gerät prüfen) |
| Aufnahme: Gesten, Kontextfenster, Retry, Rückmeldung | umgesetzt |
| Direct AudioContext und grüner Punkt | umgesetzt |
| Speichern in Ordner, Bibliothek, Dateinamen | umgesetzt |
| Teilen-Menü und Löschlogik | umgesetzt |
| Suche: Sortierung, Buchstaben, Regler, Raster, Favoriten | umgesetzt |
| Suche: Layout unten (Suchfeld volle Breite, Löschfeld, More-Context-Feld) | teilweise |
| Timeline im Vorschaubild | offen |
| Klammer-Kontextmodell | offen |
| Tag-Zerlegung, Einfügen an beliebiger Stelle | offen |
| Handform-Videogesten | offen |
| WebDAV-Bibliothek, mehrere Speicherorte, Freigabe-Links | umgesetzt (Branch aufnahme-speicherorte) |
| Seitenverhältnis einstellbar | umgesetzt (Branch aufnahme-speicherorte) |
| Capacitor/iOS-App | offen |

**Vorgeschlagene Reihenfolge:** (1) Test auf Gerät und Stabilität von Kamera, Ton und Hochformat. (2) Suche-Layout unten und Timeline im Vorschaubild. (3) Kontextmodell mit Klammern und Tag-Zerlegung. (4) Videogesten und Capacitor für iOS.
