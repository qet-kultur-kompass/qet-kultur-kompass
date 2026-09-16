import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminGuard";
import { exportResultsToSap } from "@/lib/sap/export";
import { SapIntegrationError } from "@/lib/sap/types";

// POST: stößt den Ergebnis-Export nach SAP für eine Firma manuell an (Admin).
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const result = await exportResultsToSap(params.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof SapIntegrationError ? err.message : "Unbekannter Fehler beim SAP-Export.";
    return NextResponse.json({ error: "sap_export_failed", message }, { status: 502 });
  }
}
