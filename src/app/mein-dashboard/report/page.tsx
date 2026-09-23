import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession } from "@/lib/session";
import { aggregateSubmissions, computeScores, MIN_RESPONSES_FOR_AGGREGATE } from "@/lib/scoring";
import type { Answers } from "@/lib/content/types";
import type { MeinDashboardData, SubmissionSummary } from "@/components/MeinDashboardView";
import { BusinessReportView } from "@/components/BusinessReportView";

export const dynamic = "force-dynamic";

function baseUrl() {
  const h = headers();
  const host = h.get("host");
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${proto}://${host}`;
}

/** Identische Umwandlung wie in /mein-dashboard/page.tsx (siehe dort für
 * den Hintergrund) – hier dupliziert, damit diese Seite unabhängig von der
 * Haupt-Dashboard-Seite ihre eigenen Daten laden kann. */
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

/**
 * Audit-Handbuch / PDF Business Report: eigene Route neben /mein-dashboard,
 * damit sie sich unabhängig drucken/als PDF speichern lässt (siehe
 * BusinessReportView.tsx). Lädt bewusst dieselben Daten wie die
 * Haupt-Dashboard-Seite (identische Prisma-Abfragen), damit beide Ansichten
 * garantiert konsistent bleiben.
 */
export default async function MeinDashboardReportPage() {
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
            criterionScores: computeScores(JSON.parse(latestOwnSubmission.answers) as Answers).criterionScores,
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

    return <BusinessReportView data={data} />;
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
          criterionScores: computeScores(JSON.parse(latestOwnSubmission.answers) as Answers).criterionScores,
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

  return <BusinessReportView data={data} />;
}

