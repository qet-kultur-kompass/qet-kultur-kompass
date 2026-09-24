"use client";

import { useState } from "react";
import Link from "next/link";
import { LOCALES, t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";
import { BrandHeaderLink } from "./BrandHeaderLink";

export function LoginForm() {
  const [locale, setLocale] = useState<Locale>("de");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setLoading(false);
      setError(t(locale, "loginError"));
      return;
    }
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

      <h1 className="font-display text-3xl font-semibold text-ink">{t(locale, "loginTitle")}</h1>
      <p className="mt-2 text-ink/70">{t(locale, "loginSubtitle")}</p>

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
        <label className="block text-sm font-medium text-ink/80">
          {t(locale, "emailLabel")}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-ink/80">
          {t(locale, "passwordLabel")}
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-quality-500"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
        >
          {loading ? t(locale, "loginSubmitting") : t(locale, "loginSubmit")}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-ink/50">{t(locale, "loginEmployeeHint")}</p>

      <p className="mt-5 text-center text-sm text-ink/60">
        {t(locale, "loginNoAccount")}{" "}
        <Link href="/start" className="font-medium text-ink hover:underline">
          {t(locale, "loginSignupLink")}
        </Link>
      </p>
    </main>
  );
}

