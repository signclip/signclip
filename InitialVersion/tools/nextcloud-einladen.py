#!/usr/bin/env python3
"""
SignClip · Personen in der eigenen Nextcloud anlegen und einladen.

Pro Person entsteht:
  * ein Schreib-Konto  <kurzname>-app   – nur für die App, Passwort wird nie angezeigt
  * optional ein Lese-Konto <kurzname> – für Web, Desktop-Client, Nextcloud-App (nur lesen)
  * der Ordner SignClip/ im Schreib-Konto, nur lesend an das Lese-Konto geteilt
  * optional eine Nur-Lese-Freigabe an eine Sciebo-ID (erscheint in Sciebo nach „Annehmen“)
  * ein Einladungslink: in der App einmal öffnen → Speicherort fertig (jede Aufnahme wird dort gespeichert)
  * eine Einladungsseite mit QR-Code zum Ausdrucken oder Weiterleiten

Gruppen: Schreib-Konten kommen in <gruppe>-app, Lese-Konten in <gruppe>.
Für einen gemeinsamen Gruppenordner in Nextcloud (App „Team folders“/„Group folders“):
<gruppe>-app = alle Rechte, <gruppe> = nur lesen. So kommt Inhalt nur über die App hinein.

Nur Python-Standardbibliothek. Beispiele:

  export NC_ADMIN_PASS='…'
  python3 nextcloud-einladen.py --server https://xyz.your-storageshare.de --admin admin \\
      --user anna --name "Anna B." --email anna@example.org --group lernende --reader \\
      --sciebo-id anna@uni-xy.sciebo.de

  python3 nextcloud-einladen.py --server … --admin admin --csv personen.csv
      (Spalten: user,name,email,groups,quota,sciebo_id,reader   – groups mit ; trennen, reader = ja/nein)

ACHTUNG: Einladungslink und -seite enthalten den Zugang zum Schreib-Konto.
Nur persönlich an die Person geben. Sperren: in Nextcloud beim Konto <kurzname>-app
unter „Geräte & Sitzungen“ das App-Passwort löschen oder das Konto deaktivieren.
"""
import argparse, base64, csv, getpass, html, json, os, secrets, string, sys, urllib.error, urllib.parse, urllib.request

APP_URL = os.environ.get('SIGNCLIP_APP_URL', 'https://signclip.github.io/signclip/InitialVersion/index.html')


class NC:
    def __init__(self, server, admin, password, verbose=False):
        self.s = server.rstrip('/')
        self.admin = (admin, password)
        self.v = verbose

    def call(self, method, path, auth=None, data=None, headers=None, ok=(200, 201, 204, 207)):
        url = path if path.startswith('http') else self.s + path
        body = urllib.parse.urlencode(data, doseq=True).encode() if isinstance(data, dict) else data
        h = {'OCS-APIRequest': 'true', 'Accept': 'application/json'}
        if isinstance(data, dict):
            h['Content-Type'] = 'application/x-www-form-urlencoded'
        h.update(headers or {})
        user, pw = auth or self.admin
        h['Authorization'] = 'Basic ' + base64.b64encode(f'{user}:{pw}'.encode()).decode()
        req = urllib.request.Request(url, data=body, headers=h, method=method)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                status, text = r.status, r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            status, text = e.code, e.read().decode('utf-8', 'replace')
        if self.v:
            print(f'  {method} {url} -> {status}', file=sys.stderr)
        try:
            j = json.loads(text) if text.strip().startswith('{') else None
        except ValueError:
            j = None
        return status, j, text

    @staticmethod
    def ocs(j):
        m = (j or {}).get('ocs', {}).get('meta', {})
        return m.get('statuscode'), m.get('message', ''), (j or {}).get('ocs', {}).get('data')

    # --- Gruppen ---
    def ensure_group(self, g):
        st, j, _ = self.call('GET', '/ocs/v1.php/cloud/groups?' + urllib.parse.urlencode({'search': g, 'format': 'json'}))
        code, msg, data = self.ocs(j)
        groups = (data or {}).get('groups', []) if isinstance(data, dict) else []
        if g in groups:
            return
        st, j, _ = self.call('POST', '/ocs/v1.php/cloud/groups?format=json', data={'groupid': g})
        code, msg, _ = self.ocs(j)
        if code not in (100, 200, 102):
            raise RuntimeError(f'Gruppe {g}: {msg or st}')

    # --- Konten ---
    def ensure_user(self, uid, display, groups, quota=None, email=None, password=None):
        """Legt an oder setzt (bei bestehendem Konto) Passwort und Gruppen neu. Gibt das Passwort zurück (oder None bei Begrüßungs-Mail)."""
        pw = password
        data = {'userid': uid, 'displayName': display, 'groups[]': groups}
        if pw is not None:
            data['password'] = pw
        if email:
            data['email'] = email
        if quota:
            data['quota'] = quota
        st, j, _ = self.call('POST', '/ocs/v1.php/cloud/users?format=json', data=data)
        code, msg, _ = self.ocs(j)
        if code in (100, 200):
            return pw
        if code != 102:
            raise RuntimeError(f'Konto {uid}: {msg or st}')
        # existiert schon: Passwort, Kontingent, Gruppen nachziehen
        if pw is not None:
            self._edit(uid, 'password', pw)
        if quota:
            self._edit(uid, 'quota', quota)
        for g in groups:
            self.call('POST', f'/ocs/v1.php/cloud/users/{urllib.parse.quote(uid)}/groups?format=json', data={'groupid': g})
        return pw

    def _edit(self, uid, key, value):
        st, j, _ = self.call('PUT', f'/ocs/v1.php/cloud/users/{urllib.parse.quote(uid)}?format=json', data={'key': key, 'value': value})
        code, msg, _ = self.ocs(j)
        if code not in (100, 200):
            raise RuntimeError(f'Konto {uid}, {key}: {msg or st}')

    # --- Dateien und Freigaben ---
    def dav(self, uid, folder=''):
        return f'{self.s}/remote.php/dav/files/{urllib.parse.quote(uid)}/' + (urllib.parse.quote(folder.strip('/')) + '/' if folder.strip('/') else '')

    def mkdir(self, uid, pw, folder):
        st, _, _ = self.call('MKCOL', self.dav(uid, folder), auth=(uid, pw), headers={'Accept': '*/*'})
        if st not in (201, 405):
            raise RuntimeError(f'Ordner {folder} für {uid}: HTTP {st}')

    def app_password(self, uid, pw):
        st, j, _ = self.call('GET', '/ocs/v2.php/core/getapppassword?format=json', auth=(uid, pw))
        code, msg, data = self.ocs(j)
        ap = (data or {}).get('apppassword') if isinstance(data, dict) else None
        if not ap:
            raise RuntimeError(f'App-Passwort für {uid}: {msg or st}')
        return ap

    def share(self, uid, pw, path, share_type, share_with=None, perm=1):
        data = {'path': '/' + path.strip('/'), 'shareType': share_type, 'permissions': perm}
        if share_with:
            data['shareWith'] = share_with
        st, j, _ = self.call('POST', '/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json', auth=(uid, pw), data=data)
        code, msg, d = self.ocs(j)
        if code not in (100, 200):
            if 'already' in (msg or '').lower() or 'bereits' in (msg or '').lower():
                return {}  # besteht schon – wiederholter Lauf
            raise RuntimeError(f'Freigabe {path} → {share_with or share_type}: {msg or st}')
        return d or {}


def rand_pw(n=28):
    a = string.ascii_letters + string.digits
    return ''.join(secrets.choice(a) for _ in range(n))


def join_link(app_url, dav_url, user, apppw, name):
    payload = json.dumps({'u': dav_url, 'n': user, 'p': apppw, 'name': name}, ensure_ascii=False, separators=(',', ':'))
    code = base64.urlsafe_b64encode(payload.encode()).decode().rstrip('=')
    return f'{app_url}#join={code}'


def invite_html(person, link, reader_info):
    n = html.escape(person['name'] or person['user'])
    extra = ''
    if reader_info:
        extra = f"<p>Zum Ansehen im Browser oder mit der Nextcloud-App: Konto <b>{html.escape(reader_info['user'])}</b>" + \
                (" – das Passwort legst du über die Begrüßungs-Mail fest." if reader_info.get('mail') else
                 f", Start-Passwort <code>{html.escape(reader_info['pw'])}</code> (bitte nach dem ersten Anmelden ändern).") + "</p>"
    return f"""<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Einladung SignClip</title>
<style>body{{font:16px/1.5 system-ui,sans-serif;max-width:560px;margin:40px auto;padding:0 16px;color:#222}}h1{{font-weight:500}}
#qr{{margin:24px 0}}a{{word-break:break-all}}.w{{color:#8a5a00;font-size:13px}}@media print{{.w{{display:none}}}}</style></head><body>
<h1>Willkommen, {n}</h1>
<p>Öffne diesen Link auf deinem Handy oder Tablet – oder scanne den Code. SignClip richtet deinen Speicherort dann selbst ein.</p>
<div id="qr"></div>
<p><a href="{html.escape(link)}">SignClip öffnen und verbinden</a></p>
{extra}
<p class="w">Dieser Link ist dein persönlicher Zugang. Bitte nicht weitergeben.</p>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script>try{{new QRCode(document.getElementById('qr'),{{text:{json.dumps(link)},width:240,height:240,correctLevel:QRCode.CorrectLevel.L}})}}catch(e){{}}</script>
</body></html>"""


def invite(nc, p, a):
    user = p['user'].strip().lower()
    if not user or not all(c.isalnum() or c in '-_.' for c in user):
        raise RuntimeError(f'Ungültiger Kurzname: {user!r}')
    groups = [g.strip() for g in p.get('groups', []) if g.strip()]
    writer = f'{user}-app' if p.get('reader') else user
    for g in groups:
        nc.ensure_group(f'{g}-app')
        if p.get('reader'):
            nc.ensure_group(g)
    wpw = rand_pw()
    nc.ensure_user(writer, (p['name'] or user) + (' (App)' if p.get('reader') else ''), [f'{g}-app' for g in groups], p.get('quota') or a.quota, None, wpw)
    nc.mkdir(writer, wpw, a.folder)
    apppw = nc.app_password(writer, wpw)
    reader_info = None
    if p.get('reader'):
        mail = bool(p.get('email'))
        rpw = None if mail else rand_pw(14)
        nc.ensure_user(user, p['name'] or user, groups, None, p.get('email'), rpw)
        nc.share(writer, wpw, a.folder, 0, user, 1)
        reader_info = {'user': user, 'mail': mail, 'pw': rpw}
    if p.get('sciebo_id'):
        nc.share(writer, wpw, a.folder, 6, p['sciebo_id'], 1)
    dav_url = nc.dav(writer, a.folder)
    link = join_link(a.app_url, dav_url, writer, apppw, f"Sign · {p['name'] or user}")
    os.makedirs(a.out, exist_ok=True)
    fn = os.path.join(a.out, f'einladung-{user}.html')
    with open(fn, 'w', encoding='utf-8') as f:
        f.write(invite_html(p, link, reader_info))
    return {'user': user, 'writer': writer, 'reader': reader_info and reader_info['user'], 'sciebo': p.get('sciebo_id') or '',
            'link': link, 'seite': fn, 'webdav': dav_url}


def main():
    ap = argparse.ArgumentParser(description='Personen für SignClip in der eigenen Nextcloud anlegen und einladen.')
    ap.add_argument('--server', required=True, help='https://… Adresse der Nextcloud')
    ap.add_argument('--admin', required=True, help='Admin-Benutzer (Passwort aus NC_ADMIN_PASS oder Abfrage)')
    ap.add_argument('--user', help='Kurzname, z. B. anna')
    ap.add_argument('--name', default='', help='Anzeigename')
    ap.add_argument('--email', default='', help='E-Mail (nur für das Lese-Konto: Begrüßungs-Mail)')
    ap.add_argument('--group', action='append', default=[], help='Gruppe (mehrfach möglich)')
    ap.add_argument('--quota', default='', help='Kontingent, z. B. 20GB')
    ap.add_argument('--reader', action='store_true', help='zusätzlich Lese-Konto für Web/Desktop anlegen')
    ap.add_argument('--sciebo-id', default='', help='nur lesend an diese Sciebo-ID teilen, z. B. anna@uni-xy.sciebo.de')
    ap.add_argument('--csv', help='mehrere Personen aus CSV')
    ap.add_argument('--folder', default='SignClip', help='Ordnername im Konto (Standard SignClip)')
    ap.add_argument('--app-url', default=APP_URL, help='Adresse der App (Standard: %(default)s)')
    ap.add_argument('--out', default='einladungen', help='Ordner für Einladungsseiten')
    ap.add_argument('-v', '--verbose', action='store_true')
    a = ap.parse_args()
    pw = os.environ.get('NC_ADMIN_PASS') or getpass.getpass(f'Passwort für {a.admin}: ')
    nc = NC(a.server, a.admin, pw, a.verbose)

    people = []
    if a.csv:
        with open(a.csv, newline='', encoding='utf-8') as f:
            for r in csv.DictReader(f):
                people.append({'user': r.get('user', ''), 'name': r.get('name', ''), 'email': r.get('email', ''),
                               'groups': (r.get('groups') or '').split(';'), 'quota': r.get('quota', ''),
                               'sciebo_id': r.get('sciebo_id', ''), 'reader': (r.get('reader') or '').strip().lower() in ('ja', 'yes', '1', 'x', 'true')})
    elif a.user:
        people.append({'user': a.user, 'name': a.name, 'email': a.email, 'groups': a.group, 'quota': a.quota, 'sciebo_id': a.sciebo_id, 'reader': a.reader})
    else:
        ap.error('--user oder --csv angeben')

    fails = 0
    for p in people:
        try:
            r = invite(nc, p, a)
            print(f"✓ {r['user']}: Schreib-Konto {r['writer']}" + (f", Lese-Konto {r['reader']}" if r['reader'] else '') +
                  (f", in Sciebo geteilt mit {r['sciebo']}" if r['sciebo'] else ''))
            print(f"  Einladungsseite: {r['seite']}")
            print(f"  Link: {r['link']}")
        except Exception as e:  # noqa: BLE001
            fails += 1
            print(f"✗ {p.get('user')}: {e}", file=sys.stderr)
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
