import { QetLogo } from "./QetLogo";
import { QetSymbol } from "./QetSymbol";

/**
 * Kleine, NICHT anklickbare Marken-Kennzeichnung (Symbol + Wortmarke) für die
 * Ecke einzelner "Hauptfelder" – eigenständiger Ergebnis-/Report-Karten wie
 * PersonalResultCard oder CompanyDashboardCharts, die für sich stehen (z.B.
 * als Screenshot oder Ausschnitt losgelöst von der übrigen Seite betrachtet
 * werden könnten).
 *
 * Anders als BrandHeaderLink (Kopfzeile jeder Seite, anklickbar → führt zur
 * Startseite) ist diese Kennzeichnung rein dekorativ und bewusst NICHT
 * verlinkt: ein Klick würde hier überraschen, da die Karte selbst kein
 * Navigationselement ist – die Startseiten-Navigation bleibt Aufgabe des
 * Seiten-Headers (BrandHeaderLink). Daher `aria-hidden` und kein <Link>.
 *
 * Bewusst ohne eigene Positionierung (kein `absolute`) – der Aufrufer
 * platziert die Kennzeichnung je nach Kartenlayout selbst (z.B. in einer
 * `justify-between`-Kopfzeile neben einer Überschrift), damit die Komponente
 * in unterschiedlichen Karten-Layouts wiederverwendbar bleibt.
 */
export function BrandCardMark({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 ${className}`} aria-hidden>
      <span className="shrink-0" style={{ height: size, width: size }}>
        <QetSymbol />
      </span>
      <QetLogo height={size} />
    </span>
  );
}
