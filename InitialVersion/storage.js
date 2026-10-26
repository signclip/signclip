// =====================================================================
// SignClip · Speicherorte (aus index.html herausgelöst)
//
// Ein Speicherort ("Target") ist eins von:
//   dir   – Ordner auf dem Gerät (File System Access, Chrome/Android/Desktop)
//   dav   – WebDAV-Konto (Nextcloud, Sciebo): Adresse + Benutzer + App-Passwort
//   share – freigegebener Ordner per Link (…/s/CODE), optional mit Freigabe-Passwort
//
// Jeder Speicherort hat zwei Schalter:
//   auto – jede Aufnahme wird sofort dort gespeichert
//   lib  – Videos aus diesem Ort erscheinen in der Bibliothek (Suche)
//
// Ablage pro Video:  <name>.mp4  +  <name>.mp4.json  (Kontext, Marker, Schnitte)
// Die Begleitdatei pro Video ersetzt das Überschreiben einer gemeinsamen
// index.json: mehrere Personen können in denselben Ordner schreiben, ohne sich
// gegenseitig Einträge zu löschen. Eine vorhandene index.json wird weiter gelesen.
//
// Abhängigkeiten aus index.html (zur Laufzeit, nicht beim Laden):
//   clips, N, render, toast, esc, ic, fileName, encPw, decPw, db, genThumb
// =====================================================================
const Store = (() => {
  // Feste Worker-Adresse für alle (siehe docs/WORKER.md). Leer = kein Proxy.
  // Ein Proxy, der beim Speicherort eingetragen ist, hat Vorrang.
  const DEFAULT_PROXY = '';
  const LS = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} }
  };
  const VID = /\.(mp4|webm|mov|m4v)$/i;
  const KIND = { dir: 'Ordner auf dem Gerät', dav: 'Nextcloud / Sciebo', share: 'Freigegebener Ordner' };

  let T = null;            // Liste der Speicherorte (ohne Passwörter)
  const H = {};            // Ordner-Handles  id -> FileSystemDirectoryHandle
  const PW = {};           // Passwörter im Arbeitsspeicher  id -> Klartext
  const ST = {};           // Status-Text pro Speicherort
  let legacy = { dirH: null, dirs: [] };
  let booted = false;

  const list = () => (T ??= LS.get('targets', null) || []);
  const save = () => LS.set('targets', list());
  const get = id => list().find(t => t.id === id);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // ---------- Hochgeladen-Merker: up[targetId][datei] = Signatur der Begleitdatei ----------
  const UP = LS.get('up', {});
  const upSave = () => LS.set('up', UP);
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) >>> 0; return h.toString(36) };

  // ---------- Status ----------
  function status(t, s, quiet) {
    ST[t.id] = s; renderSettings();
    if (s && !quiet && !/^(Verbunden|Bereit)/.test(s)) toast(t.name + ': ' + s);
  }

  // ---------- Passwörter (AES-GCM über encPw/decPw aus index.html) ----------
  async function setPw(t, pw) {
    PW[t.id] = pw || '';
    const m = LS.get('tpw', {}); m[t.id] = pw ? await encPw(pw) : ''; LS.set('tpw', m);
  }
  async function loadPw() {
    const m = LS.get('tpw', {});
    for (const t of list()) if (PW[t.id] == null) {
      try { PW[t.id] = m[t.id] ? await decPw(m[t.id]) : '' } catch (e) { PW[t.id] = '' }
    }
  }

  // ---------- Ordner-Handles in IndexedDB ----------
  // Wird aus dem IndexedDB-Ladevorgang in index.html aufgerufen. true = Eintrag gehört hierher.
  function idb(r) {
    if (r.id === 'dirH') { legacy.dirH = r.h; return true }
    if (r.id === 'dirs') { legacy.dirs = r.h || []; return true }
    if (typeof r.id === 'string' && r.id.startsWith('t:')) { H[r.id.slice(2)] = r.h; return true }
    return false;
  }
  const idbPut = (id, h) => { try { db.transaction('c', 'readwrite').objectStore('c').put({ id: 't:' + id, h }) } catch (e) {} };
  const idbDel = id => { try { db.transaction('c', 'readwrite').objectStore('c').delete('t:' + id) } catch (e) {} };

  // ---------- WebDAV ----------
  function parseShare(link) {
    try {
      const u = new URL(String(link).trim()), m = u.pathname.match(/^(.*?)\/(?:index\.php\/)?s\/([A-Za-z0-9]+)/);
      return m ? { base: u.origin + m[1], token: m[2] } : null;
    } catch (e) { return null }
  }
  // Basis-Adresse des Ordners (immer mit / am Ende)
  function ep(t) {
    if (t.kind === 'share') { const s = parseShare(t.url); return s ? s.base + '/public.php/webdav/' : '' }
    const u = String(t.url || '').trim(); return u ? u.replace(/\/?$/, '/') : '';
  }
  const davUser = t => t.kind === 'share' ? ((parseShare(t.url) || {}).token || '') : (t.user || '');
  const b64u = s => btoa(unescape(encodeURIComponent(s)));
  const fileUrl = (t, name) => ep(t) + name.split('/').map(encodeURIComponent).join('/');

  function req(t, method, url, o = {}) {
    const headers = { Authorization: 'Basic ' + b64u(davUser(t) + ':' + (PW[t.id] || '')), ...(o.h || {}) };
    const px = (t.proxy || DEFAULT_PROXY).trim(), local = /^http:\/\/(localhost|127\.0\.0\.1)[:/]/.test(url);
    const target = px && !local ? px + (px.includes('?') ? '&' : '?') + 'url=' + encodeURIComponent(url) : url;
    return fetch(target, { method, headers, body: o.body, cache: 'no-store' });
  }
  const httpErr = s => s === 401 ? 'Anmeldung abgelehnt' : s === 403 ? 'Kein Schreibrecht' : s === 404 ? 'Ordner nicht gefunden'
    : s === 507 ? 'Speicher voll' : s === 413 ? 'Datei zu groß' : 'HTTP ' + s;

  // ---------- Prüfen ----------
  async function check(t, quiet) {
    if (t.kind === 'dir') {
      const h = H[t.id];
      if (!h) { status(t, 'Ordner fehlt: neu wählen', quiet); return false }
      try {
        const p = await h.queryPermission({ mode: 'readwrite' });
        status(t, p === 'granted' ? 'Bereit' : 'Zugriff bestätigen: einmal irgendwo antippen', quiet); return p === 'granted';
      } catch (e) { status(t, 'Bereit', quiet); return true }
    }
    if (!ep(t)) { status(t, t.kind === 'share' ? 'Link nicht erkannt (erwartet …/s/CODE)' : 'Adresse fehlt', quiet); return false }
    try {
      const r = await req(t, 'PROPFIND', ep(t), { h: { Depth: '0' } });
      if (r.status === 207 || r.ok) { status(t, 'Verbunden', quiet); return true }
      if (r.status === 401) { status(t, t.kind === 'share' ? 'Freigabe-Passwort fehlt oder falsch' : 'Anmeldung abgelehnt: Benutzer und App-Passwort prüfen', quiet); return false }
      if (r.status === 403 || r.status === 405) { status(t, 'Ordner nicht lesbar – evtl. nur Hochladen erlaubt (Dateiablage)', quiet); return t.kind === 'share' }
      if (r.status === 404) { status(t, 'Ordner nicht gefunden: Adresse prüfen', quiet); return false }
      status(t, 'Fehler ' + httpErr(r.status), quiet); return false;
    } catch (e) {
      status(t, 'Keine Verbindung: Netz oder CORS' + ((t.proxy || DEFAULT_PROXY) ? ' – Proxy prüfen' : ' – Server erlaubt diese App-Adresse nicht, Proxy eintragen'), quiet);
      return false;
    }
  }

  // ---------- Schreiben / Lesen ----------
  async function dirWritable(h) {
    if (await h.queryPermission({ mode: 'readwrite' }) === 'granted') return true;
    return await h.requestPermission({ mode: 'readwrite' }) === 'granted';
  }
  async function putBlob(t, name, blob) {
    if (t.kind === 'dir') {
      const h = H[t.id]; if (!h) throw new Error('Ordner fehlt');
      if (!await dirWritable(h)) throw new Error('Kein Schreibzugriff');
      const f = await h.getFileHandle(name, { create: true }), w = await f.createWritable(); await w.write(blob); await w.close(); return;
    }
    const put = () => req(t, 'PUT', fileUrl(t, name), { body: blob, h: { 'Content-Type': blob.type || 'application/octet-stream' } });
    let r = await put();
    if ((r.status === 404 || r.status === 409) && t.kind === 'dav') { await req(t, 'MKCOL', ep(t)); r = await put() }
    if (!r.ok) throw new Error(httpErr(r.status));
  }
  async function getText(t, name) {
    try {
      if (t.kind === 'dir') return await (await (await H[t.id].getFileHandle(name)).getFile()).text();
      const r = await req(t, 'GET', fileUrl(t, name)); return r.ok ? await r.text() : null;
    } catch (e) { return null }
  }

  // ---------- Clips -> Dateien ----------
  const entry = c => ({ id: c.id, title: c.title, date: c.date, file: c.file, s: c.s || 0, dur: c.dur, ctx: c.ctx, mk: c.mk, w: c.w, h: c.h });
  // Clips aus derselben Aufnahme teilen sich eine Videodatei (Schnitte = Einträge mit Startzeit s)
  function assignFile(c) {
    if (c.file) return c.file;
    const sib = clips.find(o => o !== c && o.blob && o.blob === c.blob && o.file);
    return c.file = sib ? sib.file : fileName(c);
  }
  // Datei -> alle eigenen Clips dieser Datei
  function groups(only) {
    const m = new Map();
    clips.filter(c => c.blob && !c.lib && !c.draft).forEach(c => { assignFile(c) });
    const files = only ? new Set(only.map(assignFile)) : null;
    clips.filter(c => c.file && c.blob && !c.lib && !c.draft && (!files || files.has(c.file)))
      .forEach(c => { if (!m.has(c.file)) m.set(c.file, []); m.get(c.file).push(c) });
    return m;
  }
  // Schreibt Video (einmal) und Begleitdatei (wenn sich der Kontext geändert hat)
  async function saveGroups(t, g) {
    const up = UP[t.id] ||= {}; let v = 0, s = 0;
    for (const [f, cs] of g) {
      const json = JSON.stringify(cs.map(entry), null, 1), sig = hash(json);
      if (up[f] === sig) continue;
      if (up[f] == null) { await putBlob(t, f, cs[0].blob); v++ }
      await putBlob(t, f + '.json', new Blob([json], { type: 'application/json' })); s++;
      up[f] = sig; upSave();
    }
    return { v, s };
  }
  const isSaved = (t, c) => !!(c.file && UP[t.id] && UP[t.id][c.file] != null);

  // Alle Speicherorte mit "auto": neue Videos und geänderten Kontext schreiben.
  // quiet: 0 = immer melden, 1 = nur bei neuen Videos/Fehlern, 2 = nur bei neuen Videos
  let busy = false, again = false;
  async function flush(quiet = 1) {
    if (busy) { again = true; return }
    busy = true;
    try {
      const auto = list().filter(t => t.auto); if (!auto.length) return;
      const g = groups(); const ok = [], bad = [];
      for (const t of auto) {
        try { const r = await saveGroups(t, g); if (r.v) ok.push(t.name); if (r.v || r.s) status(t, 'Verbunden', 1) }
        catch (e) { bad.push(t.name + ': ' + e.message); status(t, 'Speichern ausstehend: ' + e.message, 1) }
      }
      if (ok.length) toast('Gespeichert: ' + ok.join(', '));
      else if (bad.length && quiet < 2) toast('Nicht gespeichert · ' + bad.join(' · ') + ' · wird wiederholt');
      else if (!quiet) toast('Alles gespeichert');
    } finally { busy = false; if (again) { again = false; flush(2) } }
  }
  // Einzelnen Clip gezielt in einen Speicherort (Teilen-Menü)
  async function saveClip(t, c) {
    if (!c.blob && c.remote) await fetchClip(c);
    if (!c.blob) throw new Error('Keine Videodatei');
    if (c.lib) { // Clip aus einer Bibliothek: unverändert kopieren
      const name = c.file || (c.src || '').split('/').pop().split('#')[0] || fileName(c);
      await putBlob(t, name, c.blob);
      await putBlob(t, name + '.json', new Blob([JSON.stringify([{ ...entry(c), file: name }], null, 1)], { type: 'application/json' }));
      return;
    }
    await saveGroups(t, groups([c]));
  }
  // Zusatzdatei (z. B. geteilter Kontext als .txt) in alle automatischen Speicherorte
  async function putExtra(name, blob) {
    for (const t of list().filter(t => t.auto)) { try { await putBlob(t, name, blob) } catch (e) {} }
  }

  // ---------- Bibliothek: Videos aus Speicherorten einlesen ----------
  const baseTitle = n => n.replace(/\.[^.]+$/, '').replace(/_\d{8}-\d{4}.*$/, '').replace(/[_-]+/g, ' ');
  const own = n => clips.some(c => !c.lib && c.file === n);
  function addLibClip(t, key, name, meta, extra) {
    const c = {
      id: N++, lib: 1, tid: t.id, src: key, file: name, title: meta ? meta.title : baseTitle(name),
      date: meta ? meta.date : extra.date, dur: meta ? meta.dur : 5, s: meta ? meta.s || 0 : 0, w: meta && meta.w, h: meta && meta.h,
      hue: Math.random() * 360 | 0, ctx: meta ? meta.ctx : [{ t: 0, m: 1, x: baseTitle(name) }], mk: meta ? meta.mk || [] : [], ...extra
    };
    clips.push(c); return c;
  }
  const parseMeta = txt => { try { const j = JSON.parse(txt); return Array.isArray(j) ? j : [j] } catch (e) { return null } };
  const indexMap = txt => { const ix = {}; (parseMeta(txt) || []).forEach(r => { if (r && r.file) (ix[r.file] ||= []).push(r) }); return ix };

  async function scanDir(t, h = H[t.id], depth = 0, pre = '') {
    if (!h) return;
    let ix = {}; try { ix = indexMap(await (await (await h.getFileHandle('index.json')).getFile()).text()) } catch (e) {}
    for await (const [n, e] of h.entries()) {
      if (e.kind === 'directory') { if (depth < 2) await scanDir(t, e, depth + 1, pre + n + '/'); continue }
      if (!VID.test(n) || own(n)) continue;
      const base = 'dir:' + t.id + ':' + pre + n;
      if (clips.some(c => c.src && c.src.startsWith(base + '#'))) continue;
      let meta = null; try { meta = parseMeta(await (await (await h.getFileHandle(n + '.json')).getFile()).text()) } catch (x) {}
      const f = await e.getFile(), rows = meta || ix[n] || [null];
      rows.forEach((r, k) => {
        const c = addLibClip(t, base + '#' + k, n, r, { date: f.lastModified, url: URL.createObjectURL(f), blob: f });
        if (!r) { const v = document.createElement('video'); v.preload = 'metadata'; v.src = c.url; v.onloadedmetadata = () => { c.dur = v.duration || c.dur; genThumb(c); v.remove(); render() } }
        else genThumb(c);
      });
    }
  }

  const PF = '<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:getlastmodified/><d:getcontentlength/><d:getetag/><d:resourcetype/></d:prop></d:propfind>';
  async function davList(t) {
    const r = await req(t, 'PROPFIND', ep(t), { h: { Depth: '1', 'Content-Type': 'application/xml' }, body: PF });
    if (r.status !== 207 && !r.ok) throw new Error(httpErr(r.status));
    const doc = new DOMParser().parseFromString(await r.text(), 'application/xml'), base = new URL(ep(t));
    return [...doc.getElementsByTagNameNS('DAV:', 'response')].map(x => {
      const g = n => { const e = x.getElementsByTagNameNS('DAV:', n)[0]; return e ? e.textContent : '' };
      const href = g('href'), name = decodeURIComponent(href.split('/').filter(Boolean).pop() || '');
      return { name, href: new URL(href, base).href, etag: g('getetag'), mod: g('getlastmodified'), dir: !!x.getElementsByTagNameNS('DAV:', 'collection').length };
    }).filter(f => !f.dir);
  }
  async function scanDav(t) {
    const files = await davList(t), byName = Object.fromEntries(files.map(f => [f.name, f]));
    const ixf = byName['index.json'], ix = ixf ? indexMap(await getText(t, 'index.json')) : {};
    const vids = files.filter(f => VID.test(f.name)), pre = 'dav:' + t.id + ':';
    let add = 0, chg = 0;
    for (const f of vids) {
      if (own(f.name)) continue;
      const side = byName[f.name + '.json'], tag = f.etag + '|' + (side ? side.etag : ''), base = pre + f.name;
      const ex = clips.filter(c => c.src && c.src.startsWith(base + '#'));
      if (ex.length && ex[0].tag === tag) continue;
      if (ex.length) { const drop = new Set(ex); clips = clips.filter(c => !drop.has(c)); chg++ } else add++;
      const meta = side ? parseMeta(await getText(t, f.name + '.json')) : null, rows = meta || ix[f.name] || [null];
      rows.forEach((r, k) => addLibClip(t, base + '#' + k, f.name, r, { remote: 1, href: f.href, tag, date: Date.parse(f.mod) || Date.now() }));
    }
    const keep = new Set(vids.map(f => pre + f.name)), before = clips.length;
    clips = clips.filter(c => !(c.remote && c.tid === t.id) || keep.has(c.src.split('#')[0]));
    const del = before - clips.length;
    if (add || chg || del) toast(t.name + ': ' + add + ' neu, ' + chg + ' geändert, ' + del + ' entfernt');
  }
  async function scan(t) {
    if (!t.lib) return;
    try { if (t.kind === 'dir') await scanDir(t); else await scanDav(t) } catch (e) { status(t, 'Bibliothek: ' + e.message, 1) }
    render();
  }
  // Lokale Bibliothek eines entfernten oder ausgeschalteten Ortes ausblenden
  function unscan(t) { clips = clips.filter(c => !(c.lib && c.tid === t.id)); render() }

  async function fetchClip(c) {
    const t = get(c.tid); if (!t) throw new Error('Speicherort entfernt');
    const r = await req(t, 'GET', c.href); if (!r.ok) throw new Error(httpErr(r.status));
    c.blob = await r.blob(); c.url = URL.createObjectURL(c.blob); genThumb(c);
  }

  // ---------- Hinzufügen / Ändern / Entfernen ----------
  async function addDir(o = {}) {
    if (!window.showDirectoryPicker) { toast('Ordnerwahl hier nicht verfügbar (z. B. iOS): Cloud oder Freigabe-Link nutzen'); return null }
    let h; try { h = await showDirectoryPicker({ mode: 'readwrite' }) } catch (e) { return null }
    // Derselbe Ordner schon eingetragen? Dann diesen verwenden.
    for (const t of list()) if (t.kind === 'dir' && H[t.id]) { try { if (await H[t.id].isSameEntry(h)) return t } catch (e) {} }
    const t = { id: uid(), kind: 'dir', name: h.name, auto: o.auto ?? true, lib: o.lib ?? true };
    H[t.id] = h; idbPut(t.id, h); list().push(t); save();
    status(t, 'Bereit', 1); scan(t); return t;
  }
  async function upsert(d, pw) {
    let t = d.id && get(d.id);
    if (!t) { t = { id: uid(), auto: d.kind !== 'share', lib: true }; list().push(t) }
    Object.assign(t, { kind: d.kind, name: d.name || (d.kind === 'share' ? 'Freigabe' : 'Cloud'), url: d.url, user: d.user || '', proxy: d.proxy || '' });
    save(); if (pw != null) await setPw(t, pw);
    if (await check(t)) { scan(t); if (t.auto) flush(1) }
    return t;
  }
  function remove(id) {
    const t = get(id); if (!t) return;
    T = list().filter(x => x.id !== id); save(); delete UP[id]; upSave(); idbDel(id);
    const m = LS.get('tpw', {}); delete m[id]; LS.set('tpw', m); unscan(t); renderSettings();
  }
  // Modus wechseln: auto = immer speichern (umrandet), sonst im Teilen-Menü
  async function setAuto(t, on) {
    t.auto = on; save(); renderSettings();
    if (on) { status(t, 'Prüfe …', 1); if (await check(t)) { scan(t); flush(0) } }
    else toast(t.name + ': im Teilen-Menü');
  }
  async function repick(t) {
    if (!window.showDirectoryPicker) return;
    let h; try { h = await showDirectoryPicker({ mode: 'readwrite' }) } catch (e) { return }
    unscan(t); H[t.id] = h; idbPut(t.id, h); t.name = h.name; save(); status(t, 'Bereit', 1); scan(t);
  }

  // ---------- Start ----------
  async function migrate() {
    if (LS.get('targets', null)) return;
    T = [];
    const cfg = LS.get('cfg', {}), dpw = LS.get('dpw', '');
    if (cfg.u) {
      const t = { id: uid(), kind: parseShare(cfg.u) ? 'share' : 'dav', name: 'Cloud', url: cfg.u, user: cfg.n || '', proxy: '', auto: true, lib: true };
      T.push(t); if (dpw) { const m = LS.get('tpw', {}); m[t.id] = dpw; LS.set('tpw', m) }
    }
    if (legacy.dirH) { const t = { id: uid(), kind: 'dir', name: legacy.dirH.name, auto: true, lib: true }; H[t.id] = legacy.dirH; idbPut(t.id, legacy.dirH); T.push(t) }
    legacy.dirs.forEach(h => { if (legacy.dirH && h.name === legacy.dirH.name) return; const t = { id: uid(), kind: 'dir', name: h.name, auto: false, lib: true }; H[t.id] = h; idbPut(t.id, h); T.push(t) });
    save();
  }
  async function boot() {
    for (let i = 0; i < 40 && !db; i++) await new Promise(r => setTimeout(r, 200));
    await migrate(); await loadPw(); booted = true; renderSettings();
    for (const t of list()) { if (await check(t, true)) scan(t) }
    flush(2);
  }
  // Ordnerrechte brauchen eine Berührung: beim ersten Antippen anfragen
  async function perm() {
    for (const t of list().filter(t => t.kind === 'dir' && H[t.id])) {
      try {
        const m = t.auto ? 'readwrite' : 'read';
        if (await H[t.id].queryPermission({ mode: m }) !== 'granted') await H[t.id].requestPermission({ mode: m });
        if (await check(t, true)) scan(t);
      } catch (e) {}
    }
  }
  async function refresh() { for (const t of list()) if (t.kind !== 'dir' && await check(t, true)) scan(t); flush(2) }

  // ---------- Einstellungen (Abschnitt SPEICHERORTE), nur Gesten ----------
  // Karte:  ↓ entfernen · ↑ ins Teilen-Menü · ← prüfen + immer speichern · 2× tippen ändern
  // Umrandet = jede Aufnahme wird hier gespeichert. Ohne Rand = erscheint im Teilen-Menü.
  // Einziger Knopf "Neuer Speicherort": → Cloud oder Freigabe-Link, weit → Ordner auf dem Gerät
  // Formular:  ← speichern und prüfen (oder Enter) · ↓ abbrechen
  let form = null; // {id?}
  const icon = t => t.kind === 'dir' ? 'folder' : t.kind === 'share' ? 'folder_shared' : 'cloud';
  const short = t => t.kind === 'dir' ? 'Gerät' : t.kind === 'share' ? (parseShare(t.url) || { base: t.url }).base.replace(/^https?:\/\//, '') : String(t.url || '').replace(/^https?:\/\//, '').replace(/\/remote\.php\/(dav\/files|webdav)\//, ' › ');
  const arr = h => typeof ar === 'function' ? ar(h) : h;
  function renderSettings() {
    const el = document.getElementById('stor'); if (!el) return;
    const rows = list().map(t => `<div class="tg-row${t.auto ? ' auto' : ''}" data-t="${t.id}">
      <div class="tg-h"><span>${ic(icon(t), 20)}</span><b>${esc(t.name)}</b><em>${t.auto ? 'Immer speichern' : 'Im Teilen-Menü'}</em><small>${esc(KIND[t.kind])} · ${esc(short(t))}</small></div>
      <div class="tg-s ${/^(Verbunden|Bereit)/.test(ST[t.id] || '') ? 'ok' : ''}">${esc(ST[t.id] || (booted ? 'Nicht geprüft' : 'Lädt …'))}</div></div>`).join('');
    const v = form && form.id ? get(form.id) || {} : {};
    const fm = !form ? '' : `<div class="tg-row tg-f" data-f="1">
      <b>${form.id ? 'Speicherort ändern' : 'Neuer Speicherort'}</b>
      <input type="text" id="tUrl" inputmode="url" placeholder="Freigabe-Link …/s/CODE oder WebDAV-Adresse" value="${esc(v.url || '')}">
      <input type="text" id="tUser" autocomplete="username" placeholder="Benutzer (nicht bei Freigabe-Link)" value="${esc(v.user || '')}">
      <input type="password" id="tPw" autocomplete="new-password" placeholder="${form.id ? 'Passwort – leer = unverändert' : 'App-Passwort oder Freigabe-Passwort'}">
      <input type="text" id="tName" placeholder="Name, z. B. DGS-Gruppe" value="${esc(v.name || '')}">
      <details><summary>Proxy bei CORS-Fehler</summary><input type="text" id="tProxy" placeholder="https://dein-proxy.workers.dev/" value="${esc(v.proxy || '')}"><small class="mut">Vorlage: tools/webdav-proxy.js</small></details>
      <small class="mut">Sciebo-Link: Ordner › Teilen › Link kopieren · Konto: https://HOCHSCHULE.sciebo.de/remote.php/webdav/ORDNER/</small>
      <small class="tg-g">${arr('← Speichern und prüfen · ↓ Abbrechen')}</small></div>`;
    el.innerHTML = rows + fm
      + (form ? '' : `<div class="tg-new" data-n="1">${ic('add', 18)}<b>Neuer Speicherort</b><small>${arr('→ Cloud / Link' + (window.showDirectoryPicker ? ' · weit → Ordner' : ''))}</small></div>`)
      + `<p class="tg-g">${list().length ? arr('↓ Entfernen · ↑ Teilen-Menü · ← Prüfen + immer speichern · 2× Ändern') : 'Noch kein Speicherort: Aufnahmen bleiben nur in der App.'}</p>`;
  }
  async function saveForm() {
    const val = i => ((document.getElementById(i) || {}).value || '').trim();
    const url = val('tUrl'), kind = parseShare(url) ? 'share' : 'dav';
    if (kind === 'dav' && !/^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)[:/])/.test(url)) { toast('Adresse: Freigabe-Link …/s/CODE oder https://…'); return }
    const d = { id: form.id, kind, url, name: val('tName'), user: kind === 'dav' ? val('tUser') : '', proxy: val('tProxy') };
    const pw = (document.getElementById('tPw') || {}).value || ''; form = null; renderSettings();
    await upsert(d, pw || (d.id ? null : ''));
  }
  function label(r, dx, dy, W) {
    const ax = Math.abs(dx), ay = Math.abs(dy); if (Math.max(ax, ay) < 40) return '';
    if (r.dataset.n) return dx > 40 && ax > ay ? (dx > W * .45 && window.showDirectoryPicker ? 'Ordner auf dem Gerät' : 'Cloud / Freigabe-Link') : '';
    if (r.dataset.f) return ay > ax ? (dy > 0 ? 'Abbrechen' : '') : dx < 0 ? 'Speichern und prüfen' : '';
    return ay > ax ? (dy > 0 ? 'Entfernen' : 'Ins Teilen-Menü') : dx < 0 ? 'Prüfen + immer speichern' : '';
  }
  let lastTap = { id: '', t: 0 };
  async function act(r, dx, dy, W) {
    const ax = Math.abs(dx), ay = Math.abs(dy), tap = ax < 10 && ay < 10, what = label(r, dx, dy, W);
    if (r.dataset.n) {
      if (what === 'Ordner auf dem Gerät') { await addDir({ auto: true }); renderSettings() }
      else if (what) { form = {}; renderSettings(); document.getElementById('tUrl')?.focus() }
      else if (tap) toast('Nach rechts ziehen: Cloud oder Link' + (window.showDirectoryPicker ? ' · weit: Ordner' : ''));
      return;
    }
    if (r.dataset.f) { if (what === 'Abbrechen') { form = null; renderSettings() } else if (what) saveForm(); return }
    const t = get(r.dataset.t); if (!t) return;
    if (tap) {
      if (lastTap.id === t.id && Date.now() - lastTap.t < 350) { lastTap = { id: '', t: 0 }; if (t.kind === 'dir') repick(t); else { form = { id: t.id }; renderSettings() } }
      else lastTap = { id: t.id, t: Date.now() };
      return;
    }
    if (what === 'Entfernen') { remove(t.id); toast(t.name + ' entfernt · Dateien dort bleiben') }
    else if (what === 'Ins Teilen-Menü') setAuto(t, false);
    else if (what) setAuto(t, true);
  }
  function bind(el) {
    let s = null;
    const end = e => {
      if (!s) return; const { r, dx, dy } = s; s = null;
      r.classList.remove('drag'); r.style.transform = ''; delete r.dataset.g;
      if (e.type === 'pointerup') act(r, dx, dy, el.clientWidth);
    };
    el.addEventListener('pointerdown', e => {
      if (e.target.closest('input,select,details')) return;
      const r = e.target.closest('.tg-row,.tg-new'); if (!r) return;
      s = { r, x: e.clientX, y: e.clientY, dx: 0, dy: 0 }; try { r.setPointerCapture(e.pointerId) } catch (x) {}
    });
    el.addEventListener('pointermove', e => {
      if (!s) return; s.dx = e.clientX - s.x; s.dy = e.clientY - s.y;
      if (Math.hypot(s.dx, s.dy) > 8) { s.r.classList.add('drag'); s.r.style.transform = `translate(${s.dx}px,${s.dy}px)`; const g = label(s.r, s.dx, s.dy, el.clientWidth); g ? s.r.dataset.g = g : delete s.r.dataset.g }
    });
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' && form && e.target.closest('.tg-f')) { e.preventDefault(); saveForm() } });
  }
  function openForm(kind) { if (kind === 'dir') { addDir({ auto: true }); return } form = {}; renderSettings() }

  return {
    all: list, get, idb, boot, perm, refresh, flush, saveClip, putExtra, addDir, fetchClip, isSaved,
    renderSettings, bind, openForm, kindLabel: t => KIND[t.kind], icon, parseShare, check, scan,
    hasAuto: () => list().some(t => t.auto)
  };
})();
