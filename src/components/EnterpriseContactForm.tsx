"use client";

import { useState } from "react";
import { useLocaleState } from "@/lib/useLocaleState";
import { LOCALES, t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";
import { QetSymbol } from "./QetSymbol";
import { ENTERPRISE_THRESHOLD } from "@/lib/billing";

// Kontaktformular für Enterprise-Anfragen (500+ Teilnehmende), verlinkt von
// der Marketing-Landingpage (qet-compass.com). Ersetzt den bisherigen
// "mailto"-Link – siehe /api/enterprise-contact.
export function EnterpriseContactForm() {
  const [locale, setLocale] = useLocaleState();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [participants, setParticipants] = useState(ENTERPRISE_THRESHOLD);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/enterprise-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, contactName, contactEmail, participants, message, locale }),
    });
    setLoading(false);
    if (!res.ok) {
      setError(t(locale, "enterpriseErrorGeneric"));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">{t(locale, "enterpriseSuccessTitle")}</h1>
        <p className="mt-3 text-ink/70">{t(locale, "enterpriseSuccessBody")}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-ink/60">
          <span className="h-6 w-6">
            <QetSymbol />
          </span>
          {t(locale, "brand")}
        </div>
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
      </div>

      <h1 className="font-display text-3xl font-semibold text-ink">{t(locale, "enterpriseTitle")}</h1>
      <p className="mt-2 text-ink/70">{t(locale, "enterpriseSubtitle")}</p>
      <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
        <label className="block text-sm font-medium text-ink/80">
          {t(locale, "companyNameLabel")}
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>

        <label className="mt-3 block text-sm font-medium text-ink/80">
          {t(locale, "yourNameRequired")}
          <input
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>

        <label className="mt-3 block text-sm font-medium text-ink/80">
          {t(locale, "emailLabel")}
          <input
            required
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>

        <label className="mt-3 block text-sm font-medium text-ink/80">
          {t(locale, "enterpriseParticipantsLabel")}
          <input
            required
            type="number"
            min={ENTERPRISE_THRESHOLD}
            value={participants}
            onChange={(e) => setParticipants(Math.max(ENTERPRISE_THRESHOLD, Number(e.target.value) || ENTERPRISE_THRESHOLD))}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>

        <label className="mt-3 block text-sm font-medium text-ink/80">
          {t(locale, "enterpriseMessageLabel")}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? t(locale, "enterpriseSubmitting") : t(locale, "enterpriseSubmit")}
        </button>
      </form>
    </main>
  );
}
