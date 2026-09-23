export type Locale = "de" | "en" | "tr" | "ro";

/**
 * Lokalisierter Text: für die Basissprachen vollständig gepflegt, für neu
 * hinzugefügte Sprachen (z.B. "ro") zunächst optional. resolveText() liefert
 * für eine fehlende Sprache automatisch einen sinnvollen Fallback-Text.
 *
 * Genau hier ist auch der vorgesehene Erweiterungspunkt für eine künftige
 * Live-Übersetzungs-API: sobald eine echte Übersetzungsanbindung (z.B. DeepL)
 * verfügbar ist, kann resolveText() so erweitert werden, dass sie bei einer
 * fehlenden Sprache statt des Fallback-Texts automatisch eine Übersetzung
 * abruft (und z.B. cacht) – der Aufruf-Vertrag an allen Stellen im Code
 * (Locale rein, string raus) bleibt dabei unverändert.
 */
export type LocalizedText = Partial<Record<Locale, string>>;

/** Bevorzugte Fallback-Reihenfolge, falls ein Text in der gewünschten
 * Sprache (noch) nicht vorliegt. */
const FALLBACK_ORDER: Locale[] = ["en", "de", "tr", "ro"];

/**
 * Löst einen LocalizedText für eine gewünschte Sprache auf. Fällt bei
 * fehlender Übersetzung auf Englisch, dann Deutsch, dann Türkisch, dann
 * Rumänisch, dann auf die erste vorhandene Sprache zurück, damit die UI nie
 * eine leere Stelle zeigt. Erweiterungspunkt für eine künftige
 * Live-Übersetzungs-API, siehe LocalizedText.
 */
export function resolveText(text: LocalizedText, locale: Locale): string {
  if (text[locale]) return text[locale] as string;
  for (const fallback of FALLBACK_ORDER) {
    if (text[fallback]) return text[fallback] as string;
  }
  for (const key of Object.keys(text) as Locale[]) {
    if (text[key]) return text[key] as string;
  }
  return "";
}

export type PillarKey = "Q" | "E" | "T";

export type Role = "employee" | "customer" | "partner";

export interface Pillar {
  key: PillarKey;
  name: LocalizedText;
}

export interface Criterion {
  id: string; // e.g. "Q01"
  pillar: PillarKey;
  name: LocalizedText;
  statements: [LocalizedText, LocalizedText, LocalizedText];
}

// answers: Kriterium-ID -> [Wert Statement 1, Wert Statement 2, Wert Statement 3] (0-100)
export type Answers = Record<string, [number, number, number]>;

/**
 * Testart/Fokus: der QET-Gesamttest (alle 60 Kriterien), ein Säulen-Test
 * (nur Q, E oder T) oder ein Managementfeld-Test (eines der 7 Felder).
 * Insgesamt also 1 Gesamttest + 3 Säulen-Tests + 7 Managementfeld-Tests =
 * 11 wählbare Tests (davon 10 fokussierte Teiltests).
 */
export type TestScope =
  | { kind: "full" }
  | { kind: "pillar"; pillar: PillarKey }
  | { kind: "field"; fieldKey: string };

/** Kompakte String-Form von TestScope zum Speichern/Übertragen, z.B.
 * "full", "pillar:Q", "field:leadership". */
export type TestScopeId = string;

export function scopeToId(scope: TestScope): TestScopeId {
  if (scope.kind === "full") return "full";
  if (scope.kind === "pillar") return `pillar:${scope.pillar}`;
  return `field:${scope.fieldKey}`;
}

export function scopeFromId(id: TestScopeId): TestScope | null {
  if (id === "full") return { kind: "full" };
  if (id.startsWith("pillar:")) {
    const pillar = id.slice("pillar:".length) as PillarKey;
    if (pillar === "Q" || pillar === "E" || pillar === "T") return { kind: "pillar", pillar };
    return null;
  }
  if (id.startsWith("field:")) {
    return { kind: "field", fieldKey: id.slice("field:".length) };
  }
  return null;
}
