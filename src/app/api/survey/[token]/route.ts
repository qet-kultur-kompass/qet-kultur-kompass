import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeScores, overallIndex, pickAnswers } from "@/lib/scoring";
import { criteriaForScope } from "@/lib/content/scopes";
import { scopeFromId } from "@/lib/content/types";
import type { Answers } from "@/lib/content/types";

// GET: liefert nur, was die öffentliche Umfrageseite braucht – kein Login,
// kein Zugriff auf andere Firmen oder bisherige Einreichungen.
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const company = await prisma.company.findUnique({ where: { surveyToken: params.token } });

  if (!company || !company.isActive) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ company: { name: company.name } });
}

const answersSchema = z.record(
  z.string(),
  z.tuple([z.number().min(0).max(100), z.number().min(0).max(100), z.number().min(0).max(100)])
);

const submitSchema = z.object({
  role: z.enum(["employee", "customer", "partner"]),
  language: z.enum(["de", "en", "tr"]),
  // "full" | "pillar:Q" | "pillar:E" | "pillar:T" | "field:<key>" – siehe
  // src/lib/content/scopes.ts. Fehlt das Feld (ältere Clients), wird der
  // volle Gesamttest angenommen.
  testScope: z.string().default("full"),
  respondentName: z.string().max(200).optional().nullable(),
  respondentEmail: z.string().email().max(200).optional().nullable().or(z.literal("")),
  answers: answersSchema,
});

// POST: nimmt eine ausgefüllte Umfrage entgegen, berechnet die Scores
// serverseitig (nie dem Client vertrauen) und speichert sie der Firma zugeordnet.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const company = await prisma.company.findUnique({ where: { surveyToken: params.token } });
  if (!company || !company.isActive) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
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

  // Auf die tatsächlichen Kriterien dieses Scopes reduzieren, BEVOR
  // ausgewertet und gespeichert wird. Das schützt zweifach: (1) die
  // Firmen-Aggregation liest Kriterien-Werte direkt aus den gespeicherten
  // Rohantworten – ungefragte/vorbelegte Kriterien dürften dort nicht
  // auftauchen; (2) Säulen-/QET-Werte für einen Teiltest sollen 0 sein für
  // nicht abgefragte Säulen, nicht durch UI-Default-Werte verfälscht werden.
  const requiredIds = requiredCriteria.map((c) => c.id);
  const scopedAnswers = pickAnswers(parsed.data.answers as Answers, requiredIds);

  const { criterionScores, pillarScores, qetIndex } = computeScores(scopedAnswers);
  const scopeIndex = overallIndex(criterionScores, requiredIds);

  const submission = await prisma.submission.create({
    data: {
      companyId: company.id,
      role: parsed.data.role,
      language: parsed.data.language,
      testScope: parsed.data.testScope,
      respondentName: parsed.data.respondentName || null,
      respondentEmail: parsed.data.respondentEmail || null,
      qualityScore: pillarScores.Q,
      ethicsScore: pillarScores.E,
      transparencyScore: pillarScores.T,
      qetIndex,
      scopeIndex,
      answers: JSON.stringify(scopedAnswers),
    },
  });

  return NextResponse.json({
    submissionId: submission.id,
    criterionScores,
    pillarScores,
    qetIndex,
    scopeIndex,
  });
}
