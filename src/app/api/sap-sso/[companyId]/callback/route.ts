import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildSsoConfig } from "@/lib/sap/ssoConfig";
import { exchangeCodeAndVerify } from "@/lib/sap/oidc";
import { signPayload, verifyPayload } from "@/lib/sap/signedToken";
import { generateToken } from "@/lib/tokens";
import { SapIntegrationError } from "@/lib/sap/types";
import { INVITE_SESSION_COOKIE, INVITE_SESSION_TTL_MS } from "@/lib/sap/inviteSession";

// GET /api/sap-sso/[companyId]/callback?code=...&state=...
// Tauscht den Code gegen Tokens, verifiziert die Identität und setzt ein
// kurzlebiges Session-Cookie, das NUR die Teilnahme freischaltet – es wird
// bewusst nicht mit den gespeicherten Antworten verknüpft.
export async function GET(req: Request, { params }: { params: { companyId: string } }) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json({ error: "missing_code_or_state" }, { status: 400 });
  }

  const statePayload = verifyPayload<{ inviteToken: string; companyId: string }>(state);
  if (!statePayload || statePayload.companyId !== params.companyId) {
    return NextResponse.json({ error: "invalid_or_expired_state" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({ where: { id: params.companyId } });
  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const config = buildSsoConfig(company);
    const redirectUri = `${origin}/api/sap-sso/${company.id}/callback`;
    const identity = await exchangeCodeAndVerify(config, { code, redirectUri });

    // Zugehörigen Invitee-Datensatz finden: bevorzugt über die externalId
    // (SAP-User-ID, z.B. aus dem letzten SAP-Sync), sonst über die E-Mail.
    // Falls (noch) keiner existiert, z.B. weil der Sync noch nicht lief,
    // wird er hier neu angelegt – die Person hat sich ja gerade erfolgreich
    // über SAP authentifiziert.
    let invitee = await prisma.invitee.findFirst({
      where: {
        companyId: company.id,
        OR: [{ externalId: identity.sub }, ...(identity.email ? [{ email: identity.email }] : [])],
      },
    });

    if (!invitee) {
      invitee = await prisma.invitee.create({
        data: {
          companyId: company.id,
          externalId: identity.sub,
          name: identity.name,
          email: identity.email,
          role: "employee",
          inviteToken: generateToken(20),
          source: "sap_sync",
        },
      });
    }

    const sessionValue = signPayload(
      { inviteToken: invitee.inviteToken, sub: identity.sub },
      INVITE_SESSION_TTL_MS
    );

    const res = NextResponse.redirect(`${origin}/invite/${invitee.inviteToken}`);
    res.cookies.set(INVITE_SESSION_COOKIE, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: INVITE_SESSION_TTL_MS / 1000,
      path: "/",
    });
    return res;
  } catch (err) {
    const message = err instanceof SapIntegrationError ? err.message : "SAP-SSO-Login fehlgeschlagen.";
    return NextResponse.json({ error: "sap_sso_callback_failed", message }, { status: 502 });
  }
}
