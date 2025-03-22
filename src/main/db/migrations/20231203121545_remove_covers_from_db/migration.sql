/*
  Warnings:

  - You are about to drop the column `cover` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `cover` on the `Release` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "cover";

-- AlterTable
ALTER TABLE "Release" DROP COLUMN "cover";
