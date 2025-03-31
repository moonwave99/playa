/*
  Warnings:

  - A unique constraint covering the columns `[coverReleaseId]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "coverReleaseId" INTEGER;

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "coverReleaseId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Artist_coverReleaseId_key" ON "Artist"("coverReleaseId");

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_coverReleaseId_fkey" FOREIGN KEY ("coverReleaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_coverReleaseId_fkey" FOREIGN KEY ("coverReleaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;
