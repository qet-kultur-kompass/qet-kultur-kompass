import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/tokens";
import { createSession } from "@/lib/session";

const signupSchema = z.object({
  accountType: z.enum(["individual", "company"]),
  ownerName: z.string().min(1).max(200),
  ownerEmail: z.string().email().max(200),
  password: z.string().min(8).max(200),
  companyName: z.string().max(200).optional().nullable(),
});

// POST: Self-Service-Registrierung – KEIN Admin-Eingriff nötig. Legt eine
// Company (Einzelkunde oder Firma) samt Konto-Login an und erzeugt direkt
// einen eigenen Invitee-Datensatz für die registrierende Person selbst
// (isOwner: true), damit sie über denselben Mechanismus wie eingeladene
// Personen an der Befragung teilnehmen und danach ihr eigenes Ergebnis im
// persönlichen Dashboard wiederfinden kann.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.ownerEmail.toLowerCase().trim();

  if (parsed.data.accountType === "company" && !parsed.data.companyName?.trim()) {
    return NextResponse.json({ error: "company_name_required" }, { status: 400 });
  }

  const existing = await prisma.company.findUnique({ where: { ownerEmail: email } });
  if (existing) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const displayName =
    parsed.data.accountType === "company"
      ? parsed.data.companyName!.trim()
      : parsed.data.ownerName.trim();

  const company = await prisma.company.create({
    data: {
      name: displayName,
      accountType: parsed.data.accountType,
      ownerName: parsed.data.ownerName.trim(),
      ownerEmail: email,
      ownerPasswordHash: passwordHash,
      contactName: parsed.data.ownerName.trim(),
      contactEmail: email,
      surveyToken: generateToken(20),
      dashboardToken: generateToken(20),
      invitees: {
        create: {
          name: parsed.data.ownerName.trim(),
          email,
          role: parsed.data.accountType === "individual" ? "customer" : "employee",
          inviteToken: generateToken(20),
          source: "self_service",
          isOwner: true,
        },
      },
    },
    include: { invitees: true },
  });

  await createSession({ role: "owner", companyId: company.id });

  const ownInvite = company.invitees.find((i) => i.isOwner);

  return NextResponse.json(
    {
      ok: true,
      companyId: company.id,
      accountType: company.accountType,
      ownInviteToken: ownInvite?.inviteToken ?? null,
    },
    { status: 201 }
  );
}
