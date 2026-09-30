import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { requireOwnerSession } from "@/lib/session";
import { priceForParticipants, tierNameForParticipants, ENTERPRISE_THRESHOLD, FREE_PARTICIPANT_LIMIT } from "@/lib/billing";

// POST /api/checkout – Bezahlfluss für QET Compass. Deckt DREI Fälle ab, siehe
// README Abschnitt "Bezahlung (Stripe)":
//
//  1) Kauf OHNE vorherige Registrierung ("startklar ohne Digistore24"):
//     companyName + ownerEmail + ownerName kommen aus dem Formular, die Firma
//     wird erst im Webhook (checkout.session.completed) angelegt, die Person
//     bekommt per E-Mail einen Link, um ihr Passwort zu setzen (siehe
//     /api/account-setup/[token] und src/lib/mail.ts sendWelcomeEmail).
//  2) Eingeloggte:r Konto-Inhaber:in OHNE laufendes Stripe-Abo (z.B. noch im
//     kostenlosen Plan) erweitert ihr/sein Kontingent -> ebenfalls ein neuer
//     Checkout-Session-Redirect.
//  3) Eingeloggte:r Konto-Inhaber:in MIT laufendem Stripe-Abo erweitert das
//     Kontingent -> KEIN neuer Checkout, sondern das bestehende Abo wird
//     direkt per Stripe-API aktualisiert (sonst entstünde ein zweites,
//     paralleles Abo und die Person würde doppelt belastet). Antwort in
//     diesem Fall: { mode: "updated" } statt { url }.
//
// Preisbildung: Es gibt bewusst KEINEN vorab in Stripe angelegten Preis
// (früher STRIPE_PRICE_ID) und KEINE manuelle Produkt-/Tarif-Anlage im
// Stripe-Dashboard. Der Preis pro Teilnehmer wird live aus derselben Formel
// berechnet wie auf der Landingpage (priceForParticipants in billing.ts) und
// bei jedem Checkout/Update als Stripe "price_data" mitgeschickt. Das hält
// Tarifrechner (Landingpage) und tatsächliche Abrechnung garantiert
// synchron – wird billing.ts geändert, stimmt die Abrechnung automatisch.
const checkoutSchema = z.object({
  participants: z.number().int().min(1).max(ENTERPRISE_THRESHOLD - 1),
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
  locale: z.enum(["de", "en", "tr", "ro"]).default("de"),
  // Nur nötig, wenn NICHT eingeloggt (Kauf ohne vorherige Registrierung):
  companyName: z.string().min(1).max(200).optional(),
  ownerName: z.string().min(1).max(200).optional(),
  ownerEmail: z.string().email().max(200).optional(),
});

// Stripe rechnet quantity (=Teilnehmerzahl) × unit_amount ab. Da unsere Kurve
// (priceForParticipants) NICHT linear pro Teilnehmer ist, wird hier der
// implizite Stückpreis für genau diese Teilnehmerzahl zurückgerechnet, damit
// quantity weiterhin überall (Webhook, Teilnehmerlimit-Durchsetzung,
// Dashboard-Anzeige) die tatsächliche Teilnehmerzahl bleibt.
function unitAmountCents(participants: number, interval: "monthly" | "yearly"): number {
  const monthlyTotal = priceForParticipants(participants);
  const total = interval === "yearly" ? monthlyTotal * 12 * 0.9 : monthlyTotal;
  return Math.round((total / participants) * 100);
}

// Automatische USt./VAT-Berechnung (EU-Reverse-Charge für B2B-Kunden
// inklusive). Nur aktiv, wenn Ralph "Stripe Tax" im Dashboard aktiviert UND
// STRIPE_TAX_ENABLED="true" gesetzt hat – ohne aktiviertes Stripe Tax würde
// Stripe hier einen Fehler werfen, siehe README "Bezahlung (Stripe)".
const TAX_ENABLED = process.env.STRIPE_TAX_ENABLED === "true";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { participants, locale } = parsed.data;

  if (participants >= ENTERPRISE_THRESHOLD) {
    return NextResponse.json({ error: "enterprise_scale_contact_sales" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://app.qet-compass.com";
  const tier = tierNameForParticipants(participants);
  const existingOwner = await requireOwnerSession();
  // Fall 3: bestehendes, laufendes Stripe-Abo -> direkt aktualisieren statt
  // ein zweites Abo zu erzeugen (proration_behavior sorgt für anteilige
  // Ab-/Zurechnung auf der nächsten Rechnung).
  if (existingOwner?.stripeSubscriptionId) {
    try {
      const subscription = await stripe().subscriptions.retrieve(existingOwner.stripeSubscriptionId);
      if (["active", "trialing", "past_due"].includes(subscription.status)) {
        const item = subscription.items.data[0];
        const currentInterval: "monthly" | "yearly" = item.price.recurring?.interval === "year" ? "yearly" : "monthly";
        const productId = typeof item.price.product === "string" ? item.price.product : item.price.product?.id;

        await stripe().subscriptions.update(existingOwner.stripeSubscriptionId, {
          items: [
            {
              id: item.id,
              quantity: participants,
              price_data: {
                currency: "eur",
                recurring: { interval: currentInterval === "yearly" ? "year" : "month" },
                unit_amount: unitAmountCents(participants, currentInterval),
                product: productId,
              },
            },
          ],
          proration_behavior: "create_prorations",
          automatic_tax: { enabled: TAX_ENABLED },
          metadata: { companyId: existingOwner.id, participants: String(participants), tier, locale },
        });

        // Lokal sofort spiegeln, damit das Dashboard nicht auf den Webhook
        // warten muss (der aktualisiert dieselben Felder ohnehin nochmal,
        // sobald Stripe "customer.subscription.updated" schickt).
        await prisma.company.update({
          where: { id: existingOwner.id },
          data: { participantLimit: participants, tier },
        });

        return NextResponse.json({ mode: "updated" });
      }
    } catch (err) {
      console.error("[checkout] Abo-Update fehlgeschlagen:", err);
      return NextResponse.json({ error: "stripe_error" }, { status: 502 });
    }
  }

  // Fall 1 & 2: neuer Checkout mit Redirect zu Stripe.
  const metadata: Record<string, string> = {
    participants: String(participants),
    tier,
    locale,
  };

  let customerId: string | undefined;

  if (existingOwner) {
    // Eingeloggt, aber noch kein (aktives) Stripe-Abo -> neuer Checkout.
    metadata.companyId = existingOwner.id;
    customerId = existingOwner.stripeCustomerId ?? undefined;
  } else {
    // Kauf ohne vorherige Registrierung.
    if (!parsed.data.companyName || !parsed.data.ownerName || !parsed.data.ownerEmail) {
      return NextResponse.json({ error: "signup_fields_required" }, { status: 400 });
    }
    const email = parsed.data.ownerEmail.toLowerCase().trim();
    const existingCompany = await prisma.company.findUnique({ where: { ownerEmail: email } });
    if (existingCompany) {
      return NextResponse.json({ error: "email_taken_please_login" }, { status: 409 });
    }
    metadata.companyName = parsed.data.companyName.trim();
    metadata.ownerName = parsed.data.ownerName.trim();
    metadata.ownerEmail = email;
  }

  const interval = parsed.data.interval;
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: !customerId ? (existingOwner?.ownerEmail ?? parsed.data.ownerEmail) : undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            recurring: { interval: interval === "yearly" ? "year" : "month" },
            unit_amount: unitAmountCents(participants, interval),
            product_data: { name: `QET Compass – ${tier}` },
          },
          quantity: participants,
        },
      ],
      allow_promotion_codes: true,
      automatic_tax: { enabled: TAX_ENABLED },
      tax_id_collection: { enabled: true },
      success_url: `${origin}/checkout/erfolg?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${existingOwner ? "mein-dashboard" : "start"}?checkout=canceled`,
      metadata,
      subscription_data: { metadata },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Stripe-Fehler:", err);
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}

// Kleine Hilfsroute für den Tarifrechner im Checkout-Formular, damit Frontend
// und Backend garantiert denselben Preis anzeigen/abrechnen (siehe billing.ts).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const n = Number(url.searchParams.get("participants") ?? FREE_PARTICIPANT_LIMIT);
  const participants = Number.isFinite(n) ? Math.max(1, Math.round(n)) : FREE_PARTICIPANT_LIMIT;
  return NextResponse.json({
    participants,
    priceMonthly: priceForParticipants(participants),
    tier: tierNameForParticipants(participants),
    isEnterprise: participants >= ENTERPRISE_THRESHOLD,
  });
}
