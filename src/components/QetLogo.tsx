/**
 * QET-Wortmarke (angelehnt an das offizielle QET-Logo aus den
 * QET-Masterclass-Unterlagen: ein offener Ring als "Q" mit diagonalem
 * Schweif, gefolgt von "ET"). Als Vektor nachgebaut, damit keine externe
 * Bilddatei benötigt wird und die Marke in jeder Auflösung scharf bleibt.
 */
export function QetLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 44" className={className} role="img" aria-label="QET">
      {/* Ring-Teil des "Q" */}
      <path
        d="M 12.54 30.65 A 13 13 0 1 1 27.46 30.65"
        fill="none"
        stroke="#211d17"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Diagonaler Schweif des "Q" */}
      <line x1="26.0" y1="30.39" x2="15.0" y2="37.39" stroke="#3d54b0" strokeWidth="5" strokeLinecap="round" />
      <text
        x="38"
        y="30"
        fontFamily="var(--font-plex-sans)"
        fontWeight={700}
        fontSize="26"
        fill="#211d17"
        letterSpacing="-0.5"
      >
        ET
      </text>
      <text x="79" y="15" fontFamily="var(--font-plex-sans)" fontWeight={600} fontSize="9" fill="#211d17" >
        ®
      </text>
    </svg>
  );
}
