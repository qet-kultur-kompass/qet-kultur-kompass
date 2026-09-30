// Tarif-/Abrechnungsmodell für QET Compass.
//
// Diese Stützpunkte MÜSSEN mit dem Tarifrechner auf der Marketing-Landingpage
// (qet-compass.com) übereinstimmen – siehe README, Abschnitt "Bezahlung
// (Stripe)". Die Abrechnung selbst liest diese Werte direkt zur Laufzeit aus
// (src/app/api/checkout/route.ts, priceForParticipants) und schickt sie als
// Stripe "price_data" mit, es gibt also keinen zweiten Ort (keinen manuell in
// Stripe angelegten Preis), der veralten könnte – wird hier etwas geändert,
// zieht die Abrechnung automatisch mit.

// Self-Service-Registrierung über /start bleibt bewusst kostenlos möglich
// ("Kostenlos starten"), aber begrenzt auf diese Teilnehmerzahl – erst
// darüber hinaus ist ein bezahltes Abo (oder ein von Ralph manuell
// freigeschalteter Zugang) nötig.
export const FREE_PARTICIPANT_LIMIT = 3;

export interface TierPoint {
  participantLimit: number;
  priceMonthly: number; // EUR, wie auf der Landingpage angezeigt
  tierName: string;
}

export const TIER_POINTS: TierPoint[] = [
  { participantLimit: 1, priceMonthly: 14.9, tierName: "Solo" },
  { participantLimit: 3, priceMonthly: 49, tierName: "Mikro" },
  { participantLimit: 6, priceMonthly: 79, tierName: "Klein" },
  { participantLimit: 10, priceMonthly: 129, tierName: "Team" },
  { participantLimit: 15, priceMonthly: 179, tierName: "Team+" },
  { participantLimit: 25, priceMonthly: 279, tierName: "Wachstum" },
  { participantLimit: 40, priceMonthly: 429, tierName: "Wachstum+" },
  { participantLimit: 60, priceMonthly: 619, tierName: "Pro" },
  { participantLimit: 100, priceMonthly: 979, tierName: "Business" },
];

// Ab hier (und bis) zeigt die Landingpage den Button "Enterprise-Angebot
// anfragen" statt eines Preises – kein Selfservice-Checkout mehr.
export const ENTERPRISE_THRESHOLD = 500;

// € je zusätzlichem Teilnehmer oberhalb von 100, entspricht der
// Pro→Business-Steigung auf der Landingpage (linear extrapoliert).
const EXTRAPOLATION_SLOPE_PER_SEAT = 9;

/** Interpolierter/extrapolierter Monatspreis für n Teilnehmer (1..500),
 * identisch zur Rechenlogik des Tarifrechners auf der Landingpage. */
export function priceForParticipants(n: number): number {
  const clamped = Math.max(1, Math.min(n, ENTERPRISE_THRESHOLD));
  const last = TIER_POINTS[TIER_POINTS.length - 1];

  if (clamped <= last.participantLimit) {
    for (let i = 0; i < TIER_POINTS.length - 1; i++) {
      const a = TIER_POINTS[i];
      const b = TIER_POINTS[i + 1];
      if (clamped >= a.participantLimit && clamped <= b.participantLimit) {
        const ratio = (clamped - a.participantLimit) / (b.participantLimit - a.participantLimit);
        return a.priceMonthly + ratio * (b.priceMonthly - a.priceMonthly);
      }
    }
  }
  return last.priceMonthly + (clamped - last.participantLimit) * EXTRAPOLATION_SLOPE_PER_SEAT;
}

/** Anzeigename des Tarifs, der zu n Teilnehmern gehört (rein informativ). */
export function tierNameForParticipants(n: number): string {
  if (n >= ENTERPRISE_THRESHOLD) return "Enterprise";
  const last = TIER_POINTS[TIER_POINTS.length - 1];
  if (n > last.participantLimit) return last.tierName;
  const found = [...TIER_POINTS].reverse().find((p) => n >= p.participantLimit);
  return found?.tierName ?? TIER_POINTS[0].tierName;
}
