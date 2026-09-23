"use client";

import { useState } from "react";
import { CRITERION_DESCRIPTIONS } from "@/lib/content/criteriaDescriptions";
import { t } from "@/lib/content/i18n";
import { resolveText } from "@/lib/content/types";
import type { Locale } from "@/lib/content/types";

/**
 * Kleiner "i"-Button neben einem Kriterium, der bei Klick eine Kurzbeschreibung
 * des Kriteriums als Overlay zeigt (Quelle: qet-masterclass.com), damit
 * Teilnehmende beim Betrachten ihres Ergebnisses fachlichen Hintergrund zur
 * jeweiligen Aussage bekommen. Rendert nichts, falls für die Kriterien-ID
 * keine Beschreibung hinterlegt ist.
 */
export function CriterionInfoButton({
  criterionId,
  name,
  locale,
  accent,
}: {
  criterionId: string;
  name: string;
  locale: Locale;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const descriptionText = CRITERION_DESCRIPTIONS[criterionId];
  const description = descriptionText ? resolveText(descriptionText, locale) : undefined;
  if (!description) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={t(locale, "criterionInfoAria", { name })}
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[9px] font-semibold leading-none transition hover:opacity-70"
        style={{ color: accent }}
      >
        i
      </button>
      {open && (
        <div
          className="no-print fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-ink">{name}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t(locale, "criterionInfoClose")}
                className="shrink-0 rounded-full p-1 text-ink/50 transition hover:bg-ink/5 hover:text-ink"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/75">{description}</p>
            <p className="mt-4 text-xs text-ink/40">{t(locale, "criterionInfoSource")}</p>
          </div>
        </div>
      )}
    </>
  );
}
