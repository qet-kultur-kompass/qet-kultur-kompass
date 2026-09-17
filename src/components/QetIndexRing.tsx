"use client";

import { PILLARS } from "@/lib/content/criteria";
import { MANAGEMENT_FIELDS } from "@/lib/content/managementFields";
import { overallIndex } from "@/lib/scoring";
import { QetLogo } from "./QetLogo";
import type { Locale, PillarKey } from "@/lib/content/types";

/** Gleiche Säulenfarben wie überall sonst in der App (Tabellen, Balken) –
 * siehe tailwind.config.ts (quality/ethics/transparency.500). */
const PILLAR_COLOR: Record<PillarKey, string> = { Q: "#3d54b0", E: "#2d7a56", T: "#c9862a" };

/** Heller, warmer Track-Ton – identisch zum bisherigen QetIndexGauge, damit
 * beide Gauges optisch zusammenpassen. */
const TRACK_COLOR = "#e7e1d4";

/** "Knallgrün" für den voll erreichten QET-Gesamtwert. Bewusst kräftiger als
 * das gedeckte Ethik-Grün, damit die Gesamtwertung optisch eindeutig von der
 * Säule "Ethik" unterscheidbar bleibt. */
const QET_GREEN = "#16a34a";

/** Dunkelgrauer, markentypischer Ton für den äußeren Managementfelder-Ring
 * (angelehnt an den "QET-Zirkel" aus den offiziellen Unterlagen – siehe
 * QetSymbol.tsx). Zeigt den noch nicht erreichten Anteil je Feld; der
 * erreichte Anteil wird zentrisch darüber in Grün eingeblendet (siehe
 * FIELD_FILL_COLOR) und verdrängt den grauen Anteil zusehends. */
const FIELD_RING_COLOR = "#4a453d";

/** Dunkler Ton, nur noch für die Kontur-Halo der Prozent-Beschriftung
 * (Text bleibt so lesbar, egal ob er über dem hellen oder dunklen Anteil
 * sitzt). Die Segmente selbst haben KEINEN Rand mehr – die "leere"
 * (noch nicht erreichte) Fläche ist schlicht hellgrau (TRACK_COLOR); die
 * Trennung zwischen Segmenten ergibt sich allein aus dem Zwischenraum
 * (fieldGap/pillarGap). */
const SEGMENT_BORDER_COLOR = "#211d17";

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Winkel-Konvention: 0° = 12-Uhr-Position, im Uhrzeigersinn wachsend. */
function pointOnCircle(cx: number, cy: number, r: number, deg: number) {
  return { x: cx + r * Math.sin(rad(deg)), y: cy - r * Math.cos(rad(deg)) };
}

function ringArcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const sweep = endDeg - startDeg;
  if (sweep <= 0.5) return "";
  const largeArc = sweep > 180 ? 1 : 0;
  const start = pointOnCircle(cx, cy, r, startDeg);
  const end = pointOnCircle(cx, cy, r, endDeg);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** Ringsegment ("Kreisring-Sektor") als eigenständige, gerade begrenzte
 * Fläche – zwei radiale Kanten plus Innen-/Außenbogen. Anders als ein
 * gerundeter Linien-Stroke ergibt das klar voneinander GETRENNTE Segmente
 * mit geraden Kanten, wie im offiziellen "QET-Zirkel"-Referenzbild. */
function wedgePath(cx: number, cy: number, rInner: number, rOuter: number, startDeg: number, endDeg: number) {
  const sweep = endDeg - startDeg;
  if (sweep <= 0.5) return "";
  const largeArc = sweep > 180 ? 1 : 0;
  const outerStart = pointOnCircle(cx, cy, rOuter, startDeg);
  const outerEnd = pointOnCircle(cx, cy, rOuter, endDeg);
  const innerEnd = pointOnCircle(cx, cy, rInner, endDeg);
  const innerStart = pointOnCircle(cx, cy, rInner, startDeg);
  return `M ${outerStart.x} ${outerStart.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y} Z`;
}

/** Kreissektor (Tortenstück) von startDeg bis endDeg, gefüllt bis zum
 * Mittelpunkt. Für den Sonderfall "voller Kreis" (100%) über zwei Halbkreis-
 * Bögen gezeichnet, da ein einzelner 360°-Arc-Pfad in SVG degeneriert. */
function pieSlicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const sweep = endDeg - startDeg;
  if (sweep <= 0.5) return "";
  if (sweep >= 359.5) {
    const mid = startDeg + 180;
    const p0 = pointOnCircle(cx, cy, r, startDeg);
    const pm = pointOnCircle(cx, cy, r, mid);
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 1 1 ${pm.x} ${pm.y} A ${r} ${r} 0 1 1 ${p0.x} ${p0.y} Z`;
  }
  const largeArc = sweep > 180 ? 1 : 0;
  const start = pointOnCircle(cx, cy, r, startDeg);
  const end = pointOnCircle(cx, cy, r, endDeg);
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

/** Pfad für gebogenen Text (SVG <textPath>). Damit Beschriftungen auf der
 * unteren Kreishälfte nicht auf dem Kopf stehen, wird der Pfad dort in
 * umgekehrter Richtung gezeichnet ("upright text on any position"-Trick). */
function labelArcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const mid = (((startDeg + endDeg) / 2) % 360 + 360) % 360;
  const flip = mid > 90 && mid < 270;
  const [a0, a1] = flip ? [endDeg, startDeg] : [startDeg, endDeg];
  const sweep = Math.abs(endDeg - startDeg);
  const largeArc = sweep > 180 ? 1 : 0;
  const sweepFlag = flip ? 0 : 1;
  const p0 = pointOnCircle(cx, cy, r, a0);
  const p1 = pointOnCircle(cx, cy, r, a1);
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${p1.x} ${p1.y}`;
}

/**
 * QET-Gesamtanzeige als dreistufiger Ring (angelehnt an den offiziellen
 * "QET-Zirkel"):
 *
 * - Äußerer Ring: die 7 Managementfelder als gleich große Segmente. Jedes
 *   Segment zeigt den erreichten Anteil zentrisch in Dunkelgrau (wachsende
 *   Strichstärke auf der Ringmittellinie) über der hellgrauen "leeren"
 *   Restfläche – bei 100 % ist der helle Anteil vollständig verdrängt.
 *   Kein Rand nötig: die Segmente werden allein durch den Zwischenraum
 *   sichtbar getrennt. Zusätzlich zeigt jedes Segment seinen aktuellen
 *   Prozentwert als gebogene Beschriftung.
 * - Mittlerer Ring: die 3 Säulen (Qualität/Ethik/Transparenz) – hier zeigt
 *   eine Farbfüllung den erreichten Anteil an, der Rest des Segments bleibt
 *   im hellen Track-Ton.
 * - Zentrum: der QET-Gesamtindex als flächiger Kreissektor in Knallgrün,
 *   Rest im hellen Track-Ton. Die weiße QET-Wortmarke sitzt im Mittelpunkt –
 *   über dem hellen Rest-Anteil ist sie kontrastarm bis unlesbar und wird
 *   erst bei 100 % vollständig sichtbar (weiß auf durchgängigem Grün).
 */
export function QetIndexRing({
  qetIndex,
  pillarScores,
  criterionScores,
  label,
  size = 320,
  locale = "de",
}: {
  qetIndex: number;
  pillarScores: Record<PillarKey, number>;
  criterionScores: Record<string, number>;
  label?: string;
  size?: number;
  locale?: Locale;
}) {
  const clampedIndex = Math.max(0, Math.min(100, qetIndex));
  const cx = size / 2;
  const cy = size / 2;

  const fieldRingWidth = size * 0.1;
  const pillarRingWidth = size * 0.09;
  const ringGap = size * 0.018;
  const outerR3 = size / 2 - fieldRingWidth / 2 - 6;
  const innerEdgeField = outerR3 - fieldRingWidth / 2;
  const outerR2 = innerEdgeField - ringGap - pillarRingWidth / 2;
  const innerEdgePillar = outerR2 - pillarRingWidth / 2;
  const innerGap = size * 0.035;
  const centerR = innerEdgePillar - innerGap;
  const logoWidth = centerR * 1.45;
  const logoHeight = (logoWidth * 44) / 150;

  const fields = MANAGEMENT_FIELDS.map((f) => ({
    ...f,
    score: Math.max(0, Math.min(100, overallIndex(criterionScores, f.criteriaIds))),
  }));
  const fieldGap = 3;
  const fieldSweep = (360 - fields.length * fieldGap) / fields.length;
  const fieldPctFontSize = size * 0.03;

  const pillarSegments: { key: PillarKey; start: number }[] = [
    { key: "Q", start: 0 },
    { key: "E", start: 120 },
    { key: "T", start: 240 },
  ];
  const pillarGap = 8;
  const pillarSweep = 120 - pillarGap;
  const pillarFontSize = size * 0.028;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Äußerer Ring: 7 klar getrennte Managementfeld-Segmente (gerade
         * Kanten, kein Rundungs-Stroke – siehe wedgePath). Hintergrund je
         * Segment hellgrau (Track), ohne Rand; der erreichte Anteil wird
         * zentrisch in Dunkelgrau eingeblendet: ein schmalerer, radial
         * mittig sitzender Teil-Sektor wächst mit steigendem Wert in der
         * Breite und verdrängt so das Hellgrau, bis es bei 100 % ganz
         * verschwindet. Die Trennung zwischen Segmenten ergibt sich allein
         * aus dem Zwischenraum (fieldGap). */}
        {fields.map((field, i) => {
          const start = i * (fieldSweep + fieldGap);
          const end = start + fieldSweep;
          const labelId = `field-pct-${field.key}`;
          const rOuter = outerR3 + fieldRingWidth / 2;
          const rInner = outerR3 - fieldRingWidth / 2;
          const rMid = outerR3;
          const filledThickness = fieldRingWidth * (field.score / 100);
          const rFillOuter = rMid + filledThickness / 2;
          const rFillInner = rMid - filledThickness / 2;
          return (
            <g key={field.key}>
              <title>{`${field.name[locale]}: ${Math.round(field.score)}%`}</title>
              <path d={wedgePath(cx, cy, rInner, rOuter, start, end)} fill={TRACK_COLOR} />
              {filledThickness > 0.5 && (
                <path d={wedgePath(cx, cy, rFillInner, rFillOuter, start, end)} fill={FIELD_RING_COLOR} />
              )}
              <path id={labelId} d={labelArcPath(cx, cy, outerR3, start + 2.5, end - 2.5)} fill="none" />
              <text
                fontSize={fieldPctFontSize}
                fontWeight={700}
                fill="#ffffff"
                stroke={SEGMENT_BORDER_COLOR}
                strokeWidth={fieldPctFontSize * 0.09}
                paintOrder="stroke fill"
                strokeLinejoin="round"
                letterSpacing={0.3}
              >
                <textPath href={`#${labelId}`} startOffset="50%" textAnchor="middle" dominantBaseline="central">
                  {Math.round(field.score)}%
                </textPath>
              </text>
            </g>
          );
        })}

        {/* Mittlerer Ring: 3 klar getrennte Säulen-Segmente (gerade Kanten,
         * ohne Rand). Farbfüllung als Teil-Sektor ab Segmentanfang zeigt
         * den erreichten Anteil, der Rest des Segments bleibt im hellen
         * Track-Ton. */}
        {pillarSegments.map((seg) => {
          const score = Math.max(0, Math.min(100, pillarScores[seg.key] ?? 0));
          const filledSweep = (score / 100) * pillarSweep;
          const pillarMeta = PILLARS.find((p) => p.key === seg.key)!;
          const labelId = `pillar-label-${seg.key}`;
          const rOuter = outerR2 + pillarRingWidth / 2;
          const rInner = outerR2 - pillarRingWidth / 2;
          return (
            <g key={seg.key}>
              <title>{`${pillarMeta.name[locale]}: ${Math.round(score)}%`}</title>
              <path d={wedgePath(cx, cy, rInner, rOuter, seg.start, seg.start + pillarSweep)} fill={TRACK_COLOR} />
              {filledSweep > 0.5 && (
                <path
                  d={wedgePath(cx, cy, rInner, rOuter, seg.start, seg.start + filledSweep)}
                  fill={PILLAR_COLOR[seg.key]}
                />
              )}
              <path
                id={labelId}
                d={labelArcPath(cx, cy, outerR2, seg.start + 4, seg.start + pillarSweep - 4)}
                fill="none"
              />
              <text fontSize={pillarFontSize} fontWeight={700} fill="#ffffff" letterSpacing={0.4}>
                <textPath href={`#${labelId}`} startOffset="50%" textAnchor="middle" dominantBaseline="central">
                  {pillarMeta.name[locale].toUpperCase()} · {Math.round(score)}%
                </textPath>
              </text>
            </g>
          );
        })}

        {/* Zentrum: QET-Gesamtindex flächig in Knallgrün */}
        <circle cx={cx} cy={cy} r={centerR} fill={TRACK_COLOR} />
        {clampedIndex > 0.5 && (
          <path d={pieSlicePath(cx, cy, centerR, 0, (clampedIndex / 100) * 360)} fill={QET_GREEN} />
        )}
        <title>{`QET-Index: ${Math.round(clampedIndex)}%`}</title>

        <g transform={`translate(${cx - logoWidth / 2}, ${cy - logoHeight / 2})`}>
          <QetLogo tone="white" width={logoWidth} height={logoHeight} />
        </g>
      </svg>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-2xl font-semibold text-ink">{Math.round(clampedIndex)}</span>
        <span className="text-xs text-ink/60">/ 100</span>
      </div>
      {label && <div className="mt-0.5 font-display text-sm font-medium text-ink/70">{label}</div>}

      <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-1 text-xs text-ink/70 sm:grid-cols-2">
        {fields.map((field) => (
          <span key={field.key} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: FIELD_RING_COLOR }} aria-hidden />
            {field.name[locale]} · {Math.round(field.score)}%
          </span>
        ))}
      </div>
    </div>
  );
}
