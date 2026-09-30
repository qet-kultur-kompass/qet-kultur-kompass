import { decryptSecret } from "@/lib/crypto";
import type { Company } from "@prisma/client";
import { SapIntegrationError } from "./types";
import type { SapSsoConfig } from "./oidc";

export function buildSsoConfig(company: Company): SapSsoConfig {
  if (!company.sapSsoEnabled || !company.sapSsoIssuerUrl || !company.sapSsoClientId || !company.sapSsoClientSecretEnc) {
    throw new SapIntegrationError("SAP-SSO ist für diese Firma nicht (vollständig) konfiguriert.");
  }
  return {
    issuerUrl: company.sapSsoIssuerUrl,
    clientId: company.sapSsoClientId,
    clientSecret: decryptSecret(company.sapSsoClientSecretEnc),
  };
}
