"use client";

import { useEffect } from "react";

/** Registriert den (bewusst minimalen) Service Worker – Voraussetzung dafür,
 * dass Browser die Seite als installierbare App anbieten ("Zum
 * Startbildschirm hinzufügen" auf dem Smartphone, Installations-Icon in der
 * Adressleiste auf dem Desktop). Rein clientseitig, kein Effekt auf SSR. */
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registrierung kann z.B. in eingebetteten Webviews fehlschlagen –
        // die App funktioniert dann ganz normal, nur ohne Installierbarkeit.
      });
    }
  }, []);
  return null;
}
