-- Abrechnung/Bezahlschranke für Self-Service-Konten (Stripe-Anbindung).
-- Additive Migration – bestehende Zeilen erhalten die Defaults
-- (billingProvider='free', participantLimit=3), nichts wird gelöscht.

ALTER TABLE "Company" ADD COLUMN "billingProvider" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "Company" ADD COLUMN "tier" TEXT;
ALTER TABLE "Company" ADD COLUMN "participantLimit" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "Company" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Company" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "Company" ADD COLUMN "subscriptionStatus" TEXT;
ALTER TABLE "Company" ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN "renewalReminderSentAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN "accountSetupToken" TEXT;
ALTER TABLE "Company" ADD COLUMN "accountSetupTokenExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Company_stripeCustomerId_key" ON "Company"("stripeCustomerId");
CREATE UNIQUE INDEX "Company_stripeSubscriptionId_key" ON "Company"("stripeSubscriptionId");
CREATE UNIQUE INDEX "Company_accountSetupToken_key" ON "Company"("accountSetupToken");
