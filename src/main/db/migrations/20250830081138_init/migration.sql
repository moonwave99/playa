/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `Release` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Release_hash_key" ON "Release"("hash");
