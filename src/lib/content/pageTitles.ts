import type { Locale } from "./types";

const LOCALES: Locale[] = ["de", "en", "tr", "ro"];

/**
 * Liest die Sprache für den Browser-Tab-Titel aus dem ?lang=-Parameter der URL
 * (serverseitig, bevor die Seite überhaupt lädt). Ungültige/fehlende Werte
 * fallen auf Deutsch zurück – passend zum clientseitigen useLocaleState().
 */
export function pickTitleLocale(searchParams?: {
  lang?: string | string[];
}): Locale {
  const raw = Array.isArray(searchParams?.lang)
    ? searchParams?.lang[0]
    : searchParams?.lang;
  const lang = (raw || "").toLowerCase();
  return LOCALES.includes(lang as Locale) ? (lang as Locale) : "de";
}
