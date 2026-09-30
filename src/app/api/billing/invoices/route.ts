import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireOwnerSession } from "@/lib/session";

// GET /api/billing/invoices – letzte Rechnungen der/des eingeloggten
// Konto-Inhaberin/Inhabers, direkt aus Stripe (kein eigener Datenspeicher
// nötig, Stripe bleibt "source of truth"). Zeigt jeweils Betrag, Status,
// Datum sowie Links auf die gehostete Stripe-Rechnung und die PDF-Datei –
// siehe README, Abschnitt "Bezahlung (Stripe)".
export async function GET() {
  const company = await requireOwnerSession();
  if (!company) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!company.stripeCustomerId) return NextResponse.json({ invoices: [] });

  try {
    const invoices = await stripe().invoices.list({ customer: company.stripeCustomerId, limit: 12 });
    return NextResponse.json({
      invoices: invoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amountPaid: inv.amount_paid,
        currency: inv.currency,
        created: inv.created,
        hostedInvoiceUrl: inv.hosted_invoice_url,
        invoicePdf: inv.invoice_pdf,
      })),
    });
  } catch (err) {
    console.error("[billing/invoices] Stripe-Fehler:", err);
    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}
