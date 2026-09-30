import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireOwnerSession } from "@/lib/session";

// POST /api/billing/portal – öffnet das Stripe-Kundenportal für die/den
// eingeloggte:n Konto-Inhaber:in: Zahlungsmethode aktualisieren, Rechnungen
// einsehen, Abo kündigen. Das eigentliche Erweitern des Teilnehmerkontingents
// läuft bewusst NICHT über das Portal (Stripe unterstützt dort keine freie
// Mengenänderung mit unserem gestaffelten Preis), sondern über /api/checkout
// ("mehrfach bestellen" auf der Landingpage/im Dashboard).
export async function POST(req: Request) {
  const company = await requireOwnerSession();
  if (!company) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!company.stripeCustomerId) {
    return NextResponse.json({ error: "no_stripe_customer" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://app.qet-compass.com";

  try {
    const portalSession = await stripe().billingPortal.sessions.create({
      customer: company.stripeCustomerId,
      return_url: `${origin}/mein-dashboard`,
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[billing/portal] Stripe-Fehler:", err);
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}
