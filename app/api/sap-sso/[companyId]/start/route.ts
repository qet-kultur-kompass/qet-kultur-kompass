import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSsoConfig } from "@/lib/sap/ssoConfig";
import { buildAuthorizeUrl } from "@/lib/sap/oidc";
import { signPayload } from "@/lib/sap/signedToken";
import { SapIntegrationError } from "@/lib/sap/types";

// GET /api/sap-sso/[companyId]/start?inviteToken=...
// Startet den OIDC-Login gegen SAP Identity Authentication (IAS) für einen
// personalisierten Einladungslink und leitet zum SAP-Login weiter.
export async function GET(req: Request, { params }: { params: { companyId: string } }) {
  const { searchParams, origin } = new URL(req.url);
  const inviteToken = searchParams.get("inviteToken");
  if (!inviteToken) {
    return NextResponse.json({ error: "invite_token_missing" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: params.companyId } });
  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const config = buildSsoConfig(company);
    const state = signPayload({ inviteToken, companyId: company.id }, 10 * 60 * 1000);
    const redirectUri = `${origin}/api/sap-sso/${company.id}/callback`;
    const authorizeUrl = await buildAuthorizeUrl(config, { state, redirectUri });
    return NextResponse.redirect(authorizeUrl);
  } catch (err) {
    const message = err instanceof SapIntegrationError ? err.message : "SAP-SSO-Start fehlgeschlagen.";
    return NextResponse.json({ error: "sap_sso_start_failed", message }, { status: 502 });
  }
}
