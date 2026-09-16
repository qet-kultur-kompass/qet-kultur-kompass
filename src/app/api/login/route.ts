import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

// POST: vereinheitlichtes Login für Self-Service-Konten – deckt sowohl die
// Kontoinhaberin/den Kontoinhaber (Führungskraft/Auditor/Einzelkunde) als
// auch eine eingeladene Person ab, die sich zusätzlich zu ihrem Link ein
// eigenes Passwort eingerichtet hat (siehe /api/invite/[token]/set-password).
// Bewusst getrennt vom Admin-Login unter /admin/login (NextAuth).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  const owner = await prisma.company.findUnique({ where: { ownerEmail: email } });
  if (owner?.ownerPasswordHash) {
    const valid = await bcrypt.compare(parsed.data.password, owner.ownerPasswordHash);
    if (valid) {
      await createSession({ role: "owner", companyId: owner.id });
      return NextResponse.json({ ok: true, role: "owner" });
    }
  }

  // Mehrere Firmen könnten theoretisch dieselbe eingeladene E-Mail-Adresse
  // haben (z.B. eine Person, die bei zwei Kunden mitmacht) – daher über alle
  // Kandidaten mit gesetztem Passwort prüfen, nicht nur den ersten Treffer.
  const candidates = await prisma.invitee.findMany({
    where: { email, passwordHash: { not: null } },
  });
  for (const candidate of candidates) {
    if (!candidate.passwordHash) continue;
    const valid = await bcrypt.compare(parsed.data.password, candidate.passwordHash);
    if (valid) {
      await createSession({ role: "employee", inviteeId: candidate.id, companyId: candidate.companyId });
      return NextResponse.json({ ok: true, role: "employee" });
    }
  }

  return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
}
