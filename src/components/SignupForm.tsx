"use client";

import { useState } from "react";
import Link from "next/link";
import { LOCALES, t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";
import { BrandHeaderLink } from "./BrandHeaderLink";

export function SignupForm() {
  const [locale, setLocale] = useState<Locale>("de");
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [ownerName, setOwnerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountType,
        ownerName,
        ownerEmail,
        password,
        companyName: accountType === "company" ? companyName : undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setLoading(false);
      setError(data?.error === "email_taken" ? t(locale, "signupErrorEmailTaken") : t(locale, "signupErrorGeneric"));
      return;
    }
    // Volle Navigation (statt router.push), damit der Server die frisch
    // gesetzte Session-Cookie beim Rendern von /mein-dashboard sicher liest.
    window.location.href = "/mein-dashboard";
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandHeaderLink size={15} />
          <span className="hidden text-[14.7px] font-medium text-ink/40 sm:inline">
            Our compass. Your course.
          </span>
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

      <h1 className="font-display text-3xl font-semibold text-ink">{t(locale, "signupTitle")}</h1>
      <p className="mt-2 text-ink/70">{t(locale, "signupSubtitle")}</p>

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setAccountType("individual")}
            className={`rounded-xl border p-4 text-left transition ${
              accountType === "individual" ? "border-ink bg-ink/5" : "border-ink/10 hover:border-ink/30"
            }`}
          >
            <div className="font-display text-sm font-semibold text-ink">{t(locale, "accountTypeIndividual")}</div>
            <div className="mt-1 text-xs text-ink/60">{t(locale, "accountTypeIndividualDesc")}</div>
          </button>
          <button
            type="button"
            onClick={() => setAccountType("company")}
            className={`rounded-xl border p-4 text-left transition ${
              accountType === "company" ? "border-ink bg-ink/5" : "border-ink/10 hover:border-ink/30"
            }`}
          >
            <div className="font-display text-sm font-semibold text-ink">{t(locale, "accountTypeCompany")}</div>
            <div className="mt-1 text-xs text-ink/60">{t(locale, "accountTypeCompanyDesc")}</div>
          </button>
        </div>

        <label className="mt-5 block text-sm font-medium text-ink/80">
          {t(locale, "yourNameRequired")}
          <input
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>

        {accountType === "company" && (
          <label className="mt-3 block text-sm font-medium text-ink/80">
            {t(locale, "companyNameLabel")}
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
            />
          </label>
        )}

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

        <label className="mt-3 block text-sm font-medium text-ink/80">
          {t(locale, "passwordLabel")}
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
          <span className="mt-1 block text-xs text-ink/50">{t(locale, "passwordHint")}</span>
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? t(locale, "signupSubmitting") : t(locale, "signupSubmit")}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink/60">
        {t(locale, "signupHaveAccount")}{" "}
        <Link href="/login" className="font-medium text-ink hover:underline">
          {t(locale, "signupLoginLink")}
        </Link>
      </p>
    </main>
  );
}

