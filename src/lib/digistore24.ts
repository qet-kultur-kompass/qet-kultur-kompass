import { createHash, timingSafeEqual } from "crypto";

// --- Signaturprüfung -----------------------------------------------------
// Reproduziert den von Digistore24 veröffentlichten sha_sign-Referenz-
// Algorithmus (siehe digistore24.com/download/ipn/examples/ipn/sha_sign.php):
//  1. "sha_sign"/"SHASIGN" aus den Parametern entfernen
//  2. übrige Keys alphabetisch (case-sensitiv) sortieren
//  3. je nicht-leerem Wert: GROSSGESCHRIEBENER_KEY=wert + Passphrase anhängen
//     (Arrays: jedes Element einzeln URL-kodiert + Passphrase)
//  4. SHA-512 über die Gesamt-Zeichenkette, in Großbuchstaben als Hex
//
// WICHTIG: Vor dem Live-Schalten unbedingt mit einer echten Test-IPN
// verifizieren (Digistore24-Dashboard → Mein Digistore24 → IPN-Konfiguration
// → "Test-IPN senden") – dieser Code wurde aus Digistore24s eigener
// Referenz-Doku rekonstruiert, nicht aus einem tatsächlichen Testlauf gegen
// Ralphs Account. Schlägt die Prüfung fehl, zuerst hier ansetzen, bevor an
// der restlichen Logik etwas verändert wird.
export function computeDigistore24Signature(
    params: Record<string, string | string[] | undefined>,
    passphrase: string
  ): string {
    const keys = Object.keys(params)
          .filter((k) => k !== "sha_sign" && k !== "SHASIGN")
          .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    let str = "";
    for (const key of keys) {
          const value = params[key];
          if (value === undefined || value === null || value === "") continue;
          if (Array.isArray(value)) {
                  for (const el of value) {
                            if (!el) continue;
                            str += `${encodeURIComponent(el)}${passphrase}`;
                  }
          } else {
                  str += `${key.toUpperCase()}=${value}${passphrase}`;
          }
    }
    return createHash("sha512").update(str, "utf8").digest("hex").toUpperCase();
}

export function verifyDigistore24Signature(
    params: Record<string, string | string[] | undefined>,
    passphrase: string
  ): boolean {
    const received = (params["sha_sign"] as string) || (params["SHASIGN"] as string) || "";
    if (!received) return false;
    const expected = computeDigistore24Signature(params, passphrase);
    const a = Buffer.from(received.toUpperCase());
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}

// --- Produkt-/Preisstufen-Zuordnung --------------------------------------
// Bildet Digistore24-"product_id"-Werte auf das im QET-System zu setzende
// Teilnehmer-Limit ab. Die tatsächlichen product_id-Werte gibt es erst, wenn
// die Produkte in Digistore24 angelegt wurden (Digistore24 → Produkt →
// Feld "Produkt-ID") – bis dahin sind die Keys hier PLATZHALTER, siehe
// DIGISTORE24_SETUP.md. Preise/Stufen entsprechen QET_Preismodell.xlsx
// (Tab "Preisrechner": Preis(N) = 14,90 € × (N/1)^b, b = ln(3,90/14,90)/ln(1.000.000)).
export type Digistore24Plan = {
    participantLimit: number;
    label: string;
    billing: "monthly" | "yearly";
};

export const DIGISTORE24_PRODUCTS: Record<string, Digistore24Plan> = {
    "REPLACE_ME__1_MONTHLY": { participantLimit: 1, label: "1 Teilnehmer – monatlich", billing: "monthly" },
        "REPLACE_ME__1_YEARLY": { participantLimit: 1, label: "1 Teilnehmer – jährlich (Vorkasse)", billing: "yearly" },
            "REPLACE_ME__10_MONTHLY": { participantLimit: 10, label: "bis 10 Teilnehmer – monatlich", billing: "monthly" },
                "REPLACE_ME__10_YEARLY": { participantLimit: 10, label: "bis 10 Teilnehmer – jährlich (Vorkasse)", billing: "yearly" },
                    "REPLACE_ME__50_MONTHLY": { participantLimit: 50, label: "bis 50 Teilnehmer – monatlich", billing: "monthly" },
                        "REPLACE_ME__50_YEARLY": { participantLimit: 50, label: "bis 50 Teilnehmer – jährlich (Vorkasse)", billing: "yearly" },
                            "REPLACE_ME__250_MONTHLY": { participantLimit: 250, label: "bis 250 Teilnehmer – monatlich", billing: "monthly" },
                                "REPLACE_ME__250_YEARLY": { participantLimit: 250, label: "bis 250 Teilnehmer – jährlich (Vorkasse)", billing: "yearly" },
                                    "REPLACE_ME__1000_MONTHLY": { participantLimit: 1000, label: "bis 1.000 Teilnehmer – monatlich", billing: "monthly" },
                                        "REPLACE_ME__1000_YEARLY": { participantLimit: 1000, label: "bis 1.000 Teilnehmer – jährlich (Vorkasse)", billing: "yearly" },
};

export function resolveDigistore24Plan(productId: string | undefined): Digistore24Plan | null {
    if (!productId) return null;
    return DIGISTORE24_PRODUCTS[productId] ?? null;
}

// Events, bei denen der Zugang gesperrt werden soll (Company.isActive=false),
// weil die Zahlung ausgeblieben/storniert/erstattet wurde. "on_payment_missed"
// bewusst NICHT enthalten – Digistore24 versucht dabei noch mehrfach erneut
// abzubuchen, siehe on_payment_missed vs. last_paid_day in der Doku.
export const DIGISTORE24_DEACTIVATION_EVENTS = new Set([
    "on_refund",
    "on_chargeback",
    "on_rebill_cancelled",
    "last_paid_day",
  ]);
