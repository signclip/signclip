// Kontextmodell v1 – reine Logik, ohne Browser.
// Erklärung: KONTEXT-UND-VERBINDUNG.md, Abschnitt „Kontext“. Tests: kontext.test.mjs
//
// Ein Kontext ist eine Liste von Chips auf einer Ebene. Ein Chip ist ein Text.
// Bedeutung entsteht nur über die Art der Klammer:
//   ( … )  ausmultiplizieren: „Frucht (Banane Erdbeere)“ → „Frucht Banane“, „Frucht Erdbeere“
//   [ … ]  Fingeralphabet:    „[Anna]“ → A N N A
// Alles außerhalb von [ ] ist ein ganzes Wort. Eine runde Klammer innerhalb von [ ]
// zieht ein ganzes Wort heraus. Beide Schreibweisen ergeben dasselbe (siehe Tests).

// Ein Chip in Teile zerlegen: Text, rund (Liste), eckig (Teile).
export function zerlege(chip) {
  const teile = [];
  let i = 0, text = "";
  const textAbschliessen = () => { if (text.trim()) teile.push({ art: "wort", text: text.trim() }); text = ""; };
  while (i < chip.length) {
    const c = chip[i];
    if (c === "(" || c === "[") {
      const zu = c === "(" ? ")" : "]";
      const ende = passendeKlammer(chip, i, c, zu);
      if (ende < 0) throw new Error(`Klammer ${c} ohne ${zu} in „${chip}“`);
      textAbschliessen();
      const innen = chip.slice(i + 1, ende);
      teile.push(c === "(" ? { art: "rund", liste: liste(innen) } : { art: "eckig", teile: zerlegeEckig(innen) });
      i = ende + 1;
    } else if (c === ")" || c === "]") {
      throw new Error(`Klammer ${c} ohne Öffnung in „${chip}“`);
    } else { text += c; i++; }
  }
  textAbschliessen();
  return teile;
}

function passendeKlammer(s, start, auf, zu) {
  let tiefe = 0;
  for (let j = start; j < s.length; j++) {
    if (s[j] === auf) tiefe++;
    else if (s[j] === zu && --tiefe === 0) return j;
  }
  return -1;
}

// Inhalt einer runden Klammer: mit Komma getrennt, wenn ein Komma vorkommt, sonst mit Leerzeichen.
// So sind auch Einträge aus mehreren Wörtern möglich: „(rote Beere, Banane)“.
function liste(innen) {
  const trenner = innen.includes(",") ? "," : /\s+/;
  return innen.split(trenner).map((s) => s.trim()).filter(Boolean);
}

// Inhalt einer eckigen Klammer: Buchstaben, Leerzeichen, und in ( ) ganze Wörter.
function zerlegeEckig(innen) {
  const teile = [];
  for (let i = 0; i < innen.length; i++) {
    const c = innen[i];
    if (c === "(") {
      const ende = passendeKlammer(innen, i, "(", ")");
      if (ende < 0) throw new Error(`Klammer ( ohne ) in „[${innen}]“`);
      teile.push({ art: "wort", text: innen.slice(i + 1, ende).trim() });
      i = ende;
    } else if (c === " ") {
      teile.push({ art: "leer" });
    } else {
      teile.push({ art: "buchstabe", text: c.toLocaleUpperCase("de") });
    }
  }
  return teile;
}

// Ausmultiplizieren: jede runde Klammer vervielfacht alles, was davor und danach steht.
// Ergebnis: Liste von Lesarten, jede Lesart ist eine Liste von Einheiten
// (Wörter und Buchstaben), so wie sie gebärdet würden.
export function lesarten(chip) {
  let ergebnis = [[]];
  for (const teil of zerlege(chip)) {
    if (teil.art === "rund") {
      ergebnis = ergebnis.flatMap((l) => teil.liste.map((w) => [...l, { art: "wort", text: w }]));
    } else {
      const einheiten = teil.art === "eckig" ? teil.teile : [{ art: "wort", text: teil.text }];
      ergebnis = ergebnis.map((l) => [...l, ...einheiten]);
    }
  }
  return ergebnis;
}

// Lesart als lesbarer Text: Buchstaben mit Bindestrich wie im Fingeralphabet üblich.
export function alsText(lesart) {
  const out = [];
  let buchstaben = [];
  const flush = () => { if (buchstaben.length) out.push(buchstaben.join("-")); buchstaben = []; };
  for (const e of lesart) {
    if (e.art === "buchstabe") buchstaben.push(e.text);
    else { flush(); if (e.art === "wort") out.push(e.text); }
  }
  flush();
  return out.join(" ");
}

// Alle Lesarten eines ganzen Kontexts (alle Chips), als Text. Das ist, was die Suche findet.
export function suchbegriffe(chips) {
  return [...new Set(chips.flatMap((c) => lesarten(c).map(alsText)))];
}

// Serie: Bei einer Serie von Aufnahmen wird der Inhalt der runden Klammer herausgenommen,
// jede Aufnahme bekommt der Reihe nach einen Eintrag. Ohne runde Klammer gilt der Chip für alle.
export function fuerSerie(chip, nummer) {
  const alle = lesarten(chip);
  if (alle.length === 1) return alsText(alle[0]);
  return nummer < alle.length ? alsText(alle[nummer]) : null; // null: Serie ist zu Ende
}

// Cluster: Das Wort vor einer runden Klammer fasst ihren Inhalt zusammen.
// „Frucht (Banane Erdbeere)“ → { Frucht: [Banane, Erdbeere] }
export function cluster(chips) {
  const c = {};
  for (const chip of chips) {
    const teile = zerlege(chip);
    teile.forEach((t, i) => {
      if (t.art !== "rund") return;
      const vorher = teile[i - 1];
      const name = vorher && vorher.art === "wort" ? vorher.text : "";
      c[name] = [...new Set([...(c[name] || []), ...t.liste])];
    });
  }
  return c;
}
