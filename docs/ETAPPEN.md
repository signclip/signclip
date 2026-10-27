# Etappen

Vier Etappen von der ersten Person bis zur Frage, wohin Oberfläche und Erkenntnisse weitergetragen werden. Jede Etappe öffnet das Projekt für einen größeren Kreis, bündelt Ressourcen auf einen kurzen Zeitraum und endet mit etwas Sichtbarem, das sich einfach erklären lässt.

**Stand:** Entwurf, überarbeitet am 27.10.2026 nach Rückmeldung. Zahlen stammen aus den Projektdokumenten `infrastructure.md` und `architektur.md` (Claude-Projekt „Sign“) und sind Schätzungen, nicht gemessen. Zuordnungen zu deren Phasen 0–6 sind ungefähr.

## Leitidee

- **Kleine Dauerbasis, kurze Spitzen.** Der laufende Betrieb bleibt klein (eigene Nextcloud, Geräte der Teilnehmenden). Große Mengen an Speicher und Rechenzeit werden nur für ein kurzes Zeitfenster gebraucht.
- **Lokal zuerst, sobald die App steht.** Aufnahmen bleiben auf dem Gerät. Was zur Nextcloud fließt (Landmarks oder komplette Videos), wählt die Person.
- **Offen in Stufen.** Jede Etappe öffnet für einen größeren Kreis: erst einzelne Personen, dann eine Hochschule, dann weitere, dann ein breiterer Kreis.
- **Ressourcen früh und ehrlich erklären.** Nicht nur Geld, auch Zeit, Wissen und Aufnahmen. Keine Pflicht, keine Zähler.
- **Die Plattform bleibt eine persönliche Suchbibliothek zum Lernen**, auch wenn Modelle später weltweit eingebunden werden.

## Übersicht

| Etappe | Kreis | Kern | Ergebnis | Ungefähre Phase in `architektur.md` |
| --- | --- | --- | --- | --- |
| **1 Lernen und Ablegen** | einzelne Personen, privat | Lernen, erstes Speichern in der eigenen Nextcloud, persönliche Ressourcen und Anträge | Konzept erklärt, Speichern und Wiederfinden funktioniert | 0 |
| **2 Hochschulraum und App** | Lernende und Lehrende, zuerst eine Hochschule, dann weitere | Capacitor-App mit lokalem Speichern, Auswahl was zur Nextcloud fließt, Referenzen, erster Satz Landmarks und Videos, visuelle Erkennung, Echtzeit-Suche | Datensatz, auf dem ein visuelles Erkennungsmodell läuft | 1–2 |
| **3 Weiterer Kreis und Gesprächswelle** | weiterer Benutzerkreis | Ressourcenpunkt mit Anreiz, Gespräche in einer Welle übernehmen, Übergänge glätten, Text und Visuelles modellieren | Modelle für Übergänge und Text, Entscheidung zu SL2T | 3–5 |
| **4 Wohin weiter** | offen | Wohin Oberfläche, Modellierung und Glättung von Bewegungen genutzt werden können | Richtung | 6 |

Parallel läuft die Spur **Partner und Anbieter** (ab Etappe 3 mit Entscheidung) und die Spur **Oberfläche erkunden** (ab Etappe 2).

## Etappe 1: Lernen und Ablegen

**Ziel:** Das Konzept lernen und erklären, die ersten Aufnahmen in der eigenen Nextcloud ablegen und wiederfinden. Alles, was nicht ausdrücklich zu Etappe 2 gehört, gehört hierher.

- Jede Person bekommt in der eigenen Nextcloud einen eigenen Bereich. Das trägt schon am Start.
- Aufnehmen, speichern und wiederfinden im Browser (PWA). Die App und lokales Speichern kommen in Etappe 2.
- **Ressourcen privat:** Schon hier können Einzelne Ressourcen geben, und vor allem werden **Anträge vorangetrieben** (z. B. Hochschulrechenzeit, Förderung). Der Bereich „Beitragen“ ist freiwillig, ohne Zähler, und erklärt, wohin es geht. Konzept: `infrastructure.md`, Abschnitt 8. Rechtsform und Spendenfragen vorher klären.
- **Vorher testen** (aus `architektur.md`, Testtag): CORS für die Browser-App, Sciebo als externer Speicher, föderiertes Teilen, Schreib- und Lese-Konto, Einladungslink.

**Ergebnis nach außen:** Kurzvideo „Eine Person, eine Bibliothek“ und die Erklärung, wohin das Projekt geht.

## Etappe 2: Hochschulraum und App

**Ziel:** Ein erster Satz an Landmarks und Videos, auf dem ein visuelles Erkennungsmodell laufen kann. Zu dieser Etappe gehören die Capacitor-App und die lokale Bereitstellung.

**Reihenfolge innerhalb der Etappe**

1. **App und lokal.** Capacitor-App für iOS und Android, Aufnahmen sicher lokal. Sobald das besteht, wählt die Person, was zur Nextcloud fließt: **Landmarks**, **komplette Videos** oder beides, pro Speicherort. Weitere Speicherorte: Sciebo (für Hochschulangehörige), iCloud/Google Drive.
2. **Öffnen im Hochschulraum.** Zuerst eine Hochschule, dann weitere. Neue Personen kommen **per Klick** dazu (Einladungslink oder QR, Konto, Ordner und Speicherort entstehen automatisch). Nutzbar als Vokabular für Kurse und Seminare.
3. **Referenzen.** Dozierende nehmen Vorlagen **selbst** auf. Lernende nehmen dazu auf: **abhängig** (nach einer Vorlage, gleiches Ziel, viele Ausführungen) oder **unabhängig** (frei, Bedeutung später geprüft). Dolmetschende prüfen als eigene Spur, ohne das Original zu verändern.
4. **Auswahl pro Eintrag.** Was bleibt **lokal**, was wird **geteilt**, was erscheint in der **Bibliothek**, in welcher Form geteilt wird. Lehrende sehen, was Lernende aufgenommen haben, und mit Zustimmung, wer was angesehen hat (Regel 2).
5. **Erster Datensatz und Erkennung.** Aus den bereitgestellten Landmarks und Videos entsteht der erste Satz, auf dem ein visuelles Erkennungsmodell läuft.
6. **Suche visuell zu visuell in Echtzeit,** sobald genug Landmarks und Videos bereitstehen. Ab welcher Menge, ist zu testen (siehe Entscheidungen).
7. **Erste Gespräche.** Schon hier dürfen Gespräche, also Übergänge, aufgenommen werden. Die gezielte Sammlung folgt in Etappe 3.

**Ergebnis nach außen:** Beispiel eines Kurses mit Vorlagen, Aufnahmen und geprüften Varianten, dazu die Echtzeit-Suche.

## Etappe 3: Weiterer Kreis und Gesprächswelle

**Ziel:** In einen weiteren Benutzerkreis öffnen, mit einem weiteren Ressourcenpunkt und dem Anreiz, **Gespräche aufzunehmen, die gezielt in einer Welle übernommen werden.** Damit lassen sich Übergänge zwischen Visuellem und Text glätten sowie Visuelles zu Text ausreichend modellieren.

1. **Tor:** Landing Page mit Warteliste und Countdown. Regelmäßige Kommunikation und Updates für alle, die schon dabei sind.
2. **Im Hintergrund:** Infrastruktur bereitstellen. Mit den vorhandenen Daten erste Trainings- und Glättungsmodelle entwickeln und spezifizieren, damit die Rechenzeit im Fenster nicht an Fehlern verloren geht.
3. **Lokal aufnehmen:** Teilnehmende nehmen im Countdown-Zeitraum Gespräche auf und behalten alles auf dem Gerät.
4. **Option SL2T prüfen:** am Ende der Etappe, **bevor abgeladen wird**. Weiterer Ressourcenpunkt nach dem Gesprächsablauf oder schon davor. Bei der breiten Öffnung gehört dazu regelmäßige Kommunikation über die weltweite Einbindung.
5. **Abladefenster:** Auf ein Signal hin wird das lokal Aufgenommene **einmal geöffnet**, als Landmarks oder mit Einwilligung als Video.
6. **Rechnen, Release, Zeigen:** Modelle trainieren, eingefrorenen Release erzeugen, Ergebnis zeigen. Speicher danach zurück auf Basis, Originale in ein Kaltarchiv.

**Größenordnung** für 220 Personen, 4 Wochen, je 30 Minuten Gespräch pro Woche und 10 Einzelgebärden pro Tag: etwa 440 h Gespräch (rund 0,5 TB Video, 18 GB Landmarks) plus 62.000 Einzelgebärden (rund 80 GB), zusammen rund 0,6 TB. Der knappe Punkt ist die gleichzeitige Last beim Abladen (Zeitfenster pro Gruppe), danach die GPU-Zeit.

**Ergebnis nach außen:** Modelle für Übergänge und Text, als Prototyp bezeichnet, und die Entscheidung, wie SL2T und andere eingebunden werden.

## Etappe 4: Wohin weiter

Hier wird geschaut, wohin das Interface und die Erkenntnisse aus Modellierung und Glättung von Bewegungen weiter genutzt werden können: andere Gebärdensprachen, Physio, Sport, Handwerk, übergreifende multimodale Aufnahme und Ähnlichkeit. Voraussetzung ist, dass Gestenlogik und Datenmodell sich in Etappe 2 und 3 bewährt haben. Das Domänenfeld im Eintrag hält die Tür offen.

## Parallele Spuren

### Partner und Anbieter

Gespräche mit Anbietern wie Google (SL2T) und Apple. Stand der Recherche am 27.10.2026:

- **SL2T** läuft nur für ASL zu Englisch (Pixel 11, Gboard und Live Transcribe). DGS ist nicht genannt, Google spricht allgemein von weiteren Gebärdensprachen ([DataNorth](https://datanorth.ai/news/google-deepmind-releases-sl2t)).
- **Apple:** In den iOS-27-Bedienungshilfen steht keine automatische Gebärdenerkennung. Neu ist eine Schnittstelle, um in FaceTime-Anrufe eine menschliche Dolmetschperson zu holen ([BGR](https://www.bgr.com/2177707/cool-new-ios-27-accessibility-features-look-forward-to-fall/)).

Regel: **Alles, was mit Anbietern besprochen wird, wird vor dem Abladen offengelegt.** Teilnehmende müssen wissen, wer Daten und Modell nutzen darf, bevor sie etwas freigeben.

Empfehlung: Die Haltung zu Anbietern steht fest, **bevor der Countdown öffnet**, damit der Einwilligungstext sie abdeckt. Der Punkt am Ende von Etappe 3 ist dann Umsetzung und keine Überraschung.

### Oberfläche erkunden

Design und Bedienung für andere multimodale Anwendungen, ohne die erste Anwendung zu verwässern. Ergebnisse gehen in [DESIGN.md](DESIGN.md).

## Regeln, die für alle Etappen gelten

1. **Einwilligung pro Clip und Zweck.** Stufen: privat, Gruppe, Training als Landmarks, Training als Video, Release. Jederzeit änderbar. Widerruf entfernt die Dateien im Trainingsbereich, kann aber ein bereits trainiertes Modell nicht ungeschehen machen. Das steht in der Einwilligung, bevor jemand etwas freigibt.
2. **Ansehen ist personenbezogen.** „Wer hat was angesehen“ für Lehrende nur mit Zustimmung der Lernenden, sichtbar für diese und abschaltbar. Vorab mit dem Datenschutz der jeweiligen Hochschule klären. Das ist keine Rechtsberatung.
3. **Sprache als Feld.** Der deutschsprachige Raum umfasst mehr als eine Gebärdensprache (DGS, ÖGS in Österreich, DSGS in der Deutschschweiz). Jeder Eintrag trägt die Sprache, sonst vermischen sich die Trainingsdaten.
4. **Referenz als Feld.** Art (abhängig oder unabhängig) und bei abhängig die ID der Vorlage.
5. **Lizenz der Vorlagen.** Wem gehören die Referenzvideos der Lehrenden, und was dürfen Lernende damit tun? Vor Etappe 2 klären.
6. **Sciebo ist verteilter Speicher nur für Hochschulangehörige**, Gäste haben keinen eigenen. Der Betreiber sichert nicht. Alle anderen nutzen die Nextcloud oder lokalen Speicher.
7. **Übersetzung zu Gesprächen.** Gesprächsvideos ohne deutschen Text taugen für Ähnlichkeit und Vortraining, nicht für DGS zu Text. Wer liefert in Etappe 3 den Text, bleibt zu entscheiden.

## Offene Entscheidungen

1. Wer nimmt in Etappe 2 die Vorlagen auf, und unter welcher Lizenz?
2. Welche Hochschule macht in Etappe 2 den Anfang?
3. Welche Datenmenge muss vorliegen, bevor die Echtzeit-Suche in Etappe 2 startet? Das ist an öffentlichen Daten und ersten Aufnahmen zu testen.
4. Wer liefert in Etappe 3 die deutsche Übersetzung zu den Gesprächen (die Gebärdenden direkt danach, Dolmetschende oder beide)?
5. Welche Voreinstellung gilt für das Abladefenster: nur Landmarks oder auch Videos?
6. Wann beginnt Etappe 3, und bis wann muss ein Antrag auf Hochschulrechenzeit (NHR) gestellt sein?
7. Rechtsform für den Bereich „Beitragen“ (privat, Hochschulprojekt, Verein).
8. Gibt es für die Sicht „wer hat was angesehen“ eine Lösung, die die Hochschulen akzeptieren?
