import { NextResponse } from "next/server";
import { exportResultsForAllEnabledCompanies } from "@/lib/sap/export";

// POST: für einen geplanten Aufruf (z.B. Vercel Cron oder GitHub Actions),
// NICHT über das Admin-Login geschützt (ein Cron-Job hat keine Browser-
// Session), sondern über ein geteiltes Secret im Header. Exportiert für alle
// Firmen mit aktiviertem SAP-Export. Siehe README für Einrichtung.
export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await exportResultsForAllEnabledCompanies();
  return NextResponse.json({ results });
}
