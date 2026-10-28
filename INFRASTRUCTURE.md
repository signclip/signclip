# Sign – Infrastruktur

Stand: 28.10.2026 (Recherche vom 26.10.2026) · Status: **Entwurf zur Freigabe**, Zahlen sind Schätzungen · Aus dem Projektdokument `claude/infrastructure.md`, abgeglichen mit [ARCHITECTURE.md](ARCHITECTURE.md) v2.2 und dem Verlauf.

**Wichtig – was seit der Recherche entschieden wurde:** Der Startweg ist die **eigene Nextcloud** (Hetzner Storage Share, 1 TB), nicht Sciebo als Hauptspeicher. Sciebo ist eingebunden (föderiertes Teilen getestet). Es gibt **keinen Cloudflare-Worker**, Konten legt die Betreuung zunächst von Hand an. Wo der Text unten noch Sciebo als Hauptspeicher oder Proxy/Worker nennt, ist das mit „→ jetzt“ markiert oder ersetzt. Quellen für Rollen, Startweg und Phasen: ARCHITECTURE.md.

## 1. Leitprinzip

**Ein Protokoll, ein Datenformat, Server austauschbar.**
Alles läuft über die Nextcloud-WebDAV-Schnittstelle. Sciebo ist seit 2025 auf Nextcloud umgestellt, ein eigener Nextcloud-Server spricht dieselbe API. Wechselt der Speicherort, ändert sich in der App nur die Server-Adresse. Kein Proxy, keine eigene Datenbank, kein eigenes Backend, bis die Ähnlichkeitssuche über viele Bibliotheken (10-Jahres-Ziel) es wirklich verlangt.

## 2. Wichtigste Rechercheergebnisse

| Thema | Befund | Folge für Sign |
| --- | --- | --- |
| Sciebo-Plattform | Alle Instanzen 2025 von ownCloud auf **Nextcloud** migriert | Nextcloud-APIs gelten (Login Flow v2, öffentliche Freigaben per WebDAV, föderiertes Teilen) |
| Sciebo-Speicher | 30 GB pro Person, Beschäftigte bis **500 GB**, Projektboxen bis **2 TB**; Gäste haben keinen eigenen Speicher | Reicht für Phase 0–2 als Zusatz, nicht als Hauptspeicher für 200+ Personen mit Gesprächsaufnahmen |
| Sciebo-Sicherung | **Kein Backup** durch den Betreiber; personenbezogene Daten nur mit Einwilligung | Zweitkopie nötig; Einwilligung der Lernenden einholen |
| Teilen per Link | Öffentlicher Link mit Passwort ist per WebDAV ansprechbar: `/public.php/dav/files/{token}/` (ab Nextcloud 29), Passwort als Basic-Auth mit Benutzer `anonymous`, Header `X-Requested-With: XMLHttpRequest` | Teilen ohne Konto für Lernende möglich, inkl. Upload (File Drop) |
| CORS im Browser | Nextcloud sendet standardmäßig **keine** CORS-Header; nur per Admin-App (WebAppPassword), die öffentliche Links nicht abdeckt | Browser kann Sciebo nicht zuverlässig direkt erreichen → **jetzt:** Browser spricht nur die eigene Nextcloud (CORS dort per WebAppPassword, Testtag), Sciebo kommt über die Nextcloud (externer Speicher, föderiertes Teilen) |
| Capacitor | `CapacitorHttp` leitet `fetch` über die native Netzwerkschicht, CORS entfällt; große Dateien über `@capacitor/file-transfer` | **Capacitor-App ist der Weg ohne Proxy**, sobald ein Entwickler-Account besteht |
| Anmeldung | Nextcloud Login Flow v2 liefert ein App-Passwort pro Gerät, widerrufbar | Kein Hauptpasswort in der App, Speicherung in Keychain/Keystore. **Jetzt (Web-Version):** `benutzer@server` und Passwort |
| Eigener Speicher | Hetzner Storage Box: 1/5/10/20 TB, WebDAV, Traffic frei, 1 TB ca. 3,20 €/Monat, max. 10 gleichzeitige Verbindungen, 100 Unterkonten. Hetzner Object Storage (S3): 6,49 €/Monat inkl. 1 TB | Storage Box als günstiges Backup/Archiv; für viele gleichzeitige Nutzende eher eigene Nextcloud davor |
| MediaPipe | Holistic/Hand-Landmarks laufen auf dem Gerät (iOS, Android, Web); Ähnlichkeit z. B. per DTW oder Embedding + Kosinus | Erkennung und Index auf dem Gerät, kein Rechenserver nötig |

## 3. Speicherbedarf (Schätzung)

Annahmen: 720×1280, ca. 2,5 Mbit/s → **ca. 1,25 MB pro 4-s-Clip**; Landmarks (Hände + Pose, ohne Gesicht) ca. 50 KB pro Clip. Echte Werte sind auf iPhone und Android zu messen.

| Phase | Annahme | pro Jahr |
| --- | --- | --- |
| Persönlich | 20 Clips/Tag | ca. 9 GB |
| 20 Personen | je 10 Clips/Tag | ca. 90 GB |
| 220 Personen | je 10 Clips/Tag | ca. 1 TB |
| + Gespräche | 220 × 30 min/Woche (1,5–2,5 Mbit/s) | ca. 4–6 TB |

Videos dominieren den Bedarf; Metadaten und Landmarks fallen kaum ins Gewicht. Gespräche sind der Kostentreiber.

**Pro 1.000 Stunden Material:** Originalvideo (2,5 Mbit/s) ca. 1,1 TB · Trainingskopie (ca. 512 px, 0,8 Mbit/s) ca. 0,36 TB · Landmarks (Hände, Pose, Lippen, float16, 30 fps) ca. 75 GB.

**Bei 220 Personen inkl. Gesprächen (ca. 6.600 h/Jahr):** Original ca. 7,4 TB · Trainingskopie ca. 2,4 TB · Landmarks ca. 0,5 TB.

Hinweis: ARCHITECTURE.md rechnet in Abschnitt 7 mit leicht anderen Annahmen (Gespräche pro Person und Jahr). Beide Rechnungen sind Schätzungen.

## 4. Speicherklassen nach Zugriffszeit

Nicht alles muss schnell erreichbar sein. Drei Klassen, jede Datei landet automatisch in der passenden:

| Klasse | Inhalt | Zugriff | Ort | Kosten (Stand 2026) |
| --- | --- | --- | --- | --- |
| **Heiß** | JSON, Landmarks, Vorschaubilder, Embeddings, Index; Videos der letzten Wochen und Favoriten | sofort, auch offline | Gerät + Nextcloud | vernachlässigbar (< 1 TB) |
| **Warm** | Alle Clips in App-Auflösung, Trainingskopie | Sekunden, beim Abspielen oder Training | Nextcloud mit Object Storage dahinter (viele gleichzeitige Zugriffe) | Hetzner Object Storage 6,49 €/Monat inkl. 1 TB, jedes weitere TB ca. 8,70 € |
| **Kalt** | Originale in voller Auflösung, Roh-Gespräche | Stunden, nur für Neuberechnung mit besseren Modellen | Archiv-Speicher (z. B. Scaleway Glacier) | ca. 2,54 €/TB/Monat, Wiederherstellung ca. 9 €/TB |
| **Sicherung** | Kopie von Warm | nur im Notfall | Hetzner Storage Box (Snapshots, Traffic frei) | ab ca. 3,20 €/Monat für 1 TB |

Grobe Monatskosten bei 220 Personen nach einem Jahr: Warm (ca. 2,5 TB Trainingskopie + App-Clips) ca. 20–30 €, Kalt (ca. 7,5 TB) ca. 20 €, Sicherung ca. 10–20 €. **Zusammen etwa 50–70 €/Monat**, plus Nextcloud-Server.

**Landmarks teilen, Video optional (aus RESEARCH.md: SL2T, EgoDex).** Standardmäßig wird in Gruppen nur die Landmark-Sequenz + Kontext geteilt; das Video bleibt privat im eigenen Ordner und wird nur auf Wunsch mitgeteilt. Vorteile: Datenschutz (kein Gesicht im geteilten Bestand), geteilter Speicher wächst um ca. 75 GB statt 1,1 TB pro 1.000 Stunden, Suche und Training funktionieren trotzdem. Dolmetschende können bei Bedarf das Video anfordern oder eine Pose-Vorschau (Strichfigur) ansehen. (Bis zur App gilt der Startweg aus ARCHITECTURE.md: Videos und Landmarks vollständig in der Nextcloud.)

Warum so: Modelle werden auf **Landmarks** trainiert, nicht auf Video. Die Trainingsdaten sind damit klein und immer heiß. Videos braucht man nur zum Abspielen (warm) und um später mit besseren Erkennungsmodellen neu zu extrahieren (kalt, im Stapel wiederherstellen).

### Freie und Forschungs-Speicher

Neben den bezahlten Klassen gibt es kostenlose Orte, jeweils für einen bestimmten Zweck. Für den **Alltagsbetrieb** (viele kleine Uploads, Lesen, Teilen) taugt davon nur der Hochschul-Cloudspeicher. Die anderen sind für **eingefrorene Releases**.

| Ort | Kosten | Umfang | Zugriff | Passt für |
| --- | --- | --- | --- | --- |
| **Sciebo** (NRW) / vergleichbare Landesdienste (z. B. Academic Cloud in Niedersachsen) | frei für Hochschulangehörige | 30 GB, Beschäftigte 500 GB, Projektbox bis 2 TB | WebDAV, sofort | zusätzliche Ablage und Teilen (Phase 0–2), eingebunden in die eigene Nextcloud |
| **Zenodo** (CERN) | frei | 50 GB pro Datensatz, auf Anfrage bis 200 GB; max. 100 Dateien | DOI pro Version; offen, Embargo oder **nur nach Freigabe** | Release-Archiv der Landmarks (`releases/vN/`), zitierbar |
| **Hugging Face Datasets** | öffentlich frei („best effort“), privat 100 GB frei | keine Grenze pro Repo, max. 500 GB pro Datei, < 100.000 Dateien | sofort, direkt aus Trainingsskripten ladbar; Zugang mit Bedingungen möglich | öffentliche Landmark-Releases für Training und Community; Förderung für Forschungsteams auf Anfrage |
| **Forschungsdaten-Repositorium der Hochschule** (z. B. FDR Uni Hamburg) | frei für Angehörige | je nach Hochschule | DOI, eingeschränkter Zugang möglich | Langzeitarchiv mit Einwilligungsauflagen |
| **sciebo RDS** | frei | – | verbindet Sciebo-Ordner mit Repositorien wie Zenodo/OSF | Release direkt aus dem Sciebo-Ordner veröffentlichen (Verfügbarkeit an der eigenen Hochschule prüfen) |
| **Geräte der Teilnehmenden** | frei | je Gerät | sofort, offline | eigene Videos bleiben ohnehin dort; nur Landmarks gehen in die Gruppe |

**Für große Datenmengen (mehrere TB bis 100+ TB), kostenlos oder gefördert:**

| Ort | Was kostenlos ist | Bedingung | Passt für |
| --- | --- | --- | --- |
| **AWS Open Data Sponsorship** | Speicher und Bereitstellung eines Datensatzes in S3 (Registry of Open Data); Größengrenze nicht genannt | Daten **öffentlich**, offene Lizenz, gut dokumentiert, nachweisbare Nachfrage; Entscheidung meist in 2 Wochen | öffentlicher DGS-Landmark-Datensatz in SL2T-Größe (ab Phase 4) |
| **Hugging Face Community-Grant** | zusätzlicher öffentlicher Speicher (Anfragen im Bereich mehrerer TB sind üblich) | öffentlich, Nutzen für die Community; Anfrage per E-Mail mit Projektbeschreibung | öffentliche Releases, direkt für Training nutzbar |
| **Hochschul-Rechenzeit (NHR)** | mit einem Rechenzeitprojekt kommt Projektspeicher auf dem Cluster | Forschende an deutschen Hochschulen, Projektantrag | Trainingskopie + Landmarks direkt neben den GPUs |
| **Landesspeicher für Forschung** (z. B. SDS@hd in Baden-Württemberg, Projektboxen bei Sciebo) | je nach Land frei oder zu Selbstkosten | Beschäftigte der Landeshochschulen, Partner per ORCID/eduGAIN | warmer Speicher mit WebDAV |
| **Google TPU Research Cloud** | TPU-Rechenzeit | Ergebnisse öffentlich teilen; **Speicher nicht inklusive** | Vortraining größerer Modelle |
| **NFDI / DFG-Speicherförderung** | Förderung für Speichersysteme in der Forschungsdateninfrastruktur | Antrag über eine Hochschule oder ein NFDI-Konsortium (z. B. Text+ für Sprachdaten) | langfristige Heimat eines DGS-Korpus |

Alle offenen Angebote verlangen **öffentliche** Daten. Das passt zu Landmarks + Kontext mit ausdrücklicher Einwilligung, **nicht** zu Videos mit Gesicht. Videos bleiben privat (Gerät, Sciebo, eigener Speicher).

**Empfehlung:** Betrieb über die eigene Nextcloud mit eingebundenem Sciebo (→ jetzt; ursprünglich „über Sciebo bzw. eigene Nextcloud“). Jeder Quartals-Release (nur Landmarks + Kontext + Sichtungsstand, siehe Abschnitt 6) zusätzlich auf **Zenodo mit Zugang nach Freigabe** (DOI, kostenlos, dauerhaft). Öffentlich auf Hugging Face erst, wenn Einwilligungen das ausdrücklich erlauben. Videos gehen in keines dieser offenen Repositorien.

## 5. Modelle: Erkennung, Glättung, Index

### Größenordnung aus der Forschung

| Datensatz | Art | Umfang | Personen |
| --- | --- | --- | --- |
| RWTH-PHOENIX-Weather 2014T | DGS, Wetterbericht, Sätze | 11 h | 9 |
| SIGNUM | DGS, Labor | 55 h | 25 |
| DGS-Korpus (Hamburg) | DGS, Gespräche | 560 h aufgenommen, ca. 91 h annotiert, ca. 50 h öffentlich | 330 |
| WLASL / AUTSL | Einzelgebärden | 14 h / 21 h | 119 / 43 |
| ASL Citizen | Einzelgebärden, Laien-Aufnahmen | 83.399 Clips, 2.731 Gebärden (ca. 30 je Gebärde) | – |
| PopSign ASL | Einzelgebärden, **Smartphone-Selfie** | 175.023 nutzbare Clips, 250 Gebärden | 47 |
| How2Sign | ASL, Sätze | 79 h | 11 |
| BOBSL | BSL, TV | 1.467 h | 39 |
| YouTube-ASL | ASL, offen | ca. 1.000 h | > 2.500 |
| YouTube-SL-25 | 25 Gebärdensprachen | 3.207 h | – |
| Google SL2T (2026, nicht öffentlich) | > 50 Gebärdensprachen | > 100.000 h | – |

Laut RESEARCH.md gibt es **kein öffentliches DGS→Text-Modell** (SL2T nur ASL, SignGemma unveröffentlicht). Sign baut also eine eigene DGS-Basis auf; Vortraining auf mehrsprachigen Landmark-Daten (z. B. YouTube-SL-25) ist der naheliegende Startpunkt.

### Was das für Sign bedeutet

- **Erkennung von Einzelgebärden (Search visuell → visuell):** Ein auf MediaPipe-Landmarks vortrainiertes Modell kann neue Gebärden ohne Neutraining aufnehmen: jedes Beispiel wird einmal als Vektor gespeichert, die Suche vergleicht Vektoren. Mit nur einem Beispiel pro Gebärde liegt der erste Treffer bei 100 Gebärden in ca. 61 % richtig, bei 2.000 Gebärden in ca. 39 %. → In der App **eine Trefferliste (Top 5)** statt eines einzelnen Ergebnisses zeigen; jede weitere Variation der Lernenden verbessert die Treffer.
- **Glättung von Übergängen (Text → zusammengesetztes Video):** Aktuelle Verfahren füllen die Übergänge zwischen einzelnen Gebärden mit einem Diffusionsmodell auf Pose-Daten auf. Trainiert wurde z. B. auf PHOENIX14T (ca. 8.300 Sätze) und einem chinesischen Datensatz mit 500 Gebärden × 50 Personen. Benötigt werden **zusammenhängende Aufnahmen** – genau dafür sind die Gesprächsaufnahmen wertvoll. Berechnete Spuren liegen getrennt (`derived/`).
- **Wann reicht unser Material?** Bei 220 Personen mit je 10 Clips pro Tag (ca. 2.200 Clips/Tag):
  - Größe von ASL Citizen (ca. 83.000 Clips): nach ca. **5–6 Wochen**
  - Größe von PopSign (ca. 175.000 Clips): nach ca. **11–12 Wochen**
  - Bei 30 min Gespräch pro Person und Woche: Größe von How2Sign (79 h) in **unter einer Woche**, Größe von BOBSL (1.467 h) nach ca. **13 Wochen**
  - 220 verschiedene Personen sind mehr als bei fast allen DGS-Datensätzen. Vielfalt der Personen ist ein bekannter Hebel für robuste Erkennung.
- **Der Engpass ist nicht Speicher, sondern Sichtung.** Annotiert ist auch im DGS-Korpus nur ein Bruchteil. Darum: Kontext beim Aufnehmen direkt mitgeben (Text/Audio), Sichtung entsteht automatisch beim Ansehen und Verändern in der Search (Abschnitt 6), Modelle schlagen Zuordnungen vor.
- **Gesicht:** Für DGS sind Mundbilder wichtig. Lippen-Landmarks speichern wir mit (kostet wenig); ob sie die Erkennung verbessern, testen wir. In einer Studie verschlechterten Gesichtspunkte das One-Shot-Ergebnis.

### Wo gerechnet wird

| Aufgabe | Ort | Kosten |
| --- | --- | --- |
| Landmarks extrahieren | **auf dem Smartphone bei der Aufnahme** | keine (verteilt auf alle Geräte) |
| Search und Ähnlichkeit | auf dem Gerät, gegen lokalen Index | keine |
| Training Erkennungs- und Glättungsmodell | gemietete GPU stundenweise, oder kostenlos über Hochschulrechenzeit | z. B. RTX 4090 ca. 0,14–0,74 $/h, A100 ca. 0,44–1,59 $/h; NHR „AI Fast Track“: bis 20.000 GPU-Stunden/Jahr kostenlos für Forschende an deutschen Hochschulen |
| Neuberechnung aller Landmarks mit neuem Modell | Stapel aus dem kalten Speicher auf gemieteter GPU | einmalig, Stunden |
| Dauerhafter GPU-Server | erst wenn nötig (z. B. Hetzner GEX131 mit 96 GB ab 1.499 €/Monat) | **nicht empfohlen**, Miete pro Stunde reicht |

Trainingsablauf: Landmarks + Kontext als versionierter Datensatz-Export → GPU → fertiges Modell (TFLite/ONNX) zurück in die App. Kein Video verlässt dafür den warmen Speicher.

**Versionierte Releases (Muster Common Voice):** Etwa quartalsweise wird ein eingefrorener Stand erzeugt: `releases/vN/` mit Landmarks, Kontext, Sichtungsstand und einer Manifest-Datei. Jedes Modell nennt den Release, auf dem es trainiert wurde. v1 = SignClip-Prototyp.

**Landmark-Dateiformat:** Statt eigenem JSON-Array prüfen, ob das offene Pose-Format aus dem sign.mt-Umfeld (`sign-language-processing`) passt. Vorteil: vorhandene Werkzeuge für Segmentierung, Visualisierung und Evaluation.

**Aus anderen Bereichen übernehmen:** Gebärden per einfacher Zustandsmaschine segmentieren (Ruhe → Bewegung → Ende, wie Wiederholungszähler in Fitness-Apps); einhändiges Gebärden mit Handy in der anderen Hand als eigenen Fall im Training berücksichtigen (SL2T); später synthetische Blickwinkel aus 3D-Landmarks für mehr Variation (SignAll).

### Ein „SL2T für DGS“: was es braucht

**Wie SL2T gebaut ist (öffentlich bekannt):** MediaPipe Holistic läuft auf dem Gerät, 130 Punkte aus Gesicht, Körper und Händen pro Bild. Nur die Koordinaten gehen an den Server, das Video wird sofort verworfen. Übersetzung direkt in Text, ohne Glossen. Trainiert auf über 100.000 h aus mehr als 50 Gebärdensprachen (ca. ¼ ASL). Clips bis 60 s, ohne Gedächtnis zwischen Clips. Architektur und Modellgröße sind nicht veröffentlicht, ebenso keine API.

**Offene Vorgänger zum Nachbauen:** YouTube-ASL / FLEURS-ASL nutzen **T5** (Small bzw. Base), gefüttert mit 85 MediaPipe-Punkten bei 15 Bildern/s, bis 512 Frames (ca. 34 s) pro Eingabe. Das ist das offene Muster, auf dem ein DGS-Modell aufsetzen kann.

**Was es an Daten schon gibt:** YouTube-SL-25 enthält **108 h DGS** (1.024 Videos, 65 Kanäle) – mehr als das öffentliche DGS-Korpus (ca. 50 h). Mehrsprachiges Vortraining hilft kleinen Sprachen deutlich: für die Deutschschweizer Gebärdensprache stieg das Ergebnis von 26,2 (ohne Vortraining) auf 37,7 BLEURT (mit allen 25 Sprachen). Wenige Stunden Feintuning bringen dagegen wenig: FLEURS-ASL (7,5 h, 5 Personen) verbesserte ein starkes ASL-Modell nur leicht, deutlich weniger als How2Sign mit ca. 79 h.

**Der eigentliche Engpass für Übersetzung: Text parallel zur Gebärde.** Für Sign→Text braucht jede Sequenz eine deutsche Übersetzung. Einzelgebärden haben sie durch den Kontext beim Aufnehmen; bei Gesprächen muss sie entstehen – durch Dolmetschende, durch die Gebärdenden selbst direkt danach (Audio/Text), oder durch die automatische Sichtung (Abschnitt 6).

**Speicher pro Stunde:** Landmarks (130 Punkte, float16, 15 Bilder/s) ca. **42 MB/h** · Video (2,5 Mbit/s) ca. **1,1 GB/h**.

| Stufe | Material pro Jahr (Annahmen wie Abschnitt 3) | Landmarks | Video (optional, privat) | Was damit möglich wird |
| --- | --- | --- | --- | --- |
| **Privat** | ca. 8 h Einzelgebärden | < 1 GB | ca. 10 GB | persönliche Bibliothek; Suche per Ähnlichkeit (One-Shot) mit fertigem Landmark-Encoder; **kein Training nötig** |
| **20 Personen** | ca. 80 h Einzelgebärden + ca. 520 h Gespräch | ca. 25 GB | ca. 0,7 TB | Erkennung von Einzelgebärden feintunen; erstes DGS-Feintuning eines mehrsprachig vortrainierten T5-Modells (Größenordnung How2Sign nach ca. 2 Monaten Gesprächen) |
| **220 Personen** | ca. 900 h Einzelgebärden + ca. 5.700 h Gespräch | ca. 280 GB | ca. 7,4 TB | Größenordnung YouTube-ASL (1.000 h) nach ca. 9 Wochen Gesprächen; eigenes DGS-Sign→Text-Modell, Basis für Glättungs-/Erzeugungsmodell |
| **SL2T-Größe nur für DGS** (Ziel ca. 10.000–25.000 h, so viel wie der ASL-Anteil von SL2T) | bei 220 Personen ca. 1,5–4 Jahre | ca. 0,4–1 TB | ca. 11–28 TB | DGS-Übersetzung in der Breite, mehrere Dialekte, Gesprächsfluss |

**Folgerungen:**
- Landmarks bleiben in **allen Stufen klein** (unter 1 TB selbst in SL2T-Größe). Teuer ist nur das Video – deshalb Video privat und optional (Abschnitt 4).
- Ein SL2T-artiges Modell für DGS ist ab der **20-Personen-Stufe** sinnvoll zu beginnen: Vortraining auf YouTube-SL-25 (inkl. 108 h DGS), Feintuning auf eigenen Daten. Rechenbedarf für Feintuning in T5-Small/Base-Größe passt in gemietete GPU-Stunden oder Hochschulrechenzeit; Vortraining in SL2T-Größe nicht.
- Datenschutz wie bei SL2T: auf dem Gerät nur Koordinaten erzeugen, Video bleibt beim Menschen.
- Grenzen von SL2T als Lernziel übernehmen: Mimik/Augenbrauen, Fingeralphabet, mehrere Personen im Bild, Gebärdennamen und eigene Wortlisten – genau die persönliche Bibliothek von Sign kann diese Lücke (eigene Wortlisten, Namen) füllen.
- Governance wie AISLAC: Einsatzgrenzen (kein Ersatz für Dolmetschen in Medizin, Recht, Behörden) gemeinsam mit Gehörlosen festlegen.
- Die Weitergabe an Dritte (z. B. an Google für SL2T) ist eine **eigene Welle mit eigener Einwilligung** ([ETAPPEN.md](ETAPPEN.md)).

### Auf dem Gerät: Modelle, Search, Index

**LiteRT – die lokale Laufzeit unter MediaPipe.** LiteRT ist der Nachfolger von TensorFlow Lite (Google AI Edge). MediaPipe Tasks laufen auf LiteRT; LiteRT selbst führt **eigene Modelle** als einzelne `.tflite`-Datei aus.
- Plattformen: Android, iOS, macOS, Windows, Linux, Web.
- Beschleunigung: GPU (OpenCL, OpenGL, Metal, WebGPU), NPU bei Qualcomm und MediaTek. Laut Google GPU ca. 1,4× schneller als der alte TFLite-GPU-Weg, NPU bis 10× schneller als GPU.
- Umwandlung: PyTorch direkt über LiteRT Torch nach `.tflite`, JAX über jax2tf. Unser Landmark-Encoder (Ähnlichkeit) und später ein kleines DGS-Übersetzungsmodell werden so trainiert → umgewandelt → in die App gelegt.
- **LiteRT-LM** für kleine Sprachmodelle auf dem Gerät (z. B. Gemma), falls später Text aus erkannten Gebärden geglättet oder umformuliert werden soll.
- Int8-Quantisierung macht Modelle ca. 4× kleiner und ist der Weg auf die NPU.

**Einbindung in die App (zwei Stufen):**
1. **Jetzt, ohne nativen Code:** MediaPipe Tasks Web und LiteRT im Web (WASM + WebGL/WebGPU) laufen im Capacitor-WebView genauso wie in der PWA. Gleicher Code für Browser, iOS und Android.
2. **Später, für Geschwindigkeit und Akku:** kleines eigenes Capacitor-Plugin (Swift/Kotlin), das MediaPipe Tasks bzw. LiteRT nativ aufruft und nur Landmarks/Vektoren an die Oberfläche zurückgibt. Ein fertiges Capacitor-Plugin dafür gibt es bisher nicht.

**Was heute auf Smartphone/Tablet läuft (iOS + Android, offline):**

| Aufgabe | Modell / Bibliothek | Hinweise |
| --- | --- | --- |
| Hände, Körper, Gesicht | **MediaPipe Holistic Landmarker** (auch iOS über `MediaPipeTasksVision`), alternativ Hand + Pose + Face einzeln | Modi Bild, Video, Livestream; links/rechts muss die App selbst zuordnen |
| Einfache Gesten (Steuerung) | MediaPipe Gesture Recognizer, eigene Gesten per Model Maker | für Marker/Schnitt/Weiter per Hand |
| Gebärden-Ähnlichkeit | eigener kleiner Landmark-Encoder (Transformer, TFLite/LiteRT oder ONNX) → Vektor pro Clip | wird zentral trainiert, läuft lokal; DTW als einfacher Start ohne Modell |
| Text, Bild, Audio, Video in **einem** Vektorraum | **EmbeddingGemma 2** (Apache 2.0, LiteRT/MediaPipe): Text-Teil ca. 270M Parameter / ca. 190 MB RAM, mit Bild+Audio ca. 570 MB RAM; Vektoren 768 → kürzbar auf 256/128 | Search „Text findet Video“ ohne Transkript; Deutsch-Unterstützung prüfen |
| Sprache → Text | iOS: Apple **SpeechAnalyzer** (iOS 26, offline, Deutsch); Android: Systemspracherkennung bzw. Whisper-Varianten | für Direct AudioContext |
| Vektorsuche | **sqlite-vec** (reines C, MIT/Apache, float/int8/binär, exakte Suche) in der App-Datenbank | bis zu einigen Hunderttausend Clips ohne Spezialindex schnell genug |

**Rechenbeispiel lokaler Index:** 1 Vektor pro Clip mit 256 Dimensionen in float16 = 512 Byte. 100.000 Clips ≈ 50 MB, 1 Mio. Clips ≈ 0,5 GB (int8 mit 128 Dimensionen: ca. 0,13 GB). Dazu Landmark-Dateien nur für Treffer nachladen. In der Übersicht erscheinen Videos nur als Vorschaubild mit überlagertem Kontext und werden erst beim Antippen geladen (privat ca. 20.000 Clips pro Person, Gesamtbibliothek eher Richtung Millionen).

**Was lokal reicht, was einen übergreifenden Index braucht:**

| Fall | Lokal | Übergreifend |
| --- | --- | --- |
| Eigene Bibliothek durchsuchen (Text, Audio, Gebärde) | ja, vollständig offline | – |
| Gruppenbibliotheken (20–220 Personen) | ja: Gerät lädt die **Vektor- und JSON-Dateien** der Gruppe per WebDAV und baut den Index selbst (≈ MB, nicht GB) | nicht nötig |
| Sichtungsstand berechnen | ja, aus den `*.sicht.*.json`-Dateien | – |
| Alle Bibliotheken aller Gruppen, Cluster finden und beschreiben (10-Jahres-Ziel) | nicht sinnvoll | ja: ein zentraler Vektor-Index (z. B. Postgres + pgvector), gespeist nur aus Vektoren + Kontext |
| Neues Modell → alle Vektoren neu berechnen | auf jedem Gerät für eigene Clips, oder | einmalig im Stapel auf gemieteter GPU aus den Landmarks |

**Damit Geräte nicht jede Datei einzeln lesen müssen:** Pro Gruppe und Release eine gebündelte Datei `index/<gruppe>/vN.vec` (alle Vektoren + IDs) und `index/<gruppe>/vN.jsonl` (Kontext, Sichtungsstand). Neue Clips seit dem letzten Bündel werden einzeln nachgeladen. Das hält die WebDAV-Last bei 220 Personen klein.

**Wichtig:** Alle Vektoren eines Index müssen vom **selben Modell und derselben Version** stammen. Die Modellversion steht im JSON jedes Clips und im Bündel.

## 6. Datenformat und Sichtung (gilt für alle Phasen)

Das Dateilayout steht in [ARCHITECTURE.md](ARCHITECTURE.md), Abschnitt 5.6 (`personen/<person>/<YYYY-MM>/<id>.mp4|.json|.pose`, Gruppen unter `gruppen/<gruppe>/`, dazu `training/`, `releases/`, `index/`, `import/`). Eine Begleitdatei pro Aufnahme, kein gemeinsames Index-File. Der Suchindex wird auf jedem Gerät aus den JSON-Dateien aufgebaut, nicht zentral gespeichert. Der frühere Ordner `eingang/` (File Drop für Lernende) entfällt, solange Lernende eigene Konten haben.

### Sichtung entsteht beim Benutzen

Es gibt keinen eigenen Sichtungsschritt und keinen Sichtungsordner. Neue Aufnahmen werden **automatisch in passende Gruppen geteilt** (z. B. Lernende, Dolmetschende, Themen- oder Regionalgruppen). Jedes Ansehen und jede Änderung in der Search zählt als Sichtung:

| Was passiert | Bedeutung | Gewicht |
| --- | --- | --- |
| Clip als Treffer angesehen, **exakte** Übereinstimmung (hohe Ähnlichkeit), nicht verändert | stille Bestätigung | gering, summiert sich |
| Clip angesehen, nur **ähnlich** (mittlere Ähnlichkeit), nicht verändert | wird als Variante derselben Gebärde vorgemerkt | gering |
| Kontext ergänzt oder korrigiert | aktive Sichtung, ersetzt die alte Zuordnung | hoch |
| Clip aus der Trefferliste entfernt / als falsch markiert | Gegenbeweis | hoch |
| Dieselbe Handlung durch Gruppe „Dolmetscher“ | fachliche Sichtung | am höchsten |

Schwelle (Muster Common Voice: jeder Clip von zwei anderen geprüft): `bestätigt` gilt erst bei **zwei unabhängigen Bestätigungen** aus der Gruppe oder **einer** aus der Gruppe Dolmetscher.

Daraus ergibt sich pro Clip ein Sichtungsstand (z. B. `neu` → `gesehen` → `bestätigt` / `Variante` / `korrigiert`), den jedes Gerät selbst berechnet. Die Ähnlichkeitswerte aus der Search (Abschnitt 5) entscheiden, ob ein Ansehen als „exakt“ oder „ähnlich“ zählt.

**Technisch ohne Konflikte:** Jede Person schreibt ihre Sichtungen in eine eigene kleine Datei pro Clip, `<id>.sicht.<person>.json` (nur anhängen, nie überschreiben). So schreiben nie zwei Geräte gleichzeitig in dieselbe Datei – das wäre über WebDAV fehleranfällig. Der Index liest alle Dateien zusammen.

**Folge für das Training:** Bestätigte und korrigierte Clips werden zu Trainingsdaten mit höherem Gewicht; als „ähnlich“ markierte Clips liefern genau die Variationen, die die Erkennung breiter machen.

## 7. Schritte

Die Phasen und ihre Auslöser stehen in [ARCHITECTURE.md](ARCHITECTURE.md), Abschnitt 8. Die frühere Schrittfolge dieses Dokuments (Sciebo als erster Speicher, Capacitor ab Woche 2, Cloudflare-Worker für das Anmeldeformular) ist damit **überholt**. Was daraus weiter gilt, ordnet sich so ein:

| Phase (ARCHITECTURE.md) | Schritte aus diesem Dokument, die weiter gelten |
| --- | --- |
| 0 – jetzt | Datenformat festlegen und im neuen Repo umsetzen; Speichern in der Browser-Version in die eigene Nextcloud; Einwilligungserklärung für Videoaufnahmen vorbereiten |
| 1 – App | Capacitor-App mit `CapacitorHttp` (direkter WebDAV-Zugriff, kein Proxy); Login Flow v2; Upload-Warteschlange mit Wiederholung (offline aufnehmen, später hochladen); Einladungslink-Format und `appUrlOpen` |
| 2 – Landmarks | Landmarks bei der Aufnahme auf dem Gerät extrahieren, ins JSON bzw. `.pose` schreiben; Ähnlichkeitssuche visuell→visuell auf dem Gerät (DTW bzw. Embedding + lokaler Index, z. B. SQLite) |
| 3 – Gruppe wächst | Gruppenordner; automatisches Teilen in Gruppen; Sichtung aus Ansehen/Ändern; Zweitkopie wöchentlich per rclone auf Hetzner Storage Box (Snapshots); Einwilligungserklärung |
| 4 – Modelle | Training auf Landmarks (GPU stundenweise oder NHR); Releases (Zenodo); Gespräche getrennt ablegen (eigene Ordner, ggf. niedrigere Bitrate) |
| 5 – Skalierung | Umzug auf größere Stufe oder Objektspeicher + Sign-Zugang; Speicherkosten grob 3–15 €/Monat pro 1–2 TB (Storage Box oder Object Storage) plus Nextcloud-Server |
| 6 – Föderation | zentraler Vektor-Index (z. B. Postgres + pgvector) über alle freigegebenen Bibliotheken für Cluster und Beschreibungen, gespeist nur aus den JSON-Dateien; Videos bleiben im WebDAV-Speicher |

## 8. Teilnahme: Projektseite → Einladung → App

Der Ablauf unten ist der **Zielablauf**. Zu Beginn werden Konten **von Hand** in der Nextcloud angelegt (Gruppe „Sign-Students“), ohne Anmeldeformular und ohne Worker. Der Ablauf wird schrittweise automatisiert (ARCHITECTURE.md, Phasen 1 und 3).

### Ablauf für Teilnehmende

```
Projektseite ─► Anmeldung (Name, E-Mail und/oder Postadresse, Einwilligung)
                    │
                    ▼
        Freischaltung (durch die Betreuung, später Skript)
          · Nextcloud-Konto + eigener Ordner (Gruppe Sign-Students)
          · persönliche Willkommensdatei
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
     E-Mail                   Brief
   Einladungslink         QR-Code + Link
        └───────────┬───────────┘
                    ▼
     Link antippen ─► App öffnet sich ─► „Teilnehmen“
          · Speicherpfad + Zugang automatisch übernommen
          · Begrüßung (persönliche Note) erscheint
          · erste Aufnahme landet im eigenen Ordner
```

App noch nicht installiert: Der Link öffnet stattdessen die Projektseite mit Installationshinweis (App Store, Play Store, PWA). Nach der Installation denselben Link oder QR-Code erneut öffnen.

### Bausteine (so schlank wie möglich)

| Baustein | Umsetzung | Neue Infrastruktur? |
| --- | --- | --- |
| Projektseite | Statische Seite, gleiches Hosting wie die PWA (GitHub Pages o. ä.): Vorstellung, Ziele, Mitmachen, Datenschutz, Impressum. Entwurf der Übersichtsseite liegt vor (Claude-Artifact „Sign Projektansicht“) | nein |
| Anmeldeformular | **Offen.** Die frühere Idee (Cloudflare Worker, der Anmeldungen als JSON per WebDAV ablegt) ist verworfen. Alternativen noch zu klären (z. B. Formular-Dienst, E-Mail, Brief) | offen |
| Freischaltung | Zunächst von Hand in der Nextcloud (Konto, Ordner, Gruppe). Später Skript: Konto, Kontingent, Gruppen, Ordner, App-Passwort, Einladungslink/QR, E-Mail und Brief-PDF | nein |
| Versand | E-Mail aus dem Postfach (Skript oder manuell); Brief als PDF ausdrucken | nein |
| Einladungslink | `https://<projektseite>/join#<code>`. Zugangsdaten stehen nach `#`, sie werden so nie an einen Server gesendet | nein |
| Link öffnet App | Universal Links (iOS) und App Links (Android) über zwei kleine Dateien auf der Projektseite; Capacitor-Event `appUrlOpen` übernimmt den Code | nein |
| Zugang speichern | App legt Server, Pfad und Passwort in Keychain/Keystore ab | nein |

### Zugänge pro Person

- **Eigener Ordner** `personen/<name>/`: Hochladen + Ansehen.
- **Gemeinsame Bibliothek** `gruppen/bibliothek/`: nur Lesen.
- Widerruf: Konto oder Freigabe löschen, der Zugang ist sofort ungültig.
- Gruppen: Jede Person gehört einer oder mehreren Gruppen an (z. B. Lernende, Dolmetschende); geteilt wird automatisch in die passenden Gruppenordner.

### Persönliche Note (Optionen)

- Begrüßung mit Namen und kurzem Text
- **Willkommensvideo in DGS**, liegt als erster Clip im eigenen Ordner
- Ein erstes Wort als Startvokabel (z. B. eigener Gebärdenname, falls vorhanden)
- Eigene Akzentfarbe oder Symbol für die Person in der Bibliothek
- Brief mit handschriftlicher Zeile und QR-Code

Alles steht in `willkommen.json` im eigenen Ordner. Die App zeigt es beim ersten Öffnen, ohne Server.

### Ressourcen geben („Beitragen“)

Ein **eigener, freier Bereich**, getrennt von der Teilnahme. Niemand muss etwas geben, um teilzunehmen, und niemand muss teilnehmen, um etwas zu geben. Nach „Teilnehmen“ gibt es nur einen leisen Verweis darauf; erreichbar ist der Bereich jederzeit von der Projektseite und aus der App. Je Etappe gibt es einen Ressourcenpunkt ([ETAPPEN.md](ETAPPEN.md)).

Drei Kacheln, jede mit einem Tipp erreichbar, höchstens zwei Felder, alles frei formulierbar:

| Kachel | Was man gibt | Felder | Wohin es geht |
| --- | --- | --- | --- |
| **Nachricht** | Gruß, Hinweis, Idee, Wunschgebärde | Text oder kurzes Video | `unterstuetzung/nachrichten/` |
| **Zeit** | Gebärden vorführen, Sichtung/Dolmetschen, Technik, Weitererzählen, Eigenes | Auswahl (Chips) oder freier Text | `unterstuetzung/zeit/` |
| **Geld** | einmalig oder regelmäßig, Betrag frei | einmalig/regelmäßig | externer Zahlungslink |

```
Projektseite / App ─► „Beitragen“  [Nachricht] [Zeit] [Geld]
```

- **Nicht quantitativ:** keine Zähler, keine Summen, kein Fortschrittsbalken, keine Liste der Gebenden. Danach nur ein schlichtes Danke.
- **Technik:** Geld läuft **nicht** über eigene Technik, sondern über einen fertigen Zahlungslink eines Anbieters (z. B. PayPal) oder eine Bankverbindung mit Verwendungszweck. Keine Zahlungsdaten bei uns. Wie Nachricht und Zeit ankommen (früher: dieselbe Serverless-Funktion wie die Anmeldung), ist mit dem Anmeldeformular **offen**.
- **Design:** gleiche Linie wie die App (Material 3, Pastell, runde Kacheln, Symbole statt Text, kein Formular-Gefühl). „Später“ ist immer sichtbar, nichts ist Pflicht.
- **Zeit wird zu Gruppen:** Wer „Sichtung/Dolmetschen“ wählt, wird nach Freigabe der Gruppe „Dolmetscher“ zugeordnet (Einladungslink, gleicher Ablauf wie oben). Gesichtet wird dann einfach durch Benutzen der Search.

### Datenschutz

Anmeldung mit Adresse und Videos mit Gesicht sind personenbezogene Daten: Einwilligung im Formular, Datenschutzerklärung und Impressum auf der Projektseite, Löschung auf Anfrage (Ordner + Anmeldung entfernen). Keine Rechtsberatung, vor Phase 3 klären.

## 9. Entscheidungen zur Freigabe

Status: ✔ beschlossen · ✖ erledigt/verworfen · ? offen

1. Capacitor als Hauptweg, PWA nur zum Testen? ? Jetzt zuerst nur Browser-Version (kein Entwickler-Account); Capacitor folgt in Etappe 2.
2. Sciebo-Projektbox (2 TB) beantragen oder direkt eigene Nextcloud? ✔ **Eigene Nextcloud** (Hetzner, 1 TB); Sciebo eingebunden.
3. Zweitkopie auf Hetzner Storage Box (ca. 3–11 €/Monat)? ?
4. Datenformat (Video + JSON pro Aufnahme) so festlegen? ✔ im Grundsatz, Dateilayout siehe ARCHITECTURE.md 5.6; Modell vorläufig bis zum Kontext- und Verbindungsmodell.
5. Gespräche mit niedrigerer Bitrate speichern? ?
6. Anmeldeformular über eine Serverless-Funktion? ✖ **Cloudflare-Worker verworfen**; Konten zunächst von Hand. Formular-Lösung offen.
7. Freischaltung erst halbautomatisch mit Freigabe pro Person? ✔ zunächst von Hand.
8. Welche persönliche Note als Standard (z. B. Name + DGS-Willkommensvideo)? ?
9. Eigene Domain für Projektseite, App, Nextcloud und Einladungslinks? ? Vorschlag: eine Domain mit Unteradressen; Name und Endung offen.
10. Speicherklassen heiß/warm/kalt wie in Abschnitt 4 (ca. 50–70 €/Monat bei 220 Personen)? ?
11. Modelle auf Landmarks trainieren, GPU nur stundenweise mieten oder Hochschulrechenzeit (NHR) beantragen? ?
12. Eigener, freier Bereich „Beitragen“ mit drei Kacheln (Nachricht, Zeit, Geld), getrennt von der Teilnahme, ohne Zahlen? ? Ressourcenpunkt je Etappe ist beschlossen; Kacheln im Entwurf.
13. Geld über externen Zahlungslink (PayPal) oder nur Bankverbindung? ? PayPal im Etappenplan vorgesehen; Rechtsform und Steuern offen.
14. Sichtung automatisch aus Ansehen und Verändern, gewichtet nach Ähnlichkeit und Gruppe (Abschnitt 6)? Welche Gruppen zum Start? ?
15. In Gruppen standardmäßig nur Landmarks + Kontext teilen, Video nur auf Wunsch? ? (Startweg bis zur App: beides in der Nextcloud)
16. „Bestätigt“ ab zwei unabhängigen Bestätigungen oder einer durch Dolmetschende? ?
17. Quartalsweise versionierte Releases (`releases/vN/`)? ?
18. Releases (nur Landmarks + Kontext) zusätzlich auf Zenodo mit Zugang nach Freigabe archivieren? ?
19. „SL2T für DGS“ ab der 20-Personen-Stufe beginnen (Vortraining YouTube-SL-25, Feintuning eigene Daten)? ?
20. Lokaler Index auf jedem Gerät (sqlite-vec + gebündelte Gruppen-Vektoren), zentraler Index erst für das 10-Jahres-Ziel? ?
21. Für Gespräche: wer liefert die deutsche Übersetzung (Gebärdende selbst direkt danach, Dolmetschende, Sichtung)? ?
22. Großer öffentlicher Landmark-Datensatz später über AWS Open Data oder Hugging Face Grant (nur mit ausdrücklicher Einwilligung)? ?
23. MediaPipe/LiteRT zuerst über Web (WASM) im WebView, natives Plugin erst bei Bedarf? ?

## 10. Offene Prüfpunkte

- Nextcloud-Version der eigenen Instanz und von Sciebo prüfen (≥ 29 nötig für `/public.php/dav`). Föderiertes Teilen Nextcloud → Sciebo: ✔ getestet (27.10.2026).
- Testen, ob Upload über öffentlichen Link per Capacitor auf Sciebo funktioniert.
- Nutzungsbedingungen der eigenen Hochschule zu Lernenden-Videos (Einwilligung, Zweck) klären. Keine Rechtsberatung.
- Echte Clipgröße auf iPhone und Android messen und Schätzung anpassen.
- Prüfen, ob Sciebo das Anlegen von Freigabelinks per API (OCS Share API) für das Konto erlaubt; ob Freigabelinks mit Passwort ein Ablaufdatum bekommen müssen (Hochschulrichtlinie).
- Lizenz des öffentlichen DGS-Korpus für Vortraining prüfen.
- Geld annehmen: Rechtsform klären (privat, Hochschulprojekt, Verein). Steuerlich absetzbare Spenden nur bei Gemeinnützigkeit; sonst „Unterstützung“ nennen. Keine Rechts- oder Steuerberatung.
- Lippen-Landmarks: Nutzen für DGS-Erkennung im Test prüfen.
- Pose-Format (sign-language-processing) auf Eignung und Lizenz prüfen.
- Lizenz von YouTube-SL-25 für Vortraining prüfen (Videos liegen auf YouTube, nur IDs und Untertitel sind verteilt).
- EmbeddingGemma 2: Deutsch-Unterstützung und Qualität bei Gebärden-Videos testen.
- sqlite-vec: Builds für iOS/Android in Capacitor prüfen (eigenes SQLite-Plugin mit Erweiterung).
- Holistic Landmarker auf älteren iPhones/Android-Geräten: Bildrate und Akku messen.
- Sciebo RDS an der eigenen Hochschule verfügbar?
- AWS-Open-Data-Bedingungen zu personenbezogenen Daten lesen (Landmarks mit Gesichtspunkten können Personen identifizierbar machen).
- MediaPipe Web im Capacitor-WebView: Bildrate auf iPhone (WKWebView) messen.
- Gehörlose und Dolmetschende früh in Entscheidungen einbinden (Muster AISLAC aus RESEARCH.md).
