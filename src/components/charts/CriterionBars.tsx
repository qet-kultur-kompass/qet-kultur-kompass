"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Criterion, Locale } from "@/lib/content/types";
import { PILLAR_COLOR } from "./PillarRadar";

/**
 * Balkendiagramm für eine beliebige Kriterien-Auswahl. Wird sowohl für eine
 * einzelne Säule (Gesamttest-Tabs, Säulen-Teiltest) als auch für ein
 * Managementfeld verwendet, das mehrere Säulen mischt – die Farbe pro Balken
 * richtet sich daher immer nach der Säule DES JEWEILIGEN Kriteriums, nicht
 * nach einer einzigen für den ganzen Chart übergebenen Säule.
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
  const data = criteria.map((c) => ({
    id: c.id,
    name: c.name[locale],
    pillar: c.pillar,
    value: Math.round(scores[c.id] ?? 0),
  }));

  // Höhe proportional zur Anzahl Kriterien (20 Kriterien ≈ 620px, wie zuvor
  // fest verdrahtet) – Managementfeld-Tests haben teils weniger/mehr Zeilen.
  const height = Math.max(160, data.length * 31 + 20);

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
          dataKey="name"
          width={190}
          tick={{ fill: "#211d17", fontSize: 12 }}
          axisLine={{ stroke: "#e7e1d4" }}
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, ""]}
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
