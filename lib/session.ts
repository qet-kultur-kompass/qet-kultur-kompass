import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

// Eigene, schlanke Session-Schicht für die Self-Service-Konten (Firmen-
// Verantwortliche:r/Einzelkunde = "owner", eingeladene Person = "employee").
// Bewusst getrennt von NextAuth (src/lib/auth.ts), das ausschließlich den
// Admin-Bereich (Ralph/das QET-Team) schützt – zwei unabhängige, nicht
// verwechselbare Zugangswege. Nutzt denselben NEXTAUTH_SECRET, damit keine
// zusätzliche Umgebungsvariable in Vercel gepflegt werden muss.

const COOKIE_NAME = "qet_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 Tage – bewusst lang, "startklar & bleibt eingeloggt"

function secretKey() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET ist nicht gesetzt.");
  return new TextEncoder().encode(secret);
}

export type SessionPayload =
  | { role: "owner"; companyId: string }
  | { role: "employee"; inviteeId: string; companyId: string };

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearSession() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.role === "owner" && typeof payload.companyId === "string") {
      return { role: "owner", companyId: payload.companyId };
    }
    if (
      payload.role === "employee" &&
      typeof payload.inviteeId === "string" &&
      typeof payload.companyId === "string"
    ) {
      return { role: "employee", inviteeId: payload.inviteeId, companyId: payload.companyId };
    }
    return null;
  } catch {
    return null;
  }
}

/** Lädt die Firma des eingeloggten Konto-Inhabers (Owner-Session), oder null. */
export async function requireOwnerSession(companyId?: string) {
  const session = await readSession();
  if (!session || session.role !== "owner") return null;
  if (companyId && session.companyId !== companyId) return null;
  const company = await prisma.company.findUnique({ where: { id: session.companyId } });
  if (!company) return null;
  return company;
}

/** Lädt den eingeloggten eingeladenen Mitarbeiter (Employee-Session), oder null. */
export async function requireEmployeeSession() {
  const session = await readSession();
  if (!session || session.role !== "employee") return null;
  const invitee = await prisma.invitee.findUnique({
    where: { id: session.inviteeId },
    include: { company: true },
  });
  if (!invitee) return null;
  return invitee;
}

/** Für /mein-dashboard: egal ob Owner oder Mitarbeiter eingeloggt ist. */
export async function requireAnySelfServiceSession() {
  const session = await readSession();
  if (!session) return null;
  return session;
}
