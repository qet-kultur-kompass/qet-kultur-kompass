"use client";

import { bandFor } from "@/lib/scoring";
import { t } from "@/lib/content/i18n";
import { QetSymbol } from "./QetSymbol";
import type { Locale } from "@/lib/content/types";

const BAND_COLOR: Record<string, string> = {
  critical: "#b3432b",
  watch: "#c9862a",
  solid: "#3d54b0",
  strong: "#2d7a56",
};

const BAND_LABEL_KEY: Record<string, string> = {
  critical: "bandCritical",
  watch: "bandWatch",
  solid: "bandSolid",
  strong: "bandStrong",
};

/**
 * Kompakte QET-Index-Anzeige für Teil-Tests (einzelne Säule oder ein
 * einzelnes Managementfeld) sowie für die Kurzfassung im persönlichen
 * Dashboard ("Ihr eigenes Ergebnis"). Nutzt bewusst dasselbe dreiteilige
 * Segment-Logo (siehe QetSymbol.tsx) wie der große QetIndexRing bei
 * Gesamttests, damit beide Anzeigen optisch durchgängig wirken – anders
 * als beim Gesamttest gibt es hier aber nur EINEN einzelnen Wert, keine
 * echte Aufteilung auf die 3 Säulen. Die Segmente bleiben deshalb rein
 * dekorativ/statisch (immer voll eingefärbt, wie das Logo selbst) statt
 * wertabhängig gefüllt.
 *
 * Im Ring-Zentrum steht fest "QET-Index" + die Zahl darunter – NICHT der
 * jeweilige Test-Scope (z.B. "Führung"): Managementfeld-Namen können recht
 * lang werden (z.B. "Kunden/Produkte/Märkte", türkisch teils noch länger)
 * und würden im kleinen Ring nicht lesbar Platz finden. Der Scope-Name
 * (`label`) steht deshalb weiterhin als eigene Zeile UNTER dem Ring,
 * zusammen mit der Ampel-Einstufung (siehe bandFor in scoring.ts – eine
 * reine Momentaufnahme des aktuellen Werts: <40 kritisch, <60 beobachten,
 * <80 solide, sonst stark; kein Vergleich über die Zeit).
 */
export function QetIndexGauge({
  value,
  label,
  size = 220,
  locale = "de",
}: {
  value: number;
  label?: string;
  size?: number;
  locale?: Locale;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const band = bandFor(clamped);
  const color = BAND_COLOR[band];

  const labelFontSize = size * 0.065;
  const numberFontSize = size * 0.24;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <QetSymbol className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-semibold text-ink/60"
            style={{ fontSize: labelFontSize, letterSpacing: 0.8 }}
          >
            {t(locale, "qetIndex").toUpperCase()}
          </span>
          <span
            className="font-display font-semibold text-ink"
            style={{ fontSize: numberFontSize, lineHeight: 1 }}
          >
            {Math.round(clamped)}%
          </span>
        </div>
      </div>
      {label && <div className="mt-2 font-display text-sm font-medium text-ink/70">{label}</div>}
      <div
        className="mt-2 rounded-full px-3 py-1 text-xs font-medium"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {t(locale, BAND_LABEL_KEY[band])}
      </div>
    </div>
  );
}
