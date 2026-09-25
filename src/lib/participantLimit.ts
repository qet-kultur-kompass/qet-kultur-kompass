import { prisma } from "@/lib/prisma";

// Prüft, ob eine Firma noch einen weiteren Teilnehmer (Invitee) anlegen darf.
// company.participantLimit === null/undefined => unbegrenzt (z.B. von Ralph
// manuell angelegte Firmen ohne Digistore24-Kauf, SAP-Großkunden mit
// Sondervertrag). Wird gesetzt, sobald ein Digistore24-Kauf verarbeitet
// wurde (siehe src/lib/digistore24.ts + src/app/api/webhooks/digistore24).
export async function canAddParticipant(
    companyId: string
  ): Promise<{ allowed: boolean; used: number; limit: number | null }> {
   const company = await prisma.company.findUnique({
          where: { id: companyId },
          select: { participantLimit: true, _count: { select: { invitees: true } } },
    });
    if (!company) return { allowed: false, used: 0, limit: null };
  
    const used = company._count.invitees;
    const limit = company.participantLimit;
    if (limit === null || limit === undefined) return { allowed: true, used, limit: null };
    return { allowed: used < limit, used, limit };
}
