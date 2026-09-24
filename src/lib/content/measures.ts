import type { LocalizedText } from "./types";

/**
 * Konkrete, sofort umsetzbare Maßnahmen-Vorschläge je Kriterium (Feature
 * "Automatische Maßnahmen-Vorschläge je Kriterium"). Ergänzt das bestehende
 * Strategie/Ziele-Feature (siehe StrategyView.tsx): während dort Ziele frei
 * formuliert werden, liefert dieser Katalog für jedes der 67 Kriterien einen
 * fertigen, direkt in ein Ziel übernehmbaren Vorschlag – angezeigt über
 * MeasureSuggestions.tsx für die schwächsten Kriterien eines Testergebnisses.
 *
 * Bewusst zunächst nur auf Deutsch gepflegt (wie z.B. die rumänischen
 * Kriterien-Statements in criteria.ts) – resolveText() liefert für andere
 * Sprachen automatisch den deutschen Text als Fallback, bis eigene
 * Übersetzungen ergänzt werden. Die Vorschläge sind bewusst allgemein genug
 * gehalten, um auf Unternehmen unterschiedlicher Größe/Branche zu passen,
 * aber konkret genug, um direkt als Ziel-Beschreibung zu funktionieren.
 */
export const MEASURES: Record<string, LocalizedText> = {
  Q01: { de: "Ein strukturiertes Führungskräfte-Feedback einführen (z.B. 360°-Feedback einmal jährlich) und Entscheidungswege in Teammeetings transparent begründen." },
  Q02: { de: "Regelmäßige Team-Retros einführen, in denen Zusammenarbeit und Konflikte offen besprochen werden – moderiert durch eine neutrale Person." },
  Q03: { de: "Eine schriftliche Unternehmensvision erarbeiten und in einem Workshop mit dem gesamten Team verabschieden." },
  Q04: { de: "Ein regelmäßiges Format einführen (z.B. Quartalsmeeting), in dem Mitarbeitende aktiv nach ihrer Meinung zu Entscheidungen gefragt werden." },
  Q05: { de: "Entscheidungsspielräume für Teams klar definieren und schriftlich festhalten, welche Entscheidungen eigenständig getroffen werden dürfen." },
  Q06: { de: "Einen festen Kommunikationsplan für Veränderungsprojekte einführen: Ankündigung, Zwischenstand, Ergebnis." },
  Q07: { de: "Ein strukturiertes Onboarding-Programm für neue Mitarbeitende einführen oder das bestehende überarbeiten." },
  Q08: { de: "Regelmäßige Produkt-Reviews mit Kundenfeedback einplanen, z.B. quartalsweise." },
  Q09: { de: "Ein einfaches Kundenfeedback-System einführen, z.B. eine kurze Umfrage nach Projektabschluss." },
  Q10: { de: "Aktiv an einem Branchennetzwerk oder Verband teilnehmen und Kontakte dokumentieren und pflegen." },
  Q11: { de: "Markenrichtlinien (Wording, Bildsprache, Werte) schriftlich festhalten und im Team kommunizieren." },
  Q12: { de: "Kernprozesse dokumentieren und regelmäßige interne Qualitätschecks einführen." },
  Q13: { de: "Einen Nachfolgeplan für Schlüsselpositionen skizzieren und mit den Beteiligten besprechen." },
  Q14: { de: "Eine einfache Ressourcenplanung für Personal, Budget und Zeit je Projekt einführen, um Engpässe früh zu erkennen." },
  Q15: { de: "Die wichtigsten Arbeitsabläufe visualisieren, z.B. als Flowchart, und Schwachstellen markieren." },
  Q16: { de: "Flexible Arbeitsmodelle bei Zeit und Ort prüfen und in einer Pilotphase mit einem Team testen." },
  Q17: { de: "Einen festen Rahmen für Wissensaustausch schaffen, z.B. monatliche Lunch-&-Learn-Sessions." },
  Q18: { de: "Einen niedrigschwelligen Kanal für Verbesserungsideen einrichten, z.B. eine Ideenbox oder ein digitales Formular." },
  Q19: { de: "Die größten betrieblichen Risiken in einer einfachen Liste erfassen und Verantwortliche sowie Gegenmaßnahmen zuordnen." },
  Q20: { de: "Einen regelmäßigen KVP-Termin etablieren, in dem Verbesserungsvorschläge gesammelt und umgesetzt werden." },
  Q21: { de: "Klare Qualitätsstandards für KI-gestützte Produkt- und Servicefunktionen festlegen, z.B. eine Review-Pflicht bei KI-generierten Kundeninhalten und ein einfaches Monitoring der Fehlerquote." },
  Q22: { de: "Für KI-gestützte Prozessschritte eine klare menschliche Zuständigkeit benennen und stichprobenartige Qualitätschecks der automatisierten Ergebnisse einführen." },

  E01: { de: "Einen kurzen Ethik-Kodex erarbeiten, der die wichtigsten Werte und Verhaltensregeln des Unternehmens festhält." },
  E02: { de: "Regelmäßige, offene Kommunikationsrunden einführen, in denen auch schwierige Themen angesprochen werden dürfen." },
  E03: { de: "Eine Bestandsaufnahme der Teamzusammensetzung machen und konkrete Diversitätsziele für Neueinstellungen festlegen." },
  E04: { de: "Transparent über die wirtschaftliche Lage und Perspektiven des Unternehmens informieren, z.B. mit einem jährlichen Update." },
  E05: { de: "Eine Datenschutz-Grundschulung für alle Mitarbeitenden durchführen und eine Ansprechperson benennen." },
  E06: { de: "Eine Gefährdungsbeurteilung der Arbeitsplätze durchführen beziehungsweise aktualisieren." },
  E07: { de: "Ein anonymes Stimmungsbarometer einführen, um Überlastung frühzeitig zu erkennen." },
  E08: { de: "Die Vergütungsstruktur auf Fairness und Nachvollziehbarkeit prüfen und die Kriterien transparent machen." },
  E09: { de: "Arbeitszeitmodelle regelmäßig mit dem Team abstimmen und auf Über- oder Unterlastung achten." },
  E10: { de: "Konkrete Maßnahmen zur Vereinbarkeit von Beruf und Privatleben einführen, z.B. Homeoffice-Regelung oder Kernarbeitszeiten." },
  E11: { de: "Mitarbeitende regelmäßig in relevante Entscheidungen einbinden, z.B. über einen Betriebsrat oder eine Mitarbeitervertretung." },
  E12: { de: "Ein konkretes Ziel für den Frauenanteil in Führungspositionen festlegen und den Fortschritt jährlich prüfen." },
  E13: { de: "Gezielte Maßnahmen zur Bindung und Förderung älterer Mitarbeitender entwickeln, z.B. Wissenstransfer-Programme." },
  E14: { de: "Prüfen, wie barrierefrei Arbeitsplätze und Prozesse aktuell sind, und einen Verbesserungsplan erstellen." },
  E15: { de: "Einen strukturierten Wiedereingliederungsprozess nach längerer Abwesenheit, z.B. Krankheit, definieren." },
  E16: { de: "Ein jährliches Weiterbildungsbudget je Mitarbeitendem festlegen und aktiv kommunizieren." },
  E17: { de: "Die wichtigsten rechtlichen Vorgaben für das Unternehmen in einer Übersicht zusammenfassen und Verantwortliche benennen." },
  E18: { de: "Lieferanten und Partner auf faire Handelsbedingungen prüfen und die Kriterien in die Auswahl einbeziehen." },
  E19: { de: "Die größten ökologischen Auswirkungen des Betriebs identifizieren und erste Reduktionsmaßnahmen festlegen." },
  E20: { de: "Ein kleines, konkretes CSR-Projekt initiieren, z.B. lokales Engagement, und im Team kommunizieren." },
  E21: { de: "Verbindliche Leitlinien der Unternehmensführung für den KI-Einsatz erarbeiten (wofür KI genutzt werden darf, wofür nicht) und mit dem Team kommunizieren." },
  E22: { de: "Eine fachliche Prüf-Pflicht für KI-gestützte Buchungsvorschläge und Finanzauswertungen einführen, bevor sie übernommen werden." },
  E23: { de: "KI-gestützte Systeme regelmäßig auf Verzerrungen (Bias) gegenüber bestimmten Gruppen prüfen und die Ergebnisse dokumentieren." },

  T01: { de: "Unternehmensleitlinien schriftlich festhalten und für alle Mitarbeitenden zugänglich machen." },
  T02: { de: "Ein einheitliches Erscheinungsbild bei Logo, Farben und Wording für alle Kommunikationskanäle festlegen." },
  T03: { de: "Regelmäßige, für alle zugängliche Updates zu wichtigen Unternehmenskennzahlen und Entscheidungen einführen." },
  T04: { de: "Die Preisgestaltung nachvollziehbar dokumentieren und die Kriterien intern wie extern transparent kommunizieren." },
  T05: { de: "Vertragsvorlagen auf Verständlichkeit prüfen und wichtige Klauseln in einfacher Sprache zusammenfassen." },
  T06: { de: "Klare Richtlinien für den Umgang mit Social Media, privat und geschäftlich, erarbeiten." },
  T07: { de: "Ein einfaches System für regelmäßige, dokumentierte Zielvereinbarungsgespräche einführen." },
  T08: { de: "Einen klaren, allen bekannten Ablauf für die Klärung von Konflikten definieren, z.B. Eskalationsstufen." },
  T09: { de: "Eine offene Fehlerkultur fördern, z.B. durch regelmäßige Lessons-Learned-Runden ohne Schuldzuweisung." },
  T10: { de: "Lieferantenbeziehungen regelmäßig bewerten und die Kriterien Qualität, Fairness und Zuverlässigkeit dokumentieren." },
  T11: { de: "Eine einfache Marketingstrategie mit klaren Botschaften und Zielgruppen erarbeiten." },
  T12: { de: "Feste interne Kommunikationskanäle und -rhythmen festlegen, z.B. ein wöchentliches Team-Update." },
  T13: { de: "Die genutzten IT-Systeme auf Aktualität und Sicherheit prüfen und einen Modernisierungsplan erstellen." },
  T14: { de: "Ein einfaches Kennzahlen-Dashboard für die wichtigsten betrieblichen Kennzahlen einführen." },
  T15: { de: "Die eigene Leistung regelmäßig mit Wettbewerbern oder Branchenstandards vergleichen." },
  T16: { de: "Eine SWOT-Analyse zu Stärken, Schwächen, Chancen und Risiken durchführen und daraus Maßnahmen ableiten." },
  T17: { de: "Bei anhaltenden Konflikten frühzeitig eine externe Mediation in Betracht ziehen." },
  T18: { de: "Ein internes oder externes Audit zur Überprüfung wichtiger Prozesse und Standards planen." },
  T19: { de: "Eine Teilnahme an einem anerkannten Nachhaltigkeits- oder Unternehmensrating prüfen." },
  T20: { de: "Relevante Zertifizierungen, z.B. ISO oder Fair-Trade-Siegel, für das eigene Geschäftsfeld prüfen." },
  T21: { de: "Ein Schulungsformat zum Thema KI für Mitarbeitende einführen (Grundlagen + praktischer Umgang) und eine feste Ansprechperson für Fragen benennen." },
  T22: { de: "Offen kommunizieren, wo und wie im Unternehmen KI eingesetzt wird, z.B. über die Website oder in Kundenmaterialien." },
};
