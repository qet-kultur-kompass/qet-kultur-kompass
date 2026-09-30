// Gemeinsame Typen für die SAP-Integration. Bewusst schlank gehalten und
// unabhängig vom konkreten SAP-Produkt (SuccessFactors, S/4HANA, ...), damit
// sich bei Bedarf weitere Adapter ergänzen lassen, ohne den Rest der App
// anzufassen.

export interface SapConnectionConfig {
  systemType: "successfactors" | "s4hana";
  tenantUrl: string;
  authMode: "oauth2_client_credentials" | "basic_auth";
  clientId: string;
  clientSecret: string; // entschlüsselt, nur zur Laufzeit im Speicher
  companyId?: string | null;
}

export interface SapEmployee {
  externalId: string;
  name: string | null;
  email: string | null;
  department: string | null;
}

export class SapIntegrationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "SapIntegrationError";
  }
}
