# QET Kultur-Kompass — Die 12-Monats-Kulturreise

Begleit-App zur [QET-Masterclass](https://www.qet-masterclass.com): misst den Status quo der
Unternehmenskultur einer Firma anhand der 60 QET-Kriterien (je 20 in Qualität, Ethik,
Transparenz). Mitarbeitende, Kunden und Geschäftspartner bewerten pro Kriterium 3 Aussagen über
Schieberegler (0–100 %). Jede Person sieht sofort ihre persönliche Auswertung mit Diagrammen und
QET-Index; alle Einreichungen einer Firma laufen automatisch in einem zentralen Dashboard
zusammen.

## Zwei Wege, eine Firma anzulegen

Seit dieser Version gibt es **zwei unabhängige Wege**, mit der App zu starten:

1. **Self-Service (neu, ohne Ihr Zutun)** – jede:r Interessierte registriert sich selbst unter
   `/start`: entweder als **Einzelkunde** ("Für mich allein") oder als **Firma/Team**
   ("Für mein Team"). Das legt sofort einen Zugang an (E-Mail + Passwort) und führt direkt ins
   persönliche Dashboard unter `/mein-dashboard` – kein Warten, kein Eingriff Ihrerseits nötig.
   Login danach jederzeit unter `/login`.
2. **Admin-verwaltet (wie bisher)** – Sie loggen sich unter `/admin/login` ein und legen die
   Firma manuell an, z.B. für Firmenkunden, die Sie selbst betreuen oder bei denen Sie die
   SAP-Integration einrichten.

Technisch ist eine selbst registrierte Firma dieselbe `Company` wie eine admin-angelegte –
lediglich `accountType` ("individual"/"company") und die Zugangsdaten
(`ownerEmail`/`ownerPasswordHash`) kommen hinzu. Beide Wege können nebeneinander genutzt werden.

### Team-Funktion: Einladen, Mitmachen, eigenes + Team-Ergebnis sehen

Bei einem Firmen-Konto kann die Führungskraft/der Auditor unter `/mein-dashboard` Personen per
**E-Mail-Link** einladen (optional direkt per Mail verschickt, siehe unten "E-Mail-Versand") oder
ihnen sagen, sich selbst über den offenen Umfrage-Link zu beteiligen. Jede eingeladene Person
kann zusätzlich zum Link ein **eigenes Passwort** setzen (auf der Ergebnis-Seite nach dem
Absenden, oder erneut über ihren Link), um sich künftig unter `/login` per E-Mail+Passwort
anzumelden und ihr **eigenes Ergebnis** jederzeit wiederzufinden.

**Wichtig fürs Datenschutz-Design:** Die eigene Einreichung wird ausschließlich **intern** (per
`inviteeId` in der Datenbank) mit der einladenden Person verknüpft – einzig damit sie selbst ihr
Ergebnis wiedersehen kann. Für alle anderen (Firmen-Dashboard, Admin-Ansicht, das anonymisierte
Team-Ergebnis im persönlichen Dashboard) bleibt es bei reinen Summenwerten über alle
Einreichungen; das Team-Ergebnis erscheint zudem weiterhin erst ab `MIN_RESPONSES_FOR_AGGREGATE`
(Standard: 3) Einreichungen, damit auch in kleinen Teams niemand aus dem Durchschnitt einzelne
Antworten herauslesen kann.

### E-Mail-Versand für Einladungen (optional)

Standardmäßig legt "Person einladen" nur den Link an, den Sie manuell kopieren/verschicken (wie
bisher). Setzen Sie zusätzlich `RESEND_API_KEY` und `RESEND_FROM_EMAIL` (siehe `.env.example`,
kostenloser Tier bei [resend.com](https://resend.com) reicht zum Start), verschickt die App die
Einladung bei aktivierter Checkbox direkt per E-Mail. Ohne diese beiden Variablen funktioniert
weiterhin alles wie gehabt, nur eben ohne automatischen Versand.

### Mehrsprachigkeit

Registrierung, Login und das persönliche Dashboard sind – wie die Befragung selbst – auf
Deutsch, Englisch und Türkisch verfügbar (Sprachumschalter oben auf jeder Seite).

### Installierbar auf Desktop & Smartphone (PWA)

Die App liefert ein Web-App-Manifest samt Icons und einen (bewusst minimalen) Service Worker
mit aus. Damit bieten Chrome/Edge auf dem Desktop ein Installations-Icon in der Adressleiste an,
und auf Android erscheint der Browser-Hinweis "Zum Startbildschirm hinzufügen". Auf dem iPhone
funktioniert das (Apple-Beschränkung, nicht beeinflussbar) nur manuell über
Safari → Teilen-Menü → "Zum Home-Bildschirm". Installiert öffnet sich die App wie eine normale
App, ohne Browser-Leiste – es werden aber bewusst **keine** Seiteninhalte offline zwischengespeichert
(nur die paar Icon-Dateien), damit nie veraltete Login-/Ergebnisdaten angezeigt werden.

## Wie es funktioniert (Umfrage & Auswertung)

- **Admin (Sie)** loggt sich unter `/admin/login` ein und legt pro Kunde eine **Firma** an.
  Dabei entstehen zwei Links:
  - **Umfrage-Link** (`/survey/<token>`) – öffentlich, ohne Login. Wird an Mitarbeitende, Kunden
    und Geschäftspartner der Firma verteilt. Jede Person wählt Sprache (DE/EN/TR), Rolle und
    **Testart** (siehe unten) und füllt die dazugehörigen Kriterien aus.
  - **Firmen-Dashboard-Link** (`/dashboard/<token>`) – read-only, ohne Login. Kann an die Firma
    selbst weitergegeben werden, zeigt aber **nur aggregierte Werte** (kein Zugriff auf einzelne
    Antworten/Namen), um die Anonymität der Befragten zu schützen. Aggregierte Werte erscheinen
    erst ab 3 Einreichungen.
- **Admin-Dashboard** (`/admin/company/<id>`) zeigt zusätzlich die Liste aller Einreichungen
  (mit Rolle, Testart, Datum, optionalem Namen) – für Ihre eigene Nachverfolgung.
- Auswertung: Kriterium = Ø der 3 Statements, Säule = Ø der 20 Kriterien, **QET-Index** = Ø der
  3 Säulen (Qualität/Ethik/Transparenz gleich gewichtet).

### Testarten (Anwendungsbereiche)

Jede Person wählt vor dem Ausfüllen eine von **11 Testarten** – insgesamt 1 Gesamttest + 10
fokussierte Teiltests:

1. **QET-Gesamttest** – alle 60 Kriterien, Ergebnis mit QET-Index + Säulen-Radar (wie oben).
2. **Säulen-Test** (3 Varianten) – nur Qualität, nur Ethik oder nur Transparenz (je 20 Kriterien).
3. **Managementfeld-Test** (7 Varianten) – eines der 7 Managementfelder, die quer zu den drei
   Säulen liegen: **Führung, Mitarbeiter, Kunden/Produkte/Märkte, Geschäftsprozesse, Finanzen,
   Unternehmensimage, CSR (Soziokulturelle Verantwortung)**. Jedes Feld deckt eine vom Nutzer
   definierte Auswahl an Kriterien aus allen drei Säulen ab – **ein Kriterium kann dabei zu
   mehreren Managementfeldern gehören** (z. B. gehört Q18 zu 5 der 7 Felder), das entspricht dem
   Original-QET-Framework und ist bewusst keine disjunkte Aufteilung.

Bei einem Teiltest zeigt das Ergebnis den **Scope-Index** (Ø der tatsächlich abgefragten
Kriterien) statt des vollen QET-Index, sowie ein Balkendiagramm nur der relevanten Kriterien
(bei einem Managementfeld ggf. mit Kriterien aus mehreren Säulen, farblich nach Säule markiert).
Werden bei einer Firma Gesamttests und Teiltests gemischt eingereicht, verfälscht das die
Firmen-Auswertung **nicht** – die Aggregation berechnet Kriterien-Mittelwerte immer nur aus den
Einreichungen, die das jeweilige Kriterium tatsächlich beantwortet haben (siehe
`aggregateSubmissions()` in `src/lib/scoring.ts`).

Die Zuordnung der Kriterien zu den 7 Managementfeldern stammt aus den offiziellen
QET-Deckblättern und liegt in `src/lib/content/managementFields.ts` – dort lässt sie sich bei
Bedarf anpassen (z. B. wenn sich das QET-Framework weiterentwickelt).

## Technischer Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Prisma** als ORM – Datenbank ist **PostgreSQL** (z. B. Supabase, Vercel Postgres, Railway).
  Eine vollständige Initial-Migration liegt bereits unter `prisma/migrations/` – beim Deployment
  legt `prisma migrate deploy` (Teil von `npm run build`) alle Tabellen automatisch an.
- **NextAuth** (Credentials-Login) für den Admin-Zugang; eine separate, schlanke
  Cookie-Session (`src/lib/session.ts`, signiert mit `NEXTAUTH_SECRET`) für die
  Self-Service-Konten (Firmen-Verantwortliche/Einzelkunden/eingeladene Personen)
- **Recharts** für die Diagramme (Radar je Säule, Balken je Kriterium)
- **PWA**: Web-App-Manifest + Icons + minimaler Service Worker (installierbar auf Desktop/Smartphone)

## Lokal starten

Lokale Entwicklung braucht jetzt (Provider ist fest auf PostgreSQL gestellt) eine erreichbare
Postgres-Datenbank – am einfachsten ein zweites, kostenloses Supabase-Projekt nur für die
Entwicklung, oder ein lokaler Postgres via Docker (`docker run -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres`).

```bash
npm install
cp .env.example .env
# .env öffnen: DATABASE_URL (Postgres!), NEXTAUTH_SECRET, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD setzen
# (NEXTAUTH_SECRET erzeugen: openssl rand -base64 32)

npx prisma migrate deploy   # wendet die vorhandene Migration an (legt alle Tabellen an)
npm run seed                # legt Ihren Admin-Zugang an

npm run dev
```

Danach ist die App unter `http://localhost:3000` erreichbar, Self-Service-Registrierung unter
`/start`, Admin-Login unter `/admin/login` mit den in `.env` gesetzten Zugangsdaten.

## Produktiv deployen (Vorschlag: Vercel + Supabase)

`prisma/schema.prisma` ist bereits fest auf PostgreSQL gestellt, und eine vollständige
Initial-Migration liegt unter `prisma/migrations/` bereit (legt alle Tabellen inkl. der neuen
Self-Service-Felder frisch an) – die beiden Schritte, die frühere Versionen dieser README noch
als manuell beschrieben, entfallen also.

1. **Supabase-Projekt anlegen** (kostenloser Tier reicht zum Start) → unter „Project Settings →
   Database" **zwei** Connection-Strings kopieren:
   - **Pooler/„Transaction"-Modus, Port 6543** → wird `DATABASE_URL`.
   - **„Direct connection", Port 5432** → wird `DIRECT_URL`.

   Bei beiden: Passwort einsetzen, eckige Klammern entfernen, Sonderzeichen im Passwort ggf.
   URL-kodieren. **Wichtig:** Ohne `DIRECT_URL` bleibt der Build beim Schritt „Datenbank
   verbinden" wortlos hängen (kein Fehler, einfach keine weitere Log-Zeile) – der Pooler
   unterstützt die für Migrationen nötigen Advisory Locks nicht.
2. `DATABASE_URL` **und** `DIRECT_URL` in den Vercel-Umgebungsvariablen setzen, dazu
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (Ihre Live-Domain), `SEED_ADMIN_EMAIL`,
   `SEED_ADMIN_PASSWORD` und `SETUP_SECRET` (ein beliebiger geheimer Wert, z. B. mit
   `openssl rand -base64 32` erzeugt). Optional zusätzlich `RESEND_API_KEY`/`RESEND_FROM_EMAIL`
   für automatischen E-Mail-Versand von Einladungen (siehe oben).
3. Projekt bei [vercel.com](https://vercel.com) importieren bzw. den vorhandenen Projekt-Ordner
   in Ihr bestehendes GitHub-Repo hochladen (Drag & Drop des kompletten entpackten Ordners über
   die GitHub-Weboberfläche funktioniert weiterhin, ganz ohne lokales Git/Terminal – **bitte
   dabei alle bestehenden Dateien überschreiben lassen**, dieses Paket ersetzt den gesamten
   Projektstand). Der Build-Befehl (`npm run build`) führt automatisch `prisma migrate deploy`
   vor `next build` aus – die Datenbank-Tabellen werden also beim Deployment selbst angelegt,
   kein separater Schritt nötig.
4. **Komplett ohne Terminal möglich:** Nach dem ersten erfolgreichen Deployment einmal im
   Browser aufrufen: `https://<ihre-domain>/api/setup?secret=<SETUP_SECRET>` – legt den
   Admin-Zugang an (Antwort `"status": "created"`). Danach ist der Aufruf ungefährlich
   wiederholbar (legt kein zweites Mal an). Alternativ weiterhin klassisch per Terminal:
   `npm run seed` einmalig lokal gegen die Produktions-`DATABASE_URL` laufen lassen.
5. Fertig – Self-Service-Registrierung (`/start`), Login (`/login`), persönliches Dashboard
   (`/mein-dashboard`) sowie die Umfrage-/Dashboard-Links und der Admin-Login (`/admin/login`)
   funktionieren dann unter Ihrer Live-Domain.

Alternativen: Jeder Anbieter, der Node.js + PostgreSQL unterstützt (Railway, Render, eigener
Server mit Docker), funktioniert genauso – nur `DATABASE_URL` und `NEXTAUTH_URL` anpassen.

## Projektstruktur

```
src/
  app/
    admin/              Admin-Login, Firmenliste, Firmen-Dashboard, SAP-Einstellungen
    survey/[token]/     Öffentliche Umfrageseite (generischer Firmen-Link)
    invite/[token]/     Personalisierte Umfrageseite (SAP-Import/manuell, optional SSO-Pflicht)
    dashboard/[token]/  Öffentliches read-only Firmen-Dashboard
    api/                REST-Routen (Firmen, Einladungen, Umfrage-Submit, SAP-Sync/-Export, Auth)
  components/           UI-Bausteine (Slider, Diagramme, Gauge, Formulare, SAP-Einstellungen)
    QetLogo.tsx          QET-Wortmarke (Vektor-Nachbau des offiziellen Logos), für Kopfzeilen
    QetSymbol.tsx         Sprachunabhängiges Marken-Symbol (3-farbiger Ring Q/E/T), ersetzt Logo
                          überall dort, wo nur ein kompaktes Icon statt der vollen Wortmarke passt
  lib/
    content/
      criteria.ts       Die 60 QET-Kriterien × 3 Statements, trilingual (DE/EN/TR)
      managementFields.ts  Die 7 Managementfelder + ihre Kriterien-Zuordnung (aus den QET-Deckblättern)
      scopes.ts         Testarten-Logik: welche Kriterien/Schritte zu welcher Testart gehören
      types.ts          Gemeinsame Typen, u.a. TestScope (Gesamttest/Säule/Managementfeld)
      i18n.ts           UI-Texte, trilingual
    sap/                SAP-Integrationsschicht (SuccessFactors/S4HANA-Adapter, OIDC-SSO, Export)
    scoring.ts          QET-Index-, Scope-Index-Berechnung & Aggregation über Testarten hinweg
    crypto.ts           Verschlüsselung der SAP-Zugangsdaten (AES-256-GCM)
    auth.ts             NextAuth-Konfiguration (Admin-Login)
    prisma.ts           Prisma-Client
prisma/
  schema.prisma         Datenmodell (Company, Invitee, Submission, AdminUser)
  seed.ts               Legt den ersten Admin-Zugang an
```

## Inhalte anpassen

Die 60 Kriterien samt Statements liegen vollständig in `src/lib/content/criteria.ts` – dort
lässt sich jede Formulierung in allen drei Sprachen direkt anpassen, ohne Code an anderer Stelle
ändern zu müssen. UI-Texte liegen entsprechend in `src/lib/content/i18n.ts`.

**Hinweis zu den türkischen Texten:** Sie wurden mit großer Sorgfalt übersetzt, sollten aber vor
dem produktiven Einsatz von einer Muttersprachlerin/einem Muttersprachler gegengelesen werden.

**Marke/Logo:** `src/components/QetLogo.tsx` ist ein Vektor-Nachbau der QET-Wortmarke (Ring-„Q“ +
„ET“ + ®) aus den offiziellen QET-Unterlagen, oben rechts auf der Startseite platziert – keine
externe Bilddatei nötig, bleibt in jeder Auflösung scharf. `src/components/QetSymbol.tsx` ist ein
davon abgeleitetes, rein grafisches Symbol (dreigeteilter Ring in den Q/E/T-Farben, angelehnt an
den „QET-Zirkel“ aus den Deckblättern) für Stellen, an denen kein Platz für die volle Wortmarke ist
oder kein sprachabhängiger Text funktionieren soll (z. B. der Kopfbereich der Umfrageseiten).

## SAP-Integration

Pro Firma optional aktivierbar (jede Firma hat ihr eigenes SAP-System – Einstellungen unter
„SAP-Integration einrichten“ auf der jeweiligen Firmenseite im Admin-Bereich):

1. **Mitarbeiterimport** – lädt aktive Mitarbeitende aus SAP SuccessFactors (OData-API
   `/odata/v2/User`) oder SAP S/4HANA (kundenspezifischer OData-Service) und legt dafür
   personalisierte Einladungslinks (`/invite/<token>`) an, statt nur einen generischen Link zu
   teilen. Erneuter Sync aktualisiert Name/E-Mail/Abteilung, der Antwortstatus bleibt erhalten.
2. **Ergebnis-Export** – sendet den aktuellen QET-Index samt Säulen- und Kriterien-Scores als
   signierten JSON-Webhook (`X-QET-Signature: sha256=…`, HMAC über den Body) an eine von Ihnen
   hinterlegte Ziel-URL. Es gibt **keinen universellen SAP-Endpunkt** für beliebige externe KPIs –
   die Ziel-URL zeigt daher typischerweise auf eine SAP Integration Suite/BTP-Middleware, die der
   SAP-Ansprechpartner des jeweiligen Kunden bereitstellt und die den Wert dann in SuccessFactors,
   S/4HANA oder SAP Analytics Cloud einsortiert. Für automatisierten, wiederkehrenden Export siehe
   `POST /api/cron/sap-export` (mit `Authorization: Bearer <CRON_SECRET>`, z.B. per Vercel Cron
   oder einer GitHub Action stündlich/täglich aufrufen).
3. **SSO-Login (SAP Identity Authentication Service)** – Standard-OIDC-Authorization-Code-Flow.
   Bevor jemand über einen personalisierten Link antwortet, muss er/sie sich mit dem SAP-Konto
   anmelden. **Wichtiges Datenschutz-Design:** Der Login bestätigt nur die Teilnahmeberechtigung
   und setzt den Erledigt-Status der Einladung – die gespeicherte Antwort (`Submission`) wird
   bewusst **nicht** mit der Identität verknüpft (kein Fremdschlüssel im Datenmodell). So bleibt
   die Anonymität der Kulturbefragung gewahrt, auch bei personalisierten, SSO-geschützten Links.

### Ehrlicher Stand & was vor dem Live-Gang zu prüfen ist

Diese Integration wurde **ohne Zugriff auf ein echtes SAP-System** gebaut, weil aktuell kein
SAP-Sandbox/-Tenant zum Testen zur Verfügung stand. Der Code folgt den offiziellen, dokumentierten
Standards (SuccessFactors OData API, OIDC-Discovery/Standard-Flow für SAP IAS), ist aber
**ungetestet gegen ein reales System**. Vor dem produktiven Einsatz mit einem echten Kunden:

- Mit dem SAP-Basis-/Integrationsteam des Kunden klären, welcher OData-Service für den
  Mitarbeiterimport tatsächlich freigegeben ist (Feldnamen/Pfade können je nach Tenant-Konfiguration
  von `src/lib/sap/successfactors.ts` bzw. `s4hana.ts` abweichen).
- Für den Export gemeinsam mit dem Kunden festlegen, welche Middleware/welcher Endpunkt die
  Ziel-URL des Webhooks ist, und die HMAC-Signaturprüfung dort implementieren.
- Für SSO einen echten SAP-IAS-Tenant (Sandbox reicht) anlegen und den kompletten Login-Flow einmal
  end-to-end durchspielen, bevor er für echte Mitarbeitende scharf geschaltet wird.
- Benötigte SAP-Berechtigungen: für den Import ein API-User/OAuth2-Client mit Leserecht auf die
  Mitarbeiterdaten (bei SuccessFactors z.B. die Standardrolle "User" lesend); für SSO eine in IAS
  registrierte OIDC-Anwendung (Redirect-URI: `https://<ihre-domain>/api/sap-sso/<companyId>/callback`).
- `SAP_CREDENTIALS_KEY` in der Produktionsumgebung setzen, bevor irgendeine Firma SAP-Zugangsdaten
  hinterlegt – ohne diesen Wert werden keine Secrets gespeichert (Absicht, kein Bug).

## Ideen für später

- E-Mail-Benachrichtigung an den Admin bei neuer Einreichung
- Zeitverlauf/Trend je Firma (mehrere Befragungsrunden vergleichen)
- Export der Firmen-Auswertung als PDF
- Eigenes Branding/Logo pro Firma auf der Umfrageseite
- Passwort-Zurücksetzen-Flow für Self-Service-Konten (aktuell kein "Passwort vergessen")
- Bezahlschranke/Zugangscode für die Self-Service-Registrierung, falls die Registrierung nicht
  dauerhaft komplett offen bleiben soll
- E-Mail-Adresse bei der Registrierung verifizieren (aktuell ungeprüft)
