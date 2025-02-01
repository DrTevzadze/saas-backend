-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "country" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "isActivated" BOOLEAN NOT NULL DEFAULT false;
