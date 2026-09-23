import type { LocalizedText } from "./types";

/**
 * Die 7 Managementfelder als zweite, quer zu den 3 Säulen liegende
 * Kategorisierung der 60 Kriterien (Führung, Mitarbeiter,
 * Kunden/Produkte/Märkte, Geschäftsprozesse, Finanzen, Unternehmensimage,
 * CSR/Soziokulturelle Verantwortung).
 *
 * Verbindliche Zuordnung aus den offiziellen QET-Deckblättern
 * (QET_M01_Führung.pdf … QET_M07_Unternehmensimage.pdf), Stand: vom Nutzer
 * bereitgestellt. WICHTIG: Ein Kriterium kann zu MEHREREN Managementfeldern
 * gehören (z.B. Q18 zu 5 der 7 Felder) – das ist im Original-Framework so
 * vorgesehen und wird von der App unterstützt (keine disjunkte Partition).
 * Alle 60 Kriterien sind mindestens einem Feld zugeordnet.
 *
 * Das KI-Sonderkriterium (Q21/E21/T21, siehe criteria.ts) betrifft laut
 * Quelle das Unternehmen als Ganzes und ist deshalb – als einzige Ausnahme –
 * bewusst allen 7 Managementfeldern zugeordnet.
 */

export interface ManagementField {
  key: string;
  name: LocalizedText;
  criteriaIds: string[];
}

export const MANAGEMENT_FIELDS: ManagementField[] = [
  {
    // QET M01: Führung
    key: "leadership",
    name: { de: "Führung", en: "Leadership", ro: "Conducere", tr: "Liderlik" },
    criteriaIds: [
      "Q01", "Q02", "Q03", "Q04", "Q05", "Q06", "Q13", "Q18",
      "E01", "E02", "E11", "E20",
      "T01", "T03", "T07", "T08", "T09", "T12",
      "Q21", "E21", "T21",
    ],
  },
  {
    // QET M02: Mitarbeiter
    key: "employees",
    name: { de: "Mitarbeiter", en: "Employees", ro: "Angajați", tr: "Çalışanlar" },
    criteriaIds: [
      "Q02", "Q05", "Q07", "Q12", "Q17", "Q18",
      "E01", "E02", "E03", "E04", "E06", "E07", "E08", "E09", "E10", "E11", "E12", "E13", "E14", "E15", "E16",
      "T01", "T07", "T12",
      "Q21", "E21", "T21",
    ],
  },
  {
    // QET M03: Kunden / Produkte / Märkte
    key: "customers_products_markets",
    name: {
      de: "Kunden/Produkte/Märkte",
      en: "Customers, Products & Markets",
      ro: "Clienți, Produse și Piețe",
      tr: "Müşteriler, Ürünler ve Pazarlar",
    },
    criteriaIds: [
      "Q06", "Q07", "Q08", "Q09", "Q12", "Q18", "Q19", "Q20",
      "E02", "E03", "E04", "E17", "E18", "E19",
      "T01", "T04", "T05", "T06", "T10", "T11", "T15", "T16", "T17", "T19",
      "Q21", "E21", "T21",
    ],
  },
  {
    // QET M04: Geschäftsprozesse
    key: "business_processes",
    name: { de: "Geschäftsprozesse", en: "Business Processes", ro: "Procese de afaceri", tr: "İş Süreçleri" },
    criteriaIds: [
      "Q06", "Q10", "Q14", "Q15", "Q16", "Q17", "Q18",
      "E03", "E05", "E18",
      "T05", "T10", "T13", "T14", "T18", "T20",
      "Q21", "E21", "T21",
    ],
  },
  {
    // QET M05: Finanzen
    key: "finance",
    name: { de: "Finanzen", en: "Finance", ro: "Finanțe", tr: "Finans" },
    criteriaIds: ["Q01", "Q08", "Q14", "Q19", "E04", "E08", "T04", "T05", "T07", "T10", "T14", "T19", "Q21", "E21", "T21"],
  },
  {
    // QET M07: Unternehmensimage
    key: "corporate_image",
    name: { de: "Unternehmensimage", en: "Corporate Image", ro: "Imaginea companiei", tr: "Kurumsal İmaj" },
    criteriaIds: [
      "Q11", "Q13", "Q17", "Q18",
      "E02", "E17", "E20",
      "T01", "T02", "T06", "T09", "T19", "T20",
      "Q21", "E21", "T21",
    ],
  },
  {
    // QET M06: Soziokulturelle Verantwortung (CSR)
    key: "csr",
    name: { de: "CSR", en: "CSR", ro: "RSC (Responsabilitate Socială Corporativă)", tr: "KSS (Kurumsal Sosyal Sorumluluk)" },
    criteriaIds: [
      "Q14", "Q17",
      "E03", "E07", "E09", "E10", "E11", "E12", "E13", "E14", "E16", "E18", "E19", "E20",
      "T01", "T04",
      "Q21", "E21", "T21",
    ],
  },
];
