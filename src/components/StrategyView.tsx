"use client";

import { useMemo, useState } from "react";
import { PILLARS } from "@/lib/content/criteria";
import { LOCALES, t } from "@/lib/content/i18n";
import { resolveText } from "@/lib/content/types";
import type { Locale, PillarKey } from "@/lib/content/types";
import { QetLogo } from "./QetLogo";
import { QetSymbol } from "./QetSymbol";

const PILLAR_COLOR: Record<PillarKey, string> = { Q: "#3d54b0", E: "#2d7a56", T: "#c9862a" };

export type GoalStatus = "open" | "in_progress" | "done";

const STATUS_ORDER: GoalStatus[] = ["open", "in_progress", "done"];
const STATUS_COLOR: Record<GoalStatus, string> = { open: "#6b6558", in_progress: "#c9862a", done: "#2d7a56" };
const STATUS_LABEL_KEY: Record<GoalStatus, string> = {
  open: "strategyStatusOpen",
  in_progress: "strategyStatusInProgress",
  done: "strategyStatusDone",
};

export interface GoalItem {
  id: string;
  title: string;
  description: string;
  pillar: PillarKey | null;
  /** ISO-Datumsstring (z.B. "2026-11-01T00:00:00.000Z") oder null. */
  dueDate: string | null;
  status: GoalStatus;
  createdAt: string;
}

/** Sortiert wie der Server: Zieltermin aufsteigend (ohne Termin zuletzt),
 * darunter nach Anlagedatum – wird nach jeder lokalen Änderung erneut
 * angewendet, damit die Liste konsistent bleibt, ohne bei jeder Aktion
 * neu vom Server zu laden. */
function sortGoals(list: GoalItem[]): GoalItem[] {
  return [...list].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
    } else if (a.dueDate && !b.dueDate) {
      return -1;
    } else if (!a.dueDate && b.dueDate) {
      return 1;
    }
    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  });
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Montag = 0 … Sonntag = 6, statt JS-Default (Sonntag = 0). */
function mondayIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function isoDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

function localeTagFor(locale: Locale): string {
  return locale === "de" ? "de-DE" : locale === "tr" ? "tr-TR" : locale === "ro" ? "ro-RO" : "en-US";
}

interface GoalFormValues {
  title: string;
  description: string;
  pillar: PillarKey | "";
  dueDate: string;
}

const EMPTY_FORM: GoalFormValues = { title: "", description: "", pillar: "", dueDate: "" };

/**
 * Persönliche Strategie/Zielsetzung (Task "Strategie/Ziel-Feature"):
 * eine freie strategische Ausrichtung als Fließtext sowie beliebig viele
 * einzelne Ziele mit optionalem Zieltermin und optionalem Bezug zu einer
 * QET-Säule. Die Zieltermine speisen zusätzlich eine kompakte
 * Monatsübersicht (Kalender). Für das 1-Seiten-PDF-Handout siehe
 * StrategyHandoutView.tsx (eigene Route /mein-dashboard/strategie/handout,
 * gleiches window.print()-Muster wie beim Audit-Handbuch). Rein privat,
 * wie CriterionNote/Goal serverseitig nie Teil der Firmen-Aggregation.
 */
export function StrategyView({ intro: initialIntro, goals: initialGoals }: { intro: string; goals: GoalItem[] }) {
  const [locale, setLocale] = useState<Locale>("de");

  const [intro, setIntro] = useState(initialIntro);
  const [introDraft, setIntroDraft] = useState(initialIntro);
  const [introSaving, setIntroSaving] = useState(false);
  const [introSaved, setIntroSaved] = useState(false);

  const [goals, setGoals] = useState<GoalItem[]>(sortGoals(initialGoals));
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormValues>(EMPTY_FORM);
  const [formError, setFormError] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [deleteArmedId, setDeleteArmedId] = useState<string | null>(null);

  const [calendarMonth, setCalendarMonth] = useState<Date>(() => startOfMonth(new Date()));

  async function saveIntro() {
    setIntroSaving(true);
    setIntroSaved(false);
    try {
      const res = await fetch("/api/mein-dashboard/strategy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intro: introDraft }),
      });
      if (!res.ok) throw new Error("save_failed");
      setIntro(introDraft);
      setIntroSaved(true);
    } catch {
      setIntroDraft(intro);
    } finally {
      setIntroSaving(false);
    }
  }

  function openNewForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError(false);
    setFormOpen(true);
  }

  function openEditForm(goal: GoalItem) {
    setForm({
      title: goal.title,
      description: goal.description,
      pillar: goal.pillar ?? "",
      dueDate: goal.dueDate ? isoDateOnly(goal.dueDate) : "",
    });
    setEditingId(goal.id);
    setFormError(false);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setFormError(false);
  }

  async function submitForm() {
    const title = form.title.trim();
    if (!title) {
      setFormError(true);
      return;
    }
    setFormSaving(true);
    setFormError(false);
    try {
      const body = {
        title,
        description: form.description.trim(),
        pillar: form.pillar || null,
        dueDate: form.dueDate || null,
      };
      const url = editingId ? `/api/mein-dashboard/strategy/goals/${editingId}` : "/api/mein-dashboard/strategy/goals";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("save_failed");
      const saved = (await res.json()) as GoalItem;
      setGoals((prev) => {
        const withoutSaved = prev.filter((g) => g.id !== saved.id);
        return sortGoals([...withoutSaved, saved]);
      });
      setFormOpen(false);
      setEditingId(null);
    } catch {
      setFormError(true);
    } finally {
      setFormSaving(false);
    }
  }

  async function setStatus(goal: GoalItem, status: GoalStatus) {
    if (goal.status === status) return;
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, status } : g)));
    try {
      const res = await fetch(`/api/mein-dashboard/strategy/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("save_failed");
    } catch {
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, status: goal.status } : g)));
    }
  }

  async function confirmDelete(id: string) {
    if (deleteArmedId !== id) {
      setDeleteArmedId(id);
      return;
    }
    setDeleteArmedId(null);
    const previous = goals;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      const res = await fetch(`/api/mein-dashboard/strategy/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete_failed");
    } catch {
      setGoals(previous);
    }
  }

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const goalsByDay = useMemo(() => {
    const map = new Map<number, GoalItem[]>();
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    for (const g of goals) {
      if (!g.dueDate) continue;
      const d = new Date(g.dueDate);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const day = d.getDate();
      const list = map.get(day) ?? [];
      list.push(g);
      map.set(day, list);
    }
    return map;
  }, [goals, calendarMonth]);

  const calendarCells = useMemo(() => {
    const leading = mondayIndex(startOfMonth(calendarMonth).getDay());
    const total = daysInMonth(calendarMonth);
    const cells: (number | null)[] = [];
    for (let i = 0; i < leading; i++) cells.push(null);
    for (let day = 1; day <= total; day++) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calendarMonth]);

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(localeTagFor(locale), { weekday: "short" });
    // 2024-01-01 ist ein Montag – als stabiler Ausgangspunkt für die
    // Wochentags-Kurznamen unabhängig vom aktuellen Datum.
    const labels: string[] = [];
    for (let i = 0; i < 7; i++) {
      labels.push(fmt.format(new Date(2024, 0, 1 + i)));
    }
    return labels;
  }, [locale]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(localeTagFor(locale), { month: "long", year: "numeric" }).format(calendarMonth),
    [locale, calendarMonth]
  );

  const hasGoalsThisMonth = goalsByDay.size > 0;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <a href="/mein-dashboard" className="text-sm font-medium text-ink/60 transition hover:text-ink">
          ← {t(locale, "strategyBackToDashboard")}
        </a>
        <div className="flex items-center gap-3">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded-lg border border-ink/15 bg-white px-2 py-1 text-xs text-ink"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <a
            href="/mein-dashboard/strategie/handout"
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/70 transition hover:bg-ink/5"
          >
            {t(locale, "strategyOpenHandout")}
          </a>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2">
        <span className="h-[18px] w-[18px] shrink-0">
          <QetSymbol />
        </span>
        <QetLogo className="h-[18px] w-auto" />
      </div>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">{t(locale, "strategyPageTitle")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">{t(locale, "strategyPageSubtitle")}</p>

      <section className="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
        <label className="block text-xs font-medium uppercase tracking-wide text-ink/50">
          {t(locale, "strategyIntroLabel")}
        </label>
        <textarea
          value={introDraft}
          onChange={(e) => {
            setIntroDraft(e.target.value);
            setIntroSaved(false);
          }}
          placeholder={t(locale, "strategyIntroPlaceholder")}
          rows={4}
          className="mt-2 w-full resize-none rounded-lg border border-ink/15 bg-paper/40 p-3 text-sm text-ink outline-none focus:border-quality-500"
        />
        <div className="mt-2 flex items-center justify-end gap-3">
          {introSaved && <span className="text-xs text-ethics-600">{t(locale, "strategyIntroSaved")}</span>}
          <button
            type="button"
            onClick={saveIntro}
            disabled={introSaving || introDraft === intro}
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
          >
            {t(locale, "strategyIntroSave")}
          </button>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "strategyGoalsHeading")}</h2>
          {!formOpen && (
            <button
              type="button"
              onClick={openNewForm}
              className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper transition hover:bg-ink/90"
            >
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {t(locale, "strategyAddGoal")}
            </button>
          )}
        </div>

        {formOpen && (
          <div className="mt-4 rounded-2xl border border-ink/15 bg-white p-4 shadow-card">
            <label className="block text-xs font-medium text-ink/60">{t(locale, "strategyFormTitleLabel")}</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={t(locale, "strategyFormTitlePlaceholder")}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-paper/40 px-3 py-2 text-sm text-ink outline-none focus:border-quality-500"
            />

            <label className="mt-3 block text-xs font-medium text-ink/60">
              {t(locale, "strategyFormDescriptionLabel")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t(locale, "strategyFormDescriptionPlaceholder")}
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-ink/15 bg-paper/40 px-3 py-2 text-sm text-ink outline-none focus:border-quality-500"
            />

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-ink/60">{t(locale, "strategyFormDueDateLabel")}</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-ink/15 bg-paper/40 px-3 py-2 text-sm text-ink outline-none focus:border-quality-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/60">{t(locale, "strategyFormLinkLabel")}</label>
                <select
                  value={form.pillar}
                  onChange={(e) => setForm((f) => ({ ...f, pillar: e.target.value as PillarKey | "" }))}
                  className="mt-1 w-full rounded-lg border border-ink/15 bg-paper/40 px-3 py-2 text-sm text-ink outline-none focus:border-quality-500"
                >
                  <option value="">{t(locale, "strategyFormLinkNone")}</option>
                  {PILLARS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {resolveText(p.name, locale)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && <p className="mt-2 text-xs text-red-600">{t(locale, "strategyFormTitleRequired")}</p>}

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                disabled={formSaving}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-ink/50 transition hover:text-ink"
              >
                {t(locale, "strategyFormCancel")}
              </button>
              <button
                type="button"
                onClick={submitForm}
                disabled={formSaving}
                className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
              >
                {t(locale, "strategyFormSave")}
              </button>
            </div>
          </div>
        )}

        {goals.length === 0 && !formOpen ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/20 p-8 text-center text-sm text-ink/50">
            {t(locale, "strategyEmptyState")}
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {goals.map((goal) => {
              const overdue = goal.status !== "done" && goal.dueDate !== null && isoDateOnly(goal.dueDate) < todayIso;
              return (
                <li key={goal.id} className="rounded-2xl border border-ink/10 bg-white/60 p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-ink">{goal.title}</p>
                      {goal.description && <p className="mt-1 text-sm text-ink/60">{goal.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/50">
                        <span className={overdue ? "font-medium text-red-600" : undefined}>
                          {goal.dueDate
                            ? new Date(goal.dueDate).toLocaleDateString(localeTagFor(locale), {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : t(locale, "strategyNoDueDate")}
                          {overdue && ` · ${t(locale, "strategyOverdue")}`}
                        </span>
                        {goal.pillar && (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: PILLAR_COLOR[goal.pillar] }}
                              aria-hidden
                            />
                            {resolveText(PILLARS.find((p) => p.key === goal.pillar)!.name, locale)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(goal)}
                        aria-label={t(locale, "strategyEditGoal")}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-ink/35 transition hover:bg-ink/5 hover:text-ink"
                      >
                        <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden>
                          <path
                            d="M11 2l2 2-7.5 7.5-2.6.6.6-2.6L11 2z"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDelete(goal.id)}
                        aria-label={t(locale, "strategyDeleteGoal")}
                        className={`rounded-full px-2 py-1 text-[11px] font-medium transition ${
                          deleteArmedId === goal.id
                            ? "bg-red-600 text-white"
                            : "text-ink/35 hover:bg-ink/5 hover:text-ink"
                        }`}
                      >
                        {deleteArmedId === goal.id ? t(locale, "strategyDeleteConfirm") : "×"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-1.5">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(goal, s)}
                        className="rounded-full px-2.5 py-1 text-[11px] font-medium transition"
                        style={
                          goal.status === s
                            ? { backgroundColor: `${STATUS_COLOR[s]}22`, color: STATUS_COLOR[s] }
                            : { color: "rgba(29,29,31,0.35)" }
                        }
                      >
                        {t(locale, STATUS_LABEL_KEY[s])}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "strategyCalendarHeading")}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCalendarMonth((m) => addMonths(m, -1))}
              aria-label="Previous month"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path d="M9.5 2.5L4 7.5l5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="min-w-[9rem] text-center text-sm font-medium text-ink/70">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path d="M5.5 2.5L11 7.5l-5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-ink/40">
          {weekdayLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {calendarCells.map((day, i) => {
            if (day === null) return <div key={i} className="aspect-square rounded-lg" />;
            const dayGoals = goalsByDay.get(day) ?? [];
            const cellIso = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = cellIso === todayIso;
            return (
              <div
                key={i}
                className={`flex aspect-square flex-col items-center justify-start rounded-lg border p-1 ${
                  isToday ? "border-ink/40 bg-ink/5" : "border-ink/5"
                }`}
              >
                <span className={`text-[11px] ${isToday ? "font-semibold text-ink" : "text-ink/50"}`}>{day}</span>
                {dayGoals.length > 0 && (
                  <div className="mt-1 flex flex-wrap justify-center gap-0.5" title={dayGoals.map((g) => g.title).join(", ")}>
                    {dayGoals.slice(0, 3).map((g) => (
                      <span
                        key={g.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: g.pillar ? PILLAR_COLOR[g.pillar] : STATUS_COLOR[g.status] }}
                        aria-hidden
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!hasGoalsThisMonth && <p className="mt-3 text-xs text-ink/40">{t(locale, "strategyCalendarEmpty")}</p>}
      </section>

      <p className="mt-10 text-center text-xs text-ink/40">{t(locale, "installAppHint")}</p>
    </main>
  );
}
