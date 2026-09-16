import { createHmac, timingSafeEqual } from "crypto";

// Kompakte, signierte, zeitlich begrenzte Tokens für den SSO-Redirect-Flow
// (OIDC "state") und die Post-Login-Session eines Einladungslinks. Bewusst
// zustandslos (kein Server-Speicher nötig) – wichtig für Serverless-Deployments.

function secret(): string {
  const s = process.env.SAP_CREDENTIALS_KEY;
  if (!s) throw new Error("SAP_CREDENTIALS_KEY fehlt – wird auch für signierte SSO-Tokens benötigt.");
  return s;
}

export function signPayload(payload: Record<string, unknown>, ttlMs: number): string {
  const body = JSON.stringify({ ...payload, exp: Date.now() + ttlMs });
  const b64 = Buffer.from(body, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function verifyPayload<T = Record<string, unknown>>(token: string): T | null {
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;

  const expectedSig = createHmac("sha256", secret()).update(b64).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload as T;
  } catch {
    return null;
  }
}
