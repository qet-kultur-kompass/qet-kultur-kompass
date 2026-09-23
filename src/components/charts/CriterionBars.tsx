"use client";

import { useEffect, useMemo, useState } from "react";
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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import type { Criterion, PillarKey, Locale } from "@/lib/content/types";
import { resolveText } from "@/lib/content/types";
import { PILLAR_COLOR } from "./PillarRadar";
import { CriterionInfoButton } from "./CriterionInfoButton";
import { CriterionNoteCell, type CriterionNoteValue } from "./CriterionNoteCell";
import { t } from "@/lib/content/i18n";

type ChartView = "bar" | "line" | "radar" | "table";

type Row = { id: string; name: string; pillar: PillarKey; value: number; special: boolean };

/** Eigene Akzentfarbe für Sonderkriterien (aktuell: das KI-Sonderkriterium
 * Q21/E21/T21) – bewusst deutlich von allen drei Säulenfarben (Blau/Grün/
 * Gold) unterscheidbar, damit ein Sonderkriterium auf einen Blick erkennbar
 * ist, unabhängig davon, welcher Säule es gerade zugeordnet ist. */
const SPECIAL_COLOR = "#7c3aed";

function accentFor(row: { pillar: PillarKey; special: boolean }): string {
  return row.special ? SPECIAL_COLOR : PILLAR_COLOR[row.pillar];
}

/** Grobe Schätzung, wie viele Zeilen ein Kriteriumsname bei ~27 Zeichen pro
 * Zeile braucht (siehe CriterionYAxisTick) – bewusst eher zu großzügig als
 * zu knapp geschätzt, damit nie Text abgeschnitten wird. */
function estimateLines(name: string) {
  return Math.max(1, Math.ceil(name.length / 27));
}

/**
 * Ergebnisdarstellung für eine beliebige Kriterien-Auswahl, mit umschaltbarer
 * Darstellungsform (Balken / Kurve / Netzstruktur / Tabelle – die Tabelle ist
 * immer die barrierefreie Alternativansicht UND die voreingestellte
 * Startansicht, da sie als einzige den vollen Funktionsumfang je Kriterium
 * bietet) und einem "i"-Info-Button je Kriterium mit Kurzbeschreibung, der in
 * allen vier Darstellungen einheitlich funktioniert (siehe
 * CriterionInfoButton.tsx – das Overlay wird dafür per Portal gerendert).
 * Wird sowohl für eine einzelne Säule
 * (Gesamttest-Tabs, Säulen-Teiltest) als auch für ein Managementfeld
 * verwendet, das mehrere Säulen mischt – die Farbe pro Zeile richtet sich
 * daher immer nach der Säule DES JEWEILIGEN Kriteriums, nicht nach einer
 * einzigen für den ganzen Chart übergebenen Säule. Ausnahme: Sonderkriterien
 * (`special: true`, aktuell das KI-Sonderkriterium) bekommen unabhängig von
 * ihrer Säule immer die eigene Akzentfarbe SPECIAL_COLOR, siehe accentFor().
 *
 * Zusätzlich (Tabellen-Ansicht): persönliche Notizen/Todos je Kriterium
 * (eckige Erledigt-Checkbox + Stift-Icon für Freitext, siehe
 * CriterionNoteCell.tsx). Werden nur geladen/angezeigt, wenn eine
 * Self-Service-Session besteht (`/api/criterion-notes` antwortet dann mit
 * 200 statt 401) – auf anonymen Ansichten (Umfrage-Link, öffentliches
 * Firmen-Dashboard) bleibt die Notiz-Spalte einfach weg, da es dort keine
 * feste Identität gibt, an die eine Notiz gehängt werden könnte.
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
  // "Tabelle" ist bewusst die Startansicht: sie ist die einzige Darstellung
  // mit vollem Funktionsumfang je Kriterium (Info-Button, bei bestehender
  // Session zusätzlich Notiz/Todo – siehe CriterionTable weiter unten).
  const [view, setView] = useState<ChartView>("table");
  const [notes, setNotes] = useState<Record<string, CriterionNoteValue>>({});
  const [notesEnabled, setNotesEnabled] = useState(false);

  const data: Row[] = useMemo(
    () =>
      criteria.map((c) => ({
        id: c.id,
        name: resolveText(c.name, locale),
        pillar: c.pillar,
        value: Math.round(scores[c.id] ?? 0),
        special: Boolean(c.special),
      })),
    [criteria, scores, locale]
  );

  const rowHeight = useMemo(() => {
    const maxLines = Math.max(1, ...data.map((d) => estimateLines(d.name)));
    return 22 + (maxLines - 1) * 14;
  }, [data]);
  const height = Math.max(160, data.length * rowHeight + 20);

  // Persönliche Notizen einmalig laden – 401 (keine Session) bedeutet
  // bewusst "Feature bleibt aus", kein Fehler.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/criterion-notes")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((body: { notes?: Record<string, CriterionNoteValue> }) => {
        if (cancelled) return;
        setNotes(body.notes ?? {});
        setNotesEnabled(true);
      })
      .catch(() => {
        if (!cancelled) setNotesEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function saveNote(criterionId: string, patch: Partial<CriterionNoteValue>) {
    setNotes((prev) => {
      const current = prev[criterionId] ?? { text: "", done: false };
      const next = { ...current, ...patch };
      if (!next.text.trim() && !next.done) {
        const rest = { ...prev };
        delete rest[criterionId];
        return rest;
      }
      return { ...prev, [criterionId]: next };
    });
    fetch("/api/criterion-notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ criterionId, ...patch }),
    }).catch(() => {});
  }

  const views: { key: ChartView; label: string }[] = [
    { key: "bar", label: t(locale, "chartViewBar") },
    { key: "line", label: t(locale, "chartViewLine") },
    { key: "radar", label: t(locale, "chartViewRadar") },
    { key: "table", label: t(locale, "chartViewTable") },
  ];

  return (
    <div>
      <div className="no-print mb-3 inline-flex flex-wrap rounded-full border border-ink/10 bg-white/60 p-1 text-xs font-medium">
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

      {view === "bar" && <CriterionBarChart data={data} height={height} rowHeight={rowHeight} locale={locale} />}
      {view === "line" && <CriterionLineChart data={data} height={height} rowHeight={rowHeight} locale={locale} />}
      {view === "radar" && <CriterionRadarChart data={data} locale={locale} />}
      {view === "table" && (
        <CriterionTable
          data={data}
          locale={locale}
          notes={notesEnabled ? notes : undefined}
          onToggleDone={notesEnabled ? (id, done) => saveNote(id, { done }) : undefined}
          onSaveText={notesEnabled ? (id, text) => saveNote(id, { text }) : undefined}
        />
      )}
    </div>
  );
}

/** Gemeinsames Y-Achsen-Tick für Balken- und Kurvenansicht: Kriteriumsname
 * rechtsbündig plus klickbarer "i"-Button, per foreignObject in die SVG-Achse
 * eingebettet (echtes, fokussierbares <button>-Element statt reiner SVG-Form).
 * Der Name wird NICHT mehr abgeschnitten (kein textOverflow/ellipsis) –
 * er darf über mehrere Zeilen umbrechen, die Zeilenhöhe der ganzen Reihe
 * (rowHeight, siehe estimateLines) ist dafür bereits großzügig genug
 * bemessen, sodass immer der vollständige Text sichtbar bleibt. */
function CriterionYAxisTick(props: {
  x?: number;
  y?: number;
  payload?: { value: string };
  rows: Row[];
  locale: Locale;
  rowHeight: number;
}) {
  const { x = 0, y = 0, payload, rows, locale, rowHeight } = props;
  const row = rows.find((r) => r.id === payload?.value);
  if (!row) return null;
  const accent = accentFor(row);
  const boxHeight = Math.max(18, rowHeight - 6);
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-206} y={-boxHeight / 2} width={206} height={boxHeight}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 5,
            height: boxHeight,
          }}
        >
          <span
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              fontSize: 11.5,
              lineHeight: "13px",
              color: "#211d17",
              fontFamily: "var(--font-plex-sans)",
              whiteSpace: "normal",
              overflowWrap: "break-word",
              textAlign: "right",
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

function CriterionBarChart({
  data,
  height,
  rowHeight,
  locale,
}: {
  data: Row[];
  height: number;
  rowHeight: number;
  locale: Locale;
}) {
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
          tick={(props) => <CriterionYAxisTick {...props} rows={data} locale={locale} rowHeight={rowHeight} />}
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
            <Cell key={d.id} fill={accentFor(d)} fillOpacity={0.35 + (d.value / 100) * 0.55} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CriterionLineDot(props: { cx?: number; cy?: number; payload?: Row }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  return <circle cx={cx} cy={cy} r={4} fill={accentFor(payload)} stroke="#faf7f0" strokeWidth={1.5} />;
}

function CriterionLineChart({
  data,
  height,
  rowHeight,
  locale,
}: {
  data: Row[];
  height: number;
  rowHeight: number;
  locale: Locale;
}) {
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
          tick={(props) => <CriterionYAxisTick {...props} rows={data} locale={locale} rowHeight={rowHeight} />}
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

/** Beschriftung je Speiche im Netzdiagramm: kurzer Kriterien-Code (z.B.
 * "Q07") statt vollem Namen – auf einem Kreis ist schlicht kein Platz für
 * lange Texte. Der volle Name bleibt trotzdem jederzeit erreichbar: über
 * den Tooltip beim Hover/Tap auf den Punkt, vollständig (nie abgeschnitten)
 * in der Balken-, Kurven- und Tabellen-Ansicht, UND über den "i"-Info-Button
 * direkt an der Speiche (wie in den anderen drei Darstellungen – per
 * foreignObject radial etwas weiter außen als die Code-Beschriftung selbst
 * platziert, damit er unabhängig von der Position der Speiche – oben,
 * unten, seitlich – nicht mit ihr überlappt). Farbe der Beschriftung =
 * Säulenfarbe des jeweiligen Kriteriums (bzw. SPECIAL_COLOR für das
 * KI-Sonderkriterium, siehe accentFor()). */
function CriterionRadarTick(props: {
  cx?: number;
  cy?: number;
  x?: number;
  y?: number;
  payload?: { value: string };
  textAnchor?: string;
  rows: Row[];
  locale: Locale;
}) {
  const { cx = 0, cy = 0, x = 0, y = 0, payload, textAnchor, rows, locale } = props;
  const row = rows.find((r) => r.id === payload?.value);
  const fill = row ? accentFor(row) : "#211d17";
  // Radiale Richtung vom Diagramm-Zentrum durch den Tick-Punkt – der
  // Info-Button wird entlang dieser Richtung ein Stück weiter nach außen
  // versetzt, statt seine Position anhand von textAnchor zu schätzen. So
  // sitzt er bei jeder Speiche (egal ob oben, unten oder seitlich) sauber
  // neben statt auf der Code-Beschriftung.
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const badgeOffset = 15;
  const badgeX = x + (dx / dist) * badgeOffset;
  const badgeY = y + (dy / dist) * badgeOffset;
  return (
    <g>
      <text x={x} y={y} textAnchor={textAnchor as never} fill={fill} fontSize={10} fontWeight={600} fontFamily="var(--font-plex-sans)">
        {payload?.value}
      </text>
      {row && (
        <foreignObject x={badgeX - 8} y={badgeY - 8} width={16} height={16}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
            <CriterionInfoButton criterionId={row.id} name={row.name} locale={locale} accent={fill} />
          </div>
        </foreignObject>
      )}
    </g>
  );
}

function CriterionRadarChart({ data, locale }: { data: Row[]; locale: Locale }) {
  const height = Math.max(320, Math.min(560, 260 + data.length * 7));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="68%">
        <PolarGrid stroke="#e7e1d4" />
        <PolarAngleAxis dataKey="id" tick={(props) => <CriterionRadarTick {...props} rows={data} locale={locale} />} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#211d17aa", fontSize: 9 }} tickCount={5} />
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
        <Radar
          name="Score"
          dataKey="value"
          stroke="#211d17"
          fill="#211d17"
          fillOpacity={0.16}
          strokeWidth={2}
          dot={{ r: 2.5, fill: "#211d17" }}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/** Barrierefreie Tabellen-Alternativansicht (immer verfügbar, unabhängig von
 * der gewählten Chart-Form) – Säule als Farb+Buchstaben-Chip (Identität nie
 * nur über Farbe; Sonderkriterien bekommen zusätzlich ein eigenes ✦-Symbol
 * statt des Säulenbuchstabens, ebenfalls nie nur über die Akzentfarbe
 * erkennbar), Wert als Zahl mit tabellarischen Ziffern plus Mini-Balken.
 * Zeigt, wenn eine Session besteht (siehe `notes`/`onToggleDone`/
 * `onSaveText` – alle drei zusammen undefined = Feature aus), zusätzlich je
 * Zeile die persönliche Notiz/Todo-Spalte. */
function CriterionTable({
  data,
  locale,
  notes,
  onToggleDone,
  onSaveText,
}: {
  data: Row[];
  locale: Locale;
  notes?: Record<string, CriterionNoteValue>;
  onToggleDone?: (criterionId: string, done: boolean) => void;
  onSaveText?: (criterionId: string, text: string) => void;
}) {
  const notesEnabled = Boolean(notes && onToggleDone && onSaveText);
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/60">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <tbody>
          {data.map((d) => {
            const accent = accentFor(d);
            return (
              <tr key={d.id} className="border-b border-ink/10 last:border-b-0">
                <td className="py-2.5 pl-4 pr-2 align-middle">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[9px] font-semibold text-white"
                      style={{ backgroundColor: accent }}
                      aria-hidden
                      title={d.special ? t(locale, "specialCriterionBadge") : undefined}
                    >
                      {d.special ? "✦" : d.pillar}
                    </span>
                    <span className="text-ink">{d.name}</span>
                    <CriterionInfoButton criterionId={d.id} name={d.name} locale={locale} accent={accent} />
                  </div>
                </td>
                <td className="w-32 py-2.5 pr-2 align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full rounded-full bg-ink/50" style={{ width: `${d.value}%` }} />
                    </div>
                    <span className="font-mono tabular-nums text-ink">{d.value}%</span>
                  </div>
                </td>
                {notesEnabled && (
                  <td className="w-44 py-2.5 pr-4 align-middle">
                    <CriterionNoteCell
                      criterionId={d.id}
                      name={d.name}
                      value={d.value}
                      note={notes?.[d.id]}
                      locale={locale}
                      onToggleDone={(next) => onToggleDone?.(d.id, next)}
                      onSaveText={(text) => onSaveText?.(d.id, text)}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
