"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/content/types";

const LOCALES: Locale[] = ["de", "en", "tr", "ro"];
const STORAGE_KEY = "qet-lang";

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

/**
 * Sprache der Seite: kommt aus dem Link (?lang=ro), sonst vom letzten Besuch,
 * sonst Deutsch. Eine Auswahl im Sprachmenü wird für den nächsten Besuch gemerkt.
 * So bleibt die auf qet.ag bzw. qet-compass.com gewählte Sprache erhalten.
 */
export function useLocaleState(): [Locale, (locale: Locale) => void] {
  const [locale, setLocaleValue] = useState<Locale>("de");

  useEffect(() => {
    try {
      const fromLink = (new URLSearchParams(window.location.search).get("lang") || "").toLowerCase();
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(fromLink)) {
        setLocaleValue(fromLink);
        window.localStorage.setItem(STORAGE_KEY, fromLink);
      } else if (isLocale(saved)) {
        setLocaleValue(saved);
      }
    } catch {
      // Ohne Zugriff auf den Browser-Speicher bleibt es bei Deutsch.
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleValue(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // nicht merkbar – kein Problem
    }
  };

  return [locale, setLocale];
}
