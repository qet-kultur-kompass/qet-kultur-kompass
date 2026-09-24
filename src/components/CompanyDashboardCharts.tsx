"use client";

import { useState } from "react";
import { CriterionBars } from "./charts/CriterionBars";
import { QetIndexRing } from "./QetIndexRing";
import { CRITERIA, PILLARS } from "@/lib/content/criteria";
import type { Locale, PillarKey } from "@/lib/content/types";
import type { AggregateResult } from "@/lib/scoring";
import { ROLE_LABELS, t } from "@/lib/content/i18n";

const ROLES = ["employee", "customer", "partner"] as const;

/**
 * `locale` ist optional (Default "de"), damit die beiden Seiten, die diese
 * Komponente außerhalb eines Locale-Kontexts einbinden (das öffentliche
 * Token-Dashboard unter /dashboard/[token] und die Admin-Firmenansicht,
 * beide bislang komplett auf Deutsch), unverändert funktionieren – während
 * `MeinDashboardView` (die einzige Stelle mit echter Sprachauswahl) die
 * tatsächlich gewählte Sprache durchreicht.
 *
 * Der "Ergebnis nach Rolle"-Block war zuvor in /dashboard/[token]/page.tsx
 * UND in /admin/company/[id]/page.tsx als identisches, hart kodiertes
 * Markup dupliziert – dabei fehlte er ausgerechnet auf "Mein Dashboard",
 * der Seite, die Firmen-Inhaber:innen im Alltag tatsächlich nutzen, obwohl
 * `aggregate.byRole` dafür serverseitig längst berechnet wird. Durch das
 * Verschieben hierher taucht der Block jetzt konsistent an allen drei
 * Stellen auf, ohne dass Duplizierung oder eine Backend-Änderung nötig war.
 */
export function CompanyDashboardCharts({
  aggregate,
  locale = "de",
}: {
  aggregate: AggregateResult;
  locale?: Locale;
}) {
  const [activePillar, setActivePillar] = useState<PillarKey>("Q");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
        <QetIndexRing
          qetIndex={aggregate.qetIndex}
          pillarScores={aggregate.pillarScores}
          criterionScores={aggregate.criterionScores}
          label="QET-Index"
        />
      </div>

      <div className="rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
        <div className="mb-4 flex gap-2">
          {PILLARS.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePillar(p.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activePillar === p.key
                  ? "bg-ink text-paper"
                  : "bg-ink/5 text-ink/60 hover:bg-ink/10"
              }`}
            >
              {p.name.de} · {Math.round(aggregate.pillarScores[p.key] ?? 0)}%
            </button>
          ))}
        </div>
        <CriterionBars
          criteria={CRITERIA.filter((c) => c.pillar === activePillar)}
          scores={aggregate.criterionScores}
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink/70">{t(locale, "dashboardByRoleTitle")}</h3>
        <div className="grid grid-cols-3 gap-4">
          {ROLES.map((role) => (
            <div key={role} className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
              <div className="text-xs font-medium uppercase tracking-wide text-ink/50">
                {ROLE_LABELS[role][locale]}
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold text-ink">
                {aggregate.byRole[role].count > 0 ? `${Math.round(aggregate.byRole[role].qetIndex)}%` : "–"}
              </div>
              <div className="text-xs text-ink/50">
                {t(locale, "dashboardByRoleResponses", { count: aggregate.byRole[role].count })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

