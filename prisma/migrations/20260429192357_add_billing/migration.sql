-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "billingEmail" TEXT,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);
