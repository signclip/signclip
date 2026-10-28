# Architektur: Modelle, Module, Speicher und Phasen

Stand: 28.10.2026 · Status: **Startweg beschlossen (Abschnitt 1), Rest Entwurf zur Freigabe** · Vereinigt die frühere Repo-Fassung (Datenmodelle, Module, Bauplan) mit dem Projektdokument `claude/architektur.md` v2.2 (Speicher, Rollen, Phasen). Zahlen zu Speicherbedarf, Modellen und Teilnahme stehen in [INFRASTRUCTURE.md](INFRASTRUCTURE.md), die Recherche in [RESEARCH.md](RESEARCH.md), die Stufen für Nutzende in [ETAPPEN.md](ETAPPEN.md).

Die Komponentenkarte der ersten Version steht in [InitialVersion/ARCHITECTURE.md](InitialVersion/ARCHITECTURE.md) (13 Bausteine in einer `index.html`, verbunden über globale Variablen). Der Neustart trennt sie.

**Begriffe des Projekts:** Line (Zusammenstellung, ersetzt „Aufnahme“ und „Playlist“), Spur (einzelne Datenreihe), Context (Chips mit Klammern), Search, Edit Context, Visuell Geste. Das Kontext- und Verbindungsmodell wird in einem eigenen Arbeitsstrang ausgearbeitet und löst die vorläufigen Modelle in Abschnitt 4 ab.

---

## 1. Startweg (beschlossen am 27.10.2026)

Gilt für die Einzelnutzung und das langsame Ausrollen, **bevor es die Capacitor-App gibt**. Es gibt noch keinen Entwickler-Account, daher zuerst nur die Browser-Version.

### 1.1 Kern: eine eigene Nextcloud
- Eine eigene Nextcloud (Hetzner Storage Share, 1 TB, verwaltet) ist der **zentrale Speicher**. Sie ist eingerichtet, die Gruppe „Sign-Students“ besteht. „External storage support“ ist aktiv.
- **Konten** legt zu Beginn die Betreuung **von Hand** in der Nextcloud an. Ein Einladungs-Skript und „ein Klick aus der App“ kommen erst mit der Capacitor-App. Ein Cloudflare-Worker wird nicht verwendet.
- **Standard bis zur App:** Videos **und** Landmarks werden **vollständig** in die Nextcloud gespeichert (Landmarks, sobald die App sie erzeugt; vorher nur Videos + Kontext).
- **Anmeldung** in der Web-App mit `benutzer@server` und Passwort (Server-Adresse wird daraus abgeleitet). Zugangsdaten stehen nie im öffentlichen Repo.

### 1.2 Speicherorte in der App
Wählbar, jeweils als **„immer speichern“** (umrandet) oder **nur über das Teilen-Menü**:
- **Lokal** (Gerät, Ordner; mit Capacitor dauerhaft sicher)
- **iCloud / Google Drive** (über Ordner bzw. Teilen; direkt mit Capacitor)
- **Sciebo** (Konto oder Freigabelink)
- **Nextcloud** – persönlicher Ordner, Gruppenordner, öffentliche Freigaben

Zusätzlich pro Clip oder Serie: **Daten dauerhaft zur Verfügung stellen** (gemeinsamer Trainingsbereich) – als **Landmarks** oder **komplette Videos**, mit Einwilligung (Abschnitt 3.3).

### 1.3 Ein Klick nach außen
- **In Sciebo einbinden:** Ordner aus der Nextcloud föderiert **nur lesend** an die Sciebo-ID teilen, in Sciebo einmal „Annehmen“. **Im Test erfolgreich (27.10.2026) und für die endgültige Version übernommen.** Code und Tests: [freigabe.js](freigabe.js), [freigabe.test.mjs](freigabe.test.mjs), [FREIGABE-AN-SCIEBO.md](FREIGABE-AN-SCIEBO.md). Freigaben werden in der Web-Version nach Öffnen im Browser von Hand angenommen.
- **Öffentliche Gruppenfreigaben verbinden:** Sciebo-Freigabelinks werden in der Nextcloud als externer Speicher eingebunden (Server zu Server, kein CORS) und erscheinen in der App als eigene Karten.
- **Weitergeben:** alles in der Nextcloud kann angesehen, heruntergeladen, geteilt, in andere Clouds oder lokal kopiert werden.

### 1.4 Hinein nur über die App
- **Kein Inhalt außerhalb der App** in die Nextcloud. Umsetzung Stufe 1: pro Person ein unsichtbares **Schreib-Konto** (nur in der App), Ordner an das optionale **Lese-Konto** nur lesend geteilt; mit Capacitor zusätzlich Regel „Schreiben nur mit SignClip-Kennung“. Stufe 2 (später): Schreiben nur über den Sign-Zugang mit Prüfung.
- **Ausnahmen** über die Nextcloud selbst: ein Ordner `import/` mit Schreibrecht für ausgewählte Personen; die App übernimmt Dateien von dort ins SignClip-Format (Kontext ergänzen, JSON anlegen).

### 1.5 Vor dem Start zu testen
1. CORS für die Browser-App über WebAppPassword (WebDAV und Freigabe-Schnittstelle)
2. Sciebo-Freigabelink und ganzes Sciebo-Konto als externer Speicher (auch „vom Benutzer eingegeben“)
3. Föderiertes Teilen Nextcloud → Sciebo (nur lesend): **erfolgreich getestet**; automatisches Annehmen offen
4. Schreib-/Lese-Konto-Modell, Gruppenordner, `import/`
5. Einladungslink → Speicherort mit einem Tippen

Fällt 1 oder 2 durch: kleine eigene Nextcloud statt Storage Share (gleiches Konzept).

---

## 2. Leitgedanken

1. **Lokal zuerst.** Jedes Gerät ist der Hauptspeicher der eigenen Aufnahmen, in voller Qualität. Alles Weitere ist Kopie: persönliche Sicherung, Teilen, Training. (Vollständig mit der Capacitor-App; bis dahin ist die Nextcloud der verlässliche Hauptspeicher.)
2. **Die App ist die einzige Oberfläche** – zum Hineinspeichern sogar die einzige erlaubte.
3. **Erst Video, später Landmarks.** Sobald die App Landmarks erzeugt, kommen sie dazu. Langfristig können Speicherorte **nur noch Landmarks** bekommen.
4. **Daten zuerst.** Dateien und Begleitdatei in offenen Formaten sind die Wahrheit. Index, Embeddings und Vorschaubilder sind neu berechenbar. Speicher wechseln heißt Dateien kopieren.
5. **Versioniertes Schema.** Jede Begleitdatei trägt eine `schema`-Version. Alte Versionen bleiben lesbar, auch die der ersten Version (`<video>.json`, ältere `index.json`).
6. **Abhängigkeiten zeigen nach innen.** Oberfläche kennt Logik, Logik kennt Modelle, Modelle kennen nichts. Reine Logik (Modelle, Kontext, Suche, Gestentabelle) ist ohne Browser testbar.
7. **Technik hinter Schnittstellen.** Kamera, Speicher, Spracherkennung und MediaPipe sind Adapter; ein Wechsel ändert nur den Adapter.
8. **Rechnen auf dem Gerät.** Landmarks, Index, Suche und Neuberechnung mit besseren Modellen laufen auf den Geräten.
9. **Kein Build-Schritt am Anfang.** ES-Module direkt im Browser; ein Build kommt, wenn er einen Nutzen belegt.
10. **Neue Infrastruktur erst bei Bedarf** (Abschnitt 9).
11. **Gebärdensprache ist der erste Spezialfall** eines allgemeinen Musters „Bewegung + Kontext“.

---

## 3. Speicherrollen

Jeder Speicherort in der App bekommt eine **Rolle** und einen **Inhalt** und ist entweder **„immer speichern“** oder **nur im Teilen-Menü**.

### 3.1 Rollen
| Rolle | Wem gehört es | Zweck | Beispiele |
| --- | --- | --- | --- |
| **Persönlich** | der Person | Hauptbestand und Sicherung, eigene Geräte abgleichen | Gerät; persönlicher Nextcloud-Ordner; Sciebo (Konto oder Freigabelink); iCloud/Google Drive |
| **Gruppe** | der Gruppe | Teilen mit Lernenden, Dolmetschenden, Kursen | Nextcloud-Gruppenordner; öffentliche Freigaben; eingebundene Sciebo-Freigaben |
| **Gemeinsam (Training)** | dem Projekt | Daten für Modelle, Sichtung, Releases | Trainingsbereich in der Nextcloud, später Objektspeicher |

### 3.2 Inhalt pro Speicherort
| Einstellung | was dorthin geht | wann sinnvoll |
| --- | --- | --- |
| **Video + Kontext** | Video, JSON | Anfang (vor Landmarks), persönliche Sicherung |
| **Beides** | Video, JSON, Landmarks | **Standard in der Nextcloud bis zur App**, Training mit Neuberechnung |
| **Nur Landmarks + Kontext** | JSON, Landmarks | Gruppe und Training langfristig; datensparsam, klein |

Bedienung wie bei den Speicherort-Karten (nur Gesten), der Inhalt ist eine weitere Eigenschaft der Karte. Ein Wechsel gilt für neue Aufnahmen; vorhandene Videos bleiben, bis die Person sie entfernt.

### 3.3 Einwilligung pro Clip und Zweck
`privat` → `gruppe` → `training: landmarks` → `training: video` → `release` (öffentlich, nur Landmarks + Kontext). Getrennt davon steht die **Weitergabe an Dritte** (z. B. SL2T, eigene Welle mit eigener Einwilligung, siehe [ETAPPEN.md](ETAPPEN.md)).
Die Einwilligung steht im JSON und ist jederzeit änderbar. Der Trainingsbereich nimmt nur, was freigegeben ist; Widerruf entfernt die Dateien dort, bereits trainierte Modelle lassen sich dadurch nicht zurücknehmen.

### 3.4 Video-Status pro Clip
`lokal` · `persönlich gesichert` · `ausgelagert` (nur noch in persönlicher Cloud) · `entfernt` (nur Landmarks vorhanden). Die Suche funktioniert in allen Fällen über Kontext und Landmarks.

---

## 4. Datenmodelle (vorläufig)

Wenige, klare Modelle, die Jahrzehnte überdauern. **Vorläufig**, bis das Kontext- und Verbindungsmodell steht (Dokument mit Datenschema und Tests, vor dem Design). Bereits entschieden (28.10.2026):
- **Spur** = einzelne Datenreihe einer Aufnahme; jede Spur wird einzeln gespeichert, mit Benutzer, Datum und, wenn berechnet, Modell, Erstelldatum und Herkunft.
- **Line** = Zusammenfassung aller verwendeten Spuren. Sie ersetzt den Begriff „Aufnahme“ und verallgemeinert die Playlist. Lines können andere Lines enthalten (Clusterung). Sie ist eine Zusammenstellung aus originalen oder berechneten Elementen mit originalen oder berechneten Übergängen und eine **eigene Zusammenstellungsdatei**.
- **Stapel:** oben der neueste Schritt, ganz unten der erste; der Eintrag darunter ist jeweils der frühere Schritt. Jeder Eintrag ist ein Line-Element mit ggf. mehreren Spuren. Jeder Stapel gehört genau einer Person; Referenzen auf einen Index ermöglichen gemeinsame Ausgangspunkte.
- **Template** = geclusterter Stapel: ein Obercluster mit eigener Spur, über Kontext oder visuell auffindbar. Ist der oberste Eintrag ein Platzhalter, ist es ein Template; ist er gefüllt, gilt es als Kategorie-Zuordnung.
- **Context** (Kontextmodell v1): Chips auf einer Ebene, alles Weitere über die Art der Klammer. Runde Klammer = ausmultiplizieren; eckige Klammer = Fingeralphabet Buchstabe für Buchstabe. Offene Punkte stehen in [VERLAUF.md](VERLAUF.md).

| Modell | Zweck | Wichtige Felder (vorläufig) |
| --- | --- | --- |
| **Line** | Aufnahme oder Zusammenstellung aus Spuren | `id`, `author`, `created`, `tracks[]`, `context`, `markers[]`, `status`, `rights`, optional `lines[]`, `term?`, `variant?`, `session?`, `segment?` |
| **Track** (Spur) | eine Datenspur | `kind` (`video`, `audio`, `text`, `landmarks`, `annotation`), `file`, `range?`, `derivedFrom?`, `model?` (Name, Version, Datum) |
| **Context** | Chips mit Klammern | `main[]` (bleibend), `local[]` (nur dieser Clip), je Tag: `text`, `time?`, `group?` |
| **Location** (Speicherort) | wo gespeichert und geladen wird | `kind` (`local`, `webdav`, `share`), `role`, `content`, `saveAlways` |
| **Review** (Sichtung) | Bestätigung oder Korrektur | `lineId`, `reviewer`, `date`, `changes`; eigene Spur, überschreibt nie |
| **Rights** | Einwilligung und Lizenz | `consent` (Stufen 3.3), `license`, `visibility` |

Zusätzliche Felder, die ab sofort im JSON stehen: **Sprache** (DGS/ÖGS/DSGS), **Referenz** (abhängig/unabhängig plus Vorlagen-ID), **Domäne**, **Herkunft** und **Modellversion pro Embedding**.

Regel für Spuren: Jede Spur darf fehlen. Eine Line mit nur Text ist gültig, ebenso eine mit nur Video. Das trägt später die Ergänzung einer fehlenden Dimension (vorgeschlagen, nie still gespeichert).

Die Struktur **Begriff** (Bedeutung), **Variante** (regional, individuell) und **Aufnahme** bleibt optional; die Zuordnung kommt aus der Sichtung, nicht aus der Aufnahme.

---

## 5. Schichten und Module

```
┌──────────────────────────────────────────────────────────────────────┐
│ GERÄT  – Capture ─ Kontext ─ Line ─ Search ─ Teilen ─ Speicherorte   │
│  MediaPipe/LiteRT → Landmarks (auch nachträglich für alte Videos)    │
│  Embeddings · lokaler Index · (mit Capacitor: Hauptspeicher)          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ WebDAV, schreiben NUR über die App
┌───────────────────────────────▼──────────────────────────────────────┐
│ EIGENE NEXTCLOUD (Start: Storage Share)                              │
│  persönliche Ordner · Gruppenordner · Trainingsbereich · import/     │
│  eingebunden: Sciebo-Freigaben / Sciebo-Konten (externer Speicher)   │
└───────┬───────────────────────┬───────────────────────┬──────────────┘
        │ föderiert, nur lesen  │ Links, Download, Sync │ Releases
   ┌────▼──────┐        ┌───────▼────────────┐   ┌──────▼─────────────────┐
   │ Sciebo    │        │ andere Clouds,     │   │ RECHNEN: GPU / NHR     │
   │ (sichtbar)│        │ lokal, Messenger   │   │ AUSTAUSCH: Zenodo, HF  │
   └───────────┘        └────────────────────┘   └────────────────────────┘
```

### 5.1 Gerät
- **Browser-Version** bis zur App: speichert über WebDAV in die Nextcloud (CORS dort freigegeben).
- **Capacitor-App** (iOS/iPadOS/Android): Videos sicher im App-Ordner, direkter Zugriff auf jeden WebDAV-Server (auch Sciebo ohne Umweg, `CapacitorHttp` umgeht CORS), Schreib-Kennung für die Nextcloud-Regel.
- Speicher-Adapter (Ausbau von `storage.js`): **Lokal**, **WebDAV** (Nextcloud, Sciebo-Konto, Sciebo-Freigabelink, jeder WebDAV-Server), später **Sign-Speicher** (Objektspeicher über Sign-Zugang).

### 5.2 Eigene Nextcloud
- **Konten:** pro Person ein Schreib-Konto (nur App) und optional ein Lese-Konto (Web, Desktop).
- **Ordner:** `personen/<person>/`, `gruppen/<gruppe>/`, `training/`, `import/` (Ausnahmen).
- **Sciebo herein:** Freigabelinks oder ganze Konten als externer Speicher.
- **Nach außen:** föderiert nur lesend nach Sciebo, öffentliche Nur-Lese-Links, WebDAV als Laufwerk, Download/Sync.

### 5.3 Gemeinsamer Speicher (Training)
- **Start:** Trainingsbereich in der eigenen Nextcloud.
- **Wenn Verbindungen/Stufen zum Engpass werden oder > ~10 TB:** Objektspeicher (S3, EU) + **Sign-Zugang** (kleines Skript für Einladung, Rechte, Prüfung, kurzlebige Upload-Links; keine Videos laufen hindurch).

### 5.4 Module der App

| Modul | Aufgabe | Hängt ab von | Reine Logik? |
| --- | --- | --- | --- |
| `model` | Typen, Schema, Validierung, Migration alter Formate | – | ja |
| `context` | Chips, Klammern, Hauptkontext und Kontext, Zerlegung von Sätzen | `model` | ja |
| `search` | Treffer, Synonyme, Reihenfolge; später Ähnlichkeit | `model`, `context` | ja |
| `interaction` | Tabelle Aktion × Geste × Modus, Absichten, Hilfe aus Tabelle | `model` | ja |
| `storage` | Schnittstelle `list / read / write` mit Adaptern Ordner, WebDAV, Freigabelink | `model` | nein (I/O) |
| `capture` | Kamera und Mikrofon, Aufnahme zu Blob und Meta | `model` | nein (I/O) |
| `speech` | Stichwörter und Sprache zu Text | `interaction` | nein (I/O) |
| `analysis` | MediaPipe-Landmarks, Embeddings, hinter einer Schnittstelle | `model` | teils |
| `compose` | Schnitte, Zusammenfügen, Übergänge glätten (berechnet, getrennt in `derived/`) | `model`, `storage` | teils |
| `ui` | Ansichten Aufnahme, Search, Sichtung, Einstellungen | alle oben | nein |
| `app` | Verdrahtung, Start, Einstellungen | alle | nein |

Abhängigkeitsrichtung: `app → ui → (interaction, search, context, capture, speech, storage, compose, analysis) → model`.

### 5.5 Schnittstellen (Skizze)
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

### 5.6 Datenformat und Dateilayout
```
<speicher>/personen/<person>/<YYYY-MM>/<id>.mp4      Video (wenn Inhalt = Video/beides)
<speicher>/personen/<person>/<YYYY-MM>/<id>.json     Kontext, Einwilligung, Video-Status, Modellversion, Domäne, Herkunft
<speicher>/personen/<person>/<YYYY-MM>/<id>.pose     Landmarks (später; Format siehe RESEARCH.md)
<speicher>/gruppen/<gruppe>/<id>.json + .pose (+ .mp4 anfangs)   geteilt
<speicher>/gruppen/<gruppe>/<id>.sicht.<person>.json             Sichtung, nur anhängen
<speicher>/training/…  releases/vN/  index/<gruppe>/vN.*  import/
```
Das bewährte Muster der ersten Version bleibt: **eine Begleitdatei pro Video, kein gemeinsames Index-File**, so können mehrere Personen in denselben Ordner schreiben. Die heutige Ablage (Video + `<video>.json` daneben) bleibt lesbar; die Struktur oben gilt für neue Speicherorte. Sichtungen und abgeleitete Spuren sind eigene Dateien, die nur ergänzt werden.

---

## 6. Abläufe

**Einladen:** Anfangs von Hand: Konto und Ordner in der Nextcloud, Gruppe „Sign-Students“, Zugang und Link an die Person. Später Skript → Einladungslink/QR → in der App ein Tippen → Speicherort fertig, Gruppenordner und eingebundene Sciebo-Freigaben erscheinen als eigene Karten.

**Aufnehmen:** Video aufs Gerät → (später) Landmarks → automatisch in Speicherorte mit „immer speichern“, jeweils mit deren Inhalt.

**Zur Verfügung stellen:** Clip oder Serie → Einwilligung setzen → App kopiert in den Trainingsbereich, was die Einwilligung erlaubt.

**In Sciebo sichtbar machen:** Teilen → „In Sciebo anzeigen“ → Sciebo-Link oder -ID (einmalig) → in Sciebo „Annehmen“.

**Umstieg auf Landmarks:** sobald stabil: Gruppen und Training auf „nur Landmarks“ → Geräte erzeugen Landmarks für ältere Videos nach → zentrale Videos bleiben (mit Einwilligung) oder werden entfernt.

**Besseres Modell:** Geräte rechnen ihre lokalen Videos neu → neue Landmarks in den Trainingsbereich.

**Sichten, Releases, Training:** wie in [INFRASTRUCTURE.md](INFRASTRUCTURE.md).

---

## 7. Speicherbedarf und Kosten

### 7.1 Pro Person (Annahmen aus INFRASTRUCTURE.md)
| Nutzung | pro Jahr |
| --- | --- |
| 20 Einzelgebärden/Tag | ca. 9 GB |
| + 30 min Gespräch/Woche | + ca. 29 GB |
| Landmarks für alles | < 1 GB |

### 7.2 Zentraler Speicher – Vergleich (netto pro Monat, Okt. 2026)
| Menge | Storage Share (Nextcloud) | Storage Box | Objektspeicher (S3) |
| --- | --- | --- | --- |
| 1 TB | 4,29 € | 3,20 € | 6,49 € |
| 5 TB | 14,19 € | 10,90 € | ca. 32 € |
| 10 TB | 27,39 € | 20,80 € | ca. 65 € |
| Gleichzeitige Verbindungen | 50 / 100 / 200 je Stufe | 10 | praktisch unbegrenzt |
| Direkt aus Browser (CORS) | mit Zusatz-App (zu testen) | nein | ja |
| Eignung | **Start**, bis ~10 TB | Sicherung | ab Engpass, beliebig groß |

Bis zur App liegen Videos und Landmarks vollständig zentral: ca. 9 GB pro Person und Jahr (ohne Gespräche), 20 Personen ≈ 0,2 TB/Jahr, 220 Personen ≈ 2 TB/Jahr (plus Gespräche). Mit „lokal zuerst“ und „später nur Landmarks“ sinkt der zentrale Bedarf deutlich. Die Zahlen in [INFRASTRUCTURE.md](INFRASTRUCTURE.md) (Abschnitt 3) weichen davon leicht ab, weil sie mit anderen Annahmen rechnen; beide sind Schätzungen. Echte Clipgrößen sind noch zu messen.

---

## 8. Phasen mit Auslösern

| Phase | Auslöser | Neu dazu | Laufende Kosten |
| --- | --- | --- | --- |
| **0 – jetzt** | Einzelnutzung, langsames Ausrollen | eigene Nextcloud (Storage Share 1 TB), Konten von Hand, Schreib-/Lese-Konten, Sciebo eingebunden (beide Richtungen), Videos vollständig | ca. 4–5 €/Monat |
| **1 – App** | Capacitor (Android zuerst, Entwickler-Account nötig) | lokaler Hauptspeicher, iCloud/Drive direkt, Sciebo direkt, Schreib-Kennung, Einladungs-Skript, Rollen + Inhalt + Einwilligung pro Clip | + Apple-Konto für iOS |
| **2 – Landmarks** | MediaPipe in der App (Web zuerst) | Landmarks bei Aufnahme + nachträglich, Inhalt „beides“, Suche über Landmarks | – |
| **3 – Gruppe wächst** | ~20–200 Personen | größere Stufe, Sicherung Storage Box, Stufe 2 (Schreiben mit Prüfung) | ca. 10–35 €/Monat |
| **4 – Modelle** | Release v1 | Training GPU-Stunden/NHR, Releases (Zenodo), Gruppen/Training auf „nur Landmarks“ | GPU nach Bedarf |
| **5 – Skalierung** | Engpass Verbindungen/Stufen, > ~10 TB | Objektspeicher + Sign-Zugang; Archiv für zentrale Videos | ab ca. 65 €/Monat |
| **6 – Föderation** | mehrere Bibliotheken/Organisationen | zentraler Vektor-Index, Föderation | je nach Umfang |

Zuordnung der Etappen aus [ETAPPEN.md](ETAPPEN.md) zu diesen Phasen ist ungefähr: Etappe 1 ≈ Phase 0, Etappe 2 ≈ Phase 1–2, Etappe 3 ≈ Phase 3–4.

---

## 9. Wann lohnt ein eigener Server?

**Speicher:** Ein eigener Speicherserver (z. B. 4 × 22 TB, ≈ 44 TB nutzbar, ca. 104 €/Monat netto, Preis von 2024, prüfen) plus Sicherung wird gegenüber Objektspeicher ab ca. **20–25 TB** zentral warm gehaltener Daten günstiger; gegenüber Storage Share erst deutlich später. Mit Landmarks statt Videos (ca. 0,3 TB/Jahr bei 220 Personen) wird diese Menge praktisch nur erreicht, wenn **Videos zentral** gesammelt werden (Größenordnung „SL2T für DGS“).

**Rechnen:** GPU-Server rechnerisch fast nie (Monatsmiete > Mietstunden eines Monats); Training stundenweise oder NHR.

**Eigener Server sinnvoll, wenn mindestens eins zutrifft:**
1. mehr als ca. 20–25 TB zentral, die schnell verfügbar sein müssen
2. regelmäßige Stapelverarbeitung zentraler Videos
3. zentraler Index / Föderation (kleiner Server reicht)
4. Vorgabe von Hochschule oder Förderung → Hochschul-Rechenzentrum zuerst fragen
5. Storage Share kann CORS oder Sciebo-Einbindung nicht (Testtag) → kleine eigene Nextcloud

---

## 10. Langfristige Verknüpfungen (Kurzfassung)

| Bereich | Verknüpfungen | Vorsorge heute |
| --- | --- | --- |
| Identität | Einladungscode/QR, Hochschul-Login (DFN-AAI/eduGAIN), ORCID, Passkeys | Personen-ID getrennt vom Namen, weitere Anmeldewege andockbar |
| Speicher | Nextcloud, Sciebo/Landesdienste, iCloud/Drive, Storage Box, Objektspeicher, Archiv | WebDAV-Adapter, Rollen + Inhalt pro Speicherort |
| Forschungsdaten | Zenodo, Hugging Face, NFDI (Text+), DGS-Korpus, YouTube-SL-25, Pose-Format, SignWriting/HamNoSys | `.pose`-Format, Einwilligung pro Zweck, Lizenzen |
| Modelle | MediaPipe/LiteRT, EmbeddingGemma, SignGemma/SL2T (falls offen), NHR, föderiertes Lernen (später) | Modellversion pro Clip, Releases als Trainingseingang |
| Partner | DFKI (RoGSiLT), sign.mt, BIGEKO, Gehörlosenverbände, Dolmetsch-Studiengänge, VHS-Kurse | offene Formate, Governance früh (Muster AISLAC) |
| Lernen | Kurse, Moodle/ILIAS (LTI), Karteikarten-Export | Line als exportierbarer Lernpfad |
| Eingabe/Geräte | DGS-Tastatur in jeder App, Videoanrufe (Jitsi/BBB), Brillen, Avatare als Abnehmer | Capture-Kern unabhängig von der Oberfläche |
| Über DGS hinaus | Physio, Sport, Handwerk, Robotik | Domänen-Feld im JSON |
| Föderation | Bibliotheken verbinden, Cluster beschreiben | stabile IDs, Herkunft, Einwilligung „föderiert sichtbar“ |
| Organisation | Förderung (z. B. Prototype Fund, Aktion Mensch, DFG/BMBF), Rechtsform | – |

---

## 11. Bauplan in kleinen Schritten (Neustart der App)

Jeder Schritt hat einen Zweck, ein Ergebnis, das man anfassen kann, und etwas, das man dabei versteht. Er läuft parallel zu den Phasen aus Abschnitt 8.

| Schritt | Ergebnis | Man versteht danach |
| --- | --- | --- |
| 0 | Ordner `app/` mit leerer Seite, Service Worker, Manifest | Wie die PWA startet und offline läuft |
| 1 | `model` mit Schema, Validierung, Test, Leser für alte `<video>.json` (nach dem Kontext- und Verbindungsmodell) | Was eine Line ist und wie Altes lesbar bleibt |
| 2 | `storage` mit Ordner-Adapter | Wie Dateien lokal geschrieben und gelesen werden |
| 3 | `storage` mit WebDAV-Adapter, gleiche Tests (Nextcloud, später Sciebo direkt) | Warum Adapter austauschbar sind (CORS, Proxy) |
| 4 | `capture`: ein Video aufnehmen und als Line speichern | Kamera, Format (MP4/WebM), Seitenverhältnis |
| 5 | `context`: Chips, Klammern, Haupt- und lokaler Kontext, Tests | Reine Logik ohne Oberfläche |
| 6 | `search`: Treffer über Kontext, Synonyme | Wie Search aus den Modellen entsteht |
| 7 | `interaction`: Gestentabelle als Daten, Hilfe daraus | Wie Gesten zu Absichten werden |
| 8 | `ui`: Overview mit Search, Ergebnisfläche, Aufnahme | Alles zusammen in einem Bildschirm |
| 9 | Mehrere Nutzende: Freigabe, Rechte, Einwilligung | Teilen ohne Konflikte |
| 10 | `analysis`: MediaPipe-Landmarks als Spur | Abgeleitete Daten neben dem Original |
| 11 | Ähnlichkeit, Zusammenstellung, Charaktervariation | Von der Spur zur Suche nach Ähnlichem |

Die Schritte 0 bis 8 entsprechen dem Ziel der ersten zwei Wochen, 9 bis 11 folgen danach. Neuer Code wird nur nach Freigabe gebaut.

---

## 12. Entscheidungen

**Beschlossen** (Abschnitt 1 und Verlauf): eigene Nextcloud als Start (Hetzner, 1 TB); Konten von Hand, kein Cloudflare-Worker; Speicherorte wählbar (immer speichern / Teilen-Menü); Daten dauerhaft zur Verfügung stellen (Landmarks oder Video); Standard „beides“ bis zur App; Sciebo in beide Richtungen eingebunden (Freigabe an die Sciebo-ID getestet); hinein nur über die App; Anmeldung mit `benutzer@server`; Zugangsdaten nicht im Repo; Begriffe Spur, Line, Context.

**Noch offen:**
1. Lokal zuerst als Ziel mit der Capacitor-App (Gerät als Hauptspeicher)?
2. Einwilligungsstufen pro Clip wie in 3.3?
3. Umstieg auf „nur Landmarks“ für Gruppe/Training, sobald Landmarks stabil?
4. Lese-Konto für Personen optional oder für alle?
5. Neuberechnung mit neuen Modellen auf den Geräten statt zentral?
6. Dürfen Personen ihre lokalen Videos nach Landmark-Erzeugung entfernen?
7. Schwellen aus Abschnitt 9 als Regel für eigene Server?
8. Domänen-Feld, Herkunft, Modellversion ab sofort im JSON (hier bereits so vorgesehen)?
9. Eigene Domain für Nextcloud, Projektseite und Einladungen (Name, Endung; gleiche Adresse für App und Nextcloud wegen CORS?)
10. Wie ein ganzes Wort aus der eckigen Klammer des Kontextmodells herausgezogen wird.

Weitere offene Entscheidungen zu Teilnahme, Modellen und Releases: [INFRASTRUCTURE.md](INFRASTRUCTURE.md), Abschnitt 9. Stufenbezogene: [ETAPPEN.md](ETAPPEN.md).

## 13. Offene Prüfpunkte
- Testtag Storage Share (Abschnitt 1.5): CORS, Sciebo-Freigabelink als externer Speicher, Schreib-/Lese-Konto, Einladungslink.
- iCloud/Google Drive über App-Ordner: Verhalten bei großen Videos, „nur in der Cloud“-Dateien.
- Hintergrund-Rechnen (Landmarks nachträglich) auf iOS/Android: Laufzeitgrenzen, Akku.
- Storage Share: reichen die Verbindungsgrenzen beim Abgleich vieler Geräte?
- Nutzungsbedingungen der Hochschule zum Einbinden von Sciebo in fremde Dienste.
- Aktuelle Preise SX-Server; Förderprogramme und Fristen.
- Reichen ES-Module ohne Build, oder braucht `compose` WebAssembly (z. B. zum Zusammenfügen)?
- Wo lebt der lokale Suchindex (IndexedDB oder SQLite im Browser), und wie wird er aus den Dateien neu aufgebaut?
- Rechte: Wer darf ändern, wer nur lesen, und wo wird das erzwungen, wenn der Speicher ein einfacher WebDAV-Ordner ist? (Stufe 1 in 1.4 beantwortet das über Konten; Feinheiten offen.)

---

## Quellen
- Hetzner Storage Share: https://www.hetzner.com/de/storage/storage-share/
- Hetzner-Preise 2026 (Storage Box, Object Storage): https://agentdeals.dev/hetzner-pricing-2026
- Hetzner SX-Line (2024): https://www.hetzner.com/de/news/new-sx-line/
- Günstige Objektspeicher Europa 2026: https://sliplane.io/de-de/blog/cheap-object-storage-providers-europe
- Nextcloud: Föderiertes Teilen: https://docs.nextcloud.com/server/stable/user_manual/de/files/federated_cloud_sharing.html
- Sciebo: Dateien teilen: https://docs.sciebo.de/en/docs/getting-started/webinterface/dateien-teilen/
- Nextcloud-Forum: CORS bei gehosteter Instanz (WebAppPassword): https://help.nextcloud.com/t/add-cors-header-to-hosted-instance/144873
- Weitere Zahlen (GPU, Speicherbedarf, Datensätze, Sichtung, Teilnahme): [INFRASTRUCTURE.md](INFRASTRUCTURE.md), [RESEARCH.md](RESEARCH.md)
