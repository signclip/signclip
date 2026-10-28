# Research

Stand: 28.10.2026 (Recherche vom 26.10.2026, ergänzt um Lehren aus der ersten Version und offene Fragen) · Zusammengeführt aus dem Projektdokument `research.md` und der früheren Repo-Fassung. Konsequenzen für Speicher, Modelle und Phasen: [INFRASTRUCTURE.md](INFRASTRUCTURE.md), [ARCHITECTURE.md](ARCHITECTURE.md).

**Format für Ergebnisse:** Jede geklärte Frage bekommt Frage, Ergebnis, Quelle (Link), Datum und Konsequenz für Design oder Architektur. Vor jeder Festlegung wird der aktuelle Stand geprüft (Versionen, Lizenzen, Genauigkeit).

---

## 1. Kurzfazit

- **Ansatz bestätigt:** Die führenden Systeme arbeiten mit Landmark-Sequenzen (MediaPipe) statt mit Rohvideo. Das gilt für Google SL2T, früher SignAll und sign.mt. Auch außerhalb der Gebärdensprache ist das das Standardformat, etwa in Robotik, Sport und Physiotherapie.
- **Engpass sind die Daten, nicht die Modelle.** Das gilt für DGS ganz besonders: Für DGS gibt es rund 50 h kontinuierliches Korpus, für ASL sind es tausende Stunden.
- **Es gibt kein öffentliches DGS→Text-Produkt.** Google bietet nur ASL→Englisch an. SignGemma ist weiter nicht veröffentlicht. Die deutschen Projekte sind entweder Forschung oder arbeiten in die Gegenrichtung (Text→DGS über Avatare).
- **Die Lücke für Sign** liegt dort, wo niemand arbeitet: eine persönliche und gemeinschaftliche Capture-Bibliothek mit vielen Variationen von Lernenden, die von Dolmetschenden validiert wird. Das ist genau das Datenmuster, das Common Voice und EgoDex in anderen Bereichen erfolgreich gemacht hat.
- **Realistisches Ziel für den Neustart:** ein Lexikon mit Suche nach Handform, Ort, Bewegung und Ähnlichkeit. Video→Text als zuverlässige Gebärdenübersetzung ist ungelöst und bleibt ein Forschungsziel (Annahme, weiter zu prüfen). Eine fehlende Dimension (Text zu Video, Video zu Text) wird nur als Vorschlag ergänzt, nie still gespeichert.

---

## 2. Gebärdensprache – globale Lage

### Google DeepMind – SL2T (12.08.2026)
- Multilinguales Sign-to-Text-Modell. Trainiert auf über 100.000 h Material aus mehr als 50 Gebärdensprachen, davon etwa ¼ ASL.
- MediaPipe Holistic läuft auf dem Gerät. Nur die Koordinaten gehen an den Server, das Video wird verworfen.
- Übersetzt direkt aus den Landmarks in Text, **ohne Glossen**.
- Benchmark FLEURS-ASL: 70 BLEURT zero-shot.
- Speziell optimiert für Linkshänder und für **einhändiges Gebärden mit dem Handy in der Hand**.
- Produkt: Gboard und Live Transcribe auf dem Pixel 11, im Handel seit 20.08.2026. Bisher nur ASL→Englisch, **noch kein DGS**, ohne Zeitplan.
- Governance: AI Sign Language Advisory Committee (AISLAC) mit Gehörlosenorganisationen.

### SignGemma (Google)
- Angekündigt 2025, Start war für „später 2025“ geplant. **Bis heute nicht veröffentlicht.** Google verweist auf die Gemma Release Notes. Im Forum kommen laufend Anfragen aus vielen Ländern (TİD, ägyptische und pakistanische Gebärdensprache u. a.).

### SignAll (Budapest, ASL + Ungarische GS)
- Ging aus dem Umfeld von Dolphio Technologies hervor.
- Ursprünglich ein Setup mit mehreren Tiefenkameras und farbigen Handschuhen. Ab 2021 kam MediaPipe dazu (Hands, Pose, Face Mesh), damit ging es ohne Handschuhe und mit nur einer Kamera.
- Über 300.000 annotierte Videos. Aus den 3D-Mocap-Daten wurden Landmarks für virtuelle Kamerawinkel simuliert.
- Letzte gefundene Aktivität: 2022 (ASL-Lens bei Snapchat). Gründung 2016 und „inaktiv“: **unbestätigt**.

### sign.mt (Amit Moryossef, Zürich)
- Open-Source-App für Übersetzung in beide Richtungen, Lizenz CC BY-NC-SA 4.0, auch offline nutzbar.
- Pipeline zwischen Text, SignWriting und Pose/Video. Baseline-Code unter `sign-language-processing` auf GitHub.
- Outstanding Demo Paper bei EMNLP 2024.
- Laut einer Startup-Datenbank „acquired“, mit Nagish als Investor (10/2025). **Nicht offiziell bestätigt.**
- Für Sign interessant: Open-Source-Werkzeuge zu Pose-Format, Segmentierung und Evaluation.

### Weitere Akteure
| Akteur | Land | Richtung | Notiz |
|---|---|---|---|
| Signapse | UK | Text → BSL/ASL, jetzt DGS | Fotorealistischer „Digital Signer“, DGS-Version „Kim“ zusammen mit G&L ab Herbst 2026 |
| Talksign | Nigeria/UK | ASL ↔ Text/Sprache | 250 Einzelgebärden, kein Satzfluss; DGS geplant |
| Signvrse | Kenia | Text → KSL | 3D-Avatar, Motion Capture |
| China (TV-Avatare) | CN | Text → CSL | Kritik wegen verzerrter und unvollständiger Übersetzungen |
| Insgesamt | – | – | Über 30 Firmen weltweit bieten KI-Gebärdensprachdolmetschen an (Slator) |

---

## 3. Deutschland / DGS

- **RoGSiLT** (DFKI + Inria, 3 Jahre, seit 06/2026): robuste Übersetzung in beide Richtungen für DGS und LSF, Ergebnis soll ein Prototyp sein.
- **AVASAG → KGA**: Ein BMBF-Projekt hat einen Avatar für Reisedurchsagen entwickelt. Daraus wurde der „Kommunale Gebärdensprach-Avatar“ (alangu, Charamel, über 70 Kommunen), der bisher nur einen kleinen Teil der Inhalte abdeckt.
- **BIGEKO** (Uni Augsburg, DFKI u. a.): Erkennung, Übersetzung und Animation von DGS am Beispiel Notruf, zusätzlich Emotionserkennung.
- **Armband-Projekt** (Bitech AG u. a.): Sensor-Armband mit Anpassung durch Nutzerfeedback, Ziel über 90 % Genauigkeit. Etwa 80.000 Menschen nutzen DGS als Hauptsprache.
- **G&L + Signapse**: DGS-Modelle auf Basis von Videoaufnahmen eines gehörlosen Dozenten. 3D-Avatare aus Game-Engines sind laut G&L an Raumgrammatik und Mimik gescheitert.

→ Fast alles in Deutschland geht in Richtung **Text→DGS (Avatar)**. Die Erkennung **DGS→Text** für den Alltag ist kaum besetzt.

---

## 4. Datensätze (Referenz)

| Datensatz | Sprache | Umfang | Quelle |
|---|---|---|---|
| YouTube-SL-25 | 25 Sprachen | 3.207 h | Web |
| YouTube-ASL | ASL | ~1.000 h, >2.500 Gebärdende | Web |
| How2Sign | ASL | ~80 h, multiview | Studio |
| FLEURS-ASL | ASL | ~15 h | Benchmark |
| **DGS-Korpus** | **DGS** | **~50 h** | Studio, Dialoge |
| RWTH-PHOENIX-2014 | DGS | Wetterbericht | TV, gedolmetscht |

Es gibt drei Arten von Datenquellen: Studioaufnahmen (klein, wenige Gebärdende), gedolmetschtes TV (größer, aber wenige und oft nicht-native Dolmetschende) und Web-Videos (groß und vielfältig).
→ Sign würde eine **vierte Art** schaffen: viele Lernende plus Validierung durch Profis.

Weitere Datensätze mit Größenordnungen (SIGNUM, ASL Citizen, PopSign, BOBSL u. a.) stehen in [INFRASTRUCTURE.md](INFRASTRUCTURE.md), Abschnitt 5.

---

## 5. Außerhalb der Gebärdensprache – ähnliche Modellierung und Aufnahmesequenzierung

### 5.1 Robotik / Imitation Learning (am nächsten dran)
- **EgoDex (Apple, ICLR 2026):** 829 h egozentrisches Video mit Apple Vision Pro, dazu 3D-Hand- und Fingertracking, das direkt bei der Aufnahme mitläuft. 194 Aufgaben, 338.000 Demonstrationen. Die Modelle werden mit mehr Daten messbar besser.
- **EgoVerse (04/2026):** Kollaboratives Framework zum Sammeln und Teilen egozentrischer Demonstrationen. 21 Hand-Keypoints, 6-DoF-Kopf und dichte Sprachlabels, dazu eine „lebende“ Datenpipeline.
- **EgoVLA:** Lernt die Handbewegungen von Menschen und überträgt sie per Retargeting auf Roboterhände.
- *Parallele zu Sign:* Die Hand wird als gemeinsame „Embodiment“-Ebene genutzt. Pose und Video werden **zeitgleich bei der Aufnahme** gespeichert. Die Daten sind mit kurzen Textlabels versehen.

### 5.2 Sport-Tracking
- **Hawk-Eye SkeleTRACK (Sony):** 29 Skelettpunkte pro Spieler in Echtzeit. Eingesetzt in NBA, Fußball (u. a. Ekstraklasa 2026/27, WM 2026 über HawkAR) und Tennis.
- Die NBA hat Punkt-Tracking (nur „Center of Mass“) durch Pose-Tracking ersetzt.
- *Parallele:* Viele synchronisierte Kameras, Clips mit mehreren Blickwinkeln, die sich teilen und exportieren lassen.

### 5.3 Physiotherapie / Fitness
- Smartphone-Apps mit MediaPipe Pose (33 Punkte) schicken Landmark-Sequenzen ans Backend und bewerten die Ausführung von Übungen.
- Wiederholungen werden mit einer einfachen Zustandsmaschine gezählt (READY → DOWN → UP). Die Messung der Kniebeugung ist im Vergleich zum Goniometer sehr zuverlässig (ICC 0,81–1,0).
- *Parallele:* Die Bewegung wird mit einer Referenz verglichen und es gibt Feedback, so wie Lernende Gebärden üben.

### 5.4 Animation / Text-to-Motion
- **MDM (Motion Diffusion Model), MotionDiffuse u. a.:** erzeugen Bewegung aus Text, trainiert auf HumanML3D und KIT. MDM wird teils sogar auf PHOENIX-2014T (DGS) getestet.
- *Parallele:* Die Richtung **Text → Video** in Sign, inklusive „geglätteter Übergänge“ und Variation der Figur.

### 5.5 Crowdsourcing von Sprachdaten
- **Mozilla Common Voice:** Freiwillige spenden Aufnahmen. Jeder Clip wird von **zwei** anderen Personen validiert, Releases erscheinen quartalsweise. Freiwillige Metadaten wie Alter oder Akzent. Inzwischen über 18.000 h in 87 Sprachen von mehr als 200.000 Beitragenden.
- **Project Euphonia audiotool (Google):** Referenzimplementierung für webbasierte Datensammlung. Seit 08/2025 archiviert, gedacht für Sprache, nicht für Gebärden.
- *Parallele:* Das ist praktisch das Organisationsmodell von Sign: Beiträge aus der Community, Validierung, versionierte Releases.

---

## 6. Übertragbare Muster für Sign

| Muster | Herkunft | Anwendung in Sign |
|---|---|---|
| Landmarks statt Rohvideo teilen | SL2T, EgoDex | Datenschutz beim Teilen über Sciebo; Video bleibt optional privat |
| Pose gleichzeitig mit dem Capture speichern | EgoDex | Beim Aufnehmen sofort Landmarks erzeugen und neben dem Video ablegen |
| Einhändig, Handy in der anderen Hand | SL2T | Diesen Fall im Capture-Design für Smartphone und Tablet einplanen |
| Doppelte Validierung | Common Voice | Prüfung durch Dolmetschende, dazu Peer-Bestätigung durch Lernende |
| Versionierte Releases | Common Voice | Bibliotheksstände als Versionen (v1 = SignClip-Prototyp) |
| Kurze Textlabels zur Sequenz | EgoVerse | Paralleler Text zum Capture als Suchschlüssel |
| Zustandsmaschine für Bewegungsphasen | Fitness-Apps | Gebärde segmentieren (Start, Bewegung, Ende) für die Ähnlichkeitssuche |
| Text → Motion per Diffusion | MDM | Spätere Video-Erzeugung aus Text mit Variation |
| Synthetische Blickwinkel aus 3D | SignAll | Mehr Variation aus wenigen Aufnahmen |
| Gemeinschaftliche Governance | AISLAC | Gehörlose und Dolmetschende früh einbinden |

---

## 7. Modelle für Kontext und Wörter (Kurzliste)

Für das Kontextmodell (Chips, Klammern, Verbindungsmodell) wurde zu bestehenden Modellen recherchiert (Stand 28.10.2026, Details und Quellen im Dokument zum Kontext- und Verbindungsmodell, sobald es vorliegt): DGS-Korpus-Glossen (`$ALPHA`), ELAN-Spuren, HamNoSys/SignWriting, OntoLex-Lemon, Facettenklassifikation, Brace Expansion, W3C Web Annotation mit Media Fragments, PROV-O.

---

## 8. Lehren aus der ersten Version

Aus [InitialVersion/ARCHITECTURE.md](InitialVersion/ARCHITECTURE.md) (dort behoben oder festgehalten). Diese Punkte werden im Neustart zu Testfällen:

1. Bei MP4 liefert Chrome Daten erst beim Stoppen. Wer den Zustand vorher löscht, verliert den letzten Videoteil.
2. Ein Service Worker darf Cloud-Anfragen nicht cachen, sonst kommen veraltete Videos und Indexe.
3. Eine gemeinsame `index.json` wird von mehreren Personen überschrieben. Eine Begleitdatei pro Video vermeidet das.
4. Passwörter mit Sonderzeichen brauchen UTF-8-sichere Kodierung für die Anmeldung.
5. Zusammenfügen muss das Seitenverhältnis der Videos übernehmen.
6. Querformat-Verhältnisse schneiden bei gesperrtem Hochformat zwangsläufig viel aus.

---

## 9. Offen / unbestätigt

- SignAll: Gründungsjahr und aktueller Status
- sign.mt: Übernahme durch Nagish
- SignGemma: Veröffentlichungstermin
- SL2T: ob und wann DGS dazukommt und ob es eine öffentliche API gibt

### Fragen aus der früheren Agenda, noch nicht beantwortet
| Bereich | Frage | Warum wichtig |
|---|---|---|
| Daten | Welche Annotationsstandards sind üblich (Glossen, HamNoSys, ELAN), und wie wird regionale und individuelle Variation beschrieben? | Daten sollen mit der Forschung zusammenpassen; Struktur Begriff, Variante, Aufnahme |
| Daten | Welche Aufnahmebedingungen (Licht, Winkel, Abstand) brauchen Erkennungsmodelle? | Hinweise für Lernende beim Aufnehmen |
| Erkennung | Wie weit trägt Erkennung bei Lernenden-Videos mit großer Variation? | Wert der ersten Lernendenvideos |
| Plattform | Grenzen von Kamera und Mikrofon in der PWA auf iOS (Aufnahme mit gleichzeitiger Spracherkennung); die erste Version umgeht den Mikrofon-Konflikt per Tastatur | Aufnahmefluss |
| Plattform | Welche Systemgesten blockieren Wischen am Rand auf iOS und Android? | Gestenlayout |
| Plattform | Wie verhalten sich WebDAV, CORS und die Nextcloud bei vielen gleichzeitigen Nutzenden? | Skalierung auf 20, dann 220 Personen |
| Recht | Welche Einwilligung braucht die Aufnahme von Personen (DSGVO), auch bei Übungsvideos? Was erlaubt Sciebo für geteilte Daten? | Videos zeigen Gesicht und Körper; Teilen außerhalb der Hochschule |
| Ethik | Wie wird die Gebärdensprachgemeinschaft von Beginn an beteiligt? Wer organisiert und bezahlt die Sichtung durch Dolmetschende? | Vertrauen, Qualität, Nutzen; Geschwindigkeit der Prüfung |
| Herkunft | Herkunftsnachweis für Aufnahmen (z. B. Content Credentials)? | Echtheit in einer Welt synthetischer Medien |

### Offene Vorarbeit
- [ ] Mit Dolmetschenden und Gehörlosen über Aufnahmeregeln, Einwilligung und Prüfablauf sprechen.
- [ ] Testgeräte für iOS und Android festlegen und freie Gesten prüfen.
- [ ] Echte Clipgröße auf iPhone und Android messen und die Speicher-Schätzung anpassen.

---

## 10. Quellen
- Google DeepMind – Putting sign language AI into users' hands: https://deepmind.google/blog/putting-sign-language-ai-into-users-hands/
- Google Developers Blog – SignAll SDK: https://developers.googleblog.com/en/signall-sdk-sign-language-interface-using-mediapipe-is-now-available-for-developers/
- Google AI Forum – SignGemma Zugang: https://discuss.ai.google.dev/t/how-to-get-access-to-signgemma/106766/
- Google AI Forum – SignGemma Availability: https://discuss.ai.google.dev/t/signgemma-availability/111432
- Notebookcheck – Pixel 11 ASL: https://www.notebookcheck.net/Google-Pixel-11-turns-American-Sign-Language-into-typed-text.1367397.0.html
- Dolphio – SignAll: https://dolphio.hu/en/project/signall/
- CB Insights – SignAll: https://www.cbinsights.com/investor/signall1
- sign.mt Paper (EMNLP 2024): https://aclanthology.org/2024.emnlp-demo.19
- Startupim – sign.mt: https://startupim.com/company/sign-mt
- Slator – How Good is AI Sign Language?: https://slator.com/resources/how-good-is-ai-sign-language/
- TechCabal – Talksign: https://techcabal.com/2026/02/16/talksign-launches-real-time-sign-language-translation-model/
- AU-Startups – Talksign: https://au-startups.com/news/talksign-launches-real-time-sign-language-translation-models
- Wikipedia – Signvrse: https://en.wikipedia.org/wiki/Signvrse
- idw – DFKI/Inria RoGSiLT: https://nachrichten.idw-online.de/2026/06/08/dfki-und-inria-entwickeln-robuste-ki-fuer-gebaerdensprachuebersetzung
- Digitaltag – Kommunaler Gebärdensprach-Avatar: https://digitaltag.eu/bewerbung/publikumspreis/kommunaler-gebaerdensprach-avatar-per-ki
- Uni Augsburg – BIGEKO: https://www.uni-augsburg.de/de/fakultaet/fai/informatik/prof/hcm/forschung/bigeko/
- Bitech – Armband: https://www.bitech.de/2026/04/22/hoeren-mit-den-haenden-wie-ein-intelligentes-armband-gebaerdensprache-in-echtzeit-uebersetzt/
- G&L – DGS mit Signapse: https://www.gl-systemhaus.de/blog/ki-deutsche-gebaerdensprache-videos-barrierefreiheit
- film-tv-video – G&L IBC2026: https://www.film-tv-video.de/technology/2026/09/01/gl-systemhaus-mit-ki-gebaerdensprachloesung/
- TUB Sign Language Corpus Collection (Datensatz-Übersicht): https://arxiv.org/pdf/2508.05374
- YouTube-ASL: https://arxiv.org/html/2306.15162v1
- How2Sign: https://arxiv.org/pdf/2008.08143v2
- EgoDex: https://arxiv.org/html/2505.11709v1
- EgoVerse: https://www.labellerr.com/blog/egoverse-egocentric-robot-learning-dataset/amp/
- EgoVLA: https://arxiv.org/html/2507.12440v2
- Hawk-Eye SkeleTRACK Tennis: https://www.hawkeyeinnovations.com/news/4243365/skeletrack-a-new-era-of-data-in-tennis
- Sportcal – Ekstraklasa/Hawk-Eye: https://www.sportcal.com/news/ekstraklasa-appoints-hawk-eye-to-enhance-tech-services/
- NBA Pose-Tracking: https://learnyourkeep.substack.com/p/the-heros-journey-nba-analyst-edition
- PoseTracker (MediaPipe Fitness): https://journal.binus.ac.id/index.php/ijcshai/article/view/15123/5710
- MediaPipe Reha-Reliabilität: https://books.aijr.org/index.php/press/catalog/download/163/81/3126-1?inline=1
- Bolt – MediaPipe Rep Counter: https://bolt.new/blog/how-to-use-mediapipe-to-build-interactive-apps-in-bolt
- MDM – Human Motion Diffusion Model: https://ar5iv.labs.arxiv.org/html/2209.14916
- Mozilla Common Voice (87 Sprachen): https://www.mozillafoundation.org/blog/mozilla-common-voice-dataset-grows-by-30-and-reaches-87-languages/
- Common Voice – Validierung: https://pontoon.mozilla.org/gsw/common-voice/web/locales/spontaneous-speech/en/pages/home.ftl
- Project Euphonia audiotool: https://github.com/google/project-euphonia-audiotool
