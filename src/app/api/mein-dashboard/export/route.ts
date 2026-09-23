import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnySelfServiceSession } from "@/lib/session";
import { scopeFromId } from "@/lib/content/types";
import { labelForScope } from "@/lib/content/scopes";
import type { Locale } from "@/lib/content/types";

/**
 * CSV-Export der Team-Ergebnisse für den Konto-Inhaber ("owner") – eine
 * Zeile je eingeladener Person mit ihrem jeweils neuesten Testlauf, damit
 * die Kultur-Daten in externe Reporting-Tools (Excel o. Ä.) übernommen
 * werden können. Rein lesend, keine neuen Tabellen nötig. Nur für den
 * Konto-Inhaber zugänglich – Mitarbeitende sehen im Self-Service-Dashboard
 * ohnehin nur ihre eigenen Daten, nie die anderer Personen (siehe
 * requireAnySelfServiceSession/SessionPayload in src/lib/session.ts).
 */
function csvEscape(value: string): string {
  if (/["\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const HEADER: Record<Locale, string[]> = {
  de: ["Name", "E-Mail", "Abteilung", "Rolle", "Status", "Testart", "Ergebnis (%)", "Datum"],
  en: ["Name", "Email", "Department", "Role", "Status", "Test type", "Result (%)", "Date"],
  tr: ["Ad", "E-posta", "Departman", "Rol", "Durum", "Test türü", "Sonuç (%)", "Tarih"],
  ro: ["Nume", "E-mail", "Departament", "Rol", "Stare", "Tip test", "Rezultat (%)", "Data"],
};

export async function GET(req: Request) {
  const session = await requireAnySelfServiceSession();
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const localeParam = url.searchParams.get("locale");
  const locale: Locale = localeParam === "en" || localeParam === "tr" || localeParam === "ro" ? localeParam : "de";

  const company = await prisma.company.findUnique({
    where: { id: session.companyId },
    include: {
      invitees: {
        where: { isOwner: false },
        orderBy: { createdAt: "asc" },
        include: { submissions: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
  });
  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const rows = company.invitees.map((inv) => {
    const latest = inv.submissions[0] ?? null;
    const scope = latest ? scopeFromId(latest.testScope) ?? { kind: "full" as const } : null;
    const value = latest && scope ? (scope.kind === "full" ? latest.qetIndex : latest.scopeIndex) : null;
    return [
      inv.name ?? "",
      inv.email ?? "",
      inv.department ?? "",
      inv.role,
      inv.status,
      latest && scope ? labelForScope(scope, locale) : "",
      value != null ? String(Math.round(value)) : "",
      latest ? latest.createdAt.toISOString().slice(0, 10) : "",
    ];
  });

  const csv = [HEADER[locale], ...rows].map((cols) => cols.map((c) => csvEscape(c)).join(";")).join("\r\n");

  // UTF-8-BOM voranstellen, damit Excel (insbesondere unter Windows) Umlaute
  // korrekt erkennt, ohne dass die Datei manuell als UTF-8 importiert werden muss.
  const body = "﻿" + csv;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="qet-team-ergebnisse.csv"',
    },
  });
}

