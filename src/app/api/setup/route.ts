import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Einmaliger Setup-Endpunkt: legt den ersten Admin-Zugang an, OHNE dass
 * dafür ein Terminal/lokales `npm run seed` nötig ist – praktisch für ein
 * reines Web-Deployment (z.B. von unterwegs über Vercel + Supabase, ohne
 * eigenen Rechner). Einfach nach dem Deployment einmal im Browser aufrufen:
 *
 *   https://<ihre-domain>/api/setup?secret=<SETUP_SECRET>
 *
 * Sicherheitsdesign:
 * - Ohne den in SETUP_SECRET hinterlegten Wert (Env-Variable) passiert nichts.
 * - Ist SETUP_SECRET nicht gesetzt, ist der Endpunkt komplett deaktiviert.
 * - Idempotent: existiert der Admin-Account (SEED_ADMIN_EMAIL) schon, wird
 *   nichts verändert – der Aufruf kann also gefahrlos mehrfach erfolgen.
 * - Denkt daran, SETUP_SECRET nach einmaliger Nutzung nicht öffentlich zu
 *   teilen; ein Entfernen/Ändern der Env-Variable danach ist optional, da
 *   der Endpunkt ohnehin nur beim allerersten Aufruf etwas anlegt.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (!process.env.SETUP_SECRET || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    return NextResponse.json(
      { error: "missing_env", hint: "SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD nicht gesetzt." },
      { status: 500 }
    );
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ status: "already_exists", email });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({ data: { email, passwordHash, name: "Admin" } });

  return NextResponse.json({ status: "created", email, next: "/admin/login" });
}
