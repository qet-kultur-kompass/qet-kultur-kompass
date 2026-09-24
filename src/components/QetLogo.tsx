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
 */
const WORDMARK_WIDTH = 719;
const WORDMARK_HEIGHT = 300;

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

  return (
    <img
      src="/qet-wordmark.png"
      alt="QET"
      width={WORDMARK_WIDTH}
      height={WORDMARK_HEIGHT}
      className={sized ? undefined : className}
      style={{
        ...(height !== undefined ? { height } : null),
        ...(width !== undefined ? { width } : null),
        ...(tone === "white" ? { filter: "brightness(0) invert(1)" } : null),
      }}
    />
  );
}
