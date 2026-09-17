-- Persönliche Notizen/Todos je Kriterium (Checkbox "erledigt" + Freitext),
-- angehängt an die eigene Person (Invitee), nicht an eine einzelne
-- Submission, damit sie über mehrere Testläufe hinweg bestehen bleiben.
-- Rein privat, nie Teil der Firmen-Aggregation.

-- CreateTable
CREATE TABLE "CriterionNote" (
    "id" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CriterionNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CriterionNote_inviteeId_idx" ON "CriterionNote"("inviteeId");

-- CreateIndex
CREATE UNIQUE INDEX "CriterionNote_inviteeId_criterionId_key" ON "CriterionNote"("inviteeId", "criterionId");

-- AddForeignKey
ALTER TABLE "CriterionNote" ADD CONSTRAINT "CriterionNote_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "Invitee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
