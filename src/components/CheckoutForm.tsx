"use client";

import { useEffect, useState } from "react";
import { LOCALES, t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";
import { QetSymbol } from "./QetSymbol";
import { FREE_PARTICIPANT_LIMIT, ENTERPRISE_THRESHOLD } from "@/lib/billing";

// Öffentliche Checkout-Seite für einen Kauf OHNE vorherige Registrierung
// ("startklar ohne Digistore24", siehe README "Bezahlung (Stripe)"). Wer
// bereits ein Konto hat, erweitert sein Kontingent stattdessen direkt über
// den "Plan erweitern"-Button im Dashboard (ruft dieselbe /api/checkout-Route
// auf, aber mit bestehender Session statt companyName/ownerName/ownerEmail).
export function CheckoutForm() {
  const [locale, setLocale] = useState<Locale>("de");
  const [participants, setParticipants] = useState(FREE_PARTICIPANT_LIMIT + 1);
  const [interval, setIntervalValue] = useState<"monthly" | "yearly">("monthly");
  const [priceMonthly, setPriceMonthly] = useState<number | null>(null);
  const [tier, setTier] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/checkout?participants=${participants}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setPriceMonthly(data.priceMonthly ?? null);
        setTier(data.tier ?? "");
      })
      .catch(() => {});
    return () => controller.abort();
  }, [participants]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participants, interval, locale, companyName, ownerName, ownerEmail }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.url) {
      setLoading(false);
      setError(data?.error === "email_taken_please_login" ? t(locale, "signupErrorEmailTaken") : t(locale, "errorSubmit"));
      return;
    }
    window.location.href = data.url;
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

      <h1 className="font-display text-3xl font-semibold text-ink">{t(locale, "checkoutTitle")}</h1>

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
        <label className="block text-sm font-medium text-ink/80">
          {t(locale, "checkoutParticipants")}
          <input
            required
            type="number"
            min={1}
            max={ENTERPRISE_THRESHOLD - 1}
            value={participants}
            onChange={(e) => setParticipants(Math.max(1, Math.min(ENTERPRISE_THRESHOLD - 1, Number(e.target.value) || 1)))}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>
        {priceMonthly !== null && (
          <p className="mt-2 text-sm text-ink/70">
            {tier} · {priceMonthly.toFixed(2).replace(".", ",")} € / {t(locale, "checkoutMonthly").toLowerCase()}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIntervalValue("monthly")}
            className={`rounded-xl border p-3 text-sm transition ${
              interval === "monthly" ? "border-ink bg-ink/5" : "border-ink/10 hover:border-ink/30"
            }`}
          >
            {t(locale, "checkoutMonthly")}
          </button>
          <button
            type="button"
            onClick={() => setIntervalValue("yearly")}
            className={`rounded-xl border p-3 text-sm transition ${
              interval === "yearly" ? "border-ink bg-ink/5" : "border-ink/10 hover:border-ink/30"
            }`}
          >
            {t(locale, "checkoutYearly")}
          </button>
        </div>

        <label className="mt-5 block text-sm font-medium text-ink/80">
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
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-ink/80">
          {t(locale, "emailLabel")}
          <input
            required
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? "…" : t(locale, "checkoutSubmit")}
        </button>
      </form>
    </main>
  );
}
