import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminGuard";
import { encryptSecret } from "@/lib/crypto";

// GET: Firmendetails inkl. aller Einreichungen (nur Admin) – Basis für das
// Admin-Dashboard je Firma.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: { submissions: { orderBy: { createdAt: "desc" } } },
  });

  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { sapClientSecretEnc, sapExportWebhookSecretEnc, sapSsoClientSecretEnc, ...safeCompany } = company;
  void sapClientSecretEnc;
  void sapExportWebhookSecretEnc;
  void sapSsoClientSecretEnc;

  return NextResponse.json({ company: safeCompany });
}

// PATCH: Firma umbenennen/aktivieren sowie SAP-Einstellungen setzen.
// Secret-Felder (Client-Secrets) werden nur überschrieben, wenn ein neuer,
// nicht-leerer Wert mitgeschickt wird – so muss man beim Bearbeiten anderer
// Felder das Secret nicht jedes Mal neu eingeben, und es wird nie im
// Klartext zurückgegeben.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (typeof body.name === "string" && body.name.trim().length >= 2) data.name = body.name.trim();
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  // --- SAP-Mitarbeiterimport ---
  if (typeof body.sapEnabled === "boolean") data.sapEnabled = body.sapEnabled;
  if (typeof body.sapSystemType === "string") data.sapSystemType = body.sapSystemType;
  if (typeof body.sapTenantUrl === "string") data.sapTenantUrl = body.sapTenantUrl.trim();
  if (typeof body.sapAuthMode === "string") data.sapAuthMode = body.sapAuthMode;
  if (typeof body.sapClientId === "string") data.sapClientId = body.sapClientId.trim();
  if (typeof body.sapClientSecret === "string" && body.sapClientSecret.trim()) {
    data.sapClientSecretEnc = encryptSecret(body.sapClientSecret.trim());
  }
  if (typeof body.sapCompanyId === "string") data.sapCompanyId = body.sapCompanyId.trim();

  // --- SAP-Ergebnis-Export ---
  if (typeof body.sapExportEnabled === "boolean") data.sapExportEnabled = body.sapExportEnabled;
  if (typeof body.sapExportWebhookUrl === "string") data.sapExportWebhookUrl = body.sapExportWebhookUrl.trim();
  if (typeof body.sapExportWebhookSecret === "string" && body.sapExportWebhookSecret.trim()) {
    data.sapExportWebhookSecretEnc = encryptSecret(body.sapExportWebhookSecret.trim());
  }

  // --- SAP-SSO ---
  if (typeof body.sapSsoEnabled === "boolean") data.sapSsoEnabled = body.sapSsoEnabled;
  if (typeof body.sapSsoIssuerUrl === "string") data.sapSsoIssuerUrl = body.sapSsoIssuerUrl.trim();
  if (typeof body.sapSsoClientId === "string") data.sapSsoClientId = body.sapSsoClientId.trim();
  if (typeof body.sapSsoClientSecret === "string" && body.sapSsoClientSecret.trim()) {
    data.sapSsoClientSecretEnc = encryptSecret(body.sapSsoClientSecret.trim());
  }

  const company = await prisma.company.update({ where: { id: params.id }, data });
  const { sapClientSecretEnc, sapExportWebhookSecretEnc, sapSsoClientSecretEnc, ...safeCompany } = company;
  void sapClientSecretEnc;
  void sapExportWebhookSecretEnc;
  void sapSsoClientSecretEnc;
  return NextResponse.json({ company: safeCompany });
}
