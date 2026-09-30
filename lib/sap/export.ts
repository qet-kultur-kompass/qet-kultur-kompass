import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { aggregateSubmissions } from "@/lib/scoring";
import { SapIntegrationError } from "./types";
import type { Company } from "@prisma/client";

/**
 * Exportiert die aktuelle QET-Auswertung einer Firma an eine von ihr
 * hinterlegte Ziel-URL (typischerweise eine SAP Integration Suite/BTP-
 * Middleware, die den Wert dann in SuccessFactors, S/4HANA oder SAP
 * Analytics Cloud einsortiert). Es gibt keinen universellen SAP-Endpunkt für
 * "beliebige externe KPIs" – deshalb ist dies bewusst ein generischer,
 * signierter Webhook-Push statt eines fest verdrahteten SAP-API-Aufrufs.
 * Das SAP-Integrationsteam des jeweiligen Kunden bildet den Payload dann auf
 * das gewünschte Zielsystem ab.
 *
 * Signatur: HMAC-SHA256 über den rohen JSON-Body mit dem pro Firma
 * hinterlegten Export-Secret, im Header `X-QET-Signature: sha256=<hex>` –
 * damit die Empfänger-Middleware verifizieren kann, dass der Aufruf
 * tatsächlich von diesem QET-Kultur-Kompass stammt.
 */
export async function exportResultsToSap(companyId: string): Promise<{ status: number }> {
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
    include: { submissions: true },
  });

  assertExportConfigured(company);

  const aggregate = aggregateSubmissions(company.submissions);
  const payload = {
    companyId: company.id,
    companyName: company.name,
    generatedAt: new Date().toISOString(),
    responseCount: aggregate.count,
    qetIndex: aggregate.qetIndex,
    pillarScores: aggregate.pillarScores,
    criterionScores: aggregate.criterionScores,
    byRole: aggregate.byRole,
  };

  const body = JSON.stringify(payload);
  const secret = decryptSecret(company.sapExportWebhookSecretEnc!);
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  let res: Response;
  try {
    res = await fetch(company.sapExportWebhookUrl!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-QET-Signature": `sha256=${signature}`,
      },
      body,
    });
  } catch (err) {
    throw new SapIntegrationError(
      `Export-Ziel-URL nicht erreichbar (${company.sapExportWebhookUrl}). URL und Netzwerkfreigabe der SAP-Middleware prüfen.`,
      err
    );
  }

  if (!res.ok) {
    throw new SapIntegrationError(`Export fehlgeschlagen – Ziel antwortete mit Status ${res.status}.`);
  }

  await prisma.company.update({ where: { id: companyId }, data: { sapLastExportAt: new Date() } });

  return { status: res.status };
}

function assertExportConfigured(
  company: Company
): asserts company is Company & { sapExportWebhookUrl: string; sapExportWebhookSecretEnc: string } {
  if (!company.sapExportEnabled || !company.sapExportWebhookUrl || !company.sapExportWebhookSecretEnc) {
    throw new SapIntegrationError(
      "SAP-Ergebnis-Export ist für diese Firma nicht (vollständig) konfiguriert. Bitte Ziel-URL und Secret hinterlegen."
    );
  }
}

/** Exportiert für alle Firmen, die den Export aktiviert haben – für den
 * geplanten/automatisierten Aufruf via Cron (siehe /api/cron/sap-export). */
export async function exportResultsForAllEnabledCompanies(): Promise<
  Array<{ companyId: string; ok: boolean; error?: string }>
> {
  const companies = await prisma.company.findMany({
    where: { sapExportEnabled: true, isActive: true },
    select: { id: true },
  });

  const results: Array<{ companyId: string; ok: boolean; error?: string }> = [];
  for (const c of companies) {
    try {
      await exportResultsToSap(c.id);
      results.push({ companyId: c.id, ok: true });
    } catch (err) {
      results.push({
        companyId: c.id,
        ok: false,
        error: err instanceof SapIntegrationError ? err.message : "Unbekannter Fehler",
      });
    }
  }
  return results;
}
