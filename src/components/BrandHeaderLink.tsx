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
 *
 * `wordmarkClassName` (optional, statische Klasse – KEIN zur Laufzeit
 * zusammengesetzter String, daher unproblematisch für den JIT-Compiler)
 * erlaubt eine kleine visuelle Korrektur nur an der Wortmarke, ohne das
 * QetSymbol zu verschieben. Hintergrund: Die Wortmarken-Grafik hat oben
 * etwas mehr "Luft" (Platz für das ®-Zeichen) als unten (der Schweif des
 * "Q" reicht fast bis zum unteren Bildrand) – dadurch wirkt "QET" neben
 * normalem Fließtext (der über die Zeilenhöhe automatisch mittiger sitzt)
 * optisch leicht zu tief. Wird z.B. in LoginForm/SignupForm/
 * MeinDashboardView verwendet, wo die Wortmarke neben dem Tagline-Text
 * "Our compass. Your course." steht, um beide auf eine gemeinsame optische
 * Linie zu bringen.
 */
export function BrandHeaderLink({
  size = 18,
  className = "",
  tone = "ink",
  wordmarkClassName = "",
}: {
  size?: number;
  className?: string;
  tone?: "ink" | "white";
  wordmarkClassName?: string;
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
      <QetLogo tone={tone} height={size} className={wordmarkClassName} />
    </Link>
  );
}
