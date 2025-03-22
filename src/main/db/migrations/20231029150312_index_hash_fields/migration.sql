/*
  Warnings:

  - You are about to alter the column `hash` on the `Artist` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(16)`.
  - You are about to alter the column `hash` on the `Release` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(16)`.
  - A unique constraint covering the columns `[hash]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `Release` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Artist" ALTER COLUMN "hash" SET DATA TYPE VARCHAR(16);

-- AlterTable
ALTER TABLE "Release" ALTER COLUMN "hash" SET DATA TYPE VARCHAR(16);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_hash_key" ON "Artist"("hash");

-- CreateIndex
CREATE INDEX "Artist_hash_idx" ON "Artist" USING HASH ("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Release_hash_key" ON "Release"("hash");

-- CreateIndex
CREATE INDEX "Release_hash_idx" ON "Release" USING HASH ("hash");
