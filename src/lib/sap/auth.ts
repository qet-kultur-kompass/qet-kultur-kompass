import type { SapConnectionConfig } from "./types";
import { SapIntegrationError } from "./types";

/**
 * Liefert den Authorization-Header-Wert für Aufrufe an das SAP-System.
 *
 * - "basic_auth": klassischer API-User (in vielen SuccessFactors-Instanzen
 *   noch der einfachste Weg) – clientId/clientSecret sind dabei
 *   Benutzername/Passwort des API-Users.
 * - "oauth2_client_credentials": moderner, empfohlener Weg (SAP BTP/OAuth2
 *   Client). Holt bei jedem Aufruf ein frisches Token (kein Caching über
 *   Requests hinweg, damit dieser Server-losen Deployments – z.B. Vercel –
 *   keine Probleme macht).
 *
 * WICHTIG: Der genaue Token-Endpunkt unterscheidet sich zwischen SAP-Systemen
 * und Mandanten-Konfiguration. Der Pfad unten folgt dem SAP-Standardmuster
 * (`/oauth/token` bzw. `/oauth2/token`) – bitte gegen die konkrete
 * SAP-API-Dokumentation des jeweiligen Kunden-Tenants prüfen, bevor dies
 * produktiv geschaltet wird (siehe README, Abschnitt SAP-Integration).
 */
export async function getAuthHeader(config: SapConnectionConfig): Promise<string> {
  if (config.authMode === "basic_auth") {
    const token = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
    return `Basic ${token}`;
  }

  // oauth2_client_credentials
  const tokenUrl = new URL("/oauth/token", config.tenantUrl).toString();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  let res: Response;
  try {
    res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    throw new SapIntegrationError(
      `SAP-Token-Endpunkt nicht erreichbar (${tokenUrl}). Bitte tenantUrl und Netzwerk-/Firewall-Freigaben prüfen.`,
      err
    );
  }

  if (!res.ok) {
    throw new SapIntegrationError(
      `SAP-OAuth2-Token konnte nicht geholt werden (Status ${res.status}). Bitte Client-ID/Secret und den Token-Endpunkt-Pfad für diesen Tenant prüfen.`
    );
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new SapIntegrationError("SAP-OAuth2-Antwort enthielt kein access_token.");
  }

  return `Bearer ${data.access_token}`;
}
