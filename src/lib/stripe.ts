import Stripe from "stripe";

let cached: Stripe | null = null;

/** Lazily erzeugter Stripe-Client. Wirft erst beim ersten echten Aufruf
 * (nicht beim Import/Build), damit Vercel-Builds nicht scheitern, solange
 * STRIPE_SECRET_KEY noch nicht gesetzt ist – siehe README, Abschnitt
 * "Bezahlung (Stripe)". */
export function stripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY ist nicht gesetzt. Bitte in den Vercel-Umgebungsvariablen hinterlegen " +
        "(siehe README, Abschnitt „Bezahlung (Stripe)“)."
    );
  }
  cached = new Stripe(key, { apiVersion: "2024-06-20" });
  return cached;
}
