import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession, type SessionPayload } from "@/lib/session";

/**
 * Persönliche Strategie/Zielsetzung: liefert (GET) bzw. speichert (PATCH)
 * ausschließlich die freie strategische Ausrichtung der eingeloggten Person
 * (Konto-Inhaber:in ODER eingeladene Person) – rein privat, wie
 * CriterionNote nie Teil der Firmen-Aggregation. Die einzelnen Ziele selbst
 * werden über /api/mein-dashboard/strategy/goals verwaltet (siehe dort).
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
  if (!inviteeId) return NextResponse.json({ intro: "", goals: [] });

  const [invitee, goals] = await Promise.all([
    prisma.invitee.findUnique({ where: { id: inviteeId }, select: { strategyIntro: true } }),
    prisma.goal.findMany({ where: { inviteeId }, orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }] }),
  ]);

  return NextResponse.json({
    intro: invitee?.strategyIntro ?? "",
    goals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      pillar: g.pillar,
      dueDate: g.dueDate ? g.dueDate.toISOString() : null,
      status: g.status,
      createdAt: g.createdAt.toISOString(),
    })),
  });
}

const schema = z.object({
  intro: z.string().max(4000),
});

export async function PATCH(req: Request) {
  const session = await requireAnySelfServiceSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const inviteeId = await resolveInviteeId(session);
  if (!inviteeId) return NextResponse.json({ error: "no_invitee" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  await prisma.invitee.update({ where: { id: inviteeId }, data: { strategyIntro: parsed.data.intro } });
  return NextResponse.json({ ok: true });
}

