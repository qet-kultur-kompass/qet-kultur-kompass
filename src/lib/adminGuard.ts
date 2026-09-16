import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireOwnerSession } from "@/lib/session";

/** Liefert die Admin-Session oder null. Für API-Routen, die nur Ralph/das
 * QET-Team sehen darf (Firmenliste, Dashboards, Firma anlegen). */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

/** Für Routen, die entweder der Admin (Ralph) ODER die selbst registrierte
 * Kontoinhaberin/der Kontoinhaber (Führungskraft/Auditor/Einzelkunde) der
 * jeweiligen Firma aufrufen darf – z.B. "Person einladen". Gibt zurück,
 * welche der beiden Rollen zutraf (für Logging/Unterscheidung), oder null. */
export async function requireAdminOrOwnerSession(companyId: string) {
  const admin = await requireAdminSession();
  if (admin) return { via: "admin" as const };
  const owner = await requireOwnerSession(companyId);
  if (owner) return { via: "owner" as const, company: owner };
  return null;
}
