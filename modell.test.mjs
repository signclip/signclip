// Tests als ausführbare Erklärung des Verbindungsmodells. Ausführen: node --test
// Jeder Test ist ein Fall aus der Nutzung. Die Beispieldaten darüber zeigen,
// wie die Dateien wirklich aussehen.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SCHEMA, pruefeAufnahme, pruefeLine, pruefeSpur, umgebung, vonWem, texteMitHerkunft,
  berechneteSpur, dateiBerechnet, darfSchreiben, bezeichnung, verweis,
} from "./modell.js";
import { suchbegriffe } from "./kontext.js";

const LENA = "lena@cloud.example.de";     // Lernende
const DOZ = "dozent@cloud.example.de";    // Dozent
const MAX = "max@cloud.example.de";       // weiterer Lernender

// Aufnahme des Dozenten: Vorlage „Frucht Banane“, Bild und Ton aus einer MP4.
const vorlage = {
  schema: SCHEMA.aufnahme, id: "20261028T0843-a1f3", by: DOZ, at: "2026-10-28T08:43:00Z",
  tracks: [
    { id: "visual", kind: "visual", by: DOZ, at: "2026-10-28T08:43:00Z", file: { name: "20261028T0843-a1f3.mp4", stream: "video" } },
    { id: "audio", kind: "audio", by: DOZ, at: "2026-10-28T08:43:00Z", file: { name: "20261028T0843-a1f3.mp4", stream: "audio" } },
    { id: "ctx", kind: "text", by: DOZ, at: "2026-10-28T08:43:05Z", lang: "de", origin: "preset", chips: ["Frucht (Banane)"] },
  ],
  links: [
    { id: "l1", kind: "describes", by: DOZ, at: "2026-10-28T08:43:05Z",
      what: [verweis("20261028T0843-a1f3", "ctx")], about: [verweis("20261028T0843-a1f3", "visual")] },
  ],
};

// Aufnahme von Lena: eigene Version nach der Vorlage, Kontext getippt.
const lenasVersion = {
  schema: SCHEMA.aufnahme, id: "20261028T0910-b7c2", by: LENA, at: "2026-10-28T09:10:00Z",
  tracks: [
    { id: "visual", kind: "visual", by: LENA, at: "2026-10-28T09:10:00Z", file: { name: "20261028T0910-b7c2.mp4", stream: "video" } },
    { id: "ctx", kind: "text", by: LENA, at: "2026-10-28T09:10:04Z", lang: "de", origin: "typed", chips: ["Frucht (Banane)", "[Lena]"] },
  ],
  links: [
    { id: "l1", kind: "describes", by: LENA, at: "2026-10-28T09:10:04Z",
      what: [verweis("20261028T0910-b7c2", "ctx")], about: [verweis("20261028T0910-b7c2", "visual")] },
    { id: "l2", kind: "version", binding: "dependent", by: LENA, at: "2026-10-28T09:10:00Z",
      what: [verweis("20261028T0910-b7c2", "visual")], about: [verweis("20261028T0843-a1f3", "visual")] },
  ],
};

// Aufnahme von Max: frei aufgenommen, später als unabhängige Version verknüpft.
const maxAufnahme = {
  schema: SCHEMA.aufnahme, id: "20261028T1002-c9d4", by: MAX, at: "2026-10-28T10:02:00Z",
  tracks: [
    { id: "visual", kind: "visual", by: MAX, at: "2026-10-28T10:02:00Z", file: { name: "20261028T1002-c9d4.mp4", stream: "video" } },
  ],
  links: [
    { id: "l1", kind: "version", binding: "independent", by: MAX, at: "2026-10-28T10:05:00Z",
      what: [verweis("20261028T1002-c9d4", "visual", { from: 400, to: 1800 })], about: [verweis("20261028T0843-a1f3", "visual")] },
  ],
};

const alle = [vorlage, lenasVersion, maxAufnahme];

// ---------- Spuren einzeln ----------

test("Alle Beispielaufnahmen sind gültig", () => {
  for (const a of alle) assert.deepEqual(pruefeAufnahme(a), [], a.id);
});

test("Bild und Ton aus einer MP4 sind zwei Spuren, die auf denselben Strom-Container zeigen", () => {
  const [v, a] = vorlage.tracks;
  assert.equal(v.file.name, a.file.name);
  assert.deepEqual([v.file.stream, a.file.stream], ["video", "audio"]);
});

test("Ohne stream ist nicht klar, ob Bild oder Ton gemeint ist", () => {
  const s = { id: "v", kind: "visual", by: LENA, at: "x", file: { name: "a.mp4" } };
  assert.match(pruefeSpur(s).join(), /stream/);
});

test("Jede Spur trägt Benutzer und Datum als Eigenschaft", () => {
  const s = { id: "t", kind: "text", content: "Hallo", lang: "de" };
  const f = pruefeSpur(s).join();
  assert.match(f, /by fehlt/);
  assert.match(f, /at fehlt/);
});

test("Text braucht eine Sprache, damit mehrere Sprachen nebeneinander bestehen", () => {
  const s = { id: "t", kind: "text", by: LENA, at: "x", content: "Hallo" };
  assert.match(pruefeSpur(s).join(), /lang/);
});

// ---------- Berechnete Spuren ----------

test("Landmarks sind berechnet: mit Modell, Version, Datum und Quelle", () => {
  const lm = berechneteSpur({
    id: "lm-hand", kind: "landmarks", by: LENA, at: "2026-10-28T09:11:00Z",
    from: [verweis("20261028T0910-b7c2", "visual")],
    model: { name: "mediapipe-hand-landmarker", version: "0.10.14" },
    params: { fps: 30 },
  });
  assert.deepEqual(pruefeSpur(lm), []);
  assert.equal(lm.derived.from[0].track, "visual");
  assert.equal(dateiBerechnet("20261028T0910-b7c2", "lm-hand"), "derived/20261028T0910-b7c2.lm-hand.json");
});

test("Eine berechnete Spur ohne Modell ist ungültig – sonst lässt sie sich nie neu berechnen", () => {
  const lm = { id: "lm", kind: "landmarks", by: LENA, at: "x", derived: { from: [verweis("r", "visual")] } };
  assert.match(pruefeSpur(lm).join(), /model/);
});

test("Glätten (Maske) ist ebenfalls eine berechnete Spur: Original bleibt, Einstellungen stehen dabei", () => {
  const maske = berechneteSpur({
    id: "mask", kind: "mask", by: LENA, at: "x",
    from: [verweis("20261028T0910-b7c2", "visual")],
    model: { name: "selfie-segmentation", version: "1" }, params: { temporal: 0.6 },
  });
  assert.deepEqual(pruefeSpur(maske), []);
  assert.equal(maske.derived.params.temporal, 0.6);
});

// ---------- Was und Worauf ----------

test("Kontext: Was = Textspur, Worauf = Bildspur", () => {
  const v = vorlage.links[0];
  assert.equal(v.kind, "describes");
  assert.equal(v.what[0].track, "ctx");
  assert.equal(v.about[0].track, "visual");
});

test("Kontext-Chips werden über das Kontextmodell durchsuchbar", () => {
  assert.deepEqual(suchbegriffe(lenasVersion.tracks[1].chips), ["Frucht Banane", "L-E-N-A"]);
});

test("Verweise können zeitlich auf einen Ausschnitt zeigen", () => {
  const r = maxAufnahme.links[0].what[0];
  assert.deepEqual([r.from, r.to], [400, 1800]);
});

test("Verweise können räumlich auf Landmarks zeigen", () => {
  const r = verweis("20261028T0910-b7c2", "lm-hand", { region: { landmarks: ["hand_right"] } });
  assert.deepEqual(r.region.landmarks, ["hand_right"]);
});

// ---------- Versionen von anderen ----------

test("Eigene Version: abhängig (nach Vorlage) oder unabhängig (frei, Bedeutung später)", () => {
  assert.equal(lenasVersion.links[1].binding, "dependent");
  assert.equal(maxAufnahme.links[0].binding, "independent");
});

test("Version ohne Angabe abhängig/unabhängig ist ungültig", () => {
  const a = structuredClone(lenasVersion);
  delete a.links[1].binding;
  assert.match(pruefeAufnahme(a).join(), /binding/);
});

test("Niemand schreibt in fremde Dateien: Lena darf nur ihre eigene Aufnahme ändern", () => {
  assert.equal(darfSchreiben(lenasVersion, LENA), true);
  assert.equal(darfSchreiben(vorlage, LENA), false);
});

test("Eine fremde Spur in der eigenen Datei wird erkannt", () => {
  const a = structuredClone(lenasVersion);
  a.tracks.push({ id: "x", kind: "text", by: DOZ, at: "x", lang: "de", content: "Korrektur" });
  assert.match(pruefeAufnahme(a).join(), /fremder Urheber/);
});

// ---------- Kern und Umgebung ----------

test("Umgebung des Kerns: alle Versionen anderer und der eigene Kontext, nach Art gruppiert", () => {
  const u = umgebung(vorlage.id, alle);
  assert.deepEqual(Object.keys(u).sort(), ["describes", "version"]);
  const versionen = u.version.map((e) => e.quelle).sort();
  assert.deepEqual(versionen, [lenasVersion.id, maxAufnahme.id].sort());
  assert.equal(u.describes[0].refs[0].track, "ctx");
});

test("Umgebung funktioniert auch von der anderen Seite: Lenas Aufnahme sieht die Vorlage", () => {
  const u = umgebung(lenasVersion.id, alle);
  assert.equal(u.version[0].refs[0].rec, vorlage.id);
});

// ---------- Visuell zu visuell ----------

test("Suche Bild zu Bild: Ergebnis ist eine Verbindung „ähnlich“ mit Modell und Wert", () => {
  const treffer = {
    id: "s1", kind: "similar", by: LENA, at: "2026-10-28T09:20:00Z",
    model: { name: "landmark-dtw", version: "0.1" }, score: 0.87,
    what: [verweis(vorlage.id, "lm-hand")],              // Was gefunden wurde
    about: [verweis(lenasVersion.id, "lm-hand", { from: 0, to: 1500 })], // Woher gesucht
  };
  const a = structuredClone(lenasVersion);
  a.tracks.push(berechneteSpur({ id: "lm-hand", kind: "landmarks", by: LENA, at: "x",
    from: [verweis(a.id, "visual")], model: { name: "mediapipe-hand-landmarker", version: "0.10.14" } }));
  a.links.push(treffer);
  assert.deepEqual(pruefeAufnahme(a), []);
});

test("Ähnlichkeit ohne Modell oder Wert ist ungültig", () => {
  const a = structuredClone(lenasVersion);
  a.links.push({ id: "s1", kind: "similar", by: LENA, at: "x",
    what: [verweis(vorlage.id, "visual")], about: [verweis(a.id, "visual")] });
  assert.match(pruefeAufnahme(a).join(), /model und score/);
});

// ---------- Lernen, Ändern, Suchen ----------

test("Lernen: vorausgewählte Texte finden", () => {
  const t = texteMitHerkunft(alle, "preset");
  assert.equal(t.length, 1);
  assert.equal(t[0].rec, vorlage.id);
});

test("Eigene Änderung nach einer Suche: neuer Text, der auf den gefundenen zeigt", () => {
  const a = structuredClone(lenasVersion);
  a.tracks.push({ id: "ctx2", kind: "text", by: LENA, at: "x", lang: "de", origin: "typed", chips: ["Frucht (Banane)", "reif"] });
  a.links.push({ id: "e1", kind: "edit", by: LENA, at: "x",
    what: [verweis(a.id, "ctx2")], about: [verweis(vorlage.id, "ctx")] });
  assert.deepEqual(pruefeAufnahme(a), []);
});

test("Dozent sucht mit Einschränkung, von wem", () => {
  assert.deepEqual(vonWem(alle, [LENA, MAX]).map((a) => a.by), [LENA, MAX]);
});

// ---------- Line ----------

test("Line ist eine eigene Datei aus Verweisen, auch auf Ausschnitte", () => {
  const line = {
    schema: SCHEMA.line, id: "line-fruechte", by: DOZ, at: "2026-10-28T11:00:00Z",
    name: "Früchte", purpose: "learn",
    items: [verweis(vorlage.id, "visual"), verweis(maxAufnahme.id, "visual", { from: 400, to: 1800 })],
  };
  assert.deepEqual(pruefeLine(line), []);
});

// ---------- Mehrsprachigkeit ----------

test("Gespeichert wird ein neutraler Schlüssel, angezeigt die Bezeichnung der Sprache", () => {
  assert.equal(bezeichnung("dependent", "de"), "abhängig");
  assert.equal(bezeichnung("dependent", "en"), "dependent");
  assert.equal(bezeichnung("dependent", "fr"), "dependent", "fehlende Sprache fällt auf Englisch zurück");
});
