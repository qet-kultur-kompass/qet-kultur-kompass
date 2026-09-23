"use client";

import { useState } from "react";
import { t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";

/**
 * Bearbeitbare Begrüßung im persönlichen Dashboard: der eigene Anzeigename
 * (und, für Konto-Inhaber:innen mit echtem Firmenkonto, zusätzlich der
 * Firmenname) lässt sich hier direkt per Stift-Icon ändern – ohne
 * Admin-Eingriff. Ersetzt die zuvor statische "Hallo, {name}"-Zeile plus
 * Firmenname-Zeile in MeinDashboardView. Speichert über
 * PATCH /api/mein-dashboard/profile (ausschließlich für die eigene,
 * eingeloggte Self-Service-Person, siehe requireAnySelfServiceSession).
 */
export function ProfileNameEditor({
  name,
  companyName,
  showCompanyField,
  locale,
  onSaved,
}: {
  name: string;
  companyName: string;
  /** Firmenname nur bearbeitbar für Konto-Inhaber:innen mit echtem
   * Firmenkonto (accountType === "company"); Einzelkund:innen und
   * eingeladene Personen sehen den Firmennamen nur als Text. */
  showCompanyField: boolean;
  locale: Locale;
  onSaved: (next: { name: string; companyName: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftCompany, setDraftCompany] = useState(companyName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  function openEditor() {
    setDraftName(name);
    setDraftCompany(companyName);
    setError(false);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(false);
  }

  async function save() {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      setError(true);
      return;
    }
    setSaving(true);
    setError(false);
    try {
      const body: { name: string; companyName?: string } = { name: trimmedName };
      if (showCompanyField) body.companyName = draftCompany.trim();
      const res = await fetch("/api/mein-dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("save_failed");
      const json = (await res.json()) as { name: string; companyName: string };
      onSaved(json);
      setEditing(false);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-6 flex items-start gap-2">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            {t(locale, "dashboardGreeting", { name })}
          </h1>
          <p className="text-sm text-ink/60">{companyName}</p>
        </div>
        <button
          type="button"
          onClick={openEditor}
          aria-label={t(locale, "profileEditNameAria")}
          className="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink/35 transition hover:bg-ink/5 hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden>
            <path
              d="M11 2l2 2-7.5 7.5-2.6.6.6-2.6L11 2z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-sm rounded-2xl border border-ink/15 bg-white p-4 shadow-card">
      <label className="block text-xs font-medium text-ink/60">{t(locale, "profileNameLabel")}</label>
      <input
        autoFocus
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        className="mt-1 w-full rounded-lg border border-ink/15 bg-paper/40 px-3 py-2 text-sm text-ink outline-none focus:border-quality-500"
      />
      {showCompanyField && (
        <>
          <label className="mt-3 block text-xs font-medium text-ink/60">{t(locale, "profileCompanyLabel")}</label>
          <input
            value={draftCompany}
            onChange={(e) => setDraftCompany(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-paper/40 px-3 py-2 text-sm text-ink outline-none focus:border-quality-500"
          />
        </>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{t(locale, "profileNameRequired")}</p>}
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-ink/50 transition hover:text-ink"
        >
          {t(locale, "profileCancel")}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
        >
          {t(locale, "profileSave")}
        </button>
      </div>
    </div>
  );
}

