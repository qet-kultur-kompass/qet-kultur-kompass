-- Persönliche Strategie/Zielsetzung: eine kurze strategische Ausrichtung
-- (Freitext) je Person sowie beliebig viele einzelne Ziele mit optionalem
-- Zieltermin (für die Terminübersicht/den Kalender und das 1-Seiten-PDF-
-- Handout) und optionalem Bezug zu einer QET-Säule. Rein privat, wie
-- CriterionNote nie Teil der Firmen-Aggregation.

-- AlterTable
ALTER TABLE "Invitee" ADD COLUMN "strategyIntro" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "pillar" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Goal_inviteeId_idx" ON "Goal"("inviteeId");

-- CreateIndex
CREATE INDEX "Goal_inviteeId_dueDate_idx" ON "Goal"("inviteeId", "dueDate");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "Invitee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
