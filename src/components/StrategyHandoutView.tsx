"use client";

import { useState } from "react";
import { PILLARS } from "@/lib/content/criteria";
import { LOCALES, t } from "@/lib/content/i18n";
import { resolveText } from "@/lib/content/types";
import type { Locale, PillarKey } from "@/lib/content/types";
import { BrandHeaderLink } from "./BrandHeaderLink";
import type { GoalItem, GoalStatus } from "./StrategyView";

const PILLAR_COLOR: Record<PillarKey, string> = { Q: "#3d54b0", E: "#2d7a56", T: "#c9862a" };

const STATUS_COLOR: Record<GoalStatus, string> = { open: "#6b6558", in_progress: "#c9862a", done: "#2d7a56" };
const STATUS_LABEL_KEY: Record<GoalStatus, string> = {
  open: "strategyStatusOpen",
  in_progress: "strategyStatusInProgress",
  done: "strategyStatusDone",
};

function localeTagFor(locale: Locale): string {
  return locale === "de" ? "de-DE" : locale === "tr" ? "tr-TR" : locale === "ro" ? "ro-RO" : "en-US";
}

/**
 * 1-Seiten-PDF-Handout zur persönlichen Strategie (siehe StrategyView.tsx
 * für die interaktive Bearbeitung): druckoptimierte, kompakte
 * Zusammenfassung der strategischen Ausrichtung und aller Ziele als
 * Tabelle. Nutzt bewusst dasselbe window.print()-Muster wie das
 * Audit-Handbuch (BusinessReportView.tsx) statt einer eigenen
 * PDF-Bibliothek.
 */
export function StrategyHandoutView({
  companyName,
  name,
  intro,
  goals,
}: {
  companyName: string;
  name: string;
  intro: string;
  goals: GoalItem[];
}) {
  const [locale, setLocale] = useState<Locale>("de");

  const localeTag = localeTagFor(locale);
  const generatedOn = new Date().toLocaleDateString(localeTag, { year: "numeric", month: "long", day: "numeric" });

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <a href="/mein-dashboard/strategie" className="text-sm font-medium text-ink/60 transition hover:text-ink">
          ← {t(locale, "handoutBackToStrategy")}
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
            {t(locale, "handoutPrint")}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <BrandHeaderLink size={18} />
      </div>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">{t(locale, "handoutTitle")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">{t(locale, "handoutSubtitle")}</p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink/50">
        <span>{companyName}</span>
        <span>{name}</span>
        <span>{t(locale, "handoutGeneratedOn", { date: generatedOn })}</span>
      </div>

      <section className="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card" style={{ breakInside: "avoid" }}>
        <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "handoutIntroHeading")}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink/75">
          {intro.trim() ? intro : t(locale, "handoutNoIntro")}
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "handoutGoalsHeading")}</h2>
        {goals.length === 0 ? (
          <p className="mt-2 text-sm text-ink/60">{t(locale, "handoutNoGoals")}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-xs font-medium uppercase tracking-wide text-ink/45">
                  <th className="py-2 pr-3">{t(locale, "strategyFormTitleLabel")}</th>
                  <th className="py-2 pr-3">{t(locale, "handoutDueColumn")}</th>
                  <th className="py-2 pr-3">{t(locale, "handoutPillarColumn")}</th>
                  <th className="py-2 pl-3 text-right">{t(locale, "handoutStatusColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((g) => (
                  <tr key={g.id} className="border-b border-ink/5" style={{ breakInside: "avoid" }}>
                    <td className="py-1.5 pr-3 text-ink/85">{g.title}</td>
                    <td className="py-1.5 pr-3 text-ink/70">
                      {g.dueDate
                        ? new Date(g.dueDate).toLocaleDateString(localeTag, { day: "2-digit", month: "short", year: "numeric" })
                        : t(locale, "strategyNoDueDate")}
                    </td>
                    <td className="py-1.5 pr-3">
                      {g.pillar ? (
                        <span className="inline-flex items-center gap-1.5 text-ink/70">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: PILLAR_COLOR[g.pillar] }}
                            aria-hidden
                          />
                          {resolveText(PILLARS.find((p) => p.key === g.pillar)!.name, locale)}
                        </span>
                      ) : (
                        <span className="text-ink/30">—</span>
                      )}
                    </td>
                    <td className="py-1.5 pl-3 text-right text-xs font-medium" style={{ color: STATUS_COLOR[g.status] }}>
                      {t(locale, STATUS_LABEL_KEY[g.status])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-10 text-center text-xs text-ink/40">{t(locale, "installAppHint")}</p>
    </main>
  );
}

