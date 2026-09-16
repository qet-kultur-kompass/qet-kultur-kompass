import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeScores, overallIndex, pickAnswers } from "@/lib/scoring";
import { criteriaForScope } from "@/lib/content/scopes";
import { scopeFromId } from "@/lib/content/types";
import type { Answers } from "@/lib/content/types";
import { INVITE_SESSION_COOKIE, isInviteSessionValid } from "@/lib/sap/inviteSession";

// GET: liefert, was die personalisierte Einladungsseite braucht – inkl.
// Hinweis, ob vorher ein SAP-Login nötig ist.
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const invitee = await prisma.invitee.findUnique({
    where: { inviteToken: params.token },
    include: { company: true },
  });

  if (!invitee || !invitee.company.isActive) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    companyName: invitee.company.name,
    role: invitee.role,
    alreadyCompleted: invitee.status === "completed",
    requiresSso: invitee.company.sapSsoEnabled,
    ssoStartPath: invitee.company.sapSsoEnabled
      ? `/api/sap-sso/${invitee.company.id}/start?inviteToken=${params.token}`
      : null,
  });
}

const answersSchema = z.record(
  z.string(),
  z.tuple([z.number().min(0).max(100), z.number().min(0).max(100), z.number().min(0).max(100)])
);

const submitSchema = z.object({
  language: z.enum(["de", "en", "tr"]),
  // "full" | "pillar:Q" | "pillar:E" | "pillar:T" | "field:<key>" – siehe
  // src/lib/content/scopes.ts. Fehlt das Feld (ältere Clients), wird der
  // volle Gesamttest angenommen.
  testScope: z.string().default("full"),
  answers: answersSchema,
});

// POST: nimmt die ausgefüllte, personalisierte Umfrage entgegen.
// WICHTIG (Datenschutz-Design): Die Submission wird ausschließlich intern
// (inviteeId) mit dem Invitee-Datensatz verknüpft – EINZIG damit die
// einreichende Person ihr eigenes Ergebnis später im persönlichen
// Dashboard (/mein-dashboard) wiederfinden kann. Diese Verknüpfung wird
// nirgends an Dritte (Firmen-/Admin-Dashboard, Aggregation) ausgespielt –
// dort werden ausschließlich Summenwerte über alle Submissions gebildet,
// nie einzelne Antworten zusammen mit einem Namen gezeigt. SAP-SSO
// bestätigt weiterhin nur die Teilnahmeberechtigung.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const invitee = await prisma.invitee.findUnique({
    where: { inviteToken: params.token },
    include: { company: true },
  });

  if (!invitee || !invitee.company.isActive) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Schutz vor Doppel-Einreichung (z.B. zwei geöffnete Tabs): seit der
  // 1:1-Verknüpfung Submission<->Invitee (für die "Mein Ergebnis"-Ansicht)
  // würde ein zweiter Insert sonst an der Unique-Constraint scheitern.
  if (invitee.status === "completed") {
    return NextResponse.json({ error: "already_completed" }, { status: 409 });
  }

  if (invitee.company.sapSsoEnabled) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${INVITE_SESSION_COOKIE}=`));
    const cookieValue = match?.split("=")[1];
    if (!isInviteSessionValid(cookieValue, params.token)) {
      return NextResponse.json({ error: "sso_required" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const scope = scopeFromId(parsed.data.testScope);
  if (!scope) {
    return NextResponse.json({ error: "invalid_scope" }, { status: 400 });
  }
  const requiredCriteria = criteriaForScope(scope);
  if (requiredCriteria.length === 0) {
    return NextResponse.json({ error: "invalid_scope" }, { status: 400 });
  }

  const missing = requiredCriteria.filter((c) => !parsed.data.answers[c.id]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "incomplete", missing: missing.map((c) => c.id) },
      { status: 400 }
    );
  }

  // Siehe Kommentar in src/app/api/survey/[token]/route.ts: auf die
  // tatsächlichen Kriterien dieses Scopes reduzieren, bevor ausgewertet und
  // gespeichert wird – schützt Aggregation und Säulen-/QET-Werte vor
  // Verfälschung durch nicht abgefragte, vorbelegte Kriterien.
  const requiredIds = requiredCriteria.map((c) => c.id);
  const scopedAnswers = pickAnswers(parsed.data.answers as Answers, requiredIds);

  const { criterionScores, pillarScores, qetIndex } = computeScores(scopedAnswers);
  const scopeIndex = overallIndex(criterionScores, requiredIds);

  await prisma.submission.create({
    data: {
      companyId: invitee.companyId,
      inviteeId: invitee.id,
      role: invitee.role,
      language: parsed.data.language,
      testScope: parsed.data.testScope,
      // Bewusst KEIN respondentName/-Email aus dem Invitee übernommen – siehe
      // Kommentar oben zum Anonymitäts-Design.
      qualityScore: pillarScores.Q,
      ethicsScore: pillarScores.E,
      transparencyScore: pillarScores.T,
      qetIndex,
      scopeIndex,
      answers: JSON.stringify(scopedAnswers),
    },
  });

  await prisma.invitee.update({
    where: { id: invitee.id },
    data: { status: "completed", completedAt: new Date() },
  });

  return NextResponse.json({ criterionScores, pillarScores, qetIndex, scopeIndex });
}
