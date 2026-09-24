/**
 * QET-Wortmarke – als Rastergrafik eingebunden (public/qet-wordmark.png),
 * nicht mehr als selbst gezeichneter SVG-Nachbau. Frühere Versionen dieser
 * Datei haben versucht, den Schriftzug mit einfachen Pfaden/Text
 * nachzubilden (dünner Ring + Systemschrift) – das Ergebnis wich vom
 * offiziellen Logo spürbar ab (falsche Proportionen, falscher Grauton,
 * falsche Formgebung des "Q"). Die PNG-Datei ist ein freigestellter
 * Ausschnitt aus dem vom Nutzer bereitgestellten offiziellen Logo und zeigt
 * exakt die vorgegebene Wortmarke (einfarbig Grau, dickes "Q" mit
 * diagonalem Schweif, "ET" und "®").
 *
 * `tone="white"` liefert die Variante für dunklen/farbigen Grund: da nur
 * eine Graustufen-Datei vorliegt, wird sie dafür per CSS-Filter
 * (`brightness(0) invert(1)`) nach Weiß umgefärbt statt eine zweite Datei
 * vorzuhalten.
 *
 * WICHTIG zur Größenberechnung: Wird nur `height` ODER nur `width` gesetzt,
 * darf die jeweils andere Dimension NICHT einfach weggelassen werden. Ohne
 * eigene CSS-Breite greift der Browser auf das HTML-`width`-Attribut
 * (719px) als tatsächlichen CSS-Wert zurück, statt die Breite proportional
 * aus der gesetzten Höhe zu berechnen – das Bild wurde dadurch (z.B. in
 * BrandHeaderLink mit nur `height`) auf 719px Breite bei z.B. 20px Höhe
 * gestreckt ("total verzerrt"). Deshalb wird hier IMMER selbst aus dem
 * bekannten Seitenverhältnis (719:300) die jeweils fehlende Dimension
 * berechnet und beide Werte explizit gesetzt – das ist robuster als sich
 * auf automatische Seitenverhältnis-Berechnung der Browser zu verlassen.
 *
 * `className` wird IMMER angewendet (auch wenn `width`/`height` gesetzt
 * sind), nicht nur im ungesized Fall – die Inline-Styles für Breite/Höhe
 * gewinnen ohnehin per CSS-Spezifität gegen klassenbasierte Größen, daher
 * ist das gefahrlos. Das erlaubt z.B. `BrandHeaderLink`, über eine zusätzlich
 * durchgereichte Klasse (z.B. eine kleine `-translate-y-*`-Korrektur) die
 * Wortmarke fein zu positionieren, ohne die Größenberechnung zu berühren.
 */
const WORDMARK_WIDTH = 719;
const WORDMARK_HEIGHT = 300;
const WORDMARK_RATIO = WORDMARK_WIDTH / WORDMARK_HEIGHT;

export function QetLogo({
  className = "h-8 w-auto",
  tone = "ink",
  width,
  height,
}: {
  className?: string;
  tone?: "ink" | "white";
  width?: number;
  height?: number;
}) {
  const sized = width !== undefined || height !== undefined;

  let styleWidth: number | undefined;
  let styleHeight: number | undefined;
  if (width !== undefined && height !== undefined) {
    styleWidth = width;
    styleHeight = height;
  } else if (width !== undefined) {
    styleWidth = width;
    styleHeight = width / WORDMARK_RATIO;
  } else if (height !== undefined) {
    styleHeight = height;
    styleWidth = height * WORDMARK_RATIO;
  }

  return (
    <img
      src="/qet-wordmark.png"
      alt="QET"
      width={WORDMARK_WIDTH}
      height={WORDMARK_HEIGHT}
      className={className}
      style={{
        ...(styleWidth !== undefined ? { width: styleWidth } : null),
        ...(styleHeight !== undefined ? { height: styleHeight } : null),
        ...(tone === "white" ? { filter: "brightness(0) invert(1)" } : null),
      }}
    />
  );
}
