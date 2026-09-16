// Bewusst minimaler Service Worker: erfüllt die Installierbarkeits-
// Voraussetzung für "Zum Startbildschirm/Desktop hinzufügen" (PWA), cached
// aber KEINE Seiten aggressiv. Die App zeigt live Datenbank-Inhalte
// (persönliche Ergebnisse, Team-Dashboard) und personalisierte, mit
// Login-Cookies geschützte Seiten – ein Cache-first-Offline-Modus würde hier
// leicht veraltete oder falsche Daten anzeigen. Stattdessen wird nur ein
// kleines Set an rein statischen Assets (Icons) fürs schnellere Neuladen
// vorgehalten.

const CACHE_NAME = "qet-static-v1";
const STATIC_ASSETS = ["/icon-192.png", "/icon-512.png", "/favicon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (!STATIC_ASSETS.includes(url.pathname)) return; // alles andere: normales Netzwerk, kein Caching

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
