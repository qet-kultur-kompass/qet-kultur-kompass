// Legt beim ersten Start einen Admin-Zugang an (aus SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env).
// Aufruf: npm run seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "SEED_ADMIN_EMAIL und SEED_ADMIN_PASSWORD müssen in .env gesetzt sein, bevor der Seed läuft."
    );
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin-Account für ${email} existiert bereits – nichts zu tun.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: { email, passwordHash, name: "Admin" },
  });

  console.log(`Admin-Account für ${email} angelegt. Login unter /admin/login.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
