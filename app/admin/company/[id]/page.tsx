import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { aggregateSubmissions } from "@/lib/scoring";
import { CompanyDashboardCharts } from "@/components/CompanyDashboardCharts";
import { CopyField } from "@/components/CopyField";
import { SapSettingsPanel } from "@/components/SapSettingsPanel";
import { InviteeList } from "@/components/InviteeList";
import { ROLE_LABELS } from "@/lib/content/i18n";

export const dynamic = "force-dynamic";

function baseUrl() {
  const h = headers();
  const host = h.get("host");
  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${proto}://${host}`;
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      submissions: { orderBy: { createdAt: "desc" } },
      invitees: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!company) notFound();

  const aggregate = company.submissions.length > 0 ? aggregateSubmissions(company.submissions) : null;
  const origin = baseUrl();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <Link href="/admin" className="text-sm text-ink/50 hover:text-ink">
        ← Alle Firmen
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{company.name}</h1>
          <p className="text-sm text-ink/60">
            {company.submissions.length}{" "}
            {company.submissions.length === 1 ? "Einreichung" : "Einreichungen"}
            {!company.isActive && " · Link deaktiviert"}
          </p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card sm:grid-cols-2">
        <CopyField label="Umfrage-Link (Mitarbeiter/Kunden/Partner)" value={`${origin}/survey/${company.surveyToken}`} />
        <CopyField label="Firmen-Dashboard-Link (read-only)" value={`${origin}/dashboard/${company.dashboardToken}`} />
      </div>

      <div className="mt-6">
        <SapSettingsPanel
          companyId={company.id}
          initial={{
            sapEnabled: company.sapEnabled,
            sapSystemType: company.sapSystemType,
            sapTenantUrl: company.sapTenantUrl,
            sapAuthMode: company.sapAuthMode,
            sapClientId: company.sapClientId,
            sapCompanyId: company.sapCompanyId,
            sapExportEnabled: company.sapExportEnabled,
            sapExportWebhookUrl: company.sapExportWebhookUrl,
            sapSsoEnabled: company.sapSsoEnabled,
            sapSsoIssuerUrl: company.sapSsoIssuerUrl,
            sapSsoClientId: company.sapSsoClientId,
            sapLastSyncAt: company.sapLastSyncAt ? company.sapLastSyncAt.toISOString() : null,
            sapLastExportAt: company.sapLastExportAt ? company.sapLastExportAt.toISOString() : null,
          }}
        />
      </div>

      <div className="mt-6">
        <InviteeList
          companyId={company.id}
          origin={origin}
          invitees={company.invitees.map((inv) => ({
            id: inv.id,
            name: inv.name,
            email: inv.email,
            department: inv.department,
            role: inv.role as "employee" | "customer" | "partner",
            status: inv.status,
            source: inv.source,
            inviteToken: inv.inviteToken,
          }))}
        />
      </div>

      <div className="mt-8">
        {aggregate ? (
          <CompanyDashboardCharts aggregate={aggregate} />
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink/50">
            Noch keine Einreichungen. Teilen Sie den Umfrage-Link, um Ergebnisse zu sammeln.
          </div>
        )}
      </div>

      {aggregate && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          {(["employee", "customer", "partner"] as const).map((role) => (
            <div key={role} className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
              <div className="text-xs font-medium uppercase tracking-wide text-ink/50">
                {ROLE_LABELS[role].de}
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold text-ink">
                {aggregate.byRole[role].count > 0 ? `${Math.round(aggregate.byRole[role].qetIndex)}%` : "–"}
              </div>
              <div className="text-xs text-ink/50">
                {aggregate.byRole[role].count}{" "}
                {aggregate.byRole[role].count === 1 ? "Antwort" : "Antworten"}
              </div>
            </div>
          ))}
        </div>
      )}

      {company.submissions.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-ink/10 bg-white/60 shadow-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
                <th className="px-5 py-3 font-medium">Datum</th>
                <th className="px-5 py-3 font-medium">Rolle</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">QET-Index</th>
              </tr>
            </thead>
            <tbody>
              {company.submissions.map((s) => (
                <tr key={s.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-3 text-ink/70">
                    {new Date(s.createdAt).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-5 py-3 text-ink/70">
                    {ROLE_LABELS[s.role as keyof typeof ROLE_LABELS]?.de ?? s.role}
                  </td>
                  <td className="px-5 py-3 text-ink/70">{s.respondentName || "–"}</td>
                  <td className="px-5 py-3 font-mono font-medium text-ink">{Math.round(s.qetIndex)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
