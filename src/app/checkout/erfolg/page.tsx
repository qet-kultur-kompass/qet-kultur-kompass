"use client";

import { useState } from "react";
import Link from "next/link";
import { LOCALES, t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";
import { QetSymbol } from "@/components/QetSymbol";

// /checkout/erfolg – success_url des Stripe-Checkouts (siehe
// src/app/api/checkout/route.ts). Die eigentliche Freischaltung passiert
// bereits serverseitig über den Webhook (checkout.session.completed); diese
// Seite zeigt nur eine Bestätigung und leitet weiter (zum Dashboard, oder –
// bei einem Kauf ohne vorherige Registrierung – bittet, die Willkommens-Mail
// mit dem Konto-Einrichtungslink zu prüfen).
export default function CheckoutSuccessPage() {
  const [locale, setLocale] = useState<Locale>("de");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16 text-center">
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

      <div className="mx-auto mb-4 h-12 w-12 text-quality-500">
        <QetSymbol />
      </div>

      <h1 className="font-display text-3xl font-semibold text-ink">{t(locale, "checkoutSuccessTitle")}</h1>
      <p className="mt-2 text-ink/70">{t(locale, "checkoutSuccessSubtitle")}</p>
      <p className="mt-4 text-sm text-ink/60">{t(locale, "checkoutSuccessCheckEmail")}</p>

      <Link
        href="/mein-dashboard"
        className="mx-auto mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink/90"
      >
        {t(locale, "checkoutSuccessGoToDashboard")}
      </Link>
    </main>
  );
}
