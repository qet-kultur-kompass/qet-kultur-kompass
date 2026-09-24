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
 * sitzen. Da eine zur Laufzeit berechnete Tailwind-Arbitrary-Value-Klasse
 * (z.B. `-translate-y-[${px}px]`) vom JIT-Compiler nicht erkannt würde
 * (siehe oben), erfolgt die Verschiebung über eine umschließende <span> mit
 * Inline-Style statt über eine Tailwind-Klasse auf dem <img> selbst.
 *
 * Der Wert hier (0.242) wurde speziell für die Kopfzeile per Live-
 * Pixelmessung des produktiv ausgelieferten Logos ermittelt (Screenshot-
 * Zoom + Analyse der Kanal-/Sättigungswerte, getrennt für den Ring und für
 * die tatsächlichen Buchstaben Q/E/T ohne das ®-Zeichen): Bei der bisherigen
 * Basis-Korrektur (0.105, siehe BrandCardMark.tsx) lag die Buchstaben-Mitte
 * noch ca. 4 Bildzeilen (≈2px bei size=15) UNTERHALB der Ring-Mitte, d.h. der
 * Ring wirkte weiterhin zu hoch / der Text zu tief. BrandCardMark verwendet
 * bewusst weiterhin 0.105 (vom Nutzer für das Ergebnisfeld ausdrücklich als
 * korrekt bestätigt) – die abweichenden Werte deuten darauf hin, dass die
 * beiden Kontexte (anklickbarer <Link> vs. reines <span>, leicht
 * unterschiedliche `size`) das Bild nicht pixelidentisch rendern; deshalb
 * hat jede Komponente ihre eigene, empirisch ermittelte Konstante statt
 * einer geteilten.
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
const WORDMARK_NUDGE_RATIO = 0.242;

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

