import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession } from "@/lib/session";
import { computeScores, overallIndex } from "@/lib/scoring";
import { criteriaForScope, labelForScope } from "@/lib/content/scopes";
import { scopeFromId, scopeToId } from "@/lib/content/types";
import type { Answers } from "@/lib/content/types";
import { QetIndexGauge } from "@/components/QetIndexGauge";
import { QetIndexRing } from "@/components/QetIndexRing";
import { CriterionBars } from "@/components/charts/CriterionBars";
import { BrandHeaderLink } from "@/components/BrandHeaderLink";

export const dynamic = "force-dynamic";

/**
 * Read-only Detailansicht EINES vergangenen Testlaufs ("zurück in den
 * Test" aus der Testübersicht, siehe SubmissionHistory). Bewusst als
 * eigene Seite statt Modal, damit sie direkt verlinkbar/zurück-navigierbar
 * ist. Zugriff ausschließlich auf die EIGENEN Submissions der eingeloggten
 * Person – dieselbe Anonymitäts-Grenze wie überall sonst in der App.
 */
export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const session = await requireAnySelfServiceSession();
  if (!session) redirect("/login");

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: { invitee: true },
  });

  if (!submission || !submission.invitee) notFound();

  const owns =
    session.role === "owner"
      ? submission.invitee.isOwner && submission.invitee.companyId === session.companyId
      : submission.invitee.id === session.inviteeId;

  if (!owns) notFound();

  const scope = scopeFromId(submission.testScope) ?? { kind: "full" as const };
  const isFull = scope.kind === "full";
  const scopeCriteria = criteriaForScope(scope);
  const scopeLabel = labelForScope(scope, "de");

  const answers = JSON.parse(submission.answers) as Answers;
  const { criterionScores, pillarScores } = computeScores(answers);
  const scopeIndex = isFull ? submission.qetIndex : overallIndex(criterionScores, scopeCriteria.map((c) => c.id));

  const sorted = [...scopeCriteria].sort(
    (a, b) => (criterionScores[b.id] ?? 0) - (criterionScores[a.id] ?? 0)
  );
  const strongest = sorted.slice(0, 3);
  const weakest = sorted.slice(-3).reverse();

  const dateLabel = submission.createdAt.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <BrandHeaderLink size={24} />
        <Link href="/mein-dashboard" className="flex items-center gap-1.5 text-sm font-medium text-ink/60 transition hover:text-ink">
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
            <path d="M9 3L4 7.5l5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Zurück zur Übersicht
        </Link>
      </div>

      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">{scopeLabel}</h1>
      <p className="mt-1 text-sm text-ink/60">
        {dateLabel}
        {submission.label && <span className="ml-2 text-ink/40">· {submission.label}</span>}
      </p>

      {isFull ? (
        <div className="mt-6 flex justify-center rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
          <QetIndexRing
            qetIndex={submission.qetIndex}
            pillarScores={pillarScores}
            criterionScores={criterionScores}
            label="QET-Index"
          />
        </div>
      ) : (
        <div className="mt-6 flex justify-center rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
          <QetIndexGauge value={scopeIndex} label={scopeLabel} />
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
        <h3 className="mb-4 font-display text-base font-semibold text-ink">Je Kriterium</h3>
        <CriterionBars criteria={scopeCriteria} scores={criterionScores} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
          <h3 className="font-display text-base font-semibold text-ethics-600">Stärken</h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink/75">
            {strongest.map((c) => (
              <li key={c.id} className="flex justify-between">
                <span>{c.name.de}</span>
                <span className="font-mono">{Math.round(criterionScores[c.id] ?? 0)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
          <h3 className="font-display text-base font-semibold text-transparency-600">Entwicklungsfelder</h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink/75">
            {weakest.map((c) => (
              <li key={c.id} className="flex justify-between">
                <span>{c.name.de}</span>
                <span className="font-mono">{Math.round(criterionScores[c.id] ?? 0)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={`/invite/${submission.invitee.inviteToken}?scope=${encodeURIComponent(scopeToId(scope))}`}
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
        >
          Diesen Bereich erneut testen
        </Link>
        <Link
          href="/mein-dashboard"
          className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink/80 transition hover:bg-ink/5"
        >
          Zur Testübersicht
        </Link>
      </div>
    </main>
  );
}
