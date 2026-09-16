import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession } from "@/lib/session";
import { aggregateSubmissions, MIN_RESPONSES_FOR_AGGREGATE } from "@/lib/scoring";
import { MeinDashboardView, type MeinDashboardData } from "@/components/MeinDashboardView";

export const dynamic = "force-dynamic";

function baseUrl() {
  const h = headers();
  const host = h.get("host");
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${proto}://${host}`;
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
        invitees: { orderBy: { createdAt: "desc" }, include: { submission: true } },
      },
    });
    if (!company) redirect("/login");

    const ownInvitee = company.invitees.find((i) => i.isOwner) ?? null;
    const aggregate =
      company.submissions.length >= MIN_RESPONSES_FOR_AGGREGATE
        ? aggregateSubmissions(company.submissions)
        : null;

    const data: MeinDashboardData = {
      role: "owner",
      name: company.ownerName || company.name,
      companyName: company.name,
      accountType: company.accountType,
      ownSubmission: ownInvitee?.submission
        ? {
            qualityScore: ownInvitee.submission.qualityScore,
            ethicsScore: ownInvitee.submission.ethicsScore,
            transparencyScore: ownInvitee.submission.transparencyScore,
            qetIndex: ownInvitee.submission.qetIndex,
            scopeIndex: ownInvitee.submission.scopeIndex,
            testScope: ownInvitee.submission.testScope,
          }
        : null,
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
    include: { company: { include: { submissions: true } }, submission: true },
  });
  if (!invitee) redirect("/login");

  const aggregate =
    invitee.company.submissions.length >= MIN_RESPONSES_FOR_AGGREGATE
      ? aggregateSubmissions(invitee.company.submissions)
      : null;

  const data: MeinDashboardData = {
    role: "employee",
    name: invitee.name || invitee.email || "",
    companyName: invitee.company.name,
    accountType: invitee.company.accountType,
    ownSubmission: invitee.submission
      ? {
          qualityScore: invitee.submission.qualityScore,
          ethicsScore: invitee.submission.ethicsScore,
          transparencyScore: invitee.submission.transparencyScore,
          qetIndex: invitee.submission.qetIndex,
          scopeIndex: invitee.submission.scopeIndex,
          testScope: invitee.submission.testScope,
        }
      : null,
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
