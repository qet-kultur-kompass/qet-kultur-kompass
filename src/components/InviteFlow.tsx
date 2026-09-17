"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CRITERIA, PILLARS } from "@/lib/content/criteria";
import { LOCALES, ROLE_LABELS, t } from "@/lib/content/i18n";
import { allSelectableScopes, criteriaForScope, labelForScope, stepsForScope } from "@/lib/content/scopes";
import type { Answers, Locale, PillarKey, Role, TestScope } from "@/lib/content/types";
import { scopeFromId, scopeToId } from "@/lib/content/types";
import { computeScores, overallIndex, pickAnswers } from "@/lib/scoring";
import { QetSymbol } from "./QetSymbol";
import { StatementSlider } from "./StatementSlider";
import { QetIndexGauge } from "./QetIndexGauge";
import { PillarRadar } from "./charts/PillarRadar";
import { CriterionBars } from "./charts/CriterionBars";

type Stage = "loading" | "error" | "sso_gate" | "already_done" | "intro" | "scope" | "survey" | "submitting" | "results";

interface InviteInfo {
  companyName: string;
  role: Role;
  alreadyCompleted: boolean;
  requiresSso: boolean;
  ssoStartPath: string | null;
}

interface ResultsState {
  criterionScores: Record<string, number>;
  pillarScores: Record<PillarKey, number>;
  qetIndex: number;
  scopeIndex: number;
}

function defaultAnswers(): Answers {
  const a: Answers = {};
  for (const c of CRITERIA) a[c.id] = [50, 50, 50];
  return a;
}

/**
 * Personalisierte Umfrage über einen persönlichen Einladungslink
 * (z.B. aus SAP importiert). Anders als der generische /survey/[token]-Link
 * ist die Rolle hier fest vorgegeben, optional ist vorher ein SAP-SSO-Login
 * nötig. Die gespeicherte Antwort bleibt trotzdem anonym – siehe
 * src/app/api/invite/[token]/route.ts.
 */
export function InviteFlow({ token }: { token: string }) {
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<Stage>("loading");
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [locale, setLocale] = useState<Locale>("de");
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [scope, setScope] = useState<TestScope>({ kind: "full" });
  const [stepIndex, setStepIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultsState | null>(null);
  const [resultsTab, setResultsTab] = useState<PillarKey>("Q");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/invite/${token}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: InviteInfo) => {
        if (cancelled) return;
        setInfo(data);
        if (data.requiresSso) {
          setStage("sso_gate");
          return;
        }
        // Direkter Sprung in einen bestimmten Bereich (z.B. "Diesen Bereich
        // erneut testen" aus der Testübersicht/Verlauf) – überspringt Intro
        // und Auswahlbildschirm, damit ein Re-Audit ein einziger Klick ist.
        const scopeParam = searchParams.get("scope");
        const parsedScope = scopeParam ? scopeFromId(scopeParam) : null;
        if (parsedScope) {
          setScope(parsedScope);
          setStepIndex(0);
          setStage("survey");
          return;
        }
        // "?new=1" (aus dem "Neuen Test starten"-Button im Dashboard):
        // überspringt den freundlichen "bereits teilgenommen"-Zwischenschritt,
        // da die Person hier schon aktiv einen neuen Test angestoßen hat.
        if (data.alreadyCompleted && !searchParams.get("new")) {
          setStage("already_done");
        } else {
          setStage("intro");
        }
      })
      .catch(() => {
        if (!cancelled) setStage("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token, searchParams]);

  const selectableScopes = useMemo(() => allSelectableScopes(), []);
  const steps = useMemo(() => stepsForScope(scope, locale), [scope, locale]);
  const currentStep = steps[stepIndex];
  const requiredCriteria = useMemo(() => criteriaForScope(scope), [scope]);
  const scopeLabel = useMemo(() => labelForScope(scope, locale), [scope, locale]);

  function setStatement(criterionId: string, index: 0 | 1 | 2, value: number) {
    setAnswers((prev) => {
      const trio = [...prev[criterionId]] as [number, number, number];
      trio[index] = value;
      return { ...prev, [criterionId]: trio };
    });
  }

  function chooseScope(next: TestScope) {
    setScope(next);
    setStepIndex(0);
    setStage("survey");
  }

  async function handleSubmit() {
    setStage("submitting");
    setSubmitError(null);
    const requiredIds = requiredCriteria.map((c) => c.id);
    const scopedAnswers = pickAnswers(answers, requiredIds);
    const localScores = computeScores(scopedAnswers);
    const localScopeIndex = overallIndex(localScores.criterionScores, requiredIds);
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: locale, testScope: scopeToId(scope), answers: scopedAnswers }),
      });
      if (res.status === 401) {
        // SSO-Session abgelaufen/fehlt – zurück zum Login-Gate.
        setStage("sso_gate");
        return;
      }
      if (res.status === 409) {
        // Wurde (z.B. in einem anderen Tab) bereits abgeschickt.
        setStage("already_done");
        return;
      }
      if (!res.ok) throw new Error("submit_failed");
      const data = await res.json();
      setResults({
        criterionScores: data.criterionScores,
        pillarScores: data.pillarScores,
        qetIndex: data.qetIndex,
        scopeIndex: data.scopeIndex,
      });
      setStage("results");
    } catch {
      setResults({ ...localScores, scopeIndex: localScopeIndex });
      setSubmitError(t(locale, "errorSubmit"));
      setStage("results");
    }
  }

  if (stage === "loading") return <CenteredNote>Lädt …</CenteredNote>;
  if (stage === "error") return <CenteredNote>{t(locale, "errorLoadCompany")}</CenteredNote>;

  if (stage === "already_done" && info) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <BrandMark locale={locale} />
        <p className="mt-6 text-ink/70">
          Sie haben für <strong>{info.companyName}</strong> bereits mindestens einmal teilgenommen.
          Vielen Dank dafür! Sie können jederzeit einen weiteren Test durchführen – z. B. zur
          Wiederholung oder für einen anderen Bereich.
        </p>
        <button
          type="button"
          onClick={() => setStage("intro")}
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
        >
          Weiteren Test durchführen
        </button>
        <div className="mt-6 w-full">
          <SetPasswordBlock token={token} locale={locale} />
        </div>
      </main>
    );
  }

  if (stage === "sso_gate" && info) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <BrandMark locale={locale} />
        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">{info.companyName}</h1>
        <p className="mt-3 text-ink/70">
          Diese Befragung ist nur für verifizierte Teilnehmende zugänglich. Bitte melden Sie sich
          zuerst mit Ihrem SAP-Konto an – Ihre Antworten selbst bleiben dabei anonym und werden
          nicht mit Ihrer Identität verknüpft.
        </p>
        {info.ssoStartPath && (
          <a
            href={info.ssoStartPath}
            className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            Mit SAP anmelden
          </a>
        )}
      </main>
    );
  }

  if (stage === "intro" && info) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-6 py-16">
        <BrandMark locale={locale} />
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">{t(locale, "introTitle")}</h1>
        <p className="mt-3 text-ink/70">{t(locale, "introSubtitle")}</p>

        <div className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
          <div className="text-xs font-medium uppercase tracking-wide text-ink/50">
            {t(locale, "forCompany")}
          </div>
          <div className="font-display text-lg font-semibold text-ink">{info.companyName}</div>
          <div className="mt-3 text-sm text-ink/60">
            {t(locale, "chooseRole")}: {ROLE_LABELS[info.role][locale]}
          </div>

          <label className="mt-5 block text-sm font-medium text-ink/80">
            {t(locale, "chooseLanguage")}
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setStage("scope")}
            className="mt-6 w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            {t(locale, "start")}
          </button>
        </div>
      </main>
    );
  }

  if (stage === "scope") {
    const fullScope = selectableScopes.find((s) => s.group === "full");
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
        <BrandMark locale={locale} />
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">{t(locale, "chooseScope")}</h1>
        <p className="mt-3 text-ink/70">{t(locale, "chooseScopeSubtitle")}</p>

        {fullScope && (
          <button
            type="button"
            onClick={() => chooseScope(fullScope.scope)}
            className="mt-6 flex w-full items-center gap-4 rounded-2xl bg-ink p-6 text-left shadow-card transition hover:bg-ink/90"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper/10 p-2.5">
              <QetSymbol />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-semibold text-paper">{fullScope.name[locale]}</div>
              <div className="mt-0.5 text-sm text-paper/55">
                {t(locale, "scopeCriteriaCount", { count: fullScope.criteriaCount })}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none" className="shrink-0 text-paper/40">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <ScopeGroup title={t(locale, "scopeGroupPillar")}>
          {selectableScopes
            .filter((s) => s.group === "pillar")
            .map((s) => (
              <ScopeCard key={s.id} scope={s} locale={locale} onSelect={() => chooseScope(s.scope)} />
            ))}
        </ScopeGroup>

        <ScopeGroup title={t(locale, "scopeGroupField")}>
          {selectableScopes
            .filter((s) => s.group === "field")
            .map((s) => (
              <ScopeCard key={s.id} scope={s} locale={locale} onSelect={() => chooseScope(s.scope)} />
            ))}
        </ScopeGroup>

        <button
          type="button"
          onClick={() => setStage("intro")}
          className="mt-6 text-sm font-medium text-ink/50 transition hover:text-ink"
        >
          ← {t(locale, "back")}
        </button>
      </main>
    );
  }

  if (stage === "survey" && currentStep) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
        <BrandMark locale={locale} />
        <div className="mt-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`h-1.5 flex-1 rounded-full ${
                i < stepIndex ? "bg-ink/60" : i === stepIndex ? "bg-ink" : "bg-ink/15"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-ink/50">
          <span>
            {t(locale, "stepProgress", { current: stepIndex + 1, total: steps.length })} — {currentStep.label}
          </span>
          <button type="button" onClick={() => setStage("scope")} className="font-medium hover:text-ink">
            {t(locale, "changeScope")}
          </button>
        </div>

        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">{currentStep.label}</h2>
        <p className="mt-1 text-sm text-ink/60">{t(locale, "statementInstruction")}</p>

        <div className="mt-4 flex flex-col divide-y divide-ink/10">
          {currentStep.criteria.map((c) => (
            <div key={c.id} className="py-4">
              <h3 className="font-display text-base font-semibold text-ink">{c.name[locale]}</h3>
              {c.statements.map((s, idx) => (
                <StatementSlider
                  key={idx}
                  statement={s[locale]}
                  value={answers[c.id][idx]}
                  onChange={(v) => setStatement(c.id, idx as 0 | 1 | 2, v)}
                  pillar={c.pillar}
                  notAtAllLabel={t(locale, "notAtAll")}
                  fullyLabel={t(locale, "fully")}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border-t border-ink/10 bg-paper/95 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
            disabled={stepIndex === 0}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 disabled:opacity-30"
          >
            ← {t(locale, "back")}
          </button>
          {stepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStepIndex((s) => s + 1)}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90"
            >
              {t(locale, "next")} →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90"
            >
              {t(locale, "submit")}
            </button>
          )}
        </div>
      </main>
    );
  }

  if (stage === "submitting") return <CenteredNote>{t(locale, "submitting")}</CenteredNote>;

  if (stage === "results" && results) {
    const isFull = scope.kind === "full";
    const scopeCriteria = requiredCriteria;
    const sorted = [...scopeCriteria].sort(
      (a, b) => (results.criterionScores[b.id] ?? 0) - (results.criterionScores[a.id] ?? 0)
    );
    const strongest = sorted.slice(0, 3);
    const weakest = sorted.slice(-3).reverse();

    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
        <div className="no-print">
          <BrandMark locale={locale} />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">{t(locale, "resultsTitle")}</h1>
        <p className="mt-2 text-ink/70">
          {isFull ? t(locale, "resultsSubtitle") : t(locale, "resultFor", { scope: scopeLabel })}
        </p>
        {submitError && <p className="mt-2 text-sm text-red-600">{submitError}</p>}

        {isFull ? (
          <div className="mt-6 grid grid-cols-1 gap-6 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card sm:grid-cols-[auto_1fr]">
            <QetIndexGauge value={results.qetIndex} label={t(locale, "qetIndex")} locale={locale} />
            <PillarRadar scores={results.pillarScores} locale={locale} />
          </div>
        ) : (
          <div className="mt-6 flex justify-center rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
            <QetIndexGauge value={results.scopeIndex} label={scopeLabel} locale={locale} />
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
          {isFull ? (
            <>
              <div className="mb-4 flex gap-2">
                {PILLARS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setResultsTab(p.key)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      resultsTab === p.key ? "bg-ink text-paper" : "bg-ink/5 text-ink/60 hover:bg-ink/10"
                    }`}
                  >
                    {p.name[locale]} · {Math.round(results.pillarScores[p.key] ?? 0)}%
                  </button>
                ))}
              </div>
              <CriterionBars
                criteria={CRITERIA.filter((c) => c.pillar === resultsTab)}
                scores={results.criterionScores}
                locale={locale}
              />
            </>
          ) : (
            <>
              <h3 className="mb-4 font-display text-base font-semibold text-ink">{t(locale, "perCriterion")}</h3>
              <CriterionBars criteria={scopeCriteria} scores={results.criterionScores} locale={locale} />
            </>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
            <h3 className="font-display text-base font-semibold text-ethics-600">{t(locale, "strongest")}</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink/75">
              {strongest.map((c) => (
                <li key={c.id} className="flex justify-between">
                  <span>{c.name[locale]}</span>
                  <span className="font-mono">{Math.round(results.criterionScores[c.id] ?? 0)}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
            <h3 className="font-display text-base font-semibold text-transparency-600">{t(locale, "weakest")}</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-ink/75">
              {weakest.map((c) => (
                <li key={c.id} className="flex justify-between">
                  <span>{c.name[locale]}</span>
                  <span className="font-mono">{Math.round(results.criterionScores[c.id] ?? 0)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-sm text-ink/50">{t(locale, "thankYou")}</p>

        <div className="no-print mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink/80 transition hover:bg-ink/5"
          >
            {t(locale, "print")}
          </button>
          <button
            type="button"
            onClick={() => {
              setResults(null);
              setSubmitError(null);
              setStage("scope");
            }}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink/80 transition hover:bg-ink/5"
          >
            Weiteren Test durchführen
          </button>
        </div>

        <div className="no-print mt-8 max-w-sm">
          <SetPasswordBlock token={token} locale={locale} />
        </div>
      </main>
    );
  }

  return null;
}

/** Optionales Passwort, damit die Person künftig ihre eigenes Ergebnis + das
 * anonymisierte Team-Ergebnis jederzeit unter /mein-dashboard wiederfindet,
 * statt sich nur auf den (ebenfalls weiterhin gültigen) Link zu verlassen. */
function SetPasswordBlock({ token, locale }: { token: string; locale: Locale }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/invite/${token}/set-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(
        data?.error === "no_email_on_file"
          ? "Für diese Einladung ist keine E-Mail-Adresse hinterlegt."
          : t(locale, "signupErrorGeneric")
      );
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
        <p className="text-sm text-ink/70">{t(locale, "dashboardSetPasswordDone")}</p>
        <button
          type="button"
          onClick={() => router.push("/mein-dashboard")}
          className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90"
        >
          {t(locale, "dashboardYourResult")} →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
      <h3 className="font-display text-base font-semibold text-ink">{t(locale, "dashboardSetPasswordTitle")}</h3>
      <p className="mt-1 text-xs text-ink/60">{t(locale, "dashboardSetPasswordDesc")}</p>
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t(locale, "passwordLabel")}
        className="mt-3 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-quality-500"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="mt-3 rounded-full bg-ink px-5 py-2 text-xs font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
      >
        {saving ? t(locale, "loginSubmitting") : t(locale, "dashboardSetPasswordSubmit")}
      </button>
    </form>
  );
}

function ScopeGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <div className="text-xs font-medium uppercase tracking-wide text-ink/45">{title}</div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

const PILLAR_ACCENT: Record<PillarKey, string> = { Q: "#3d54b0", E: "#2d7a56", T: "#c9862a" };

/** Ermittelt die Kachel-Akzentfarbe: bei Säulen-Tests die jeweilige
 * Säulenfarbe (Marken-Konsistenz mit Gauge/Radar), bei Managementfeld-Tests
 * bewusst neutral (Tinte), da diese Kriterien aus mehreren Säulen mischen –
 * eine einzelne Säulenfarbe wäre dort irreführend. */
function accentForGroup(group: "full" | "pillar" | "field", pillar?: PillarKey): string {
  if (group === "pillar" && pillar) return PILLAR_ACCENT[pillar];
  return "#211d17";
}

function ScopeCard({
  scope,
  locale,
  onSelect,
}: {
  scope: ReturnType<typeof allSelectableScopes>[number];
  locale: Locale;
  onSelect: () => void;
}) {
  const accent = accentForGroup(scope.group, scope.scope.kind === "pillar" ? scope.scope.pillar : undefined);
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-white/70 p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-lg"
    >
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: accent }} aria-hidden />
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          {scope.criteriaCount}
        </span>
        <div className="min-w-0">
          <div className="font-display text-sm font-semibold text-ink">{scope.name[locale]}</div>
          <div className="mt-0.5 text-xs text-ink/50">
            {t(locale, "scopeCriteriaCount", { count: scope.criteriaCount })}
          </div>
        </div>
      </div>
    </button>
  );
}

function CenteredNote({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center px-6 text-center text-ink/60">{children}</div>;
}

function BrandMark({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-ink/60">
      <span className="h-5 w-5">
        <QetSymbol />
      </span>
      {t(locale, "brand")}
    </div>
  );
}
