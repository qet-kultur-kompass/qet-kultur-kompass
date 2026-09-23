"use client";

import { useState } from "react";
import { LOCALES, t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";
import type { AggregateResult } from "@/lib/scoring";
import { QetLogo } from "./QetLogo";
import { QetSymbol } from "./QetSymbol";
import { CopyField } from "./CopyField";
import { PersonalResultCard, type PersonalSubmissionData } from "./PersonalResultCard";
import { CompanyDashboardCharts } from "./CompanyDashboardCharts";
import { InviteeList, type InviteeRow } from "./InviteeList";
import { SelfLogoutButton } from "./SelfLogoutButton";
import { SubmissionHistory, type SubmissionSummary } from "./SubmissionHistory";
import { ProgressTrendChart } from "./ProgressTrendChart";
import { ProfileNameEditor } from "./ProfileNameEditor";

export type { SubmissionSummary };

export interface MeinDashboardData {
  role: "owner" | "employee";
  name: string;
  companyName: string;
  accountType: string;
  ownSubmission: PersonalSubmissionData | null;
  ownSubmissionCount?: number;
  /** Volle Testhistorie (neueste zuerst) – Grundlage der Testübersicht. */
  ownSubmissions?: SubmissionSummary[];
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
  const [name, setName] = useState(data.name);
  const [companyName, setCompanyName] = useState(data.companyName);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-[14.7px] w-[14.7px] shrink-0">
            <QetSymbol />
          </span>
          <QetLogo className="h-[14.7px] w-auto" />
          <span className="hidden text-[14.7px] font-medium text-ink/40 sm:inline">
            Our compass. Your course.
          </span>
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
          <a
            href="/mein-dashboard/report"
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/70 transition hover:bg-ink/5"
          >
            {t(locale, "reportOpenReport")}
          </a>
          <a
            href="/mein-dashboard/strategie"
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/70 transition hover:bg-ink/5"
          >
            {t(locale, "strategyOpenLink")}
          </a>
          <SelfLogoutButton locale={locale} />
        </div>
      </div>

      <ProfileNameEditor
        name={name}
        companyName={companyName}
        showCompanyField={data.role === "owner" && data.accountType === "company"}
        locale={locale}
        onSaved={(next) => {
          setName(next.name);
          setCompanyName(next.companyName);
        }}
      />

      {!data.ownSubmission ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink/20 p-8 text-center">
          <p className="text-sm text-ink/60">{t(locale, "dashboardNotYetCompleted")}</p>
          <a
            href={`/invite/${data.ownInviteToken}?new=1`}
            className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            {t(locale, "dashboardStartSurvey")}
          </a>
        </div>
      ) : (
        <div className="mt-6">
          <PersonalResultCard submission={data.ownSubmission} locale={locale} />
          <a
            href={`/invite/${data.ownInviteToken}?new=1`}
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper shadow-card transition hover:bg-ink/90"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Neuen Test starten
          </a>
        </div>
      )}

      {(data.ownSubmissions?.length ?? 0) > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Meine Tests</h2>
            <span className="text-xs text-ink/45">
              {data.ownSubmissions!.length} {data.ownSubmissions!.length === 1 ? "Testlauf" : "Testläufe"}
            </span>
          </div>
          <div className="mt-4">
            <ProgressTrendChart submissions={data.ownSubmissions!} locale={locale} />
          </div>
          <div className="mt-4">
            <SubmissionHistory submissions={data.ownSubmissions!} locale={locale} />
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
              <a
                href={`/api/mein-dashboard/export?locale=${locale}`}
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink/70 transition hover:bg-ink/5"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1v8M3.5 6L7 9.5 10.5 6M2 12h10"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t(locale, "dashboardExportCsv")}
              </a>
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
