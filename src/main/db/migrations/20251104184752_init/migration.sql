/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `Release` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Release_path_key" ON "Release"("path");
