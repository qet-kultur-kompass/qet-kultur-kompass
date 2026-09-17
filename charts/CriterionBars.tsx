"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Criterion, PillarKey, Locale } from "@/lib/content/types";
import { PILLAR_COLOR } from "./PillarRadar";
import { CriterionInfoButton } from "./CriterionInfoButton";
import { t } from "@/lib/content/i18n";

type ChartView = "bar" | "line" | "table";

type Row = { id: string; name: string; pillar: PillarKey; value: number };

/**
 * Ergebnisdarstellung für eine beliebige Kriterien-Auswahl, mit umschaltbarer
 * Darstellungsform (Balken / Kurve / Tabelle – die Tabelle ist immer die
 * barrierefreie Alternativansicht) und einem "i"-Info-Button je Kriterium mit
 * Kurzbeschreibung. Wird sowohl für eine einzelne Säule (Gesamttest-Tabs,
 * Säulen-Teiltest) als auch für ein Managementfeld verwendet, das mehrere
 * Säulen mischt – die Farbe pro Zeile richtet sich daher immer nach der Säule
 * DES JEWEILIGEN Kriteriums, nicht nach einer einzigen für den ganzen Chart
 * übergebenen Säule.
 */
export function CriterionBars({
  criteria,
  scores,
  locale = "de",
}: {
  criteria: Criterion[];
  scores: Record<string, number>;
  locale?: Locale;
}) {
  const [view, setView] = useState<ChartView>("bar");

  const data: Row[] = useMemo(
    () =>
      criteria.map((c) => ({
        id: c.id,
        name: c.name[locale],
        pillar: c.pillar,
        value: Math.round(scores[c.id] ?? 0),
      })),
    [criteria, scores, locale]
  );

  const height = Math.max(160, data.length * 31 + 20);

  const views: { key: ChartView; label: string }[] = [
    { key: "bar", label: t(locale, "chartViewBar") },
    { key: "line", label: t(locale, "chartViewLine") },
    { key: "table", label: t(locale, "chartViewTable") },
  ];

  return (
    <div>
      <div className="no-print mb-3 inline-flex rounded-full border border-ink/10 bg-white/60 p-1 text-xs font-medium">
        {views.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            aria-pressed={view === v.key}
            className={`rounded-full px-3 py-1.5 transition ${
              view === v.key ? "bg-ink text-paper" : "text-ink/60 hover:text-ink"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "bar" && <CriterionBarChart data={data} height={height} locale={locale} />}
      {view === "line" && <CriterionLineChart data={data} height={height} locale={locale} />}
      {view === "table" && <CriterionTable data={data} locale={locale} />}
    </div>
  );
}

/** Gemeinsames Y-Achsen-Tick für Balken- und Kurvenansicht: Kriteriumsname
 * rechtsbündig plus klickbarer "i"-Button, per foreignObject in die SVG-Achse
 * eingebettet (echtes, fokussierbares <button>-Element statt reiner SVG-Form). */
function CriterionYAxisTick(props: {
  x?: number;
  y?: number;
  payload?: { value: string };
  rows: Row[];
  locale: Locale;
}) {
  const { x = 0, y = 0, payload, rows, locale } = props;
  const row = rows.find((r) => r.id === payload?.value);
  if (!row) return null;
  const accent = PILLAR_COLOR[row.pillar];
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-206} y={-11} width={206} height={22}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 5,
            height: 22,
          }}
        >
          <span
            title={row.name}
            style={{
              fontSize: 12,
              color: "#211d17",
              fontFamily: "var(--font-plex-sans)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.name}
          </span>
          <CriterionInfoButton criterionId={row.id} name={row.name} locale={locale} accent={accent} />
        </div>
      </foreignObject>
    </g>
  );
}

function criterionTooltipLabel(data: Row[]) {
  return (id: string) => data.find((d) => d.id === id)?.name ?? id;
}

function CriterionBarChart({ data, height, locale }: { data: Row[]; height: number; locale: Locale }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#e7e1d4" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: "#211d17aa", fontSize: 11 }}
          axisLine={{ stroke: "#e7e1d4" }}
        />
        <YAxis
          type="category"
          dataKey="id"
          width={218}
          tick={(props) => <CriterionYAxisTick {...props} rows={data} locale={locale} />}
          axisLine={{ stroke: "#e7e1d4" }}
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, ""]}
          labelFormatter={criterionTooltipLabel(data)}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #e7e1d4",
            fontFamily: "var(--font-plex-sans)",
            fontSize: 13,
          }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={16}>
          {data.map((d) => (
            <Cell key={d.id} fill={PILLAR_COLOR[d.pillar]} fillOpacity={0.35 + (d.value / 100) * 0.55} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CriterionLineDot(props: { cx?: number; cy?: number; payload?: Row }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  return <circle cx={cx} cy={cy} r={4} fill={PILLAR_COLOR[payload.pillar]} stroke="#faf7f0" strokeWidth={1.5} />;
}

function CriterionLineChart({ data, height, locale }: { data: Row[]; height: number; locale: Locale }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#e7e1d4" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fill: "#211d17aa", fontSize: 11 }}
          axisLine={{ stroke: "#e7e1d4" }}
        />
        <YAxis
          type="category"
          dataKey="id"
          width={218}
          tick={(props) => <CriterionYAxisTick {...props} rows={data} locale={locale} />}
          axisLine={{ stroke: "#e7e1d4" }}
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, ""]}
          labelFormatter={criterionTooltipLabel(data)}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #e7e1d4",
            fontFamily: "var(--font-plex-sans)",
            fontSize: 13,
          }}
        />
        <Line
          dataKey="value"
          stroke="#211d1755"
          strokeWidth={2}
          dot={<CriterionLineDot />}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Barrierefreie Tabellen-Alternativansicht (immer verfügbar, unabhängig von
 * der gewählten Chart-Form) – Säule als Farb+Buchstaben-Chip (Identität nie
 * nur über Farbe), Wert als Zahl mit tabellarischen Ziffern plus Mini-Balken. */
function CriterionTable({ data, locale }: { data: Row[]; locale: Locale }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/60">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <tbody>
          {data.map((d) => {
            const accent = PILLAR_COLOR[d.pillar];
            return (
              <tr key={d.id} className="border-b border-ink/10 last:border-b-0">
                <td className="py-2.5 pl-4 pr-2 align-middle">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[9px] font-semibold text-white"
                      style={{ backgroundColor: accent }}
                      aria-hidden
                    >
                      {d.pillar}
                    </span>
                    <span className="text-ink">{d.name}</span>
                    <CriterionInfoButton criterionId={d.id} name={d.name} locale={locale} accent={accent} />
                  </div>
                </td>
                <td className="w-32 py-2.5 pr-4 text-right align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full bg-ink/50" style={{ width: `${d.value}%` }} />
                    </div>
                    <span className="font-mono tabular-nums text-ink">{d.value}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
