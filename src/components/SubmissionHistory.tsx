"use client";

import Link from "next/link";
import { labelForScope } from "@/lib/content/scopes";
import { scopeFromId } from "@/lib/content/types";
import type { Locale } from "@/lib/content/types";
import { bandFor } from "@/lib/scoring";

export interface SubmissionSummary {
  id: string;
  testScope: string;
  label: string | null;
  qetIndex: number;
  scopeIndex: number;
  createdAt: string; // ISO
}

const BAND_COLOR: Record<string, string> = {
  critical: "#b3432b",
  watch: "#c9862a",
  solid: "#3d54b0",
  strong: "#2d7a56",
};

function relativeDate(iso: string, locale: Locale): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));

  if (locale === "de") {
    if (days <= 0) return "heute";
    if (days === 1) return "gestern";
    if (days < 7) return `vor ${days} Tagen`;
    if (days < 31) {
      const weeks = Math.floor(days / 7);
      return weeks === 1 ? "vor 1 Woche" : `vor ${weeks} Wochen`;
    }
  } else if (locale === "en") {
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 31) {
      const weeks = Math.floor(days / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    }
  } else {
    if (days <= 0) return "bugün";
    if (days === 1) return "dün";
    if (days < 7) return `${days} gün önce`;
    if (days < 31) {
      const weeks = Math.floor(days / 7);
      return weeks === 1 ? "1 hafta önce" : `${weeks} hafta önce`;
    }
  }
  return new Date(iso).toLocaleDateString(locale === "de" ? "de-DE" : locale === "tr" ? "tr-TR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Kompakte, klickbare Zeitachse aller eigenen Testläufe – die
 * "Testübersicht" aus der Roadmap V2.0 (Mehrfach-Tests/Zeitachse). Jede
 * Zeile führt zur read-only Detailansicht des jeweiligen Testlaufs unter
 * /mein-dashboard/verlauf/[id] ("zurück in den Test"), ohne den aktuellen
 * Stand auf dem Haupt-Dashboard zu verdrängen. */
export function SubmissionHistory({
  submissions,
  locale = "de",
}: {
  submissions: SubmissionSummary[];
  locale?: Locale;
}) {
  if (submissions.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white/60 shadow-card">
      <ul className="divide-y divide-ink/10">
        {submissions.map((s, i) => {
          const scope = scopeFromId(s.testScope) ?? { kind: "full" as const };
          const label = labelForScope(scope, locale);
          const value = scope.kind === "full" ? s.qetIndex : s.scopeIndex;
          const band = bandFor(value);
          const color = BAND_COLOR[band];
          return (
            <li key={s.id}>
              <Link
                href={`/mein-dashboard/verlauf/${s.id}`}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-ink/[0.03]"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  style={{ backgroundColor: `${color}1a`, color }}
                >
                  {Math.round(value)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm font-semibold text-ink">
                    {label}
                    {s.label && <span className="ml-2 text-xs font-normal text-ink/45">· {s.label}</span>}
                  </div>
                  <div className="mt-0.5 text-xs text-ink/50">
                    {relativeDate(s.createdAt, locale)}
                    {i === 0 && <span className="ml-2 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink/50">Aktuell</span>}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-ink/25">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
