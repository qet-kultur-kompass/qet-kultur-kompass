import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminOrOwnerSession } from "@/lib/adminGuard";
import { generateToken } from "@/lib/tokens";
import { sendInviteEmail } from "@/lib/mail";
import { canAddParticipant } from "@/lib/participantLimit";
import type { Locale } from "@/lib/content/types";

const createSchema = z.object({
  name: z.string().max(200).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.literal("")),
  department: z.string().max(200).optional().nullable(),
  role: z.enum(["employee", "customer", "partner"]).default("employee"),
  // Wenn gesetzt und eine E-Mail-Adresse vorhanden ist: versucht, die
  // Einladung direkt per Mail zu verschicken (siehe src/lib/mail.ts) –
  // funktioniert nur, wenn RESEND_API_KEY/RESEND_FROM_EMAIL konfiguriert
  // sind, sonst wird einfach nur der Link angelegt (wie bisher).
  sendEmail: z.boolean().optional(),
  locale: z.enum(["de", "en", "tr"]).optional(),
});

// POST: legt manuell eine personalisierte Einladung an (Alternative/Ergänzung
// zum SAP-Sync, z.B. für Kunden/Geschäftspartner oder Firmen ohne SAP).
// Erreichbar sowohl für den Admin (Ralph) als auch für die selbst
// registrierte Kontoinhaberin/den Kontoinhaber der jeweiligen Firma.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const access = await requireAdminOrOwnerSession(params.id);
  if (!access) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

    // Lizenz-/Preisstufen-Grenze (z.B. aus einem Digistore24-Kauf) durchsetzen
    // – siehe src/lib/participantLimit.ts. Firmen ohne gesetztes Limit
    // (participantLimit === null) sind unbegrenzt, wie bisher.
    const limitCheck = await canAddParticipant(params.id);
    if (!limitCheck.allowed) {
          return NextResponse.json(
            { error: "participant_limit_reached", used: limitCheck.used, limit: limitCheck.limit },
            { status: 403 }
                );
    }
  const invitee = await prisma.invitee.create({
    data: {
      companyId: params.id,
      name: parsed.data.name || null,
      email: parsed.data.email || null,
      department: parsed.data.department || null,
      role: parsed.data.role,
      inviteToken: generateToken(20),
      source: "manual",
    },
  });

  let emailResult: { sent: boolean; reason?: string } | null = null;
  if (parsed.data.sendEmail && invitee.email) {
    const company = await prisma.company.findUnique({ where: { id: params.id } });
    const origin = new URL(req.url).origin;
    emailResult = await sendInviteEmail({
      to: invitee.email,
      companyName: company?.name ?? "",
      inviteUrl: `${origin}/invite/${invitee.inviteToken}`,
      locale: (parsed.data.locale ?? "de") as Locale,
    });
  }

  return NextResponse.json({ invitee, emailResult }, { status: 201 });
}
