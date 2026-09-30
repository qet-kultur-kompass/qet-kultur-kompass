import { createRemoteJWKSet, jwtVerify } from "jose";
import { SapIntegrationError } from "./types";

export interface SapSsoConfig {
  issuerUrl: string; // z.B. https://<tenant>.accounts.ondemand.com
  clientId: string;
  clientSecret: string; // entschlüsselt
}

interface DiscoveryDocument {
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  issuer: string;
}

const discoveryCache = new Map<string, { doc: DiscoveryDocument; fetchedAt: number }>();
const DISCOVERY_TTL_MS = 10 * 60 * 1000;

/**
 * Lädt das OIDC-Discovery-Dokument des SAP Identity Authentication Service
 * (IAS) – Standard-OIDC, siehe SAP-Hilfe "Identity Authentication –
 * OpenID Connect". Wird gecacht, damit nicht bei jedem Login-Versuch erneut
 * geladen werden muss.
 */
export async function getDiscoveryDocument(issuerUrl: string): Promise<DiscoveryDocument> {
  const cached = discoveryCache.get(issuerUrl);
  if (cached && Date.now() - cached.fetchedAt < DISCOVERY_TTL_MS) return cached.doc;

  const url = new URL("/.well-known/openid-configuration", issuerUrl).toString();
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new SapIntegrationError(
      `SAP IAS Discovery-Dokument nicht erreichbar (${url}). issuerUrl prüfen.`,
      err
    );
  }
  if (!res.ok) {
    throw new SapIntegrationError(`SAP IAS Discovery-Dokument antwortete mit Status ${res.status}.`);
  }
  const doc = (await res.json()) as DiscoveryDocument;
  discoveryCache.set(issuerUrl, { doc, fetchedAt: Date.now() });
  return doc;
}

export async function buildAuthorizeUrl(
  config: SapSsoConfig,
  opts: { state: string; redirectUri: string }
): Promise<string> {
  const discovery = await getDiscoveryDocument(config.issuerUrl);
  const url = new URL(discovery.authorization_endpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", opts.state);
  return url.toString();
}

export interface SapSsoIdentity {
  sub: string;
  email: string | null;
  name: string | null;
}

/**
 * Tauscht den Authorization Code gegen Tokens und verifiziert den ID-Token
 * (Signatur über die JWKS des Tenants, Issuer- und Audience-Prüfung) –
 * Standard-OIDC-Authorization-Code-Flow. Ungetestet gegen einen echten IAS-
 * Tenant; vor Live-Betrieb mit einer SAP-IAS-Sandbox verifizieren.
 */
export async function exchangeCodeAndVerify(
  config: SapSsoConfig,
  opts: { code: string; redirectUri: string }
): Promise<SapSsoIdentity> {
  const discovery = await getDiscoveryDocument(config.issuerUrl);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  let tokenRes: Response;
  try {
    tokenRes = await fetch(discovery.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    throw new SapIntegrationError("SAP IAS Token-Endpunkt nicht erreichbar.", err);
  }

  if (!tokenRes.ok) {
    throw new SapIntegrationError(`SAP IAS Token-Austausch fehlgeschlagen (Status ${tokenRes.status}).`);
  }

  const tokens = (await tokenRes.json()) as { id_token?: string };
  if (!tokens.id_token) {
    throw new SapIntegrationError("SAP IAS Antwort enthielt keinen id_token.");
  }

  const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));
  const { payload } = await jwtVerify(tokens.id_token, jwks, {
    issuer: discovery.issuer,
    audience: config.clientId,
  });

  return {
    sub: String(payload.sub),
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
  };
}
