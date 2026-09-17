"use client";

import { useState } from "react";
import { LOCALES, t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";
import type { AggregateResult } from "@/lib/scoring";
import { QetSymbol } from "./QetSymbol";
import { CopyField } from "./CopyField";
import { PersonalResultCard, type PersonalSubmissionData } from "./PersonalResultCard";
import { CompanyDashboardCharts } from "./CompanyDashboardCharts";
import { InviteeList, type InviteeRow } from "./InviteeList";
import { SelfLogoutButton } from "./SelfLogoutButton";

export interface MeinDashboardData {
  role: "owner" | "employee";
  name: string;
  companyName: string;
  accountType: string;
  ownSubmission: PersonalSubmissionData | null;
  ownSubmissionCount?: number;
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
          <div className="mt-3 flex items-center justify-between gap-3">
            {(data.ownSubmissionCount ?? 0) > 1 && (
              <p className="text-xs text-ink/50">
                {data.ownSubmissionCount} Testläufe insgesamt – aktuellstes Ergebnis oben.
              </p>
            )}
            <a
              href={`/invite/${data.ownInviteToken}`}
              className="ml-auto rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink/80 transition hover:bg-ink/5"
            >
              Weiteren Test durchführen
            </a>
          </div>
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
