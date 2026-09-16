-- Initiale Migration: legt alle Tabellen des QET Kultur-Kompass frisch an
-- (bisher lief noch keine Migration erfolgreich gegen die Produktions-DB).

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "surveyToken" TEXT NOT NULL,
    "dashboardToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountType" TEXT NOT NULL DEFAULT 'company',
    "ownerName" TEXT,
    "ownerEmail" TEXT,
    "ownerPasswordHash" TEXT,
    "sapEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sapSystemType" TEXT,
    "sapTenantUrl" TEXT,
    "sapAuthMode" TEXT,
    "sapClientId" TEXT,
    "sapClientSecretEnc" TEXT,
    "sapCompanyId" TEXT,
    "sapExportWebhookUrl" TEXT,
    "sapExportWebhookSecretEnc" TEXT,
    "sapExportEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sapSsoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sapSsoIssuerUrl" TEXT,
    "sapSsoClientId" TEXT,
    "sapSsoClientSecretEnc" TEXT,
    "sapLastSyncAt" TIMESTAMP(3),
    "sapLastExportAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitee" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "department" TEXT,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "inviteToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "completedAt" TIMESTAMP(3),
    "lastRemindedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordHash" TEXT,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Invitee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "inviteeId" TEXT,
    "role" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "testScope" TEXT NOT NULL DEFAULT 'full',
    "respondentName" TEXT,
    "respondentEmail" TEXT,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "ethicsScore" DOUBLE PRECISION NOT NULL,
    "transparencyScore" DOUBLE PRECISION NOT NULL,
    "qetIndex" DOUBLE PRECISION NOT NULL,
    "scopeIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "answers" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_surveyToken_key" ON "Company"("surveyToken");

-- CreateIndex
CREATE UNIQUE INDEX "Company_dashboardToken_key" ON "Company"("dashboardToken");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ownerEmail_key" ON "Company"("ownerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Invitee_inviteToken_key" ON "Invitee"("inviteToken");

-- CreateIndex
CREATE INDEX "Invitee_companyId_idx" ON "Invitee"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitee_companyId_externalId_key" ON "Invitee"("companyId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_inviteeId_key" ON "Submission"("inviteeId");

-- CreateIndex
CREATE INDEX "Submission_companyId_idx" ON "Submission"("companyId");

-- AddForeignKey
ALTER TABLE "Invitee" ADD CONSTRAINT "Invitee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "Invitee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
