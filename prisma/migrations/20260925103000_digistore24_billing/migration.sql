-- Lizenz/Abrechnung über Digistore24: begrenzt die Teilnehmerzahl je Firma
-- gemäß gekaufter Preisstufe, und protokolliert eingehende Zahlungs-Webhooks
-- (Idempotenz + Fehlersuche). Siehe src/lib/digistore24.ts,
-- src/lib/participantLimit.ts, src/app/api/webhooks/digistore24/route.ts.

-- AlterTable
ALTER TABLE "Company" ADD COLUMN "participantLimit" INTEGER;
ALTER TABLE "Company" ADD COLUMN "billingSource" TEXT;
ALTER TABLE "Company" ADD COLUMN "digistore24OrderId" TEXT;
ALTER TABLE "Company" ADD COLUMN "planLabel" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_digistore24OrderId_key" ON "Company"("digistore24OrderId");

-- CreateTable
CREATE TABLE "WebhookEvent" (
      "id" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "eventType" TEXT NOT NULL,
      "externalId" TEXT,
      "payloadJson" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'received',
      "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
  );

-- CreateIndex
CREATE INDEX "WebhookEvent_provider_eventType_idx" ON "WebhookEvent"("provider", "eventType");

-- CreateIndex
CREATE INDEX "WebhookEvent_externalId_idx" ON "WebhookEvent"("externalId");
