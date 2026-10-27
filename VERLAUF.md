# Sign – Projektverlauf

Neuester Eintrag steht oben. Jeder Chat in diesem Projekt ergänzt hier nach einer längeren Sitzung einen Eintrag.

## Regeln für alle Chats
- Nach einer längeren Sitzung (viele Nachrichten, Entscheidungen oder neue Dateien) am Ende einen Eintrag oben unter „Einträge“ ergänzen – ohne Nachfrage.
- Nur Festgehaltenes eintragen: was entschieden, gebaut oder verworfen wurde. Keine Vermutungen.
- Begriffe des Projekts verwenden: Line, Line Button, Search, Edit Context, Edit Button, Visuell Geste, Etappe 1/2.
- Stil je nach Sitzung wählen (siehe unten), Kürzel in die Überschrift schreiben.
- Der Verlauf liegt doppelt: im Claude-Projekt (claude/verlauf.md) und hier im Repo (VERLAUF.md). Beide gleich halten.

## Zusammenfassungsstile

**[S] Sitzungs-Log** – Standard nach jeder längeren Sitzung
- Thema · Entschieden · Erledigt · Offen · Nächster Schritt (je 1–3 Punkte)

**[E] Entscheidung** – wenn eine grundlegende Weiche gestellt wurde
- Entscheidung · Alternativen, die verworfen wurden · Warum · Folgen für App/Infrastruktur

**[D] Design** – bei Arbeit an Oberfläche, Gesten, Spuren
- Was sich am Kern/den Spuren geändert hat · Gesten · was in den Entwurf vs. ins Hauptprojekt geht (Hauptprojekt nur nach Freigabe)

**[T] Technik** – bei Nextcloud, Sciebo, Repo, Code
- Komponente · was geändert wurde · wie man es von Hand nachbauen/nachvollziehen kann · Imports/Herkunft

**[W] Wochen-Update** – automatisch einmal pro Woche
- Kurzfassung in 3 Sätzen · Entscheidungen der Woche · Fortschritt Etappe 1 / Etappe 2 · offene Punkte · Fokus nächste Woche

**[M] Monats-Abgleich** – einmal im Monat
- Stand gegenüber 1-Jahres-Ziel · Zeitplan (Woche 1, Woche 2, danach) · Teilnehmende/Skalierung · Kurskorrektur

## Einträge

### 2026-10-28 · [S] Verlauf auf GitHub
- Erledigt: Projektanweisung gesetzt, damit jeder Chat automatisch in den Verlauf einträgt
- Erledigt: Verlauf als VERLAUF.md ins Repo signclip/signclip gelegt; das Wochen-Update hält Projekt und Repo gleich

### 2026-10-28 · [W] Wochen-Update
Zeitraum: 21.10.–28.10.2026 · Quellen: dieser Verlauf und 42 Änderungen im Repo signclip/signclip (Branch main)

**Kurzfassung**
Das Hauptprojekt wurde im Repo neu aufgesetzt: der alte SignClip-Prototyp liegt jetzt als Version 1 im Ordner „InitialVersion“, die Projektdokumente stehen auf der obersten Ebene. Die eigene Nextcloud bei Hetzner läuft, und Sciebo ist über eine Freigabe angebunden – der Test war erfolgreich. Der Großteil der Arbeit floss in die Test-App für die Nextcloud (Anmelden, Ordner, Freigaben an Sciebo) und in einen überarbeiteten Etappenplan.

**Entscheidungen der Woche**
- Eigene Nextcloud bei Hetzner (1 TB) als erste Lösung; Gruppe „Sign-Students“ angelegt.
- Kein Cloudflare-Worker; Konten vorerst von Hand in der Nextcloud. Der Cloudflare-Helfer wurde aus der Test-App entfernt.
- Sciebo wird per Freigabe an die Sciebo-ID eingebunden (Test erfolgreich, wird übernommen).
- Anmeldung in der Web-App mit benutzer@server und Passwort; die Handy-App (Capacitor) kommt später.
- Hauptprojekt neu im Repo signclip/signclip; Zugangsdaten kommen nicht ins öffentliche Repo.
- Etappenplan überarbeitet: jetzt vier Etappen plus eine eigene Welle für SL2T mit eigener Zustimmung. Die App und das Speichern auf dem Gerät gehören zu Etappe 2. Ein Ressourcen-Bereich (Nachricht, Unterstützung auch über PayPal) gehört zu Etappe 1.
- Zentraler Verlauf in dieser Datei mit Zusammenfassungsstilen und wöchentlichem Update eingerichtet.

**Fortschritt Etappe 1** (persönliche Ordner, Gruppenordner, Sciebo-Einbindung mit einem Klick, Design um den Kern)
- Test-App für die Nextcloud gebaut: Anmelden, ganzen Ordnerbaum anzeigen, Zielordner beim Speichern automatisch anlegen, Schreibtest für ausgewählte Ordner.
- Freigaben an Sciebo: Sciebo-Link direkt übernehmen (ohne ID abtippen), bereits freigegebene Ordner werden grün markiert, Hinweis bei „Ausstehende Freigaben“, Prüfung, ob eine Freigabe angekommen ist.
- Baustein „Nextcloud-Ordner in Sciebo sichtbar machen“ aus der Test-App ins Hauptprojekt übernommen.
- Aufnahme: Fokus-Rahmen (Kreis, abgerundetes Rechteck, Ellipse) mit Größe und Außenbereich; Hintergrund ersetzen vorbereitet (Original, neutral, Farbe), Original und bearbeitete Fassung werden gemeinsam gespeichert; MP4 bevorzugt.
- Speicherorte als eigenes Modul, nur mit Gesten bedienbar.

**Fortschritt Etappe 2** (Spurreferenzen, visuell-zu-visuell, Speicherregeln)
- Noch nichts gebaut. Der Plan dafür steht jetzt im Etappenplan (App, lokales Speichern, Auswahl Landmarks/Video, Referenzen durch Lehrende und Lernende).

**Offene Punkte**
- Projektanweisung setzen, damit jeder Chat automatisch in den Verlauf einträgt.
- Die Nextcloud-Test-App im Repo ist vorübergehend und soll später ersetzt werden.
- Laut Etappenplan vor Etappe 1 noch zu testen: Zugriff der Browser-App auf die Nextcloud (CORS), Schreib- und Lese-Konto, Einladungslink.
- Elf offene Fragen im Etappenplan, z. B. welche Hochschule in Etappe 2 beginnt, wer die Vorlagen aufnimmt und unter welcher Lizenz, und Rechtsform/Steuern für den PayPal-Bereich.

**Fokus nächste Woche**
- Projektanweisung für den Verlauf setzen (als nächster Schritt festgehalten).
- Die noch offenen Tests aus Etappe 1 durchführen (laut Etappenplan).
- Ein genauer Wochenplan wurde nicht festgehalten.

### 2026-10-28 · [S] Verlauf eingerichtet
- Entschieden: zentraler Verlauf in dieser Datei, wöchentliches automatisches Update, Zusammenfassungsstile S/E/D/T/W/M
- Nächster Schritt: Projektanweisung setzen, damit jeder Chat automatisch einträgt

### Stand bis 2026-10-27 · [E] Bisherige Grundentscheidungen
- Eigene Nextcloud bei Hetzner (1 TB) als erste Lösung, eingerichtet; Gruppe „Sign-Students“ angelegt
- Kein Cloudflare-Worker; Konten vorerst händisch in der Nextcloud
- Sciebo per föderierter Freigabe an die Sciebo-ID eingebunden (Test erfolgreich, wird übernommen); „External storage support“ aktiv
- Web-App-Anmeldung mit benutzer@server und Passwort; Capacitor-App später (noch kein Entwickler-Account)
- Hauptprojekt neu im Repo signclip/signclip; SignClip-Prototyp = Version 1; Nextcloud-Test im Repo wird später ersetzt
- Zugangsdaten nicht ins öffentliche Repo
- Etappe 1: persönliche Ordner, Gruppenordner, Sciebo-/Freigabe-Einbindung mit einem Klick, vollständiges modulares Design um den Kern
- Etappe 2: Spurreferenzen auf Kontext anderer, visuell-zu-visuell über Landmarks, Speicherregeln
