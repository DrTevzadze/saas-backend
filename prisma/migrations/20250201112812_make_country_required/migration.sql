/*
  Warnings:

  - Made the column `country` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `industry` on table `Company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "industry" SET NOT NULL;
