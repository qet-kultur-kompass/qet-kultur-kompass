-- V2.0 Phase 1: Mehrfach-Tests je Invitee erlauben.
-- Bisher erzwang eine UNIQUE-Constraint auf "inviteeId" genau eine
-- Submission pro Invitee (kein Re-Audit möglich). Wir lockern das auf
-- einen normalen Index und ergänzen ein optionales "label"-Feld für die
-- künftige Zeitachsen-Ansicht (z.B. "Erstaudit", "Re-Audit #2").

DROP INDEX "Submission_inviteeId_key";

CREATE INDEX "Submission_inviteeId_idx" ON "Submission"("inviteeId");

ALTER TABLE "Submission" ADD COLUMN "label" TEXT;
