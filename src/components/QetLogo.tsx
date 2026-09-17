/**
 * QET-Wortmarke (angelehnt an das offizielle QET-Logo aus den
 * QET-Masterclass-Unterlagen: ein offener Ring als "Q" mit diagonalem
 * Schweif, gefolgt von "ET"). Als Vektor nachgebaut, damit keine externe
 * Bilddatei benötigt wird und die Marke in jeder Auflösung scharf bleibt.
 *
 * `tone="white"` liefert eine einfarbig weiße Variante für den Einsatz auf
 * dunklem/farbigem Grund (z.B. im Zentrum des QetIndexRing). `width`/`height`
 * setzen die Größe direkt als SVG-Attribute (statt über `className`) – nötig,
 * wenn das Logo als verschachteltes <svg> in einem anderen SVG-Koordinaten-
 * system positioniert wird, wo Tailwind-Größenklassen nicht sauber skalieren.
 */
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
  const ringColor = tone === "white" ? "#ffffff" : "#211d17";
  const tailColor = tone === "white" ? "#ffffff" : "#3d54b0";
  const textColor = tone === "white" ? "#ffffff" : "#211d17";
  const sized = width !== undefined || height !== undefined;

  return (
    <svg
      viewBox="0 0 150 44"
      className={sized ? undefined : className}
      width={width}
      height={height}
      role="img"
      aria-label="QET"
    >
      {/* Ring-Teil des "Q" */}
      <path
        d="M 12.54 30.65 A 13 13 0 1 1 27.46 30.65"
        fill="none"
        stroke={ringColor}
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Diagonaler Schweif des "Q" */}
      <line x1="26.0" y1="30.39" x2="15.0" y2="37.39" stroke={tailColor} strokeWidth="5" strokeLinecap="round" />
      <text
        x="38"
        y="30"
        fontFamily="var(--font-plex-sans)"
        fontWeight={700}
        fontSize="26"
        fill={textColor}
        letterSpacing="-0.5"
      >
        ET
      </text>
      <text x="79" y="15" fontFamily="var(--font-plex-sans)" fontWeight={600} fontSize="9" fill={textColor}>
        ®
      </text>
    </svg>
  );
}
