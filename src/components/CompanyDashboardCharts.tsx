"use client";

import { useState } from "react";
import { CriterionBars } from "./charts/CriterionBars";
import { QetIndexRing } from "./QetIndexRing";
import { CRITERIA, PILLARS } from "@/lib/content/criteria";
import type { PillarKey } from "@/lib/content/types";
import type { AggregateResult } from "@/lib/scoring";

export function CompanyDashboardCharts({ aggregate }: { aggregate: AggregateResult }) {
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
    </div>
  );
}
