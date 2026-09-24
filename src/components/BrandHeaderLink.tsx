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
 * VERTIKALE AUSRICHTUNG (`wordmarkNudgeRatio`): Die Wortmarken-Grafik
 * (public/qet-wordmark.png, 719×300) hat oben spürbar mehr "Luft" (Platz
 * für das ®-Zeichen) als unten (der Schweif des "Q" reicht fast bis zum
 * unteren Bildrand). Per Bildanalyse (Alpha-Kanal der PNG-Datei, Zeilen der
 * "T"-Säule ohne das ®-Zeichen) liegt die optische Mitte der eigentlichen
 * Buchstaben bei ca. 60,5 % der Bildhöhe statt bei 50 % – die sichtbaren
 * Buchstaben sitzen also ca. 10,5 % der Bildhöhe UNTERHALB der geometrischen
 * Bildmitte. Ohne Korrektur richtet `items-center` nur die BOUNDING BOXES
 * von Symbol (symmetrisch, optische Mitte = Box-Mitte) und Wortmarken-Bild
 * aneinander aus – dadurch wirkt der Kreis relativ zu den sichtbaren
 * Buchstaben zu hoch. Die Korrektur verschiebt die Wortmarke deshalb IMMER
 * (nicht mehr optional pro Aufrufer) um `size * wordmarkNudgeRatio` nach
 * oben, damit Kreis und Schriftzug an jeder verwendeten Größe auf derselben
 * horizontalen Achse sitzen. Da eine zur Laufzeit berechnete Tailwind-
 * Arbitrary-Value-Klasse (z.B. `-translate-y-[${px}px]`) vom JIT-Compiler
 * nicht erkannt würde (siehe oben), erfolgt die Verschiebung über eine
 * umschließende <span> mit Inline-Style statt über eine Tailwind-Klasse auf
 * dem <img> selbst.
 *
 * Zuvor gab es dafür ein optionales `wordmarkClassName`-Prop, das nur an
 * 3 von 21 Einbindungen (LoginForm/SignupForm/MeinDashboardView, alle mit
 * `size={15}`) gesetzt war – an allen anderen Stellen (Admin-Seiten,
 * InviteFlow, SurveyFlow, StrategyView, BusinessReportView, …) fehlte die
 * Korrektur komplett. Die Berechnung anhand von `size` ersetzt das jetzt
 * einheitlich für ALLE Einbindungen, ohne dass jeder Aufrufer daran denken
 * muss. Das Prop bleibt als seltener Fein-Justierungs-Hook erhalten, wirkt
 * nun aber zusätzlich zur automatischen Basis-Korrektur.
 */
const WORDMARK_NUDGE_RATIO = 0.105;

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
  const wordmarkNudgePx = size * WORDMARK_NUDGE_RATIO;
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 ${className}`}
      aria-label="QET Kultur-Kompass – zur Startseite"
    >
      <span className="shrink-0" style={{ height: size, width: size }} aria-hidden>
        <QetSymbol />
      </span>
      <span className="inline-block shrink-0" style={{ transform: `translateY(-${wordmarkNudgePx}px)` }}>
        <QetLogo tone={tone} height={size} className={wordmarkClassName} />
      </span>
    </Link>
  );
}

