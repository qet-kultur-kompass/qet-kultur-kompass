"use client";

import { useState } from "react";
import { CRITERIA } from "@/lib/content/criteria";
import { MEASURES } from "@/lib/content/measures";
import { t } from "@/lib/content/i18n";
import { resolveText } from "@/lib/content/types";
import type { Locale, PillarKey } from "@/lib/content/types";

const PILLAR_COLOR: Record<PillarKey, string> = { Q: "#3d54b0", E: "#2d7a56", T: "#c9862a" };

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Automatische Maßnahmen-Vorschläge (Feature "Automatische Vorschläge je
 * Kriterium", auf Nutzerwunsch als Alternative zu einer eigenständigen
 * Maßnahmen-Liste gewählt): ermittelt aus den vorliegenden Kriterien-Scores
 * die schwächsten Kriterien und zeigt je einen passenden, sofort als Ziel
 * übernehmbaren Maßnahmen-Vorschlag aus measures.ts.
 *
 * Ergänzt das bereits bestehende, frei formulierte Strategie/Ziele-Feature
 * (siehe StrategyView.tsx) um einen konkreten Einstiegspunkt direkt am
 * Testergebnis, ohne dass man die Maßnahme selbst formulieren muss. Rein
 * additiv: legt bei Klick über die bestehende Ziele-API (POST
 * /api/mein-dashboard/strategy/goals) ein neues Ziel an; das Testergebnis
 * selbst bleibt unverändert.
 */
export function MeasureSuggestions({
  criterionScores,
  locale = "de",
  count = 3,
}: {
  criterionScores: Record<string, number>;
  locale?: Locale;
  count?: number;
}) {
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});

  const weakest = CRITERIA.filter((c) => typeof criterionScores[c.id] === "number")
    .sort((a, b) => criterionScores[a.id] - criterionScores[b.id])
    .slice(0, count);

  if (weakest.length === 0) return null;

  async function saveAsGoal(criterionId: string, title: string, description: string, pillar: PillarKey) {
    setSaveStates((prev) => ({ ...prev, [criterionId]: "saving" }));
    try {
      const res = await fetch("/api/mein-dashboard/strategy/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, pillar }),
      });
      if (!res.ok) throw new Error("save_failed");
      setSaveStates((prev) => ({ ...prev, [criterionId]: "saved" }));
    } catch {
      setSaveStates((prev) => ({ ...prev, [criterionId]: "error" }));
    }
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
      <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "measuresTitle")}</h2>
      <p className="mt-1 text-sm text-ink/60">{t(locale, "measuresSubtitle")}</p>
      <ul className="mt-4 flex flex-col gap-4">
        {weakest.map((criterion) => {
          const measureText = MEASURES[criterion.id] ? resolveText(MEASURES[criterion.id], locale) : null;
          if (!measureText) return null;
          const name = resolveText(criterion.name, locale);
          const state = saveStates[criterion.id] ?? "idle";
          return (
            <li key={criterion.id} className="rounded-xl border border-ink/10 p-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: PILLAR_COLOR[criterion.pillar] }}
                  aria-hidden
                />
                <span className="font-display text-sm font-semibold text-ink">{name}</span>
                <span className="ml-auto font-mono text-xs text-ink/50">
                  {Math.round(criterionScores[criterion.id])}%
                </span>
              </div>
              <p className="mt-2 text-sm text-ink/75">{measureText}</p>
              <button
                type="button"
                disabled={state === "saving" || state === "saved"}
                onClick={() => saveAsGoal(criterion.id, name, measureText, criterion.pillar)}
                className="mt-3 rounded-full border border-ink/15 px-4 py-1.5 text-xs font-medium text-ink/70 transition hover:bg-ink/5 disabled:opacity-60"
              >
                {state === "saving"
                  ? t(locale, "measuresSaving")
                  : state === "saved"
                    ? t(locale, "measuresSaved")
                    : state === "error"
                      ? t(locale, "measuresSaveError")
                      : t(locale, "measuresSaveAsGoal")}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
