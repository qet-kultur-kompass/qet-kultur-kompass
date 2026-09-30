import { PrismaClient } from "@prisma/client";

// Verhindert im Next.js-Dev-Modus (Hot Reload), dass bei jedem Reload eine
// neue PrismaClient-Instanz und damit eine neue DB-Verbindung entsteht.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
