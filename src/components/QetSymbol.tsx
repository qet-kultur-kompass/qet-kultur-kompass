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
 *
 * Die drei Segment-Pfade sind um den Mittelpunkt (28, 28) der ursprünglichen
 * 56×56-Zeichenfläche herum konstruiert (Außenradius 25, Innenradius 15).
 * Die `<g transform="...">`-Gruppe skaliert den Ring um genau diesen
 * Mittelpunkt 30 % größer (scale(1.3); erste Fassung nutzte 1.1 = 10 %,
 * auf Wunsch nochmals vergrößert). Bei diesem Faktor reicht der
 * Außenradius (25 × 1.3 = 32.5) über die ursprüngliche 56×56-Fläche
 * hinaus – deshalb ist das `viewBox` passend auf "-4.5 -4.5 65 65" verengt
 * (eng um den neuen, größeren Ring zugeschnitten, weiterhin zentriert auf
 * (28, 28)). So wird der Ring innerhalb seines Containers so groß wie
 * möglich dargestellt, ohne dass etwas abgeschnitten wird.
 */
export function QetSymbol({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="-4.5 -4.5 65 65" className={className} aria-hidden>
      <g transform="translate(28 28) scale(1.3) translate(-28 -28)">
        <path d="M 28.00 3.00 A 25 25 0 0 1 50.66 38.57 L 41.59 34.34 A 15 15 0 0 0 28.00 13.00 Z" fill="#6f83bc" />
        <path d="M 49.65 40.50 A 25 25 0 0 1 7.52 42.34 L 15.71 36.60 A 15 15 0 0 0 40.99 35.50 Z" fill="#799683" />
        <path d="M 6.35 40.50 A 25 25 0 0 1 25.82 3.10 L 26.69 13.06 A 15 15 0 0 0 15.01 35.50 Z" fill="#caab76" />
      </g>
    </svg>
  );
}
