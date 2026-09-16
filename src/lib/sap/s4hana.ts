import { getAuthHeader } from "./auth";
import type { SapConnectionConfig, SapEmployee } from "./types";
import { SapIntegrationError } from "./types";

/**
 * Lädt Mitarbeitende aus einem SAP S/4HANA-System über eine OData-Schnittstelle.
 *
 * S/4HANA hat – anders als SuccessFactors – keinen einzelnen Standard-Endpunkt
 * für "alle Mitarbeitende"; Kunden binden hier üblicherweise einen
 * kundenspezifischen OData-Service (häufig aus HCM/HR-Modulen oder einem
 * Custom-CDS-View) an ein API-Gateway an. Diese Funktion ruft deshalb bewusst
 * einen konfigurierbaren Pfad unterhalb der tenantUrl auf
 * (`/sap/opu/odata/sap/API_EMPLOYEE_SRV/Employees` als verbreitete Konvention)
 * und normalisiert das Ergebnis. Vor dem produktiven Einsatz unbedingt mit
 * dem SAP-Basis-/Integrationsteam des jeweiligen Kunden abstimmen, welcher
 * Service tatsächlich freigegeben ist.
 */
export async function fetchS4HanaEmployees(config: SapConnectionConfig): Promise<SapEmployee[]> {
  const authHeader = await getAuthHeader(config);
  const url = new URL("/sap/opu/odata/sap/API_EMPLOYEE_SRV/Employees", config.tenantUrl);
  url.searchParams.set("$format", "json");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { Authorization: authHeader, Accept: "application/json" },
    });
  } catch (err) {
    throw new SapIntegrationError(
      `S/4HANA-API nicht erreichbar (${url.toString()}). tenantUrl, API-Gateway-Freigabe und Service-Pfad mit dem SAP-Team des Kunden abstimmen.`,
      err
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new SapIntegrationError(
      `S/4HANA-API antwortete mit Status ${res.status}. Berechtigungen/Service-Freigabe prüfen. ${body.slice(0, 300)}`
    );
  }

  const json = (await res.json()) as { d?: { results?: Array<Record<string, unknown>> } };
  const rows = json.d?.results ?? [];

  return rows.map((row) => ({
    externalId: String(row.PersonnelNumber ?? row.EmployeeID ?? ""),
    name: (row.EmployeeName as string) ?? null,
    email: (row.EmailAddress as string) ?? null,
    department: (row.OrganizationalUnit as string) ?? null,
  }));
}
