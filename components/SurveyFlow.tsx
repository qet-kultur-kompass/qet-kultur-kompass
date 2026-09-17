"use client";

import { useEffect, useMemo, useState } from "react";
import { CRITERIA, PILLARS } from "@/lib/content/criteria";
import { LOCALES, ROLE_LABELS, t } from "@/lib/content/i18n";
import { allSelectableScopes, criteriaForScope, labelForScope, stepsForScope } from "@/lib/content/scopes";
import type { Answers, Locale, PillarKey, Role, TestScope } from "@/lib/content/types";
import { scopeToId } from "@/lib/content/types";
import { computeScores, overallIndex, pickAnswers } from "@/lib/scoring";
import { QetSymbol } from "./QetSymbol";
import { StatementSlider } from "./StatementSlider";
import { QetIndexGauge } from "./QetIndexGauge";
import { QetIndexRing } from "./QetIndexRing";
import { CriterionBars } from "./charts/CriterionBars";

type Stage = "loading" | "error" | "intro" | "scope" | "survey" | "submitting" | "results";

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

export function SurveyFlow({ token }: { token: string }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [companyName, setCompanyName] = useState("");
  const [locale, setLocale] = useState<Locale>("de");
  const [role, setRole] = useState<Role>("employee");
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [scope, setScope] = useState<TestScope>({ kind: "full" });
  const [stepIndex, setStepIndex] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultsState | null>(null);
  const [resultsTab, setResultsTab] = useState<PillarKey>("Q");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/survey/${token}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        setCompanyName(data.company.name);
        setStage("intro");
      })
      .catch(() => {
        if (!cancelled) setStage("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

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
      const res = await fetch(`/api/survey/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          language: locale,
          testScope: scopeToId(scope),
          respondentName: respondentName || undefined,
          respondentEmail: respondentEmail || undefined,
          answers: scopedAnswers,
        }),
      });
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
      // Server nicht erreichbar/Fehler: dem Teilnehmenden trotzdem das lokal
      // berechnete Ergebnis zeigen, aber auf das Sende-Problem hinweisen.
      setResults({ ...localScores, scopeIndex: localScopeIndex });
      setSubmitError(t(locale, "errorSubmit"));
      setStage("results");
    }
  }

  if (stage === "loading") {
    return <CenteredNote>Lädt …</CenteredNote>;
  }

  if (stage === "error") {
    return <CenteredNote>{t(locale, "errorLoadCompany")}</CenteredNote>;
  }

  if (stage === "intro") {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-6 py-16">
        <BrandMark locale={locale} />
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">{t(locale, "introTitle")}</h1>
        <p className="mt-3 text-ink/70">{t(locale, "introSubtitle")}</p>

        <div className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
          <div className="text-xs font-medium uppercase tracking-wide text-ink/50">
            {t(locale, "forCompany")}
          </div>
          <div className="font-display text-lg font-semibold text-ink">{companyName}</div>

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

          <label className="mt-4 block text-sm font-medium text-ink/80">
            {t(locale, "chooseRole")}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
            >
              {(["employee", "customer", "partner"] as const).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r][locale]}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm font-medium text-ink/80">
            {t(locale, "yourName")}
            <input
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-ink/80">
            {t(locale, "yourEmail")}
            <input
              type="email"
              value={respondentEmail}
              onChange={(e) => setRespondentEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
            />
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
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
        <BrandMark locale={locale} />
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">{t(locale, "chooseScope")}</h1>
        <p className="mt-3 text-ink/70">{t(locale, "chooseScopeSubtitle")}</p>

        <ScopeGroup title={t(locale, "scopeGroupFull")}>
          {selectableScopes
            .filter((s) => s.group === "full")
            .map((s) => (
              <ScopeCard key={s.id} scope={s} locale={locale} onSelect={() => chooseScope(s.scope)} />
            ))}
        </ScopeGroup>

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
            <button type="button" onClick={handleSubmit} className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90">
              {t(locale, "submit")}
            </button>
          )}
        </div>
      </main>
    );
  }

  if (stage === "submitting") {
    return <CenteredNote>{t(locale, "submitting")}</CenteredNote>;
  }

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
          <div className="mt-6 flex justify-center rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
            <QetIndexRing
              qetIndex={results.qetIndex}
              pillarScores={results.pillarScores}
              criterionScores={results.criterionScores}
              label={t(locale, "qetIndex")}
              locale={locale}
            />
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
            <h3 className="font-display text-base font-semibold text-ethics-600">
              {t(locale, "strongest")}
            </h3>
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
            <h3 className="font-display text-base font-semibold text-transparency-600">
              {t(locale, "weakest")}
            </h3>
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

        <div className="no-print mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink/80 transition hover:bg-ink/5"
          >
            {t(locale, "print")}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/50 transition hover:bg-ink/5"
          >
            {t(locale, "restart")}
          </button>
        </div>
      </main>
    );
  }

  return null;
}

function ScopeGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="text-xs font-medium uppercase tracking-wide text-ink/50">{title}</div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
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
  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-xl border border-ink/10 bg-white/60 p-4 text-left shadow-card transition hover:border-ink/30 hover:bg-white"
    >
      <div className="font-display text-base font-semibold text-ink">{scope.name[locale]}</div>
      <div className="mt-1 text-xs text-ink/50">{t(locale, "scopeCriteriaCount", { count: scope.criteriaCount })}</div>
    </button>
  );
}

function CenteredNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center text-ink/60">
      {children}
    </div>
  );
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
