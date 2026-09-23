import Link from "next/link";
import { QetLogo } from "./QetLogo";
import { QetSymbol } from "./QetSymbol";

/**
 * Anklickbarer Marken-Lockup (Symbol + Wortmarke) für die Kopfzeile jeder
 * Unterseite. Ersetzt die bislang pro Seite unabhängig duplizierte
 * Kombination aus QetSymbol + QetLogo (an einigen Stellen nur QetSymbol +
 * hartkodierter Klartext "QET Kultur-Kompass") durch EINE gemeinsame
 * Komponente, damit das Logo überall identisch aussieht und sich klickbar
 * verhält – ein Klick führt immer zur Startseite ("/"), wie gefordert.
 *
 * `size` steuert die Höhe (in Pixeln) von Symbol UND Wortmarke einheitlich;
 * die Breite ergibt sich jeweils automatisch aus dem intrinsischen
 * Seitenverhältnis. Bewusst als Inline-Style/SVG-Attribut statt als
 * berechnete Tailwind-Arbitrary-Value-Klasse (z.B. `h-[${size}px]`) gelöst,
 * da eine zur Laufzeit zusammengesetzte Tailwind-Klasse vom JIT-Compiler
 * nicht erkannt und somit keine CSS-Regel dafür erzeugt würde.
 */
export function BrandHeaderLink({
  size = 18,
  className = "",
  tone = "ink",
}: {
  size?: number;
  className?: string;
  tone?: "ink" | "white";
}) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 ${className}`}
      aria-label="QET Kultur-Kompass – zur Startseite"
    >
      <span className="shrink-0" style={{ height: size, width: size }} aria-hidden>
        <QetSymbol />
      </span>
      <QetLogo tone={tone} height={size} />
    </Link>
  );
}
