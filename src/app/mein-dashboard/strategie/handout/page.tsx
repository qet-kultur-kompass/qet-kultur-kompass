import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession } from "@/lib/session";
import { StrategyHandoutView } from "@/components/StrategyHandoutView";
import type { GoalItem } from "@/components/StrategyView";

export const dynamic = "force-dynamic";

/**
 * Server-Einstiegspunkt für das 1-Seiten-PDF-Handout zur persönlichen
 * Strategie (siehe /mein-dashboard/strategie/page.tsx für die interaktive
 * Bearbeitung, gleiches window.print()-Muster wie beim Audit-Handbuch).
 * Bewusst eigenständig gehalten statt Logik zu teilen – siehe die gleiche,
 * bereits etablierte Duplizierung bei /mein-dashboard/report/page.tsx.
 */
export default async function StrategieHandoutPage() {
  const session = await requireAnySelfServiceSession();
  if (!session) redirect("/login");

  if (session.role === "owner") {
    const company = await prisma.company.findUnique({ where: { id: session.companyId } });
    if (!company) redirect("/login");

    const owner = await prisma.invitee.findFirst({
      where: { companyId: session.companyId, isOwner: true },
      include: { goals: { orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }] } },
    });

    const goals: GoalItem[] = (owner?.goals ?? []).map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      pillar: g.pillar as GoalItem["pillar"],
      dueDate: g.dueDate ? g.dueDate.toISOString() : null,
      status: g.status as GoalItem["status"],
      createdAt: g.createdAt.toISOString(),
    }));

    return (
      <StrategyHandoutView
        companyName={company.name}
        name={company.ownerName || company.name}
        intro={owner?.strategyIntro ?? ""}
        goals={goals}
      />
    );
  }

  // role === "employee"
  const invitee = await prisma.invitee.findUnique({
    where: { id: session.inviteeId },
    include: {
      company: true,
      goals: { orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!invitee) redirect("/login");

  const goals: GoalItem[] = invitee.goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    pillar: g.pillar as GoalItem["pillar"],
    dueDate: g.dueDate ? g.dueDate.toISOString() : null,
    status: g.status as GoalItem["status"],
    createdAt: g.createdAt.toISOString(),
  }));

  return (
    <StrategyHandoutView
      companyName={invitee.company.name}
      name={invitee.name || invitee.email || ""}
      intro={invitee.strategyIntro}
      goals={goals}
    />
  );
}

