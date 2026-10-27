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
  const id = String(cloudId || "").trim();
  const at = id.lastIndexOf("@");
  if (at <= 0 || at === id.length - 1) return null;
  const user = id.slice(0, at), server = id.slice(at + 1).replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!/^[^\s/]+\.[^\s/]+$/.test(server) || /\s/.test(user)) return null;
  return { user, server };
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
 * @returns {Promise<{ id: string|number|null, raw: any }>}
 */
export async function shareFolderToCloudId({
  server, user, appPassword, folder, cloudId,
  permissions = PERMISSION.read, via = "webapppassword", fetchImpl = fetch,
}) {
  if (!server || !user || !appPassword) throw new Error("Zugang zur eigenen Nextcloud fehlt.");
  if (!parseCloudId(cloudId)) throw new Error("Cloud-ID ungültig. Format: name@server, z. B. name@uni-koeln.de@uni-koeln.sciebo.de");
  const path = "/" + String(folder || "").trim().replace(/^\/+|\/+$/g, "");
  if (path === "/") throw new Error("Ordner angeben.");
  if (!ENDPOINT[via]) throw new Error(`Unbekannter Weg: ${via}`);

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
    throw new Error(via === "webapppassword"
      ? "Keine Antwort – im Browser meist CORS: WebAppPassword, Feld „Files sharing“, App-Adresse eintragen."
      : "Keine Antwort – Netz oder Adresse prüfen.");
  }
  const raw = await res.json().catch(() => null);
  const meta = raw && raw.ocs && raw.ocs.meta;
  if (!res.ok || (meta && meta.status !== "ok")) {
    const msg = (meta && meta.message) || `${res.status} ${res.statusText || ""}`.trim();
    throw new Error(`Freigabe fehlgeschlagen: ${msg}`);
  }
  const data = raw && raw.ocs && raw.ocs.data;
  return { id: data && data.id != null ? data.id : null, raw };
}
