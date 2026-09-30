import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEnterpriseLeadConfirmation, sendEnterpriseLeadNotification } from "@/lib/mail";

// POST /api/enterprise-contact – Ersetzt den bisherigen bloßen "mailto"-Link
// auf der Enterprise-Kachel (500+ Teilnehmende) der Landingpage. Bewusst KEIN
// automatischer Stripe-Checkout hier: Enterprise-Preise werden individuell
// verhandelt, das bleibt ein persönlicher Vertriebsschritt. Automatisiert
// wird stattdessen die Kommunikation drumherum: Ralph bekommt sofort eine
// Benachrichtigung, die anfragende Person eine Eingangsbestätigung – siehe
// README "Bezahlung (Stripe)".
const enterpriseContactSchema = z.object({
  companyName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(200),
  contactEmail: z.string().email().max(200),
  participants: z.number().int().min(1).max(100000),
  message: z.string().max(2000).optional(),
  locale: z.enum(["de", "en", "tr", "ro"]).default("de"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = enterpriseContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { companyName, contactName, contactEmail, participants, message, locale } = parsed.data;

  const [notifyResult, confirmResult] = await Promise.all([
    sendEnterpriseLeadNotification({ companyName, contactName, contactEmail: contactEmail.toLowerCase().trim(), participants, message }),
    sendEnterpriseLeadConfirmation({ to: contactEmail.toLowerCase().trim(), companyName, participants, locale }),
  ]);

  // Auch ohne konfigurierten E-Mail-Versand (RESEND_API_KEY fehlt) geben wir
  // der anfragenden Person Erfolg zurück, damit das Formular nicht wie
  // kaputt wirkt – Ralph sieht die Anfrage in diesem Fall nur nicht per Mail,
  // siehe README für den Hinweis, RESEND_API_KEY zu setzen.
  return NextResponse.json({ ok: true, notified: notifyResult.sent, confirmed: confirmResult.sent });
}
