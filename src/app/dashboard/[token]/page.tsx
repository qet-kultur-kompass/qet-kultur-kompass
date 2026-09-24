import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { aggregateSubmissions, MIN_RESPONSES_FOR_AGGREGATE } from "@/lib/scoring";
import { CompanyDashboardCharts } from "@/components/CompanyDashboardCharts";
import { ROLE_LABELS } from "@/lib/content/i18n";
import { BrandHeaderLink } from "@/components/BrandHeaderLink";

export const dynamic = "force-dynamic";

export default async function PublicCompanyDashboardPage({ params }: { params: { token: string } }) {
  const company = await prisma.company.findUnique({
    where: { dashboardToken: params.token },
    include: { submissions: true },
  });

  if (!company) notFound();

  const count = company.submissions.length;
  const aggregate = count >= MIN_RESPONSES_FOR_AGGREGATE ? aggregateSubmissions(company.submissions) : null;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <BrandHeaderLink size={20} />

      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">{company.name}</h1>
      <p className="text-sm text-ink/60">Unternehmenskultur-Dashboard</p>

      {!aggregate ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink/50">
          Es liegen bisher {count} von mindestens {MIN_RESPONSES_FOR_AGGREGATE} nötigen Einreichungen
          vor. Um die Anonymität der Teilnehmenden zu schützen, wird die Auswertung erst ab{" "}
          {MIN_RESPONSES_FOR_AGGREGATE} Antworten angezeigt.
        </div>
      ) : (
        <div className="mt-8">
          <CompanyDashboardCharts aggregate={aggregate} />
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
          <p className="mt-6 text-xs text-ink/40">
            Aus Datenschutzgründen werden ausschließlich aggregierte Werte angezeigt – keine
            einzelnen Antworten oder Namen.
          </p>
        </div>
      )}
    </main>
  );
}
