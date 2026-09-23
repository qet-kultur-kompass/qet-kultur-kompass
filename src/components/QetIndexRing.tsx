"use client";

import { useState } from "react";
import { CRITERIA, PILLARS } from "@/lib/content/criteria";
import { MANAGEMENT_FIELDS } from "@/lib/content/managementFields";
import { bandFor, overallIndex, type Band } from "@/lib/scoring";
import { t } from "@/lib/content/i18n";
import { resolveText } from "@/lib/content/types";
import type { Locale, PillarKey } from "@/lib/content/types";

/** Gleiche, etwas matteren Säulenfarben wie im offiziellen QET-Logo (siehe
 * QetSymbol.tsx) – per Bildpipette aus dem vom Nutzer bereitgestellten
 * Referenzbild ermittelt. Bewusst NICHT dieselben kräftigeren Töne wie in
 * den Balken-/Radar-Diagrammen (CriterionBars.tsx, PillarRadar.tsx,
 * BusinessReportView.tsx) – dort bleiben die kräftigeren Farben für
 * Lesbarkeit/Kontrast unverändert; hier im Ergebnis-Ring soll die Optik zur
 * Marke passen. */
const PILLAR_COLOR: Record<PillarKey, string> = { Q: "#6f83bc", E: "#799683", T: "#caab76" };

/** Heller, warmer Track-Ton – identisch zum bisherigen QetIndexGauge, damit
 * beide Gauges optisch zusammenpassen. */
const TRACK_COLOR = "#e7e1d4";

/** Dunkelgrauer, markentypischer Ton – sowohl für den äußeren
 * Managementfelder-Ring als auch für die zentrische Füllung des
 * QET-Gesamtindex (siehe unten). Bewusst neutral statt farbig (früher
 * Knallgrün): so bleibt die Gesamtwertung klar von der Säule "Ethik"
 * unterscheidbar, und derselbe Ton signalisiert im ganzen Ring einheitlich
 * "erreichter Anteil" – außen wie im Zentrum. */
const FIELD_RING_COLOR = "#4a453d";

/** Dunkler Ton, nur noch für die Kontur-Halo der Prozent-Beschriftung
 * (Text bleibt so lesbar, egal ob er über dem hellen oder dunklen Anteil
 * sitzt). Die Segmente selbst haben KEINEN Rand mehr – die "leere"
 * (noch nicht erreichte) Fläche ist schlicht hellgrau (TRACK_COLOR); die
 * Trennung zwischen Segmenten ergibt sich allein aus dem Zwischenraum
 * (fieldGap/pillarGap). */
const SEGMENT_BORDER_COLOR = "#211d17";

/** Kontur-Farbe für das gerade angetippte/angeklickte Segment (siehe
 * SegmentSelection) – deutlich sichtbar auf jedem Untergrund. */
const SELECTED_OUTLINE_COLOR = "#1d1d1f";

/** Gleiche Band-Farben wie überall sonst in der App (siehe z.B.
 * BusinessReportView.tsx) – hier für die aufklappbare Kriterien-Liste je
 * angeklicktem Segment. */
const BAND_COLOR: Record<Band, string> = {
  critical: "#b3432b",
  watch: "#c9862a",
  solid: "#3d54b0",
  strong: "#2d7a56",
};

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

/** Welches Ring-Segment aktuell aufgeklappt ist (siehe Kriterien-Liste unter
 * dem Ring) – `null`, solange nichts angeklickt wurde. */
type SegmentSelection = { kind: "field"; key: string } | { kind: "pillar"; key: PillarKey };

/**
 * QET-Gesamtanzeige als dreistufiger Ring (angelehnt an den offiziellen
 * "QET-Zirkel"):
 *
 * - Äußerer Ring: die 7 Managementfelder als gleich große Segmente. Jedes
 *   Segment zeigt den erreichten Anteil zentrisch in Dunkelgrau (wachsende
 *   Strichstärke auf der Ringmittellinie) über der hellgrauen "leeren"
 *   Restfläche – bei 100 % ist der helle Anteil vollständig verdrängt.
 *   Kein Rand nötig: die Segmente werden allein durch den Zwischenraum
 *   sichtbar getrennt. Zusätzlich zeigt jedes Segment als gebogene
 *   Beschriftung eine dreibuchstabige Kurzform des Feldnamens plus den
 *   aktuellen Prozentwert (voller Name: Tooltip, Legende unter dem Ring
 *   und Klick-Detail, siehe unten – auf der schmalen 48°-Sektorbreite ist
 *   für den vollen, lokalisierten Feldnamen kein verlässlicher Platz).
 * - Mittlerer Ring: die 3 Säulen (Qualität/Ethik/Transparenz) – hier zeigt
 *   eine Farbfüllung den erreichten Anteil an, der Rest des Segments bleibt
 *   im hellen Track-Ton.
 * - Zentrum: der QET-Gesamtindex als zentrisch von innen nach außen
 *   wachsender Kreis in einem neutralen Dunkelgrau (FIELD_RING_COLOR,
 *   derselbe Ton wie der erreichte Anteil im äußeren Feldring – bewusst
 *   nicht mehr Knallgrün, das mit der Säule "Ethik" verwechselbar wäre),
 *   umgeben vom hellen Track-Ton. Anders als die Ring-Segmente wächst diese
 *   Füllung radial (Radius proportional zum Indexwert) statt als
 *   Kreissektor/Uhrzeiger-Sweep – das visuelle Bild eines "wachsenden
 *   Kerns" passt besser zu einem einzelnen Gesamtwert ohne Start-/
 *   Endwinkel. Darüber – als eigenständige Wortmarke aus "INDEX" plus der
 *   Zahl, nicht mehr das QET-Logo selbst, dessen weißer Schriftzug über dem
 *   hellen Rest-Anteil kaum lesbar war (erst bei 100 % voll sichtbar). Die
 *   neue Beschriftung nutzt den gleichen Kontur-Halo-Trick wie die
 *   Managementfeld-Prozente (weiße Füllung, dunkle Kontur) und bleibt so
 *   unabhängig vom Füllstand immer lesbar – das dreiteilige
 *   Säulen-Farbschema des Rings selbst (siehe QetSymbol.tsx) trägt die
 *   Markenidentität, "QET-Index" + Zahl bleiben rein informativ und bilden
 *   mit dem Ring eine durchgängige, konsistente Darstellung.
 *
 * Jedes Feld- und Säulen-Segment ist anklickbar (Maus & Tastatur): ein Klick
 * blendet direkt unter dem Ring die dazugehörige Kriterien-Auswertung ein
 * (Name + erreichter Prozentwert je Kriterium, farblich nach Band). So kommt
 * man von jedem Segment aus mit einem Klick zur jeweiligen Detailauswertung,
 * ohne die Seite zu wechseln – funktioniert überall dort, wo der Ring
 * eingebunden ist (Dashboard, Report, Test-Ergebnis, Verlauf).
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
  /** Beschriftung im Ringzentrum, über der Zahl. Fällt auf die lokalisierte
   * "QET-Index"-Übersetzung zurück, wenn nichts übergeben wird. Bewusst
   * kurz halten (siehe QetIndexGauge.tsx für die Begründung) – der Ring
   * bietet nur wenig Platz. */
  label?: string;
  size?: number;
  locale?: Locale;
}) {
  const [selected, setSelected] = useState<SegmentSelection | null>(null);
  const clampedIndex = Math.max(0, Math.min(100, qetIndex));
  const caption = label ?? t(locale, "qetIndex");
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
  const indexLabelFontSize = centerR * 0.17;
  const indexNumberFontSize = centerR * 0.6;

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

  function toggleField(key: string) {
    setSelected((prev) => (prev?.kind === "field" && prev.key === key ? null : { kind: "field", key }));
  }
  function togglePillar(key: PillarKey) {
    setSelected((prev) => (prev?.kind === "pillar" && prev.key === key ? null : { kind: "pillar", key }));
  }

  const selectedTitle = (() => {
    if (!selected) return "";
    if (selected.kind === "field") {
      const field = fields.find((f) => f.key === selected.key);
      return field ? resolveText(field.name, locale) : "";
    }
    const pillar = PILLARS.find((p) => p.key === selected.key);
    return pillar ? resolveText(pillar.name, locale) : "";
  })();

  const selectedScore = (() => {
    if (!selected) return 0;
    if (selected.kind === "field") return fields.find((f) => f.key === selected.key)?.score ?? 0;
    return pillarScores[selected.key] ?? 0;
  })();

  const selectedCriteria = (() => {
    if (!selected) return [];
    let list: typeof CRITERIA;
    if (selected.kind === "field") {
      const field = MANAGEMENT_FIELDS.find((f) => f.key === selected.key);
      const idSet = new Set(field?.criteriaIds ?? []);
      list = CRITERIA.filter((c) => idSet.has(c.id));
    } else {
      list = CRITERIA.filter((c) => c.pillar === selected.key);
    }
    return list
      .map((c) => ({ id: c.id, name: resolveText(c.name, locale), score: criterionScores[c.id] ?? 0 }))
      .sort((a, b) => b.score - a.score);
  })();

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
         * aus dem Zwischenraum (fieldGap). Jedes Segment ist anklickbar –
         * siehe toggleField/SegmentSelection. */}
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
          const isSelected = selected?.kind === "field" && selected.key === field.key;
          const fieldTitle = resolveText(field.name, locale);
          return (
            <g
              key={field.key}
              onClick={() => toggleField(field.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleField(field.key);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${fieldTitle}: ${Math.round(field.score)}%`}
              style={{ cursor: "pointer" }}
            >
              <title>{`${fieldTitle}: ${Math.round(field.score)}%`}</title>
              <path d={wedgePath(cx, cy, rInner, rOuter, start, end)} fill={TRACK_COLOR} />
              {filledThickness > 0.5 && (
                <path d={wedgePath(cx, cy, rFillInner, rFillOuter, start, end)} fill={FIELD_RING_COLOR} />
              )}
              {isSelected && (
                <path
                  d={wedgePath(cx, cy, rInner, rOuter, start, end)}
                  fill="none"
                  stroke={SELECTED_OUTLINE_COLOR}
                  strokeWidth={2}
                />
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
                  {fieldTitle.slice(0, 3).trim().toUpperCase()} · {Math.round(field.score)}%
                </textPath>
              </text>
            </g>
          );
        })}

        {/* Mittlerer Ring: 3 klar getrennte Säulen-Segmente (gerade Kanten,
         * ohne Rand). Farbfüllung als Teil-Sektor ab Segmentanfang zeigt
         * den erreichten Anteil, der Rest des Segments bleibt im hellen
         * Track-Ton. Ebenfalls anklickbar – siehe togglePillar. */}
        {pillarSegments.map((seg) => {
          const score = Math.max(0, Math.min(100, pillarScores[seg.key] ?? 0));
          const filledSweep = (score / 100) * pillarSweep;
          const pillarMeta = PILLARS.find((p) => p.key === seg.key)!;
          const labelId = `pillar-label-${seg.key}`;
          const rOuter = outerR2 + pillarRingWidth / 2;
          const rInner = outerR2 - pillarRingWidth / 2;
          const isSelected = selected?.kind === "pillar" && selected.key === seg.key;
          const pillarTitle = resolveText(pillarMeta.name, locale);
          return (
            <g
              key={seg.key}
              onClick={() => togglePillar(seg.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePillar(seg.key);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${pillarTitle}: ${Math.round(score)}%`}
              style={{ cursor: "pointer" }}
            >
              <title>{`${pillarTitle}: ${Math.round(score)}%`}</title>
              <path d={wedgePath(cx, cy, rInner, rOuter, seg.start, seg.start + pillarSweep)} fill={TRACK_COLOR} />
              {filledSweep > 0.5 && (
                <path
                  d={wedgePath(cx, cy, rInner, rOuter, seg.start, seg.start + filledSweep)}
                  fill={PILLAR_COLOR[seg.key]}
                />
              )}
              {isSelected && (
                <path
                  d={wedgePath(cx, cy, rInner, rOuter, seg.start, seg.start + pillarSweep)}
                  fill="none"
                  stroke={SELECTED_OUTLINE_COLOR}
                  strokeWidth={2}
                />
              )}
              <path
                id={labelId}
                d={labelArcPath(cx, cy, outerR2, seg.start + 4, seg.start + pillarSweep - 4)}
                fill="none"
              />
              <text fontSize={pillarFontSize} fontWeight={700} fill="#ffffff" letterSpacing={0.4}>
                <textPath href={`#${labelId}`} startOffset="50%" textAnchor="middle" dominantBaseline="central">
                  {pillarTitle.toUpperCase()} · {Math.round(score)}%
                </textPath>
              </text>
            </g>
          );
        })}

        {/* Zentrum: QET-Gesamtindex als zentrisch (radial) wachsender Kreis
         * in neutralem Dunkelgrau – der Radius skaliert direkt mit dem
         * Indexwert, statt wie zuvor als Kreissektor im Uhrzeigersinn zu
         * wachsen. Darüber "QET-INDEX" + Zahl als durchgängig lesbare
         * Wortmarke (weiße Füllung mit dunkler Kontur-Halo, wie die
         * Managementfeld-Prozente im äußeren Ring) – bleibt so bei jedem
         * Füllstand klar erkennbar, statt wie zuvor erst bei 100 % sichtbar
         * zu werden. */}
        <circle cx={cx} cy={cy} r={centerR} fill={TRACK_COLOR} />
        {clampedIndex > 0.5 && (
          <circle cx={cx} cy={cy} r={centerR * (clampedIndex / 100)} fill={FIELD_RING_COLOR} />
        )}
        <title>{`QET-Index: ${Math.round(clampedIndex)}%`}</title>

        <text
          x={cx}
          y={cy - centerR * 0.34}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-plex-sans)"
          fontWeight={700}
          fontSize={indexLabelFontSize}
          fill="#ffffff"
          stroke={SEGMENT_BORDER_COLOR}
          strokeWidth={indexLabelFontSize * 0.09}
          paintOrder="stroke fill"
          strokeLinejoin="round"
          letterSpacing={1}
        >
          {caption.toUpperCase()}
        </text>
        <text
          x={cx}
          y={cy + centerR * 0.32}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-fraunces)"
          fontWeight={600}
          fontSize={indexNumberFontSize}
          fill="#ffffff"
          stroke={SEGMENT_BORDER_COLOR}
          strokeWidth={indexNumberFontSize * 0.06}
          paintOrder="stroke fill"
          strokeLinejoin="round"
        >
          {Math.round(clampedIndex)}
        </text>
      </svg>

      {selected && (
        <div className="mt-4 w-full rounded-2xl border border-ink/10 bg-white/70 p-4 shadow-card" style={{ maxWidth: size }}>
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-display text-sm font-semibold text-ink">
              {selectedTitle} · <span className="font-mono">{Math.round(selectedScore)}%</span>
            </h4>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label={t(locale, "criterionInfoClose")}
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-ink/40 transition hover:bg-ink/5 hover:text-ink/70"
            >
              ✕
            </button>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink/75">
            {selectedCriteria.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3">
                <span>{c.name}</span>
                <span className="font-mono" style={{ color: BAND_COLOR[bandFor(c.score)] }}>
                  {Math.round(c.score)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-1 text-xs text-ink/70 sm:grid-cols-2">
        {fields.map((field) => (
          <span key={field.key} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: FIELD_RING_COLOR }} aria-hidden />
            {resolveText(field.name, locale)} · {Math.round(field.score)}%
          </span>
        ))}
      </div>
    </div>
  );
}
