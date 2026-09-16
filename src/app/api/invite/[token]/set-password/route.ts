import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

const schema = z.object({ password: z.string().min(8).max(200) });

// POST: ergänzt den bestehenden persönlichen Link um ein optionales Passwort
// ("Beides anbieten" – Link bleibt weiter gültig, zusätzlich künftig Login
// per E-Mail+Passwort möglich unter /login). Setzt bei Erfolg direkt eine
// Employee-Session, damit die Person ohne erneutes Einloggen im
// persönlichen Dashboard landet.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const invitee = await prisma.invitee.findUnique({ where: { inviteToken: params.token } });
  if (!invitee) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!invitee.email) {
    return NextResponse.json({ error: "no_email_on_file" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.invitee.update({ where: { id: invitee.id }, data: { passwordHash } });

  if (invitee.isOwner) {
    await createSession({ role: "owner", companyId: invitee.companyId });
  } else {
    await createSession({ role: "employee", inviteeId: invitee.id, companyId: invitee.companyId });
  }

  return NextResponse.json({ ok: true });
}
