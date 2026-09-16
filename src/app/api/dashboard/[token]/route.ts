import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aggregateSubmissions, MIN_RESPONSES_FOR_AGGREGATE } from "@/lib/scoring";

// GET: read-only Firmen-Dashboard über den dashboardToken. Zeigt bewusst nur
// aggregierte Werte (keine einzelnen Namen/Antworten), damit die Anonymität
// der Befragten gewahrt bleibt – erst ab MIN_RESPONSES_FOR_AGGREGATE Einreichungen.
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const company = await prisma.company.findUnique({
    where: { dashboardToken: params.token },
    include: { submissions: true },
  });

  if (!company) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const count = company.submissions.length;
  const aggregate =
    count >= MIN_RESPONSES_FOR_AGGREGATE ? aggregateSubmissions(company.submissions) : null;

  return NextResponse.json({
    companyName: company.name,
    responseCount: count,
    minResponses: MIN_RESPONSES_FOR_AGGREGATE,
    aggregate,
  });
}
