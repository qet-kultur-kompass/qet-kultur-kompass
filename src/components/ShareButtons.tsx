"use client";

import { useEffect, useState } from "react";

/**
 * Zwei kompakte Icon-Buttons zum Teilen eines einzelnen Ergebniswerts per
 * WhatsApp (öffnet die eigene Kontaktauswahl über wa.me, ohne feste
 * Zielnummer) oder per E-Mail (mailto:) – z.B. um die HR-Abteilung gezielt
 * auf ein Kriterium, ein Managementfeld, eine Säule oder den Gesamtindex
 * hinzuweisen. Der Link zur aktuellen Seite wird erst nach dem Mounten
 * ergänzt (window ist serverseitig nicht verfügbar) – so bleibt der erste
 * Render serverseitig/clientseitig identisch und es entsteht keine
 * Hydration-Abweichung.
 */
export function ShareButtons({
  label,
  value,
  className = "",
}: {
  /** Name des geteilten Elements, z.B. "Führung" oder "QET-Index". */
  label: string;
  /** Prozentwert 0–100. */
  value: number;
  className?: string;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const text = `${label}: ${Math.round(value)}%${url ? ` – vollständiges Ergebnis: ${url}` : ""}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(label)}&body=${encodeURIComponent(text)}`;

  return (
    <span className={`no-print inline-flex items-center gap-0.5 ${className}`}>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        aria-label={`${label}: per WhatsApp teilen`}
        title="Per WhatsApp teilen"
        className="flex h-6 w-6 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/10 hover:text-ink"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 1.5a6.5 6.5 0 0 0-5.6 9.8L1.5 14.5l3.3-.9A6.5 6.5 0 1 0 8 1.5Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          <path
            d="M5.6 5.4c.15-.35.3-.35.45-.35h.35c.12 0 .28 0 .4.32.15.38.5 1.3.55 1.4.05.1.08.22.02.35-.06.13-.09.2-.18.3-.09.11-.19.24-.27.32-.09.09-.18.18-.08.36.1.18.45.75 1 1.22.68.6 1.24.79 1.42.88.18.09.28.07.38-.04.1-.11.44-.5.56-.68.12-.17.24-.14.4-.08.17.06 1.05.5 1.23.59.18.09.3.13.34.2.05.08.05.44-.1.86-.15.42-.87.8-1.2.85-.32.05-.66.09-2.13-.44-1.8-.65-2.94-2.49-3.03-2.6-.09-.12-.72-.96-.72-1.83s.46-1.3.63-1.48Z"
            fill="currentColor"
          />
        </svg>
      </a>
      <a
        href={mailHref}
        onClick={(e) => e.stopPropagation()}
        aria-label={`${label}: per E-Mail teilen`}
        title="Per E-Mail teilen"
        className="flex h-6 w-6 items-center justify-center rounded-full text-ink/40 transition hover:bg-ink/10 hover:text-ink"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2 4.5l6 4.5 6-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </span>
  );
}
