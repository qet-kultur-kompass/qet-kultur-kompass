"use client";

import { useEffect, useState } from "react";
import { LOCALES, t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";
import type { AggregateResult } from "@/lib/scoring";
import { QetSymbol } from "./QetSymbol";
import { CopyField } from "./CopyField";
import { PersonalResultCard, type PersonalSubmissionData } from "./PersonalResultCard";
import { CompanyDashboardCharts } from "./CompanyDashboardCharts";
import { InviteeList, type InviteeRow } from "./InviteeList";
import { SelfLogoutButton } from "./SelfLogoutButton";

export interface BillingSummary {
  billingProvider: string; // "free" | "stripe" | "manual"
  tier: string | null;
  participantLimit: number;
  participantsUsed: number;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null; // ISO-Datum, oder null
}

export interface MeinDashboardData {
  role: "owner" | "employee";
  name: string;
  companyName: string;
  accountType: string;
  ownSubmission: PersonalSubmissionData | null;
  ownInviteToken: string;
  aggregate: AggregateResult | null;
  responseCount: number;
  minResponses: number;
  origin: string;
  companyId: string;
  dashboardShareUrl?: string;
  surveyShareUrl?: string;
  invitees?: InviteeRow[];
  hasPassword?: boolean;
  billing?: BillingSummary;
}

function formatDate(iso: string | null, locale: Locale) {
  if (!iso) return "";
  const tag = { de: "de-DE", en: "en-GB", tr: "tr-TR", ro: "ro-RO" }[locale];
  return new Date(iso).toLocaleDateString(tag);
}

interface InvoiceRow {
  id: string;
  number: string | null;
  status: string | null;
  amountPaid: number;
  currency: string;
  created: number;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

function InvoicesList({ locale }: { locale: Locale }) {
  const [invoices, setInvoices] = useState<InvoiceRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/billing/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setInvoices(Array.isArray(data?.invoices) ? data.invoices : []);
      })
      .catch(() => {
        if (!cancelled) setInvoices([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (invoices === null) return null;

  return (
    <div className="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
      <div className="text-sm font-medium text-ink">{t(locale, "dashboardInvoicesTitle")}</div>
      {invoices.length === 0 ? (
        <p className="mt-2 text-xs text-ink/50">{t(locale, "dashboardInvoicesEmpty")}</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink/10">
          {invoices.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-3 py-2 text-xs">
              <span className="text-ink/70">
                {formatDate(new Date(inv.created * 1000).toISOString(), locale)}
                {inv.number ? ` · ${inv.number}` : ""} ·{" "}
                {(inv.amountPaid / 100).toFixed(2).replace(".", ",")} {inv.currency.toUpperCase()}
              </span>
              {(inv.hostedInvoiceUrl || inv.invoicePdf) && (
                <a
                  href={inv.hostedInvoiceUrl ?? inv.invoicePdf ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-medium text-ink underline"
                >
                  {t(locale, "dashboardInvoiceOpen")}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
function BillingSection({ billing, locale }: { billing: BillingSummary; locale: Locale }) {
  const [loading, setLoading] = useState<"upgrade" | "portal" | null>(null);

  async function goToCheckout() {
    setLoading("upgrade");
    const nextCount = Math.max(billing.participantLimit + 1, billing.participantsUsed + 1);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participants: nextCount, interval: "monthly", locale }),
    });
    const data = await res.json().catch(() => null);
    if (data?.url) {
      window.location.href = data.url;
      return;
    }
    if (data?.mode === "updated") {
      // Bestehendes Abo wurde direkt per Stripe-API erweitert (kein
      // Checkout-Redirect nötig) -> Seite neu laden, damit das neue
      // Teilnehmerlimit sofort angezeigt wird.
      window.location.reload();
      return;
    }
    setLoading(null);
  }

  async function openPortal() {
    setLoading("portal");
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json().catch(() => null);
    setLoading(null);
    if (data?.url) window.location.href = data.url;
  }

  const isUnlimited = billing.billingProvider === "manual";
  const limitReached = !isUnlimited && billing.participantsUsed >= billing.participantLimit;

  return (
    <div className="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ink">
            {billing.billingProvider === "free"
              ? t(locale, "dashboardPlanFree")
              : `${t(locale, "dashboardPlanPaid")}${billing.tier ? ` – ${billing.tier}` : ""}`}
          </div>
          <div className="mt-1 text-xs text-ink/60">
            {isUnlimited
              ? t(locale, "dashboardParticipantsUnlimited")
              : t(locale, "dashboardParticipantsUsed", {
                  used: billing.participantsUsed,
                  limit: billing.participantLimit,
                })}
          </div>
          {billing.subscriptionStatus === "active" && billing.currentPeriodEnd && (
            <div className="mt-1 text-xs text-ink/50">
              {t(locale, "dashboardRenewsOn", { date: formatDate(billing.currentPeriodEnd, locale) })}
            </div>
          )}
          {billing.subscriptionStatus === "canceled" && billing.currentPeriodEnd && (
            <div className="mt-1 text-xs text-red-600">
              {t(locale, "dashboardSubscriptionCanceled", { date: formatDate(billing.currentPeriodEnd, locale) })}
            </div>
          )}
          {billing.subscriptionStatus === "past_due" && (
            <div className="mt-1 text-xs text-red-600">{t(locale, "dashboardPaymentFailed")}</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goToCheckout}
            disabled={loading !== null}
            className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
          >
            {loading === "upgrade" ? "…" : t(locale, "dashboardUpgrade")}
          </button>
          {billing.billingProvider === "stripe" && (
            <button
              type="button"
              onClick={openPortal}
              disabled={loading !== null}
              className="rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink transition hover:bg-ink/5 disabled:opacity-50"
            >
              {loading === "portal" ? "…" : t(locale, "dashboardManageBilling")}
            </button>
          )}
        </div>
      </div>

      {limitReached && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t(locale, "dashboardLimitReached")}
        </p>
      )}
    </div>
  );
}
export function MeinDashboardView({ data }: { data: MeinDashboardData }) {
  const [locale, setLocale] = useState<Locale>("de");

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-ink/60">
          <span className="h-6 w-6">
            <QetSymbol />
          </span>
          {t(locale, "brand")}
        </div>
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
          <SelfLogoutButton locale={locale} />
        </div>
      </div>

      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
        {t(locale, "dashboardGreeting", { name: data.name })}
      </h1>
      <p className="text-sm text-ink/60">{data.companyName}</p>

      {data.role === "owner" && data.billing && (
        <div className="mt-6">
          <BillingSection billing={data.billing} locale={locale} />
          {data.billing.billingProvider === "stripe" && <InvoicesList locale={locale} />}
        </div>
      )}

      {!data.ownSubmission ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink/20 p-8 text-center">
          <p className="text-sm text-ink/60">{t(locale, "dashboardNotYetCompleted")}</p>
          <a
            href={`/invite/${data.ownInviteToken}`}
            className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            {t(locale, "dashboardStartSurvey")}
          </a>
        </div>
      ) : (
        <div className="mt-6">
          <PersonalResultCard submission={data.ownSubmission} locale={locale} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "dashboardTeamResult")}</h2>
        {data.aggregate ? (
          <div className="mt-4">
            <CompanyDashboardCharts aggregate={data.aggregate} />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/20 p-8 text-center text-sm text-ink/50">
            {data.responseCount <= 1
              ? t(locale, "dashboardOnlyYou")
              : t(locale, "dashboardTeamLocked", { min: data.minResponses, count: data.responseCount })}
          </div>
        )}
      </div>

      {data.role === "owner" && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "dashboardManageTeam")}</h2>

          {data.accountType === "company" && data.surveyShareUrl && (
            <div className="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
              <CopyField label={t(locale, "dashboardOpenSurveyLink")} value={data.surveyShareUrl} />
            </div>
          )}

          {data.dashboardShareUrl && (
            <div className="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-card">
              <CopyField label={t(locale, "dashboardShareLink")} value={data.dashboardShareUrl} />
            </div>
          )}

          {data.accountType === "company" && (
            <div className="mt-4">
              <InviteeList
                companyId={data.companyId}
                origin={data.origin}
                invitees={data.invitees ?? []}
                locale={locale}
              />
            </div>
          )}
        </div>
      )}

      <p className="mt-10 text-center text-xs text-ink/40">{t(locale, "installAppHint")}</p>
    </main>
  );
}
