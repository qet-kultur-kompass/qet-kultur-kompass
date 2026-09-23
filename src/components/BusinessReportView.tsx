"use client";

import { useMemo, useState } from "react";
import { CRITERIA, PILLARS } from "@/lib/content/criteria";
import { LOCALES, t } from "@/lib/content/i18n";
import { resolveText } from "@/lib/content/types";
import type { Locale, PillarKey } from "@/lib/content/types";
import { bandFor, type Band } from "@/lib/scoring";
import { QetLogo } from "./QetLogo";
import { QetSymbol } from "./QetSymbol";
import { QetIndexGauge } from "./QetIndexGauge";
import { QetIndexRing } from "./QetIndexRing";
import type { MeinDashboardData } from "./MeinDashboardView";

const PILLAR_COLOR: Record<PillarKey, string> = { Q: "#3d54b0", E: "#2d7a56", T: "#c9862a" };
const SPECIAL_COLOR = "#7c3aed";

const BAND_COLOR: Record<Band, string> = {
  critical: "#b3432b",
  watch: "#c9862a",
  solid: "#3d54b0",
  strong: "#2d7a56",
};

const BAND_LABEL_KEY: Record<Band, string> = {
  critical: "bandCritical",
  watch: "bandWatch",
  solid: "bandSolid",
  strong: "bandStrong",
};

interface ReportBasis {
  kind: "aggregate" | "personal";
  isFull: boolean;
  qetIndex: number;
  pillarScores: Record<PillarKey, number>;
  criterionScores: Record<string, number>;
  participantCount: number;
}

interface CriterionRow {
  id: string;
  pillar: PillarKey;
  special: boolean;
  name: string;
  score: number;
  band: Band;
}

/**
 * Audit-Handbuch / Business Report (Task QET-46-Vorstufe "PDF Business
 * Report"): druckoptimierte Vollansicht der QET-Ergebnisse als Grundlage für
 * "Als PDF speichern" über den Browser-Druckdialog (siehe window.print() in
 * InviteFlow.tsx/SurveyFlow.tsx – bewusst dasselbe, bereits produktiv
 * genutzte Muster statt einer serverseitigen PDF-Bibliothek). Zeigt je nach
 * Datenlage entweder das anonymisierte Firmen-Gesamtergebnis (sobald
 * genügend Einreichungen vorliegen, siehe MIN_RESPONSES_FOR_AGGREGATE) oder
 * ersatzweise das persönliche Ergebnis der eingeloggten Person.
 */
export function BusinessReportView({ data }: { data: MeinDashboardData }) {
  const [locale, setLocale] = useState<Locale>("de");

  const basis: ReportBasis | null = useMemo(() => {
    if (data.aggregate) {
      const result: ReportBasis = {
        kind: "aggregate",
        isFull: true,
        qetIndex: data.aggregate.qetIndex,
        pillarScores: data.aggregate.pillarScores,
        criterionScores: data.aggregate.criterionScores,
        participantCount: data.aggregate.count,
      };
      return result;
    }
    if (data.ownSubmission) {
      const isFull = data.ownSubmission.testScope === "full";
      const result: ReportBasis = {
        kind: "personal",
        isFull,
        qetIndex: isFull ? data.ownSubmission.qetIndex : data.ownSubmission.scopeIndex,
        pillarScores: {
          Q: data.ownSubmission.qualityScore,
          E: data.ownSubmission.ethicsScore,
          T: data.ownSubmission.transparencyScore,
        },
        criterionScores: data.ownSubmission.criterionScores,
        participantCount: 1,
      };
      return result;
    }
    return null;
  }, [data]);

  const rows: CriterionRow[] = useMemo(() => {
    if (!basis) return [];
    return CRITERIA.filter((c) => typeof basis.criterionScores[c.id] === "number")
      .map((c) => {
        const score = basis.criterionScores[c.id];
        return {
          id: c.id,
          pillar: c.pillar,
          special: Boolean(c.special),
          name: resolveText(c.name, locale),
          score,
          band: bandFor(score),
        };
      })
      .sort((a, b) => (a.pillar === b.pillar ? a.id.localeCompare(b.id) : a.pillar.localeCompare(b.pillar)));
  }, [basis, locale]);

  const sortedByScore = useMemo(() => [...rows].sort((a, b) => b.score - a.score), [rows]);
  const critical = rows.filter((r) => r.band === "critical" || r.band === "watch").sort((a, b) => a.score - b.score);
  const strong = rows.filter((r) => r.band === "strong").sort((a, b) => b.score - a.score);
  const strongest = sortedByScore.slice(0, 5);
  const weakest = [...sortedByScore].reverse().slice(0, 5);

  const localeTag = locale === "de" ? "de-DE" : locale === "tr" ? "tr-TR" : locale === "ro" ? "ro-RO" : "en-US";
  const generatedOn = new Date().toLocaleDateString(localeTag, { year: "numeric", month: "long", day: "numeric" });

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <a href="/mein-dashboard" className="text-sm font-medium text-ink/60 transition hover:text-ink">
          ← {t(locale, "reportBackToDashboard")}
        </a>
        <div className="flex items-center gap-3">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded-lg border border-ink/15 bg-white px-2 py-1 text-xs text-ink"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            {t(locale, "print")}
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2">
        <span className="h-[18px] w-[18px] shrink-0">
          <QetSymbol />
        </span>
        <QetLogo className="h-[18px] w-auto" />
      </div>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">{t(locale, "reportTitle")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">{t(locale, "reportSubtitle")}</p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink/50">
        <span>{data.companyName}</span>
        {generatedOn && <span>{t(locale, "reportGeneratedOn", { date: generatedOn })}</span>}
        {basis && (
          <span>
            {basis.kind === "aggregate"
              ? t(locale, "reportParticipants", { count: basis.participantCount })
              : t(locale, "reportIndividualBasis")}
          </span>
        )}
      </div>

      {!basis ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/20 p-8 text-center">
          <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "reportNoDataTitle")}</h2>
          <p className="mt-2 text-sm text-ink/60">{t(locale, "reportNoDataBody")}</p>
          <a
            href={`/invite/${data.ownInviteToken}?new=1`}
            className="no-print mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            {t(locale, "dashboardStartSurvey")}
          </a>
        </div>
      ) : (
        <>
          <section className="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card" style={{ breakInside: "avoid" }}>
            <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "reportOverallSection")}</h2>
            <div className="mt-4 flex justify-center">
              {basis.isFull ? (
                <QetIndexRing
                  qetIndex={basis.qetIndex}
                  pillarScores={basis.pillarScores}
                  criterionScores={basis.criterionScores}
                  label={t(locale, "qetIndex")}
                  locale={locale}
                  size={240}
                />
              ) : (
                <QetIndexGauge value={basis.qetIndex} label={t(locale, "qetIndex")} locale={locale} size={180} />
              )}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PILLARS.map((p) => {
                const score = basis.pillarScores[p.key] ?? 0;
                const band = bandFor(score);
                return (
                  <div key={p.key} className="rounded-xl border border-ink/10 bg-paper/60 p-4 text-center">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink/45">{resolveText(p.name, locale)}</p>
                    <p className="mt-1 font-mono text-2xl font-semibold" style={{ color: PILLAR_COLOR[p.key] }}>
                      {Math.round(score)}%
                    </p>
                    <p className="mt-1 text-xs font-medium" style={{ color: BAND_COLOR[band] }}>
                      {t(locale, BAND_LABEL_KEY[band])}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card" style={{ breakInside: "avoid" }}>
              <h3 className="font-display text-base font-semibold text-ethics-600">{t(locale, "strongest")}</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink/75">
                {strongest.map((r) => (
                  <li key={r.id} className="flex justify-between gap-3">
                    <span>{r.name}</span>
                    <span className="font-mono">{Math.round(r.score)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card" style={{ breakInside: "avoid" }}>
              <h3 className="font-display text-base font-semibold text-transparency-600">{t(locale, "weakest")}</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink/75">
                {weakest.map((r) => (
                  <li key={r.id} className="flex justify-between gap-3">
                    <span>{r.name}</span>
                    <span className="font-mono">{Math.round(r.score)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "reportRecommendations")}</h2>
            {critical.length > 0 && (
              <div className="mt-4" style={{ breakInside: "avoid" }}>
                <p className="text-sm font-medium text-ink/70">{t(locale, "reportRecCriticalIntro")}</p>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink/75">
                  {critical.slice(0, 8).map((r) => (
                    <li key={r.id} className="flex justify-between gap-3">
                      <span>{r.name}</span>
                      <span className="font-mono" style={{ color: BAND_COLOR[r.band] }}>
                        {Math.round(r.score)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {strong.length > 0 && (
              <div className="mt-4" style={{ breakInside: "avoid" }}>
                <p className="text-sm font-medium text-ink/70">{t(locale, "reportRecStrongIntro")}</p>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink/75">
                  {strong.slice(0, 6).map((r) => (
                    <li key={r.id} className="flex justify-between gap-3">
                      <span>{r.name}</span>
                      <span className="font-mono" style={{ color: BAND_COLOR[r.band] }}>
                        {Math.round(r.score)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "reportCriteriaDetail")}</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs font-medium uppercase tracking-wide text-ink/45">
                    <th className="py-2 pr-3">{t(locale, "perCriterion")}</th>
                    <th className="py-2 pr-3">{t(locale, "reportPillarColumn")}</th>
                    <th className="py-2 pr-3 text-right">{t(locale, "reportScoreColumn")}</th>
                    <th className="py-2 pl-3 text-right">{t(locale, "reportStatusColumn")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-ink/5" style={{ breakInside: "avoid" }}>
                      <td className="py-1.5 pr-3 text-ink/85">
                        {r.name}
                        {r.special && (
                          <span
                            className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-paper"
                            style={{ backgroundColor: SPECIAL_COLOR }}
                          >
                            {t(locale, "specialCriterionBadge")}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pr-3">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: r.special ? SPECIAL_COLOR : PILLAR_COLOR[r.pillar] }}
                        />
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono text-ink/85">{Math.round(r.score)}%</td>
                      <td className="py-1.5 pl-3 text-right text-xs font-medium" style={{ color: BAND_COLOR[r.band] }}>
                        {t(locale, BAND_LABEL_KEY[r.band])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-10 text-center text-xs text-ink/40">{t(locale, "installAppHint")}</p>
    </main>
  );
}

