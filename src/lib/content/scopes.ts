import { CRITERIA, PILLARS } from "./criteria";
import { MANAGEMENT_FIELDS } from "./managementFields";
import type { Criterion, Locale, LocalizedText, TestScope } from "./types";
import { resolveText, scopeToId } from "./types";

/** Alle 60 Kriterien-IDs, die zu einem Test-Scope gehören. */
export function criteriaForScope(scope: TestScope): Criterion[] {
  if (scope.kind === "full") return CRITERIA;
  if (scope.kind === "pillar") return CRITERIA.filter((c) => c.pillar === scope.pillar);
  const field = MANAGEMENT_FIELDS.find((f) => f.key === scope.fieldKey);
  if (!field) return [];
  const idSet = new Set(field.criteriaIds);
  // Reihenfolge wie in CRITERIA (Q→E→T), nicht wie im Feld-Array, für
  // konsistente Anzeige unabhängig von der Eingabereihenfolge im Mapping.
  return CRITERIA.filter((c) => idSet.has(c.id));
}

export function labelForScope(scope: TestScope, locale: Locale): string {
  if (scope.kind === "full") {
    return resolveText(
      { de: "QET-Gesamttest", en: "Full QET Test", ro: "Testul general QET", tr: "QET Genel Testi" },
      locale
    );
  }
  if (scope.kind === "pillar") {
    const pillar = PILLARS.find((p) => p.key === scope.pillar);
    return pillar ? resolveText(pillar.name, locale) : scope.pillar;
  }
  const field = MANAGEMENT_FIELDS.find((f) => f.key === scope.fieldKey);
  return field ? resolveText(field.name, locale) : scope.fieldKey;
}

export interface ScopeStep {
  key: string;
  label: string;
  criteria: Criterion[];
}

/** Zerlegt einen Test-Scope in Umfrage-Schritte (für den Fortschrittsbalken
 * und die schrittweise Anzeige). Der QET-Gesamttest bleibt in 3 Schritten
 * (je eine Säule, wie bisher) – ein Säulen- oder Managementfeld-Teiltest ist
 * ein einzelner Schritt mit allen zugehörigen Kriterien. */
export function stepsForScope(scope: TestScope, locale: Locale): ScopeStep[] {
  if (scope.kind === "full") {
    return PILLARS.map((p) => ({
      key: p.key,
      label: resolveText(p.name, locale),
      criteria: CRITERIA.filter((c) => c.pillar === p.key),
    }));
  }
  return [{ key: scopeToId(scope), label: labelForScope(scope, locale), criteria: criteriaForScope(scope) }];
}

export interface SelectableScope {
  id: string;
  scope: TestScope;
  name: LocalizedText;
  criteriaCount: number;
  group: "full" | "pillar" | "field";
}

/** Alle 11 wählbaren Tests (1 Gesamttest + 3 Säulen-Tests + 7
 * Managementfeld-Tests) für den Auswahlbildschirm. */
export function allSelectableScopes(): SelectableScope[] {
  const list: SelectableScope[] = [
    {
      id: "full",
      scope: { kind: "full" },
      name: { de: "QET-Gesamttest", en: "Full QET Test", ro: "Testul general QET", tr: "QET Genel Testi" },
      criteriaCount: CRITERIA.length,
      group: "full",
    },
  ];

  for (const pillar of PILLARS) {
    list.push({
      id: scopeToId({ kind: "pillar", pillar: pillar.key }),
      scope: { kind: "pillar", pillar: pillar.key },
      name: pillar.name,
      criteriaCount: CRITERIA.filter((c) => c.pillar === pillar.key).length,
      group: "pillar",
    });
  }

  for (const field of MANAGEMENT_FIELDS) {
    list.push({
      id: scopeToId({ kind: "field", fieldKey: field.key }),
      scope: { kind: "field", fieldKey: field.key },
      name: field.name,
      criteriaCount: field.criteriaIds.length,
      group: "field",
    });
  }

  return list;
}
