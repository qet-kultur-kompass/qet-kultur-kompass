"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { scopeFromId } from "@/lib/content/types";
import type { Locale } from "@/lib/content/types";
import { bandFor } from "@/lib/scoring";
import { t } from "@/lib/content/i18n";
import type { SubmissionSummary } from "./SubmissionHistory";

const BAND_COLOR: Record<string, string> = {
  critical: "#b3432b",
  watch: "#c9862a",
  solid: "#3d54b0",
  strong: "#2d7a56",
};

const LOCALE_TAG: Record<Locale, string> = {
  de: "de-DE",
  en: "en-US",
  tr: "tr-TR",
  ro: "ro-RO",
};

interface TrendRow {
  id: string;
  dateLabel: string;
  fullDate: string;
  value: number;
}

function TrendDot(props: { cx?: number; cy?: number; payload?: TrendRow }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  const color = BAND_COLOR[bandFor(payload.value)];
  return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#f5f5f7" strokeWidth={1.5} />;
}

function trendTooltipLabel(data: TrendRow[]) {
  return (id: string) => data.find((d) => d.id === id)?.fullDate ?? id;
}

/**
 * Fortschritts-Trend-Chart: zeigt den QET-Index (bzw. bei Teiltests den
 * passenden Scope-Wert) über alle eigenen Testläufe hinweg als Zeitreihe,
 * damit auf einen Blick sichtbar wird, ob sich die Unternehmenskultur seit
 * dem ersten Test verbessert hat. Nutzt dieselben Daten wie
 * SubmissionHistory (`ownSubmissions`) – keine neue API nötig. Bei nur
 * einem Testlauf wird statt eines (nicht aussagekräftigen) Ein-Punkt-Charts
 * eine Ermutigung angezeigt, einen weiteren Test zu machen.
 */
export function ProgressTrendChart({
  submissions,
  locale = "de",
}: {
  submissions: SubmissionSummary[];
  locale?: Locale;
}) {
  const data: TrendRow[] = useMemo(() => {
    const sorted = [...submissions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sorted.map((s) => {
      const scope = scopeFromId(s.testScope) ?? { kind: "full" as const };
      const value = scope.kind === "full" ? s.qetIndex : s.scopeIndex;
      const date = new Date(s.createdAt);
      return {
        id: s.id,
        dateLabel: date.toLocaleDateString(LOCALE_TAG[locale], { day: "2-digit", month: "short" }),
        fullDate: date.toLocaleDateString(LOCALE_TAG[locale], {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        value: Math.round(value),
      };
    });
  }, [submissions, locale]);

  if (data.length === 0) return null;

  if (data.length === 1) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 px-5 py-4 text-center text-xs text-ink/50">
        {t(locale, "trendEncourage")}
      </div>
    );
  }

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const delta = last - first;
  const deltaColor =
    delta === 0 ? "rgba(29,29,31,0.45)" : delta > 0 ? BAND_COLOR.strong : BAND_COLOR.critical;

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
      <div className="flex items-center justify-end">
        <span className="text-xs font-medium" style={{ color: deltaColor }}>
          {delta === 0
            ? t(locale, "trendSubtitleFlat")
            : t(locale, "trendSubtitleChange", { delta: delta > 0 ? `+${delta}` : String(delta) })}
        </span>
      </div>
      <div className="mt-2">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(29,29,31,0.08)" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: "rgba(29,29,31,0.45)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(29,29,31,0.12)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "rgba(29,29,31,0.45)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(29,29,31,0.12)" }}
              tickLine={false}
              width={30}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, ""]}
              labelFormatter={trendTooltipLabel(data)}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid rgba(29,29,31,0.12)",
                fontSize: 13,
              }}
            />
            <Line
              dataKey="value"
              stroke="rgba(29,29,31,0.35)"
              strokeWidth={2}
              dot={<TrendDot />}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

