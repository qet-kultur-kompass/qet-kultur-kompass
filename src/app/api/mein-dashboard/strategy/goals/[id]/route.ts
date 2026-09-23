import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession, type SessionPayload } from "@/lib/session";

/**
 * Bearbeiten/Löschen eines einzelnen persönlichen Ziels (siehe
 * /api/mein-dashboard/strategy/goals für das Anlegen). Der Zugriff wird
 * IMMER über die eigene inviteeId geprüft (nie über die id aus der URL
 * allein) – so kann niemand ein fremdes Ziel bearbeiten, selbst wenn die
 * ID erraten würde.
 */
async function resolveInviteeId(session: SessionPayload): Promise<string | null> {
  if (session.role === "employee") return session.inviteeId;
  const owner = await prisma.invitee.findFirst({
    where: { companyId: session.companyId, isOwner: true },
    select: { id: true },
  });
  return owner?.id ?? null;
}

const schema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  pillar: z.enum(["Q", "E", "T"]).nullable().optional(),
  dueDate: z.string().max(40).nullable().optional(),
  status: z.enum(["open", "in_progress", "done"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAnySelfServiceSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const inviteeId = await resolveInviteeId(session);
  if (!inviteeId) return NextResponse.json({ error: "no_invitee" }, { status: 400 });

  const existing = await prisma.goal.findUnique({ where: { id: params.id } });
  if (!existing || existing.inviteeId !== inviteeId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { title, description, pillar, dueDate, status } = parsed.data;

  let parsedDate: Date | null | undefined = undefined;
  if (dueDate !== undefined) {
    parsedDate = dueDate ? new Date(dueDate) : null;
    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "invalid_date" }, { status: 400 });
    }
  }

  const goal = await prisma.goal.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(pillar !== undefined ? { pillar } : {}),
      ...(parsedDate !== undefined ? { dueDate: parsedDate } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });

  return NextResponse.json({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    pillar: goal.pillar,
    dueDate: goal.dueDate ? goal.dueDate.toISOString() : null,
    status: goal.status,
    createdAt: goal.createdAt.toISOString(),
  });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAnySelfServiceSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const inviteeId = await resolveInviteeId(session);
  if (!inviteeId) return NextResponse.json({ error: "no_invitee" }, { status: 400 });

  const existing = await prisma.goal.findUnique({ where: { id: params.id } });
  if (!existing || existing.inviteeId !== inviteeId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await prisma.goal.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

