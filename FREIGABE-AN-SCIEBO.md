# Baustein: Nextcloud-Ordner in Sciebo sichtbar machen

**Status:** im Nextcloud-Test am 27.10.2026 erfolgreich (Weg C der Test-App). Für die endgültige Version übernommen.

## Was er tut

Ein Ordner der eigenen Nextcloud wird an eine **Cloud-ID** freigegeben, z. B. an `name@uni-koeln.de@uni-koeln.sciebo.de`. In Sciebo erscheint die Freigabe unter der Glocke; nach **einmal Annehmen** ist der Ordner dort dauerhaft sichtbar und aktualisiert sich mit. Standard: **nur lesen**.

Tipp: einen **übergeordneten** Ordner teilen (z. B. „Sign“) – alles, was später darin landet, erscheint ohne weiteres Annehmen.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `freigabe.js` | Modul ohne Abhängigkeiten: `shareFolderToCloudId()`, `listShares()`, `parseCloudId()`, Konstanten für Freigabeart und Rechte |
| `freigabe.test.mjs` | Tests als Erklärung; ausführen mit `node --test freigabe.test.mjs` |

## Benutzung

```js
import { shareFolderToCloudId } from "./freigabe.js";

await shareFolderToCloudId({
  server: acc.server, user: acc.user, appPassword: acc.pw,   // zur Laufzeit, nie im Code
  folder: "Sign",
  cloudId: "name@uni-koeln.de@uni-koeln.sciebo.de",
  via: "webapppassword",   // Browser-Version; in der Handy-App: "ocs"
});
```

## Voraussetzungen

| Wo | Was |
| --- | --- |
| Nextcloud → Verwaltungseinstellungen → **WebAppPassword** | App-Adresse auch im Feld **Files sharing** eintragen (nur für den Browser-Weg) |
| Nextcloud → Verwaltungseinstellungen → **Teilen** | Freigaben an andere Server erlaubt (Standard) |
| Empfänger (Sciebo) | Freigabe einmal über die Glocke annehmen |

## Wie es funktioniert

0. Vorher prüft der Baustein, ob der Ordner schon an diese ID freigegeben ist. Ein zweites Teilen lehnt die Nextcloud ab – und im Browser kommt diese Ablehnung ohne CORS-Freigabe an, sieht also wie „keine Antwort“ aus. Bestehende Freigabe = Erfolg („war schon freigegeben“).

1. Die App bittet die **eigene** Nextcloud, eine Freigabe vom Typ „föderiert“ (Nummer 6) für den Ordner anzulegen.
2. Die Nextcloud meldet die Freigabe **Server zu Server** an Sciebo (Open Cloud Mesh). Der Browser ist daran nicht beteiligt – darum gibt es dabei keine CORS-Sperre.
3. Sciebo zeigt sie unter der Glocke an; nach dem Annehmen liest Sciebo die Dateien bei Bedarf direkt bei der Nextcloud.

Im Browser geht Schritt 1 nur über die Freigabe-Schnittstelle von **WebAppPassword** – die normale Freigabe-Schnittstelle der Nextcloud sperrt der Browser. In der Handy-App gibt es diese Sperre nicht; dort wird `via: "ocs"` genutzt. Parameter und Antwort sind gleich.

## Der umgekehrte Weg (zur Einordnung)

Einen Sciebo-Ordner **in die Nextcloud** holen funktioniert nach demselben Prinzip, nur andersherum: Auf der Sciebo-Seite des Freigabelinks „Zu deiner Nextcloud hinzufügen“ wählen und die Nextcloud-ID eingeben → Sciebo meldet die Freigabe Server zu Server an deine Nextcloud → dort unter der Glocke annehmen → der Ordner erscheint in der Nextcloud und die Sign-App kann ihn unter „Speicherorte“ anhaken. Auch dabei spricht nie der Browser mit Sciebo.

## Quellen

- Nextcloud – Föderiertes Teilen: https://docs.nextcloud.com/server/stable/admin_manual/configuration_files/federated_cloud_sharing_configuration.html
- Nextcloud – Freigabe-Schnittstelle (OCS Share API): https://docs.nextcloud.com/server/stable/developer_manual/client_apis/OCS/ocs-share-api.html
- WebAppPassword (Freigabe-Schnittstelle mit CORS): https://github.com/digital-blueprint/webapppassword
