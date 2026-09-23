import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession } from "@/lib/session";
import { StrategyView, type GoalItem } from "@/components/StrategyView";

export const dynamic = "force-dynamic";

/**
 * Server-Einstiegspunkt für die persönliche Strategie/Zielsetzung (Task
 * "Strategie/Ziel-Feature"). Löst wie /api/mein-dashboard/strategy die
 * eigene Person auf (Owner -> eigener Invitee-Datensatz mit isOwner=true,
 * Employee -> direkt session.inviteeId) und lädt Ausrichtung + Ziele
 * bereits serverseitig, damit die Seite ohne Ladezustand rendert. Bewusst
 * eigenständig statt Logik mit /api/mein-dashboard/strategy zu teilen –
 * siehe die gleiche, bereits etablierte Duplizierung bei
 * /mein-dashboard/report/page.tsx.
 */
export default async function StrategiePage() {
  const session = await requireAnySelfServiceSession();
  if (!session) redirect("/login");

  let inviteeId: string | null = null;
  if (session.role === "employee") {
    inviteeId = session.inviteeId;
  } else {
    const owner = await prisma.invitee.findFirst({
      where: { companyId: session.companyId, isOwner: true },
      select: { id: true },
    });
    inviteeId = owner?.id ?? null;
  }

  if (!inviteeId) redirect("/mein-dashboard");

  const invitee = await prisma.invitee.findUnique({
    where: { id: inviteeId },
    include: { goals: { orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }] } },
  });
  if (!invitee) redirect("/mein-dashboard");

  const goals: GoalItem[] = invitee.goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    pillar: g.pillar as GoalItem["pillar"],
    dueDate: g.dueDate ? g.dueDate.toISOString() : null,
    status: g.status as GoalItem["status"],
    createdAt: g.createdAt.toISOString(),
  }));

  return <StrategyView intro={invitee.strategyIntro} goals={goals} />;
}
