import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

// Konto-Einrichtung für Personen, die OHNE vorherige Registrierung direkt
// über den Checkout gekauft haben (siehe webhooks/stripe/route.ts,
// handleCheckoutCompleted). Der Token kommt aus der Willkommens-E-Mail
// (sendWelcomeEmail) und ist ACCOUNT_SETUP_TOKEN_VALID_HOURS gültig.

// GET: prüft den Token und liefert den Firmennamen für die Begrüßung, ohne
// bereits etwas zu ändern.
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const company = await prisma.company.findUnique({ where: { accountSetupToken: params.token } });
  if (!company || !company.accountSetupTokenExpiresAt || company.accountSetupTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "invalid_or_expired" }, { status: 404 });
  }
  return NextResponse.json({ companyName: company.name, ownerEmail: company.ownerEmail });
}

const setupSchema = z.object({ password: z.string().min(8).max(200) });

// POST: setzt das Passwort, verbraucht den Token und loggt die Person direkt ein.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const company = await prisma.company.findUnique({ where: { accountSetupToken: params.token } });
  if (!company || !company.accountSetupTokenExpiresAt || company.accountSetupTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "invalid_or_expired" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.company.update({
    where: { id: company.id },
    data: {
      ownerPasswordHash: passwordHash,
      accountSetupToken: null,
      accountSetupTokenExpiresAt: null,
    },
  });

  // Passwort auch auf dem zugehörigen Owner-Invitee-Datensatz spiegeln, damit
  // /login konsistent bleibt, falls die Person sich künftig darüber statt
  // über /mein-dashboard-Session anmeldet.
  await prisma.invitee.updateMany({
    where: { companyId: company.id, isOwner: true },
    data: { passwordHash },
  });

  await createSession({ role: "owner", companyId: company.id });

  return NextResponse.json({ ok: true });
}
