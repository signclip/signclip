// Tests als ausführbare Erklärung. Ausführen: node --test freigabe.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCloudId, normCloudId, shareFolderToCloudId, PERMISSION } from "./freigabe.js";

test("Cloud-ID mit zwei @: Benutzer ist alles vor dem letzten @", () => {
  assert.deepEqual(parseCloudId("name@uni-koeln.de@uni-koeln.sciebo.de"), { user: "name@uni-koeln.de", server: "uni-koeln.sciebo.de" });
});

test("Cloud-ID ohne Server oder mit Leerzeichen ist ungültig", () => {
  assert.equal(parseCloudId("name"), null);
  assert.equal(parseCloudId("name@"), null);
  assert.equal(parseCloudId("na me@uni-koeln.sciebo.de"), null);
});

function fakeFetch(answer = { ocs: { meta: { status: "ok" }, data: { id: 42 } } }, ok = true) {
  const calls = [];
  const f = async (url, opts) => {
    if (opts.method === "GET") return { ok: true, status: 200, json: async () => ({ ocs: { meta: { status: "ok" }, data: [] } }) };
    calls.push({ url, opts }); return { ok, status: ok ? 200 : 403, statusText: "", json: async () => answer };
  };
  f.calls = calls;
  return f;
}

test("Browser-Weg schickt eine föderierte Freigabe (Typ 6), nur lesen, an WebAppPassword", async () => {
  const f = fakeFetch();
  const r = await shareFolderToCloudId({
    server: "https://nc.example.de/", user: "me", appPassword: "pw", folder: "/Sign/",
    cloudId: "name@uni-koeln.de@uni-koeln.sciebo.de", fetchImpl: f,
  });
  assert.equal(r.id, 42);
  const { url, opts } = f.calls[0];
  assert.equal(url, "https://nc.example.de/index.php/apps/webapppassword/api/v1/shares?format=json");
  const body = new URLSearchParams(opts.body);
  assert.equal(body.get("path"), "/Sign");
  assert.equal(body.get("shareType"), "6");
  assert.equal(body.get("permissions"), String(PERMISSION.read));
  assert.equal(body.get("shareWith"), "name@uni-koeln.de@uni-koeln.sciebo.de");
  assert.equal(opts.headers["OCS-APIRequest"], "true");
});

test("Handy-App-Weg nutzt die normale Nextcloud-Schnittstelle mit gleichen Parametern", async () => {
  const f = fakeFetch();
  await shareFolderToCloudId({ server: "https://nc.example.de", user: "me", appPassword: "pw", folder: "Sign", cloudId: "a@b.de", via: "ocs", fetchImpl: f });
  assert.equal(f.calls[0].url, "https://nc.example.de/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json");
});

test("Fehlermeldung der Nextcloud wird weitergegeben", async () => {
  const f = fakeFetch({ ocs: { meta: { status: "failure", statuscode: 404, message: "Sharing failed" } } }, false);
  await assert.rejects(
    shareFolderToCloudId({ server: "https://nc.example.de", user: "me", appPassword: "pw", folder: "Sign", cloudId: "a@b.de", fetchImpl: f }),
    /Sharing failed/
  );
});

test("Ohne Ordner oder mit ungültiger ID wird gar nicht erst gesendet", async () => {
  const f = fakeFetch();
  await assert.rejects(shareFolderToCloudId({ server: "https://x.de", user: "me", appPassword: "pw", folder: "", cloudId: "a@b.de", fetchImpl: f }), /Ordner/);
  await assert.rejects(shareFolderToCloudId({ server: "https://x.de", user: "me", appPassword: "pw", folder: "S", cloudId: "kaputt", fetchImpl: f }), /Cloud-ID/);
  assert.equal(f.calls.length, 0);
});

test("Schon freigegeben gilt als Erfolg, nicht als Fehler", async () => {
  const f = fakeFetch({ ocs: { meta: { status: "failure", statuscode: 403, message: "Sharing SignTest failed, because this item is already shared with the account a@b.de" } } }, false);
  const r = await shareFolderToCloudId({ server: "https://nc.example.de", user: "me", appPassword: "pw", folder: "SignTest", cloudId: "a@b.de", fetchImpl: f });
  assert.equal(r.already, true);
});

test("Bestehende Freigabe wird vorher erkannt – kein zweites Anlegen", async () => {
  const posts = [];
  const f = async (url, opts) => {
    if (opts.method === "GET") return { ok: true, status: 200, json: async () => ({ ocs: { meta: { status: "ok" }, data: [{ id: 7, share_type: 6, share_with: "Name@uni-koeln.de@uni-koeln.sciebo.de" }] } }) };
    posts.push(url); throw new TypeError("Failed to fetch");
  };
  const r = await shareFolderToCloudId({ server: "https://nc.example.de", user: "me", appPassword: "pw", folder: "SignTest", cloudId: "name@uni-koeln.de@uni-koeln.sciebo.de", fetchImpl: f });
  assert.equal(r.already, true);
  assert.equal(r.id, 7);
  assert.equal(posts.length, 0);
});

test("Keine lesbare Antwort beim Anlegen, aber Freigabe existiert danach → Erfolg", async () => {
  let gets = 0;
  const f = async (url, opts) => {
    if (opts.method === "GET") { gets++; return { ok: true, status: 200, json: async () => ({ ocs: { meta: { status: "ok" }, data: gets > 1 ? [{ id: 9, share_type: 6, share_with: "a@b.de" }] : [] } }) }; }
    throw new TypeError("Failed to fetch");
  };
  const r = await shareFolderToCloudId({ server: "https://nc.example.de", user: "me", appPassword: "pw", folder: "S", cloudId: "a@b.de", fetchImpl: f });
  assert.equal(r.id, 9);
});

test("„@“ vorne, https:// und Groß-/Kleinschreibung stören nicht", () => {
  assert.deepEqual(parseCloudId("@name@uni-koeln.de@uni-koeln.sciebo.de"), { user: "name@uni-koeln.de", server: "uni-koeln.sciebo.de" });
  assert.equal(normCloudId("Name@uni-koeln.de@https://uni-koeln.sciebo.de/"), "name@uni-koeln.de@uni-koeln.sciebo.de");
});

test("Zweite Sciebo-ID für denselben Ordner: bestehende Freigabe an eine andere ID stört nicht, gespeichert mit https:// wird erkannt", async () => {
  let gets = 0, posts = 0;
  const f = async (url, opts) => {
    if (opts.method === "GET") { gets++; return { ok: true, status: 200, json: async () => ({ ocs: { meta: { status: "ok" }, data: [
      { id: 1, share_type: 6, share_with: "erste@uni-koeln.sciebo.de" },
      ...(gets > 1 ? [{ id: 2, share_type: 6, share_with: "zweite@uni-koeln.de@https://uni-koeln.sciebo.de" }] : []),
    ] } }) }; }
    posts++; throw new TypeError("Failed to fetch");
  };
  const r = await shareFolderToCloudId({ server: "https://nc.example.de", user: "me", appPassword: "pw", folder: "S", cloudId: "@zweite@uni-koeln.de@uni-koeln.sciebo.de", fetchImpl: f });
  assert.equal(posts, 1);
  assert.equal(r.id, 2);
});
