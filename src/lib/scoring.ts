import { CRITERIA } from "@/lib/content/criteria";
import type { Answers, PillarKey } from "@/lib/content/types";

export interface ScoreResult {
  criterionScores: Record<string, number>; // Kriterium-ID -> Ø der 3 Statements (0-100)
  pillarScores: Record<PillarKey, number>; // Ø der 20 Kriterien je Säule
  qetIndex: number; // Ø der 3 Säulen
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Berechnet Kriterien-, Säulen- und Gesamt-Scores (QET-Index) aus den
 * Rohantworten. Fehlende Kriterien werden übersprungen (robust gegenüber
 * unvollständigen Einreichungen), damit ein einzelner Datenfehler nicht die
 * gesamte Auswertung zum Absturz bringt.
 */
export function computeScores(answers: Answers): ScoreResult {
  const criterionScores: Record<string, number> = {};

  for (const criterion of CRITERIA) {
    const values = answers[criterion.id];
    if (!values || values.length !== 3) continue;
    const avg = (values[0] + values[1] + values[2]) / 3;
    criterionScores[criterion.id] = round1(avg);
  }

  const pillarKeys: PillarKey[] = ["Q", "E", "T"];
  const pillarScores = {} as Record<PillarKey, number>;

  for (const pillar of pillarKeys) {
    const scoresInPillar = CRITERIA.filter((c) => c.pillar === pillar)
      .map((c) => criterionScores[c.id])
      .filter((v): v is number => typeof v === "number");
    pillarScores[pillar] =
      scoresInPillar.length > 0
        ? round1(scoresInPillar.reduce((a, b) => a + b, 0) / scoresInPillar.length)
        : 0;
  }

  const presentPillars = pillarKeys.filter((p) => pillarScores[p] > 0 || hasAnyAnswer(answers, p));
  const qetIndex =
    presentPillars.length > 0
      ? round1(presentPillars.reduce((sum, p) => sum + pillarScores[p], 0) / presentPillars.length)
      : 0;

  return { criterionScores, pillarScores, qetIndex };
}

function hasAnyAnswer(answers: Answers, pillar: PillarKey): boolean {
  return CRITERIA.some((c) => c.pillar === pillar && answers[c.id]);
}

/** Reduziert ein Answers-Objekt auf eine bestimmte Kriterien-Auswahl (z.B.
 * den aktuellen Test-Scope). Wichtig, damit weder die Anzeige noch die
 * gespeicherten Rohantworten durch Kriterien "verunreinigt" werden, die gar
 * nicht Teil dieses Tests waren (z.B. Default-Werte von UI-Feldern, die bei
 * einem Säulen-/Managementfeld-Teiltest gar nicht angezeigt wurden). */
export function pickAnswers(answers: Answers, criteriaIds: string[]): Answers {
  const idSet = new Set(criteriaIds);
  const picked: Answers = {};
  for (const [id, trio] of Object.entries(answers)) {
    if (idSet.has(id)) picked[id] = trio;
  }
  return picked;
}

/** Ampel-Einstufung für die Dashboard-Darstellung. */
export type Band = "critical" | "watch" | "solid" | "strong";

export function bandFor(score: number): Band {
  if (score < 40) return "critical";
  if (score < 60) return "watch";
  if (score < 80) return "solid";
  return "strong";
}

/** Generischer Gesamt-Score über eine beliebige Kriterien-Auswahl (z.B. ein
 * Managementfeld, das mehrere Säulen mischt) – einfacher Mittelwert der
 * beantworteten Kriterien dieser Auswahl. Für den QET-Gesamttest ist das
 * rechnerisch identisch mit dem Mittel der 3 Säulen-Scores (gleich große
 * Säulen à 20 Kriterien), für Teiltests ist es der jeweils passende Index. */
export function overallIndex(criterionScores: Record<string, number>, criteriaIds: string[]): number {
  const values = criteriaIds
    .map((id) => criterionScores[id])
    .filter((v): v is number => typeof v === "number");
  return values.length ? round1(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

/** Anzahl Einreichungen, ab der aggregierte Ergebnisse angezeigt werden –
 * schützt die Anonymität einzelner Teilnehmender in kleinen Firmen. */
export const MIN_RESPONSES_FOR_AGGREGATE = 3;

export interface SubmissionForAggregate {
  role: string;
  qualityScore: number;
  ethicsScore: number;
  transparencyScore: number;
  qetIndex: number;
  // "full" | "pillar:Q"|"pillar:E"|"pillar:T" | "field:<key>" – siehe
  // src/lib/content/types.ts. Wird für die pro-Einreichung korrekte
  // Kennzahl (scopeIndex) sowie optionale Scope-Filterung gebraucht.
  testScope?: string;
  // Für JEDEN Scope der korrekte Gesamtwert der tatsächlich beantworteten
  // Kriterien dieser einen Einreichung (siehe overallIndex()). Bei "full"
  // identisch mit qetIndex.
  scopeIndex?: number;
  answers: string; // JSON-String, wie in der DB gespeichert
}

export interface AggregateResult {
  count: number;
  qetIndex: number;
  pillarScores: Record<PillarKey, number>;
  criterionScores: Record<string, number>;
  byRole: Record<string, { count: number; qetIndex: number }>;
}

const avg = (nums: number[]) => (nums.length ? round1(nums.reduce((a, b) => a + b, 0) / nums.length) : 0);

/** Aggregiert mehrere Einreichungen einer Firma zu einem Gesamtbild
 * (für Admin- und Firmen-Dashboard). Rechnet aus den gespeicherten
 * Roh-Antworten neu, damit Kriteriums-Mittelwerte exakt sind.
 *
 * WICHTIG: Wenn Teiltests (Säule/Managementfeld) mit dem Gesamttest
 * gemischt vorliegen, würde ein einfacher Mittelwert der pro-Einreichung
 * gespeicherten qualityScore/ethicsScore/transparencyScore/qetIndex-Felder
 * das Ergebnis verfälschen (verdünnen Richtung 0), weil diese Felder bei
 * Teiltests für nicht abgefragte Kriterien 0 enthalten. Stattdessen werden
 * Kriterien-Mittelwerte direkt aus den Rohantworten gebildet (dabei wird
 * pro Kriterium nur über die Einreichungen gemittelt, die es tatsächlich
 * beantwortet haben) und die Säulen-/QET-Werte werden ERST DANACH aus
 * diesen Kriterien-Mittelwerten abgeleitet – das ist automatisch robust
 * gegenüber jeder Mischung von Testarten. */
export function aggregateSubmissions(submissions: SubmissionForAggregate[]): AggregateResult {
  const count = submissions.length;

  const criterionScores: Record<string, number> = {};
  for (const criterion of CRITERIA) {
    const values: number[] = [];
    for (const s of submissions) {
      try {
        const answers = JSON.parse(s.answers) as Answers;
        const trio = answers[criterion.id];
        if (trio && trio.length === 3) values.push((trio[0] + trio[1] + trio[2]) / 3);
      } catch {
        // Ignoriere fehlerhafte/ältere Datensätze statt die ganze Auswertung abbrechen zu lassen.
      }
    }
    if (values.length) criterionScores[criterion.id] = avg(values);
  }

  const pillarKeys: PillarKey[] = ["Q", "E", "T"];
  const pillarScores = {} as Record<PillarKey, number>;
  for (const pillar of pillarKeys) {
    const scoresInPillar = CRITERIA.filter((c) => c.pillar === pillar)
      .map((c) => criterionScores[c.id])
      .filter((v): v is number => typeof v === "number");
    pillarScores[pillar] = scoresInPillar.length ? avg(scoresInPillar) : 0;
  }
  const presentPillars = pillarKeys.filter((p) => pillarScores[p] > 0);
  const qetIndex = presentPillars.length ? avg(presentPillars.map((p) => pillarScores[p])) : 0;

  // Pro-Einreichung korrekter Wert für die Rollen-Aufschlüsselung: scopeIndex
  // (falls vorhanden – korrekt für jede Testart), sonst Fallback auf qetIndex
  // (ältere Datensätze ohne scopeIndex, immer "full").
  const indexFor = (s: SubmissionForAggregate) =>
    typeof s.scopeIndex === "number" && s.scopeIndex > 0 ? s.scopeIndex : s.qetIndex;

  const byRole: Record<string, { count: number; qetIndex: number }> = {};
  for (const role of ["employee", "customer", "partner"]) {
    const subset = submissions.filter((s) => s.role === role);
    byRole[role] = { count: subset.length, qetIndex: avg(subset.map(indexFor)) };
  }

  return { count, qetIndex, pillarScores, criterionScores, byRole };
}
