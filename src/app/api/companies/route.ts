import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/tokens";
import { requireAdminSession } from "@/lib/adminGuard";

const createSchema = z.object({
  name: z.string().min(2).max(200),
  contactName: z.string().max(200).optional().nullable(),
  contactEmail: z.string().email().max(200).optional().nullable().or(z.literal("")),
});

// GET: Firmenliste inkl. Anzahl Einreichungen (nur für eingeloggten Admin)
export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });

  return NextResponse.json({ companies });
}

// POST: neue Firma anlegen -> erzeugt Umfrage- und Dashboard-Link
export async function POST(req: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      name: parsed.data.name.trim(),
      contactName: parsed.data.contactName || null,
      contactEmail: parsed.data.contactEmail || null,
      surveyToken: generateToken(20),
      dashboardToken: generateToken(20),
    },
  });

  return NextResponse.json({ company }, { status: 201 });
}
