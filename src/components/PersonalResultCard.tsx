import { QetIndexGauge } from "./QetIndexGauge";
import { QetIndexRing } from "./QetIndexRing";
import { BrandCardMark } from "./BrandCardMark";
import { t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";

export interface PersonalSubmissionData {
  qualityScore: number;
  ethicsScore: number;
  transparencyScore: number;
  qetIndex: number;
  scopeIndex: number;
  testScope: string;
  criterionScores: Record<string, number>;
}

/** Zeigt das EIGENE Ergebnis einer einzelnen Person (Kontoinhaber:in oder
 * eingeladene Person) im persönlichen Dashboard – unabhängig vom
 * anonymisierten Team-Ergebnis der Firma. */
export function PersonalResultCard({
  submission,
  locale = "de",
}: {
  submission: PersonalSubmissionData;
  locale?: Locale;
}) {
  const isFull = submission.testScope === "full";
  const pillarScores = {
    Q: submission.qualityScore,
    E: submission.ethicsScore,
    T: submission.transparencyScore,
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "dashboardYourResult")}</h2>
        <BrandCardMark size={16} />
      </div>
      {isFull ? (
        <div className="mt-4 flex justify-center">
          <QetIndexRing
            qetIndex={submission.qetIndex}
            pillarScores={pillarScores}
            criterionScores={submission.criterionScores}
            label={t(locale, "qetIndex")}
            locale={locale}
            size={260}
          />
        </div>
      ) : (
        <div className="mt-4 flex justify-center">
          <QetIndexGauge value={submission.scopeIndex} label={t(locale, "qetIndex")} locale={locale} size={180} />
        </div>
      )}
    </div>
  );
}
