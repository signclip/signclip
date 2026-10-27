# Etappen

Vier Etappen von der ersten Person bis zur übergreifenden multimodalen Anwendung. Jede Etappe öffnet das Projekt für einen größeren Kreis, bündelt Ressourcen auf einen kurzen Zeitraum und endet mit etwas Sichtbarem, das sich einfach erklären lässt.

**Stand:** Entwurf aus dem Gespräch vom 27.10.2026. Zahlen stammen aus den Projektdokumenten `infrastructure.md` und `architektur.md` (Claude-Projekt „Sign“) und sind Schätzungen, nicht gemessen. Zuordnungen zu deren Phasen 0–6 sind ungefähr.

## Leitidee

- **Kleine Dauerbasis, kurze Spitzen.** Der laufende Betrieb bleibt klein (eigene Nextcloud, Geräte der Teilnehmenden). Große Mengen an Speicher und Rechenzeit werden nur für ein kurzes Zeitfenster gebraucht.
- **Lokal zuerst.** Aufnahmen bleiben auf dem Gerät, bis jemand etwas teilt. Was geteilt wird (Landmarks oder Video), entscheidet die Person pro Clip.
- **Offen in Stufen.** Jede Etappe hat ihr Tor (persönliche Einladung, Warteliste, Landing Page mit Countdown). Wer drin ist, sieht mit jeder Etappe etwas Neues.
- **Ressourcen von Anfang an erklären.** Nicht nur Geld, auch Zeit, Wissen und Aufnahmen. Es gibt keine Pflicht und keine Zähler.

## Übersicht

| Etappe | Kreis | Kern | Tor | Ungefähre Phase in `architektur.md` |
| --- | --- | --- | --- | --- |
| **1 Start** | einzelne Personen | Nextcloud für jede Person, lokales Speichern mit der eigenen App, erster Bereich „Beitragen“ | persönliche Einladung | 0–1 |
| **2 Lehren und Lernen** | Lernende und Lehrende an Hochschulen | Neue Personen per Klick, Referenzen (abhängig/unabhängig), Auswahl lokal/geteilt/Bibliothek, Sicht für Lehrende | Einladung über Hochschulen | 1–2 |
| **3 Breit und Gespräche** | deutschsprachiger Raum | Landing Page, längere Gespräche, Countdown, gemeinsames Modellieren im Hintergrund, einmaliges Abladefenster | Warteliste und Countdown | 3–5 |
| **4 Übergreifend** | alle Interessierten | Oberfläche für multimodale Aufnahme und Ähnlichkeit über DGS hinaus | offen | 6 |

Parallel zu 3 läuft die Spur **Partner und Anbieter** (siehe unten), und ab 2 die Spur **Oberfläche erkunden**.

## Etappe 1: Start

**Ziel:** Es funktioniert für eine Person, und das Konzept ist verständlich erklärt.

- Jede Person bekommt in der eigenen Nextcloud einen eigenen Bereich. Das trägt schon am Start.
- Lokales Speichern ist vollständig möglich, sobald die eigene Capacitor-App steht. Bis dahin ist die Nextcloud der verlässliche Hauptspeicher.
- Speicherorte wählbar: lokal, Nextcloud, Sciebo (Konto oder Freigabelink), iCloud/Google Drive. Pro Ort „immer speichern“ oder nur im Teilen-Menü.
- **Bereich „Beitragen“:** freiwillig und ohne Zähler, mit der Erklärung, wohin es geht. Drei Wege: Nachricht, Zeit, Geld. Das Konzept steht in `infrastructure.md`, Abschnitt 8. Rechtsform und Spendenfragen sind vorher zu klären.
- **Vorher testen** (aus `architektur.md`, Testtag): CORS für die Browser-App, Sciebo als externer Speicher, föderiertes Teilen, Schreib- und Lese-Konto, Einladungslink.

**Ergebnis nach außen:** Kurzvideo „Eine Person, eine Bibliothek“ und die Erklärung, wohin das Projekt geht.

## Etappe 2: Lehren und Lernen

**Ziel:** Hochschulen können Sign als Vokabularwerkzeug einsetzen.

Voraussetzung: Neue Personen lassen sich mit **einem Klick** hinzufügen (Einladungslink oder QR, Konto, Ordner und Speicherort entstehen automatisch).

- **Referenzen:** Lehrende nehmen Vorlagen auf oder wählen aus dem Hochgeladenen aus. Lernende nehmen dazu auf:
  - **abhängig:** nach einer Vorlage, gleiches Ziel, viele Ausführungen
  - **unabhängig:** frei, die Bedeutung wird später geprüft
- **Auswahl pro Eintrag:** was bleibt **lokal**, was wird **geteilt**, was erscheint in der **Bibliothek**, und in welcher Form geteilt wird (**Landmarks** oder **komplettes Video**).
- **Sicht für Lehrende:** was Lernende aufgenommen haben, und, wenn die Lernenden zustimmen, wer was angesehen hat. Siehe Regeln unten.
- **Prüfung** durch Dolmetschende als eigene Spur, ohne das Original zu verändern.
- Nutzbar als Vokabular für Kurse und Seminare.

**Ergebnis nach außen:** Beispiel eines Kurses mit Vorlagen, Aufnahmen der Lernenden und geprüften Varianten.

## Etappe 3: Breit und Gespräche

**Ziel:** Eine große Bandbreite an Gesprächsaufnahmen aus dem deutschsprachigen Raum, daraus erste Modelle.

1. **Landing Page** lädt ein, auch längere Gespräche aufzunehmen, und führt auf einen **Countdown** zu.
2. **Ressourcen-Angebot:** Lernen, neu hinzufügen, gemeinsames Modellieren. Es gibt Updates für alle, die schon dabei sind.
3. **Im Hintergrund:** Infrastruktur bereitstellen. Mit den bisher verfügbaren Daten die ersten Trainings- und Glättungsmodelle entwickeln und spezifizieren, damit die Rechenzeit im Fenster nicht an Fehlern verloren geht.
4. **Lokal aufnehmen:** Teilnehmende nehmen im Countdown-Zeitraum auf und behalten alles auf dem Gerät.
5. **Abladefenster:** Auf ein Signal hin wird das lokal Aufgenommene **einmal geöffnet**, als Landmarks oder, mit Einwilligung, als Video. So entsteht ein großer Trainingssatz.
6. **Rechnen, Release, Zeigen:** Modelle trainieren, einen eingefrorenen Release erzeugen, das Ergebnis zeigen. Speicher danach zurück auf Basis, Originale in ein Kaltarchiv.

**Größenordnung** für 220 Personen, 4 Wochen, je 30 Minuten Gespräch pro Woche und 10 Einzelgebärden pro Tag: etwa 440 h Gespräch (rund 0,5 TB Video, 18 GB Landmarks) plus 62.000 Einzelgebärden (rund 80 GB), zusammen rund 0,6 TB. Der knappe Punkt ist die gleichzeitige Last beim Abladen (Zeitfenster pro Gruppe), danach die GPU-Zeit.

**Ergebnis nach außen:** Suche über alle Beiträge mit vielen Variationen, Cluster-Ansicht, erster Prototyp, ausdrücklich als Prototyp.

## Etappe 4: Übergreifend

**Ziel:** Die Oberfläche für multimodale Aufnahme und Ähnlichkeit wird über Gebärdensprache hinaus nutzbar, mit einfacher Steuerung über alle Kombinationen aus Audio, Text und Visuellem.

Voraussetzung: Die Gestenlogik und das Datenmodell haben sich in Etappe 2 und 3 bewährt. Das Domänenfeld im Eintrag erlaubt andere Bereiche (z. B. Physio, Sport, Handwerk).

## Parallele Spuren

### Partner und Anbieter

Gespräche mit Anbietern wie Google (SL2T) und Apple. Stand der Recherche am 27.10.2026:

- **SL2T** läuft nur für ASL zu Englisch (Pixel 11, Gboard und Live Transcribe). DGS ist nicht genannt, Google spricht allgemein von weiteren Gebärdensprachen ([DataNorth](https://datanorth.ai/news/google-deepmind-releases-sl2t)).
- **Apple:** In den iOS-27-Bedienungshilfen steht keine automatische Gebärdenerkennung. Neu ist eine Schnittstelle, um in FaceTime-Anrufe eine menschliche Dolmetschperson zu holen ([BGR](https://www.bgr.com/2177707/cool-new-ios-27-accessibility-features-look-forward-to-fall/)).

Regel: **Alles, was mit Anbietern besprochen wird, wird vor dem Abladen offengelegt.** Teilnehmende müssen wissen, wer Daten und Modell nutzen darf, bevor sie etwas freigeben. Gespräche mit Anbietern sind ein weiterer Ressourcenpunkt, vor allem für die weltweite Nutzung des DGS-Modells.

### Oberfläche erkunden

Design und Bedienung für andere multimodale Anwendungen, ohne die erste Anwendung zu verwässern. Ergebnisse gehen in [DESIGN.md](DESIGN.md).

## Regeln, die für alle Etappen gelten

1. **Einwilligung pro Clip und Zweck.** Stufen: privat, Gruppe, Training als Landmarks, Training als Video, Release. Jederzeit änderbar. Widerruf entfernt die Dateien im Trainingsbereich, kann aber ein bereits trainiertes Modell nicht ungeschehen machen. Das steht in der Einwilligung, bevor jemand etwas freigibt.
2. **Ansehen ist personenbezogen.** „Wer hat was angesehen“ für Lehrende nur mit Zustimmung der Lernenden, sichtbar für diese und abschaltbar. Vorab mit dem Datenschutz der jeweiligen Hochschule klären. Das ist keine Rechtsberatung.
3. **Sprache als Feld.** Der deutschsprachige Raum umfasst mehr als eine Gebärdensprache (DGS, ÖGS in Österreich, DSGS in der Deutschschweiz). Jeder Eintrag trägt die Sprache, sonst vermischen sich die Trainingsdaten.
4. **Referenz als Feld.** Art (abhängig oder unabhängig) und bei abhängig die ID der Vorlage.
5. **Lizenz der Vorlagen.** Wem gehören die Referenzvideos der Lehrenden, und was dürfen Lernende damit tun? Vor Etappe 2 klären.
6. **Sciebo ist verteilter Speicher nur für Hochschulangehörige**, Gäste haben keinen eigenen. Der Betreiber sichert nicht. Alle anderen nutzen die Nextcloud oder lokalen Speicher.
7. **Übersetzung zu Gesprächen.** Gesprächsvideos ohne deutschen Text taugen für Ähnlichkeit und Vortraining, nicht für DGS-zu-Text. Wer liefert in Etappe 3 den Text, bleibt zu entscheiden.

## Offene Entscheidungen

1. Wer nimmt in Etappe 2 die Vorlagen auf, und unter welcher Lizenz?
2. Wer liefert in Etappe 3 die deutsche Übersetzung zu den Gesprächen (die Gebärdenden direkt danach, Dolmetschende oder beide)?
3. Videos oder nur Landmarks im Abladefenster?
4. Wann soll Etappe 3 beginnen, und bis wann muss ein Antrag auf Hochschulrechenzeit (NHR) gestellt sein?
5. Rechtsform für den Bereich „Beitragen“ (privat, Hochschulprojekt, Verein).
6. Gibt es für die Sicht „wer hat was angesehen“ eine Lösung, die die Hochschulen akzeptieren?
