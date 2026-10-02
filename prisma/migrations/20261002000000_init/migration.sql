-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContributionType" AS ENUM ('MONTHLY_RECURRING', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'PAID', 'EXEMPT', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BIT', 'PAYBOX', 'BANK_TRANSFER', 'CASH', 'CREDIT_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "ContributionReason" AS ENUM ('YAHRZEIT', 'REFUAH_SHLEIMA', 'SIMCHA', 'HODAAH', 'GENERAL_SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('INITIAL_MONTHLY', 'LATE_FOLLOWUP', 'MANUAL_NUDGE');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('EMAIL', 'WHATSAPP_LINK');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "defaultMonthlyPledge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "portalToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyCycle" (
    "id" TEXT NOT NULL,
    "hebrewMonth" INTEGER NOT NULL,
    "hebrewYear" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "roshChodeshAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "targetGoal" DECIMAL(10,2),
    "reminderDayOfMonth" INTEGER NOT NULL DEFAULT 1,
    "lateReminderDayOfMonth" INTEGER NOT NULL DEFAULT 15,
    "status" "CycleStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "cycleId" TEXT,
    "type" "ContributionType" NOT NULL,
    "reason" "ContributionReason" NOT NULL DEFAULT 'GENERAL_SUPPORT',
    "reasonOther" TEXT,
    "dedicationNote" TEXT,
    "pledgedAmount" DECIMAL(10,2) NOT NULL,
    "actualAmount" DECIMAL(10,2),
    "paymentMethod" "PaymentMethod",
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderNotification" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "channel" "Channel" NOT NULL,
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReminderNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CronRunLog" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "step" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT false,
    "detail" TEXT,

    CONSTRAINT "CronRunLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_phone_key" ON "Member"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Member_portalToken_key" ON "Member"("portalToken");

-- CreateIndex
CREATE INDEX "Member_isActive_idx" ON "Member"("isActive");

-- CreateIndex
CREATE INDEX "MonthlyCycle_status_startsAt_idx" ON "MonthlyCycle"("status", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyCycle_hebrewYear_hebrewMonth_key" ON "MonthlyCycle"("hebrewYear", "hebrewMonth");

-- CreateIndex
CREATE INDEX "Contribution_cycleId_status_idx" ON "Contribution"("cycleId", "status");

-- CreateIndex
CREATE INDEX "Contribution_memberId_idx" ON "Contribution"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_memberId_cycleId_type_key" ON "Contribution"("memberId", "cycleId", "type");

-- CreateIndex
CREATE INDEX "ReminderNotification_deliveryStatus_idx" ON "ReminderNotification"("deliveryStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ReminderNotification_memberId_cycleId_type_key" ON "ReminderNotification"("memberId", "cycleId", "type");

-- CreateIndex
CREATE INDEX "CronRunLog_step_startedAt_idx" ON "CronRunLog"("step", "startedAt");

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "MonthlyCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderNotification" ADD CONSTRAINT "ReminderNotification_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderNotification" ADD CONSTRAINT "ReminderNotification_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "MonthlyCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
