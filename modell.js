// Verbindungsmodell v1 – reine Logik, ohne Browser.
// Erklärung: KONTEXT-UND-VERBINDUNG.md. Tests: modell.test.mjs
//
// Drei Dinge werden gespeichert, jedes in einer eigenen Datei:
//   Aufnahme  <id>.json            Spuren dieser Aufnahme und die Verbindungen der Person
//   Berechnet derived/<id>.<spur>.json  berechnete Spuren (z. B. Landmarks), neu berechenbar
//   Line      lines/<id>.line.json Zusammenstellung (Playlist) aus Verweisen
//
// Grundsatz: Eine Datei hat genau eine Person als Urheber. Niemand schreibt in die
// Datei eines anderen. Wer sich auf fremde Aufnahmen bezieht, legt eine Verbindung
// in der eigenen Datei an.
//
// Werte wie „visual“ oder „version“ sind sprachneutrale Schlüssel. Was die App anzeigt,
// steht in BEZEICHNUNG, je Sprache. Neue Sprache = neue Spalte, keine Datenänderung.

export const SCHEMA = { aufnahme: "sign-recording/1", line: "sign-line/1", berechnet: "sign-derived/1" };

// Arten von Spuren
export const SPUR = ["visual", "audio", "text", "landmarks", "mask"];
// Woher ein Text kommt
export const HERKUNFT = ["typed", "spoken", "history", "storage", "preset", "category", "predicted"];
// Arten von Verbindungen: was steht in welcher Beziehung zu worauf
export const VERBINDUNG = {
  describes: "Text oder Audio beschreibt Bild (z. B. Kontext)",
  version: "eigene Ausführung einer anderen Aufnahme, abhängig oder unabhängig",
  similar: "berechnete Ähnlichkeit, z. B. Bild zu Bild über Landmarks",
  translation: "Text in einer anderen Sprache",
  review: "Prüfung, z. B. durch Dolmetschende; überschreibt nie",
  edit: "eigene Änderung nach einer Suche",
};

export const BEZEICHNUNG = {
  de: {
    visual: "Visuell", audio: "Audio", text: "Text", landmarks: "Landmarks", mask: "Maske",
    typed: "getippt", spoken: "gesprochen", history: "aus Historie", storage: "aus Speicher",
    preset: "Vorauswahl", category: "Kategorie", predicted: "vorhergesagt",
    describes: "beschreibt", version: "Version", similar: "ähnlich", translation: "Übersetzung",
    review: "Prüfung", edit: "Änderung", dependent: "abhängig", independent: "unabhängig",
  },
  en: {
    visual: "Visual", audio: "Audio", text: "Text", landmarks: "Landmarks", mask: "Mask",
    typed: "typed", spoken: "spoken", history: "from history", storage: "from storage",
    preset: "preset", category: "category", predicted: "predicted",
    describes: "describes", version: "version", similar: "similar", translation: "translation",
    review: "review", edit: "edit", dependent: "dependent", independent: "independent",
  },
};

export function bezeichnung(schluessel, sprache = "de") {
  return BEZEICHNUNG[sprache]?.[schluessel] ?? BEZEICHNUNG.en[schluessel] ?? schluessel;
}

// ---------- Verweis: worauf genau zeigt etwas ----------
// { rec, track, from?, to?, region? }
//   rec    ID der Aufnahme, track  ID der Spur darin
//   from/to Zeit in Millisekunden ab Beginn der Aufnahme (zeitlich)
//   region  räumlich: { landmarks: ["hand_right"] } oder { box: [x, y, b, h] } von 0 bis 1
export function verweis(rec, track, mehr = {}) {
  return { rec, track, ...mehr };
}

// ---------- Prüfen (Validierung) ----------
// Gibt eine Liste von Fehlern zurück. Leere Liste heißt: gültig.

export function pruefeAufnahme(a) {
  const f = [];
  if (a.schema !== SCHEMA.aufnahme) f.push(`schema muss ${SCHEMA.aufnahme} sein`);
  pflicht(a, ["id", "by", "at"], "Aufnahme", f);
  const ids = new Set();
  for (const s of a.tracks || []) {
    if (ids.has(s.id)) f.push(`Spur-ID doppelt: ${s.id}`);
    ids.add(s.id);
    f.push(...pruefeSpur(s));
    if (s.by && s.by !== a.by) f.push(`Spur ${s.id}: fremder Urheber ${s.by} in Datei von ${a.by}`);
  }
  for (const v of a.links || []) {
    f.push(...pruefeVerbindung(v));
    if (v.by && v.by !== a.by) f.push(`Verbindung ${v.id}: fremder Urheber ${v.by} in Datei von ${a.by}`);
    for (const r of [...(v.what || []), ...(v.about || [])]) {
      if (r.rec === a.id && !ids.has(r.track)) f.push(`Verbindung ${v.id}: Spur ${r.track} fehlt in dieser Aufnahme`);
    }
  }
  return f;
}

export function pruefeSpur(s) {
  const f = [];
  pflicht(s, ["id", "kind", "by", "at"], `Spur ${s.id ?? "?"}`, f);
  if (s.kind && !SPUR.includes(s.kind)) f.push(`Spur ${s.id}: unbekannte Art ${s.kind}`);
  // Woher die Daten kommen: genau eins von Datei, Inhalt (Text oder Chips) oder Berechnung
  const quellen = ["file", "content", "chips", "derived"].filter((k) => s[k] !== undefined);
  if (quellen.length !== 1) f.push(`Spur ${s.id}: braucht genau eins von file, content, chips, derived`);
  if (s.file && (s.kind === "visual" || s.kind === "audio") && !s.file.stream) {
    f.push(`Spur ${s.id}: bei Bild und Ton aus einer MP4 sagt stream, welcher Strom gemeint ist`);
  }
  if (s.kind === "text") {
    if (typeof s.content !== "string" && !Array.isArray(s.chips)) f.push(`Spur ${s.id}: Text braucht content oder chips`);
    if (!s.lang) f.push(`Spur ${s.id}: Text braucht lang (Sprache)`);
    if (s.origin && !HERKUNFT.includes(s.origin)) f.push(`Spur ${s.id}: unbekannte Herkunft ${s.origin}`);
  }
  if (s.derived) {
    const d = s.derived;
    if (!d.model?.name || !d.model?.version) f.push(`Spur ${s.id}: berechnet braucht model.name und model.version`);
    if (!Array.isArray(d.from) || d.from.length === 0) f.push(`Spur ${s.id}: berechnet braucht from (Quelle)`);
  }
  return f;
}

export function pruefeVerbindung(v) {
  const f = [];
  pflicht(v, ["id", "kind", "by", "at"], `Verbindung ${v.id ?? "?"}`, f);
  if (v.kind && !(v.kind in VERBINDUNG)) f.push(`Verbindung ${v.id}: unbekannte Art ${v.kind}`);
  if (!v.what?.length) f.push(`Verbindung ${v.id}: what (Was) fehlt`);
  if (!v.about?.length) f.push(`Verbindung ${v.id}: about (Worauf) fehlt`);
  if (v.kind === "version" && !["dependent", "independent"].includes(v.binding)) {
    f.push(`Verbindung ${v.id}: Version braucht binding dependent oder independent`);
  }
  if (v.kind === "similar" && (!v.model?.name || typeof v.score !== "number")) {
    f.push(`Verbindung ${v.id}: Ähnlichkeit braucht model und score`);
  }
  for (const r of [...(v.what || []), ...(v.about || [])]) f.push(...pruefeVerweis(r, v.id));
  return f;
}

export function pruefeVerweis(r, wo = "?") {
  const f = [];
  if (!r.rec || !r.track) f.push(`Verweis in ${wo}: rec und track nötig`);
  if (r.from !== undefined && r.to !== undefined && r.to < r.from) f.push(`Verweis in ${wo}: to liegt vor from`);
  return f;
}

export function pruefeLine(l) {
  const f = [];
  if (l.schema !== SCHEMA.line) f.push(`schema muss ${SCHEMA.line} sein`);
  pflicht(l, ["id", "by", "at", "name"], "Line", f);
  if (!Array.isArray(l.items)) f.push("Line braucht items");
  for (const r of l.items || []) f.push(...pruefeVerweis(r, `Line ${l.id}`));
  return f;
}

function pflicht(o, felder, wo, f) {
  for (const k of felder) if (o[k] === undefined || o[k] === "") f.push(`${wo}: ${k} fehlt`);
}

// ---------- Schreiben: nur in eigene Dateien ----------
export function darfSchreiben(datei, person) {
  return datei.by === person;
}

// ---------- Kern und Umgebung ----------
// Kern: die Aufnahme, die gerade gesucht oder gespeichert wird.
// Umgebung: alles, was über Verbindungen mit ihr verknüpft ist, aus allen bekannten Dateien.
// Ergebnis nach Art der Verbindung gruppiert, damit die Oberfläche jede Gruppe an ihrer
// festen Position zeigen und ein- oder ausblenden kann.
export function umgebung(kernId, aufnahmen) {
  const gruppen = {};
  for (const a of aufnahmen) {
    for (const v of a.links || []) {
      const zeigtAufKern = v.about.some((r) => r.rec === kernId);
      const kommtVomKern = v.what.some((r) => r.rec === kernId);
      if (!zeigtAufKern && !kommtVomKern) continue;
      const andere = (zeigtAufKern ? v.what : v.about).filter((r) => r.rec !== kernId);
      if (andere.length === 0 && zeigtAufKern) {
        // z. B. eigener Text zur eigenen Aufnahme
        (gruppen[v.kind] ||= []).push({ link: v, refs: v.what, quelle: a.id });
      } else if (andere.length) {
        (gruppen[v.kind] ||= []).push({ link: v, refs: andere, quelle: a.id });
      }
    }
  }
  return gruppen;
}

// ---------- Filter für die Suche ----------
// „von wem“: z. B. Dozierende suchen nur in Aufnahmen bestimmter Personen.
export function vonWem(aufnahmen, personen) {
  const p = new Set(personen);
  return aufnahmen.filter((a) => p.has(a.by));
}

// Texte einer bestimmten Herkunft finden, z. B. alle Vorauswahl-Texte zum Lernen.
export function texteMitHerkunft(aufnahmen, herkunft) {
  return aufnahmen.flatMap((a) =>
    (a.tracks || []).filter((s) => s.kind === "text" && s.origin === herkunft).map((s) => ({ rec: a.id, spur: s })),
  );
}

// ---------- Berechnete Spur anlegen ----------
// Landmarks, Masken usw. tragen immer: Modell mit Version, Datum, Quelle.
export function berechneteSpur({ id, kind, by, at, from, model, params, file }) {
  const s = { id, kind, by, at, derived: { from, model, ...(params ? { params } : {}) } };
  if (file) s.derived.file = file;
  return s;
}

// Dateiname einer berechneten Spur: derived/<aufnahme>.<spur>.json
export function dateiBerechnet(recId, spurId) {
  return `derived/${recId}.${spurId}.json`;
}
