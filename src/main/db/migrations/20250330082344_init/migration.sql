/*
  Warnings:

  - You are about to drop the column `disc` on the `Release` table. All the data in the column will be lost.
  - You are about to drop the column `total_discs` on the `Release` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Release" DROP COLUMN "disc",
DROP COLUMN "total_discs",
ADD COLUMN     "discTitle" VARCHAR(255);
