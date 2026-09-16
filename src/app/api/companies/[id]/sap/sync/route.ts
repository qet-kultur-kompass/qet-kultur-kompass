import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminGuard";
import { syncEmployeesFromSap } from "@/lib/sap/sync";
import { SapIntegrationError } from "@/lib/sap/types";

// POST: stößt den Mitarbeiter-Sync aus SAP für eine Firma an (nur Admin).
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const result = await syncEmployeesFromSap(params.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof SapIntegrationError ? err.message : "Unbekannter Fehler beim SAP-Sync.";
    return NextResponse.json({ error: "sap_sync_failed", message }, { status: 502 });
  }
}
