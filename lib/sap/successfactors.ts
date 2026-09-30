import { getAuthHeader } from "./auth";
import type { SapConnectionConfig, SapEmployee } from "./types";
import { SapIntegrationError } from "./types";

/**
 * Lädt aktive Mitarbeitende aus SAP SuccessFactors Employee Central über die
 * standardisierte OData-API (`/odata/v2/User`). Das ist der gängigste
 * Datensatz für "wer arbeitet hier" in SuccessFactors-Systemen.
 *
 * Referenz: SAP SuccessFactors OData API, Entity "User"
 * (https://api.sap.com – "SAP SuccessFactors Employee Central OData API").
 * Feldnamen können je nach Tenant-Konfiguration/Erweiterungsfeldern
 * abweichen – ungetestet gegen ein echtes System, vor Live-Betrieb gegen
 * einen SAP-Sandbox-Tenant verifizieren (siehe README).
 */
export async function fetchSuccessFactorsEmployees(
  config: SapConnectionConfig
): Promise<SapEmployee[]> {
  const authHeader = await getAuthHeader(config);

  const url = new URL("/odata/v2/User", config.tenantUrl);
  url.searchParams.set("$select", "userId,username,displayName,email,department,status");
  url.searchParams.set("$filter", "status eq 't'"); // t = aktiv/"true" in SF-Konvention
  url.searchParams.set("$format", "json");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { Authorization: authHeader, Accept: "application/json" },
    });
  } catch (err) {
    throw new SapIntegrationError(
      `SuccessFactors-API nicht erreichbar (${url.toString()}). tenantUrl und Netzwerkfreigabe prüfen.`,
      err
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new SapIntegrationError(
      `SuccessFactors-API antwortete mit Status ${res.status}. Zugangsdaten/Berechtigungen (API-Rolle "User" lesend) prüfen. ${body.slice(0, 300)}`
    );
  }

  const json = (await res.json()) as {
    d?: { results?: Array<Record<string, unknown>> };
  };
  const rows = json.d?.results ?? [];

  return rows.map((row) => ({
    externalId: String(row.userId ?? row.username ?? ""),
    name: (row.displayName as string) ?? null,
    email: (row.email as string) ?? null,
    department: (row.department as string) ?? null,
  }));
}
