"use client";

import { bandFor } from "@/lib/scoring";
import { t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";

const BAND_COLOR: Record<string, string> = {
  critical: "#b3432b",
  watch: "#c9862a",
  solid: "#3d54b0",
  strong: "#2d7a56",
};

const BAND_LABEL_KEY: Record<string, string> = {
  critical: "bandCritical",
  watch: "bandWatch",
  solid: "bandSolid",
  strong: "bandStrong",
};

/** Kompass-Zeiger-Gauge: 0–100 auf einen 270°-Bogen abgebildet, Zeiger zeigt
 * auf den QET-Index. Nimmt bewusst die Kompass-Metapher der Marke auf. */
export function QetIndexGauge({
  value,
  label,
  size = 220,
  locale = "de",
}: {
  value: number;
  label?: string;
  size?: number;
  locale?: Locale;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const band = bandFor(clamped);
  const color = BAND_COLOR[band];

  const startAngle = -225; // Grad, 0 = rechts, im Uhrzeigersinn
  const sweep = 270;
  const angle = startAngle + (clamped / 100) * sweep;
  const rad = (deg: number) => (deg * Math.PI) / 180;

  const r = size / 2 - 18;
  const cx = size / 2;
  const cy = size / 2;

  const arcPoint = (deg: number) => ({
    x: cx + r * Math.cos(rad(deg)),
    y: cy + r * Math.sin(rad(deg)),
  });

  const start = arcPoint(startAngle);
  const end = arcPoint(startAngle + sweep);
  const largeArc = sweep > 180 ? 1 : 0;

  const needleLen = r - 14;
  const needleEnd = {
    x: cx + needleLen * Math.cos(rad(angle)),
    y: cy + needleLen * Math.sin(rad(angle)),
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="#e7e1d4"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${arcPoint(angle).x} ${
            arcPoint(angle).y
          }`}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="#211d17"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="#211d17" />
        <text
          x={cx}
          y={cy - r / 2.4}
          textAnchor="middle"
          fontFamily="var(--font-plex-mono)"
          fontSize={size * 0.16}
          fontWeight={600}
          fill="#211d17"
        >
          {Math.round(clamped)}
        </text>
        <text
          x={cx}
          y={cy - r / 2.4 + 18}
          textAnchor="middle"
          fontFamily="var(--font-plex-sans)"
          fontSize={11}
          fill="#211d17aa"
        >
          / 100
        </text>
      </svg>
      {label && <div className="mt-1 font-display text-sm font-medium text-ink/70">{label}</div>}
      <div
        className="mt-1 rounded-full px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {t(locale, BAND_LABEL_KEY[band])}
      </div>
    </div>
  );
}
