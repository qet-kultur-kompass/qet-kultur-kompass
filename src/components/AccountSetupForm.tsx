"use client";

import { useEffect, useState } from "react";
import { LOCALES, t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";
import { QetSymbol } from "./QetSymbol";

export function AccountSetupForm({ token }: { token: string }) {
  const [locale, setLocale] = useState<Locale>("de");
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/account-setup/${token}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setCompanyName(data.companyName ?? "");
        setValid(true);
      })
      .catch(() => setValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/account-setup/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoading(false);
      setError(t(locale, "accountSetupErrorGeneric"));
      return;
    }
    setDone(true);
    window.setTimeout(() => {
      window.location.href = "/mein-dashboard";
    }, 1200);
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

      <h1 className="font-display text-3xl font-semibold text-ink">{t(locale, "accountSetupTitle")}</h1>
      <p className="mt-2 text-ink/70">
        {companyName ? `${companyName} – ` : ""}
        {t(locale, "accountSetupSubtitle")}
      </p>
      {checking && <p className="mt-6 text-sm text-ink/50">…</p>}

      {!checking && !valid && (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t(locale, "accountSetupInvalidToken")}
        </p>
      )}

      {!checking && valid && !done && (
        <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
          <label className="block text-sm font-medium text-ink/80">
            {t(locale, "passwordLabel")}
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
            />
          </label>
          <p className="mt-1 text-xs text-ink/50">{t(locale, "passwordHint")}</p>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
          >
            {loading ? t(locale, "accountSetupSubmitting") : t(locale, "accountSetupSubmit")}
          </button>
        </form>
      )}

      {done && (
        <p className="mt-6 rounded-2xl border border-quality-200 bg-quality-50 p-4 text-sm text-quality-800">
          {t(locale, "accountSetupDone")}
        </p>
      )}
    </main>
  );
}
