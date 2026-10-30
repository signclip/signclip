// Baustein: Nextcloud-Ordner an eine andere Cloud freigeben (föderiertes Teilen), z. B. an Sciebo.
//
// Im Nextcloud-Test am 27.10.2026 erfolgreich: Ordner aus der eigenen Nextcloud an eine Sciebo-ID
// freigegeben, in Sciebo einmal über die Glocke angenommen, danach dort sichtbar.
//
// Ein Modul ohne Abhängigkeiten. Zugangsdaten kommen immer von außen (zur Laufzeit), nie aus dem Code.
//
// Zwei Wege zur selben Nextcloud-Funktion „Freigabe anlegen“:
//   via: "webapppassword"  → /index.php/apps/webapppassword/api/v1/shares
//        für die Browser-Version; die App WebAppPassword erlaubt dem Browser diesen Zugriff (CORS),
//        wenn im Feld „Files sharing“ die App-Adresse eingetragen ist.
//   via: "ocs"             → /ocs/v2.php/apps/files_sharing/api/v1/shares
//        die normale Nextcloud-Schnittstelle; für die Handy-App (dort gibt es keine Browser-Sperre).
// Parameter und Antwort sind bei beiden gleich.

/** Freigabearten der Nextcloud (Auszug) */
export const SHARE_TYPE = { user: 0, group: 1, publicLink: 3, federated: 6 };

/** Rechte als Bitmaske der Nextcloud: 1 lesen, 2 ändern, 4 anlegen, 8 löschen, 16 weiterteilen */
export const PERMISSION = { read: 1, update: 2, create: 4, delete: 8, share: 16 };

const ENDPOINT = {
  webapppassword: "/index.php/apps/webapppassword/api/v1/shares",
  ocs: "/ocs/v2.php/apps/files_sharing/api/v1/shares",
};

/**
 * Prüft eine föderierte Cloud-ID wie „name@uni-koeln.de@uni-koeln.sciebo.de“.
 * Alles vor dem LETZTEN @ ist der Benutzername (darf selbst @ enthalten), dahinter der Server.
 * @returns {{ user: string, server: string } | null}
 */
export function parseCloudId(cloudId) {
  // Ein „@“ vorne ist nur Anzeige (wie bei Erwähnungen) und gehört nicht zur ID.
  const id = String(cloudId || "").trim().replace(/^@+/, "");
  const at = id.lastIndexOf("@");
  if (at <= 0 || at === id.length - 1) return null;
  const user = id.slice(0, at), server = id.slice(at + 1).replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!/^[^\s/]+\.[^\s/]+$/.test(server) || /\s/.test(user)) return null;
  return { user, server };
}

/** Vergleichbare Form einer Cloud-ID: ohne „@“ vorne, ohne https://, ohne Schrägstrich am Ende, klein. */
export function normCloudId(cloudId) {
  const p = parseCloudId(cloudId);
  return p ? `${p.user}@${p.server}`.toLowerCase() : String(cloudId || "").trim().toLowerCase();
}

/** Basic-Auth-Kopfzeile, UTF-8-sicher */
function basicAuth(user, password) {
  const bytes = new TextEncoder().encode(`${user}:${password}`);
  let bin = ""; for (const b of bytes) bin += String.fromCharCode(b);
  return "Basic " + btoa(bin);
}

/**
 * Gibt einen Ordner der eigenen Nextcloud an eine Cloud-ID frei.
 * Die Empfängerseite muss die Freigabe einmal annehmen (bei Sciebo: Glocke oben).
 *
 * @param {object} o
 * @param {string} o.server       Adresse der eigenen Nextcloud, z. B. https://nx12345.your-storageshare.de
 * @param {string} o.user         eigener Nextcloud-Benutzername
 * @param {string} o.appPassword  App-Passwort dieses Geräts
 * @param {string} o.folder       Ordnerpfad in der eigenen Nextcloud, z. B. "Sign" oder "/Sign/Gruppe"
 * @param {string} o.cloudId      Ziel, z. B. "name@uni-koeln.de@uni-koeln.sciebo.de"
 * @param {number} [o.permissions=1]  Standard: nur lesen
 * @param {"webapppassword"|"ocs"} [o.via="webapppassword"]
 * @param {typeof fetch} [o.fetchImpl=fetch]  austauschbar (Tests, Capacitor)
 * @returns {Promise<{ id: string|number|null, already: boolean, raw: any }>}  already = war schon freigegeben
 */
/**
 * Liest die bestehenden eigenen Freigaben – eines Ordners, oder ohne `folder` alle.
 * @returns {Promise<Array<{ id: any, share_type: number, share_with: string }>>}
 */
export async function listShares({ server, user, appPassword, folder, via = "webapppassword", fetchImpl = fetch }) {
  const clean = String(folder || "").trim().replace(/^\/+|\/+$/g, "");
  // ohne Ordner: alle eigenen Freigaben
  const url = server.trim().replace(/\/+$/, "") + ENDPOINT[via] + "?format=json&reshares=false" + (clean ? "&path=" + encodeURIComponent("/" + clean) : "");
  const res = await fetchImpl(url, {
    method: "GET",
    headers: { Authorization: basicAuth(user, appPassword), "OCS-APIRequest": "true", Accept: "application/json" },
  });
  const raw = await res.json().catch(() => null);
  const data = raw && raw.ocs && raw.ocs.data;
  if (!res.ok || !Array.isArray(data)) throw new Error(`Freigaben lesen: ${res.status}`);
  return data;
}

/** Gibt es für den Ordner schon eine föderierte Freigabe an diese Cloud-ID? */
async function findExisting(opts, cloudId) {
  return (await lookUp(opts, cloudId)).share;
}
/** Wie findExisting, sagt aber zusätzlich, ob die Liste überhaupt lesbar war (für eine ehrliche Fehlermeldung). */
async function lookUp(opts, cloudId) {
  try {
    const list = await listShares(opts);
    const want = normCloudId(cloudId);
    const share = list.find(sh => Number(sh.share_type) === SHARE_TYPE.federated && normCloudId(sh.share_with) === want) || null;
    return { share, readable: true, count: list.filter(sh => Number(sh.share_type) === SHARE_TYPE.federated).length };
  } catch (e) { return { share: null, readable: false, error: e.message }; }
}
export async function shareFolderToCloudId({
  server, user, appPassword, folder, cloudId,
  permissions = PERMISSION.read, via = "webapppassword", fetchImpl = fetch,
}) {
  if (!server || !user || !appPassword) throw new Error("Zugang zur eigenen Nextcloud fehlt.");
  if (parseCloudId(cloudId)) { const p = parseCloudId(cloudId); cloudId = `${p.user}@${p.server}`; }
  else throw new Error("Cloud-ID ungültig. Format: name@server, z. B. name@uni-koeln.de@uni-koeln.sciebo.de");
  const path = "/" + String(folder || "").trim().replace(/^\/+|\/+$/g, "");
  if (path === "/") throw new Error("Ordner angeben.");
  if (!ENDPOINT[via]) throw new Error(`Unbekannter Weg: ${via}`);

  // Erst nachsehen: Ist der Ordner schon an diese ID freigegeben? Die Nextcloud lehnt ein zweites
  // Teilen ab – und im Browser kommt diese Ablehnung oft ohne CORS-Freigabe an, sieht also wie
  // „keine Antwort“ aus. Darum vorher prüfen.
  const listOpts = { server, user, appPassword, folder, via, fetchImpl };
  const before = await findExisting(listOpts, cloudId);
  if (before) return { id: before.id ?? null, already: true, raw: before };

  const url = server.trim().replace(/\/+$/, "") + ENDPOINT[via] + "?format=json";
  let res;
  try {
    res = await fetchImpl(url, {
      method: "POST",
      headers: {
        Authorization: basicAuth(user, appPassword),
        "OCS-APIRequest": "true",
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        path, shareType: String(SHARE_TYPE.federated), shareWith: cloudId.trim(), permissions: String(permissions),
      }).toString(),
    });
  } catch {
    // Keine lesbare Antwort: vielleicht ist die Freigabe trotzdem entstanden (oder bestand schon) – nachsehen.
    // Die Nextcloud meldet die Freigabe erst an den anderen Server und antwortet danach – das kann dauern.
    // Darum mehrmals nachsehen, bevor es als Fehler gilt.
    let seen = null;
    for (const wait of [0, 1500, 3000, 5000]) {
      if (wait) await new Promise(r => setTimeout(r, wait));
      seen = await lookUp(listOpts, cloudId);
      if (seen.share) return { id: seen.share.id ?? null, already: false, raw: seen.share };
    }
    // Nur beobachtete Tatsachen melden – den eigentlichen Grund kennt die App hier nicht.
    throw new Error(
      "Beobachtet: Anfrage zum Teilen an deine Nextcloud gesendet. Ihre Antwort war für die App nicht lesbar " +
      "(der Browser gibt Antworten ohne CORS-Freigabe nicht weiter – Inhalt und Grund sind daher unbekannt). " +
      (seen && seen.readable
        ? `Danach 4-mal in 10 s die Freigabeliste von „${path}“ gelesen: keine Freigabe an ${cloudId} vorhanden.`
        : `Danach war auch die Freigabeliste nicht lesbar${seen && seen.error ? " (" + seen.error + ")" : ""}.`) +
      " Den Grund zeigt die Nextcloud selbst: beim Ordner unter Teilen oder unter Verwaltungseinstellungen → Protokollierung.");
  }
  const raw = await res.json().catch(() => null);
  const meta = raw && raw.ocs && raw.ocs.meta;
  if (!res.ok || (meta && meta.status !== "ok")) {
    const msg = (meta && meta.message) || `${res.status} ${res.statusText || ""}`.trim();
    // Schon einmal an dieselbe ID freigegeben? Dann ist das Ziel erreicht – kein Fehler.
    if (/already shared|bereits geteilt|bereits freigegeben/i.test(msg)) return { id: null, already: true, raw };
    // Antwort der Nextcloud wörtlich weitergeben; Hinweise nur als möglicher Grund kennzeichnen.
    const said = `Nextcloud antwortet (HTTP ${res.status}): ${msg}`;
    if (res.status === 401) throw new Error(`${said}. Möglicher Grund: Anmeldung mit normalem Passwort an dieser Schnittstelle nicht erlaubt – App-Passwort versuchen.`);
    if (res.status === 403 && !meta) throw new Error(`${said}. Möglicher Grund: WebAppPassword, Feld „Files sharing“.`);
    throw new Error(said);
  }
  const data = raw && raw.ocs && raw.ocs.data;
  return { id: data && data.id != null ? data.id : null, already: false, raw };
}
