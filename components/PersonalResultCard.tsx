import { QetIndexGauge } from "./QetIndexGauge";
import { PillarRadar } from "./charts/PillarRadar";
import { t } from "@/lib/content/i18n";
import type { Locale } from "@/lib/content/types";

export interface PersonalSubmissionData {
  qualityScore: number;
  ethicsScore: number;
  transparencyScore: number;
  qetIndex: number;
  scopeIndex: number;
  testScope: string;
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
      <h2 className="font-display text-lg font-semibold text-ink">{t(locale, "dashboardYourResult")}</h2>
      {isFull ? (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
          <QetIndexGauge value={submission.qetIndex} label={t(locale, "qetIndex")} locale={locale} size={180} />
          <PillarRadar scores={pillarScores} locale={locale} />
        </div>
      ) : (
        <div className="mt-4 flex justify-center">
          <QetIndexGauge value={submission.scopeIndex} label={t(locale, "qetIndex")} locale={locale} size={180} />
        </div>
      )}
    </div>
  );
}
