-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "mainReleaseId" INTEGER;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_mainReleaseId_fkey" FOREIGN KEY ("mainReleaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;
