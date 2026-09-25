# QET Kultur-Kompass auf Digistore24 verkaufen — Einrichtungs-Checkliste

Der Code-seitige Teil (automatische Zugangsvergabe bei Kauf, Teilnehmer-Limit,
Sperrung bei Rückerstattung/Kündigung) ist fertig und deployt. Was jetzt noch
fehlt, sind Schritte **in deinem Digistore24-Account**, die nur du machen
kannst (Login, Auszahlungs-/Steuerdaten, endgültige Veröffentlichung).

## 1. Environment-Variablen in Vercel setzen

Vercel-Projekt → Settings → Environment Variables:

| Variable | Wert |
|---|---|
| `DIGISTORE24_IPN_PASSPHRASE` | siehe Schritt 3 – erst NACH dem Anlegen dort verfügbar |
| `NEXT_PUBLIC_APP_URL` | `https://<deine-produktions-domain>` (ohne Slash am Ende) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | falls noch nicht gesetzt – ohne diese beiden bekommt ein Käufer NACH der Zahlung keine automatische Willkommens-Mail mit Zugangslink, sondern du müsstest ihn manuell aus dem Admin-Bereich nachschicken |

## 2. Produkt(e) in Digistore24 anlegen

Digistore24 verkauft feste Preisstufen, keinen frei eingebbaren
"beliebige Teilnehmerzahl"-Rechner. Empfehlung: 5 Teilnehmer-Stufen × 2
Abrechnungsarten = **10 Produkte** (oder leg erstmal nur 2–3 Stufen an und
ergänze später – der Code unterstützt beliebig viele).

Preise exakt aus dem Preismodell (`QET_Preismodell.xlsx`, Potenz-Interpolation
14,90 € bei 1 Teilnehmer bis 3,90 € bei 1.000.000 Teilnehmern):

| Stufe | Monatlich (netto) | Jährlich, Vorkasse −10 % (netto) |
|---|---|---|
| 1 Teilnehmer | 14,90 € | 160,92 € |
| bis 10 Teilnehmer | 119,17 € | 1.287,03 € |
| bis 50 Teilnehmer | 509,71 € | 5.504,85 € |
| bis 250 Teilnehmer | 2.180,11 € | 23.545,14 € |
| bis 1.000 Teilnehmer | 7.622,99 € | 82.328,31 € |

Für jedes Produkt in Digistore24:

1. **Produktart**: "Software" oder "Mitgliederbereich/Abo" (Digistore24 →
   Produkte → Neues Produkt).
2. **Preis/Abrechnung**: monatlich wiederkehrend bzw. "einmalig" für die
   Jahres-Vorkasse-Variante; Mindestlaufzeit 12 Monate bei den monatlichen
   Produkten in den Abo-Einstellungen setzen (bitte bei Digistore24-Support
   verifizieren, wie genau sich das dort abbilden lässt).
3. **Auslieferung/"Deliver"-Tab**: "Kunde erhält KEINE automatischen
   Download-Dateien" wählen (Zugang kommt per E-Mail von unserem System,
   nicht von Digistore24 selbst).
4. Nach dem Speichern zeigt Digistore24 die **Produkt-ID** an. Diese ID in
   `src/lib/digistore24.ts` bei `DIGISTORE24_PRODUCTS` eintragen — dort
   stehen aktuell Platzhalter (`REPLACE_ME__…`), die durch die echten IDs
   ersetzt werden müssen, sonst wird ein Kauf zwar registriert, aber KEIN
   Zugang automatisch angelegt.

### Fertige Texte zum Einfügen (Produktseite)

**Produktname:**
QET Kultur-Kompass — Die 12-Monats-Kulturreise

**Kurzbeschreibung/Subline:**
Misst den Status quo der Unternehmenskultur anhand von 60 Kriterien
(Qualität, Ethik, Transparenz) — mit persönlicher Auswertung für jede Person
und einem zentralen Firmen-Dashboard.

**Beschreibung (Fließtext):**
Der QET Kultur-Kompass begleitet Ihr Unternehmen durch eine 12-monatige
Kulturreise. Mitarbeitende, Kunden und Geschäftspartner bewerten pro
Kriterium ihre Einschätzung über einfache Schieberegler — je 20 Kriterien in
den drei Säulen Qualität, Ethik und Transparenz. Jede Person sieht sofort ihr
persönliches Ergebnis mit Diagrammen und QET-Index; alle Einreichungen einer
Firma laufen automatisch und anonymisiert in einem zentralen Dashboard
zusammen, das Stärken, Lücken und konkrete Handlungsfelder sichtbar macht.

Nach dem Kauf erhalten Sie sofort per E-Mail Ihren persönlichen Zugang und
können direkt Ihr Team einladen.

## 3. IPN-Verbindung einrichten

Digistore24 → Mein Digistore24 → IPN-Konfiguration → "Generische IPN
hinzufügen":

- **URL**: `https://<deine-produktions-domain>/api/webhooks/digistore24`
- **Passphrase**: von Digistore24 generieren lassen (oder selbst ein langes
  Zufalls-Secret eintragen) — diesen Wert danach 1:1 als
  `DIGISTORE24_IPN_PASSPHRASE` in Vercel setzen.
- **Events aktivieren**: mindestens `on_payment`, `on_refund`,
  `on_chargeback`, `on_rebill_cancelled`, `last_paid_day`. `payment_denial`
  ist standardmäßig nicht aktiv — kann optional dazu.

Danach in Digistore24 auf **"Test-IPN senden"** klicken. Das ist der Moment,
an dem sich zeigt, ob die Signaturprüfung (`src/lib/digistore24.ts`) exakt zu
Digistore24s Implementierung passt — der Code wurde aus Digistore24s eigener
Referenz-Dokumentation nachgebaut, aber noch nicht gegen einen echten Aufruf
verifiziert. Schlägt der Test fehl (401 `invalid_signature`), bitte den
Log-Auszug von Digistore24 zusammen mit der Fehlermeldung an mich
zurückgeben — das lässt sich dann gezielt nachjustieren.

## 4. End-to-End testen

1. Digistore24 bietet einen Testkauf-Modus (Sandbox/Testbestellung) — damit
   einmal einen kompletten Kauf für die günstigste Stufe durchspielen.
2. Prüfen: kommt die Willkommens-Mail an? Funktioniert der Aktivierungslink
   (Passwort setzen → landet im Dashboard)?
3. Im Dashboard: Teilnehmer bis zum Limit einladen, prüfen, dass beim
   Überschreiten die Meldung "Teilnehmerlimit erreicht" erscheint statt
   einer weiteren Einladung.
4. Testkauf in Digistore24 stornieren/erstatten, prüfen, dass der Zugang
   danach gesperrt ist (`isActive: false` → Links zeigen "deaktiviert").

## Was das NICHT abdeckt (bewusst außen vor gelassen)

- **Self-Hosted/Docker-Vertrieb** (Kunde betreibt die Software auf eigenem
  Server) bleibt ein separates, größeres Projekt — das hier Gebaute verkauft
  Zugang zur bestehenden, von dir gehosteten Version.
- **SAP-Sync-Firmen** (`src/lib/sap/sync.ts`) sind weiterhin unbegrenzt, da
  das typischerweise Individualverträge außerhalb von Digistore24 sind.
- **USt./Rechnungsstellung/Merchant-of-Record-Details**: bitte direkt mit
  Digistore24-Support klären, dazu kann ich keine verlässliche Auskunft
  geben.
