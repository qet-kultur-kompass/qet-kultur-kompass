import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { generateToken } from "@/lib/tokens";
import { fetchSuccessFactorsEmployees } from "./successfactors";
import { fetchS4HanaEmployees } from "./s4hana";
import type { SapConnectionConfig } from "./types";
import { SapIntegrationError } from "./types";
import type { Company } from "@prisma/client";

function buildConfig(company: Company): SapConnectionConfig {
  if (!company.sapEnabled || !company.sapTenantUrl || !company.sapClientId || !company.sapClientSecretEnc) {
    throw new SapIntegrationError(
      "SAP ist für diese Firma nicht (vollständig) konfiguriert. Bitte Tenant-URL, Client-ID und Client-Secret hinterlegen."
    );
  }
  if (company.sapSystemType !== "successfactors" && company.sapSystemType !== "s4hana") {
    throw new SapIntegrationError("Unbekannter SAP-Systemtyp – bitte SuccessFactors oder S/4HANA wählen.");
  }
  return {
    systemType: company.sapSystemType,
    tenantUrl: company.sapTenantUrl,
    authMode: (company.sapAuthMode as SapConnectionConfig["authMode"]) ?? "oauth2_client_credentials",
    clientId: company.sapClientId,
    clientSecret: decryptSecret(company.sapClientSecretEnc),
    companyId: company.sapCompanyId,
  };
}

/**
 * Holt die Mitarbeiterliste aus dem konfigurierten SAP-System und
 * gleicht sie mit den Invitee-Datensätzen der Firma ab (Upsert über
 * companyId+externalId). Neue Mitarbeitende bekommen einen frischen
 * persönlichen Einladungslink; bestehende werden nur aktualisiert
 * (Name/E-Mail/Abteilung), ihr bisheriger Status bleibt erhalten.
 */
export async function syncEmployeesFromSap(companyId: string): Promise<{ imported: number; updated: number }> {
  const company = await prisma.company.findUniqueOrThrow({ where: { id: companyId } });
  const config = buildConfig(company);

  const employees =
    config.systemType === "successfactors"
      ? await fetchSuccessFactorsEmployees(config)
      : await fetchS4HanaEmployees(config);

  let imported = 0;
  let updated = 0;

  for (const emp of employees) {
    if (!emp.externalId) continue;
    const existing = await prisma.invitee.findUnique({
      where: { companyId_externalId: { companyId, externalId: emp.externalId } },
    });

    if (existing) {
      await prisma.invitee.update({
        where: { id: existing.id },
        data: { name: emp.name, email: emp.email, department: emp.department },
      });
      updated++;
    } else {
      await prisma.invitee.create({
        data: {
          companyId,
          externalId: emp.externalId,
          name: emp.name,
          email: emp.email,
          department: emp.department,
          role: "employee",
          inviteToken: generateToken(20),
          source: "sap_sync",
        },
      });
      imported++;
    }
  }

  await prisma.company.update({ where: { id: companyId }, data: { sapLastSyncAt: new Date() } });

  return { imported, updated };
}
