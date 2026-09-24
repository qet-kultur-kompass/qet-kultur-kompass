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
 * VERTIKALE AUSRICHTUNG (`WORDMARK_NUDGE_RATIO`): Die Wortmarken-Grafik
 * (public/qet-wordmark.png, 719×300) hat oben spürbar mehr "Luft" (Platz
 * für das ®-Zeichen) als unten, wodurch die sichtbaren Buchstaben unterhalb
 * der geometrischen Bildmitte sitzen. Ohne Korrektur richtet `items-center`
 * nur die BOUNDING BOXES von Symbol und Wortmarken-Bild aneinander aus –
 * dadurch wirkt der Ring relativ zu den sichtbaren Buchstaben zu hoch. Die
 * Korrektur verschiebt die Wortmarke deshalb um `size * WORDMARK_NUDGE_RATIO`
 * nach oben, damit Ring und Schriftzug auf derselben horizontalen Achse
 * sitzen.
 *
 * Der Wert (0.105) ist bewusst IDENTISCH mit BrandCardMark.tsx – jener
 * Komponente, deren Logo-Darstellung im Ergebnisfeld (PersonalResultCard,
 * "Ihr eigenes Ergebnis") vom Nutzer ausdrücklich als korrekt bestätigt
 * wurde. Es gibt hier absichtlich KEINE eigene, abweichende Konstante mehr:
 * die Kopfzeile soll exakt so aussehen wie das bestätigte Ergebnisfeld-Logo,
 * nicht wie ein separat "nachgemessener" Wert. (Eine frühere Version dieser
 * Datei verwendete testweise 0.242, basierend auf einer eigenen Pixelmessung
 * der Kopfzeile – das war falsch und wurde auf ausdrücklichen Wunsch des
 * Nutzers zurückgenommen: es soll keine erfundenen/abweichenden Werte geben,
 * sondern exakt die bestätigte Darstellung.)
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

