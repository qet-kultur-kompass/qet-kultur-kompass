/**
 * Sprachunabhängiges Marken-Symbol: ein dreigeteilter Ring in den drei
 * QET-Säulenfarben (Qualität/Ethik/Transparenz). Angelehnt an den
 * "QET-Zirkel" aus den offiziellen QET-Unterlagen (dort ein Ring mit 7
 * Segmenten je Managementfeld) – hier bewusst auf die 3 Säulen reduziert,
 * damit das Symbol ohne Text auskommt und in DE/EN/TR gleichermaßen
 * funktioniert. Ersetzt den bisherigen Platzhalter (Kreis mit Dreieck).
 *
 * Farbwerte per Bildpipette aus dem vom Nutzer bereitgestellten offiziellen
 * QET-Logo übernommen (heller/wärmer als die kräftigeren Säulenfarben, die
 * anderswo in der App für Diagramme/Balken verwendet werden – dort bewusst
 * NICHT geändert, da diese Farben dort für Lesbarkeit/Kontrast in Charts
 * optimiert sind und unabhängig von der Marken-Darstellung sind).
 */
export function QetSymbol({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden>
      <path d="M 28.00 3.00 A 25 25 0 0 1 50.66 38.57 L 41.59 34.34 A 15 15 0 0 0 28.00 13.00 Z" fill="#6f83bc" />
      <path d="M 49.65 40.50 A 25 25 0 0 1 7.52 42.34 L 15.71 36.60 A 15 15 0 0 0 40.99 35.50 Z" fill="#799683" />
      <path d="M 6.35 40.50 A 25 25 0 0 1 25.82 3.10 L 26.69 13.06 A 15 15 0 0 0 15.01 35.50 Z" fill="#caab76" />
    </svg>
  );
}
