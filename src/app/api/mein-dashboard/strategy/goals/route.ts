import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession, type SessionPayload } from "@/lib/session";

/**
 * Anlegen neuer persönlicher Ziele (siehe /api/mein-dashboard/strategy für
 * die strategische Ausrichtung und [id]/route.ts für Bearbeiten/Löschen
 * eines einzelnen Ziels). Rein privat, wie CriterionNote nie Teil der
 * Firmen-Aggregation.
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
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional(),
  pillar: z.enum(["Q", "E", "T"]).nullable().optional(),
  dueDate: z.string().max(40).nullable().optional(),
});

export async function POST(req: Request) {
  const session = await requireAnySelfServiceSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const inviteeId = await resolveInviteeId(session);
  if (!inviteeId) return NextResponse.json({ error: "no_invitee" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { title, description, pillar, dueDate } = parsed.data;

  const parsedDate = dueDate ? new Date(dueDate) : null;
  if (parsedDate && Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "invalid_date" }, { status: 400 });
  }

  const goal = await prisma.goal.create({
    data: {
      inviteeId,
      title,
      description: description ?? "",
      pillar: pillar ?? null,
      dueDate: parsedDate,
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

