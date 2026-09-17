import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession } from "@/lib/session";
import { aggregateSubmissions, MIN_RESPONSES_FOR_AGGREGATE } from "@/lib/scoring";
import { MeinDashboardView, type MeinDashboardData, type SubmissionSummary } from "@/components/MeinDashboardView";

export const dynamic = "force-dynamic";

function baseUrl() {
  const h = headers();
  const host = h.get("host");
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${proto}://${host}`;
}

/** Wandelt die (nach Datum absteigend sortierten) eigenen Submissions einer
 * Person in die schlanke, serialisierbare Form für die Testübersicht
 * (Verlauf/Zeitachse, siehe Roadmap V2.0) um. createdAt wird bewusst als
 * ISO-String übergeben, da Date-Objekte nicht direkt von einer Server- an
 * eine Client-Komponente durchgereicht werden können. */
function toSummaries(
  submissions: { id: string; testScope: string; label: string | null; qetIndex: number; scopeIndex: number; createdAt: Date }[]
): SubmissionSummary[] {
  return submissions.map((s) => ({
    id: s.id,
    testScope: s.testScope,
    label: s.label,
    qetIndex: s.qetIndex,
    scopeIndex: s.scopeIndex,
    createdAt: s.createdAt.toISOString(),
  }));
}

export default async function MeinDashboardPage() {
  const session = await requireAnySelfServiceSession();
  if (!session) redirect("/login");

  const origin = baseUrl();

  if (session.role === "owner") {
    const company = await prisma.company.findUnique({
      where: { id: session.companyId },
      include: {
        submissions: true,
        invitees: {
          orderBy: { createdAt: "desc" },
          include: { submissions: { orderBy: { createdAt: "desc" } } },
        },
      },
    });
    if (!company) redirect("/login");

    const ownInvitee = company.invitees.find((i) => i.isOwner) ?? null;
    // Neueste Einreichung zuerst (siehe orderBy oben) – so zeigt "Mein
    // Ergebnis" immer den letzten Testlauf, auch wenn mehrere existieren.
    const latestOwnSubmission = ownInvitee?.submissions[0] ?? null;
    const aggregate =
      company.submissions.length >= MIN_RESPONSES_FOR_AGGREGATE
        ? aggregateSubmissions(company.submissions)
        : null;

    const data: MeinDashboardData = {
      role: "owner",
      name: company.ownerName || company.name,
      companyName: company.name,
      accountType: company.accountType,
      ownSubmission: latestOwnSubmission
        ? {
            qualityScore: latestOwnSubmission.qualityScore,
            ethicsScore: latestOwnSubmission.ethicsScore,
            transparencyScore: latestOwnSubmission.transparencyScore,
            qetIndex: latestOwnSubmission.qetIndex,
            scopeIndex: latestOwnSubmission.scopeIndex,
            testScope: latestOwnSubmission.testScope,
          }
        : null,
      ownSubmissionCount: ownInvitee?.submissions.length ?? 0,
      ownSubmissions: toSummaries(ownInvitee?.submissions ?? []),
      ownInviteToken: ownInvitee?.inviteToken ?? "",
      aggregate,
      responseCount: company.submissions.length,
      minResponses: MIN_RESPONSES_FOR_AGGREGATE,
      origin,
      dashboardShareUrl: `${origin}/dashboard/${company.dashboardToken}`,
      surveyShareUrl: company.accountType === "company" ? `${origin}/survey/${company.surveyToken}` : undefined,
      invitees: company.invitees
        .filter((i) => !i.isOwner)
        .map((inv) => ({
          id: inv.id,
          name: inv.name,
          email: inv.email,
          department: inv.department,
          role: inv.role as "employee" | "customer" | "partner",
          status: inv.status,
          source: inv.source,
          inviteToken: inv.inviteToken,
        })),
      companyId: company.id,
    };

    return <MeinDashboardView data={data} />;
  }

  // role === "employee"
  const invitee = await prisma.invitee.findUnique({
    where: { id: session.inviteeId },
    include: {
      company: { include: { submissions: true } },
      submissions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!invitee) redirect("/login");

  // Neueste Einreichung zuerst (siehe orderBy oben) – "Mein Ergebnis" zeigt
  // immer den letzten Testlauf, auch wenn schon mehrere existieren.
  const latestOwnSubmission = invitee.submissions[0] ?? null;
  const aggregate =
    invitee.company.submissions.length >= MIN_RESPONSES_FOR_AGGREGATE
      ? aggregateSubmissions(invitee.company.submissions)
      : null;

  const data: MeinDashboardData = {
    role: "employee",
    name: invitee.name || invitee.email || "",
    companyName: invitee.company.name,
    accountType: invitee.company.accountType,
    ownSubmission: latestOwnSubmission
      ? {
          qualityScore: latestOwnSubmission.qualityScore,
          ethicsScore: latestOwnSubmission.ethicsScore,
          transparencyScore: latestOwnSubmission.transparencyScore,
          qetIndex: latestOwnSubmission.qetIndex,
          scopeIndex: latestOwnSubmission.scopeIndex,
          testScope: latestOwnSubmission.testScope,
        }
      : null,
    ownSubmissionCount: invitee.submissions.length,
    ownSubmissions: toSummaries(invitee.submissions),
    ownInviteToken: invitee.inviteToken,
    aggregate,
    responseCount: invitee.company.submissions.length,
    minResponses: MIN_RESPONSES_FOR_AGGREGATE,
    origin,
    hasPassword: Boolean(invitee.passwordHash),
    companyId: invitee.companyId,
  };

  return <MeinDashboardView data={data} />;
}
