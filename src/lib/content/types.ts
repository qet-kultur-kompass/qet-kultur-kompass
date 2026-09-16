export type Locale = "de" | "en" | "tr";

export type LocalizedText = Record<Locale, string>;

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
