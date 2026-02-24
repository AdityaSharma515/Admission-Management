/*
  Warnings:

  - Made the column `bloodGroup` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `religion` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StudentProfile" ALTER COLUMN "bloodGroup" SET NOT NULL,
ALTER COLUMN "religion" SET NOT NULL;
