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
   Login danach jederzeit unter `/login`. Selbstregistrierte Konten sind kostenlos bis zu
   `FREE_PARTICIPANT_LIMIT` Teilnehmenden (Standard: 3) nutzbar; darüber hinaus greift die
   Bezahlschranke, siehe Abschnitt „Bezahlung (Stripe)" unten.
   Alternativ kann eine Firma auch **direkt per Kauf** entstehen, ganz ohne vorherige
   Registrierung unter `/start` (siehe ebenfalls „Bezahlung (Stripe)").
2. **Admin-verwaltet (wie bisher)** – Sie loggen sich unter `/admin/login` ein und legen die
   Firma manuell an, z.B. für Firmenkunden, die Sie selbst betreuen oder bei denen Sie die
   SAP-Integration einrichten. Admin-verwaltete Firmen sind bewusst **nicht** an das
   Selfservice-Teilnehmerlimit gebunden.

Technisch ist eine selbst registrierte Firma dieselbe `Company` wie eine admin-angelegte –
lediglich `accountType` ("individual"/"company") und die Zugangsdaten
(`ownerEmail`/`ownerPasswordHash`) kommen hinzu. Beide Wege können nebeneinander genutzt werden.

### Team-Funktion: Einladen, Mitmachen, eigenes + Team-Ergebnis sehen

Bei einem Firmen-Konto kann die Führungskraft/der Auditor unter `/mein-dashboard` Personen per
**E-Mail-Link** einladen (optional direkt per Mail verschickt, siehe unten "E-Mail-Versand") oder
ihnen sagen, sich selbst über den offenen Umfrage-Link zu beteiligen. Jede eingeladene Person
kann zusätzlich zum Link ein **eigenes Passwort** setzen (auf der Ergebnis-Seite nach dem
Absenden, oder erneut über ihren Link), um sich künftig unter `/login` per E-Mail+Passwort
anzumelden und ihr **eigenes Ergebnis** jederzeit wiederzufinden. Das Einladen weiterer Personen
ist – bei Selfservice-Konten – durch das Teilnehmerlimit der Firma begrenzt (siehe „Bezahlung
(Stripe)"); ist das Limit erreicht, zeigt das Dashboard einen Hinweis mit Upgrade-Button.

**Wichtig fürs Datenschutz-Design:** Die eigene Einreichung wird ausschließlich **intern** (per
`inviteeId` in der Datenbank) mit der einladenden Person verknüpft – einzig damit sie selbst ihr
Ergebnis wiedersehen kann. Für alle anderen (Firmen-Dashboard, Admin-Ansicht, das anonymisierte
Team-Ergebnis im persönlichen Dashboard) bleibt es bei reinen Summenwerten über alle
Einreichungen; das Team-Ergebnis erscheint zudem weiterhin erst ab `MIN_RESPONSES_FOR_AGGREGATE`
(Standard: 3) Einreichungen, damit auch in kleinen Teams niemand aus dem Durchschnitt einzelne
Antworten herauslesen kann.

### E-Mail-Versand (optional, aber für die Bezahlfunktion empfohlen)

Standardmäßig legt "Person einladen" nur den Link an, den Sie manuell kopieren/verschicken (wie
bisher). Setzen Sie zusätzlich `RESEND_API_KEY` und `RESEND_FROM_EMAIL` (siehe `.env.example`,
kostenloser Tier bei [resend.com](https://resend.com) reicht zum Start), verschickt die App
Einladungen bei aktivierter Checkbox direkt per E-Mail – und ebenso alle
Abrechnungs-/Kundenservice-Mails rund ums Abo (siehe nächster Abschnitt). Ohne diese beiden
Variablen funktioniert weiterhin alles wie gehabt, nur eben ohne automatischen Versand – bei
einem Kauf ohne vorherige Registrierung bedeutet das dann allerdings, dass die kaufende Person
ihren Konto-Einrichtungslink nicht automatisch erhält; `RESEND_API_KEY`/`RESEND_FROM_EMAIL` vor
dem Livegang der Bezahlfunktion zu setzen ist daher dringend empfohlen.

## Bezahlung (Stripe), zusätzlich zu Digistore24

Self-Service-Konten sind bis `FREE_PARTICIPANT_LIMIT` Teilnehmende kostenlos (Standard: 3,
`src/lib/billing.ts`). Darüber hinaus – oder direkt beim allerersten Kauf, ganz ohne vorherige
Registrierung – läuft die Bezahlung über **Stripe**, **zusätzlich** zu Ihrem bestehenden
Digistore24-Vertrieb (beide Wege laufen unabhängig nebeneinander; ein über Digistore24 gekaufter
Zugang wird weiterhin wie bisher **manuell** im Admin-Bereich freigeschaltet,
`billingProvider: "manual"`, ohne Teilnehmerlimit).

**Kein manuell in Stripe angelegter Preis nötig.** Der Preis pro Teilnehmer wird bei jedem
Checkout/jeder Kontingent-Erweiterung **live aus `src/lib/billing.ts` (`TIER_POINTS`, 9
Stützpunkte von „Solo" bis „Business", linear interpoliert/extrapoliert bis 500 Teilnehmende,
darüber „Enterprise" ausschließlich auf Anfrage) berechnet und als Stripe-„price_data" direkt im
Checkout mitgeschickt** (`src/app/api/checkout/route.ts`). Das bedeutet: Landingpage-Tarifrechner
und tatsächliche Abrechnung sind immer automatisch synchron – ändern Sie später die Preise, reicht
eine Änderung in `TIER_POINTS`, ohne irgendetwas im Stripe-Dashboard nachzuziehen. Menge im
Stripe-Checkout = Anzahl gekaufter Teilnehmer.

Erweitert eine bereits zahlende Firma ihr Kontingent ("Plan erweitern" im Dashboard), wird nicht
etwa ein zweiter, paralleler Checkout gestartet, sondern das **bestehende Stripe-Abo direkt
aktualisiert** (anteilige Ab-/Zurechnung auf der nächsten Rechnung, "proration") – so entsteht nie
eine Doppel-Abbuchung.

**Rechnungen (Invoicing).** Jede Stripe-Subscription erzeugt automatisch – ganz ohne eigenen Code –
bei jeder Abbuchung eine ordentliche Rechnung mit fortlaufender Nummer. Im Dashboard sieht jede/r
Konto-Inhaber:in unter "Rechnungen" die letzten Abrechnungen mit Link zur gehosteten
Stripe-Rechnung und zum PDF (`/api/billing/invoices`, `src/components/MeinDashboardView.tsx`). Ob
diese Rechnungen den Kund:innen zusätzlich automatisch per E-Mail zugeschickt werden, ist eine
Stripe-Dashboard-Einstellung – siehe Schritt 5 unten.

**Enterprise-Anfragen (500+ Teilnehmende).** Der "Enterprise"-Button auf der Landingpage führt
jetzt auf ein echtes Kontaktformular (`/enterprise`, `src/app/api/enterprise-contact/route.ts`)
statt auf einen bloßen mailto-Link. Beim Absenden bekommen **Sie sofort eine
Benachrichtigungs-Mail** mit allen Angaben (Firma, Ansprechperson, Teilnehmerzahl, Nachricht) und
die anfragende Person eine Eingangsbestätigung. Bewusst **kein** automatischer Checkout für diese
Größenordnung – bei 500+ Teilnehmenden ist ein persönliches Angebot sinnvoller als ein Festpreis
per Formel.

**Automatische USt./VAT-Berechnung (optional, EU-Reverse-Charge inklusive).** Der Checkout fragt
bei jedem Kauf automatisch eine USt-IdNr. ab (für B2B-Kund:innen) und kann, wenn Sie **Stripe Tax**
in Ihrem Dashboard aktivieren, die Umsatzsteuer automatisch korrekt berechnen und ausweisen – siehe
Schritt 6 unten.

### Was Sie selbst einmalig einrichten müssen (kann ich als KI nicht für Sie tun)

Dank der dynamischen Preisberechnung bleiben hier nur noch wenige Schritte – **kein Produkt, kein
Preis, keine Price-ID** muss im Stripe-Dashboard von Hand angelegt werden:

1. **Stripe-Konto anlegen/einloggen** unter [stripe.com](https://stripe.com) – das muss Ralph
   selbst tun, ich kann und darf mich nicht mit fremden Zugangsdaten in Ihr Konto einloggen.
   Läuft bereits ein anderes Geschäft (z.B. SystemButler) über dasselbe Stripe-Login: oben links
   auf den Kontonamen klicken → **"New account"** → eigenes Konto nur für QET Compass anlegen
   (wichtig für saubere Buchhaltung und damit auf Kunden-Kontoauszügen "QET" statt des anderen
   Geschäfts steht).
2. **API-Schlüssel** (Developers → API keys) als `STRIPE_SECRET_KEY` in Vercel eintragen – bitte
   unbedingt zunächst die **Test**-Keys (`sk_test_...`) verwenden und einen kompletten
   Test-Kauf mit einer [Stripe-Testkarte](https://docs.stripe.com/testing) durchspielen, bevor
   auf die Live-Keys umgestellt wird.
3. **Webhook-Endpunkt anlegen**: Developers → Webhooks → *Add endpoint* →
   `https://<ihre-domain>/api/webhooks/stripe` → Events: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.upcoming`,
   `invoice.payment_failed`. Das „Signing secret" des Endpunkts als `STRIPE_WEBHOOK_SECRET` in
   Vercel eintragen. (Braucht eine live erreichbare Domain – also erst nach dem Deployment.)
4. `NEXT_PUBLIC_APP_URL` in Vercel auf Ihre echte Live-Domain setzen, z.B.
   `https://app.qet-compass.com` (für Checkout-Redirects und Links in E-Mails – siehe auch den
   Abschnitt "Die offene Frage: Wohin zeigt qet-compass.com?" unten).
5. **Automatische Rechnungs-/Zahlungs-E-Mails aktivieren** (reine Dashboard-Einstellung, kein
   Code): Settings → Business → [Customer emails](https://dashboard.stripe.com/settings/emails) →
   "Successful payments" einschalten, und Settings → Billing →
   [Subscriptions and emails](https://dashboard.stripe.com/settings/billing/automatic) →
   "Send finalized invoices and credit notes to customers" einschalten. Ohne diese beiden Haken
   bekommen Kund:innen ihre Rechnung nur über das Dashboard zu sehen ("Rechnungen"-Liste dort),
   nicht automatisch per E-Mail.
6. **Optional: Stripe Tax aktivieren** für automatische USt.-Berechnung (Settings → Tax → Stripe
   Tax aktivieren, Firmenadresse/Steuerregistrierungen hinterlegen). Erst **danach**
   `STRIPE_TAX_ENABLED="true"` in Vercel setzen – ohne aktiviertes Stripe Tax würde der Checkout
   sonst mit einem Fehler abbrechen, deshalb ist das bewusst über diese Umgebungsvariable
   abgesichert (Standard: aus, USt. wird dann nicht automatisch berechnet).
7. **Optional:** `ENTERPRISE_LEAD_NOTIFY_EMAIL` in Vercel setzen, falls Enterprise-Anfragen an eine
   andere Adresse als `SEED_ADMIN_EMAIL` gehen sollen (Standard: dieselbe Adresse).

Alle Geheimnisse bzw. Kontodaten (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) kann ich aus
Sicherheitsgründen nicht selbst in Stripe oder Vercel eintragen, das muss einmalig von Ihnen
erledigt werden. Der Code selbst ist vollständig fertig implementiert und wartet nur auf diese
Umgebungsvariablen (siehe `.env.example`). Kleiner Hinweis zum Stripe-Dashboard: da jeder
Checkout/jedes Upgrade seinen Preis live mitschickt, sehen Sie dort mit der Zeit mehrere
Produkte/Preise („QET Compass – Team", „QET Compass – Business", …) statt eines einzigen – das ist
normal und rein kosmetisch, die Abrechnung selbst ist davon nicht betroffen.

### Was automatisch funktioniert, sobald obiges eingerichtet ist

- **Kontingent erweitern mit bestehendem Konto** – "Plan erweitern" im Dashboard erweitert bei
  bereits laufendem Abo das bestehende Stripe-Abo direkt (kein neuer Checkout, keine
  Doppel-Abbuchung); wer noch im kostenlosen Plan ist, bekommt einen Stripe-Checkout-Redirect für
  den ersten Kauf (`/api/checkout`).
- **Kauf ohne vorherige Registrierung** – dieselbe Route legt bei fehlender Login-Session
  stattdessen erst nach erfolgreicher Zahlung (per Webhook) die Firma an und verschickt eine
  **Willkommens-E-Mail** mit einem Link, das eigene Passwort zu setzen
  (`/account-setup/<token>`, 72 Stunden gültig) – siehe `sendWelcomeEmail` in `src/lib/mail.ts`.
- **Automatische Laufzeit-/Verlängerungskontrolle** – läuft vollständig über Stripes eigenen
  `invoice.upcoming`-Webhook (Standard: ca. 7 Tage vor Abbuchung, in den
  Stripe-Rechnungseinstellungen anpassbar), **kein eigener Cron-Job nötig**. Die App verschickt
  dann automatisch eine Verlängerungs-Erinnerung (`sendRenewalReminderEmail`) und merkt sich
  `renewalReminderSentAt`, um doppelte Erinnerungen im selben Abrechnungszeitraum zu vermeiden.
- **Guter Kundenservice bei mehreren Käufen/Upgrades** – kauft eine bereits bestehende Firma ein
  größeres Kontingent nach ("mehrfach bestellen"), erhält sie automatisch eine
  Upgrade-Bestätigung (`sendUpgradeEmail`) statt einer erneuten Willkommens-Mail.
- **Fehlgeschlagene Zahlung** – automatische E-Mail mit Link zum Stripe-Kundenportal, dort kann
  die Zahlungsmethode selbst aktualisiert werden (`sendPaymentFailedEmail`,
  `/api/billing/portal`).
- **Kündigung** – fällt das Konto automatisch auf den kostenlosen Plan zurück
  (`FREE_PARTICIPANT_LIMIT`), inklusive Bestätigungs-Mail (`sendSubscriptionCanceledEmail`).
- **Teilnehmerlimit-Durchsetzung** – `/api/companies/[id]/invitees` (POST) prüft bei
  Selfservice-Konten das aktuelle Kontingent und weist neue Einladungen mit `402
  participant_limit_reached` ab, sobald das Limit erreicht ist; das Dashboard zeigt dann den
  Hinweis „Sie haben Ihr Teilnehmerlimit erreicht" mit direktem Upgrade-Button.
- **Rechnungen** – jede Abbuchung erzeugt automatisch eine Stripe-Rechnung mit fortlaufender
  Nummer; im Dashboard unter "Rechnungen" einsehbar (Link zur Stripe-Seite + PDF). Automatischer
  E-Mail-Versand dieser Rechnungen ist Schritt 5 oben (Dashboard-Einstellung).
- **Enterprise-Anfragen** – das Kontaktformular unter `/enterprise` benachrichtigt Sie sofort per
  E-Mail mit allen Angaben und bestätigt der anfragenden Person den Eingang; die individuelle
  Angebotserstellung selbst bleibt bewusst ein persönlicher Schritt.
- **USt./VAT** – der Checkout fragt immer eine USt-IdNr. ab; mit aktiviertem Stripe Tax (Schritt 6
  oben) wird die Umsatzsteuer zusätzlich automatisch korrekt berechnet und auf der Rechnung
  ausgewiesen, inklusive EU-Reverse-Charge für B2B-Kund:innen mit gültiger USt-IdNr.

### Die offene Frage: Wohin zeigt qet-compass.com?

Die Domain `qet-compass.com` ist noch nicht gekauft – das können und sollten Sie selbst bei
einem Registrar Ihrer Wahl tun (z.B. dort, wo auch `qet.ag` liegt). **Wichtig zu wissen:** Die
öffentlichkeitswirksame Marketing-Landingpage (mit Tarifrechner, Sprachumschalter DE/EN/TR/RO
usw.) ist aktuell eine separate, eigenständige Seite und **nicht** Teil dieser Next.js-App – sie
kann daher nicht einfach unter derselben Domain wie die eigentliche Software (`/start`, `/login`,
`/mein-dashboard`, …) laufen, ohne dass Sie sich für eine der beiden folgenden Varianten
entscheiden:

- **Variante A (empfohlen für den schnellen Start):** `qet-compass.com` zeigt auf die
  Marketing-Landingpage, eine Unterdomain wie `app.qet-compass.com` zeigt auf dieses
  Next.js-Deployment (dorthin verlinkt dann auch "Kostenlos starten"/"Login" auf der
  Landingpage). Kein zusätzlicher Programmieraufwand nötig, nur zwei DNS-Einträge beim Registrar.
- **Variante B (mehr Aufwand, aber eine einzige Seite):** Das Design der Marketing-Landingpage
  wird in `src/app/page.tsx` dieser App portiert, sodass `qet-compass.com` direkt auf die App
  zeigt und `/start` derselbe Klick bleibt. Das ist ein separater, größerer Aufgabenblock, den
  ich gerne übernehmen kann, sobald Sie sich entschieden haben.

Ich habe in diesem Durchgang bewusst **keine** der beiden Varianten fest verdrahtet, da das eine
Entscheidung ist, die nur Sie treffen können (u.a. weil Variante B einiges an weiterer
Design-/Entwicklungsarbeit bedeutet). Bitte kurz Rückmeldung, welche Variante gewünscht ist.

### Erklärfilm auf der Landingpage

Die vier Sprachversionen des Erklärfilms (aus Ihrer Dropbox, "QET DEMOclip 40 lnguages xxl and 40
small format", jeweils die kleine komprimierte Version, ~14-15 MB) liegen jetzt unter
`public/videos/qet-demo-{de,en,tr,ro}.mp4` in diesem Projekt. Die Marketing-Landingpage
referenziert sie fest unter `https://app.qet-compass.com/videos/qet-demo-{lang}.mp4` – das
funktioniert automatisch, sobald Sie **Variante A** oben umsetzen (Unterdomain `app.qet-compass.com`
zeigt auf dieses Deployment). Zeigt die Unterdomain bei Ihnen später anders (z.B. `www.` statt
`app.`), muss die `VIDEO_BASE`-Konstante im `<script>` der Landingpage entsprechend angepasst
werden. Bis die Domain live ist, zeigt der Play-Button auf der Landingpage einen Ladefehler statt
des Videos – das ist normal und kein Bug.

### Mehrsprachigkeit

Registrierung, Login, das persönliche Dashboard und die gesamte Befragung (alle 60 Kriterien ×
3 Aussagen) sind auf **Deutsch, Englisch, Türkisch und Rumänisch** verfügbar (Sprachumschalter
oben auf jeder Seite).

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
    und Geschäftspartner der Firma verteilt. Jede Person wählt Sprache (DE/EN/TR/RO), Rolle und
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
- **Stripe** (`stripe` npm-Paket) für Abo-Zahlungen zusätzlich zu Digistore24, siehe „Bezahlung
  (Stripe)" oben
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
# Für die Bezahlfunktion zusätzlich die Stripe-Testwerte setzen, siehe "Bezahlung (Stripe)" oben
# (ohne diese Werte funktioniert die App weiterhin, nur eben ohne Checkout/Webhooks)

npx prisma migrate deploy   # wendet die vorhandene Migration an (legt alle Tabellen an)
npm run seed                # legt Ihren Admin-Zugang an

npm run dev
```

Danach ist die App unter `http://localhost:3000` erreichbar, Self-Service-Registrierung unter
`/start`, Admin-Login unter `/admin/login` mit den in `.env` gesetzten Zugangsdaten.

## Produktiv deployen (Vorschlag: Vercel + Supabase)

`prisma/schema.prisma` ist bereits fest auf PostgreSQL gestellt, und eine vollständige
Initial-Migration liegt unter `prisma/migrations/` bereit (legt alle Tabellen inkl. der
Self-Service- und Abrechnungsfelder frisch an) – die beiden Schritte, die frühere Versionen
dieser README noch als manuell beschrieben, entfallen also.

1. **Supabase-Projekt anlegen** (kostenloser Tier reicht zum Start) → Connection-String unter
   „Project Settings → Database" kopieren (Pooler-/„Transaction"-Modus, Passwort einsetzen,
   eckige Klammern entfernen, Sonderzeichen im Passwort ggf. URL-kodieren).
2. `DATABASE_URL` in den Vercel-Umgebungsvariablen auf diesen Connection-String setzen, dazu
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (Ihre Live-Domain), `SEED_ADMIN_EMAIL`,
   `SEED_ADMIN_PASSWORD` und `SETUP_SECRET` (ein beliebiger geheimer Wert, z. B. mit
   `openssl rand -base64 32` erzeugt). Optional zusätzlich `RESEND_API_KEY`/`RESEND_FROM_EMAIL`
   für automatischen E-Mail-Versand (Einladungen UND Abrechnungs-Mails, siehe oben) sowie die
   sechs Stripe-Werte für die Bezahlfunktion (siehe „Bezahlung (Stripe)" oben).
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
   funktionieren dann unter Ihrer Live-Domain. Sobald die Stripe-Werte gesetzt sind (siehe oben),
   funktioniert auch der Checkout/die Bezahlung.

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
    checkout/erfolg/    Landeseite nach erfolgreichem Stripe-Checkout
    account-setup/[token]/  Passwort setzen nach Kauf ohne vorherige Registrierung
    api/
      checkout/                  Stripe-Checkout-Session erstellen (neu & Upgrade)
      billing/portal/            Stripe-Kundenportal-Session erstellen
      webhooks/stripe/           Stripe-Webhook: Kauf/Verlängerung/Kündigung/fehlgeschlagene Zahlung
      account-setup/[token]/     Token prüfen & Passwort setzen (Kauf ohne Registrierung)
      companies/[id]/invitees/   Personen einladen, inkl. Teilnehmerlimit-Durchsetzung
      ...                        weitere REST-Routen (Firmen, Umfrage-Submit, SAP-Sync/-Export, Auth)
  components/           UI-Bausteine (Slider, Diagramme, Gauge, Formulare, SAP-Einstellungen)
    QetLogo.tsx          QET-Wortmarke (Vektor-Nachbau des offiziellen Logos), für Kopfzeilen
    QetSymbol.tsx         Sprachunabhängiges Marken-Symbol (3-farbiger Ring Q/E/T), ersetzt Logo
                          überall dort, wo nur ein kompaktes Icon statt der vollen Wortmarke passt
    AccountSetupForm.tsx  Passwort-Formular nach Kauf ohne vorherige Registrierung
  lib/
    content/
      criteria.ts       Die 60 QET-Kriterien × 3 Statements, viersprachig (DE/EN/TR/RO)
      managementFields.ts  Die 7 Managementfelder + ihre Kriterien-Zuordnung (aus den QET-Deckblättern)
      scopes.ts         Testarten-Logik: welche Kriterien/Schritte zu welcher Testart gehören
      types.ts          Gemeinsame Typen, u.a. TestScope (Gesamttest/Säule/Managementfeld), Locale
      i18n.ts           UI-Texte inkl. Abrechnungs-/Kundenservice-Mails, viersprachig
    sap/                SAP-Integrationsschicht (SuccessFactors/S4HANA-Adapter, OIDC-SSO, Export)
    scoring.ts          QET-Index-, Scope-Index-Berechnung & Aggregation über Testarten hinweg
    billing.ts          Tarifkurve/Preisberechnung, muss zum Stripe-Preis passen (siehe oben)
    stripe.ts           Lazy Stripe-Client
    crypto.ts           Verschlüsselung der SAP-Zugangsdaten (AES-256-GCM)
    auth.ts             NextAuth-Konfiguration (Admin-Login)
    mail.ts             E-Mail-Versand: Einladungen + Willkommen/Upgrade/Erinnerung/Zahlung fehlgeschlagen/Kündigung
    prisma.ts           Prisma-Client
prisma/
  schema.prisma         Datenmodell (Company inkl. Abrechnungsfelder, Invitee, Submission, AdminUser)
  seed.ts               Legt den ersten Admin-Zugang an
```

## Inhalte anpassen

Die 60 Kriterien samt Statements liegen vollständig in `src/lib/content/criteria.ts` – dort
lässt sich jede Formulierung in allen vier Sprachen direkt anpassen, ohne Code an anderer Stelle
ändern zu müssen. UI-Texte liegen entsprechend in `src/lib/content/i18n.ts`.

**Hinweis zu den türkischen und rumänischen Texten:** Sie wurden mit großer Sorgfalt übersetzt,
sollten aber vor dem produktiven Einsatz von einer Muttersprachlerin/einem Muttersprachler
gegengelesen werden.

**Marke/Logo:** `src/components/QetLogo.tsx` ist ein Vektor-Nachbau der QET-Wortmarke (Ring-„Q" +
„ET" + ®) aus den offiziellen QET-Unterlagen, oben rechts auf der Startseite platziert – keine
externe Bilddatei nötig, bleibt in jeder Auflösung scharf. `src/components/QetSymbol.tsx` ist ein
davon abgeleitetes, rein grafisches Symbol (dreigeteilter Ring in den Q/E/T-Farben, angelehnt an
den „QET-Zirkel" aus den Deckblättern) für Stellen, an denen kein Platz für die volle Wortmarke ist
oder kein sprachabhängiger Text funktionieren soll (z. B. der Kopfbereich der Umfrageseiten).

## SAP-Integration

Pro Firma optional aktivierbar (jede Firma hat ihr eigenes SAP-System – Einstellungen unter
„SAP-Integration einrichten" auf der jeweiligen Firmenseite im Admin-Bereich):

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
- E-Mail-Adresse bei der Registrierung verifizieren (aktuell ungeprüft)
- Rechnungen/Belege direkt im Dashboard auflisten (aktuell nur über das Stripe-Kundenportal)
