"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { PILLARS } from "@/lib/content/criteria";
import type { PillarKey, Locale } from "@/lib/content/types";

const PILLAR_COLOR: Record<PillarKey, string> = { Q: "#3d54b0", E: "#2d7a56", T: "#c9862a" };

export function PillarRadar({
  scores,
  locale = "de",
}: {
  scores: Record<PillarKey, number>;
  locale?: Locale;
}) {
  const data = PILLARS.map((p) => ({
    pillar: p.name[locale],
    key: p.key,
    value: Math.round(scores[p.key] ?? 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#e5e5e7" />
        <PolarAngleAxis
          dataKey="pillar"
          tick={{ fill: "#1d1d1f", fontSize: 13, fontFamily: "var(--font-plex-sans)" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#1d1d1faa", fontSize: 10 }}
          tickCount={5}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#3d54b0"
          fill="#3d54b0"
          fillOpacity={0.28}
          strokeWidth={2}
          dot={{ r: 3, fill: "#3d54b0" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export { PILLAR_COLOR };
