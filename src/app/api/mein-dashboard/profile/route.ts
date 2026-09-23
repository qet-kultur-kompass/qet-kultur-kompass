import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession } from "@/lib/session";

/**
 * Self-Service-Profilbearbeitung: die eingeloggte Person (Konto-Inhaber:in
 * ODER eingeladene Person) kann den eigenen Anzeigenamen selbst ändern –
 * kein Admin-Eingriff nötig (siehe /api/companies/[id] für den bisherigen,
 * admin-only Weg). Konto-Inhaber:innen mit echtem Firmenkonto
 * (accountType === "company") können zusätzlich den Firmennamen anpassen,
 * aber ausschließlich für die eigene Firma – die companyId kommt bewusst
 * aus der Session, nicht aus dem Request-Body.
 */
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  companyName: z.string().trim().min(2).max(160).optional(),
});

export async function PATCH(req: Request) {
  const session = await requireAnySelfServiceSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { name, companyName } = parsed.data;

  if (session.role === "owner") {
    const data: { ownerName: string; name?: string } = { ownerName: name };
    if (companyName) data.name = companyName;
    const company = await prisma.company.update({ where: { id: session.companyId }, data });
    return NextResponse.json({ name: company.ownerName || company.name, companyName: company.name });
  }

  // role === "employee": nur der eigene Anzeigename ist editierbar – der
  // Firmenname gehört der Firma, nicht der eingeladenen Person.
  const invitee = await prisma.invitee.update({
    where: { id: session.inviteeId },
    data: { name },
    include: { company: true },
  });
  return NextResponse.json({ name: invitee.name || invitee.email || "", companyName: invitee.company.name });
}

