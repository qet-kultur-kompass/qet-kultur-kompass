import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession, type SessionPayload } from "@/lib/session";

/**
 * Persönliche Notizen/Todos je Kriterium ("eckige" Erledigt-Checkbox +
 * Freitext, siehe CriterionNoteCell.tsx). Ausschließlich für eingeloggte
 * Self-Service-Personen (Konto-Inhaber:in ODER eingeladene Person) – rein
 * privat, nie Teil der Firmen-Aggregation. Anonyme Ansichten (öffentlicher
 * Umfrage-Link, öffentliches Firmen-Dashboard) bekommen konsequent 401 und
 * blenden die Notiz-Bedienelemente dann clientseitig einfach aus.
 */
async function resolveInviteeId(session: SessionPayload): Promise<string | null> {
  if (session.role === "employee") return session.inviteeId;
  const owner = await prisma.invitee.findFirst({
    where: { companyId: session.companyId, isOwner: true },
    select: { id: true },
  });
  return owner?.id ?? null;
}

export async function GET() {
  const session = await requireAnySelfServiceSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const inviteeId = await resolveInviteeId(session);
  if (!inviteeId) return NextResponse.json({ notes: {} });

  const rows = await prisma.criterionNote.findMany({ where: { inviteeId } });
  const notes: Record<string, { text: string; done: boolean }> = {};
  for (const row of rows) {
    notes[row.criterionId] = { text: row.text, done: row.done };
  }
  return NextResponse.json({ notes });
}

const schema = z.object({
  criterionId: z.string().min(1).max(20),
  text: z.string().max(2000).optional(),
  done: z.boolean().optional(),
});

/** Upsert einer einzelnen Notiz. `text`/`done` sind beide optional, damit
 * das Umschalten der Checkbox und das Speichern des Freitexts als getrennte
 * Requests funktionieren, ohne sich gegenseitig zu überschreiben. Ist nach
 * dem Merge weder Text noch "erledigt" gesetzt, wird der Datensatz wieder
 * gelöscht statt eine leere Zeile zu behalten. */
export async function PUT(req: Request) {
  const session = await requireAnySelfServiceSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const inviteeId = await resolveInviteeId(session);
  if (!inviteeId) return NextResponse.json({ error: "no_invitee" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const { criterionId, text, done } = parsed.data;

  const existing = await prisma.criterionNote.findUnique({
    where: { inviteeId_criterionId: { inviteeId, criterionId } },
  });

  const nextText = text !== undefined ? text : existing?.text ?? "";
  const nextDone = done !== undefined ? done : existing?.done ?? false;

  if (!nextText.trim() && !nextDone) {
    if (existing) await prisma.criterionNote.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true });
  }

  await prisma.criterionNote.upsert({
    where: { inviteeId_criterionId: { inviteeId, criterionId } },
    create: { inviteeId, criterionId, text: nextText, done: nextDone },
    update: { text: nextText, done: nextDone },
  });

  return NextResponse.json({ ok: true });
}

