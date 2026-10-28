// Tests als ausführbare Erklärung des Kontextmodells. Ausführen: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { suchbegriffe, fuerSerie, cluster, lesarten, alsText, zerlege } from "./kontext.js";

test("Ein Chip ohne Klammer ist einfach ein Wort", () => {
  assert.deepEqual(suchbegriffe(["Hallo"]), ["Hallo"]);
});

test("Alle Chips liegen auf einer Ebene, die Reihenfolge bleibt", () => {
  assert.deepEqual(suchbegriffe(["Hallo", "Danke", "Bitte"]), ["Hallo", "Danke", "Bitte"]);
});

test("Runde Klammer: alles darin wird mit dem Davorstehenden ausmultipliziert", () => {
  assert.deepEqual(suchbegriffe(["Frucht (Banane Erdbeere)"]), ["Frucht Banane", "Frucht Erdbeere"]);
});

test("Runde Klammer: mehrere Wörter davor bleiben zusammen", () => {
  assert.deepEqual(suchbegriffe(["rote Frucht (Kirsche Erdbeere)"]), ["rote Frucht Kirsche", "rote Frucht Erdbeere"]);
});

test("Runde Klammer: auch was danach steht, gilt für jede Lesart (Annahme)", () => {
  assert.deepEqual(suchbegriffe(["Frucht (Banane Erdbeere) essen"]), ["Frucht Banane essen", "Frucht Erdbeere essen"]);
});

test("Runde Klammer mit Komma: Einträge dürfen aus mehreren Wörtern bestehen (Annahme)", () => {
  assert.deepEqual(suchbegriffe(["Frucht (rote Beere, Banane)"]), ["Frucht rote Beere", "Frucht Banane"]);
});

test("Zwei runde Klammern multiplizieren sich", () => {
  assert.deepEqual(suchbegriffe(["(ich du) (gehe komme)"]), ["ich gehe", "ich komme", "du gehe", "du komme"]);
});

test("Eckige Klammer: Inhalt wird im Fingeralphabet in einzelne Buchstaben übersetzt", () => {
  const [l] = lesarten("[Anna]");
  assert.deepEqual(l.map((e) => e.text), ["A", "N", "N", "A"]);
  assert.equal(alsText(l), "A-N-N-A");
});

test("Eckige Klammer: Leerzeichen zählt als Leerzeichen", () => {
  const [l] = lesarten("[Anna Lena]");
  assert.deepEqual(l.map((e) => e.art), ["buchstabe", "buchstabe", "buchstabe", "buchstabe", "leer", "buchstabe", "buchstabe", "buchstabe", "buchstabe"]);
  assert.equal(alsText(l), "A-N-N-A L-E-N-A");
});

test("Eckige Klammer: Umlaute und ß bleiben eigene Buchstaben", () => {
  assert.equal(alsText(lesarten("[Jürgen]")[0]), "J-Ü-R-G-E-N");
});

test("Ganzes Wort herausziehen, Weg A: eckige Klammer schließen und wieder öffnen", () => {
  assert.equal(alsText(lesarten("[Anna] Köln [Weg]")[0]), "A-N-N-A Köln W-E-G");
});

test("Ganzes Wort herausziehen, Weg B: runde Klammer in der eckigen", () => {
  assert.equal(alsText(lesarten("[Anna (Köln) Weg]")[0]), "A-N-N-A Köln W-E-G");
});

test("Beide Wege ergeben dieselben Einheiten – die Entscheidung ist nur eine der Eingabe", () => {
  const a = lesarten("[Anna] Köln [Weg]")[0].filter((e) => e.art !== "leer");
  const b = lesarten("[Anna (Köln) Weg]")[0].filter((e) => e.art !== "leer");
  assert.deepEqual(a, b);
});

test("Serie: der Inhalt der runden Klammer wird herausgenommen, je Aufnahme einer", () => {
  const chip = "Frucht (Banane Erdbeere Apfel)";
  assert.equal(fuerSerie(chip, 0), "Frucht Banane");
  assert.equal(fuerSerie(chip, 1), "Frucht Erdbeere");
  assert.equal(fuerSerie(chip, 2), "Frucht Apfel");
  assert.equal(fuerSerie(chip, 3), null, "Serie ist zu Ende");
});

test("Serie: ein Chip ohne runde Klammer gilt für jede Aufnahme der Serie", () => {
  assert.equal(fuerSerie("Küche", 0), "Küche");
  assert.equal(fuerSerie("Küche", 5), "Küche");
});

test("Cluster ergeben sich aus den Klammern: das Wort davor fasst zusammen", () => {
  assert.deepEqual(cluster(["Frucht (Banane Erdbeere)", "Frucht (Apfel)", "Farbe (rot blau)", "Hallo"]), {
    Frucht: ["Banane", "Erdbeere", "Apfel"],
    Farbe: ["rot", "blau"],
  });
});

test("Offene oder überzählige Klammern werden als Fehler gemeldet", () => {
  assert.throws(() => zerlege("Frucht (Banane"), /ohne \)/);
  assert.throws(() => zerlege("Anna]"), /ohne Öffnung/);
});
